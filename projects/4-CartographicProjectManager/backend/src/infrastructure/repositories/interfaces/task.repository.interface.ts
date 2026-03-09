/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file backend/src/infrastructure/repositories/interfaces/task.repository.interface.ts
 * @desc Task repository interface for Prisma-based data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Prisma, Task, TaskStatus} from '@prisma/client';

export type TaskWithDetails = Prisma.TaskGetPayload<{
  include: {
    project: true;
    creator: true;
    assignee: true;
    files: {include: {file: true}};
  };
}>;

export type TaskWithUsers = Prisma.TaskGetPayload<{
  include: {
    project: true;
    creator: true;
    assignee: true;
  };
}>;

/**
 * Task repository interface
 */
export interface ITaskRepository {
  findById(id: string): Promise<TaskWithDetails | null>;
  findAll(): Promise<TaskWithUsers[]>;
  findByProjectId(projectId: string): Promise<TaskWithUsers[]>;
  findByAssigneeId(assigneeId: string): Promise<TaskWithUsers[]>;
  findByCreatorId(creatorId: string): Promise<TaskWithUsers[]>;
  findByStatus(status: TaskStatus): Promise<TaskWithUsers[]>;
  create(
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'confirmedAt'>,
  ): Promise<TaskWithUsers>;
  update(id: string, data: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  addFile(taskId: string, fileId: string): Promise<void>;
  removeFile(taskId: string, fileId: string): Promise<void>;
}
