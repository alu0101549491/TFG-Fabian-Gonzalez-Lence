/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/infrastructure/repositories/task.repository.ts
 * @desc Task repository implementation using Prisma
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Task, TaskStatus} from '@prisma/client';
import type {ITaskRepository} from '@infrastructure/repositories/interfaces/task.repository.interface.js';
import {prisma} from '../database/prisma.client.js';
import {DatabaseError} from '@shared/errors.js';

/**
 * Task repository implementation
 */
export class TaskRepository implements ITaskRepository {
  public async findById(id: string): Promise<Task | null> {
    try {
      return await prisma.task.findUnique({
        where: {id},
        include: {
          project: true,
          creator: true,
          assignee: true,
          files: {include: {file: true}},
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find task by ID');
    }
  }

  public async findAll(): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        include: {project: true, creator: true, assignee: true},
        orderBy: {createdAt: 'desc'},
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch all tasks');
    }
  }

  public async findByProjectId(projectId: string): Promise<any[]> {
    try {
      const tasks = await prisma.task.findMany({
        where: {projectId},
        include: {creator: true, assignee: true},
      });
      return tasks.map(task => ({
        ...task,
        creatorName: task.creator.username,
        assigneeName: task.assignee.username,
      }));
    } catch (error) {
      throw new DatabaseError('Failed to find tasks by project ID');
    }
  }

  public async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        where: {assigneeId},
        include: {project: true, creator: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find tasks by assignee ID');
    }
  }

  public async findByCreatorId(creatorId: string): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        where: {creatorId},
        include: {project: true, assignee: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find tasks by creator ID');
    }
  }

  public async findByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        where: {status},
        include: {project: true, creator: true, assignee: true},
      });
    } catch (error) {
      throw new DatabaseError('Failed to find tasks by status');
    }
  }

  public async create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'confirmedAt'>): Promise<any> {
    try {
      const task = await prisma.task.create({
        data,
        include: {creator: true, assignee: true},
      });
      return {
        ...task,
        creatorName: task.creator.username,
        assigneeName: task.assignee.username,
      };
    } catch (error) {
      throw new DatabaseError('Failed to create task');
    }
  }

  public async update(id: string, data: Partial<Task>): Promise<Task> {
    try {
      return await prisma.task.update({
        where: {id},
        data,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update task');
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await prisma.task.delete({where: {id}});
    } catch (error) {
      throw new DatabaseError('Failed to delete task');
    }
  }

  public async addFile(taskId: string, fileId: string): Promise<void> {
    try {
      await prisma.taskFile.create({
        data: {taskId, fileId},
      });
    } catch (error) {
      throw new DatabaseError('Failed to add file to task');
    }
  }

  public async removeFile(taskId: string, fileId: string): Promise<void> {
    try {
      await prisma.taskFile.deleteMany({
        where: {taskId, fileId},
      });
    } catch (error) {
      throw new DatabaseError('Failed to remove file from task');
    }
  }
}
