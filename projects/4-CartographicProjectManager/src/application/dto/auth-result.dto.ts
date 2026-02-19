/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/auth-result.dto.ts
 * @desc Data Transfer Objects for authentication operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {UserRole} from '../../domain/enumerations/user-role';

/**
 * Authentication error codes for programmatic error handling.
 */
export enum AuthErrorCode {
  /** Invalid email or password provided */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  /** Account is locked due to too many failed attempts */
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  /** Account has been disabled by administrator */
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  /** Session has expired and must be renewed */
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  /** Provided token is invalid or malformed */
  TOKEN_INVALID = 'TOKEN_INVALID',
  /** Token has expired */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  /** Email already registered */
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  /** Username already taken */
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  /** Password does not meet requirements */
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  /** Invalid email format */
  INVALID_EMAIL = 'INVALID_EMAIL',
}

/**
 * User information returned after authentication (excludes sensitive data like password hash).
 */
export interface UserDto {
  /** Unique user identifier */
  readonly id: string;
  /** Unique username */
  readonly username: string;
  /** User email address */
  readonly email: string;
  /** User's first name */
  readonly firstName: string;
  /** User's last name */
  readonly lastName: string;
  /** User role in the system */
  readonly role: UserRole;
  /** Whether account is active */
  readonly isActive: boolean;
  /** Phone number (optional) */
  readonly phone: string | null;
  /** Whether WhatsApp notifications are enabled */
  readonly whatsappEnabled: boolean;
  /** Account creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  readonly updatedAt: Date;
  /** Last successful login timestamp */
  readonly lastLogin: Date | null;
}

/**
 * Login credentials for authentication request.
 */
export interface LoginCredentialsDto {
  /** User email address */
  readonly email: string;
  /** User password (plain text, will be hashed) */
  readonly password: string;
  /** Whether to extend session duration */
  readonly rememberMe?: boolean;
}

/**
 * Registration credentials for new user account creation.
 */
export interface RegisterCredentialsDto {
  /** Desired username */
  readonly username: string;
  /** User email address */
  readonly email: string;
  /** User password (min 8 characters) */
  readonly password: string;
  /** Password confirmation */
  readonly confirmPassword: string;
  /** Phone number (optional) */
  readonly phone?: string | null;
  /** Whether to enable WhatsApp notifications */
  readonly whatsappEnabled?: boolean;
}

/**
 * Result of an authentication attempt.
 */
export interface AuthResultDto {
  /** Whether authentication was successful */
  readonly success: boolean;
  /** JWT access token (for API requests) */
  readonly accessToken: string | null;
  /** JWT refresh token (for renewing access token) */
  readonly refreshToken: string | null;
  /** Token expiration timestamp */
  readonly expiresAt: Date | null;
  /** Authenticated user information */
  readonly user: UserDto | null;
  /** Human-readable error message (if failed) */
  readonly error: string | null;
  /** Programmatic error code (if failed) */
  readonly errorCode: AuthErrorCode | null;
}

/**
 * Token refresh request.
 */
export interface RefreshTokenDto {
  /** The refresh token to exchange for new access token */
  readonly refreshToken: string;
}

/**
 * Session information extracted from token.
 */
export interface SessionDto {
  /** User ID from the session */
  readonly userId: string;
  /** User role from the session */
  readonly role: UserRole;
  /** JWT access token */
  readonly token: string;
  /** JWT refresh token */
  readonly refreshToken: string;
  /** Session expiration timestamp */
  readonly expiresAt: Date;
  /** Whether the session is still valid */
  readonly isValid: boolean;
}

/**
 * Creates a successful authentication result.
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @param expiresAt - Token expiration timestamp
 * @param user - Authenticated user information
 * @returns A successful AuthResultDto
 */
export function createSuccessAuthResult(
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
  user: UserDto,
): AuthResultDto {
  return {
    success: true,
    accessToken,
    refreshToken,
    expiresAt,
    user,
    error: null,
    errorCode: null,
  };
}

/**
 * Creates a failed authentication result.
 * @param error - Human-readable error message
 * @param errorCode - Programmatic error code
 * @returns A failed AuthResultDto
 */
export function createFailedAuthResult(
  error: string,
  errorCode: AuthErrorCode,
): AuthResultDto {
  return {
    success: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    user: null,
    error,
    errorCode,
  };
}
