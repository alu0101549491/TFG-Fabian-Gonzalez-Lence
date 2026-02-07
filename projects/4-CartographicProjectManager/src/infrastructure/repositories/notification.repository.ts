/**
 * @module infrastructure/repositories/notification-repository
 * @description Concrete implementation of the INotificationRepository interface.
 * @category Infrastructure
 */

import {type INotificationRepository} from '@domain/repositories/notification-repository.interface';
import {type Notification} from '@domain/entities/notification';

/**
 * HTTP-based implementation of the Notification repository.
 */
export class NotificationRepository implements INotificationRepository {
  async findById(id: string): Promise<Notification | null> {
    // TODO: Implement API call GET /api/notifications/:id
    throw new Error('Method not implemented.');
  }

  async save(notification: Notification): Promise<Notification> {
    // TODO: Implement API call POST /api/notifications
    throw new Error('Method not implemented.');
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    // TODO: Implement API call GET /api/users/:userId/notifications
    throw new Error('Method not implemented.');
  }

  async markAsRead(id: string): Promise<void> {
    // TODO: Implement API call PATCH /api/notifications/:id/read
    throw new Error('Method not implemented.');
  }
}
