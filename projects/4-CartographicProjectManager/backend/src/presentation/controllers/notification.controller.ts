/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/controllers/notification.controller.ts
 * @desc Notification controller
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Request, Response, NextFunction} from 'express';
import type {AuthenticatedRequest} from '@shared/types.js';
import {NotificationRepository} from '@infrastructure/repositories/notification.repository.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';
import {NotFoundError} from '@shared/errors.js';

export class NotificationController {
  private readonly notificationRepository: NotificationRepository;

  public constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  public async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await this.notificationRepository.findByUserId(req.params.userId as string);
      sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        return sendError(res, 401, 'Authentication required');
      }

      const notificationId = req.params.id as string;
      
      // Check if notification exists
      const notification = await this.notificationRepository.findById(notificationId);
      
      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      // Verify ownership (only owner or admin can mark as read)
      const canMarkAsRead =
        currentUser.role === 'ADMINISTRATOR' ||
        notification.userId === currentUser.id;

      if (!canMarkAsRead) {
        return sendError(res, 403, 'You do not have permission to modify this notification');
      }

      const updatedNotification = await this.notificationRepository.markAsRead(notificationId);
      sendSuccess(res, updatedNotification);
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        return sendError(res, 401, 'Authentication required');
      }

      const notificationId = req.params.id as string;
      
      // Check if notification exists
      const notification = await this.notificationRepository.findById(notificationId);
      
      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      // Verify ownership (only owner or admin can delete)
      const canDelete =
        currentUser.role === 'ADMINISTRATOR' ||
        notification.userId === currentUser.id;

      if (!canDelete) {
        return sendError(res, 403, 'You do not have permission to delete this notification');
      }

      await this.notificationRepository.delete(notificationId);
      sendSuccess(res, null, 'Notification deleted', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
