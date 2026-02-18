/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/domain/repositories/project.repository.interface.ts
 * @desc Project repository interface for data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Project, ProjectStatus, ProjectType} from '@prisma/client';

/**
 * Project repository interface
 */
export interface IProjectRepository {
  /**
   * Find project by ID
   *
   * @param id - Project ID
   * @returns Project or null if not found
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Find project by code
   *
   * @param code - Project code
   * @returns Project or null if not found
   */
  findByCode(code: string): Promise<Project | null>;

  /**
   * Find all projects
   *
   * @returns Array of projects
   */
  findAll(): Promise<Project[]>;

  /**
   * Find projects by client ID
   *
   * @param clientId - Client user ID
   * @returns Array of client's projects
   */
  findByClientId(clientId: string): Promise<Project[]>;

  /**
   * Find projects by special user ID
   *
   * @param userId - Special user ID
   * @returns Array of accessible projects
   */
  findBySpecialUserId(userId: string): Promise<Project[]>;

  /**
   * Find projects by status
   *
   * @param status - Project status
   * @returns Array of projects
   */
  findByStatus(status: ProjectStatus): Promise<Project[]>;

  /**
   * Find projects by year
   *
   * @param year - Project year
   * @returns Array of projects
   */
  findByYear(year: number): Promise<Project[]>;

  /**
   * Find projects by type
   *
   * @param type - Project type
   * @returns Array of projects
   */
  findByType(type: ProjectType): Promise<Project[]>;

  /**
   * Create new project
   *
   * @param data - Project data
   * @returns Created project
   */
  create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'finalizedAt'>): Promise<Project>;

  /**
   * Update existing project
   *
   * @param id - Project ID
   * @param data - Updated project data
   * @returns Updated project
   */
  update(id: string, data: Partial<Project>): Promise<Project>;

  /**
   * Delete project
   *
   * @param id - Project ID
   */
  delete(id: string): Promise<void>;

  /**
   * Add special user to project
   *
   * @param projectId - Project ID
   * @param userId - User ID
   */
  addSpecialUser(projectId: string, userId: string): Promise<void>;

  /**
   * Remove special user from project
   *
   * @param projectId - Project ID
   * @param userId - User ID
   */
  removeSpecialUser(projectId: string, userId: string): Promise<void>;

  /**
   * Get next sequence number for year
   *
   * @param year - Project year
   * @returns Next sequence number
   */
  getNextSequenceForYear(year: number): Promise<number>;
}
