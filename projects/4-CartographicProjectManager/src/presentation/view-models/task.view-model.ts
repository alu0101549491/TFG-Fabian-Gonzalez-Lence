/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 10, 2026
 * @file src/presentation/view-models/task.view-model.ts
 * @desc Presentation-layer view-model types for tasks (UI convenience fields).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {TaskDto} from '../../application/dto/task-data.dto';
import type {TaskSummaryDto} from '../../application/dto/project-details.dto';
import type {TaskStatus} from '../../domain/enumerations/task-status';

/**
 * Task details view model.
 *
 * Extends the transport DTO with UI-only convenience fields.
 */
export interface TaskViewModel extends TaskDto {
  /** Whether the task is overdue (UI convenience). */
  readonly isOverdue: boolean;
  /** Whether the current user can modify the task. */
  readonly canModify: boolean;
  /** Whether the current user can delete the task. */
  readonly canDelete: boolean;
  /** Whether the current user can confirm the task. */
  readonly canConfirm: boolean;
  /** Whether the current user can change the task status. */
  readonly canChangeStatus: boolean;
  /** Allowed status transitions from the current status (UI convenience). */
  readonly allowedStatusTransitions: TaskStatus[];
}

/**
 * Task summary view model used in lists.
 */
export interface TaskSummaryViewModel extends TaskSummaryDto {
  /** Whether the task is overdue (UI convenience). */
  readonly isOverdue: boolean;
}
