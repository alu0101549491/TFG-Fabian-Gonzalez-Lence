/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/presentation/services/auth-state.service.ts
 * @desc Angular injectable service for managing authentication state (JWT token, current user). Enforces 30-minute session timeout (NFR12).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable} from '@angular/core';
import {type UserDto} from '@application/dto/user.dto';
import {JWT_STORAGE_KEY} from '@shared/constants';

const USER_STORAGE_KEY = 'app_user';

/**
 * Service for managing the client-side authentication state.
 *
 * Stores the JWT token and user data in localStorage and provides methods
 * to check authentication status, retrieve the current user,
 * and handle session timeout (30 min per NFR12).
 */
@Injectable({providedIn: 'root'})
export class AuthStateService {
  private currentUser: UserDto | null = null;

  constructor() {
    // Restore user from localStorage on service initialization
    this.restoreUser();
  }

  /**
   * Restores user data from localStorage.
   */
  private restoreUser(): void {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
      } catch (error) {
        console.error('[AuthState] Failed to restore user from localStorage:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }

  /**
   * Stores the JWT token after successful authentication.
   *
   * @param token - The JWT token to store
   * @param user - The authenticated user data
   */
  public setAuth(token: string, user: UserDto): void {
    if (!token || token.trim().length === 0) {
      throw new Error('Token is required');
    }
    
    if (!user) {
      throw new Error('User data is required');
    }
    
    // Validate critical fields
    if (!user.username) {
      console.error('[AuthState] CRITICAL: Attempting to authenticate user without username!', user);
      throw new Error('Cannot authenticate user without username');
    }
    
    // Store token in localStorage
    localStorage.setItem(JWT_STORAGE_KEY, token);
    
    // Store user in memory and localStorage
    this.currentUser = user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Retrieves the stored JWT token.
   *
   * @returns The JWT token or null if not authenticated
   */
  public getToken(): string | null {
    return localStorage.getItem(JWT_STORAGE_KEY);
  }

  /**
   * Checks whether the user is currently authenticated.
   *
   * @returns True if a valid token exists
   */
  public isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token.length > 0;
  }

  /**
   * Returns the currently authenticated user.
   *
   * @returns The current user DTO or null
   */
  public getCurrentUser(): UserDto | null {
    return this.currentUser;
  }

  /**
   * Updates the current user data without changing the token.
   * Used when user profile is updated.
   *
   * @param user - The updated user data
   */
  public setUser(user: UserDto): void {
    if (!user) {
      throw new Error('User data is required');
    }
    
    // Validate critical fields before storing
    if (!user.username) {
      console.error('[AuthState] CRITICAL: Attempting to store user without username!', user);
      throw new Error('Cannot store user without username');
    }
    
    // Update user in memory and localStorage
    this.currentUser = user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Clears the authentication state (logout).
   */
  public clearAuth(): void {
    // Remove token from localStorage
    localStorage.removeItem(JWT_STORAGE_KEY);
    
    // Remove user from localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Clear user from memory
    this.currentUser = null;
  }
}
