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
  type ExportDataType,
} from '../dto';

/**
 * Service interface for data export operations.
 * Handles exporting project and task data to various formats (CSV, PDF)
 * with support for filtering, progress tracking, and export history.
 */
export interface IExportService {
  /**
   * Exports data based on the provided filters.
   */
  exportData(filters: ExportFiltersDto, userId: string): Promise<ExportResultDto>;

  /**
   * Gets the progress of an ongoing export operation.
   * @param exportId - The unique identifier of the export job
   * @returns Export progress information including percentage and status
   * @throws {NotFoundError} If export job doesn't exist
   */
  getExportProgress(exportId: string, userId: string): Promise<ExportProgressDto>;

  /**
   * Retrieves information about a completed export.
   */
  getExportInfo(exportId: string, userId: string): Promise<ExportInfoDto>;

  /**
   * Lists predefined export presets.
   */
  getExportPresets(userId: string): Promise<ExportFiltersDto[]>;

  /**
   * Cancels an ongoing export operation.
   * @param exportId - The unique identifier of the export job
   * @returns Promise that resolves when export is cancelled
   * @throws {NotFoundError} If export job doesn't exist
   * @throws {BusinessLogicError} If export is already completed
   */
  cancelExport(exportId: string, userId: string): Promise<void>;

  /**
   * Retrieves the export history for a user.
   * @param userId - The unique identifier of the user
   * @returns Array of past export operations with metadata
   * @throws {NotFoundError} If user doesn't exist
   */
  deleteExport(exportId: string, userId: string): Promise<void>;

  /**
   * Validates export filters before processing.
   * @param filters - Export filters to validate
   * @returns Validation result with any errors or warnings
   */
  validateExportFilters(
    filters: ExportFiltersDto,
    userId: string,
  ): Promise<ValidationResultDto>;

  /**
   * Gets available export formats for a given data type.
   */
  getAvailableFormats(
    dataType: ExportDataType,
    userId: string,
  ): Promise<ExportFormat[]>;
}
