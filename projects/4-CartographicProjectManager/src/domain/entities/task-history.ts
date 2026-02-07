/**
 * @module domain/entities/task-history
 * @description Entity representing a historical record of changes made to a task.
 * Provides audit trail functionality for task lifecycle tracking.
 * @category Domain
 */

/**
 * Represents a single historical entry for a task change.
 * Used for audit logging and tracking the evolution of tasks over time.
 */
export class TaskHistory {
  private readonly id: string;
  private readonly taskId: string;
  private readonly userId: string;
  private readonly action: string;
  private readonly previousValue: string;
  private readonly newValue: string;
  private readonly timestamp: Date;

  constructor(
    id: string,
    taskId: string,
    userId: string,
    action: string,
    previousValue: string,
    newValue: string,
    timestamp: Date,
  ) {
    this.id = id;
    this.taskId = taskId;
    this.userId = userId;
    this.action = action;
    this.previousValue = previousValue;
    this.newValue = newValue;
    this.timestamp = timestamp;
  }

  getId(): string {
    return this.id;
  }

  getTaskId(): string {
    return this.taskId;
  }

  getUserId(): string {
    return this.userId;
  }

  getAction(): string {
    return this.action;
  }

  getPreviousValue(): string {
    return this.previousValue;
  }

  getNewValue(): string {
    return this.newValue;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }
}
