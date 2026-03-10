/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/repositories/project-repository.interface.ts
 * @desc Repository interface for Project entity persistence operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Project} from '../entities/project';
import {ProjectStatus} from '../enumerations/project-status';
import {ProjectType} from '../enumerations/project-type';

/** Query parameters for project list operations. */
export interface ProjectFindQuery {
  /** Filter by client id. */
  clientId?: string;
  /** Filter by special user id. */
  specialUserId?: string;
  /** Filter by project status. */
  status?: ProjectStatus;
  /** Filter by year. */
  year?: number;
  /** Filter by project type. */
  type?: ProjectType;
  /** If true, returns only active projects (backend-defined). */
  active?: boolean;
}

/**
 * Abstraction for Project data access operations.
 * Implemented by infrastructure layer repositories.
 */
export interface IProjectRepository {
  /**
   * Finds a project by its unique identifier.
   * @param id - The project's unique ID.
   * @returns The found project or null if not found.
   * @throws Error if database connection fails.
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Finds a project by its unique code.
   * @param code - The project's unique code.
   * @returns The found project or null if not found.
   * @throws Error if database connection fails.
   */
  findByCode(code: string): Promise<Project | null>;

  /**
   * Persists a new project to the data store.
   * @param project - The project entity to save.
   * @returns The saved project with any generated fields populated.
   * @throws Error if project already exists or database operation fails.
   */
  save(project: Project): Promise<Project>;

  /**
   * Updates an existing project in the data store.
   * @param project - The project entity with updated data.
   * @returns The updated project.
   * @throws Error if project doesn't exist or database operation fails.
   */
  update(project: Project): Promise<Project>;

  /**
   * Deletes a project from the data store.
   * @param id - The ID of the project to delete.
   * @throws Error if project doesn't exist or database operation fails.
   */
  delete(id: string): Promise<void>;

  /**
   * Finds projects matching the provided query.
   *
   * @param query - Query object.
   * @returns Array of projects matching the criteria (empty if none found).
   * @throws Error if database connection fails.
   */
  find(query?: ProjectFindQuery): Promise<Project[]>;

  /**
   * Checks if a project with the given code exists.
   * @param code - The project code to check.
   * @returns True if a project with the code exists, false otherwise.
   * @throws Error if database connection fails.
   */
  existsByCode(code: string): Promise<boolean>;

  // Intentionally no additional ad-hoc query methods. Use `find`.
}
