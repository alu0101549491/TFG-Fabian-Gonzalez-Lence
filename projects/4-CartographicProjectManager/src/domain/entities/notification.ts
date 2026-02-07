/**
 * @module domain/entities/notification
 * @description Entity representing a notification sent to a user.
 * Supports both in-app and WhatsApp delivery channels.
 * @category Domain
 */

import {NotificationType} from '../enumerations/notification-type';

/**
 * Represents a notification for a user about an event in the system.
 * Notifications can be delivered in-app and optionally via WhatsApp.
 */
export class Notification {
  private readonly id: string;
  private readonly userId: string;
  private readonly type: NotificationType;
  private readonly title: string;
  private readonly message: string;
  private readonly relatedEntityId: string;
  private readonly createdAt: Date;
  private isRead: boolean;
  private sentViaWhatsApp: boolean;

  constructor(
    id: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId: string,
    createdAt: Date,
    isRead: boolean,
    sentViaWhatsApp: boolean,
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.relatedEntityId = relatedEntityId;
    this.createdAt = createdAt;
    this.isRead = isRead;
    this.sentViaWhatsApp = sentViaWhatsApp;
  }

  /**
   * Marks the notification as read.
   */
  markAsRead(): void {
    // TODO: Implement read marking logic
    throw new Error('Method not implemented.');
  }

  /**
   * Determines whether this notification should also be sent via WhatsApp.
   * @returns True if WhatsApp delivery is appropriate.
   */
  shouldSendViaWhatsApp(): boolean {
    // TODO: Implement WhatsApp delivery decision logic
    throw new Error('Method not implemented.');
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getType(): NotificationType {
    return this.type;
  }

  getTitle(): string {
    return this.title;
  }

  getMessage(): string {
    return this.message;
  }

  getRelatedEntityId(): string {
    return this.relatedEntityId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getIsRead(): boolean {
    return this.isRead;
  }

  getSentViaWhatsApp(): boolean {
    return this.sentViaWhatsApp;
  }
}
