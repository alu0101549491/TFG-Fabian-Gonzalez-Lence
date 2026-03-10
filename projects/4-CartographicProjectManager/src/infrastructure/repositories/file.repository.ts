/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/file.repository.ts
 * @desc File repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {File} from '../../domain/entities/file';
import {type FileType} from '../../domain/enumerations/file-type';
import {
  type FileCountQuery,
  type FileFindQuery,
  type IFileRepository,
} from '../../domain/repositories/file-repository.interface';

/**
 * API response type for file metadata from backend
 */
interface FileApiResponse {
  id: string;
  name: string;
  dropboxPath: string;
  type: string;
  sizeInBytes: number;
  uploadedBy: string;
  uploadedAt: string;
  projectId: string;
  taskId: string | null;
  messageId: string | null;
}

/**
 * File repository implementation using HTTP API.
 *
 * Manages file metadata operations for Dropbox-stored files.
 * Actual file content is handled by Dropbox service.
 *
 * @example
 * ```typescript
 * const repository = new FileRepository();
 * const projectFiles = await repository.findByProjectId('proj_123');
 * ```
 */
export class FileRepository implements IFileRepository {
  private readonly baseUrl = '/files';

  /**
   * Build a URL with encoded query params.
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
   * Find file by unique identifier
   *
   * @param id - File ID
   * @returns File entity or null if not found
   */
  public async findById(id: string): Promise<File | null> {
    try {
      const response = await httpClient.get<FileApiResponse>(
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
   * Create new file metadata
   *
   * @param file - File entity to persist
   * @returns Created file with generated fields
   */
  public async save(file: File): Promise<File> {
    const response = await httpClient.post<FileApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(file),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Delete file metadata
   *
   * @param id - File ID to delete
   */
  public async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Find files matching a query object.
   */
  public async find(query: FileFindQuery): Promise<File[]> {
    const {projectId, taskId, messageId, type, uploadedBy} = query;

    const scopeIds = [projectId, taskId, messageId].filter(Boolean);
    if (scopeIds.length > 1) {
      throw new Error('Unsupported query: only one of projectId/taskId/messageId can be provided');
    }

    if (projectId) {
      const params: Record<string, string> = {};
      if (type) params.type = type;
      const url = this.buildUrlWithParams(`/projects/${projectId}/files`, params);
      const response = await httpClient.get<FileApiResponse[]>(url);
      return response.data.map((data) => this.mapToEntity(data));
    }

    if (taskId) {
      const response = await httpClient.get<FileApiResponse[]>(
        `/tasks/${taskId}/files`,
      );
      return response.data.map((data) => this.mapToEntity(data));
    }

    if (messageId) {
      const response = await httpClient.get<FileApiResponse[]>(
        `/messages/${messageId}/files`,
      );
      return response.data.map((data) => this.mapToEntity(data));
    }

    if (uploadedBy) {
      const url = this.buildUrlWithParams(this.baseUrl, {uploadedBy});
      const response = await httpClient.get<FileApiResponse[]>(url);
      return response.data.map((data) => this.mapToEntity(data));
    }

    throw new Error('Unsupported query: expected projectId, taskId, messageId, or uploadedBy');
  }

  /**
   * Count files matching a query object.
   */
  public async count(query: FileCountQuery): Promise<number> {
    const {projectId, taskId} = query;
    if (projectId) {
      const response = await httpClient.get<{count: number}>(
        `/projects/${projectId}/files/count`,
      );
      return response.data.count;
    }
    if (taskId) {
      const response = await httpClient.get<{count: number}>(
        `/tasks/${taskId}/files/count`,
      );
      return response.data.count;
    }
    throw new Error('Unsupported query: count requires projectId or taskId');
  }

  /**
   * Find all files in project
   *
   * @param projectId - Project ID
   * @returns Array of project files
   */
  public async findByProjectId(projectId: string): Promise<File[]> {
    const response = await httpClient.get<FileApiResponse[]>(
      `/projects/${projectId}/files`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find files attached to task
   *
   * @param taskId - Task ID
   * @returns Array of task files
   */
  public async findByTaskId(taskId: string): Promise<File[]> {
    const response = await httpClient.get<FileApiResponse[]>(
      `/tasks/${taskId}/files`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find files attached to message
   *
   * @param messageId - Message ID
   * @returns Array of message files
   */
  public async findByMessageId(messageId: string): Promise<File[]> {
    const response = await httpClient.get<FileApiResponse[]>(
      `/messages/${messageId}/files`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find files by project and type
   *
   * @param projectId - Project ID
   * @param type - File type filter
   * @returns Array of matching files
   */
  public async findByProjectIdAndType(
    projectId: string,
    type: FileType,
  ): Promise<File[]> {
    const response = await httpClient.get<FileApiResponse[]>(
      `/projects/${projectId}/files?type=${type}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find files uploaded by user
   *
   * @param userId - Uploader user ID
   * @returns Array of user's uploaded files
   */
  public async findByUploadedBy(userId: string): Promise<File[]> {
    const response = await httpClient.get<FileApiResponse[]>(
      `${this.baseUrl}?uploadedBy=${userId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Count files in project
   *
   * @param projectId - Project ID
   * @returns Number of project files
   */
  public async countByProjectId(projectId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `/projects/${projectId}/files/count`,
    );
    return response.data.count;
  }

  /**
   * Count files attached to task
   *
   * @param taskId - Task ID
   * @returns Number of task files
   */
  public async countByTaskId(taskId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `/tasks/${taskId}/files/count`,
    );
    return response.data.count;
  }

  /**
   * Delete all files in project
   *
   * @param projectId - Project ID
   */
  public async deleteByProjectId(projectId: string): Promise<void> {
    await httpClient.delete(`/projects/${projectId}/files`);
  }

  /**
   * Delete all files attached to task
   *
   * @param taskId - Task ID
   */
  public async deleteByTaskId(taskId: string): Promise<void> {
    await httpClient.delete(`/tasks/${taskId}/files`);
  }

  /**
   * Delete all files attached to message
   *
   * @param messageId - Message ID
   */
  public async deleteByMessageId(messageId: string): Promise<void> {
    await httpClient.delete(`/messages/${messageId}/files`);
  }

  /**
   * Find file by Dropbox path
   *
   * @param path - Dropbox file path
   * @returns File entity or null if not found
   */
  public async findByDropboxPath(path: string): Promise<File | null> {
    try {
      const response = await httpClient.get<FileApiResponse>(
        `${this.baseUrl}?dropboxPath=${encodeURIComponent(path)}`,
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
   * Check if file exists by Dropbox path
   *
   * @param path - Dropbox file path
   * @returns True if file exists
   */
  public async existsByDropboxPath(path: string): Promise<boolean> {
    const file = await this.findByDropboxPath(path);
    return file !== null;
  }

  /**
   * Map API response to File entity
   *
   * @param data - API response data
   * @returns File domain entity
   */
  private mapToEntity(data: FileApiResponse): File {
    return new File({
      id: data.id,
      name: data.name,
      dropboxPath: data.dropboxPath,
      type: data.type as FileType,
      sizeInBytes: data.sizeInBytes,
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date(data.uploadedAt),
      projectId: data.projectId,
      taskId: data.taskId,
      messageId: data.messageId,
    });
  }

  /**
   * Map File entity to API request payload
   *
   * @param file - File domain entity
   * @returns API request payload
   */
  private mapToApiRequest(file: File): Record<string, unknown> {
    return {
      id: file.id,
      name: file.name,
      dropboxPath: file.dropboxPath,
      type: file.type,
      sizeInBytes: file.sizeInBytes,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.uploadedAt.toISOString(),
      projectId: file.projectId,
      taskId: file.taskId,
      messageId: file.messageId,
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
