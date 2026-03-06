/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/notification.service.ts
 * @desc Service implementation for notifications.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type NotificationDto,
  type NotificationFilterDto,
  type NotificationListResponseDto,
  type NotificationPreferencesDto,
} from '../dto';
import {INotificationService} from '../interfaces/notification-service.interface';
import {
  type INotificationRepository,
  type IUserRepository,
  type IProjectRepository,
} from '../../domain/repositories';
import {NotFoundError} from './common/errors';
import {generateId} from './common/utils';
import {Notification} from '../../domain/entities/notification';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Data for creating a notification.
 */
interface CreateNotificationData {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedProjectId?: string;
  relatedTaskId?: string;
}

/**
 * Implementation of notification management operations.
 */
export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Sends a notification to a user.
   */
  public async sendNotification(data: CreateNotificationData): Promise<NotificationDto> {
    // Verify recipient exists
    const recipient = await this.userRepository.findById(data.recipientId);
    if (!recipient) {
      throw new NotFoundError(`User ${data.recipientId} not found`);
    }

    // Check preferences
    const preferences = await this.getUserPreferences(data.recipientId);
    if (!preferences.receiveNotifications) {
      // User has disabled notifications
      return this.createEmptyNotificationDto();
    }

    // Create notification
    const notification = new Notification({
      id: generateId(),
      userId: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedProjectId: data.relatedProjectId,
      relatedTaskId: data.relatedTaskId,
      isRead: false,
      createdAt: new Date(),
    });

    await this.notificationRepository.save(notification);

    return this.mapToDto(notification);
  }

  /**
   * Sends bulk notifications to multiple users.
   */
  async sendBulkNotifications(
    recipientIds: string[],
    data: Omit<CreateNotificationData, 'recipientId'>
  ): Promise<void> {
    for (const recipientId of recipientIds) {
      try {
        await this.sendNotification({
          ...data,
          recipientId,
        });
      } catch (error) {
        console.error(`Failed to send notification to ${recipientId}:`, error);
        // Continue with other recipients
      }
    }
  }

  /**
   * Retrieves notifications for a user with optional filtering.
   */
  async getNotificationsByUser(
    userId: string,
    filters?: NotificationFilterDto
  ): Promise<NotificationListResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const notifications = await this.notificationRepository.findByUser(userId, filters);
    const notificationDtos = notifications.map(n => this.mapToDto(n));

    return {
      notifications: notificationDtos,
      total: notificationDtos.length,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || notificationDtos.length,
    };
  }

  /**
   * Retrieves unread notifications for a user.
   */
  public async getUnreadNotifications(userId: string): Promise<NotificationDto[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const notifications = await this.notificationRepository.findUnreadByUser(userId);
    return notifications.map(n => this.mapToDto(n));
  }

  /**
   * Gets count of unread notifications for a user.
   */
  public async getUnreadCount(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    return await this.notificationRepository.countUnreadByUser(userId);
  }

  /**
   * Marks a notification as read.
   */
  public async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError(`Notification ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await this.notificationRepository.save(notification);
  }

  /**
   * Marks multiple notifications as read.
   */
  public async markMultipleAsRead(notificationIds: string[], userId: string): Promise<void> {
    for (const id of notificationIds) {
      try {
        await this.markAsRead(id, userId);
      } catch (error) {
        console.error(`Failed to mark notification ${id} as read:`, error);
      }
    }
  }

  /**
   * Marks all notifications as read for a user.
   */
  public async markAllAsRead(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    await this.notificationRepository.markAllAsReadForUser(userId);
  }

  /**
   * Deletes a notification.
   */
  public async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError(`Notification ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }

    await this.notificationRepository.delete(notificationId);
  }

  /**
   * Deletes all read notifications for a user.
   */
  public async deleteAllRead(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    await this.notificationRepository.deleteReadByUser(userId);
  }

  /**
   * Gets notification preferences for a user.
   */
  public async getUserPreferences(userId: string): Promise<NotificationPreferencesDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    // TODO: Store preferences in database
    // For now, return default preferences
    return {
      receiveNotifications: true,
      notifyOnTaskAssignment: true,
      notifyOnTaskStatusChange: true,
      notifyOnMessage: true,
      notifyOnProjectUpdate: true,
    };
  }

  /**
   * Updates notification preferences for a user.
   */
  async updateUserPreferences(
    userId: string,
    preferences: NotificationPreferencesDto
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    // TODO: Store preferences in database
    console.log(`Updated preferences for user ${userId}:`, preferences);
  }

  /**
   * Retrieves a specific notification.
   */
  public async getNotificationById(notificationId: string, userId: string): Promise<NotificationDto> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError(`Notification ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }

    return this.mapToDto(notification);
  }

  /**
   * Maps notification entity to DTO.
   */
  private mapToDto(notification: Notification): NotificationDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedProjectId: notification.relatedProjectId,
      relatedTaskId: notification.relatedTaskId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }

  /**
   * Creates an empty notification DTO (when user has disabled notifications).
   */
  private createEmptyNotificationDto(): NotificationDto {
    return {
      id: '',
      userId: '',
      type: NotificationType.TASK_ASSIGNED,
      title: '',
      message: '',
      isRead: false,
      createdAt: new Date(),
    };
  }
}
