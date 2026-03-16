/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/notification-repository.interface.ts
 * @desc Repository interface for Notification entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Notification} from '../entities/notification.entity';

/**
 * Repository interface for Notification entity data access operations.
 * Defines the contract for persisting and retrieving notification data.
 */
export interface INotificationRepository {
  /**
   * Finds a notification by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the notification if found, null otherwise
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Retrieves all notifications.
   * @returns Promise resolving to an array of notifications
   */
  findAll(): Promise<Notification[]>;

  /**
   * Persists a new notification.
   * @param entity - The notification to save
   * @returns Promise resolving to the saved notification
   */
  save(entity: Notification): Promise<Notification>;

  /**
   * Updates an existing notification.
   * @param entity - The notification with updated data
   * @returns Promise resolving to the updated notification
   */
  update(entity: Notification): Promise<Notification>;

  /**
   * Deletes a notification by its unique identifier.
   * @param id - The unique identifier of the notification to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all notifications for a specific recipient.
   * @param recipientId - The unique identifier of the recipient
   * @returns Promise resolving to an array of notifications
   */
  findByRecipientId(recipientId: string): Promise<Notification[]>;

  /**
   * Finds all unread notifications for a specific recipient.
   * @param recipientId - The unique identifier of the recipient
   * @returns Promise resolving to an array of unread notifications
   */
  findUnread(recipientId: string): Promise<Notification[]>;

  /**
   * Marks a notification as read.
   * @param id - The unique identifier of the notification
   * @returns Promise resolving when the notification is marked as read
   */
  markAsRead(id: string): Promise<void>;
}
