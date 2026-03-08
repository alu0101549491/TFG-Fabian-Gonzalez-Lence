/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file domain/enumerations/task-history-action.ts
 * @desc Defines the known action identifiers recorded in TaskHistory audit entries.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Allowlist of known task history action identifiers.
 *
 * Note: The backend is the ultimate source of truth for emitted actions.
 * This list is used to type action filtering inputs and to centralize
 * the canonical strings used by the application layer.
 */
export const TASK_HISTORY_ACTIONS = [
  'CREATED',
  'UPDATED',
  'DELETED',
  'STATUS_CHANGED',
  'STATUS_CHANGE',
  'STATUS_CHANGE_REQUESTED',
  'ASSIGNEE_CHANGE',
  'CONFIRMED',
  'REJECTED',
] as const;

/**
 * Known task history action identifiers.
 */
export type TaskHistoryAction = (typeof TASK_HISTORY_ACTIONS)[number];

/**
 * Type guard to check whether a value is a known TaskHistoryAction.
 *
 * @param value - Value to check
 * @returns True if value is a known action identifier
 */
export function isValidTaskHistoryAction(
  value: unknown,
): value is TaskHistoryAction {
  return (
    typeof value === 'string' &&
    TASK_HISTORY_ACTIONS.includes(value as TaskHistoryAction)
  );
}
