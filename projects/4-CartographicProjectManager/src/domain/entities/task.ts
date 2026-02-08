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
  readonly id: string;
  readonly projectId: string;
  readonly creatorId: string;
  private assigneeIdValue: string;
  private descriptionValue: string;
  private statusValue: TaskStatus;
  private priorityValue: TaskPriority;
  private dueDateValue: Date;
  private fileIdsValue: string[];
  private commentsValue: string | null;
  readonly createdAt: Date;
  private updatedAtValue: Date;
  private completedAtValue: Date | null;
  private confirmedAtValue: Date | null;

  /**
   * Creates a new Task entity.
   *
   * @param props - Task properties
   * @throws {Error} If required fields are missing or invalid
   */
  constructor(props: TaskProps) {
    this.validateProps(props);

    this.id = props.id;
    this.projectId = props.projectId;
    this.creatorId = props.creatorId;
    this.assigneeIdValue = props.assigneeId;
    this.descriptionValue = props.description;
    this.statusValue = props.status ?? TaskStatus.PENDING;
    this.priorityValue = props.priority ?? TaskPriority.MEDIUM;
    this.dueDateValue = props.dueDate;
    this.fileIdsValue = props.fileIds ?? [];
    this.commentsValue = props.comments ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAtValue = props.updatedAt ?? new Date();
    this.completedAtValue = props.completedAt ?? null;
    this.confirmedAtValue = props.confirmedAt ?? null;
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

  get assigneeId(): string {
    return this.assigneeIdValue;
  }

  set assigneeId(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Assignee ID cannot be empty');
    }
    this.assigneeIdValue = value;
    this.touchUpdatedAt();
  }

  get description(): string {
    return this.descriptionValue;
  }

  set description(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Description cannot be empty');
    }
    this.descriptionValue = value;
    this.touchUpdatedAt();
  }

  get status(): TaskStatus {
    return this.statusValue;
  }

  get priority(): TaskPriority {
    return this.priorityValue;
  }

  set priority(value: TaskPriority) {
    this.priorityValue = value;
    this.touchUpdatedAt();
  }

  get dueDate(): Date {
    return this.dueDateValue;
  }

  set dueDate(value: Date) {
    this.dueDateValue = value;
    this.touchUpdatedAt();
  }

  get fileIds(): string[] {
    return [...this.fileIdsValue];
  }

  get comments(): string | null {
    return this.commentsValue;
  }

  set comments(value: string | null) {
    this.commentsValue = value;
    this.touchUpdatedAt();
  }

  get updatedAt(): Date {
    return this.updatedAtValue;
  }

  get completedAt(): Date | null {
    return this.completedAtValue;
  }

  get confirmedAt(): Date | null {
    return this.confirmedAtValue;
  }

  // Business Logic Methods

  /**
   * Updates the updatedAt timestamp.
   */
  private touchUpdatedAt(): void {
    this.updatedAtValue = new Date();
  }

  /**
   * Changes the task status following valid transitions.
   *
   * @param newStatus - The new status
   * @param userId - User making the change (reserved for future audit trail)
   * @throws {Error} If transition is invalid
   */
  changeStatus(newStatus: TaskStatus, userId: string): void {
    void userId; // Reserved for future audit trail implementation
    
    if (!isValidTaskStatusTransition(this.statusValue, newStatus)) {
      throw new Error(
        `Invalid status transition from ${this.statusValue} to ${newStatus}`
      );
    }

    this.statusValue = newStatus;
    this.touchUpdatedAt();
  }

  /**
   * Validates if a status transition is allowed.
   *
   * @param newStatus - Target status
   * @returns True if transition is valid
   */
  isValidStatusTransition(newStatus: TaskStatus): boolean {
    return isValidTaskStatusTransition(this.statusValue, newStatus);
  }

  /**
   * Marks task as done (awaiting confirmation).
   *
   * @param userId - User marking as performed (must be assignee)
   * @throws {Error} If user is not assignee or status invalid
   */
  markAsPerformed(userId: string): void {
    if (userId !== this.assigneeIdValue) {
      throw new Error('Only the assignee can mark the task as performed');
    }

    if (!isValidTaskStatusTransition(this.statusValue, TaskStatus.PERFORMED)) {
      throw new Error('Task cannot be marked as performed in current state');
    }

    this.statusValue = TaskStatus.PERFORMED;
    this.completedAtValue = new Date();
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

    if (this.statusValue !== TaskStatus.PERFORMED) {
      throw new Error('Task must be in PERFORMED status to be confirmed');
    }

    this.statusValue = TaskStatus.COMPLETED;
    this.confirmedAtValue = new Date();
    this.touchUpdatedAt();
  }

  /**
   * Checks if user can confirm this task.
   *
   * @param userId - User ID to check
   * @returns True if user is the creator and status is PERFORMED
   */
  canBeConfirmedBy(userId: string): boolean {
    return userId === this.creatorId && this.statusValue === TaskStatus.PERFORMED;
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
      return userId === this.creatorId || userId === this.assigneeIdValue;
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
      return userId === this.creatorId;
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

    if (this.fileIdsValue.includes(fileId)) {
      throw new Error('File already attached to this task');
    }

    this.fileIdsValue.push(fileId);
    this.touchUpdatedAt();
  }

  /**
   * Removes a file from the task.
   *
   * @param fileId - File ID to remove
   * @throws {Error} If file not attached
   */
  removeFile(fileId: string): void {
    const index = this.fileIdsValue.indexOf(fileId);
    if (index === -1) {
      throw new Error('File not attached to this task');
    }

    this.fileIdsValue.splice(index, 1);
    this.touchUpdatedAt();
  }

  /**
   * Checks if task is past due date.
   *
   * @returns True if overdue and not completed
   */
  isOverdue(): boolean {
    const now = new Date();
    return now > this.dueDateValue && this.statusValue !== TaskStatus.COMPLETED;
  }

  /**
   * Checks if task is pending (not completed).
   *
   * @returns True if status is not COMPLETED
   */
  isPending(): boolean {
    return this.statusValue !== TaskStatus.COMPLETED;
  }

  /**
   * Serializes the task entity.
   *
   * @returns Plain object representation
   */
  toJSON(): object {
    return {
      id: this.id,
      projectId: this.projectId,
      creatorId: this.creatorId,
      assigneeId: this.assigneeIdValue,
      description: this.descriptionValue,
      status: this.statusValue,
      priority: this.priorityValue,
      dueDate: this.dueDateValue.toISOString(),
      fileIds: [...this.fileIdsValue],
      comments: this.commentsValue,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAtValue.toISOString(),
      completedAt: this.completedAtValue ? this.completedAtValue.toISOString() : null,
      confirmedAt: this.confirmedAtValue ? this.confirmedAtValue.toISOString() : null,
    };
  }
}
