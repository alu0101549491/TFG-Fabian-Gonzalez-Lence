/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/http/axios.client.ts
 * @desc HTTP client implementation using Axios with authentication, interceptors, and error handling
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://axios-http.com/docs/intro}
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * API base URL from environment variables
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Default request timeout (30 seconds)
 */
const REQUEST_TIMEOUT = 30000;

/**
 * Extended timeout for file upload operations (5 minutes)
 */
const UPLOAD_TIMEOUT = 300000;

/**
 * Maximum number of retry attempts for failed requests
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Base delay in milliseconds for retry attempts
 */
const RETRY_DELAY_MS = 1000;

/**
 * HTTP request configuration options
 */
export interface RequestConfig {
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** URL query parameters */
  params?: Record<string, unknown>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to send cookies with cross-origin requests */
  withCredentials?: boolean;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

/**
 * File upload configuration options
 */
export interface UploadConfig extends RequestConfig {
  /** Callback function to track upload progress */
  onUploadProgress?: (progress: UploadProgress) => void;
}

/**
 * File download configuration options
 */
export interface DownloadConfig extends RequestConfig {
  /** Callback function to track download progress */
  onDownloadProgress?: (progress: DownloadProgress) => void;
  /** Response data type */
  responseType?: 'blob' | 'arraybuffer';
}

/**
 * Upload progress information
 */
export interface UploadProgress {
  /** Number of bytes loaded */
  loaded: number;
  /** Total number of bytes */
  total: number;
  /** Upload percentage (0-100) */
  percentage: number;
}

/**
 * Download progress information
 */
export interface DownloadProgress {
  /** Number of bytes loaded */
  loaded: number;
  /** Total number of bytes */
  total: number;
  /** Download percentage (0-100) */
  percentage: number;
}

/**
 * Backend API response format
 *
 * @template T The type of data contained in the response
 */
interface BackendApiResponse<T> {
  /** Success flag */
  success: boolean;
  /** Response data payload */
  data?: T;
  /** Optional response message */
  message?: string;
  /** Validation errors (if any) */
  errors?: Array<{field: string; message: string}>;
}

/**
 * Generic API response wrapper (frontend format)
 *
 * @template T The type of data contained in the response
 */
export interface ApiResponse<T> {
  /** Response data payload */
  data: T;
  /** HTTP status code */
  status: number;
  /** Optional response message */
  message?: string;
}

/**
 * API error response structure
 */
export interface ApiError {
  /** HTTP status code */
  status: number;
  /** Error code identifier */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Token storage interface to be implemented by presentation layer
 */
export interface ITokenStorage {
  /**
   * Retrieve the current access token
   * @returns The access token or null if not available
   */
  getAccessToken(): string | null;

  /**
   * Retrieve the current refresh token
   * @returns The refresh token or null if not available
   */
  getRefreshToken(): string | null;

  /**
   * Store new access and refresh tokens
   * @param accessToken - The new access token
   * @param refreshToken - The new refresh token
   */
  setTokens(accessToken: string, refreshToken: string): void;

  /**
   * Clear all stored tokens
   */
  clearTokens(): void;
}

/**
 * Extended Axios request config with retry flag
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  /** Flag indicating if request has been retried */
  _retry?: boolean;
  /** Current retry attempt number */
  _retryCount?: number;
}

/**
 * Configured Axios HTTP client for API communication.
 * Provides authentication, error handling, token refresh, and file operations.
 *
 * @example
 * ```typescript
 * const client = new AxiosClient();
 * client.setTokenStorage(myTokenStorage);
 *
 * // Perform authenticated request
 * const response = await client.get<User>('/users/123');
 * console.log(response.data);
 * ```
 */
export class AxiosClient {
  /** Configured Axios instance */
  private axiosInstance: AxiosInstance;

  /** Token storage implementation */
  private tokenStorage: ITokenStorage | null = null;

  /** Flag indicating if token refresh is in progress */
  private isRefreshing = false;

  /** Queue of subscribers waiting for token refresh */
  private refreshSubscribers: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  /** Abort controller for cancelling all requests */
  private abortController: AbortController | null = null;

  /**
   * Creates a new AxiosClient instance with configured interceptors
   */
  public constructor() {
    this.axiosInstance = this.createAxiosInstance();
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Set the token storage implementation
   *
   * @param storage - Token storage implementation
   */
  public setTokenStorage(storage: ITokenStorage): void {
    this.tokenStorage = storage;
  }

  /**
   * Create and configure Axios instance with base settings
   *
   * @returns Configured Axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: false,
    });
  }

  /**
   * Setup request interceptor to inject authentication tokens
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authorization header if token exists
        const token = this.tokenStorage?.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking and debugging
        if (config.headers) {
          config.headers['X-Request-ID'] = this.generateRequestId();
          config.headers['X-Request-Time'] = new Date().toISOString();
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      },
    );
  }

  /**
   * Setup response interceptor for error handling and token refresh
   */
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Transform successful response to ApiResponse format
        return {
          data: response.data,
          status: response.status,
          message: response.data?.message,
        } as unknown as AxiosResponse;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // Handle 401 Unauthorized - attempt token refresh
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            // Wait for ongoing refresh to complete
            return new Promise((resolve, reject) => {
              this.subscribeToTokenRefresh((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.axiosInstance(originalRequest));
              }, (refreshError: unknown) => {
                reject(refreshError);
              });
            });
          }

          originalRequest._retry = true;
          return this.handleTokenRefresh(originalRequest);
        }

        // Check if request should be retried
        if (originalRequest && this.shouldRetry(error, originalRequest._retryCount || 0)) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          await delay(RETRY_DELAY_MS * originalRequest._retryCount);
          return this.axiosInstance(originalRequest);
        }

        // Transform error and reject
        return Promise.reject(this.transformError(error));
      },
    );
  }

  /**
   * Handle token refresh on 401 response
   *
   * @param originalRequest - The original failed request
   * @returns Promise resolving to the retried request response
   * @throws Error if token refresh fails
   */
  private async handleTokenRefresh(
    originalRequest: ExtendedAxiosRequestConfig,
  ): Promise<AxiosResponse> {
    this.isRefreshing = true;

    try {
      const refreshToken = this.tokenStorage?.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint without interceptors to avoid infinite loop
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      this.tokenStorage?.setTokens(accessToken, newRefreshToken);

      // Update authorization header in original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Notify all subscribers waiting for refresh
      this.onTokenRefreshed(accessToken);

      // Retry original request with new token
      return this.axiosInstance(originalRequest);
    } catch (error) {
      // Clear tokens on refresh failure
      this.tokenStorage?.clearTokens();

      // Reject all subscribers waiting for refresh
      this.onTokenRefreshFailed(error);

      // Dispatch session expired event for presentation layer
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
      }

      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
    }
  }

  /**
   * Subscribe to token refresh completion
   *
   * @param callback - Callback to invoke when token is refreshed
   */
  private subscribeToTokenRefresh(
    onSuccess: (token: string) => void,
    onFailure: (error: unknown) => void,
  ): void {
    this.refreshSubscribers.push({resolve: onSuccess, reject: onFailure});
  }

  /**
   * Notify all subscribers after successful token refresh
   *
   * @param newToken - The new access token
   */
  private onTokenRefreshed(newToken: string): void {
    this.refreshSubscribers.forEach((subscriber) => subscriber.resolve(newToken));
  }

  /**
   * Reject all subscribers after a failed token refresh.
   *
   * @param error - The error that caused token refresh to fail
   */
  private onTokenRefreshFailed(error: unknown): void {
    this.refreshSubscribers.forEach((subscriber) => subscriber.reject(error));
  }

  /**
   * Transform Axios error to standardized ApiError format
   *
   * @param error - Axios error object
   * @returns Transformed API error
   */
  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as Record<string, unknown>;
      return {
        status: error.response.status,
        code:
          (data?.code as string) ||
          this.getErrorCodeFromStatus(error.response.status),
        message:
          (data?.message as string) ||
          this.getDefaultErrorMessage(error.response.status),
        details: data?.details as Record<string, unknown>,
      };
    }

    if (error.request) {
      // Request made but no response received
      if (error.code === 'ECONNABORTED') {
        return {
          status: 408,
          code: 'TIMEOUT',
          message: 'Request timed out. Please try again.',
        };
      }
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message:
          'Unable to connect to server. Please check your internet connection.',
      };
    }

    // Request setup error
    return {
      status: 0,
      code: 'REQUEST_ERROR',
      message: error.message || 'An unexpected error occurred.',
    };
  }

  /**
   * Get error code from HTTP status
   *
   * @param status - HTTP status code
   * @returns Corresponding error code
   */
  private getErrorCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Get default error message for HTTP status
   *
   * @param status - HTTP status code
   * @returns User-friendly error message
   */
  private getDefaultErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Your session has expired. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'A conflict occurred. The resource may already exist.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please wait before trying again.',
      500: 'An internal server error occurred. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service is currently unavailable. Please try again later.',
    };
    return messages[status] || 'An unexpected error occurred.';
  }

  /**
   * Generate unique request ID for tracking
   *
   * @returns Unique request identifier
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Perform GET request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  public async get<T>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<BackendApiResponse<T>>(url, config);
    return {
      data: response.data.data as T,
      status: response.status,
      message: response.data.message,
    };
  }

  /**
   * Perform POST request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  public async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<BackendApiResponse<T>>(url, data, config);
    return {
      data: response.data.data as T,
      status: response.status,
      message: response.data.message,
    };
  }

  /**
   * Perform PUT request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  public async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<BackendApiResponse<T>>(url, data, config);
    return {
      data: response.data.data as T,
      status: response.status,
      message: response.data.message,
    };
  }

  /**
   * Perform PATCH request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  public async patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<BackendApiResponse<T>>(url, data, config);
    return {
      data: response.data.data as T,
      status: response.status,
      message: response.data.message,
    };
  }

  /**
   * Perform DELETE request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  public async delete<T>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    console.log(`[AxiosClient] DELETE ${url}`);
    const response = await this.axiosInstance.delete<BackendApiResponse<T>>(url, config);
    console.log(`[AxiosClient] DELETE response status: ${response.status}`, response.data);
    
    // Handle 204 No Content responses (empty body)
    if (response.status === 204 || !response.data) {
      console.log('[AxiosClient] Handling 204 No Content response');
      return {
        data: null as T,
        status: response.status,
        message: 'Successfully deleted',
      };
    }
    
    console.log('[AxiosClient] Returning structured response');
    return {
      data: response.data.data as T,
      status: response.status,
      message: response.data.message,
    };
  }

  /**
   * Upload single file with progress tracking
   *
   * @template T Response data type
   * @param url - Upload endpoint URL
   * @param file - File or Blob to upload
   * @param additionalData - Additional form data fields
   * @param config - Upload configuration with progress callback
   * @returns Promise resolving to API response
   *
   * @example
   * ```typescript
   * const file = document.querySelector('input[type="file"]').files[0];
   * const response = await client.uploadFile<UploadResult>(
   *   '/files/upload',
   *   file,
   *   { projectId: '123' },
   *   {
   *     onUploadProgress: (progress) => {
   *       console.log(`Upload: ${progress.percentage}%`);
   *     }
   *   }
   * );
   * ```
   */
  public async uploadFile<T>(
    url: string,
    file: File | Blob,
    additionalData?: Record<string, unknown>,
    config?: UploadConfig,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data to form
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value),
        );
      });
    }

    const response = await this.axiosInstance.post<T>(url, formData, {
      ...config,
      timeout: UPLOAD_TIMEOUT,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (config?.onUploadProgress && progressEvent.total) {
          config.onUploadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            ),
          });
        }
      },
    });

    return response as unknown as ApiResponse<T>;
  }

  /**
   * Upload multiple files with progress tracking
   *
   * @template T Response data type
   * @param url - Upload endpoint URL
   * @param files - Array of files with field names
   * @param additionalData - Additional form data fields
   * @param config - Upload configuration with progress callback
   * @returns Promise resolving to API response
   *
   * @example
   * ```typescript
   * const files = [
   *   { file: file1, fieldName: 'document1' },
   *   { file: file2, fieldName: 'document2' }
   * ];
   * const response = await client.uploadFiles('/files/batch', files);
   * ```
   */
  public async uploadFiles<T>(
    url: string,
    files: Array<{ file: File | Blob; fieldName: string }>,
    additionalData?: Record<string, unknown>,
    config?: UploadConfig,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Append all files to form data
    files.forEach(({ file, fieldName }) => {
      formData.append(fieldName, file);
    });

    // Add additional data to form
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value),
        );
      });
    }

    const response = await this.axiosInstance.post<T>(url, formData, {
      ...config,
      timeout: UPLOAD_TIMEOUT,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (config?.onUploadProgress && progressEvent.total) {
          config.onUploadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            ),
          });
        }
      },
    });

    return response as unknown as ApiResponse<T>;
  }

  /**
   * Download file with progress tracking
   *
   * @param url - Download endpoint URL
   * @param config - Download configuration with progress callback
   * @returns Promise resolving to file Blob
   *
   * @example
   * ```typescript
   * const blob = await client.downloadFile('/files/123/download', {
   *   onDownloadProgress: (progress) => {
   *     console.log(`Download: ${progress.percentage}%`);
   *   }
   * });
   *
   * // Create download link
   * const downloadUrl = URL.createObjectURL(blob);
   * const link = document.createElement('a');
   * link.href = downloadUrl;
   * link.download = 'filename.pdf';
   * link.click();
   * ```
   */
  public async downloadFile(
    url: string,
    config?: DownloadConfig,
  ): Promise<Blob> {
    const response = await this.axiosInstance.get(url, {
      ...config,
      responseType: config?.responseType || 'blob',
      onDownloadProgress: (progressEvent) => {
        if (config?.onDownloadProgress && progressEvent.total) {
          config.onDownloadProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            ),
          });
        }
      },
    });

    return response.data as Blob;
  }

  /**
   * Check if error is a network error (no response from server)
   *
   * @param error - Error object to check
   * @returns True if network error, false otherwise
   */
  public isNetworkError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }
    return !error.response && !!error.request;
  }

  /**
   * Check if error is a timeout error
   *
   * @param error - Error object to check
   * @returns True if timeout error, false otherwise
   */
  public isTimeoutError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }
    return error.code === 'ECONNABORTED';
  }

  /**
   * Check if request should be retried based on error type and attempt count
   *
   * @param error - Axios error object
   * @param attempt - Current attempt number
   * @returns True if request should be retried, false otherwise
   */
  public shouldRetry(error: AxiosError, attempt: number): boolean {
    // Don't retry if max attempts reached
    if (attempt >= MAX_RETRY_ATTEMPTS) {
      return false;
    }

    // Don't retry client errors (4xx) except 408 (timeout) and 429 (rate limit)
    if (error.response) {
      const status = error.response.status;
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        return false;
      }
    }

    // Retry on network errors, timeouts, and 5xx server errors
    return (
      !error.response || // Network error
      error.code === 'ECONNABORTED' || // Timeout
      (error.response.status >= 500 && error.response.status < 600) // Server error
    );
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = new AbortController();
    }
  }

  /**
   * Get the underlying Axios instance for advanced usage
   *
   * @returns Configured Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * Delay execution for specified milliseconds
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
