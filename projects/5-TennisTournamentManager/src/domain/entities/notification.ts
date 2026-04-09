/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/notification.ts
 * @desc Entity representing a notification sent to a user. Dispatched via the Observer Pattern through multiple channels.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {NotificationType} from '../enumerations/notification-type';
import {NotificationChannel} from '../enumerations/notification-channel';

/**
 * Properties for creating a Notification entity.
 */
export interface NotificationProps {
  /** Unique identifier for the notification. */
  id: string;
  /** ID of the user receiving the notification. */
  userId: string;
  /** Type/category of the notification. */
  type: NotificationType;
  /** Delivery channel used. */
  channel: NotificationChannel;
  /** Notification title. */
  title: string;
  /** Notification body/message. */
  message: string;
  /** Whether the notification has been read by the recipient. */
  isRead?: boolean;
  /** Optional related entity ID (match, tournament, etc.). */
  referenceId?: string | null;
  /** Optional metadata for navigation and context. */
  metadata?: Record<string, unknown> | null;
  /** Creation timestamp. */
  createdAt?: Date;
  /** Timestamp when the notification was read. */
  readAt?: Date | null;
}

/**
 * Represents a notification sent to a user through a specific channel.
 *
 * Notifications are dispatched by the NotificationService (Observer Pattern)
 * across multiple channels: in-app, email, Telegram, and Web Push.
 */
export class Notification {
  public readonly id: string;
  public readonly userId: string;
  public readonly type: NotificationType;
  public readonly channel: NotificationChannel;
  public readonly title: string;
  public readonly message: string;
  public readonly isRead: boolean;
  public readonly referenceId: string | null;
  public readonly metadata: Record<string, unknown> | null;
  public readonly createdAt: Date;
  public readonly readAt: Date | null;

  constructor(props: NotificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.channel = props.channel;
    this.title = props.title;
    this.message = props.message;
    this.isRead = props.isRead ?? false;
    this.referenceId = props.referenceId ?? null;
    this.metadata = props.metadata ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.readAt = props.readAt ?? null;
  }

  /**
   * Sends this notification.
   */
  public send(): void {
    // Note: Actual sending should be done via NotificationService
    // in the application layer, which dispatches to the appropriate
    // channel adapter (email, Telegram, web push, in-app) based on
    // this.channel. This method validates the notification is sendable.
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('Notification must have a valid recipient user ID.');
    }
    
    if (!this.message || this.message.trim().length === 0) {
      throw new Error('Notification must have a message.');
    }
    
    // Validation only - real sending happens in application layer
  }
}
