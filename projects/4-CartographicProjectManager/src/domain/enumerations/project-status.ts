/**
 * @module domain/enumerations/project-status
 * @description Enumeration defining the lifecycle states of a project.
 * @category Domain
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
