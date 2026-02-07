/**
 * @module domain/repositories/task-history-repository
 * @description Repository interface for TaskHistory entity persistence operations.
 * @category Domain
 */

import {TaskHistory} from '../entities/task-history';

/**
 * Abstraction for TaskHistory data access operations.
 * Provides audit trail persistence for task changes.
 * Implemented by infrastructure layer repositories.
 */
export interface ITaskHistoryRepository {
  /**
   * Persists a new task history entry.
   * @param history - The history entry to save.
   * @returns The saved history entry.
   */
  save(history: TaskHistory): Promise<TaskHistory>;

  /**
   * Finds all history entries for a specific task.
   * @param taskId - The task's unique ID.
   * @returns Array of history entries, ordered by timestamp.
   */
  findByTaskId(taskId: string): Promise<TaskHistory[]>;
}
