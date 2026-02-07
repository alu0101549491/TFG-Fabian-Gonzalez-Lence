import {INotificationService} from '../interfaces/INotificationService';
import {
  INotificationRepository,
} from '@domain/repositories/INotificationRepository';
import {Notification} from '@domain/entities/Notification';

/**
 * Notification service implementation
 */
export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async sendNotification(notification: Notification): Promise<void> {
    // TODO: Implement send notification logic
    throw new Error('Method not implemented.');
  }

  async getNotificationsByUser(
      userId: string,
  ): Promise<Notification[]> {
    // TODO: Implement get notifications logic
    throw new Error('Method not implemented.');
  }

  async markAsRead(notificationId: string): Promise<void> {
    // TODO: Implement mark as read logic
    throw new Error('Method not implemented.');
  }

  async sendViaWhatsApp(notification: Notification): Promise<void> {
    // TODO: Implement WhatsApp notification logic
    throw new Error('Method not implemented.');
  }
}
