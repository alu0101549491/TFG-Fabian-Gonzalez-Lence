/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/entities/task-history.ts
 * @desc Entity representing a historical record of changes made to a task. Provides audit trail functionality for task lifecycle tracking.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {TaskStatus} from '../enumerations/task-status';
import {generateId} from '../../shared/utils';

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
  public readonly id: string;
  public readonly taskId: string;
  public readonly userId: string;
  public readonly action: string;
  public readonly previousValue: string | null;
  public readonly newValue: string | null;
  public readonly timestamp: Date;

  /**
   * Creates a new TaskHistory entity (immutable).
   *
   * @param props - Task history properties
   * @throws {Error} If required fields are missing
   */
  public constructor(props: TaskHistoryProps) {
    this.validateProps(props);

    this.id = props.id;
    this.taskId = props.taskId;
    this.userId = props.userId;
    this.action = props.action;
    this.previousValue = props.previousValue ?? null;
    this.newValue = props.newValue ?? null;
    this.timestamp = props.timestamp ?? new Date();
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
  public static createStatusChange(
    taskId: string,
    userId: string,
    previousStatus: TaskStatus,
    newStatus: TaskStatus
  ): TaskHistory {
    const id = `history_${generateId()}`;
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
  public static createAssigneeChange(
    taskId: string,
    userId: string,
    previousAssignee: string,
    newAssignee: string
  ): TaskHistory {
    const id = `history_${generateId()}`;
    return new TaskHistory({
      id,
      taskId,
      userId,
      action: 'ASSIGNEE_CHANGE',
      previousValue: previousAssignee,
      newValue: newAssignee,
    });
  }
}
