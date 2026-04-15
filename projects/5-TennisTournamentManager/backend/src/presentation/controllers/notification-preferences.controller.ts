/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file presentation/controllers/notification-preferences.controller.ts
 * @desc Controller for notification preferences endpoints.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AuthRequest} from '../middleware/auth.middleware';
import {NotificationPreferencesService} from '../../application/services/notification-preferences.service';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

/**
 * Controller for notification preferences.
 */
export class NotificationPreferencesController {
  private readonly preferencesService: NotificationPreferencesService;

  constructor() {
    this.preferencesService = new NotificationPreferencesService();
  }

  /**
   * GET /api/users/:userId/notification-preferences
   * Gets notification preferences for a user.
   */
  public async getByUserId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {userId} = req.params;
      const currentUser = req.user;

      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      // Users can only view their own preferences
      if (currentUser.id !== userId) {
        throw new AppError(
          'You can only view your own notification preferences',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      const preferences = await this.preferencesService.getByUserId(userId);
      res.status(HTTP_STATUS.OK).json(preferences);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:userId/notification-preferences
   * Updates notification preferences for a user.
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {userId} = req.params;
      const currentUser = req.user;

      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      // Users can only update their own preferences
      if (currentUser.id !== userId) {
        throw new AppError(
          'You can only update your own notification preferences',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      const updates = req.body;
      const updated = await this.preferencesService.update(userId, updates);
      
      res.status(HTTP_STATUS.OK).json(updated);
    } catch (error) {
      next(error);
    }
  }
}
