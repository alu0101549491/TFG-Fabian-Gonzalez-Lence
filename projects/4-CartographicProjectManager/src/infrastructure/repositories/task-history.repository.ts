/**
 * @module infrastructure/repositories/task-history-repository
 * @description Concrete implementation of the ITaskHistoryRepository interface.
 * @category Infrastructure
 */

import {type ITaskHistoryRepository} from '@domain/repositories/task-history-repository.interface';
import {type TaskHistory} from '@domain/entities/task-history';

/**
 * HTTP-based implementation of the TaskHistory repository.
 */
export class TaskHistoryRepository implements ITaskHistoryRepository {
  async save(history: TaskHistory): Promise<TaskHistory> {
    // TODO: Implement API call POST /api/task-history
    throw new Error('Method not implemented.');
  }

  async findByTaskId(taskId: string): Promise<TaskHistory[]> {
    // TODO: Implement API call GET /api/tasks/:taskId/history
    throw new Error('Method not implemented.');
  }
}
