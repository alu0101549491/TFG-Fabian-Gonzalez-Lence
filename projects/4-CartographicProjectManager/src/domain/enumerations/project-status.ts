/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/enumerations/project-status.ts
 * @desc Enumeration defining the lifecycle states of a project.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the current lifecycle status of a cartographic project.
 */
export enum ProjectStatus {
  /** Project has been created but work has not yet begun. */
  ACTIVE = 'ACTIVE',
  /** Work is actively being performed on the project. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Project deliverables are awaiting review or approval. */
  PENDING_REVIEW = 'PENDING_REVIEW',
  /** Project has been completed and delivered. */
  FINALIZED = 'FINALIZED',
}

/**
 * Human-readable display names for project statuses.
 */
export const ProjectStatusDisplayName: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.IN_PROGRESS]: 'In Progress',
  [ProjectStatus.PENDING_REVIEW]: 'Pending Review',
  [ProjectStatus.FINALIZED]: 'Finalized',
};

/**
 * UI color mappings for project statuses.
 * These colors provide visual feedback in the user interface.
 */
export const ProjectStatusColor: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'blue',
  [ProjectStatus.IN_PROGRESS]: 'blue',
  [ProjectStatus.PENDING_REVIEW]: 'yellow',
  [ProjectStatus.FINALIZED]: 'gray',
};

/**
 * Type guard to check if a value is a valid ProjectStatus.
 *
 * @param value - The value to check
 * @returns True if the value is a valid ProjectStatus
 */
export function isValidProjectStatus(value: unknown): value is ProjectStatus {
  return Object.values(ProjectStatus).includes(value as ProjectStatus);
}

/**
 * Array of all project statuses for iteration.
 */
export const ALL_PROJECT_STATUSES = Object.values(ProjectStatus);

/**
 * Checks if a project status represents an active/ongoing project.
 *
 * @param status - The project status to check
 * @returns True if the project is active or in progress
 */
export function isActiveProjectStatus(status: ProjectStatus): boolean {
  return status === ProjectStatus.ACTIVE || status === ProjectStatus.IN_PROGRESS;
}
