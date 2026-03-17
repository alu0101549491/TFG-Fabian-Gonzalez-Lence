/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/notification.service.ts
 * @desc Notification service implementation for multi-channel notification management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {INotificationService} from '../interfaces/notification-service.interface';
import {SendNotificationDto, NotificationDto} from '../dto';
import {NotificationRepositoryImpl} from '@infrastructure/repositories/notification.repository';
import {Notification} from '@domain/entities/notification';
import {generateId} from '@shared/utils';

/**
 * Notification service implementation.
 * Handles notification dispatch, retrieval, and read status management.
 * Implements the Observer Pattern for multi-channel notifications.
 */
@Injectable({providedIn: 'root'})
export class NotificationService implements INotificationService {
  /**
   * Creates a new NotificationService instance.
   *
   * @param notificationRepository - Notification repository for data access
   */
  public constructor(
    private readonly notificationRepository: NotificationRepositoryImpl,
    // TODO: inject NotificationChannelFactory
  ) {}

  /**
   * Sends a notification to one or more recipients.
   *
   * @param data - Notification data
   */
  public async sendNotification(data: SendNotificationDto): Promise<void> {
    // Validate input
    if (!data.userId || data.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    if (!data.type) {
      throw new Error('Notification type is required');
    }
    
    if (!data.channels || data.channels.length === 0) {
      throw new Error('At least one notification channel is required');
    }
    
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Notification title is required');
    }
    
    if (!data.message || data.message.trim().length === 0) {
      throw new Error('Notification message is required');
    }
    
    // Create notification for each channel
    for (const channel of data.channels) {
      const notification = new Notification({
        id: generateId(),
        userId: data.userId,
        type: data.type,
        channel,
        title: data.title,
        message: data.message,
        referenceId: data.referenceId ?? null,
      });
      
      // Validate notification can be sent
      notification.send();
      
      // Save notification
      await this.notificationRepository.save(notification);
      
      // In real implementation, dispatch to appropriate channel adapter
      // (email, Telegram, web push, in-app) based on channel type
      // await this.notificationChannelFactory.getChannel(channel).send(notification);
    }
  }

  /**
   * Sends bulk notifications to multiple recipients.
   *
   * @param data - Array of notification data
   */
  public async sendBulkNotifications(data: SendNotificationDto[]): Promise<void> {
    // Validate input
    if (!data || data.length === 0) {
      throw new Error('At least one notification is required');
    }
    
    // Send each notification
    for (const notification of data) {
      await this.sendNotification(notification);
    }
  }

  /**
   * Retrieves all notifications for a recipient.
   *
   * @param recipientId - ID of the recipient
   * @returns List of notifications
   */
  public async getByRecipient(recipientId: string): Promise<NotificationDto[]> {
    // Validate input
    if (!recipientId || recipientId.trim().length === 0) {
      throw new Error('Recipient ID is required');
    }
    
    const notifications = await this.notificationRepository.findByUser(recipientId);
    return notifications.map(n => this.mapNotificationToDto(n));
  }

  /**
   * Retrieves unread notifications for a recipient.
   *
   * @param recipientId - ID of the recipient
   * @returns List of unread notifications
   */
  public async getUnread(recipientId: string): Promise<NotificationDto[]> {
    // Validate input
    if (!recipientId || recipientId.trim().length === 0) {
      throw new Error('Recipient ID is required');
    }
    
    const notifications = await this.notificationRepository.findUnread(recipientId);
    return notifications.map(n => this.mapNotificationToDto(n));
  }

  /**
   * Marks a notification as read.
   *
   * @param notificationId - ID of the notification
   * @param userId - ID of the user marking as read
   */
  public async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Validate input
    if (!notificationId || notificationId.trim().length === 0) {
      throw new Error('Notification ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if notification exists
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    // Check authorization
    if (notification.userId !== userId) {
      throw new Error('User is not authorized to mark this notification as read');
    }
    
    // Mark as read
    const readNotification = new Notification({
      ...notification,
      isRead: true,
      readAt: new Date(),
    });
    
    await this.notificationRepository.update(readNotification);
  }

  /**
   * Marks all notifications as read for a user.
   *
   * @param userId - ID of the user
   */
  public async markAllAsRead(userId: string): Promise<void> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Get all unread notifications
    const unreadNotifications = await this.notificationRepository.findUnread(userId);
    
    // Mark each as read
    for (const notification of unreadNotifications) {
      await this.markAsRead(notification.id, userId);
    }
  }

  /**
   * Gets the count of unread notifications for a user.
   *
   * @param userId - ID of the user
   * @returns Number of unread notifications
   */
  public async getUnreadCount(userId: string): Promise<number> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    const unreadNotifications = await this.notificationRepository.findUnread(userId);
    return unreadNotifications.length;
  }

  /**
   * Maps a Notification entity to NotificationDto.
   *
   * @param notification - Notification entity
   * @returns Notification DTO
   */
  private mapNotificationToDto(notification: Notification): NotificationDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      channel: notification.channel,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      referenceId: notification.referenceId,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }
}
