/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/notification.controller.ts
 * @desc Notification controller for user notifications.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Notification} from '../../domain/entities/notification.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS} from '../../shared/constants';

export class NotificationController {
  public async getByUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const notificationRepository = AppDataSource.getRepository(Notification);
      const notifications = await notificationRepository.find({
        where: {userId},
        order: {createdAt: 'DESC'},
        take: 50,
      });
      
      res.status(HTTP_STATUS.OK).json(notifications);
    } catch (error) {
      next(error);
    }
  }
  
  public async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userId = req.user!.id;
      const notificationRepository = AppDataSource.getRepository(Notification);
      
      await notificationRepository.update({id, userId}, {isRead: true});
      
      // Emit WebSocket event to refresh notifications
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${userId}`).emit('notifications:refresh', {userId});
      }
      
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marks all notifications as read for the authenticated user.
   */
  public async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const notificationRepository = AppDataSource.getRepository(Notification);
      
      // Update all unread notifications for this user
      await notificationRepository.update(
        {userId, isRead: false},
        {isRead: true}
      );
      
      // Emit WebSocket event to refresh notifications
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${userId}`).emit('notifications:refresh', {userId});
      }
      
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a single notification.
   */
  public async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userId = req.user!.id;
      const notificationRepository = AppDataSource.getRepository(Notification);
      
      // Delete only if the notification belongs to the user
      await notificationRepository.delete({id, userId});
            // Emit WebSocket event to refresh notifications
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${userId}`).emit('notifications:refresh', {userId});
      }
            res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes all read notifications for the authenticated user.
   */
  public async deleteAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const notificationRepository = AppDataSource.getRepository(Notification);
      
      // Delete all read notifications for this user
      await notificationRepository.delete(
        {userId, isRead: true}
      );
      
      // Emit WebSocket event to refresh notifications
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${userId}`).emit('notifications:refresh', {userId});
      }
      
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
