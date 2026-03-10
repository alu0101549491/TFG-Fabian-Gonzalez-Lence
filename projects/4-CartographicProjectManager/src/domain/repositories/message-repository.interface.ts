/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/repositories/message-repository.interface.ts
 * @desc Repository interface for Message entity persistence operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Message} from '../entities/message';

/** Query parameters for message lookups. */
export interface MessageFindQuery {
  /** Filter messages by project id. */
  projectId?: string;
  /** Filter messages by sender id. */
  senderId?: string;
  /** If provided with projectId, returns only messages unread by the user. */
  unreadForUserId?: string;
  /** Pagination: maximum number of records to return. */
  limit?: number;
  /** Pagination: number of records to skip. */
  offset?: number;
  /** If true, returns the latest messages (backend-specific optimization). */
  latest?: boolean;
}

/** Query parameters for message counts. */
export interface MessageCountQuery {
  /** Count messages within a project. */
  projectId: string;
  /** If provided, counts unread messages for the user within the project. */
  unreadForUserId?: string;
}

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
   * Finds messages matching the provided query.
   *
   * @param query - Query object.
   * @returns Array of messages matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  find(query: MessageFindQuery): Promise<Message[]>;

  /**
   * Counts messages matching the provided query.
   *
   * @param query - Query object.
   * @returns Count of messages.
   * @throws Error if database connection fails.
   */
  count(query: MessageCountQuery): Promise<number>;

  /**
   * Marks messages as read for a user in a project.
   *
   * @param projectId - The project's unique ID.
   * @param userId - The user's unique ID.
   * @throws Error if database operation fails.
   */
  markAsReadByProjectAndUser(projectId: string, userId: string): Promise<void>;

  /**
   * Deletes all messages in a project (cascade delete).
   * @param projectId - The project's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByProjectId(projectId: string): Promise<void>;

  // Intentionally no additional ad-hoc query methods. Use `find`/`count`.
}
