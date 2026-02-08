/**
 * @module application/interfaces/authentication-service
 * @description Service interface for user authentication and session management.
 * @category Application
 */

import {
  type LoginCredentialsDto,
  type AuthResultDto,
  type SessionDto,
  type ValidationResultDto,
} from '../dto';

/**
 * Service interface for authentication operations.
 * Handles user authentication, session lifecycle, password management,
 * and security controls such as failed login attempt tracking.
 */
export interface IAuthenticationService {
  /**
   * Authenticates a user with their credentials.
   * @param credentials - Login credentials containing username/email and password
   * @returns Authentication result with token and user information
   * @throws {UnauthorizedError} If credentials are invalid
   * @throws {AccountLockedError} If account is locked due to failed attempts
   */
  login(credentials: LoginCredentialsDto): Promise<AuthResultDto>;

  /**
   * Terminates the authenticated session for a user.
   * @param userId - The unique identifier of the user to log out
   * @returns Promise that resolves when logout is complete
   * @throws {NotFoundError} If user ID is invalid
   */
  logout(userId: string): Promise<void>;

  /**
   * Validates an existing session token.
   * @param token - The session token to validate
   * @returns Session data if token is valid and not expired
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  validateSession(token: string): Promise<SessionDto>;

  /**
   * Refreshes an existing session using a refresh token.
   * @param refreshToken - The refresh token for session renewal
   * @returns New authentication result with refreshed tokens
   * @throws {UnauthorizedError} If refresh token is invalid or expired
   */
  refreshSession(refreshToken: string): Promise<AuthResultDto>;

  /**
   * Changes a user's password after validating the old password.
   * @param userId - The unique identifier of the user
   * @param oldPassword - The current password for verification
   * @param newPassword - The new password to set
   * @returns Validation result indicating success or failure with details
   * @throws {UnauthorizedError} If old password is incorrect
   * @throws {ValidationError} If new password doesn't meet requirements
   */
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<ValidationResultDto>;

  /**
   * Initiates a password reset process by sending a reset link.
   * @param email - The email address associated with the account
   * @returns Promise that resolves when reset email is sent
   * @throws {NotFoundError} If no account exists with the email
   */
  requestPasswordReset(email: string): Promise<void>;

  /**
   * Resets a user's password using a valid reset token.
   * @param token - The password reset token from email
   * @param newPassword - The new password to set
   * @returns Validation result indicating success or failure with details
   * @throws {UnauthorizedError} If reset token is invalid or expired
   * @throws {ValidationError} If new password doesn't meet requirements
   */
  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ValidationResultDto>;

  /**
   * Retrieves the number of failed login attempts for an account.
   * @param email - The email address to check
   * @returns The count of failed login attempts
   * @throws {NotFoundError} If no account exists with the email
   */
  getFailedLoginAttempts(email: string): Promise<number>;

  /**
   * Clears failed login attempts for an account (typically after successful login).
   * @param email - The email address to clear attempts for
   * @returns Promise that resolves when attempts are cleared
   * @throws {NotFoundError} If no account exists with the email
   */
  clearFailedLoginAttempts(email: string): Promise<void>;
}
