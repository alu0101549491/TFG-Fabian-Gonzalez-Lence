/**
 * TaskHistory entity for audit trail of task changes
 */
export class TaskHistory {
  private id: string;
  private taskId: string;
  private userId: string;
  private action: string;
  private previousValue: string;
  private newValue: string;
  private timestamp: Date;

  constructor(
    id: string,
    taskId: string,
    userId: string,
    action: string,
    previousValue: string,
    newValue: string,
  ) {
    this.id = id;
    this.taskId = taskId;
    this.userId = userId;
    this.action = action;
    this.previousValue = previousValue;
    this.newValue = newValue;
    this.timestamp = new Date();
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getTaskId(): string {
    return this.taskId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getAction(): string {
    return this.action;
  }

  public getPreviousValue(): string {
    return this.previousValue;
  }

  public getNewValue(): string {
    return this.newValue;
  }

  public getTimestamp(): Date {
    return this.timestamp;
  }
}
