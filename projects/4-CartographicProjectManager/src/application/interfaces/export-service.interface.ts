/**
 * @module application/interfaces/export-service
 * @description Interface for the Export Service.
 * Defines the contract for data export operations (CSV, PDF).
 * @category Application
 */

import {type ExportFilters} from '../dto/export-filters.dto';
import {type ExportResult} from '../dto/export-result.dto';

/**
 * Contract for data export operations.
 * Handles exporting project and task data to various formats.
 */
export interface IExportService {
  /**
   * Exports project data with optional filters.
   * @param filters - Export filters and format specification.
   * @returns Export result with file data.
   */
  exportProjects(filters: ExportFilters): Promise<ExportResult>;

  /**
   * Exports task data with optional filters.
   * @param filters - Export filters and format specification.
   * @returns Export result with file data.
   */
  exportTasks(filters: ExportFilters): Promise<ExportResult>;

  /**
   * Exports data to CSV format.
   * @param data - The data to export.
   * @returns CSV file content as bytes.
   */
  exportToCSV(data: object[]): Promise<Uint8Array>;

  /**
   * Exports data to PDF format.
   * @param data - The data to export.
   * @returns PDF file content as bytes.
   */
  exportToPDF(data: object[]): Promise<Uint8Array>;
}
