/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/middleware/role.middleware.ts
 * @desc Role-based authorization middleware.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AuthRequest} from './auth.middleware';
import {UserRole} from '../../domain/enumerations/user-role';
import {ERROR_CODES, HTTP_STATUS} from '../../shared/constants';

/**
 * Role-based authorization middleware factory.
 * Returns middleware that checks if user has one of the allowed roles.
 *
 * @param allowedRoles - Array of roles permitted to access the route
 * @returns Express middleware function
 */
export function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_CODES.UNAUTHORIZED,
        message: 'Authentication required.',
      });
      return;
    }
    
    const userRole = req.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        error: ERROR_CODES.FORBIDDEN,
        message: 'Insufficient permissions to access this resource.',
      });
      return;
    }
    
    next();
  };
}
