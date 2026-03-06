/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/entities/notification.ts
 * @desc Entity representing an in-app notification sent to a user.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {NotificationType} from '../enumerations/notification-type';
import {TaskStatus} from '../enumerations/task-status';

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
  /** When notification was created */
  createdAt?: Date;
}

/**
 * Represents a notification for a user about a system event.
 *
 * Notifications are intended for in-app display.
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

  // Business Logic Methods

  /**
   * Marks the notification as read.
   */
  public markAsRead(): void {
    this.isReadValue = true;
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
    };
  }
}
