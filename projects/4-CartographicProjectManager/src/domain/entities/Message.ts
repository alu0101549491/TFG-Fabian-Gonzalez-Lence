/**
 * Message entity for project-specific internal messaging
 */
export class Message {
  private id: string;
  private projectId: string;
  private senderId: string;
  private content: string;
  private sentAt: Date;
  private fileIds: string[];
  private readByUserIds: string[];

  constructor(
    id: string,
    projectId: string,
    senderId: string,
    content: string,
  ) {
    this.id = id;
    this.projectId = projectId;
    this.senderId = senderId;
    this.content = content;
    this.sentAt = new Date();
    this.fileIds = [];
    this.readByUserIds = [];
  }

  /**
   * Marks message as read by a user
   * @param userId - ID of user who read the message
   */
  public markAsRead(userId: string): void {
    // TODO: Implement mark as read logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if message was read by specific user
   * @param userId - ID of user to check
   * @returns True if message was read by user
   */
  public isReadBy(userId: string): boolean {
    // TODO: Implement read check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Attaches a file to this message
   * @param fileId - ID of file to attach
   */
  public attachFile(fileId: string): void {
    // TODO: Implement attach file logic
    throw new Error('Method not implemented.');
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getSenderId(): string {
    return this.senderId;
  }

  public getContent(): string {
    return this.content;
  }

  public getSentAt(): Date {
    return this.sentAt;
  }

  public getFileIds(): string[] {
    return [...this.fileIds];
  }
}