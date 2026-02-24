/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/composables/use-files.ts
 * @desc Composable for file management with project and task associations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

import {ref, type Ref} from 'vue';
import {FileRepository} from '../../infrastructure/repositories/file.repository';
import type {File} from '../../domain/entities/file';
import type {FileSummaryDto} from '../../application/dto';
import {httpClient} from '../../infrastructure/http';

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Return interface for useFiles composable
 */
export interface UseFilesReturn {
  // State
  files: Ref<FileSummaryDto[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;

  // Actions
  loadFilesByProject: (projectId: string) => Promise<void>;
  loadFilesByTask: (taskId: string) => Promise<void>;
  uploadFile: (
    fileToUpload: globalThis.File,
    projectId: string,
    section: string,
    onProgress?: UploadProgressCallback
  ) => Promise<FileSummaryDto | null>;
  deleteFile: (fileId: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Composable for file management
 *
 * Provides reactive file data for projects and tasks,
 * file operations, and loading state.
 *
 * @returns File state and methods
 *
 * @example
 * ```typescript
 * const { files, loadFilesByProject, isLoading } = useFiles();
 *
 * await loadFilesByProject('project-123');
 * ```
 */
export function useFiles(): UseFilesReturn {
  const fileRepository = new FileRepository();
  
  // State
  const files = ref<FileSummaryDto[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Helper to format file size in human-readable format
   */
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Helper to map File entity to FileSummaryDto
   */
  function mapEntityToDto(file: File): FileSummaryDto {
    return {
      id: file.id,
      name: file.name,
      type: file.type,
      sizeInBytes: file.sizeInBytes,
      humanReadableSize: formatFileSize(file.sizeInBytes),
      uploadedAt: file.uploadedAt,
      uploadedBy: file.uploadedBy,
      uploaderName: 'Unknown', // Can be enhanced with user lookup
      downloadUrl: `/files/${file.id}/download`, // Constructed from file ID
    };
  }

  /**
   * Loads files for a specific project
   *
   * @param projectId - Project ID to load files for
   */
  async function loadFilesByProject(projectId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const fileEntities = await fileRepository.findByProjectId(projectId);
      files.value = fileEntities.map(mapEntityToDto);
    } catch (err: any) {
      error.value = err.message || 'Failed to load files';
      console.error('Failed to load project files:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Loads files for a specific task
   *
   * @param taskId - Task ID to load files for
   */
  async function loadFilesByTask(taskId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const fileEntities = await fileRepository.findByTaskId(taskId);
      files.value = fileEntities.map(mapEntityToDto);
    } catch (err: any) {
      error.value = err.message || 'Failed to load files';
      console.error('Failed to load task files:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Uploads a file to a project
   *
   * @param fileToUpload - File to upload
   * @param projectId - Project ID
   * @param section - Project section (e.g., "Messages", "Plans")
   * @param onProgress - Optional progress callback
   * @returns Uploaded file summary or null if failed
   */
  async function uploadFile(
    fileToUpload: globalThis.File,
    projectId: string,
    section: string,
    onProgress?: UploadProgressCallback
  ): Promise<FileSummaryDto | null> {
    error.value = null;

    try {
      const response = await httpClient.uploadFile<{file: any}>(
        '/files/upload',
        fileToUpload,
        {projectId, section},
        {
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      // Backend returns: {success: true, data: {file: {...}}, message: "..."}
      // After interceptor: response.data = {success: true, data: {file: {...}}, message: "..."}
      const fileData = (response.data as any)?.data?.file || response.data?.file;

      if (fileData) {
        const uploadedFile: FileSummaryDto = {
          id: fileData.id,
          name: fileData.name,
          type: fileData.type,
          sizeInBytes: fileData.sizeInBytes,
          humanReadableSize: formatFileSize(fileData.sizeInBytes),
          uploadedAt: fileData.uploadedAt,
          uploadedBy: fileData.uploadedBy,
          uploaderName: 'You',
          downloadUrl: `/files/${fileData.id}/download`,
        };

        // Add to local state
        files.value.push(uploadedFile);

        return uploadedFile;
      }

      return null;
    } catch (err: any) {
      error.value = err.message || 'Failed to upload file';
      console.error('Failed to upload file:', err);
      return null;
    }
  }

  /**
   * Deletes a file
   *
   * @param fileId - File ID to delete
   * @returns True if successful
   */
  async function deleteFile(fileId: string): Promise<boolean> {
    try {
      await fileRepository.delete(fileId);
      
      // Remove from local state
      const index = files.value.findIndex(f => f.id === fileId);
      if (index !== -1) {
        files.value.splice(index, 1);
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete file';
      console.error('Failed to delete file:', err);
      return false;
    }
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    files,
    isLoading,
    error,
    loadFilesByProject,
    loadFilesByTask,
    uploadFile,
    deleteFile,
    clearError,
  };
}
