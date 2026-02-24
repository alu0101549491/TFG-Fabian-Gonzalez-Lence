/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/task.repository.ts
 * @desc Task repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {Task} from '../../domain/entities/task';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';
import {type ITaskRepository} from '../../domain/repositories/task-repository.interface';

/**
 * API response type for task data from backend
 */
interface TaskApiResponse {
  id: string;
  projectId: string;
  creatorId: string;
  creatorName?: string;
  assigneeId: string;
  assigneeName?: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  fileIds: string[];
  comments: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  confirmedAt: string | null;
}

/**
 * Task repository implementation using HTTP API.
 *
 * Manages task CRUD operations, status filtering, assignment tracking,
 * and overdue task identification for cartographic projects.
 *
 * @example
 * ```typescript
 * const repository = new TaskRepository();
 * const overdueTasks = await repository.findOverdue();
 * ```
 */
export class TaskRepository implements ITaskRepository {
  private readonly baseUrl = '/tasks';

  /**
   * Find task by unique identifier
   *
   * @param id - Task ID
   * @returns Task entity or null if not found
   */
  public async findById(id: string): Promise<Task | null> {
    try {
      const response = await httpClient.get<TaskApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new task
   *
   * @param task - Task entity to persist
   * @returns Created task with generated fields
   */
  public async save(task: Task): Promise<Task> {
    // Don't send id, createdAt, updatedAt for creation (backend generates these)
    const payload = {
      projectId: task.projectId,
      creatorId: task.creatorId,
      assigneeId: task.assigneeId,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate.toISOString(),
      comments: task.comments,
    };
    
    const response = await httpClient.post<TaskApiResponse>(
      this.baseUrl,
      payload,
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Update existing task
   *
   * @param task - Task entity with updated data
   * @returns Updated task entity
   */
  public async update(task: Task): Promise<Task> {
    // Only send fields that can be updated (exclude id, createdAt, updatedAt)
    const payload = {
      assigneeId: task.assigneeId,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate.toISOString(),
      comments: task.comments,
      completedAt: task.completedAt?.toISOString() || null,
      confirmedAt: task.confirmedAt?.toISOString() || null,
    };
    
    const response = await httpClient.put<TaskApiResponse>(
      `${this.baseUrl}/${task.id}`,
      payload,
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Delete task by ID
   *
   * @param id - Task ID to delete
   */
  public async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Find all tasks in project
   *
   * @param projectId - Project ID
   * @returns Array of project tasks
   */
  public async findByProjectId(projectId: string): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `/projects/${projectId}/tasks`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find tasks assigned to user
   *
   * @param userId - Assignee user ID
   * @returns Array of assigned tasks
   */
  public async findByAssigneeId(userId: string): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `${this.baseUrl}?assigneeId=${userId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find tasks created by user
   *
   * @param userId - Creator user ID
   * @returns Array of created tasks
   */
  public async findByCreatorId(userId: string): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `${this.baseUrl}?creatorId=${userId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find tasks by project and status
   *
   * @param projectId - Project ID
   * @param status - Task status filter
   * @returns Array of matching tasks
   */
  public async findByProjectIdAndStatus(
    projectId: string,
    status: TaskStatus,
  ): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `/projects/${projectId}/tasks?status=${status}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find tasks by project and priority
   *
   * @param projectId - Project ID
   * @param priority - Task priority filter
   * @returns Array of matching tasks
   */
  public async findByProjectIdAndPriority(
    projectId: string,
    priority: TaskPriority,
  ): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `/projects/${projectId}/tasks?priority=${priority}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find tasks by assignee and status
   *
   * @param userId - Assignee user ID
   * @param status - Task status filter
   * @returns Array of matching tasks
   */
  public async findByAssigneeIdAndStatus(
    userId: string,
    status: TaskStatus,
  ): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `${this.baseUrl}?assigneeId=${userId}&status=${status}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find all overdue tasks
   *
   * @returns Array of overdue tasks
   */
  public async findOverdue(): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `${this.baseUrl}?overdue=true`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find overdue tasks in project
   *
   * @param projectId - Project ID
   * @returns Array of overdue project tasks
   */
  public async findOverdueByProjectId(projectId: string): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `/projects/${projectId}/tasks?overdue=true`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find overdue tasks assigned to user
   *
   * @param userId - Assignee user ID
   * @returns Array of overdue assigned tasks
   */
  public async findOverdueByAssigneeId(userId: string): Promise<Task[]> {
    const response = await httpClient.get<TaskApiResponse[]>(
      `${this.baseUrl}?assigneeId=${userId}&overdue=true`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Count total tasks in project
   *
   * @param projectId - Project ID
   * @returns Number of project tasks
   */
  public async countByProjectId(projectId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `/projects/${projectId}/tasks/count`,
    );
    return response.data.count;
  }

  /**
   * Count pending tasks in project
   *
   * @param projectId - Project ID
   * @returns Number of pending tasks
   */
  public async countPendingByProjectId(projectId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `/projects/${projectId}/tasks/count?status=PENDING`,
    );
    return response.data.count;
  }

  /**
   * Count tasks assigned to user
   *
   * @param userId - Assignee user ID
   * @returns Number of assigned tasks
   */
  public async countByAssigneeId(userId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `${this.baseUrl}/count?assigneeId=${userId}`,
    );
    return response.data.count;
  }

  /**
   * Count pending tasks assigned to user
   *
   * @param userId - Assignee user ID
   * @returns Number of pending assigned tasks
   */
  public async countPendingByAssigneeId(userId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `${this.baseUrl}/count?assigneeId=${userId}&status=PENDING`,
    );
    return response.data.count;
  }

  /**
   * Delete all tasks in project
   *
   * @param projectId - Project ID
   */
  public async deleteByProjectId(projectId: string): Promise<void> {
    await httpClient.delete(`/projects/${projectId}/tasks`);
  }

  /**
   * Map API response to Task entity
   *
   * @param data - API response data
   * @returns Task domain entity
   */
  private mapToEntity(data: TaskApiResponse): Task {
    return new Task({
      id: data.id,
      projectId: data.projectId,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      dueDate: new Date(data.dueDate),
      fileIds: data.fileIds || [],
      comments: data.comments,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : null,
    });
  }

  /**
   * Map Task entity to API request payload
   *
   * @param task - Task domain entity
   * @returns API request payload
   */
  private mapToApiRequest(task: Task): Record<string, unknown> {
    return {
      id: task.id,
      projectId: task.projectId,
      creatorId: task.creatorId,
      assigneeId: task.assigneeId,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate.toISOString(),
      fileIds: task.fileIds,
      comments: task.comments,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      completedAt: task.completedAt?.toISOString() || null,
      confirmedAt: task.confirmedAt?.toISOString() || null,
    };
  }

  /**
   * Check if error is 404 Not Found
   *
   * @param error - Error object
   * @returns True if 404 error
   */
  private isNotFoundError(error: unknown): boolean {
    return (error as {status?: number})?.status === 404;
  }
}
