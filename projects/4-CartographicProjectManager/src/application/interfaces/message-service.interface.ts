/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/interfaces/message-service.interface.ts
 * @desc Service interface for project-scoped internal messaging.
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
} from '../dto';

/**
 * Service interface for messaging operations.
 * Handles sending, retrieving, and managing messages within projects,
 * including read status tracking and system messages.
 */
export interface IMessageService {
  /**
   * Sends a new message within a project.
   * @param data - Message creation data
   * @param senderId - The unique identifier of the user sending the message
   * @returns The created message data transfer object
   * @throws {ValidationError} If message data is invalid
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If sender doesn't have permission
   */
  createMessage(data: CreateMessageDto, senderId: string): Promise<MessageDto>;

  /**
   * Retrieves a specific message by its ID.
   * @param messageId - The unique identifier of the message
   * @param userId - The unique identifier of the requesting user
   * @returns The message data transfer object
   * @throws {NotFoundError} If message doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getMessageById(messageId: string, userId: string): Promise<MessageDto>;

  /**
   * Retrieves all messages for a specific project with optional filtering.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the requesting user
   * @param filters - Optional filters for message list (pagination, date range)
   * @returns Paginated list of messages ordered chronologically
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getMessagesByProject(
    projectId: string,
    userId: string,
    filters?: MessageFilterDto,
  ): Promise<MessageListResponseDto>;

  /**
   * Retrieves the most recent messages for a project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the requesting user
   * @param limit - Maximum number of messages to retrieve
   * @returns Array of recent messages ordered by creation date (newest first)
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getMessagesByUser(
    userId: string,
    filters?: MessageFilterDto,
  ): Promise<MessageListResponseDto>;

  /**
   * Marks a specific message as read by a user.
   * @param messageId - The unique identifier of the message
   * @param userId - The unique identifier of the user marking it as read
   * @returns Promise that resolves when message is marked as read
   * @throws {NotFoundError} If message doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  markMessagesAsRead(data: MarkMessagesReadDto, userId: string): Promise<void>;

  /**
   * Marks all messages in a project as read for a user.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the user
   * @returns Promise that resolves when all messages are marked as read
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  markAllMessagesAsRead(projectId: string, userId: string): Promise<void>;

  /**
   * Gets the count of unread messages for a user in a specific project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the user
   * @returns The number of unread messages
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getUnreadCount(projectId: string, userId: string): Promise<number>;

  /**
   * Gets unread message counts for all projects accessible by a user.
   * @param userId - The unique identifier of the user
   * @returns Array of unread counts by project
   * @throws {NotFoundError} If user doesn't exist
   */
  getUnreadCountsByUser(userId: string): Promise<UnreadCountsDto>;

  /**
   * Deletes a message (soft delete, preserves for history).
   * @param messageId - The unique identifier of the message
   * @param userId - The unique identifier of the user performing the deletion
   * @returns Promise that resolves when message is deleted
   * @throws {NotFoundError} If message doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   */
  deleteMessage(messageId: string, userId: string): Promise<void>;

  /**
   * Creates a system-generated message in a project.
   * @param projectId - The unique identifier of the project
   * @param content - The content of the system message
   * @returns The created system message data transfer object
   * @throws {NotFoundError} If project doesn't exist
   */
  sendSystemMessage(projectId: string, content: string): Promise<MessageDto>;
}
