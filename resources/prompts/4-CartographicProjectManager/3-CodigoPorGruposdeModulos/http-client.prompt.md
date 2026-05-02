# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → **Infrastructure Layer** (current) → Presentation Layer

**Current module:** Infrastructure Layer - HTTP Client

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/
│   │   ├── dto/                            # ✅ Already implemented
│   │   ├── interfaces/                     # ✅ Already implemented
│   │   ├── services/                       # ✅ Already implemented
│   │   └── index.ts
│   ├── domain/
│   │   ├── entities/                       # ✅ Already implemented
│   │   ├── enumerations/                   # ✅ Already implemented
│   │   ├── repositories/                   # ✅ Already implemented
│   │   ├── value-objects/                  # ✅ Already implemented
│   │   └── index.ts
│   ├── infrastructure/
│   │   ├── external-services/
│   │   │   ├── index.ts
│   │   │   ├── dropbox.service.ts
│   │   │   └── whatsapp.gateway.ts
│   │   ├── http/
│   │   │   ├── index.ts                    # 🎯 TO IMPLEMENT
│   │   │   └── axios.client.ts             # 🎯 TO IMPLEMENT
│   │   ├── repositories/
│   │   │   └── ...
│   │   ├── websocket/
│   │   │   └── ...
│   │   └── index.ts
│   ├── presentation/
│   │   └── ...
│   └── shared/
│       └── ...
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification (Relevant Sections)

### API Communication Requirements (NFR10, NFR11)
- Backend API for all data operations
- Response time < 2 seconds for common operations
- Support for 50+ concurrent users
- RESTful API with JWT authentication

### Authentication Requirements (NFR7)
- JWT tokens with 24-hour expiration
- Refresh tokens for secure renewal
- Automatic session closure after 30 minutes inactivity
- Secure token storage and transmission

### Error Handling Requirements
- Graceful handling of network errors
- Retry logic for transient failures
- User-friendly error messages
- Proper HTTP status code handling

### File Transfer Requirements (Section 12)
- Support file uploads up to 50MB
- Progress tracking for large uploads/downloads
- Proper content-type handling for different file formats

## 2. API Endpoints Structure (Expected Backend)

The HTTP client will communicate with a backend API with the following structure:

```
Base URL: /api/v1

Authentication:
  POST   /auth/login
  POST   /auth/logout
  POST   /auth/refresh
  GET    /auth/session

Users:
  GET    /users
  GET    /users/:id
  POST   /users
  PUT    /users/:id
  DELETE /users/:id

Projects:
  GET    /projects
  GET    /projects/:id
  POST   /projects
  PUT    /projects/:id
  DELETE /projects/:id
  POST   /projects/:id/finalize
  GET    /projects/:id/participants
  POST   /projects/:id/participants
  DELETE /projects/:id/participants/:userId

Tasks:
  GET    /projects/:projectId/tasks
  GET    /tasks/:id
  POST   /tasks
  PUT    /tasks/:id
  DELETE /tasks/:id
  POST   /tasks/:id/status
  POST   /tasks/:id/confirm
  GET    /tasks/:id/history

Messages:
  GET    /projects/:projectId/messages
  POST   /messages
  POST   /messages/:id/read
  POST   /projects/:projectId/messages/read-all

Notifications:
  GET    /notifications
  POST   /notifications/:id/read
  POST   /notifications/read-all
  GET    /notifications/unread-count

Files:
  POST   /files/upload
  GET    /files/:id
  GET    /files/:id/download
  DELETE /files/:id
  GET    /projects/:projectId/files

Export:
  POST   /export/projects
  POST   /export/tasks
  GET    /export/:id/status
  GET    /export/:id/download

Backup:
  GET    /backups
  POST   /backups
  POST   /backups/:id/restore
  DELETE /backups/:id
```

## 3. HTTP Client Requirements

The Axios client must provide:

1. **Base Configuration:**
   - Base URL configuration
   - Default headers (Content-Type, Accept)
   - Timeout settings
   - Response interceptors

2. **Authentication:**
   - Automatic JWT token injection
   - Token refresh on 401 responses
   - Secure token storage integration

3. **Error Handling:**
   - Network error detection
   - HTTP error status handling
   - Timeout handling
   - Retry logic for specific errors

4. **Request/Response Processing:**
   - Request serialization
   - Response deserialization
   - File upload/download support
   - Progress tracking

---

# SPECIFIC TASK

Implement the HTTP Client module for the Infrastructure Layer. This module provides a configured Axios instance and helper utilities for API communication.

## Files to implement:

### 1. **axios.client.ts**

**Responsibilities:**
- Configure and export Axios instance with base settings
- Implement request interceptors for authentication
- Implement response interceptors for error handling
- Provide token refresh logic on 401 responses
- Support file uploads with progress tracking
- Provide typed HTTP methods for API calls

**Constants to define:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const UPLOAD_TIMEOUT = 300000; // 5 minutes for file uploads
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
```

**Types to define:**

```typescript
/**
 * HTTP request configuration options
 */
interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  withCredentials?: boolean;
  signal?: AbortSignal;
}

/**
 * File upload configuration
 */
interface UploadConfig extends RequestConfig {
  onUploadProgress?: (progress: UploadProgress) => void;
}

/**
 * File download configuration
 */
interface DownloadConfig extends RequestConfig {
  onDownloadProgress?: (progress: DownloadProgress) => void;
  responseType?: 'blob' | 'arraybuffer';
}

/**
 * Upload progress information
 */
interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Download progress information
 */
interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * API error response
 */
interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Token storage interface (to be implemented by presentation layer)
 */
interface ITokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
}
```

**Class/Module to implement:**

```typescript
/**
 * Configured Axios HTTP client for API communication.
 * Handles authentication, error handling, and request/response processing.
 */
class AxiosClient {
  private axiosInstance: AxiosInstance;
  private tokenStorage: ITokenStorage | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  
  constructor() {
    this.axiosInstance = this.createAxiosInstance();
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }
  
  /**
   * Set the token storage implementation
   */
  setTokenStorage(storage: ITokenStorage): void;
  
  /**
   * Create configured Axios instance
   */
  private createAxiosInstance(): AxiosInstance;
  
  /**
   * Setup request interceptor for authentication
   */
  private setupRequestInterceptor(): void;
  
  /**
   * Setup response interceptor for error handling and token refresh
   */
  private setupResponseInterceptor(): void;
  
  /**
   * Handle token refresh on 401 response
   */
  private async handleTokenRefresh(originalRequest: AxiosRequestConfig): Promise<AxiosResponse>;
  
  /**
   * Subscribe to token refresh completion
   */
  private subscribeToTokenRefresh(callback: (token: string) => void): void;
  
  /**
   * Notify all subscribers after token refresh
   */
  private onTokenRefreshed(newToken: string): void;
  
  /**
   * Transform Axios error to ApiError
   */
  private transformError(error: AxiosError): ApiError;
  
  // HTTP Methods
  
  /**
   * Perform GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  
  /**
   * Perform POST request
   */
  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
  
  /**
   * Perform PUT request
   */
  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
  
  /**
   * Perform PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
  
  /**
   * Perform DELETE request
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  
  // File Operations
  
  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    url: string, 
    file: File | Blob, 
    additionalData?: Record<string, unknown>,
    config?: UploadConfig
  ): Promise<ApiResponse<T>>;
  
  /**
   * Upload multiple files
   */
  async uploadFiles<T>(
    url: string,
    files: Array<{ file: File | Blob; fieldName: string }>,
    additionalData?: Record<string, unknown>,
    config?: UploadConfig
  ): Promise<ApiResponse<T>>;
  
  /**
   * Download file with progress tracking
   */
  async downloadFile(
    url: string, 
    config?: DownloadConfig
  ): Promise<Blob>;
  
  // Utility Methods
  
  /**
   * Check if error is a network error
   */
  isNetworkError(error: unknown): boolean;
  
  /**
   * Check if error is a timeout error
   */
  isTimeoutError(error: unknown): boolean;
  
  /**
   * Check if request should be retried
   */
  shouldRetry(error: AxiosError, attempt: number): boolean;
  
  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxAttempts: number
  ): Promise<T>;
  
  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void;
  
  /**
   * Get the underlying Axios instance (for advanced usage)
   */
  getAxiosInstance(): AxiosInstance;
}
```

**Implementation Details:**

1. **Request Interceptor:**
```typescript
private setupRequestInterceptor(): void {
  this.axiosInstance.interceptors.request.use(
    (config) => {
      // Add authorization header if token exists
      const token = this.tokenStorage?.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add request ID for tracking
      config.headers['X-Request-ID'] = this.generateRequestId();
      
      // Add timestamp
      config.headers['X-Request-Time'] = new Date().toISOString();
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}
```

2. **Response Interceptor with Token Refresh:**
```typescript
private setupResponseInterceptor(): void {
  this.axiosInstance.interceptors.response.use(
    (response) => {
      // Transform successful response
      return {
        data: response.data,
        status: response.status,
        message: response.data?.message,
      };
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (this.isRefreshing) {
          // Wait for ongoing refresh
          return new Promise((resolve) => {
            this.subscribeToTokenRefresh((token) => {
              originalRequest.headers!.Authorization = `Bearer ${token}`;
              resolve(this.axiosInstance(originalRequest));
            });
          });
        }
        
        originalRequest._retry = true;
        return this.handleTokenRefresh(originalRequest);
      }
      
      // Transform error and reject
      return Promise.reject(this.transformError(error));
    }
  );
}
```

3. **Token Refresh Logic:**
```typescript
private async handleTokenRefresh(originalRequest: AxiosRequestConfig): Promise<AxiosResponse> {
  this.isRefreshing = true;
  
  try {
    const refreshToken = this.tokenStorage?.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Call refresh endpoint (without interceptors to avoid loop)
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Store new tokens
    this.tokenStorage?.setTokens(accessToken, newRefreshToken);
    
    // Update authorization header
    originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
    
    // Notify subscribers
    this.onTokenRefreshed(accessToken);
    
    // Retry original request
    return this.axiosInstance(originalRequest);
    
  } catch (error) {
    // Clear tokens on refresh failure
    this.tokenStorage?.clearTokens();
    
    // Redirect to login (will be handled by presentation layer)
    window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
    
    throw error;
  } finally {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }
}
```

4. **File Upload with Progress:**
```typescript
async uploadFile<T>(
  url: string,
  file: File | Blob,
  additionalData?: Record<string, unknown>,
  config?: UploadConfig
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add additional data to form
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
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
          percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        });
      }
    },
  });
  
  return response as unknown as ApiResponse<T>;
}
```

5. **Error Transformation:**
```typescript
private transformError(error: AxiosError): ApiError {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as Record<string, unknown>;
    return {
      status: error.response.status,
      code: (data?.code as string) || this.getErrorCodeFromStatus(error.response.status),
      message: (data?.message as string) || this.getDefaultErrorMessage(error.response.status),
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
      message: 'Unable to connect to server. Please check your internet connection.',
    };
  }
  
  // Request setup error
  return {
    status: 0,
    code: 'REQUEST_ERROR',
    message: error.message || 'An unexpected error occurred.',
  };
}

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
```

---

### 2. **index.ts** (Barrel Export)

**Responsibilities:**
- Export AxiosClient class and singleton instance
- Export all types and interfaces
- Provide convenient access to HTTP client

**Content:**
```typescript
// Export types
export type {
  RequestConfig,
  UploadConfig,
  DownloadConfig,
  UploadProgress,
  DownloadProgress,
  ApiResponse,
  ApiError,
  ITokenStorage,
};

// Export class
export { AxiosClient };

// Export singleton instance
export const httpClient = new AxiosClient();

// Export convenience methods
export const http = {
  get: <T>(url: string, config?: RequestConfig) => httpClient.get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: RequestConfig) => httpClient.post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: RequestConfig) => httpClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: RequestConfig) => httpClient.patch<T>(url, data, config),
  delete: <T>(url: string, config?: RequestConfig) => httpClient.delete<T>(url, config),
  uploadFile: <T>(url: string, file: File | Blob, data?: Record<string, unknown>, config?: UploadConfig) => 
    httpClient.uploadFile<T>(url, file, data, config),
  downloadFile: (url: string, config?: DownloadConfig) => httpClient.downloadFile(url, config),
};
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **HTTP Library:** Axios
- **Maximum cyclomatic complexity:** 10
- **Maximum method length:** 50 lines

## Mandatory best practices:
- **Type Safety:** All requests and responses fully typed
- **Error Handling:** Comprehensive error transformation
- **Security:**
  - No sensitive data in logs
  - Secure token handling
  - HTTPS enforcement in production
- **Performance:**
  - Request timeout configuration
  - Connection pooling (Axios default)
  - Request cancellation support
- **Resilience:**
  - Retry logic for transient failures
  - Circuit breaker pattern consideration
  - Graceful degradation

## Environment Variables:
```typescript
// Expected environment variables
VITE_API_BASE_URL: string;      // Backend API URL
VITE_API_TIMEOUT: number;        // Request timeout in ms
VITE_ENABLE_REQUEST_LOGGING: boolean; // Enable request logging
```

## Security Considerations:
- Never log access tokens or refresh tokens
- Use HTTPS in production
- Implement CSRF protection if using cookies
- Sanitize error messages before displaying to users
- Clear tokens on logout and session expiry

---

# DELIVERABLES

1. **Complete source code** for both files (axios.client.ts + index.ts)

2. **For axios.client.ts:**
   - Full AxiosClient class implementation
   - All types and interfaces
   - Request/response interceptors
   - Token refresh logic
   - File upload/download methods
   - Error transformation
   - Retry logic
   - JSDoc documentation

3. **Utility functions to include:**
   - `generateRequestId()`: Generate unique request ID
   - `delay(ms: number)`: Delay helper for retry logic
   - `isRetryableError(error)`: Check if error is retryable

4. **Edge cases to handle:**
   - Network disconnection
   - Request timeout
   - Token expiration during request
   - Multiple concurrent requests during token refresh
   - File upload cancellation
   - Large file downloads
   - Invalid JSON responses
   - CORS errors

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```typescript
// src/infrastructure/http/axios.client.ts
[Complete code here]
```

```typescript
// src/infrastructure/http/index.ts
[Complete code here]
```

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
