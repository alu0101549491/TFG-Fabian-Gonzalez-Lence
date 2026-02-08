/**
 * @module domain/repositories/file-repository
 * @description Repository interface for File entity persistence operations.
 * @category Domain
 */

import {File} from '../entities/file';
import {FileType} from '../enumerations/file-type';

/**
 * Abstraction for File metadata data access operations.
 * Actual file content is managed through the Dropbox service.
 * File metadata is immutable once created - no update operations are provided.
 * Implemented by infrastructure layer repositories.
 */
export interface IFileRepository {
  /**
   * Finds a file record by its unique identifier.
   * @param id - The file's unique ID.
   * @returns The found file metadata or null if not found.
   * @throws Error if database connection fails.
   */
  findById(id: string): Promise<File | null>;

  /**
   * Persists file metadata to the data store.
   * @param file - The file entity to save.
   * @returns The saved file metadata with generated fields populated.
   * @throws Error if database operation fails.
   */
  save(file: File): Promise<File>;

  /**
   * Deletes file metadata from the data store.
   * @param id - The ID of the file record to delete.
   * @throws Error if file doesn't exist or database operation fails.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all files attached to a specific project.
   * @param projectId - The project's unique ID.
   * @returns Array of files attached to the project (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectId(projectId: string): Promise<File[]>;

  /**
   * Finds all files attached to a specific task.
   * @param taskId - The task's unique ID.
   * @returns Array of files attached to the task (empty if none found).
   * @throws Error if database connection fails.
   */
  findByTaskId(taskId: string): Promise<File[]>;

  /**
   * Finds all files attached to a specific message.
   * @param messageId - The message's unique ID.
   * @returns Array of files attached to the message (empty if none found).
   * @throws Error if database connection fails.
   */
  findByMessageId(messageId: string): Promise<File[]>;

  /**
   * Finds all files in a project of a specific type.
   * @param projectId - The project's unique ID.
   * @param type - The file type to filter by.
   * @returns Array of files matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  findByProjectIdAndType(projectId: string, type: FileType): Promise<File[]>;

  /**
   * Finds all files uploaded by a specific user.
   * @param userId - The uploader's unique ID.
   * @returns Array of files uploaded by the user (empty if none found).
   * @throws Error if database connection fails.
   */
  findByUploadedBy(userId: string): Promise<File[]>;

  /**
   * Counts the total number of files in a project.
   * @param projectId - The project's unique ID.
   * @returns The count of files in the project.
   * @throws Error if database connection fails.
   */
  countByProjectId(projectId: string): Promise<number>;

  /**
   * Counts the total number of files attached to a task.
   * @param taskId - The task's unique ID.
   * @returns The count of files attached to the task.
   * @throws Error if database connection fails.
   */
  countByTaskId(taskId: string): Promise<number>;

  /**
   * Deletes all files in a project (cascade delete).
   * @param projectId - The project's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByProjectId(projectId: string): Promise<void>;

  /**
   * Deletes all files attached to a task (cascade delete).
   * @param taskId - The task's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByTaskId(taskId: string): Promise<void>;

  /**
   * Deletes all files attached to a message (cascade delete).
   * @param messageId - The message's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByMessageId(messageId: string): Promise<void>;

  /**
   * Finds a file by its Dropbox path.
   * @param dropboxPath - The Dropbox path of the file.
   * @returns The found file metadata or null if not found.
   * @throws Error if database connection fails.
   */
  findByDropboxPath(dropboxPath: string): Promise<File | null>;

  /**
   * Checks if a file with the given Dropbox path exists.
   * @param dropboxPath - The Dropbox path to check.
   * @returns True if a file with the path exists, false otherwise.
   * @throws Error if database connection fails.
   */
  existsByDropboxPath(dropboxPath: string): Promise<boolean>;
}
