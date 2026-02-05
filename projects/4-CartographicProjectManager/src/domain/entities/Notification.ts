import {NotificationType} from '../enums/NotificationType';

/**
 * Notification entity for system notifications
 * Can be sent via web interface and optionally WhatsApp
 */
export class Notification {
  private id: string;
  private userId: string;
  private type: NotificationType;
  private title: string;
  private message: string;
  private relatedEntityId: string;
  private createdAt: Date;
  private isRead: boolean;
  private sentViaWhatsApp: boolean;

  constructor(
    id: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId: string,
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.relatedEntityId = relatedEntityId;
    this.createdAt = new Date();
    this.isRead = false;
    this.sentViaWhatsApp = false;
  }

  /**
   * Marks notification as read
   */
  public markAsRead(): void {
    // TODO: Implement mark as read logic
    throw new Error('Method not implemented.');
  }

  /**
   * Determines if notification should be sent via WhatsApp
   * @returns True if should send via WhatsApp
   */
  public shouldSendViaWhatsApp(): boolean {
    // TODO: Implement WhatsApp send determination logic
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getType(): NotificationType {
    return this.type;
  }

  public getIsRead(): boolean {
    return this.isRead;
  }

  public getSentViaWhatsApp(): boolean {
    return this.sentViaWhatsApp;
  }

  public setSentViaWhatsApp(sent: boolean): void {
    this.sentViaWhatsApp = sent;
  }
}