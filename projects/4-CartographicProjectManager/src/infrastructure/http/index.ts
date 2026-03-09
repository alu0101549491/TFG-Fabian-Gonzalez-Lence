/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/http/index.ts
 * @desc Barrel export for HTTP client module with convenience methods
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

// Import AxiosClient for local use
import {AxiosClient} from './axios.client';

// Export types
export type {
  RequestConfig,
  UploadConfig,
  DownloadConfig,
  UploadProgress,
  DownloadProgress,
  ApiResponse,
  ApiError,
} from './axios.client';

export type {ITokenStorage} from '../persistence/token.storage.interface';

// Export class
export {AxiosClient} from './axios.client';

/**
 * Singleton HTTP client instance for application-wide use
 *
 * @example
 * ```typescript
 * import { httpClient } from '@/infrastructure/http';
 *
 * // Set token storage implementation
 * httpClient.setTokenStorage(tokenStorage);
 *
 * // Make requests
 * const users = await httpClient.get<User[]>('/users');
 * ```
 */
export const httpClient = new AxiosClient();

/**
 * Convenience object providing direct access to HTTP methods.
 * Wraps the singleton httpClient instance for cleaner syntax.
 *
 * @example
 * ```typescript
 * import { http } from '@/infrastructure/http';
 *
 * // Simpler syntax than using httpClient directly
 * const user = await http.get<User>('/users/123');
 * const newUser = await http.post<User>('/users', { name: 'John' });
 * ```
 */
export const http = {
  /**
   * Perform GET request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  get: <T>(url: string, config?: RequestConfig) =>
    httpClient.get<T>(url, config),

  /**
   * Perform POST request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  post: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    httpClient.post<T>(url, data, config),

  /**
   * Perform PUT request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  put: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    httpClient.put<T>(url, data, config),

  /**
   * Perform PATCH request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  patch: <T>(url: string, data?: unknown, config?: RequestConfig) =>
    httpClient.patch<T>(url, data, config),

  /**
   * Perform DELETE request
   *
   * @template T Response data type
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  delete: <T>(url: string, config?: RequestConfig) =>
    httpClient.delete<T>(url, config),

  /**
   * Upload single file with progress tracking
   *
   * @template T Response data type
   * @param url - Upload endpoint URL
   * @param file - File or Blob to upload
   * @param data - Additional form data fields
   * @param config - Upload configuration with progress callback
   * @returns Promise resolving to API response
   */
  uploadFile: <T>(
    url: string,
    file: File | Blob,
    data?: Record<string, unknown>,
    config?: UploadConfig,
  ) => httpClient.uploadFile<T>(url, file, data, config),

  /**
   * Upload multiple files with progress tracking
   *
   * @template T Response data type
   * @param url - Upload endpoint URL
   * @param files - Array of files with field names
   * @param data - Additional form data fields
   * @param config - Upload configuration with progress callback
   * @returns Promise resolving to API response
   */
  uploadFiles: <T>(
    url: string,
    files: Array<{ file: File | Blob; fieldName: string }>,
    data?: Record<string, unknown>,
    config?: UploadConfig,
  ) => httpClient.uploadFiles<T>(url, files, data, config),

  /**
   * Download file with progress tracking
   *
   * @param url - Download endpoint URL
   * @param config - Download configuration with progress callback
   * @returns Promise resolving to file Blob
   */
  downloadFile: (url: string, config?: DownloadConfig) =>
    httpClient.downloadFile(url, config),
};

/**
 * Re-import types for convenience (allows importing from index instead of axios.client)
 */
import type {
  RequestConfig,
  UploadConfig,
  DownloadConfig,
} from './axios.client';
