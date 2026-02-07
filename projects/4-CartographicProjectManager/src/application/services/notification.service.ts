/**
 * @module application/services/notification-service
 * @description Concrete implementation of the Notification Service.
 * Handles in-app notifications and optional WhatsApp delivery.
 * @category Application
 */

import {type INotificationService} from '../interfaces/notification-service.interface';
import {type INotificationRepository} from '@domain/repositories/notification-repository.interface';
import {type Notification} from '@domain/entities/notification';

/**
 * Placeholder interface for WhatsApp external gateway.
 */
interface IWhatsAppGateway {
  sendMessage(phoneNumber: string, message: string): Promise<boolean>;
}

/**
 * Implementation of the notification service.
 * Coordinates notification repository and WhatsApp gateway.
 */
export class NotificationService implements INotificationService {
  private readonly notificationRepository: INotificationRepository;
  private readonly whatsAppGateway: IWhatsAppGateway;

  constructor(
    notificationRepository: INotificationRepository,
    whatsAppGateway: IWhatsAppGateway,
  ) {
    this.notificationRepository = notificationRepository;
    this.whatsAppGateway = whatsAppGateway;
  }

  async sendNotification(notification: Notification): Promise<void> {
    // TODO: Implement notification sending
    // 1. Persist notification
    // 2. Emit real-time event via WebSocket
    // 3. Check if WhatsApp delivery is needed
    throw new Error('Method not implemented.');
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    // TODO: Implement notifications retrieval
    throw new Error('Method not implemented.');
  }

  async markAsRead(notificationId: string): Promise<void> {
    // TODO: Implement read marking
    throw new Error('Method not implemented.');
  }

  async sendViaWhatsApp(notification: Notification): Promise<void> {
    // TODO: Implement WhatsApp notification delivery
    throw new Error('Method not implemented.');
  }
}
