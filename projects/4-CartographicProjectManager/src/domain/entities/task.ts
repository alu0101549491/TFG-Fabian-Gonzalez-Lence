/**
 * @module domain/entities/task
 * @description Entity representing a task within a cartographic project.
 * Tasks can be created by both administrators and clients, support
 * bidirectional assignment, and track status through a defined lifecycle.
 * @category Domain
 */

import {TaskStatus} from '../enumerations/task-status';
import {TaskPriority} from '../enumerations/task-priority';

/**
 * Represents a task within a project.
 * Tasks are work items that can be assigned between administrator and client,
 * with full lifecycle tracking and file attachments.
 */
export class Task {
  private readonly id: string;
  private readonly projectId: string;
  private readonly creatorId: string;
  private assigneeId: string;
  private description: string;
  private status: TaskStatus;
  private priority: TaskPriority;
  private dueDate: Date;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private fileIds: string[];

  constructor(
    id: string,
    projectId: string,
    creatorId: string,
    assigneeId: string,
    description: string,
    status: TaskStatus,
    priority: TaskPriority,
    dueDate: Date,
    createdAt: Date,
    updatedAt: Date,
    fileIds: string[],
  ) {
    this.id = id;
    this.projectId = projectId;
    this.creatorId = creatorId;
    this.assigneeId = assigneeId;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.dueDate = dueDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.fileIds = fileIds;
  }

  /**
   * Changes the status of the task, validating the transition and permissions.
   * @param newStatus - The new status to set.
   * @param userId - The ID of the user performing the change.
   */
  changeStatus(newStatus: TaskStatus, userId: string): void {
    // TODO: Implement status change with validation
    throw new Error('Method not implemented.');
  }

  /**
   * Attaches a file to this task.
   * @param fileId - The ID of the file to attach.
   */
  attachFile(fileId: string): void {
    // TODO: Implement file attachment logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if the specified user has permission to modify this task.
   * @param userId - The ID of the user to check.
   * @returns True if the user can modify this task.
   */
  canBeModifiedBy(userId: string): boolean {
    // TODO: Implement modification permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if the specified user has permission to delete this task.
   * @param userId - The ID of the user to check.
   * @returns True if the user can delete this task.
   */
  canBeDeletedBy(userId: string): boolean {
    // TODO: Implement deletion permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Marks the task as completed by the specified user.
   * Only the administrator can confirm completion of performed tasks.
   * @param userId - The ID of the user confirming completion.
   */
  markAsCompleted(userId: string): void {
    // TODO: Implement completion logic
    throw new Error('Method not implemented.');
  }

  getId(): string {
    return this.id;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getCreatorId(): string {
    return this.creatorId;
  }

  getAssigneeId(): string {
    return this.assigneeId;
  }

  getDescription(): string {
    return this.description;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getPriority(): TaskPriority {
    return this.priority;
  }

  getDueDate(): Date {
    return this.dueDate;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getFileIds(): string[] {
    return [...this.fileIds];
  }
}
