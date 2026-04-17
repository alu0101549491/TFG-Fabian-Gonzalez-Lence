/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/notification-service.interface.ts
 * @desc Notification service interface for multi-channel notification management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {SendNotificationDto, NotificationDto} from '../dto';

/**
 * Notification service interface.
 * Handles notification dispatch, retrieval, and read status management.
 * Implements the Observer Pattern for multi-channel notifications.
 */
export interface INotificationService {
  /**
   * Sends a notification to one or more recipients.
   *
   * @param data - Notification data
   */
  sendNotification(data: SendNotificationDto): Promise<void>;

  /**
   * Retrieves all notifications for a recipient.
   *
   * @param recipientId - ID of the recipient
   * @returns List of notifications
   */
  getByRecipient(recipientId: string): Promise<NotificationDto[]>;

  /**
   * Retrieves unread notifications for a recipient.
   *
   * @param recipientId - ID of the recipient
   * @returns List of unread notifications
   */
  getUnread(recipientId: string): Promise<NotificationDto[]>;

  /**
   * Marks a notification as read.
   *
   * @param notificationId - ID of the notification
   * @param userId - ID of the user marking as read
   */
  markAsRead(notificationId: string, userId: string): Promise<void>;

  /**
   * Marks all notifications as read for a user.
   *
   * @param userId - ID of the user
   */
  markAllAsRead(userId: string): Promise<void>;

  /**
   * Sends bulk notifications to multiple recipients.
   *
   * @param data - Array of notification data
   */
  sendBulkNotifications(data: SendNotificationDto[]): Promise<void>;

  /**
   * Gets the count of unread notifications for a user.
   *
   * @param userId - ID of the user
   * @returns Number of unread notifications
   */
  getUnreadCount(userId: string): Promise<number>;
}
