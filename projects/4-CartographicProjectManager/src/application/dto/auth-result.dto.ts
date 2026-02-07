/**
 * @module application/dto/auth-result
 * @description Data Transfer Object for authentication operation results.
 * @category Application
 */

/**
 * Represents the result of an authentication attempt.
 */
export interface AuthResult {
  /** Whether the authentication was successful. */
  success: boolean;
  /** The session token issued on successful authentication. */
  token?: string;
  /** The authenticated user's ID. */
  userId?: string;
  /** The authenticated user's role. */
  role?: string;
  /** Error message on failed authentication. */
  errorMessage?: string;
}

/**
 * Represents a session token with its metadata.
 */
export interface SessionToken {
  /** The token string. */
  token: string;
  /** Token expiration date. */
  expiresAt: Date;
  /** The user ID associated with this session. */
  userId: string;
}
