/**
 * @module domain/entities/notification
 * @description Entity representing a notification sent to a user.
 * Supports both in-app and WhatsApp delivery channels.
 * @category Domain
 */

import {NotificationType} from '../enumerations/notification-type';
import {TaskStatus} from '../enumerations/task-status';
import {type User} from './user';

/**
 * Properties for creating a Notification entity.
 */
export interface NotificationProps {
  /** Unique identifier */
  id: string;
  /** Recipient user */
  userId: string;
  /** Category of notification */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification content */
  message: string;
  /** Related project/task/message ID */
  relatedEntityId?: string | null;
  /** Whether user has seen it */
  isRead?: boolean;
  /** Whether sent via WhatsApp */
  sentViaWhatsApp?: boolean;
  /** When notification was created */
  createdAt?: Date;
}

/**
 * Represents a notification for a user about a system event.
 *
 * Notifications support both in-app display and WhatsApp delivery
 * based on user preferences.
 *
 * @example
 * ```typescript
 * const notification = Notification.createForNewTask(
 *   'user_001',
 *   'Review plans',
 *   'task_001'
 * );
 *
 * notification.markAsRead();
 * ```
 */
export class Notification {
  public readonly id: string;
  public readonly userId: string;
  public readonly type: NotificationType;
  public readonly title: string;
  public readonly message: string;
  public readonly relatedEntityId: string | null;
  public readonly createdAt: Date;
  private isReadValue: boolean;
  private sentViaWhatsAppValue: boolean;

  /**
   * Creates a new Notification entity.
   *
   * @param props - Notification properties
   * @throws {Error} If required fields are missing
   */
  public constructor(props: NotificationProps) {
    this.validateProps(props);

    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.message = props.message;
    this.relatedEntityId = props.relatedEntityId ?? null;
    this.isReadValue = props.isRead ?? false;
    this.sentViaWhatsAppValue = props.sentViaWhatsApp ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Validates notification properties.
   */
  private validateProps(props: NotificationProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Notification ID is required');
    }
    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }
    if (!props.type) {
      throw new Error('Notification type is required');
    }
    if (!props.title || props.title.trim() === '') {
      throw new Error('Title is required');
    }
    if (!props.message || props.message.trim() === '') {
      throw new Error('Message is required');
    }
  }

  // Getters

  public get isRead(): boolean {
    return this.isReadValue;
  }

  public get sentViaWhatsApp(): boolean {
    return this.sentViaWhatsAppValue;
  }

  // Business Logic Methods

  /**
   * Marks the notification as read.
   */
  public markAsRead(): void {
    this.isReadValue = true;
  }

  /**
   * Records WhatsApp delivery.
   */
  public markAsSentViaWhatsApp(): void {
    this.sentViaWhatsAppValue = true;
  }

  /**
   * Determines if should send via WhatsApp.
   *
   * @param user - User receiving notification
   * @returns True if user has WhatsApp enabled
   */
  public shouldSendViaWhatsApp(user: User):  boolean {
    return user.whatsappEnabled && user.phone !== null;
  }

  // Factory Methods

  /**
   * Creates notification for new task.
   *
   * @param userId - Recipient
   * @param taskDescription - Task description
   * @param taskId - Task ID
   * @returns New Notification
   */
  public static createForNewTask(
    userId: string,
    taskDescription: string,
    taskId: string
  ): Notification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Notification({
      id,
      userId,
      type: NotificationType.NEW_TASK,
      title: 'New Task Assigned',
      message: `New task: ${taskDescription}`,
      relatedEntityId: taskId,
    });
  }

  /**
   * Creates notification for new message.
   */
  public static createForNewMessage(
    userId: string,
    projectName: string,
    projectId: string
  ): Notification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Notification({
      id,
      userId,
      type: NotificationType.NEW_MESSAGE,
      title: 'New Message',
      message: `New message in ${projectName}`,
      relatedEntityId: projectId,
    });
  }

  /**
   * Creates notification for task status change.
   */
  public static createForTaskStatusChange(
    userId: string,
    taskDescription: string,
    newStatus: TaskStatus,
    taskId: string
  ): Notification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Notification({
      id,
      userId,
      type: NotificationType.TASK_STATUS_CHANGE,
      title: 'Task Status Changed',
      message: `Task '${taskDescription}' changed to ${newStatus}`,
      relatedEntityId: taskId,
    });
  }

  /**
   * Creates notification for project assignment.
   */
  public static createForProjectAssigned(
    userId: string,
    projectCode: string,
    projectId: string
  ): Notification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Notification({
      id,
      userId,
      type: NotificationType.PROJECT_ASSIGNED,
      title: 'Project Assigned',
      message: `You've been assigned to project ${projectCode}`,
      relatedEntityId: projectId,
    });
  }

  /**
   * Serializes the notification entity.
   */
  public toJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      relatedEntityId: this.relatedEntityId,
      createdAt: this.createdAt.toISOString(),
      isRead: this.isReadValue,
      sentViaWhatsApp: this.sentViaWhatsAppValue,
    };
  }
}
