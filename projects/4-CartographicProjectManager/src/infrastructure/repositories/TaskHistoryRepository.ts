import {
  ITaskHistoryRepository,
} from '@domain/repositories/ITaskHistoryRepository';
import {TaskHistory} from '@domain/entities/TaskHistory';

/**
 * TaskHistory repository implementation
 * Handles task history data persistence
 */
export class TaskHistoryRepository implements ITaskHistoryRepository {
  async save(history: TaskHistory): Promise<TaskHistory> {
    // TODO: Implement save logic
    throw new Error('Method not implemented.');
  }

  async findByTaskId(taskId: string): Promise<TaskHistory[]> {
    // TODO: Implement find by task id logic
    throw new Error('Method not implemented.');
  }
}
