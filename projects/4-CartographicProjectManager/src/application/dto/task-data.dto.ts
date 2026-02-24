/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/task-data.dto.ts
 * @desc Data Transfer Objects for task operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {TaskStatus} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';
import {FileSummaryDto} from './file-data.dto';

/**
 * Input DTO for creating a new task.
 */
export interface CreateTaskDto {
  /** Parent project ID */
  readonly projectId: string;
  /** Task description (max 1000 characters) */
  readonly description: string;
  /** User ID to assign task to */
  readonly assigneeId: string;
  /** Task priority level */
  readonly priority: TaskPriority;
  /** Task due date */
  readonly dueDate: Date;
  /** Optional comments (max 2000 characters) */
  readonly comments?: string;
  /** Optional file attachment IDs */
  readonly fileIds?: string[];
}

/**
 * Input DTO for updating an existing task.
 */
export interface UpdateTaskDto {
  /** Task ID to update (required) */
  readonly id: string;
  /** Updated description */
  readonly description?: string;
  /** Updated assignee */
  readonly assigneeId?: string;
  /** Updated priority */
  readonly priority?: TaskPriority;
  /** Updated due date */
  readonly dueDate?: Date;
  /** Updated comments */
  readonly comments?: string;
  /** Updated file attachments */
  readonly fileIds?: string[];
}

/**
 * Input DTO for changing task status.
 */
export interface ChangeTaskStatusDto {
  /** Task ID */
  readonly taskId: string;
  /** New status to transition to */
  readonly newStatus: TaskStatus;
  /** Optional comment explaining status change */
  readonly comment?: string;
}

/**
 * Input DTO for confirming a completed task.
 */
export interface ConfirmTaskDto {
  /** Task ID to confirm */
  readonly taskId: string;
  /** true = confirm completion, false = reject (back to pending) */
  readonly confirmed: boolean;
  /** Optional feedback on rejection */
  readonly feedback?: string;
}

/**
 * Complete task information for detail view.
 */
export interface TaskDto {
  /** Unique task identifier */
  readonly id: string;
  /** Parent project ID */
  readonly projectId: string;
  /** Parent project code (denormalized) */
  readonly projectCode: string;
  /** Parent project name (denormalized) */
  readonly projectName: string;
  /** Task description */
  readonly description: string;
  /** Creator user ID */
  readonly creatorId: string;
  /** Creator name (denormalized) */
  readonly creatorName: string;
  /** Assignee user ID */
  readonly assigneeId: string;
  /** Assignee name (denormalized) */
  readonly assigneeName: string;
  /** Current task status */
  readonly status: TaskStatus;
  /** Task priority level */
  readonly priority: TaskPriority;
  /** Task due date */
  readonly dueDate: Date;
  /** Additional comments */
  readonly comments: string | null;
  /** Array of file IDs attached to task */
  readonly fileIds: string[];
  /** File summaries for attachments */
  readonly files: FileSummaryDto[];
  /** Task creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  readonly updatedAt: Date;
  /** Completion timestamp (if completed) */
  readonly completedAt: Date | null;
  /** Confirmation timestamp (if confirmed) */
  readonly confirmedAt: Date | null;
  /** Whether task is past due date */
  readonly isOverdue: boolean;
  /** Whether current user can modify task */
  readonly canModify: boolean;
  /** Whether current user can delete task */
  readonly canDelete: boolean;
  /** Whether current user can confirm task */
  readonly canConfirm: boolean;
  /** Whether current user can change status */
  readonly canChangeStatus: boolean;
  /** Valid status transitions from current status */
  readonly allowedStatusTransitions: TaskStatus[];
}

/**
 * Task history entry showing status changes and updates.
 */
export interface TaskHistoryEntryDto {
  /** Unique history entry ID */
  readonly id: string;
  /** Action performed (e.g., "CREATED", "STATUS_CHANGED", "UPDATED") */
  readonly action: string;
  /** Previous value (if applicable) */
  readonly previousValue: string | null;
  /** New value */
  readonly newValue: string | null;
  /** User who performed the action */
  readonly userId: string;
  /** User name (denormalized) */
  readonly userName: string;
  /** When action occurred */
  readonly timestamp: Date;
}

/**
 * Filter options for task queries.
 */
export interface TaskFilterDto {
  /** Filter by project ID */
  readonly projectId?: string;
  /** Filter by assignee ID */
  readonly assigneeId?: string;
  /** Filter by creator ID */
  readonly creatorId?: string;
  /** Filter by status */
  readonly status?: TaskStatus;
  /** Filter by priority */
  readonly priority?: TaskPriority;
  /** Filter overdue tasks only */
  readonly isOverdue?: boolean;
  /** Filter by due date start */
  readonly dueDateFrom?: Date;
  /** Filter by due date end */
  readonly dueDateTo?: Date;
  /** Search term for description */
  readonly searchTerm?: string;
  /** Sort field */
  readonly sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt';
  /** Sort order */
  readonly sortOrder?: 'asc' | 'desc';
  /** Page number (for pagination) */
  readonly page?: number;
  /** Items per page */
  readonly limit?: number;
}

/**
 * Paginated task list response.
 */
export interface TaskListResponseDto {
  /** Array of task summaries */
  readonly tasks: TaskSummaryDto[];
  /** Total number of tasks matching filters */
  readonly total: number;
  /** Current page number */
  readonly page: number;
  /** Items per page */
  readonly limit: number;
  /** Total number of pages */
  readonly totalPages: number;
}

/**
 * Output DTO for calendar view showing tasks by due date.
 */
export interface CalendarTaskDto {
  /** Unique task identifier */
  readonly id: string;
  /** Task description */
  readonly description: string;
  /** Parent project ID */
  readonly projectId: string;
  /** Parent project code */
  readonly projectCode: string;
  /** Parent project name */
  readonly projectName: string;
  /** Task due date */
  readonly dueDate: Date;
  /** Current task status */
  readonly status: TaskStatus;
  /** Task priority level */
  readonly priority: TaskPriority;
  /** Assignee name */
  readonly assigneeName: string;
  /** Whether task is overdue */
  readonly isOverdue: boolean;
}

/**
 * Re-export TaskSummaryDto from project-details for consistency.
 */
export type {TaskSummaryDto} from './project-details.dto';
