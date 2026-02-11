/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/interfaces/project-service.interface.ts
 * @desc Service interface for project lifecycle management.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type CreateProjectDto,
  type UpdateProjectDto,
  type ProjectDto,
  type ProjectDetailsDto,
  type ProjectSummaryDto,
  type ProjectFilterDto,
  type ProjectListResponseDto,
  type CalendarProjectDto,
  type ParticipantDto,
  type ValidationResultDto,
} from '../dto';
import {AccessRight} from '../../domain/enumerations/access-right';

/**
 * Service interface for project management operations.
 * Handles creation, modification, deletion, assignment, finalization,
 * and querying of cartographic projects.
 */
export interface IProjectService {
  /**
   * Creates a new cartographic project.
   * @param data - Project creation data
   * @param creatorId - The unique identifier of the user creating the project
   * @returns The created project data transfer object
   * @throws {ValidationError} If project data is invalid
   * @throws {ConflictError} If project code already exists
   */
  createProject(
    data: CreateProjectDto,
    creatorId: string,
  ): Promise<ProjectDto>;

  /**
   * Updates an existing project.
   * @param data - Project update data including ID
   * @param userId - The unique identifier of the user performing the update
   * @returns The updated project data transfer object
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {ValidationError} If update data is invalid
   */
  updateProject(data: UpdateProjectDto, userId: string): Promise<ProjectDto>;

  /**
   * Deletes a project and all associated data.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the user performing the deletion
   * @returns Promise that resolves when deletion is complete
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have permission
   * @throws {BusinessLogicError} If project cannot be deleted (e.g., finalized)
   */
  deleteProject(projectId: string, userId: string): Promise<void>;

  /**
   * Retrieves detailed information about a specific project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the requesting user
   * @returns Comprehensive project details
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getProjectById(
    projectId: string,
    userId: string,
  ): Promise<ProjectDetailsDto>;

  /**
   * Retrieves summary information about a specific project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the requesting user
   * @returns Project summary data
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getProjectSummary(
    projectId: string,
    userId: string,
  ): Promise<ProjectSummaryDto>;

  /**
   * Retrieves all projects accessible by a specific user with optional filtering.
   * @param userId - The unique identifier of the user
   * @param filters - Optional filters for project list
   * @returns Paginated list of projects
   * @throws {NotFoundError} If user doesn't exist
   */
  getProjectsByUser(
    userId: string,
    filters?: ProjectFilterDto,
  ): Promise<ProjectListResponseDto>;

  /**
   * Retrieves all projects in the system with optional filtering (admin only).
   * @param filters - Optional filters for project list
   * @returns Paginated list of all projects
   * @throws {UnauthorizedError} If user is not an admin
   */
  getAllProjects(filters?: ProjectFilterDto): Promise<ProjectListResponseDto>;

  /**
   * Retrieves active (non-finalized) projects for a user.
   * @param userId - The unique identifier of the user
   * @returns Array of active project summaries
   * @throws {NotFoundError} If user doesn't exist
   */
  getActiveProjects(userId: string): Promise<ProjectSummaryDto[]>;

  /**
   * Retrieves projects within a date range for calendar display.
   * @param userId - The unique identifier of the user
   * @param startDate - Start date of the range
   * @param endDate - End date of the range
   * @returns Array of projects with calendar-specific data
   * @throws {NotFoundError} If user doesn't exist
   * @throws {ValidationError} If date range is invalid
   */
  getProjectsForCalendar(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarProjectDto[]>;

  /**
   * Assigns a project to a client user.
   * @param projectId - The unique identifier of the project
   * @param clientId - The unique identifier of the client user
   * @param adminId - The unique identifier of the admin performing the assignment
   * @returns Promise that resolves when assignment is complete
   * @throws {NotFoundError} If project or client doesn't exist
   * @throws {UnauthorizedError} If admin doesn't have permission
   * @throws {ValidationError} If client is not a client role user
   */
  assignProjectToClient(
    projectId: string,
    clientId: string,
    adminId: string,
  ): Promise<void>;

  /**
   * Adds a special user to a project with specific permissions.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the user to add
   * @param permissions - Array of access rights to grant
   * @param adminId - The unique identifier of the admin performing the action
   * @returns Promise that resolves when user is added
   * @throws {NotFoundError} If project or user doesn't exist
   * @throws {UnauthorizedError} If admin doesn't have permission
   * @throws {ConflictError} If user is already a participant
   */
  addSpecialUser(
    projectId: string,
    userId: string,
    permissions: AccessRight[],
    adminId: string,
  ): Promise<void>;

  /**
   * Removes a special user from a project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the user to remove
   * @param adminId - The unique identifier of the admin performing the action
   * @returns Promise that resolves when user is removed
   * @throws {NotFoundError} If project or user doesn't exist
   * @throws {UnauthorizedError} If admin doesn't have permission
   */
  removeSpecialUser(
    projectId: string,
    userId: string,
    adminId: string,
  ): Promise<void>;

  /**
   * Updates permissions for a special user in a project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the user
   * @param permissions - New array of access rights
   * @param adminId - The unique identifier of the admin performing the action
   * @returns Promise that resolves when permissions are updated
   * @throws {NotFoundError} If project or user doesn't exist
   * @throws {UnauthorizedError} If admin doesn't have permission
   */
  updateSpecialUserPermissions(
    projectId: string,
    userId: string,
    permissions: AccessRight[],
    adminId: string,
  ): Promise<void>;

  /**
   * Retrieves all participants (client and special users) of a project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the requesting user
   * @returns Array of participant information
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access
   */
  getProjectParticipants(
    projectId: string,
    userId: string,
  ): Promise<ParticipantDto[]>;

  /**
   * Finalizes a project, marking it as completed.
   * @param projectId - The unique identifier of the project
   * @param adminId - The unique identifier of the admin finalizing the project
   * @returns Promise that resolves when project is finalized
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If admin doesn't have permission
   * @throws {BusinessLogicError} If project has pending tasks
   */
  finalizeProject(projectId: string, adminId: string): Promise<void>;

  /**
   * Reopens a finalized project.
   * @param projectId - The unique identifier of the project
   * @param adminId - The unique identifier of the admin reopening the project
   * @returns Promise that resolves when project is reopened
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If admin doesn't have permission
   * @throws {BusinessLogicError} If project is not finalized
   */
  reopenProject(projectId: string, adminId: string): Promise<void>;

  /**
   * Checks if a project code already exists in the system.
   * @param code - The project code to check
   * @returns True if the code exists, false otherwise
   */
  checkProjectCodeExists(code: string): Promise<boolean>;

  /**
   * Validates project data before creation or update.
   * @param data - Project data to validate
   * @returns Validation result with any errors or warnings
   */
  validateProjectData(
    data: CreateProjectDto | UpdateProjectDto,
  ): Promise<ValidationResultDto>;
}
