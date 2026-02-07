import {ITaskService} from '../interfaces/ITaskService';
import {ITaskRepository} from '@domain/repositories/ITaskRepository';
import {Task} from '@domain/entities/Task';
import {TaskData} from '../../dtos/TaskData';
import {TaskStatus} from '@domain/enums/TaskStatus';

/**
 * Task service implementation
 */
export class TaskService implements ITaskService {
  constructor(
    private readonly taskRepository: ITaskRepository,
  ) {}

  async createTask(taskData: TaskData): Promise<Task> {
    // TODO: Implement create task logic
    throw new Error('Method not implemented.');
  }

  async updateTask(
      taskId: string,
      updates: TaskData,
      userId: string,
  ): Promise<Task> {
    // TODO: Implement update task logic
    throw new Error('Method not implemented.');
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    // TODO: Implement delete task logic
    throw new Error('Method not implemented.');
  }

  async changeTaskStatus(
      taskId: string,
      newStatus: TaskStatus,
      userId: string,
  ): Promise<void> {
    // TODO: Implement change task status logic
    throw new Error('Method not implemented.');
  }

  async attachFileToTask(
      taskId: string,
      fileId: string,
  ): Promise<void> {
    // TODO: Implement attach file to task logic
    throw new Error('Method not implemented.');
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    // TODO: Implement get tasks by project logic
    throw new Error('Method not implemented.');
  }
}
