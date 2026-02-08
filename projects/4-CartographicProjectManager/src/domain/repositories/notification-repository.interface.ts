/**
 * @module domain/repositories/notification-repository
 * @description Repository interface for Notification entity persistence operations.
 * @category Domain
 */

import {Notification, NotificationType} from '../entities/notification';

/**
 * Abstraction for Notification data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface INotificationRepository {
  /**
   * Finds a notification by its unique identifier.
   * @param id - The notification's unique ID.
   * @returns The found notification or null if not found.
   * @throws Error if database connection fails.
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Persists a new notification to the data store.
   * @param notification - The notification entity to save.
   * @returns The saved notification with generated fields populated.
   * @throws Error if database operation fails.
   */
  save(notification: Notification): Promise<Notification>;

  /**
   * Updates an existing notification in the data store.
   * @param notification - The notification entity with updated data.
   * @returns The updated notification.
   * @throws Error if notification doesn't exist or database operation fails.
   */
  update(notification: Notification): Promise<Notification>;

  /**
   * Deletes a notification from the data store.
   * @param id - The ID of the notification to delete.
   * @throws Error if notification doesn't exist or database operation fails.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all notifications for a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of notifications ordered by creation date descending (empty if none found).
   * @throws Error if database connection fails.
   */
  findByUserId(userId: string): Promise<Notification[]>;

  /**
   * Finds notifications for a user with pagination.
   * @param userId - The user's unique ID.
   * @param limit - Maximum number of notifications to return.
   * @param offset - Number of notifications to skip.
   * @returns Array of paginated notifications ordered by creation date descending (empty if none found).
   * @throws Error if database connection fails or invalid pagination parameters.
   */
  findByUserIdPaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]>;

  /**
   * Finds all unread notifications for a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of unread notifications ordered by creation date descending (empty if none found).
   * @throws Error if database connection fails.
   */
  findUnreadByUserId(userId: string): Promise<Notification[]>;

  /**
   * Finds all notifications for a user of a specific type.
   * @param userId - The user's unique ID.
   * @param type - The notification type to filter by.
   * @returns Array of notifications matching the criteria ordered by creation date descending (empty if none found).
   * @throws Error if database connection fails.
   */
  findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<Notification[]>;

  /**
   * Counts the total number of notifications for a user.
   * @param userId - The user's unique ID.
   * @returns The count of notifications for the user.
   * @throws Error if database connection fails.
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Counts the number of unread notifications for a user.
   * @param userId - The user's unique ID.
   * @returns The count of unread notifications for the user.
   * @throws Error if database connection fails.
   */
  countUnreadByUserId(userId: string): Promise<number>;

  /**
   * Marks a specific notification as read.
   * @param id - The notification's unique ID.
   * @throws Error if notification doesn't exist or database operation fails.
   */
  markAsRead(id: string): Promise<void>;

  /**
   * Marks all notifications for a user as read.
   * @param userId - The user's unique ID.
   * @throws Error if database operation fails.
   */
  markAllAsReadByUserId(userId: string): Promise<void>;

  /**
   * Deletes all notifications for a specific user.
   * @param userId - The user's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Deletes notifications older than a specific date.
   * @param date - The cutoff date for deletion.
   * @throws Error if database operation fails.
   */
  deleteOlderThan(date: Date): Promise<void>;

  /**
   * Finds notifications related to a specific entity (project, task, etc.).
   * @param entityId - The related entity's unique ID.
   * @returns Array of notifications related to the entity ordered by creation date descending (empty if none found).
   * @throws Error if database connection fails.
   */
  findByRelatedEntityId(entityId: string): Promise<Notification[]>;
}
