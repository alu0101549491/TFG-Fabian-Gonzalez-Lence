/**
 * @module domain/repositories/task-history-repository
 * @description Repository interface for TaskHistory entity persistence operations.
 * @category Domain
 */

import {TaskHistory} from '../entities/task-history';

/**
 * Abstraction for TaskHistory data access operations.
 * Provides audit trail persistence for task changes.
 * This repository is append-only - no update operations are provided.
 * Implemented by infrastructure layer repositories.
 */
export interface ITaskHistoryRepository {
  /**
   * Persists a new task history entry (append-only).
   * @param history - The history entry to save.
   * @returns The saved history entry with generated fields populated.
   * @throws Error if database operation fails.
   */
  save(history: TaskHistory): Promise<TaskHistory>;

  /**
   * Finds all history entries for a specific task.
   * @param taskId - The task's unique ID.
   * @returns Array of history entries ordered by timestamp (empty if none found).
   * @throws Error if database connection fails.
   */
  findByTaskId(taskId: string): Promise<TaskHistory[]>;

  /**
   * Finds all history entries for a task filtered by action type.
   * @param taskId - The task's unique ID.
   * @param action - The action type to filter by (e.g., 'created', 'updated', 'status_changed').
   * @returns Array of history entries matching the criteria ordered by timestamp (empty if none found).
   * @throws Error if database connection fails.
   */
  findByTaskIdAndAction(taskId: string, action: string): Promise<TaskHistory[]>;

  /**
   * Finds all history entries created by a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of history entries created by the user ordered by timestamp (empty if none found).
   * @throws Error if database connection fails.
   */
  findByUserId(userId: string): Promise<TaskHistory[]>;

  /**
   * Finds history entries for a task with pagination.
   * @param taskId - The task's unique ID.
   * @param limit - Maximum number of entries to return.
   * @param offset - Number of entries to skip.
   * @returns Array of paginated history entries ordered by timestamp (empty if none found).
   * @throws Error if database connection fails or invalid pagination parameters.
   */
  findByTaskIdPaginated(
    taskId: string,
    limit: number,
    offset: number,
  ): Promise<TaskHistory[]>;

  /**
   * Counts the total number of history entries for a task.
   * @param taskId - The task's unique ID.
   * @returns The count of history entries for the task.
   * @throws Error if database connection fails.
   */
  countByTaskId(taskId: string): Promise<number>;

  /**
   * Deletes all history entries for a task (cascade delete).
   * @param taskId - The task's unique ID.
   * @throws Error if database operation fails.
   */
  deleteByTaskId(taskId: string): Promise<void>;
}
