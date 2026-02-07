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
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Persists a new message to the data store.
   * @param message - The message entity to save.
   * @returns The saved message.
   */
  save(message: Message): Promise<Message>;

  /**
   * Finds all messages belonging to a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of messages within the project, ordered by date.
   */
  findByProjectId(projectId: string): Promise<Message[]>;

  /**
   * Counts the number of unread messages for a user in a project.
   * @param projectId - The project's unique ID.
   * @param userId - The user's unique ID.
   * @returns The count of unread messages.
   */
  countUnreadByUser(projectId: string, userId: string): Promise<number>;
}
