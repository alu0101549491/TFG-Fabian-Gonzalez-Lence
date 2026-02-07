/**
 * @module application/interfaces/project-service
 * @description Interface for the Project Service.
 * Defines the contract for project lifecycle management.
 * @category Application
 */

import {type Project} from '@domain/entities/project';
import {type Permission} from '@domain/entities/permission';
import {type ProjectData} from '../dto/project-data.dto';
import {type ProjectDetails} from '../dto/project-details.dto';

/**
 * Contract for project management operations.
 * Handles creation, assignment, finalization, and querying of projects.
 */
export interface IProjectService {
  /**
   * Creates a new cartographic project.
   * Automatically creates the associated Dropbox folder.
   * @param projectData - Data for the new project.
   * @returns The created project entity.
   */
  createProject(projectData: ProjectData): Promise<Project>;

  /**
   * Assigns a project to a client user.
   * @param projectId - The project's unique ID.
   * @param clientId - The client's unique ID.
   */
  assignProjectToClient(projectId: string, clientId: string): Promise<void>;

  /**
   * Adds a special user to a project with specific permissions.
   * @param projectId - The project's unique ID.
   * @param userId - The special user's unique ID.
   * @param permissions - Set of permissions to grant.
   */
  addSpecialUserToProject(
    projectId: string,
    userId: string,
    permissions: Set<Permission>,
  ): Promise<void>;

  /**
   * Retrieves all projects accessible by a specific user.
   * @param userId - The user's unique ID.
   * @returns Array of projects the user can access.
   */
  getProjectsByUser(userId: string): Promise<Project[]>;

  /**
   * Finalizes a project, marking it as completed.
   * @param projectId - The project's unique ID.
   */
  finalizeProject(projectId: string): Promise<void>;

  /**
   * Retrieves detailed information about a project.
   * @param projectId - The project's unique ID.
   * @param userId - The requesting user's ID (for permission checks).
   * @returns Comprehensive project details.
   */
  getProjectDetails(
    projectId: string,
    userId: string,
  ): Promise<ProjectDetails>;
}
