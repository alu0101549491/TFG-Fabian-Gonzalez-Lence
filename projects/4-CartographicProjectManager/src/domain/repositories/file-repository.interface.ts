/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/repositories/file-repository.interface.ts
 * @desc Repository interface for File entity persistence operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {File} from '../entities/file';
import {FileType} from '../enumerations/file-type';

/** Query parameters for file lookups. */
export interface FileFindQuery {
  /** Filter files by project id. */
  projectId?: string;
  /** Filter files by task id. */
  taskId?: string;
  /** Filter files by message id. */
  messageId?: string;
  /** Filter files by file type. */
  type?: FileType;
  /** Filter files by uploader id. */
  uploadedBy?: string;
}

/** Query parameters for file counts. */
export type FileCountQuery = FileFindQuery;

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
   * Finds files matching the provided query.
   *
   * @param query - Query object.
   * @returns Array of files matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  find(query: FileFindQuery): Promise<File[]>;

  /**
   * Counts files matching the provided query.
   *
   * @param query - Query object.
   * @returns Count of files.
   * @throws Error if database connection fails.
   */
  count(query: FileCountQuery): Promise<number>;

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

  // Intentionally no additional ad-hoc query methods. Use `find`/`count`.
}
