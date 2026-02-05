import {Notification} from '@domain/entities/Notification';

/**
 * Notification service interface
 * Handles notification delivery
 */
export interface INotificationService {
  /**
   * Sends a notification to user
   * @param notification - Notification entity
   */
  sendNotification(notification: Notification): Promise<void>;

  /**
   * Gets notifications for user
   * @param userId - User ID
   * @returns List of user notifications
   */
  getNotificationsByUser(userId: string): Promise<Notification[]>;

  /**
   * Marks notification as read
   * @param notificationId - Notification ID
   */
  markAsRead(notificationId: string): Promise<void>;

  /**
   * Sends notification via WhatsApp
   * @param notification - Notification to send
   */
  sendViaWhatsApp(notification: Notification): Promise<void>;
}