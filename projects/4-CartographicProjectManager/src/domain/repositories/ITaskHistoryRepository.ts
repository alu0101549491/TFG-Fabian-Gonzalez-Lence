import {TaskHistory} from '../entities/TaskHistory';

/**
 * Repository interface for TaskHistory entity persistence
 */
export interface ITaskHistoryRepository {
  /**
   * Saves a new task history entry
   * @param history - TaskHistory entity to save
   * @returns Saved TaskHistory entity
   */
  save(history: TaskHistory): Promise<TaskHistory>;

  /**
   * Finds history entries for a task
   * @param taskId - Task ID
   * @returns List of task history entries
   */
  findByTaskId(taskId: string): Promise<TaskHistory[]>;
}