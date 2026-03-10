/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/services/message.service.ts
 * @desc Service implementation for project messaging.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type CreateMessageDto,
  type MessageDto,
  type MarkMessagesReadDto,
  type MessageFilterDto,
  type MessageListResponseDto,
  type UnreadCountsDto,
  ValidationErrorCode,
  createError,
} from '../dto';
import {IMessageService} from '../interfaces/message-service.interface';
import {
  type IMessageRepository,
  type IProjectRepository,
  type IUserRepository,
} from '../../domain/repositories';
import {INotificationService} from '../interfaces/notification-service.interface';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {UnauthorizedError, NotFoundError, ValidationError} from './common/errors';
import {generateId, truncate} from './common/utils';
import {Message} from '../../domain/entities/message';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Implementation of message management operations.
 */
export class MessageService implements IMessageService {
  private readonly MAX_CONTENT_LENGTH = 5000;
  private readonly SYSTEM_SENDER_ID = 'SYSTEM';

  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationService: INotificationService,
    private readonly authorizationService: IAuthorizationService
  ) {}

  /**
   * Creates and sends a new message in a project.
   */
  public async createMessage(data: CreateMessageDto, senderId: string): Promise<MessageDto> {
    // Validate content length
    if (data.content.length > this.MAX_CONTENT_LENGTH) {
      throw new ValidationError('Message content too long', [
        createError(
          'content',
          `Message must be ${this.MAX_CONTENT_LENGTH} characters or less`,
          ValidationErrorCode.TOO_LONG,
        ),
      ]);
    }

    // Check permissions
    const canSend = await this.authorizationService.canSendMessage(senderId, data.projectId);
    if (!canSend) {
      throw new UnauthorizedError('You do not have permission to send messages in this project');
    }

    // Verify project exists
    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      throw new NotFoundError(`Project ${data.projectId} not found`);
    }

    const sender = await this.userRepository.findById(senderId);
    if (!sender) {
      throw new NotFoundError(`User ${senderId} not found`);
    }

    // Create message
    const message = new Message({
      id: generateId(),
      projectId: data.projectId,
      senderId,
      senderName: sender.username,
      senderRole: sender.role,
      content: data.content,
      type: 'NORMAL',
      fileIds: data.fileIds ?? [],
      readByUserIds: [senderId],
      sentAt: new Date(),
    });

    const saved = await this.messageRepository.save(message);

    // Derive participants (client + special users)
    const participantIds = Array.from(
      new Set([project.clientId, ...project.specialUserIds]),
    );
    
    // Notify all participants except sender
    for (const participantId of participantIds) {
      if (participantId !== senderId) {
        await this.notificationService.sendNotification({
          recipientId: participantId,
          type: NotificationType.NEW_MESSAGE,
          title: 'New Message',
          message: `New message in project ${project.name}: ${truncate(data.content, 50)}`,
          relatedProjectId: data.projectId,
        });
      }
    }

    return await this.mapToDto(saved, senderId);
  }

  /**
   * Retrieves messages for a project with optional filtering.
   */
  async getMessagesByProject(
    projectId: string,
    userId: string,
    filters?: MessageFilterDto
  ): Promise<MessageListResponseDto> {
    const canAccess = await this.authorizationService.canAccessMessages(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access messages in this project');
    }

    const allMessages = await this.messageRepository.find({projectId});
    const filtered = this.applyFilters(allMessages, userId, filters);
    const {items, page, limit, total, totalPages} = this.paginate(filtered, filters);
    const unreadCount = await this.messageRepository.count({
      projectId,
      unreadForUserId: userId,
    });

    const messageDtos = await Promise.all(items.map((m) => this.mapToDto(m, userId)));
    return {messages: messageDtos, total, page, limit, totalPages, unreadCount};
  }

  /**
   * Retrieves all messages for a user across all accessible projects.
   */
  async getMessagesByUser(
    userId: string,
    filters?: MessageFilterDto
  ): Promise<MessageListResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const messages = filters?.projectId
      ? await this.messageRepository.find({projectId: filters.projectId, senderId: userId})
      : await this.messageRepository.find({senderId: userId});

    const filtered = this.applyFilters(messages, userId, filters);
    const {items, page, limit, total, totalPages} = this.paginate(filtered, filters);
    const messageDtos = await Promise.all(items.map((m) => this.mapToDto(m, userId)));

    return {
      messages: messageDtos,
      total,
      page,
      limit,
      totalPages,
      unreadCount: filtered.filter((m) => !m.isReadBy(userId)).length,
    };
  }

  /**
   * Marks specific messages as read by a user.
   */
  public async markMessagesAsRead(data: MarkMessagesReadDto, userId: string): Promise<void> {
    const canAccess = await this.authorizationService.canAccessMessages(userId, data.projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access messages in this project');
    }

    if (!data.messageIds || data.messageIds.length === 0) {
      await this.messageRepository.markAsReadByProjectAndUser(data.projectId, userId);
      return;
    }

    for (const messageId of data.messageIds) {
      const message = await this.messageRepository.findById(messageId);
      if (!message) continue;
      if (message.projectId !== data.projectId) continue;

      message.markAsRead(userId);
      await this.messageRepository.update(message);
    }
  }

  /**
   * Marks all messages in a project as read for a user.
   */
  public async markAllMessagesAsRead(projectId: string, userId: string): Promise<void> {
    const canAccess = await this.authorizationService.canAccessMessages(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access messages in this project');
    }

    await this.messageRepository.markAsReadByProjectAndUser(projectId, userId);
  }

  /**
   * Gets the count of unread messages in a project for a user.
   */
  public async getUnreadCount(projectId: string, userId: string): Promise<number> {
    const canAccess = await this.authorizationService.canAccessMessages(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access messages in this project');
    }

    return await this.messageRepository.count({projectId, unreadForUserId: userId});
  }

  /**
   * Gets unread message counts for all projects accessible by a user.
   */
  async getUnreadCountsByUser(userId: string): Promise<UnreadCountsDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    // TODO: Implement "counts per project" once we have a project listing query.
    // For now, return a placeholder.
    return {projectId: '', projectCode: '', unreadCount: 0};
  }

  /**
   * Deletes a message (admin or sender only).
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError(`Message ${messageId} not found`);
    }

    // Check if user is admin or sender
    const isAdmin = await this.authorizationService.isAdmin(userId);
    if (!isAdmin && message.senderId !== userId) {
      throw new UnauthorizedError('You can only delete your own messages');
    }

    await this.messageRepository.delete(messageId);
  }

  /**
   * Retrieves a specific message by ID.
   */
  async getMessageById(messageId: string, userId: string): Promise<MessageDto> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError(`Message ${messageId} not found`);
    }

    const canAccess = await this.authorizationService.canAccessMessages(userId, message.projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access this message');
    }

    return await this.mapToDto(message, userId);
  }

  /**
   * Sends a system message to a project.
   */
  async sendSystemMessage(projectId: string, content: string): Promise<MessageDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    const message = Message.createSystemMessage(projectId, content);
    const saved = await this.messageRepository.save(message);
    return await this.mapToDto(saved, this.SYSTEM_SENDER_ID);
  }

  /**
   * Maps message entity to DTO.
   */
  private async mapToDto(message: Message, currentUserId: string): Promise<MessageDto> {
    const sender = message.senderId === this.SYSTEM_SENDER_ID
      ? null
      : await this.userRepository.findById(message.senderId);

    const senderName = sender?.username ?? message.senderName ?? 'System';
    const senderRole = sender?.role ?? message.senderRole;

    return {
      id: message.id,
      projectId: message.projectId,
      senderId: message.senderId,
      senderName,
      senderRole,
      content: message.content,
      sentAt: message.sentAt,
      fileIds: message.fileIds,
      files: [],
      readByUserIds: message.readByUserIds,
      isRead: message.isReadBy(currentUserId),
      isSystemMessage: message.isSystemMessage(),
      type: message.type,
    };
  }

  private applyFilters(messages: Message[], userId: string, filters?: MessageFilterDto): Message[] {
    if (!filters) return messages;

    return messages.filter((m) => {
      if (filters.senderId && m.senderId !== filters.senderId) return false;
      if (filters.includeSystemMessages === false && m.isSystemMessage()) return false;
      if (filters.unreadOnly && m.isReadBy(userId)) return false;
      if (filters.startDate && m.sentAt < filters.startDate) return false;
      if (filters.endDate && m.sentAt > filters.endDate) return false;
      return true;
    });
  }

  private paginate(messages: Message[], filters?: MessageFilterDto): {
    items: Message[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } {
    const sorted = [...messages].sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    const total = sorted.length;
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.max(1, filters?.limit ?? (total || 1));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = sorted.slice(start, start + limit);
    return {items, page, limit, total, totalPages};
  }
}
