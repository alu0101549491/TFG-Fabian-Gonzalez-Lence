import {AuthResult} from '../../dtos/AuthResult';

/**
 * Authentication service interface
 * Handles user authentication and session management
 */
export interface IAuthenticationService {
  /**
   * Authenticates user with credentials
   * @param username - Username
   * @param password - Password
   * @returns Authentication result with token
   */
  login(username: string, password: string): Promise<AuthResult>;

  /**
   * Logs out user and invalidates session
   * @param userId - User ID to logout
   */
  logout(userId: string): Promise<void>;

  /**
   * Validates session token
   * @param sessionToken - Session token to validate
   * @returns True if session is valid
   */
  validateSession(sessionToken: string): Promise<boolean>;

  /**
   * Refreshes an existing session
   * @param sessionToken - Current session token
   * @returns New session token
   */
  refreshSession(sessionToken: string): Promise<string>;
}