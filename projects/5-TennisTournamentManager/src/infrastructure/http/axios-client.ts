/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/http/axios-client.ts
 * @desc HTTP client wrapper using Axios for REST API communication. Handles JWT authentication headers and response unwrapping.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from 'axios';
import {API_BASE_URL, JWT_STORAGE_KEY} from '@shared/constants';

/**
 * Centralized HTTP client for all REST API communication.
 *
 * Features:
 * - Automatic JWT token injection via request interceptor
 * - Response unwrapping (extracts data from standard API envelope)
 * - Centralized error handling
 */
export class AxiosClient {
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  /**
   * Configures request and response interceptors for JWT auth and error handling.
   */
  private setupInterceptors(): void {
    throw new Error('Not implemented');
  }

  /**
   * Performs a GET request.
   *
   * @param url - The endpoint URL
   * @param config - Optional Axios request configuration
   * @returns The response data
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    throw new Error('Not implemented');
  }

  /**
   * Performs a POST request.
   *
   * @param url - The endpoint URL
   * @param data - The request body
   * @param config - Optional Axios request configuration
   * @returns The response data
   */
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    throw new Error('Not implemented');
  }

  /**
   * Performs a PUT request.
   *
   * @param url - The endpoint URL
   * @param data - The request body
   * @param config - Optional Axios request configuration
   * @returns The response data
   */
  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    throw new Error('Not implemented');
  }

  /**
   * Performs a DELETE request.
   *
   * @param url - The endpoint URL
   * @param config - Optional Axios request configuration
   * @returns The response data
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    throw new Error('Not implemented');
  }
}
