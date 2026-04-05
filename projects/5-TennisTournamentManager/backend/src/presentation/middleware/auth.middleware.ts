/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/middleware/auth.middleware.ts
 * @desc JWT authentication middleware for protected routes.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../../shared/config';
import {ERROR_CODES, HTTP_STATUS} from '../../shared/constants';

/**
 * Extended Request interface with user payload from JWT.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware to verify JWT tokens.
 * Attaches decoded user payload to request object.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_CODES.UNAUTHORIZED,
        message: 'Authentication required. Please provide a valid token.',
      });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Token is invalid or expired.',
      });
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_CODES.INTERNAL_ERROR,
      message: 'Authentication error.',
    });
  }
}

/**
 * Optional authentication middleware.
 * Attempts to authenticate if a token is present, but allows the request to proceed even if no token is provided.
 * This is useful for endpoints that are public but provide additional data for authenticated users.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    // If no auth header, proceed without user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      // Token is invalid, but we allow the request to proceed
      next();
    }
  } catch (error) {
    // Error in middleware, but we allow the request to proceed
    next();
  }
}
