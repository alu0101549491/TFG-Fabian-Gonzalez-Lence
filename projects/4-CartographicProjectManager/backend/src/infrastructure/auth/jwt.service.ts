/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/auth/jwt.service.ts
 * @desc JWT token generation and verification utilities
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import jwt, {type SignOptions} from 'jsonwebtoken';
import {JWT} from '@shared/constants.js';
import type {JwtPayload} from '@shared/types.js';
import {UnauthorizedError} from '@shared/errors.js';

/**
 * Generate JWT access token
 *
 * @param payload - Token payload
 * @returns Signed JWT token
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT.SECRET, {expiresIn: JWT.EXPIRES_IN as any});
}

/**
 * Generate JWT refresh token
 *
 * @param payload - Token payload
 * @returns Signed refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT.REFRESH_SECRET, {expiresIn: JWT.REFRESH_EXPIRES_IN as any});
}

/**
 * Verify and decode JWT token
 *
 * @param token - JWT token
 * @returns Decoded payload
 * @throws UnauthorizedError if token is invalid
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT.SECRET) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Verify and decode refresh token
 *
 * @param token - Refresh token
 * @returns Decoded payload
 * @throws UnauthorizedError if token is invalid
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT.REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

/**
 * Extract token from Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns Extracted token or null
 */
export function extractTokenFromHeader(
  authHeader: string | undefined
): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
