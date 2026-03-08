/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/task-history.repository.ts
 * @desc Task history repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {TaskHistory} from '../../domain/entities/task-history';
import {type ITaskHistoryRepository} from '../../domain/repositories/task-history-repository.interface';
import {type TaskHistoryAction} from '../../domain/enumerations/task-history-action';

/**
 * API response type for task history data from backend
 */
interface TaskHistoryApiResponse {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  timestamp: string;
}

/**
 * Task history repository implementation using HTTP API.
 *
 * Manages immutable audit trail records for task changes.
 * Supports pagination for large history sets.
 *
 * @example
 * ```typescript
 * const repository = new TaskHistoryRepository();
 * const history = await repository.findByTaskId('task_123');
 * ```
 */
export class TaskHistoryRepository implements ITaskHistoryRepository {
  private readonly baseUrl = '/task-history';

  /**
   * Create new history entry
   *
   * @param history - History entity to persist
   * @returns Created history entry
   */
  public async save(history: TaskHistory): Promise<TaskHistory> {
    const response = await httpClient.post<TaskHistoryApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(history),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Find all history entries for task
   *
   * @param taskId - Task ID
   * @returns Array of history entries ordered by timestamp
   */
  public async findByTaskId(taskId: string): Promise<TaskHistory[]> {
    const response = await httpClient.get<TaskHistoryApiResponse[]>(
      `/tasks/${taskId}/history`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find history entries by task and action
   *
   * @param taskId - Task ID
   * @param action - Action type filter
   * @returns Array of matching history entries
   */
  public async findByTaskIdAndAction(
    taskId: string,
    action: TaskHistoryAction,
  ): Promise<TaskHistory[]> {
    const response = await httpClient.get<TaskHistoryApiResponse[]>(
      `/tasks/${taskId}/history?action=${encodeURIComponent(action)}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find all history entries created by user
   *
   * @param userId - User ID
   * @returns Array of user's history entries
   */
  public async findByUserId(userId: string): Promise<TaskHistory[]> {
    const response = await httpClient.get<TaskHistoryApiResponse[]>(
      `${this.baseUrl}?userId=${userId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find history entries with pagination
   *
   * @param taskId - Task ID
   * @param limit - Maximum entries to return
   * @param offset - Number of entries to skip
   * @returns Array of paginated history entries
   */
  public async findByTaskIdPaginated(
    taskId: string,
    limit: number,
    offset: number,
  ): Promise<TaskHistory[]> {
    const response = await httpClient.get<TaskHistoryApiResponse[]>(
      `/tasks/${taskId}/history?limit=${limit}&offset=${offset}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Count history entries for task
   *
   * @param taskId - Task ID
   * @returns Number of history entries
   */
  public async countByTaskId(taskId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `/tasks/${taskId}/history/count`,
    );
    return response.data.count;
  }

  /**
   * Delete all history entries for task
   *
   * @param taskId - Task ID
   */
  public async deleteByTaskId(taskId: string): Promise<void> {
    await httpClient.delete(`/tasks/${taskId}/history`);
  }

  /**
   * Map API response to TaskHistory entity
   *
   * @param data - API response data
   * @returns TaskHistory domain entity
   */
  private mapToEntity(data: TaskHistoryApiResponse): TaskHistory {
    return new TaskHistory({
      id: data.id,
      taskId: data.taskId,
      userId: data.userId,
      action: data.action,
      previousValue: data.previousValue,
      newValue: data.newValue,
      timestamp: new Date(data.timestamp),
    });
  }

  /**
   * Map TaskHistory entity to API request payload
   *
   * @param history - TaskHistory domain entity
   * @returns API request payload
   */
  private mapToApiRequest(history: TaskHistory): Record<string, unknown> {
    return {
      id: history.id,
      taskId: history.taskId,
      userId: history.userId,
      action: history.action,
      previousValue: history.previousValue,
      newValue: history.newValue,
      timestamp: history.timestamp.toISOString(),
    };
  }
}
