import {Project} from '@domain/entities/Project';
import {ProjectData} from '../../dtos/ProjectData';
import {Permission} from '@domain/entities/Permission';

/**
 * Project service interface
 * Handles project management operations
 */
export interface IProjectService {
  /**
   * Creates a new project
   * @param projectData - Project creation data
   * @returns Created project entity
   */
  createProject(projectData: ProjectData): Promise<Project>;

  /**
   * Assigns project to a client
   * @param projectId - Project ID
   * @param clientId - Client user ID
   */
  assignProjectToClient(projectId: string, clientId: string): Promise<void>;

  /**
   * Adds special user to project with permissions
   * @param projectId - Project ID
   * @param userId - Special user ID
   * @param permissions - Set of permissions
   */
  addSpecialUserToProject(
    projectId: string,
    userId: string,
    permissions: Set<Permission>,
  ): Promise<void>;

  /**
   * Gets projects accessible by user
   * @param userId - User ID
   * @returns List of user's projects
   */
  getProjectsByUser(userId: string): Promise<Project[]>;

  /**
   * Finalizes a project
   * @param projectId - Project ID
   */
  finalizeProject(projectId: string): Promise<void>;

  /**
   * Gets detailed project information
   * @param projectId - Project ID
   * @param userId - Requesting user ID
   * @returns Project details
   */
  getProjectDetails(projectId: string, userId: string): Promise<Project>;
}