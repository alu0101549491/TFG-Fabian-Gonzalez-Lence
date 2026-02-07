/**
 * @module domain/entities/message
 * @description Entity representing a message sent within a project's internal chat.
 * Supports bidirectional communication between admin and clients with
 * file attachments and read tracking.
 * @category Domain
 */

/**
 * Represents a message in the project's internal messaging system.
 * Messages support file attachments and per-user read status tracking.
 */
export class Message {
  private readonly id: string;
  private readonly projectId: string;
  private readonly senderId: string;
  private readonly content: string;
  private readonly sentAt: Date;
  private fileIds: string[];
  private readByUserIds: string[];

  constructor(
    id: string,
    projectId: string,
    senderId: string,
    content: string,
    sentAt: Date,
    fileIds: string[],
    readByUserIds: string[],
  ) {
    this.id = id;
    this.projectId = projectId;
    this.senderId = senderId;
    this.content = content;
    this.sentAt = sentAt;
    this.fileIds = fileIds;
    this.readByUserIds = readByUserIds;
  }

  /**
   * Marks the message as read by a specific user.
   * @param userId - The ID of the user who read the message.
   */
  markAsRead(userId: string): void {
    // TODO: Implement read marking logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if the message has been read by a specific user.
   * @param userId - The ID of the user to check.
   * @returns True if the user has read this message.
   */
  isReadBy(userId: string): boolean {
    // TODO: Implement read status check
    throw new Error('Method not implemented.');
  }

  /**
   * Attaches a file to this message.
   * @param fileId - The ID of the file to attach.
   */
  attachFile(fileId: string): void {
    // TODO: Implement file attachment logic
    throw new Error('Method not implemented.');
  }

  getId(): string {
    return this.id;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getSenderId(): string {
    return this.senderId;
  }

  getContent(): string {
    return this.content;
  }

  getSentAt(): Date {
    return this.sentAt;
  }

  getFileIds(): string[] {
    return [...this.fileIds];
  }

  getReadByUserIds(): string[] {
    return [...this.readByUserIds];
  }
}
