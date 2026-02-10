/**
 * @module application/services/message
 * @description Service implementation for project messaging.
 * @category Application
 */

import {
  type CreateMessageDto,
  type MessageDto,
  type MarkMessagesReadDto,
  type MessageFilterDto,
  type MessageListResponseDto,
  type UnreadCountsDto,
  ValidationResultDto,
  validResult,
  invalidResult,
  createError,
} from '../dto';
import {IMessageService} from '../interfaces/message-service.interface';
import {
  type IMessageRepository,
  type IProjectRepository,
  type IUserRepository,
  type IMessageReadRepository,
} from '../../domain/repositories';
import {INotificationService} from '../interfaces/notification-service.interface';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {UnauthorizedError, NotFoundError, ValidationError} from './common/errors';
import {generateId, truncate} from './common/utils';
import {Message} from '../../domain/entities/message';
import {MessageRead} from '../../domain/entities/message-read';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Implementation of message management operations.
 */
export class MessageService implements IMessageService {
  private readonly MAX_CONTENT_LENGTH = 5000;

  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository,
    private readonly messageReadRepository: IMessageReadRepository,
    private readonly notificationService: INotificationService,
    private readonly authorizationService: IAuthorizationService
  ) {}

  /**
   * Creates and sends a new message in a project.
   */
  async createMessage(data: CreateMessageDto, senderId: string): Promise<MessageDto> {
    // Validate content length
    if (data.content.length > this.MAX_CONTENT_LENGTH) {
      throw new ValidationError('Message content too long', [
        createError('content', `Message must be ${this.MAX_CONTENT_LENGTH} characters or less`, 'TOO_LONG'),
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

    // Create message
    const message = new Message({
      id: generateId(),
      projectId: data.projectId,
      senderId,
      content: data.content,
      isSystemMessage: false,
      sentAt: new Date(),
    });

    await this.messageRepository.save(message);

    // Mark as read by sender automatically
    const senderRead = new MessageRead({
      id: generateId(),
      messageId: message.id,
      userId: senderId,
      readAt: new Date(),
    });
    await this.messageReadRepository.save(senderRead);

    // Get all project participants
    const participants = await this.projectRepository.getParticipants(data.projectId);
    
    // Notify all participants except sender
    for (const participant of participants) {
      if (participant.userId !== senderId) {
        await this.notificationService.sendNotification({
          recipientId: participant.userId,
          type: NotificationType.NEW_MESSAGE,
          title: 'New Message',
          message: `New message in project ${project.name}: ${truncate(data.content, 50)}`,
          relatedProjectId: data.projectId,
        });
      }
    }

    return this.mapToDto(message);
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

    const messages = await this.messageRepository.findByProject(projectId, filters);
    const messageDtos = await Promise.all(
      messages.map(async m => {
        const readStatus = await this.messageReadRepository.findByMessageAndUser(m.id, userId);
        return {
          ...this.mapToDto(m),
          isRead: readStatus !== null,
        };
      })
    );

    return {
      messages: messageDtos,
      total: messageDtos.length,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || messageDtos.length,
    };
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

    // Get all accessible projects
    // TODO: Implement efficient query
    const messages = await this.messageRepository.findByUser(userId, filters);
    const messageDtos = messages.map(m => this.mapToDto(m));

    return {
      messages: messageDtos,
      total: messageDtos.length,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || messageDtos.length,
    };
  }

  /**
   * Marks specific messages as read by a user.
   */
  async markMessagesAsRead(data: MarkMessagesReadDto, userId: string): Promise<void> {
    for (const messageId of data.messageIds) {
      // Check if message exists
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        continue; // Skip non-existent messages
      }

      // Check if already read
      const existing = await this.messageReadRepository.findByMessageAndUser(messageId, userId);
      if (existing) {
        continue; // Already marked as read
      }

      // Mark as read
      const messageRead = new MessageRead({
        id: generateId(),
        messageId,
        userId,
        readAt: new Date(),
      });
      await this.messageReadRepository.save(messageRead);
    }
  }

  /**
   * Marks all messages in a project as read for a user.
   */
  async markAllMessagesAsRead(projectId: string, userId: string): Promise<void> {
    const canAccess = await this.authorizationService.canAccessMessages(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access messages in this project');
    }

    const messages = await this.messageRepository.findByProject(projectId);
    
    for (const message of messages) {
      const existing = await this.messageReadRepository.findByMessageAndUser(message.id, userId);
      if (!existing) {
        const messageRead = new MessageRead({
          id: generateId(),
          messageId: message.id,
          userId,
          readAt: new Date(),
        });
        await this.messageReadRepository.save(messageRead);
      }
    }
  }

  /**
   * Gets the count of unread messages in a project for a user.
   */
  async getUnreadCount(projectId: string, userId: string): Promise<number> {
    const canAccess = await this.authorizationService.canAccessMessages(userId, projectId);
    if (!canAccess) {
      throw new UnauthorizedError('You do not have permission to access messages in this project');
    }

    return await this.messageRepository.countUnreadByProjectAndUser(projectId, userId);
  }

  /**
   * Gets unread message counts for all projects accessible by a user.
   */
  async getUnreadCountsByUser(userId: string): Promise<UnreadCountsDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    // Get all projects user has access to
    // TODO: Implement efficient query
    const counts: Record<string, number> = {};
    
    return {
      projectCounts: counts,
      totalUnread: Object.values(counts).reduce((sum, count) => sum + count, 0),
    };
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

    return this.mapToDto(message);
  }

  /**
   * Sends a system message to a project.
   */
  async sendSystemMessage(projectId: string, content: string): Promise<MessageDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    const message = new Message({
      id: generateId(),
      projectId,
      senderId: null, // System message has no sender
      content,
      isSystemMessage: true,
      sentAt: new Date(),
    });

    await this.messageRepository.save(message);

    return this.mapToDto(message);
  }

  /**
   * Maps message entity to DTO.
   */
  private mapToDto(message: Message): MessageDto {
    return {
      id: message.id,
      projectId: message.projectId,
      senderId: message.senderId || undefined,
      content: message.content,
      isSystemMessage: message.isSystemMessage,
      sentAt: message.sentAt,
    };
  }
}
