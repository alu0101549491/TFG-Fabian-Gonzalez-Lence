import {Project} from '../entities/Project';

/**
 * Repository interface for Project entity persistence
 */
export interface IProjectRepository {
  /**
   * Finds a project by ID
   * @param id - Project ID
   * @returns Project entity or null if not found
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Saves a new project
   * @param project - Project entity to save
   * @returns Saved project entity
   */
  save(project: Project): Promise<Project>;

  /**
   * Updates an existing project
   * @param project - Project entity to update
   * @returns Updated project entity
   */
  update(project: Project): Promise<Project>;

  /**
   * Finds projects assigned to a client
   * @param clientId - Client user ID
   * @returns List of client's projects
   */
  findByClientId(clientId: string): Promise<Project[]>;

  /**
   * Finds projects accessible by a special user
   * @param userId - Special user ID
   * @returns List of accessible projects
   */
  findBySpecialUserId(userId: string): Promise<Project[]>;

  /**
   * Retrieves all projects
   * @returns List of all projects
   */
  findAll(): Promise<Project[]>;
}