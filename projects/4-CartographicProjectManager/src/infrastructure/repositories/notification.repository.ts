/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/notification.repository.ts
 * @desc Notification repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {Notification} from '../../domain/entities/notification';
import {type NotificationType} from '../../domain/enumerations/notification-type';
import {type INotificationRepository} from '../../domain/repositories/notification-repository.interface';

/**
 * API response type for notification data from backend
 */
interface NotificationApiResponse {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId: string | null;
  createdAt: string;
  isRead: boolean;
}

/**
 * Notification repository implementation using HTTP API.
 *
 * Manages user notifications with read status tracking, type filtering,
 * and automatic cleanup of old notifications.
 *
 * @example
 * ```typescript
 * const repository = new NotificationRepository();
 * const unread = await repository.findUnreadByUserId('user_123');
 * ```
 */
export class NotificationRepository implements INotificationRepository {
  private readonly baseUrl = '/notifications';

  /**
   * Find notification by unique identifier
   *
   * @param id - Notification ID
   * @returns Notification entity or null if not found
   */
  public async findById(id: string): Promise<Notification | null> {
    try {
      const response = await httpClient.get<NotificationApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new notification
   *
   * @param notification - Notification entity to persist
   * @returns Created notification with generated fields
   */
  public async save(notification: Notification): Promise<Notification> {
    const response = await httpClient.post<NotificationApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(notification),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Update existing notification
   *
   * @param notification - Notification entity with updated data
   * @returns Updated notification entity
   */
  public async update(notification: Notification): Promise<Notification> {
    const response = await httpClient.put<NotificationApiResponse>(
      `${this.baseUrl}/${notification.id}`,
      this.mapToApiRequest(notification),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Delete notification by ID
   *
   * @param id - Notification ID to delete
   */
  public async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Find all notifications for user
   *
   * @param userId - User ID
   * @returns Array of user notifications
   */
  public async findByUserId(userId: string): Promise<Notification[]> {
    const response = await httpClient.get<NotificationApiResponse[]>(
      `${this.baseUrl}?userId=${userId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find user notifications with pagination
   *
   * @param userId - User ID
   * @param limit - Maximum notifications to return
   * @param offset - Number of notifications to skip
   * @returns Array of paginated notifications
   */
  public async findByUserIdPaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]> {
    const response = await httpClient.get<NotificationApiResponse[]>(
      `${this.baseUrl}?userId=${userId}&limit=${limit}&offset=${offset}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find unread notifications for user
   *
   * @param userId - User ID
   * @returns Array of unread notifications
   */
  public async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const response = await httpClient.get<NotificationApiResponse[]>(
      `${this.baseUrl}?userId=${userId}&isRead=false`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find notifications by user and type
   *
   * @param userId - User ID
   * @param type - Notification type filter
   * @returns Array of matching notifications
   */
  public async findByUserIdAndType(
    userId: string,
    type: NotificationType,
  ): Promise<Notification[]> {
    const response = await httpClient.get<NotificationApiResponse[]>(
      `${this.baseUrl}?userId=${userId}&type=${type}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Count total notifications for user
   *
   * @param userId - User ID
   * @returns Number of user notifications
   */
  public async countByUserId(userId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `${this.baseUrl}/count?userId=${userId}`,
    );
    return response.data.count;
  }

  /**
   * Count unread notifications for user
   *
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  public async countUnreadByUserId(userId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `${this.baseUrl}/count?userId=${userId}&isRead=false`,
    );
    return response.data.count;
  }

  /**
   * Mark notification as read
   *
   * @param id - Notification ID
   */
  public async markAsRead(id: string): Promise<void> {
    await httpClient.post(`${this.baseUrl}/${id}/read`, {});
  }

  /**
   * Mark all user notifications as read
   *
   * @param userId - User ID
   */
  public async markAllAsReadByUserId(userId: string): Promise<void> {
    await httpClient.post(`${this.baseUrl}/mark-all-read`, {userId});
  }

  /**
   * Delete all notifications for user
   *
   * @param userId - User ID
   */
  public async deleteByUserId(userId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}?userId=${userId}`);
  }

  /**
   * Delete notifications older than date
   *
   * @param date - Cutoff date
   */
  public async deleteOlderThan(date: Date): Promise<void> {
    await httpClient.delete(
      `${this.baseUrl}?olderThan=${date.toISOString()}`,
    );
  }

  /**
   * Find notifications by related entity ID
   *
   * @param entityId - Related entity ID (project, task, etc.)
   * @returns Array of notifications related to entity
   */
  public async findByRelatedEntityId(entityId: string): Promise<Notification[]> {
    const response = await httpClient.get<NotificationApiResponse[]>(
      `${this.baseUrl}?relatedEntityId=${entityId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Map API response to Notification entity
   *
   * @param data - API response data
   * @returns Notification domain entity
   */
  private mapToEntity(data: NotificationApiResponse): Notification {
    return new Notification({
      id: data.id,
      userId: data.userId,
      type: data.type as NotificationType,
      title: data.title,
      message: data.message,
      relatedEntityId: data.relatedEntityId,
      createdAt: new Date(data.createdAt),
      isRead: data.isRead,
    });
  }

  /**
   * Map Notification entity to API request payload
   *
   * @param notification - Notification domain entity
   * @returns API request payload
   */
  private mapToApiRequest(
    notification: Notification,
  ): Record<string, unknown> {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedEntityId: notification.relatedEntityId,
      createdAt: notification.createdAt.toISOString(),
      isRead: notification.isRead,
    };
  }

  /**
   * Check if error is 404 Not Found
   *
   * @param error - Error object
   * @returns True if 404 error
   */
  private isNotFoundError(error: unknown): boolean {
    const maybeError = error as {status?: number; response?: {status?: number}};
    return maybeError?.status === 404 || maybeError?.response?.status === 404;
  }
}
