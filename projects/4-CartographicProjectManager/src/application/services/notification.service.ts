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
import {
  type INotificationService,
  type SendNotificationData,
} from '../interfaces/notification-service.interface';
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
  public async sendNotification(data: SendNotificationData): Promise<NotificationDto> {
    // Verify recipient exists
    const recipient = await this.userRepository.findById(data.recipientId);
    if (!recipient) {
      throw new NotFoundError(`User ${data.recipientId} not found`);
    }

    // Check preferences
    const preferences = await this.getUserPreferences(data.recipientId);
    if (!preferences.inAppEnabled) {
      // User has disabled notifications
      return this.createEmptyNotificationDto();
    }

    if (data.relatedProjectId) {
      const project = await this.projectRepository.findById(data.relatedProjectId);
      if (!project) {
        throw new NotFoundError(`Project ${data.relatedProjectId} not found`);
      }
    }

    const relatedEntityId = data.relatedTaskId ?? data.relatedProjectId ?? null;

    // Create notification
    const notification = new Notification({
      id: generateId(),
      userId: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedEntityId,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    });

    const saved = await this.notificationRepository.save(notification);

    return this.mapToDto(saved);
  }

  /**
   * Sends bulk notifications to multiple users.
   */
  async sendBulkNotifications(
    recipientIds: string[],
    data: Omit<SendNotificationData, 'recipientId'>
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

    const allNotifications = await this.notificationRepository.findByUserId(userId);
    const filtered = this.applyFilters(allNotifications, filters);
    const {items, page, limit, total, totalPages} = this.paginate(filtered, filters);
    const unreadCount = await this.notificationRepository.countUnreadByUserId(userId);

    const notificationDtos = items.map((n) => this.mapToDto(n));
    return {notifications: notificationDtos, total, page, limit, totalPages, unreadCount};
  }

  /**
   * Retrieves unread notifications for a user.
   */
  public async getUnreadNotifications(userId: string): Promise<NotificationDto[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const notifications = await this.notificationRepository.findUnreadByUserId(userId);
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

    return await this.notificationRepository.countUnreadByUserId(userId);
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

    notification.markAsRead();
    await this.notificationRepository.update(notification);
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

    await this.notificationRepository.markAllAsReadByUserId(userId);
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

    const notifications = await this.notificationRepository.findByUserId(userId);
    const readNotifications = notifications.filter((n) => n.isRead);
    await Promise.all(readNotifications.map((n) => this.notificationRepository.delete(n.id)));
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
      inAppEnabled: true,
      notifyNewMessages: true,
      notifyReceivedFiles: true,
      notifyAssignedTasks: true,
      notifyTaskStatusChanges: true,
      notifyDeadlineReminders: true,
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
      relatedEntityId: notification.relatedEntityId,
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
      type: NotificationType.NEW_TASK,
      title: '',
      message: '',
      relatedEntityId: null,
      isRead: false,
      createdAt: new Date(),
      readAt: null,
    };
  }

  private applyFilters(
    notifications: Notification[],
    filters?: NotificationFilterDto,
  ): Notification[] {
    if (!filters) return notifications;

    return notifications.filter((n) => {
      if (filters.type && n.type !== filters.type) return false;
      if (filters.unreadOnly && n.isRead) return false;
      if (filters.relatedEntityId && n.relatedEntityId !== filters.relatedEntityId) return false;
      if (filters.startDate && n.createdAt < filters.startDate) return false;
      if (filters.endDate && n.createdAt > filters.endDate) return false;
      return true;
    });
  }

  private paginate(
    notifications: Notification[],
    filters?: NotificationFilterDto,
  ): {
    items: Notification[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } {
    const sorted = [...notifications].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const total = sorted.length;
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.max(1, filters?.limit ?? (total || 1));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = sorted.slice(start, start + limit);
    return {items, page, limit, total, totalPages};
  }
}
