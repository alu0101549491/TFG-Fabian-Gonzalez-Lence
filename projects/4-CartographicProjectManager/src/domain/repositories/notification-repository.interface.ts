/**
 * @module domain/repositories/notification-repository
 * @description Repository interface for Notification entity persistence operations.
 * @category Domain
 */

import {Notification} from '../entities/notification';

/**
 * Abstraction for Notification data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface INotificationRepository {
  /**
   * Finds a notification by its unique identifier.
   * @param id - The notification's unique ID.
   * @returns The found notification or null if not found.
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Persists a new notification to the data store.
   * @param notification - The notification entity to save.
   * @returns The saved notification.
   */
  save(notification: Notification): Promise<Notification>;

  /**
   * Finds all notifications for a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of notifications for the user, ordered by creation date.
   */
  findByUserId(userId: string): Promise<Notification[]>;

  /**
   * Marks a notification as read.
   * @param id - The notification's unique ID.
   */
  markAsRead(id: string): Promise<void>;
}
