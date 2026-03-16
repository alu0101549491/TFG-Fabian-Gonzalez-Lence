/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file presentation/services/auth-state.service.ts
 * @desc Angular injectable service for managing authentication state (JWT token, current user). Enforces 30-minute session timeout (NFR12).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {type UserDto} from '@application/dto/user.dto';
import {JWT_STORAGE_KEY} from '@shared/constants';

/**
 * Service for managing the client-side authentication state.
 *
 * Stores the JWT token in localStorage and provides methods
 * to check authentication status, retrieve the current user,
 * and handle session timeout (30 min per NFR12).
 */
@Injectable({providedIn: 'root'})
export class AuthStateService {
  private currentUser: UserDto | null = null;

  /**
   * Stores the JWT token after successful authentication.
   *
   * @param token - The JWT token to store
   * @param user - The authenticated user data
   */
  public setAuth(token: string, user: UserDto): void {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves the stored JWT token.
   *
   * @returns The JWT token or null if not authenticated
   */
  public getToken(): string | null {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether the user is currently authenticated.
   *
   * @returns True if a valid token exists
   */
  public isAuthenticated(): boolean {
    throw new Error('Not implemented');
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
   * Clears the authentication state (logout).
   */
  public clearAuth(): void {
    throw new Error('Not implemented');
  }
}
