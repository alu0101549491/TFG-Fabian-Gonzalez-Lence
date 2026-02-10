/**
 * @module application/services/notification
 * @description Service implementation for notifications and WhatsApp integration.
 * @category Application
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
 * Placeholder interface for WhatsApp gateway.
 */
interface IWhatsAppGateway {
  sendMessage(phoneNumber: string, message: string): Promise<boolean>;
}

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
  // Rate limiting for WhatsApp: Store last send time per project-user pair
  private readonly whatsappRateLimits = new Map<string, Date>();
  private readonly WHATSAPP_RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly whatsAppGateway: IWhatsAppGateway
  ) {}

  /**
   * Sends a notification to a user.
   */
  async sendNotification(data: CreateNotificationData): Promise<NotificationDto> {
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

    // Send via WhatsApp if enabled and rate limit allows
    if (preferences.receiveWhatsApp && recipient.phoneNumber && data.relatedProjectId) {
      const canSendWhatsApp = this.checkWhatsAppRateLimit(
        data.recipientId,
        data.relatedProjectId
      );
      
      if (canSendWhatsApp) {
        await this.sendViaWhatsApp(recipient.phoneNumber, data.title, data.message);
        this.updateWhatsAppRateLimit(data.recipientId, data.relatedProjectId);
      }
    }

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
  async getUnreadNotifications(userId: string): Promise<NotificationDto[]> {
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
  async getUnreadCount(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    return await this.notificationRepository.countUnreadByUser(userId);
  }

  /**
   * Marks a notification as read.
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
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
  async markMultipleAsRead(notificationIds: string[], userId: string): Promise<void> {
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
  async markAllAsRead(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    await this.notificationRepository.markAllAsReadForUser(userId);
  }

  /**
   * Deletes a notification.
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
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
  async deleteAllRead(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    await this.notificationRepository.deleteReadByUser(userId);
  }

  /**
   * Gets notification preferences for a user.
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferencesDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    // TODO: Store preferences in database
    // For now, return default preferences
    return {
      receiveNotifications: true,
      receiveWhatsApp: false,
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
  async getNotificationById(notificationId: string, userId: string): Promise<NotificationDto> {
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
   * Sends a notification via WhatsApp.
   */
  private async sendViaWhatsApp(
    phoneNumber: string,
    title: string,
    message: string
  ): Promise<void> {
    try {
      const fullMessage = `${title}\n\n${message}`;
      await this.whatsAppGateway.sendMessage(phoneNumber, fullMessage);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      // Don't throw error - WhatsApp is optional
    }
  }

  /**
   * Checks if WhatsApp notification can be sent (rate limiting).
   */
  private checkWhatsAppRateLimit(userId: string, projectId: string): boolean {
    const key = `${userId}:${projectId}`;
    const lastSent = this.whatsappRateLimits.get(key);
    
    if (!lastSent) {
      return true;
    }

    const timeSinceLastSent = Date.now() - lastSent.getTime();
    return timeSinceLastSent >= this.WHATSAPP_RATE_LIMIT_MS;
  }

  /**
   * Updates the WhatsApp rate limit timestamp.
   */
  private updateWhatsAppRateLimit(userId: string, projectId: string): void {
    const key = `${userId}:${projectId}`;
    this.whatsappRateLimits.set(key, new Date());
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
