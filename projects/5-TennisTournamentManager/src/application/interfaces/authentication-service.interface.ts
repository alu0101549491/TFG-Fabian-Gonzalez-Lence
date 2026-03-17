/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/authentication-service.interface.ts
 * @desc Authentication service interface for user login, registration, and token management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {LoginDto, RegisterUserDto, AuthResponseDto, UserDto} from '../dto';

/**
 * Authentication service interface.
 * Handles user authentication, registration, and token management operations.
 */
export interface IAuthenticationService {
  /**
   * Authenticates a user and returns a JWT token.
   *
   * @param username - Username for authentication
   * @param password - Password for authentication
   * @returns Authentication response with token and user data
   */
  login(username: string, password: string): Promise<AuthResponseDto>;

  /**
   * Registers a new user account.
   *
   * @param data - User registration data
   * @returns Created user information
   */
  register(data: RegisterUserDto): Promise<UserDto>;

  /**
   * Validates a session token and returns whether it is valid.
   *
   * @param token - JWT token to validate
   * @returns True if the session is valid, false otherwise
   */
  validateSession(token: string): Promise<boolean>;

  /**
   * Logs out the current user and invalidates the session.
   *
   * @param userId - ID of the user to log out
   */
  logout(userId: string): Promise<void>;

  /**
   * Refreshes an expiring JWT token.
   *
   * @param token - Current token to refresh
   * @returns New authentication response with refreshed token
   */
  refreshToken(token: string): Promise<AuthResponseDto>;
}
