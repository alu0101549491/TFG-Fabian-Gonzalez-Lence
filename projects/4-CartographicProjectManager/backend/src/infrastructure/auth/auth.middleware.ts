/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/auth/auth.middleware.ts
 * @desc Authentication middleware for Express routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {verifyAccessToken, extractTokenFromHeader} from './jwt.service.js';
import {UnauthorizedError, ForbiddenError} from '@shared/errors.js';
import type {AuthenticatedRequest} from '@shared/types.js';

/**
 * Middleware to authenticate requests using JWT
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to authorize based on user role
 *
 * @param allowedRoles - Array of allowed roles
 * @returns Express middleware function
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as AuthenticatedRequest).user;

      if (!user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Optional authentication middleware (doesn't throw if no token)
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyAccessToken(token);
      (req as AuthenticatedRequest).user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

/**
 * Middleware to authorize resource owner or administrator
 * Checks if the user is accessing their own resource (via :id param) or is an admin
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export function authorizeOwnerOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const resourceId = req.params.id;
    const isOwner = resourceId === user.id;
    const isAdmin = user.role === 'ADMINISTRATOR';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  } catch (error) {
    next(error);
  }
}
