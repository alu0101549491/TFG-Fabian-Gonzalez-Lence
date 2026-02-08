/**
 * @module domain/entities/notification
 * @description Entity representing a notification sent to a user.
 * Supports both in-app and WhatsApp delivery channels.
 * @category Domain
 */

import {NotificationType, NotificationTypeMessageTemplate} from '../enumerations/notification-type';
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
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _type: NotificationType;
  private readonly _title: string;
  private readonly _message: string;
  private readonly _relatedEntityId: string | null;
  private readonly _createdAt: Date;
  private _isRead: boolean;
  private _sentViaWhatsApp: boolean;

  /**
   * Creates a new Notification entity.
   *
   * @param props - Notification properties
   * @throws {Error} If required fields are missing
   */
  constructor(props: NotificationProps) {
    this.validateProps(props);

    this._id = props.id;
    this._userId = props.userId;
    this._type = props.type;
    this._title = props.title;
    this._message = props.message;
    this._relatedEntityId = props.relatedEntityId ?? null;
    this._isRead = props.isRead ?? false;
    this._sentViaWhatsApp = props.sentViaWhatsApp ?? false;
    this._createdAt = props.createdAt ?? new Date();
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

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get type(): NotificationType {
    return this._type;
  }

  get title(): string {
    return this._title;
  }

  get message(): string {
    return this._message;
  }

  get relatedEntityId(): string | null {
    return this._relatedEntityId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get isRead(): boolean {
    return this._isRead;
  }

  get sentViaWhatsApp(): boolean {
    return this._sentViaWhatsApp;
  }

  // Business Logic Methods

  /**
   * Marks the notification as read.
   */
  markAsRead(): void {
    this._isRead = true;
  }

  /**
   * Records WhatsApp delivery.
   */
  markAsSentViaWhatsApp(): void {
    this._sentViaWhatsApp = true;
  }

  /**
   * Determines if should send via WhatsApp.
   *
   * @param user - User receiving notification
   * @returns True if user has WhatsApp enabled
   */
  shouldSendViaWhatsApp(user: User):  boolean {
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
  static createForNewTask(
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
  static createForNewMessage(
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
  static createForTaskStatusChange(
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
  static createForProjectAssigned(
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
  toJSON(): object {
    return {
      id: this._id,
      userId: this._userId,
      type: this._type,
      title: this._title,
      message: this._message,
      relatedEntityId: this._relatedEntityId,
      createdAt: this._createdAt.toISOString(),
      isRead: this._isRead,
      sentViaWhatsApp: this._sentViaWhatsApp,
    };
  }
}
