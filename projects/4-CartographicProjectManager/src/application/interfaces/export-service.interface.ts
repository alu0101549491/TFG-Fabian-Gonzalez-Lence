/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/interfaces/export-service.interface.ts
 * @desc Service interface for data export operations in multiple formats.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {
  type ExportFiltersDto,
  type ExportResultDto,
  type ExportProgressDto,
  type ExportInfoDto,
  type ValidationResultDto,
  type ExportFormat,
} from '../dto';

/**
 * Service interface for data export operations.
 * Handles exporting project and task data to various formats (CSV, PDF)
 * with support for filtering, progress tracking, and export history.
 */
export interface IExportService {
  /**
   * Exports project data with optional filters.
   * @param filters - Export filters including date range, status, and format
   * @param userId - The unique identifier of the user requesting the export
   * @returns Export result with file data or job ID for async exports
   * @throws {UnauthorizedError} If user doesn't have export permission
   * @throws {ValidationError} If filters are invalid
   */
  exportProjects(
    filters: ExportFiltersDto,
    userId: string,
  ): Promise<ExportResultDto>;

  /**
   * Exports task data with optional filters.
   * @param filters - Export filters including date range, status, and format
   * @param userId - The unique identifier of the user requesting the export
   * @returns Export result with file data or job ID for async exports
   * @throws {UnauthorizedError} If user doesn't have export permission
   * @throws {ValidationError} If filters are invalid
   */
  exportTasks(
    filters: ExportFiltersDto,
    userId: string,
  ): Promise<ExportResultDto>;

  /**
   * Exports a comprehensive report for a specific project.
   * @param projectId - The unique identifier of the project
   * @param userId - The unique identifier of the user requesting the report
   * @param format - The export format (CSV or PDF)
   * @returns Export result with report file data
   * @throws {NotFoundError} If project doesn't exist
   * @throws {UnauthorizedError} If user doesn't have access to project
   */
  exportProjectReport(
    projectId: string,
    userId: string,
    format: ExportFormat,
  ): Promise<ExportResultDto>;

  /**
   * Gets the progress of an ongoing export operation.
   * @param exportId - The unique identifier of the export job
   * @returns Export progress information including percentage and status
   * @throws {NotFoundError} If export job doesn't exist
   */
  getExportProgress(exportId: string): Promise<ExportProgressDto>;

  /**
   * Cancels an ongoing export operation.
   * @param exportId - The unique identifier of the export job
   * @returns Promise that resolves when export is cancelled
   * @throws {NotFoundError} If export job doesn't exist
   * @throws {BusinessLogicError} If export is already completed
   */
  cancelExport(exportId: string): Promise<void>;

  /**
   * Retrieves the export history for a user.
   * @param userId - The unique identifier of the user
   * @returns Array of past export operations with metadata
   * @throws {NotFoundError} If user doesn't exist
   */
  getExportHistory(userId: string): Promise<ExportInfoDto[]>;

  /**
   * Deletes an export file and its metadata.
   * @param exportId - The unique identifier of the export
   * @param userId - The unique identifier of the user performing the deletion
   * @returns Promise that resolves when export is deleted
   * @throws {NotFoundError} If export doesn't exist
   * @throws {UnauthorizedError} If user doesn't own the export
   */
  deleteExport(exportId: string, userId: string): Promise<void>;

  /**
   * Validates export filters before processing.
   * @param filters - Export filters to validate
   * @returns Validation result with any errors or warnings
   */
  validateExportFilters(
    filters: ExportFiltersDto,
  ): Promise<ValidationResultDto>;
}
