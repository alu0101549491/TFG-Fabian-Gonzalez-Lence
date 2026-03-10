/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 10, 2026
 * @file src/application/auth/auth-result.helpers.ts
 * @desc Helper factories for building AuthResultDto values.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {AuthErrorCode, AuthResultDto, UserDto} from '../dto/auth-result.dto';

/**
 * Build a successful authentication result.
 *
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @param expiresAt - Expiration timestamp
 * @param user - Authenticated user
 * @returns Successful AuthResultDto
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
 * Build a failed authentication result.
 *
 * @param error - Human-readable error message
 * @param errorCode - Programmatic error code
 * @returns Failed AuthResultDto
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
