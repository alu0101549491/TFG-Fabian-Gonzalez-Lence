/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/persistence/token.storage.ts
 * @desc Token storage implementation for JWT authentication (local + session storage)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {ITokenStorage} from '../http/axios.client';
import {STORAGE_KEYS} from '../../shared/constants';

/**
 * Token storage implementation.
 *
 * Stores access tokens in localStorage (persistent) and refresh tokens in
 * sessionStorage (non-persistent) to reduce long-lived token exposure.
 *
 * @example
 * ```typescript
 * const storage = new TokenStorage();
 * storage.setTokens('access_token', 'refresh_token');
 * const token = storage.getAccessToken();
 * ```
 */
export class TokenStorage implements ITokenStorage {
  /**
   * Retrieve the current access token from localStorage
   *
   * @returns The access token or null if not available
   */
  public getAccessToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error reading access token from localStorage:', error);
      return null;
    }
  }

  /**
   * Retrieve the current refresh token from localStorage
   *
   * @returns The refresh token or null if not available
   */
  public getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error reading refresh token from sessionStorage:', error);
      return null;
    }
  }

  /**
   * Store new access and refresh tokens in localStorage
   *
   * @param accessToken - The new access token
   * @param refreshToken - The new refresh token
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error storing tokens in storage:', error);
    }
  }

  /**
   * Clear all stored authentication tokens
   */
  public clearTokens(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    } catch (error) {
      console.error('Error clearing tokens from storage:', error);
    }
  }
}
