/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 7, 2026
 * @file backend/src/infrastructure/repositories/notification.repository.ts
 * @desc Notification repository implementation using Prisma
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Notification, NotificationType} from '@prisma/client';
import type {INotificationRepository} from '@infrastructure/repositories/interfaces/notification.repository.interface.js';
import {prisma} from '../database/prisma.client.js';
import {DatabaseError} from '@shared/errors.js';
import {logError, logWarning} from '../../shared/logger.js';

export class NotificationRepository implements INotificationRepository {
  public async findByUserIdFiltered(params: {
    userId: string;
    isRead?: boolean;
    type?: NotificationType;
    relatedEntityId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    try {
      const {userId, isRead, type, relatedEntityId, limit, offset} = params;

      return await prisma.notification.findMany({
        where: {
          userId,
          ...(typeof isRead === 'boolean' ? {isRead} : {}),
          ...(type ? {type} : {}),
          ...(relatedEntityId ? {projectId: relatedEntityId} : {}),
        },
        orderBy: {createdAt: 'desc'},
        ...(typeof limit === 'number' ? {take: limit} : {}),
        ...(typeof offset === 'number' ? {skip: offset} : {}),
      });
    } catch (error) {
      throw new DatabaseError('Failed to find notifications by user with filters');
    }
  }

  public async findById(id: string): Promise<Notification | null> {
    try {
      return await prisma.notification.findUnique({where: {id}});
    } catch (error) {
      throw new DatabaseError('Failed to find notification by ID');
    }
  }

  public async findByUserId(userId: string): Promise<Notification[]> {
    try {
      return await prisma.notification.findMany({
        where: {userId},
        orderBy: {createdAt: 'desc'},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find notifications by user ID');
    }
  }

  public async findUnreadByUserId(userId: string): Promise<Notification[]> {
    try {
      return await prisma.notification.findMany({
        where: {userId, isRead: false},
        orderBy: {createdAt: 'desc'},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find unread notifications');
    }
  }

  public async create(data: Omit<Notification, 'id' | 'createdAt' | 'readAt' | 'isRead'>): Promise<Notification> {
    try {
      return await prisma.notification.create({data});
    } catch (error) {
      throw new DatabaseError('Failed to create notification');
    }
  }

  public async markAsRead(id: string): Promise<Notification> {
    try {
      return await prisma.notification.update({
        where: {id},
        data: {isRead: true, readAt: new Date()},
      });
    } catch (error) {
      throw new DatabaseError('Failed to mark notification as read');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await prisma.notification.delete({where: {id}});
    } catch (error: any) {
      // If notification doesn't exist, Prisma throws P2025
      if (error.code === 'P2025') {
        logWarning('Notification not found while deleting', {notificationId: id});
        throw new DatabaseError('Notification not found');
      }

      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      logError('Failed to delete notification', normalizedError, {
        notificationId: id,
      });
      throw new DatabaseError(`Failed to delete notification: ${error.message || 'Unknown error'}`);
    }
  }

  public async deleteAllForUser(userId: string): Promise<void> {
    try {
      await prisma.notification.deleteMany({where: {userId}});
    } catch (error) {
      throw new DatabaseError('Failed to delete all notifications for user');
    }
  }
}
