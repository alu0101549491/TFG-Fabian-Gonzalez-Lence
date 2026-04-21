/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/infrastructure/repositories/notification.repository.ts
 * @desc HTTP-based implementation of INotificationRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {Notification} from '@domain/entities/notification';
import {INotificationRepository} from '@domain/repositories/notification.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of INotificationRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class NotificationRepositoryImpl implements INotificationRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a notification by its unique identifier.
   * @param id - The notification identifier
   * @returns Promise resolving to the notification or null if not found
   */
  public async findById(id: string): Promise<Notification | null> {
    try {
      const response = await this.httpClient.get<Notification>(`/notifications/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all notifications from the system.
   * @returns Promise resolving to an array of all notifications
   */
  public async findAll(): Promise<Notification[]> {
    const response = await this.httpClient.get<Notification[]>('/notifications');
    return response;
  }

  /**
   * Persists a new notification to the database.
   * @param notification - The notification entity to save
   * @returns Promise resolving to the saved notification with assigned ID
   */
  public async save(notification: Notification): Promise<Notification> {
    const response = await this.httpClient.post<Notification>('/notifications', notification);
    return response;
  }

  /**
   * Updates an existing notification in the database.
   * @param notification - The notification entity with updated data
   * @returns Promise resolving to the updated notification
   */
  public async update(notification: Notification): Promise<Notification> {
    const response = await this.httpClient.put<Notification>(`/notifications/${notification.id}`, notification);
    return response;
  }

  /**
   * Removes a notification from the database.
   * @param id - The identifier of the notification to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/notifications/${id}`);
  }

  /**
   * Retrieves all notifications for a specific user.
   * @param userId - The user's identifier
   * @returns Promise resolving to an array of notifications
   */
  public async findByUser(userId: string): Promise<Notification[]> {
    const response = await this.httpClient.get<Notification[]>(`/notifications?userId=${userId}`);
    return response;
  }

  /**
   * Retrieves all unread notifications for a specific user.
   * @param userId - The user's identifier
   * @returns Promise resolving to an array of unread notifications
   */
  public async findUnread(userId: string): Promise<Notification[]> {
    const response = await this.httpClient.get<Notification[]>(`/notifications?userId=${userId}&read=false`);
    return response;
  }

  /**
   * Marks a notification as read.
   * @param id - The notification identifier
   * @returns Promise resolving when the notification is marked as read
   */
  public async markAsRead(id: string): Promise<void> {
    await this.httpClient.put(`/notifications/${id}/read`, {});
  }

  /**
   * Marks all notifications as read for the authenticated user.
   * @returns Promise resolving when all notifications are marked as read
   */
  public async markAllAsRead(): Promise<void> {
    await this.httpClient.put('/notifications/mark-all-read', {});
  }

  /**
   * Deletes all read notifications for the authenticated user.
   * @returns Promise resolving when all read notifications are deleted
   */
  public async deleteAllRead(): Promise<void> {
    await this.httpClient.delete('/notifications/delete-all-read');
  }
}
