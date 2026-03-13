/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/controllers/notification.controller.ts
 * @desc Notification controller
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import type {Request, Response, NextFunction} from 'express';
import {NotificationType, UserRole} from '@prisma/client';
import type {AuthenticatedRequest} from '@shared/types.js';
import {NotificationRepository} from '@infrastructure/repositories/notification.repository.js';
import {sendSuccess, sendError} from '@shared/utils.js';
import {HTTP_STATUS} from '@shared/constants.js';
import {NotFoundError} from '@shared/errors.js';

type NotificationResponseDto = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId: string | null;
  createdAt: Date;
  isRead: boolean;
  readAt: Date | null;
};

type CreateNotificationBody = {
  userId?: string;
  type?: string;
  title?: string;
  message?: string;
  relatedEntityId?: string | null;
};

export class NotificationController {
  private readonly notificationRepository: NotificationRepository;

  public constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  private mapToResponseDto(notification: {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    projectId: string | null;
    createdAt: Date;
    isRead: boolean;
    readAt: Date | null;
  }): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedEntityId: notification.projectId,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
      readAt: notification.readAt,
    };
  }

  private parseNotificationType(type: string | undefined): NotificationType | null {
    if (!type) return null;
    const normalized = type.trim();
    if (!normalized) return null;

    return (Object.values(NotificationType) as string[]).includes(normalized)
      ? (normalized as NotificationType)
      : null;
  }

  private parseOptionalPositiveInt(value: unknown): number | null {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }

  private parseOptionalNonNegativeInt(value: unknown): number | null {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      return null;
    }
    return parsed;
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      const notificationId = req.params.id as string;
      const notification = await this.notificationRepository.findById(notificationId);
      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      // Ownership is enforced by middleware for non-admin.
      sendSuccess(res, this.mapToResponseDto(notification));
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      const body = req.body as CreateNotificationBody;
      const type = this.parseNotificationType(body.type);
      if (!type) {
        return sendError(res, 'Invalid notification type', HTTP_STATUS.BAD_REQUEST);
      }

      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      if (!title || !message) {
        return sendError(res, 'title and message are required', HTTP_STATUS.BAD_REQUEST);
      }

      const isAdmin = currentUser.role === UserRole.ADMINISTRATOR;
      const requestedUserId = typeof body.userId === 'string' ? body.userId : undefined;
      const userId = isAdmin && requestedUserId ? requestedUserId : currentUser.id;
      const relatedEntityId =
        typeof body.relatedEntityId === 'string'
          ? body.relatedEntityId
          : body.relatedEntityId === null
            ? null
            : null;

      const created = await this.notificationRepository.create({
        userId,
        type,
        title,
        message,
        projectId: relatedEntityId,
      });

      sendSuccess(res, this.mapToResponseDto(created), 'Notification created', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  public async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;

      if (!currentUser) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      const requestedUserIdFromParams =
        typeof req.params.userId === 'string' ? req.params.userId : undefined;
      const requestedUserIdFromQuery =
        typeof req.query.userId === 'string' ? req.query.userId : undefined;
      const requestedUserId = requestedUserIdFromParams ?? requestedUserIdFromQuery;
      const isAdmin = currentUser.role === 'ADMINISTRATOR';

      if (!isAdmin && requestedUserId && requestedUserId !== currentUser.id) {
        return sendError(
          res,
          'You do not have permission to view notifications for this user',
          HTTP_STATUS.FORBIDDEN,
        );
      }

      const targetUserId = isAdmin && requestedUserId ? requestedUserId : currentUser.id;

      const isReadQuery = typeof req.query.isRead === 'string' ? req.query.isRead : undefined;
      const typeQuery = typeof req.query.type === 'string' ? req.query.type : undefined;
      const relatedEntityQuery =
        typeof req.query.relatedEntityId === 'string' ? req.query.relatedEntityId : undefined;

      const limitRaw = req.query.limit;
      const offsetRaw = req.query.offset;
      const limit = this.parseOptionalPositiveInt(limitRaw);
      const offset = this.parseOptionalNonNegativeInt(offsetRaw);
      const shouldPaginate = limit !== null || offset !== null;
      const effectiveLimit = Math.min(limit ?? 20, 100);
      const effectiveOffset = offset ?? 0;

      const notificationType = this.parseNotificationType(typeQuery);
      const isReadFilter = isReadQuery === 'false'
        ? false
        : isReadQuery === 'true'
          ? true
          : undefined;

      const notifications = await this.notificationRepository.findByUserIdFiltered({
        userId: targetUserId,
        isRead: isReadFilter,
        type: notificationType ?? undefined,
        relatedEntityId: relatedEntityQuery,
        limit: shouldPaginate ? effectiveLimit : undefined,
        offset: shouldPaginate ? effectiveOffset : undefined,
      });

      sendSuccess(res, notifications.map((n) => this.mapToResponseDto(n)));
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        return sendError(res, 'Authentication required', 401);
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
        return sendError(res, 'You do not have permission to modify this notification', 403);
      }

      const updatedNotification = await this.notificationRepository.markAsRead(notificationId);
      sendSuccess(res, this.mapToResponseDto(updatedNotification));
    } catch (error) {
      next(error);
    }
  }

  public async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      if (!currentUser) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      const requestedUserId =
        typeof (req.body as {userId?: unknown})?.userId === 'string'
          ? String((req.body as {userId?: unknown}).userId)
          : undefined;

      const isAdmin = currentUser.role === UserRole.ADMINISTRATOR;
      const targetUserId = isAdmin && requestedUserId ? requestedUserId : currentUser.id;

      if (!isAdmin && requestedUserId && requestedUserId !== currentUser.id) {
        return sendError(
          res,
          'You do not have permission to modify notifications for this user',
          HTTP_STATUS.FORBIDDEN,
        );
      }

      const unread = await this.notificationRepository.findUnreadByUserId(targetUserId);
      for (const notification of unread) {
        await this.notificationRepository.markAsRead(notification.id);
      }

      sendSuccess(res, {count: unread.length}, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  public async count(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      if (!currentUser) {
        return sendError(res, 'Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      const requestedUserIdFromQuery =
        typeof req.query.userId === 'string' ? req.query.userId : undefined;
      const isAdmin = currentUser.role === UserRole.ADMINISTRATOR;
      const targetUserId = isAdmin && requestedUserIdFromQuery ? requestedUserIdFromQuery : currentUser.id;

      if (!isAdmin && requestedUserIdFromQuery && requestedUserIdFromQuery !== currentUser.id) {
        return sendError(
          res,
          'You do not have permission to view notifications for this user',
          HTTP_STATUS.FORBIDDEN,
        );
      }

      const isReadQuery = typeof req.query.isRead === 'string' ? req.query.isRead : undefined;
      const count = isReadQuery === 'false'
        ? (await this.notificationRepository.findUnreadByUserId(targetUserId)).length
        : (await this.notificationRepository.findByUserId(targetUserId)).length;

      sendSuccess(res, {count});
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUser = authReq.user;
      
      if (!currentUser) {
        return sendError(res, 'Authentication required', 401);
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
        return sendError(res, 'You do not have permission to delete this notification', 403);
      }

      await this.notificationRepository.delete(notificationId);
      sendSuccess(res, null, 'Notification deleted', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}
