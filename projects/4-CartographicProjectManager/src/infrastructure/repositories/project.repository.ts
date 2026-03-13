/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/project.repository.ts
 * @desc Project repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {Project} from '../../domain/entities/project';
import {GeoCoordinates} from '../../domain/value-objects/geo-coordinates';
import {type ProjectStatus} from '../../domain/enumerations/project-status';
import {type ProjectType} from '../../domain/enumerations/project-type';
import {type UserRole} from '../../domain/enumerations/user-role';
import {
  type IProjectRepository,
  type ProjectFindQuery,
} from '../../domain/repositories/project-repository.interface';
import type {CreateProjectDto} from '../../application/dto/project-data.dto';

/**
 * User data from backend API
 */
interface UserApiResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Special user project relation from backend API
 */
interface SpecialUserProjectApiResponse {
  projectId: string;
  userId: string;
  accessRights: string[];
  user: UserApiResponse;
}

/**
 * API response type for project data from backend
 */
interface ProjectApiResponse {
  id: string;
  creatorId: string;
  code: string;
  name: string;
  year: number;
  clientId: string;
  type: ProjectType;
  coordinateX: number | null;
  coordinateY: number | null;
  contractDate: string;
  deliveryDate: string;
  status: ProjectStatus;
  dropboxFolderId: string | null;
  specialUserIds: string[];
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
  currentUserPermissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canFinalize: boolean;
    canCreateTask: boolean;
    canSendMessage: boolean;
    canUploadFile: boolean;
    canDownloadFile: boolean;
    canManageParticipants: boolean;
  };
  client?: UserApiResponse;
  specialUsers?: SpecialUserProjectApiResponse[];
}

/**
 * API response type for project summary data from backend.
 */
interface ProjectSummaryApiResponse {
  id: string;
  code: string;
  name: string;
  clientId: string;
  clientName: string;
  type: ProjectType;
  deliveryDate: string;
  status: ProjectStatus;
  pendingTasksCount: number;
  unreadMessagesCount: number;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project repository implementation using HTTP API.
 *
 * Handles cartographic project data operations including CRUD,
 * filtering by status/type/year, and specialized queries.
 *
 * @example
 * ```typescript
 * const repository = new ProjectRepository();
 * const projects = await repository.findByClientId('client_123');
 * ```
 */
export class ProjectRepository implements IProjectRepository {
  private readonly baseUrl = '/projects';

  /**
   * Find projects matching a query object.
   */
  public async find(query?: ProjectFindQuery): Promise<Project[]> {
    const params: Record<string, string> = {};

    if (query?.clientId) {
      params.clientId = query.clientId;
    }
    if (query?.specialUserId) {
      params.specialUserId = query.specialUserId;
    }
    if (query?.status) {
      params.status = query.status;
    }
    if (query?.year != null) {
      params.year = String(query.year);
    }
    if (query?.type) {
      params.type = query.type;
    }
    if (query?.active != null) {
      params.active = String(query.active);
    }

    const url = this.buildUrlWithParams(this.baseUrl, params);
    const response = await httpClient.get<ProjectApiResponse[]>(url);
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find project summaries (denormalized list payload) to avoid N+1 client calls.
   */
  public async findSummaries(filters?: {
    status?: ProjectStatus;
    year?: number;
    type?: ProjectType;
    clientId?: string;
    specialUserId?: string;
  }): Promise<ProjectSummaryApiResponse[]> {
    const params: Record<string, string> = {};

    if (filters?.status) {
      params.status = filters.status;
    }
    if (filters?.year != null) {
      params.year = String(filters.year);
    }
    if (filters?.type) {
      params.type = filters.type;
    }
    if (filters?.clientId) {
      params.clientId = filters.clientId;
    }
    if (filters?.specialUserId) {
      params.specialUserId = filters.specialUserId;
    }

    const url = this.buildUrlWithParams(`${this.baseUrl}/summaries`, params);
    const response = await httpClient.get<ProjectSummaryApiResponse[]>(url);
    return response.data;
  }

  /**
   * Build a URL with encoded query params.
   *
   * @param baseUrl - Base URL path
   * @param params - Query parameters
   * @returns URL with encoded query string
   */
  private buildUrlWithParams(
    baseUrl: string,
    params: Record<string, string>,
  ): string {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Find project by unique identifier
   *
   * @param id - Project ID
   * @returns Project entity or null if not found
   */
  public async findById(id: string): Promise<Project | null> {
    try {
      const response = await httpClient.get<ProjectApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get project with full participant details (client and special users)
   *
   * @param id - Project ID
   * @returns Project API response with client and specialUsers or null if not found
   */
  public async getProjectWithParticipants(id: string): Promise<ProjectApiResponse | null> {
    try {
      const response = await httpClient.get<ProjectApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return response.data;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find project by unique code
   *
   * @param code - Project code (e.g., CART-2025-001)
   * @returns Project entity or null if not found
   */
  public async findByCode(code: string): Promise<Project | null> {
    try {
      const response = await httpClient.get<ProjectApiResponse>(
        `${this.baseUrl}/code/${encodeURIComponent(code)}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new project
   *
   * @param project - Project entity to persist
   * @returns Created project with generated fields
   */
  public async save(project: Project): Promise<Project> {
    const response = await httpClient.post<ProjectApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(project),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Create new project from DTO (without entity)
   *
   * @param data - Project creation data
   * @returns Created project entity
   */
  public async createFromDto(data: CreateProjectDto): Promise<Project> {
    const payload = {
      year: data.year,
      code: data.code,
      name: data.name,
      clientId: data.clientId,
      type: data.type,
      coordinateX: data.coordinateX,
      coordinateY: data.coordinateY,
      contractDate: data.contractDate.toISOString(),
      deliveryDate: data.deliveryDate.toISOString(),
    };

    const response = await httpClient.post<ProjectApiResponse>(
      this.baseUrl,
      payload,
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Update existing project
   *
   * @param project - Project entity with updated data
   * @returns Updated project entity
   */
  /**
   * Update project
   *
   * @param project - Project entity to update
   * @returns Updated project
   */
  public async update(project: Project): Promise<Project> {
    // Send only updatable fields to backend
    const updatePayload: Record<string, unknown> = {
      name: project.name,
      type: project.type,
      clientId: project.clientId,
      contractDate: project.contractDate.toISOString(),
      deliveryDate: project.deliveryDate.toISOString(),
      status: project.status,
      dropboxFolderId: project.dropboxFolderId ?? '',
    };
    
    // Include optional fields only if they have values
    if (project.coordinates) {
      updatePayload.coordinateX = project.coordinates.longitude;
      updatePayload.coordinateY = project.coordinates.latitude;
    } else {
      updatePayload.coordinateX = null;
      updatePayload.coordinateY = null;
    }
    
    const response = await httpClient.put<ProjectApiResponse>(
      `${this.baseUrl}/${project.id}`,
      updatePayload,
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Delete project by ID
   *
   * @param id - Project ID to delete
   */
  public async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Find all projects assigned to specific client
   *
   * @param clientId - Client user ID
   * @returns Array of client's projects
   */
  public async findByClientId(clientId: string): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {clientId});
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find projects accessible by special user
   *
   * @param userId - Special user ID
   * @returns Array of accessible projects
   */
  public async findBySpecialUserId(userId: string): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {specialUserId: userId});
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find projects by status
   *
   * @param status - Project status filter
   * @returns Array of projects with specified status
   */
  public async findByStatus(status: ProjectStatus): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {status});
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find projects by year
   *
   * @param year - Project year (YYYY)
   * @returns Array of projects from specified year
   */
  public async findByYear(year: number): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {year: String(year)});
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find projects by type
   *
   * @param type - Project type filter
   * @returns Array of projects with specified type
   */
  public async findByType(type: ProjectType): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {type});
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find all projects in system
   *
   * @returns Array of all projects
   */
  public async findAll(): Promise<Project[]> {
    const response = await httpClient.get<ProjectApiResponse[]>(
      this.baseUrl,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find all active (non-archived) projects
   *
   * @returns Array of active projects
   */
  public async findAllActive(): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {active: 'true'});
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find all projects ordered by delivery date
   *
   * @param ascending - Sort direction (default true)
   * @returns Array of projects sorted by delivery date
   */
  public async findAllOrderedByDeliveryDate(
    ascending = true,
  ): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {
      sortBy: 'deliveryDate',
      order: ascending ? 'asc' : 'desc',
    });
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find projects with delivery dates in range
   *
   * @param startDate - Range start date
   * @param endDate - Range end date
   * @returns Array of projects within date range
   */
  public async findByDeliveryDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Project[]> {
    const url = this.buildUrlWithParams(this.baseUrl, {
      deliveryDateStart: startDate.toISOString(),
      deliveryDateEnd: endDate.toISOString(),
    });
    const response = await httpClient.get<ProjectApiResponse[]>(
      url,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Check if project exists by code
   *
   * @param code - Project code to check
   * @returns True if project exists
   */
  public async existsByCode(code: string): Promise<boolean> {
    const project = await this.findByCode(code);
    return project !== null;
  }

  /**
   * Count projects assigned to client
   *
   * @param clientId - Client user ID
   * @returns Number of client's projects
   */
  public async countByClientId(clientId: string): Promise<number> {
    const url = this.buildUrlWithParams(`${this.baseUrl}/count`, {clientId});
    const response = await httpClient.get<{count: number}>(
      url,
    );
    return response.data.count;
  }

  /**
   * Count projects by status
   *
   * @param status - Project status filter
   * @returns Number of projects with status
   */
  public async countByStatus(status: ProjectStatus): Promise<number> {
    const url = this.buildUrlWithParams(`${this.baseUrl}/count`, {status});
    const response = await httpClient.get<{count: number}>(
      url,
    );
    return response.data.count;
  }

  /**
   * Map API response to Project entity
   *
   * @param data - API response data
   * @returns Project domain entity
   */
  private mapToEntity(data: ProjectApiResponse): Project {
    return new Project({
      id: data.id,
      code: data.code,
      name: data.name,
      year: data.year,
      clientId: data.clientId,
      type: data.type as ProjectType,
      coordinates:
        data.coordinateX !== null && data.coordinateY !== null
          ? new GeoCoordinates(data.coordinateY, data.coordinateX)
          : null,
      contractDate: new Date(data.contractDate),
      deliveryDate: new Date(data.deliveryDate),
      status: data.status as ProjectStatus,
      dropboxFolderId: data.dropboxFolderId,
      specialUserIds: data.specialUserIds || [],
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      finalizedAt: data.finalizedAt ? new Date(data.finalizedAt) : null,
    });
  }

  /**
   * Map Project entity to API request payload
   *
   * @param project - Project domain entity
   * @returns API request payload
   */
  private mapToApiRequest(project: Project): Record<string, unknown> {
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      year: project.year,
      clientId: project.clientId,
      type: project.type,
      coordinateX: project.coordinates?.longitude || null,
      coordinateY: project.coordinates?.latitude || null,
      contractDate: project.contractDate.toISOString(),
      deliveryDate: project.deliveryDate.toISOString(),
      status: project.status,
      dropboxFolderId: project.dropboxFolderId ?? '',
      specialUserIds: project.specialUserIds,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      finalizedAt: project.finalizedAt?.toISOString() || null,
    };
  }

  /**
   * Check if error is 404 Not Found
   *
   * @param error - Error object
   * @returns True if 404 error
   */
  private isNotFoundError(error: unknown): boolean {
    const maybeError = error as {status?: number; response?: {status?: number}};
    return maybeError?.status === 404 || maybeError?.response?.status === 404;
  }
}
