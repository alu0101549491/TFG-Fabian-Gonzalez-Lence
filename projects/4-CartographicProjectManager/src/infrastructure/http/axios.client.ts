/**
 * @module infrastructure/http/axios-client
 * @description Configured Axios HTTP client singleton.
 * Provides a pre-configured Axios instance with interceptors for
 * authentication headers, error handling, and request/response logging.
 * @category Infrastructure
 */

import axios, {type AxiosInstance, type AxiosRequestConfig} from 'axios';

/**
 * Configuration options for the HTTP client.
 */
export interface HttpClientConfig {
  /** Base URL for all API requests. */
  baseUrl: string;
  /** Request timeout in milliseconds. */
  timeout: number;
}

/**
 * Creates and configures an Axios HTTP client instance.
 * Implements the Singleton Pattern for consistent HTTP configuration.
 */
export class HttpClient {
  private static instance: HttpClient | null = null;
  private readonly axiosInstance: AxiosInstance;

  private constructor(config: HttpClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Gets the singleton HttpClient instance.
   * @param config - Configuration for first-time initialization.
   * @returns The HttpClient singleton.
   */
  static getInstance(config?: HttpClientConfig): HttpClient {
    // TODO: Implement singleton pattern
    throw new Error('Method not implemented.');
  }

  /**
   * Sets the authentication token for all subsequent requests.
   * @param token - The JWT token to include in Authorization headers.
   */
  setAuthToken(token: string): void {
    // TODO: Set Authorization header
    throw new Error('Method not implemented.');
  }

  /**
   * Clears the authentication token.
   */
  clearAuthToken(): void {
    // TODO: Remove Authorization header
    throw new Error('Method not implemented.');
  }

  /**
   * Gets the underlying Axios instance for direct use.
   * @returns The configured Axios instance.
   */
  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Sets up request and response interceptors for:
   * - Adding auth tokens to requests
   * - Handling 401 responses (session expiry)
   * - Logging requests in development mode
   * - Standardizing error responses
   */
  private setupInterceptors(): void {
    // TODO: Implement request/response interceptors
  }
}
