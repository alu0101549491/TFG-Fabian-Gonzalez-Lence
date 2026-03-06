/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/interfaces/notification-service.interface.ts
 * @desc Service interface for in-app notification delivery.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type NotificationDto,
  type NotificationFilterDto,
  type NotificationListResponseDto,
  type NotificationPreferencesDto,
} from '../dto';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Service interface for notification operations.
 * Handles sending, retrieving, and managing notifications through
 * the in-app channel.
 */
export interface INotificationService {
  /**
   * Sends a notification to a specific user.
   * @param userId - The unique identifier of the recipient user
   * @param type - The type of notification
   * @param title - The notification title
   * @param message - The notification message content
   * @param relatedEntityId - Optional ID of related entity (project, task, etc.)
   * @returns Promise that resolves when notification is sent
   * @throws {NotFoundError} If user doesn't exist
   * @throws {ValidationError} If notification data is invalid
   */
  sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string,
  ): Promise<void>;

  /**
   * Sends the same notification to multiple users.
   * @param userIds - Array of unique identifiers of recipient users
   * @param type - The type of notification
   * @param title - The notification title
   * @param message - The notification message content
   * @param relatedEntityId - Optional ID of related entity (project, task, etc.)
   * @returns Promise that resolves when all notifications are sent
   * @throws {ValidationError} If notification data is invalid
   */
  sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string,
  ): Promise<void>;

  /**
   * Retrieves all notifications for a specific user with optional filtering.
   * @param userId - The unique identifier of the user
   * @param filters - Optional filters for notification list (read status, type, pagination)
   * @returns Paginated list of notifications ordered by creation date
   * @throws {NotFoundError} If user doesn't exist
   */
  getNotificationsByUser(
    userId: string,
    filters?: NotificationFilterDto,
  ): Promise<NotificationListResponseDto>;

  /**
   * Retrieves all unread notifications for a user.
   * @param userId - The unique identifier of the user
   * @returns Array of unread notifications
   * @throws {NotFoundError} If user doesn't exist
   */
  getUnreadNotifications(userId: string): Promise<NotificationDto[]>;

  /**
   * Gets the count of unread notifications for a user.
   * @param userId - The unique identifier of the user
   * @returns The number of unread notifications
   * @throws {NotFoundError} If user doesn't exist
   */
  getUnreadCount(userId: string): Promise<number>;

  /**
   * Marks a specific notification as read.
   * @param notificationId - The unique identifier of the notification
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves when notification is marked as read
   * @throws {NotFoundError} If notification doesn't exist
   * @throws {UnauthorizedError} If notification doesn't belong to user
   */
  markAsRead(notificationId: string, userId: string): Promise<void>;

  /**
   * Marks all notifications as read for a user.
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves when all notifications are marked as read
   * @throws {NotFoundError} If user doesn't exist
   */
  markAllAsRead(userId: string): Promise<void>;

  /**
   * Deletes a specific notification.
   * @param notificationId - The unique identifier of the notification
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves when notification is deleted
   * @throws {NotFoundError} If notification doesn't exist
   * @throws {UnauthorizedError} If notification doesn't belong to user
   */
  deleteNotification(notificationId: string, userId: string): Promise<void>;

  /**
   * Deletes old notifications older than a specified number of days.
   * @param olderThanDays - Number of days to use as threshold
   * @returns The number of notifications deleted
   */
  deleteOldNotifications(olderThanDays: number): Promise<number>;

  /**
   * Retrieves notification preferences for a user.
   * @param userId - The unique identifier of the user
   * @returns The user's notification preferences
   * @throws {NotFoundError} If user doesn't exist
   */
  getUserNotificationPreferences(
    userId: string,
  ): Promise<NotificationPreferencesDto>;

  /**
   * Updates notification preferences for a user.
   * @param userId - The unique identifier of the user
   * @param preferences - The new notification preferences
   * @returns Promise that resolves when preferences are updated
   * @throws {NotFoundError} If user doesn't exist
   * @throws {ValidationError} If preferences are invalid
   */
  updateUserNotificationPreferences(
    userId: string,
    preferences: NotificationPreferencesDto,
  ): Promise<void>;
}
