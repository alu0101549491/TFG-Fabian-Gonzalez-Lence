/**
 * @module application/interfaces/notification-service
 * @description Interface for the Notification Service.
 * Defines the contract for in-app and WhatsApp notification delivery.
 * @category Application
 */

import {type Notification} from '@domain/entities/notification';

/**
 * Contract for notification operations.
 * Handles sending, retrieving, and managing notification delivery.
 */
export interface INotificationService {
  /**
   * Sends a notification to a user.
   * May also trigger WhatsApp delivery if configured.
   * @param notification - The notification to send.
   */
  sendNotification(notification: Notification): Promise<void>;

  /**
   * Retrieves all notifications for a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of notifications, ordered by creation date.
   */
  getNotificationsByUser(userId: string): Promise<Notification[]>;

  /**
   * Marks a notification as read.
   * @param notificationId - The notification's unique ID.
   */
  markAsRead(notificationId: string): Promise<void>;

  /**
   * Sends a notification via WhatsApp.
   * @param notification - The notification to send via WhatsApp.
   */
  sendViaWhatsApp(notification: Notification): Promise<void>;
}
