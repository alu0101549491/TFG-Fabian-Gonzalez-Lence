/**
 * @module domain/repositories/file-repository
 * @description Repository interface for File entity persistence operations.
 * @category Domain
 */

import {File} from '../entities/file';

/**
 * Abstraction for File metadata data access operations.
 * Actual file content is managed through the Dropbox service.
 * Implemented by infrastructure layer repositories.
 */
export interface IFileRepository {
  /**
   * Finds a file record by its unique identifier.
   * @param id - The file's unique ID.
   * @returns The found file metadata or null if not found.
   */
  findById(id: string): Promise<File | null>;

  /**
   * Persists file metadata to the data store.
   * @param file - The file entity to save.
   * @returns The saved file metadata.
   */
  save(file: File): Promise<File>;

  /**
   * Deletes file metadata from the data store.
   * @param id - The ID of the file record to delete.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all files attached to a specific task.
   * @param taskId - The task's unique ID.
   * @returns Array of files attached to the task.
   */
  findByTaskId(taskId: string): Promise<File[]>;

  /**
   * Finds all files attached to a specific message.
   * @param messageId - The message's unique ID.
   * @returns Array of files attached to the message.
   */
  findByMessageId(messageId: string): Promise<File[]>;
}
