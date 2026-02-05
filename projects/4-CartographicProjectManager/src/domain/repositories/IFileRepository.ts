import {File} from '../entities/File';

/**
 * Repository interface for File entity persistence
 */
export interface IFileRepository {
  /**
   * Finds a file by ID
   * @param id - File ID
   * @returns File entity or null if not found
   */
  findById(id: string): Promise<File | null>;

  /**
   * Saves a new file
   * @param file - File entity to save
   * @returns Saved file entity
   */
  save(file: File): Promise<File>;

  /**
   * Deletes a file by ID
   * @param id - File ID to delete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds files attached to a task
   * @param taskId - Task ID
   * @returns List of task files
   */
  findByTaskId(taskId: string): Promise<File[]>;

  /**
   * Finds files attached to a message
   * @param messageId - Message ID
   * @returns List of message files
   */
  findByMessageId(messageId: string): Promise<File[]>;
}