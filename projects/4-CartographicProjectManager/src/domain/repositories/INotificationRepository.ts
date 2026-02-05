import {Notification} from '../entities/Notification';

/**
 * Repository interface for Notification entity persistence
 */
export interface INotificationRepository {
  /**
   * Finds a notification by ID
   * @param id - Notification ID
   * @returns Notification entity or null if not found
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Saves a new notification
   * @param notification - Notification entity to save
   * @returns Saved notification entity
   */
  save(notification: Notification): Promise<Notification>;

  /**
   * Finds notifications for a user
   * @param userId - User ID
   * @returns List of user notifications
   */
  findByUserId(userId: string): Promise<Notification[]>;

  /**
   * Marks a notification as read
   * @param id - Notification ID
   */
  markAsRead(id: string): Promise<void>;
}