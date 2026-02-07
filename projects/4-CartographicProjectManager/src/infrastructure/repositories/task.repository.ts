/**
 * @module infrastructure/repositories/task-repository
 * @description Concrete implementation of the ITaskRepository interface.
 * @category Infrastructure
 */

import {type ITaskRepository} from '@domain/repositories/task-repository.interface';
import {type Task} from '@domain/entities/task';

/**
 * HTTP-based implementation of the Task repository.
 */
export class TaskRepository implements ITaskRepository {
  async findById(id: string): Promise<Task | null> {
    // TODO: Implement API call GET /api/tasks/:id
    throw new Error('Method not implemented.');
  }

  async save(task: Task): Promise<Task> {
    // TODO: Implement API call POST /api/tasks
    throw new Error('Method not implemented.');
  }

  async update(task: Task): Promise<Task> {
    // TODO: Implement API call PUT /api/tasks/:id
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    // TODO: Implement API call DELETE /api/tasks/:id
    throw new Error('Method not implemented.');
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    // TODO: Implement API call GET /api/projects/:projectId/tasks
    throw new Error('Method not implemented.');
  }

  async findByAssigneeId(userId: string): Promise<Task[]> {
    // TODO: Implement API call GET /api/tasks?assigneeId=:userId
    throw new Error('Method not implemented.');
  }
}
