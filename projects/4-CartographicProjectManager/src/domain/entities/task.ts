/**
 * @module domain/entities/task
 * @description Entity representing a task within a cartographic project.
 * Tasks can be created by both administrators and clients, support
 * bidirectional assignment, and track status through a defined lifecycle.
 * @category Domain
 */

import {TaskStatus, isValidTaskStatusTransition} from '../enumerations/task-status';
import {TaskPriority} from '../enumerations/task-priority';
import {UserRole} from '../enumerations/user-role';

/**
 * Properties for creating a Task entity.
 */
export interface TaskProps {
  /** Unique identifier */
  id: string;
  /** Parent project ID */
  projectId: string;
  /** User who created the task */
  creatorId: string;
  /** User responsible for execution */
  assigneeId: string;
  /** Task description */
  description: string;
  /** Current task status */
  status?: TaskStatus;
  /** Task priority level */
  priority?: TaskPriority;
  /** Maximum delivery deadline */
  dueDate: Date;
  /** Attached file IDs */
  fileIds?: string[];
  /** Additional notes */
  comments?: string | null;
  /** When task was created */
  createdAt?: Date;
  /** Last modification */
  updatedAt?: Date;
  /** When marked as PERFORMED */
  completedAt?: Date | null;
  /** When confirmed as COMPLETED */
  confirmedAt?: Date | null;
}

/**
 * Represents a task within a project.
 *
 * Tasks support bidirectional assignment between administrators and clients.
 * The task lifecycle follows a 5-state workflow:
 *
 * PENDING ←→ IN_PROGRESS ←→ PARTIAL
 *    ↓            ↓            ↓
 *    └─────────→ PERFORMED ←───┘
 *                   ↓
 *              COMPLETED (terminal)
 *
 * @example
 * ```typescript
 * const task = new Task({
 *   id: 'task_001',
 *   projectId: 'proj_001',
 *   creatorId: 'admin_001',
 *   assigneeId: 'client_001',
 *   description: 'Review topographic plans',
 *   priority: TaskPriority.HIGH,
 *   dueDate: new Date('2025-03-15')
 * });
 *
 * task.changeStatus(TaskStatus.IN_PROGRESS, 'client_001');
 * task.markAsPerformed('client_001');
 * task.confirm('admin_001');  // Completes the task
 * ```
 */
export class Task {
  private readonly _id: string;
  private readonly _projectId: string;
  private readonly _creatorId: string;
  private _assigneeId: string;
  private _description: string;
  private _status: TaskStatus;
  private _priority: TaskPriority;
  private _dueDate: Date;
  private _fileIds: string[];
  private _comments: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _completedAt: Date | null;
  private _confirmedAt: Date | null;

  /**
   * Creates a new Task entity.
   *
   * @param props - Task properties
   * @throws {Error} If required fields are missing or invalid
   */
  constructor(props: TaskProps) {
    this.validateProps(props);

    this._id = props.id;
    this._projectId = props.projectId;
    this._creatorId = props.creatorId;
    this._assigneeId = props.assigneeId;
    this._description = props.description;
    this._status = props.status ?? TaskStatus.PENDING;
    this._priority = props.priority ?? TaskPriority.MEDIUM;
    this._dueDate = props.dueDate;
    this._fileIds = props.fileIds ?? [];
    this._comments = props.comments ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
    this._completedAt = props.completedAt ?? null;
    this._confirmedAt = props.confirmedAt ?? null;
  }

  /**
   * Validates task properties.
   */
  private validateProps(props: TaskProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Task ID is required');
    }
    if (!props.projectId || props.projectId.trim() === '') {
      throw new Error('Project ID is required');
    }
    if (!props.creatorId || props.creatorId.trim() === '') {
      throw new Error('Creator ID is required');
    }
    if (!props.assigneeId || props.assigneeId.trim() === '') {
      throw new Error('Assignee ID is required');
    }
    if (!props.description || props.description.trim() === '') {
      throw new Error('Task description is required');
    }
    if (!props.dueDate) {
      throw new Error('Due date is required');
    }
  }

  // Getters and Setters

  get id(): string {
    return this._id;
  }

  get projectId(): string {
    return this._projectId;
  }

  get creatorId(): string {
    return this._creatorId;
  }

  get assigneeId(): string {
    return this._assigneeId;
  }

  set assigneeId(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Assignee ID cannot be empty');
    }
    this._assigneeId = value;
    this.touchUpdatedAt();
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Description cannot be empty');
    }
    this._description = value;
    this.touchUpdatedAt();
  }

  get status(): TaskStatus {
    return this._status;
  }

  get priority(): TaskPriority {
    return this._priority;
  }

  set priority(value: TaskPriority) {
    this._priority = value;
    this.touchUpdatedAt();
  }

  get dueDate(): Date {
    return this._dueDate;
  }

  set dueDate(value: Date) {
    this._dueDate = value;
    this.touchUpdatedAt();
  }

  get fileIds(): string[] {
    return [...this._fileIds];
  }

  get comments(): string | null {
    return this._comments;
  }

  set comments(value: string | null) {
    this._comments = value;
    this.touchUpdatedAt();
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get confirmedAt(): Date | null {
    return this._confirmedAt;
  }

  // Business Logic Methods

  /**
   * Updates the updatedAt timestamp.
   */
  private touchUpdatedAt(): void {
    this._updatedAt = new Date();
  }

  /**
   * Changes the task status following valid transitions.
   *
   * @param newStatus - The new status
   * @param userId - User making the change
   * @throws {Error} If transition is invalid
   */
  changeStatus(newStatus: TaskStatus, userId: string): void {
    if (!isValidTaskStatusTransition(this._status, newStatus)) {
      throw new Error(
        `Invalid status transition from ${this._status} to ${newStatus}`
      );
    }

    this._status = newStatus;
    this.touchUpdatedAt();
  }

  /**
   * Validates if a status transition is allowed.
   *
   * @param newStatus - Target status
   * @returns True if transition is valid
   */
  isValidStatusTransition(newStatus: TaskStatus): boolean {
    return isValidTaskStatusTransition(this._status, newStatus);
  }

  /**
   * Marks task as done (awaiting confirmation).
   *
   * @param userId - User marking as performed (must be assignee)
   * @throws {Error} If user is not assignee or status invalid
   */
  markAsPerformed(userId: string): void {
    if (userId !== this._assigneeId) {
      throw new Error('Only the assignee can mark the task as performed');
    }

    if (!isValidTaskStatusTransition(this._status, TaskStatus.PERFORMED)) {
      throw new Error('Task cannot be marked as performed in current state');
    }

    this._status = TaskStatus.PERFORMED;
    this._completedAt = new Date();
    this.touchUpdatedAt();
  }

  /**
   * Confirms task completion.
   *
   * @param userId - User confirming (must be task creator)
   * @throws {Error} If user cannot confirm
   */
  confirm(userId: string): void {
    if (!this.canBeConfirmedBy(userId)) {
      throw new Error('Only the task creator can confirm completion');
    }

    if (this._status !== TaskStatus.PERFORMED) {
      throw new Error('Task must be in PERFORMED status to be confirmed');
    }

    this._status = TaskStatus.COMPLETED;
    this._confirmedAt = new Date();
    this.touchUpdatedAt();
  }

  /**
   * Checks if user can confirm this task.
   *
   * @param userId - User ID to check
   * @returns True if user is the creator and status is PERFORMED
   */
  canBeConfirmedBy(userId: string): boolean {
    return userId === this._creatorId && this._status === TaskStatus.PERFORMED;
  }

  /**
   * Checks if user can modify this task.
   *
   * @param userId - User ID to check
   * @param userRole - User's role
   * @returns True if user can modify
   */
  canBeModifiedBy(userId: string, userRole: UserRole): boolean {
    // Administrators can modify any task
    if (userRole === UserRole.ADMINISTRATOR) {
      return true;
    }

    // Clients can modify if creator or assignee
    if (userRole === UserRole.CLIENT) {
      return userId === this._creatorId || userId === this._assigneeId;
    }

    // Special users cannot modify tasks
    return false;
  }

  /**
   * Checks if user can delete this task.
   *
   * @param userId - User ID to check
   * @param userRole - User's role
   * @returns True if user can delete
   */
  canBeDeletedBy(userId: string, userRole: UserRole): boolean {
    // Administrators can delete any task
    if (userRole === UserRole.ADMINISTRATOR) {
      return true;
    }

    // Clients can only delete tasks they created
    if (userRole === UserRole.CLIENT) {
      return userId === this._creatorId;
    }

    // Special users cannot delete tasks
    return false;
  }

  /**
   * Attaches a file to the task.
   *
   * @param fileId - File ID to attach
   * @throws {Error} If file already attached
   */
  attachFile(fileId: string): void {
    if (!fileId || fileId.trim() === '') {
      throw new Error('File ID is required');
    }

    if (this._fileIds.includes(fileId)) {
      throw new Error('File already attached to this task');
    }

    this._fileIds.push(fileId);
    this.touchUpdatedAt();
  }

  /**
   * Removes a file from the task.
   *
   * @param fileId - File ID to remove
   * @throws {Error} If file not attached
   */
  removeFile(fileId: string): void {
    const index = this._fileIds.indexOf(fileId);
    if (index === -1) {
      throw new Error('File not attached to this task');
    }

    this._fileIds.splice(index, 1);
    this.touchUpdatedAt();
  }

  /**
   * Checks if task is past due date.
   *
   * @returns True if overdue and not completed
   */
  isOverdue(): boolean {
    const now = new Date();
    return now > this._dueDate && this._status !== TaskStatus.COMPLETED;
  }

  /**
   * Checks if task is pending (not completed).
   *
   * @returns True if status is not COMPLETED
   */
  isPending(): boolean {
    return this._status !== TaskStatus.COMPLETED;
  }

  /**
   * Serializes the task entity.
   *
   * @returns Plain object representation
   */
  toJSON(): object {
    return {
      id: this._id,
      projectId: this._projectId,
      creatorId: this._creatorId,
      assigneeId: this._assigneeId,
      description: this._description,
      status: this._status,
      priority: this._priority,
      dueDate: this._dueDate.toISOString(),
      fileIds: [...this._fileIds],
      comments: this._comments,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      completedAt: this._completedAt ? this._completedAt.toISOString() : null,
      confirmedAt: this._confirmedAt ? this._confirmedAt.toISOString() : null,
    };
  }
}
