import {TaskStatus} from '../enums/TaskStatus';
import {TaskPriority} from '../enums/TaskPriority';

/**
 * Task entity representing a project task
 * Can be created by admin or client and assigned bidirectionally
 */
export class Task {
  private id: string;
  private projectId: string;
  private creatorId: string;
  private assigneeId: string;
  private description: string;
  private status: TaskStatus;
  private priority: TaskPriority;
  private dueDate: Date;
  private createdAt: Date;
  private updatedAt: Date;
  private fileIds: string[];

  constructor(
    id: string,
    projectId: string,
    creatorId: string,
    assigneeId: string,
    description: string,
    priority: TaskPriority,
    dueDate: Date,
  ) {
    this.id = id;
    this.projectId = projectId;
    this.creatorId = creatorId;
    this.assigneeId = assigneeId;
    this.description = description;
    this.status = TaskStatus.PENDING;
    this.priority = priority;
    this.dueDate = dueDate;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.fileIds = [];
  }

  /**
   * Changes task status with audit trail
   * @param newStatus - New status to set
   * @param userId - ID of user making the change
   */
  public changeStatus(newStatus: TaskStatus, userId: string): void {
    // TODO: Implement change status logic
    throw new Error('Method not implemented.');
  }

  /**
   * Attaches a file to this task
   * @param fileId - ID of the file to attach
   */
  public attachFile(fileId: string): void {
    // TODO: Implement attach file logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if task can be modified by user
   * @param userId - ID of user to check
   * @returns True if user can modify task
   */
  public canBeModifiedBy(userId: string): boolean {
    // TODO: Implement modification permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if task can be deleted by user
   * @param userId - ID of user to check
   * @returns True if user can delete task
   */
  public canBeDeletedBy(userId: string): boolean {
    // TODO: Implement deletion permission check
    throw new Error('Method not implemented.');
  }

  /**
   * Marks task as completed
   * @param userId - ID of user completing the task
   */
  public markAsCompleted(userId: string): void {
    // TODO: Implement mark as completed logic
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getProjectId(): string {
    return this.projectId;
  }

  public getStatus(): TaskStatus {
    return this.status;
  }

  public getPriority(): TaskPriority {
    return this.priority;
  }

  public getDescription(): string {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }
}