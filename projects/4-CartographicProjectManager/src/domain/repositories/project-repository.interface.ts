/**
 * @module domain/repositories/project-repository
 * @description Repository interface for Project entity persistence operations.
 * @category Domain
 */

import {Project} from '../entities/project';

/**
 * Abstraction for Project data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface IProjectRepository {
  /**
   * Finds a project by its unique identifier.
   * @param id - The project's unique ID.
   * @returns The found project or null if not found.
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Persists a new project to the data store.
   * @param project - The project entity to save.
   * @returns The saved project with any generated fields populated.
   */
  save(project: Project): Promise<Project>;

  /**
   * Updates an existing project in the data store.
   * @param project - The project entity with updated data.
   * @returns The updated project.
   */
  update(project: Project): Promise<Project>;

  /**
   * Finds all projects assigned to a specific client.
   * @param clientId - The client's unique ID.
   * @returns Array of projects assigned to the client.
   */
  findByClientId(clientId: string): Promise<Project[]>;

  /**
   * Finds all projects accessible by a special user.
   * @param userId - The special user's unique ID.
   * @returns Array of projects the special user can access.
   */
  findBySpecialUserId(userId: string): Promise<Project[]>;

  /**
   * Retrieves all projects in the system.
   * @returns Array of all projects.
   */
  findAll(): Promise<Project[]>;
}
