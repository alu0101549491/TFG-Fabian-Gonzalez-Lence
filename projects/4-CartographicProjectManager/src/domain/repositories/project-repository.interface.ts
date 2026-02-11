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
   * Finds all projects assigned to a specific client.
   * @param clientId - The client's unique ID.
   * @returns Array of projects assigned to the client (empty if none found).
   * @throws Error if database connection fails.
   */
  findByClientId(clientId: string): Promise<Project[]>;

  /**
   * Finds all projects accessible by a special user.
   * @param userId - The special user's unique ID.
   * @returns Array of projects the special user can access (empty if none found).
   * @throws Error if database connection fails.
   */
  findBySpecialUserId(userId: string): Promise<Project[]>;

  /**
   * Finds all projects with a specific status.
   * @param status - The project status to filter by.
   * @returns Array of projects with the specified status (empty if none found).
   * @throws Error if database connection fails.
   */
  findByStatus(status: ProjectStatus): Promise<Project[]>;

  /**
   * Finds all projects from a specific year.
   * @param year - The year to filter projects by.
   * @returns Array of projects from the specified year (empty if none found).
   * @throws Error if database connection fails.
   */
  findByYear(year: number): Promise<Project[]>;

  /**
   * Finds all projects of a specific type.
   * @param type - The project type to filter by.
   * @returns Array of projects with the specified type (empty if none found).
   * @throws Error if database connection fails.
   */
  findByType(type: ProjectType): Promise<Project[]>;

  /**
   * Retrieves all projects in the system.
   * @returns Array of all projects (empty if none found).
   * @throws Error if database connection fails.
   */
  findAll(): Promise<Project[]>;

  /**
   * Retrieves all active projects (not archived or cancelled).
   * @returns Array of all active projects (empty if none found).
   * @throws Error if database connection fails.
   */
  findAllActive(): Promise<Project[]>;

  /**
   * Retrieves all projects ordered by delivery date.
   * @param ascending - If true, orders ascending; if false, descending. Defaults to true.
   * @returns Array of projects ordered by delivery date (empty if none found).
   * @throws Error if database connection fails.
   */
  findAllOrderedByDeliveryDate(ascending?: boolean): Promise<Project[]>;

  /**
   * Finds projects with delivery dates within a specified range.
   * @param startDate - The start of the date range.
   * @param endDate - The end of the date range.
   * @returns Array of projects within the date range (empty if none found).
   * @throws Error if database connection fails or invalid date range.
   */
  findByDeliveryDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Project[]>;

  /**
   * Checks if a project with the given code exists.
   * @param code - The project code to check.
   * @returns True if a project with the code exists, false otherwise.
   * @throws Error if database connection fails.
   */
  existsByCode(code: string): Promise<boolean>;

  /**
   * Counts the number of projects assigned to a specific client.
   * @param clientId - The client's unique ID.
   * @returns The count of projects assigned to the client.
   * @throws Error if database connection fails.
   */
  countByClientId(clientId: string): Promise<number>;

  /**
   * Counts the number of projects with a specific status.
   * @param status - The project status to count.
   * @returns The count of projects with the specified status.
   * @throws Error if database connection fails.
   */
  countByStatus(status: ProjectStatus): Promise<number>;
}
