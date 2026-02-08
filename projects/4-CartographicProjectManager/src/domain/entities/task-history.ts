/**
 * @module domain/entities/task-history
 * @description Entity representing a historical record of changes made to a task.
 * Provides audit trail functionality for task lifecycle tracking.
 * @category Domain
 */

import {TaskStatus} from '../enumerations/task-status';

/**
 * Properties for creating a TaskHistory entity.
 */
export interface TaskHistoryProps {
  /** Unique identifier */
  id: string;
  /** Task that was changed */
  taskId: string;
  /** User who made the change */
  userId: string;
  /** Description of action taken */
  action: string;
  /** Value before change */
  previousValue?: string | null;
  /** Value after change */
  newValue?: string | null;
  /** When change occurred */
  timestamp?: Date;
}

/**
 * Represents a single historical entry for a task change.
 *
 * TaskHistory provides an immutable audit trail for task modifications,
 * recording who changed what and when. This entity is crucial for
 * compliance, debugging, and understanding task evolution.
 *
 * @example
 * ```typescript
 * const history = TaskHistory.createStatusChange(
 *   'task_001',
 *   'user_001',
 *   TaskStatus.PENDING,
 *   TaskStatus.IN_PROGRESS
 * );
 * ```
 */
export class TaskHistory {
  private readonly _id: string;
  private readonly _taskId: string;
  private readonly _userId: string;
  private readonly _action: string;
  private readonly _previousValue: string | null;
  private readonly _newValue: string | null;
  private readonly _timestamp: Date;

  /**
   * Creates a new TaskHistory entity (immutable).
   *
   * @param props - Task history properties
   * @throws {Error} If required fields are missing
   */
  constructor(props: TaskHistoryProps) {
    this.validateProps(props);

    this._id = props.id;
    this._taskId = props.taskId;
    this._userId = props.userId;
    this._action = props.action;
    this._previousValue = props.previousValue ?? null;
    this._newValue = props.newValue ?? null;
    this._timestamp = props.timestamp ?? new Date();
  }

  /**
   * Validates task history properties.
   */
  private validateProps(props: TaskHistoryProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Task history ID is required');
    }
    if (!props.taskId || props.taskId.trim() === '') {
      throw new Error('Task ID is required');
    }
    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }
    if (!props.action || props.action.trim() === '') {
      throw new Error('Action is required');
    }
  }

  // Getters (all readonly)

  get id(): string {
    return this._id;
  }

  get taskId(): string {
    return this._taskId;
  }

  get userId(): string {
    return this._userId;
  }

  get action(): string {
    return this._action;
  }

  get previousValue(): string | null {
    return this._previousValue;
  }

  get newValue(): string | null {
    return this._newValue;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  // Factory Methods

  /**
   * Creates a task history record for status changes.
   *
   * @param taskId - Task ID
   * @param userId - User who changed status
   * @param previousStatus - Previous status
   * @param newStatus - New status
   * @returns New TaskHistory instance
   */
  static createStatusChange(
    taskId: string,
    userId: string,
    previousStatus: TaskStatus,
    newStatus: TaskStatus
  ): TaskHistory {
    const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new TaskHistory({
      id,
      taskId,
      userId,
      action: 'STATUS_CHANGE',
      previousValue: previousStatus,
      newValue: newStatus,
    });
  }

  /**
   * Creates a task history record for assignee changes.
   *
   * @param taskId - Task ID
   * @param userId - User who changed assignee
   * @param previousAssignee - Previous assignee ID
   * @param newAssignee - New assignee ID
   * @returns New TaskHistory instance
   */
  static createAssigneeChange(
    taskId: string,
    userId: string,
    previousAssignee: string,
    newAssignee: string
  ): TaskHistory {
    const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new TaskHistory({
      id,
      taskId,
      userId,
      action: 'ASSIGNEE_CHANGE',
      previousValue: previousAssignee,
      newValue: newAssignee,
    });
  }

  /**
   * Serializes the task history entity.
   *
   * @returns Plain object representation
   */
  toJSON(): object {
    return {
      id: this._id,
      taskId: this._taskId,
      userId: this._userId,
      action: this._action,
      previousValue: this._previousValue,
      newValue: this._newValue,
      timestamp: this._timestamp.toISOString(),
    };
  }
}
