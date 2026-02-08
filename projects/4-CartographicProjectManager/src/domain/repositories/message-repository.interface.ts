/**
 * @module domain/repositories/message-repository
 * @description Repository interface for Message entity persistence operations.
 * @category Domain
 */

import {Message} from '../entities/message';

/**
 * Abstraction for Message data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface IMessageRepository {
  /**
   * Finds a message by its unique identifier.
   * @param id - The message's unique ID.
   * @returns The found message or null if not found.
   * @throws Error if database connection fails.
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Persists a new message to the data store.
   * @param message - The message entity to save.
   * @returns The saved message with generated fields populated.
   * @throws Error if database operation fails.
   */
  save(message: Message): Promise<Message>;

  /**
   * Updates an existing message in the data store.
   * @param message - The message entity with updated data.
   * @returns The updated message.
   * @throws Error if message doesn't exist or database operation fails.
   */
  update(message: Message): Promise<Message>;

  /**
   * Deletes a message from the data store.
   * @param id - The ID of the message to delete.
   * @throws Error if message doesn't exist or database operation fails.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all messages belonging to a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of messages within the project ordered by sentAt (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectId(projectId: string): Promise<Message[]>;

  /**
   * Finds messages in a project with pagination.
   * @param projectId - The project's unique ID.
   * @param limit - Maximum number of messages to return.
   * @param offset - Number of messages to skip.
   * @returns Array of paginated messages ordered by sentAt (empty if none found).
   * @throws Error if database connection fails or invalid pagination parameters.
   */
  findByProjectIdPaginated(
    projectId: string,
    limit: number,
    offset: number,
  ): Promise<Message[]>;

  /**
   * Finds all messages sent by a specific user.
   * @param senderId - The sender's unique ID.
   * @returns Array of messages sent by the user ordered by sentAt (empty if none found).
   * @throws Error if database connection fails.
   */
  findBySenderId(senderId: string): Promise<Message[]>;

  /**
   * Finds all messages in a project sent by a specific user.
   * @param projectId - The project's unique ID.
   * @param senderId - The sender's unique ID.
   * @returns Array of messages matching the criteria ordered by sentAt (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectIdAndSenderId(
    projectId: string,
    senderId: string,
  ): Promise<Message[]>;

  /**
   * Counts the total number of messages in a project.
   * @param projectId - The project's unique ID.
   * @returns The count of messages in the project.
   * @throws Error if database connection fails.
   */
  countByProjectId(projectId: string): Promise<number>;

  /**
   * Counts the number of unread messages for a user in a project.
   * @param projectId - The project's unique ID.
   * @param userId - The user's unique ID.
   * @returns The count of unread messages.
   * @throws Error if database connection fails.
   */
  countUnreadByProjectAndUser(
    projectId: string,
    userId: string,
  ): Promise<number>;

  /**
   * Finds all unread messages for a user in a project.
   * @param projectId - The project's unique ID.
   * @param userId - The user's unique ID.
   * @returns Array of unread messages ordered by sentAt (empty if none found).
   * @throws Error if database connection fails.
   */
  findUnreadByProjectAndUser(
    projectId: string,
    userId: string,
  ): Promise<Message[]>;

  /**
   * Marks messages as read for a user in a project.
   * @param projectId - The project's unique ID.
   * @param userId - The user's unique ID.
   * @throws Error if database operation fails.
   */
  markAsReadByProjectAndUser(
    projectId: string,
    userId: string,
  ): Promise<void>;

  /**
   * Deletes all messages in a project (cascade delete).
   * @param projectId - The project's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByProjectId(projectId: string): Promise<void>;

  /**
   * Finds the most recent messages in a project.
   * @param projectId - The project's unique ID.
   * @param limit - Maximum number of messages to return.
   * @returns Array of the latest messages ordered by sentAt descending (empty if none found).
   * @throws Error if database connection fails or invalid limit.
   */
  findLatestByProjectId(projectId: string, limit: number): Promise<Message[]>;
}
