/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/infrastructure/http/axios-client.ts
 * @desc HTTP client wrapper using Axios for REST API communication. Handles JWT authentication headers and response unwrapping.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable} from '@angular/core';
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
@Injectable({providedIn: 'root'})
export class AxiosClient {
  private readonly instance: AxiosInstance;

  private static buildAppPath(path: string): string {
    const normalizedBasePath = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${normalizedBasePath}${normalizedPath}`;
  }

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    this.setupInterceptors();
  }

  /**
   * Configures request and response interceptors for JWT auth and error handling.
   */
  private setupInterceptors(): void {
    // Request interceptor: inject JWT token from localStorage
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor: unwrap data and handle errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        // Handle 401 Unauthorized and 403 Forbidden errors
        // BUT: don't redirect if we're on public pages that allow anonymous access
        if (error.response?.status === 401 || error.response?.status === 403) {
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
          const isPublicPage = 
            currentPath.endsWith('/home') ||
            currentPath === '/' ||
            currentPath === import.meta.env.BASE_URL ||
            currentPath.includes('/announcements') ||
            currentPath.includes('/ranking') ||
            currentPath.includes('/rankings') ||
            currentPath.includes('/statistics') ||
            currentPath.includes('/tournaments') ||
            currentPath.includes('/brackets') ||
            currentPath.includes('/matches') ||
            currentPath.includes('/standings') ||
            currentPath.includes('/order-of-play') ||
            currentPath.includes('/users/');
          
          // Check if this is a mutation (POST/PUT/DELETE) that requires authentication
          const isMutation = ['post', 'put', 'patch', 'delete'].includes(
            error.config?.method?.toLowerCase() || ''
          );
          
          console.log('[HTTP Interceptor]', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            currentPath,
            isAuthPage,
            isPublicPage,
            isMutation,
            willRedirect: !isAuthPage && !isPublicPage,
            tokenExists: !!localStorage.getItem(JWT_STORAGE_KEY)
          });
          
          // If on a public page with a mutation, DON'T clear token (user needs to re-login)
          // If on a public page with a GET, clear token (it's expired/invalid)
          if (isPublicPage && !isMutation) {
            console.warn('[HTTP Interceptor] Clearing invalid token on public page (GET request)');
            localStorage.removeItem(JWT_STORAGE_KEY);
          } else if (!isAuthPage && !isPublicPage) {
            // Only redirect if not on auth pages or public pages
            // (expired session on protected routes)
            localStorage.removeItem(JWT_STORAGE_KEY);
            window.location.assign(AxiosClient.buildAppPath('login'));
          }
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Performs a GET request.
   *
   * @param url - The endpoint URL
   * @param config - Optional Axios request configuration
   * @returns The response data
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
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
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
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
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a DELETE request.
   *
   * @param url - The endpoint URL
   * @param config - Optional Axios request configuration
   * @returns The response data
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
}
