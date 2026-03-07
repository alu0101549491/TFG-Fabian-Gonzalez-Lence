/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/domain/repositories/task.repository.interface.ts
 * @desc Task repository interface for data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Task, TaskStatus, TaskPriority} from '@prisma/client';

/**
 * Task repository interface
 */
export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByProjectId(projectId: string): Promise<Task[]>;
  findByAssigneeId(assigneeId: string): Promise<Task[]>;
  findByCreatorId(creatorId: string): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'confirmedAt'>): Promise<Task>;
  update(id: string, data: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  addFile(taskId: string, fileId: string): Promise<void>;
  removeFile(taskId: string, fileId: string): Promise<void>;
}
