/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file presentation/middleware/admin.middleware.ts
 * @desc Authorization middleware for admin-only routes.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AuthRequest} from './auth.middleware';
import {ERROR_CODES, HTTP_STATUS} from '../../shared/constants';

/**
 * Admin authorization middleware.
 * Verifies that authenticated user has ADMIN or TOURNAMENT_ADMIN role.
 * Must be used after authMiddleware.
 *
 * @param req - Express request object with user
 * @param res - Express response object
 * @param next - Express next function
 */
export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_CODES.UNAUTHORIZED,
        message: 'Authentication required.',
      });
      return;
    }

    const allowedRoles = ['ADMIN', 'TOURNAMENT_ADMIN'];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        error: ERROR_CODES.FORBIDDEN,
        message: 'Admin access required. Only administrators can perform this action.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_CODES.INTERNAL_ERROR,
      message: 'Authorization error.',
    });
  }
}
