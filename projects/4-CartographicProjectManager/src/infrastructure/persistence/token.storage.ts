/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/persistence/token.storage.ts
 * @desc LocalStorage-based token storage implementation for JWT authentication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {ITokenStorage} from '../http/axios.client';
import {STORAGE_KEYS} from '../../shared/constants';

/**
 * LocalStorage-based implementation of token storage.
 *
 * Manages JWT access and refresh tokens using browser localStorage
 * for persistence across sessions.
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
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error reading refresh token from localStorage:', error);
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
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error storing tokens in localStorage:', error);
    }
  }

  /**
   * Clear all stored authentication tokens
   */
  public clearTokens(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing tokens from localStorage:', error);
    }
  }
}
