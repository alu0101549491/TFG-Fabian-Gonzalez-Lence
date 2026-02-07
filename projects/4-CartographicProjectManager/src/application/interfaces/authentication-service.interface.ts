/**
 * @module application/interfaces/authentication-service
 * @description Interface for the Authentication Service.
 * Defines the contract for user authentication, session management,
 * and credential validation.
 * @category Application
 */

import {type AuthResult, type SessionToken} from '../dto/auth-result.dto';

/**
 * Contract for authentication operations.
 * Handles login, logout, and session lifecycle management.
 */
export interface IAuthenticationService {
  /**
   * Authenticates a user with username and password.
   * @param username - The user's username.
   * @param password - The user's plaintext password.
   * @returns Authentication result with token on success.
   */
  login(username: string, password: string): Promise<AuthResult>;

  /**
   * Terminates the session for a user.
   * @param userId - The ID of the user to log out.
   */
  logout(userId: string): Promise<void>;

  /**
   * Validates an existing session token.
   * @param sessionToken - The token to validate.
   * @returns True if the token is valid and not expired.
   */
  validateSession(sessionToken: string): Promise<boolean>;

  /**
   * Refreshes an existing session token before expiration.
   * @param sessionToken - The current session token.
   * @returns A new session token with extended expiration.
   */
  refreshSession(sessionToken: string): Promise<SessionToken>;
}
