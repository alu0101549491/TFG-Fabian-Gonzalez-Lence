/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/entities/message.ts
 * @desc Entity representing a message sent within a project's internal chat. Supports bidirectional communication between admin and clients with file attachments and read tracking.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Message type literal.
 */
export type MessageType = 'NORMAL' | 'SYSTEM';

/**
 * Properties for creating a Message entity.
 */
export interface MessageProps {
  /** Unique identifier */
  id: string;
  /** Project the message belongs to */
  projectId: string;
  /** User who sent the message */
  senderId: string;
  /** Sender name (denormalized for display) */
  senderName?: string;
  /** Sender role (denormalized for display) */
  senderRole?: string;
  /** Message body */
  content: string;
  /** Message type */
  type?: MessageType;
  /** Attached file IDs */
  fileIds?: string[];
  /** Users who have read the message */
  readByUserIds?: string[];
  /** When message was sent */
  sentAt?: Date;
}

/**
 * Represents a message in the project's internal messaging system.
 *
 * Messages enable communication between project participants with
 * file attachment support and read tracking per user.
 *
 * @example
 * ```typescript
 * const message = new Message({
 *   id: 'msg_001',
 *   projectId: 'proj_001',
 *   senderId: 'user_001',
 *   content: 'Please review the attached plans'
 * });
 *
 * message.attachFile('file_001');
 * message.markAsRead('user_002');
 * ```
 */
export class Message {
  public readonly id: string;
  public readonly projectId: string;
  public readonly senderId: string;
  public readonly senderName: string;
  public readonly senderRole: string;
  private contentValue: string;
  public readonly type: MessageType;
  public readonly sentAt: Date;
  private fileIdsValue: string[];
  private readByUserIdsValue: string[];

  /**
   * Creates a new Message entity.
   *
   * @param props - Message properties
   * @throws {Error} If required fields are missing
   */
  public constructor(props: MessageProps) {
    this.validateProps(props);

    this.id = props.id;
    this.projectId = props.projectId;
    this.senderId = props.senderId;
    this.senderName = props.senderName ?? 'Unknown User';
    this.senderRole = props.senderRole ?? 'CLIENT';
    this.contentValue = props.content;
    this.type = props.type ?? 'NORMAL';
    this.fileIdsValue = props.fileIds ?? [];
    this.readByUserIdsValue = props.readByUserIds ?? [];
    this.sentAt = props.sentAt ?? new Date();
  }

  /**
   * Validates message properties.
   */
  private validateProps(props: MessageProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Message ID is required');
    }
    if (!props.projectId || props.projectId.trim() === '') {
      throw new Error('Project ID is required');
    }
    if (!props.senderId || props.senderId.trim() === '') {
      throw new Error('Sender ID is required');
    }
    if (!props.content || props.content.trim() === '') {
      throw new Error('Message content is required');
    }
  }

  // Getters

  public get content(): string {
    return this.contentValue;
  }

  public set content(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Content cannot be empty');
    }
    this.contentValue = value;
  }

  public get fileIds(): string[] {
    return [...this.fileIdsValue];
  }

  public get readByUserIds(): string[] {
    return [...this.readByUserIdsValue];
  }

  // Business Logic Methods

  /**
   * Marks the message as read by a user.
   *
   * @param userId - User who read the message
   * @throws {Error} If userId already in read list
   */
  public markAsRead(userId: string): void {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (this.readByUserIdsValue.includes(userId)) {
      // Already marked as read, silently return
      return;
    }

    this.readByUserIdsValue.push(userId);
  }

  /**
   * Checks if user has read the message.
   *
   * @param userId - User ID to check
   * @returns True if user has read the message
   */
  public isReadBy(userId: string): boolean {
    return this.readByUserIdsValue.includes(userId);
  }

  /**
   * Attaches a file to the message.
   *
   * @param fileId - File ID to attach
   * @throws {Error} If file already attached
   */
  public attachFile(fileId: string): void {
    if (!fileId || fileId.trim() === '') {
      throw new Error('File ID is required');
    }

    if (this.fileIdsValue.includes(fileId)) {
      throw new Error('File already attached to this message');
    }

    this.fileIdsValue.push(fileId);
  }

  /**
   * Checks if message is system-generated.
   *
   * @returns True if message type is SYSTEM
   */
  public isSystemMessage(): boolean {
    return this.type === 'SYSTEM';
  }

  /**
   * Factory method for creating system messages.
   *
   * @param projectId - Project ID
   * @param content - Message content
   * @returns New Message instance
   */
  public static createSystemMessage(projectId: string, content: string): Message {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Message({
      id,
      projectId,
      senderId: 'SYSTEM',
      content,
      type: 'SYSTEM',
    });
  }

  /**
   * Serializes the message entity.
   *
   * @returns Plain object representation
   */
  public toJSON(): object {
    return {
      id: this.id,
      projectId: this.projectId,
      senderId: this.senderId,
      content: this.contentValue,
      type: this.type,
      sentAt: this.sentAt.toISOString(),
      fileIds: [...this.fileIdsValue],
      readByUserIds: [...this.readByUserIdsValue],
    };
  }
}
