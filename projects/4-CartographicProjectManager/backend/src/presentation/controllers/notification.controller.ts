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
import {NotificationRepository} from '@infrastructure/repositories/notification.repository.js';
import {sendSuccess} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';

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
      const notification = await this.notificationRepository.markAsRead(req.params.id as string);
      sendSuccess(res, notification);
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.notificationRepository.delete(req.params.id as string);
      sendSuccess(res, null, 'Notification deleted', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
