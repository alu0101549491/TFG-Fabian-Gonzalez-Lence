import {ExportFilters} from '../../dtos/ExportFilters';

/**
 * Export service interface
 * Handles data export in various formats
 */
export interface IExportService {
  /**
   * Exports projects to file
   * @param filters - Export filters
   * @returns Export file as buffer
   */
  exportProjects(filters: ExportFilters): Promise<Buffer>;

  /**
   * Exports tasks to file
   * @param filters - Export filters
   * @returns Export file as buffer
   */
  exportTasks(filters: ExportFilters): Promise<Buffer>;

  /**
   * Exports data to CSV format
   * @param data - Data to export
   * @returns CSV file as buffer
   */
  exportToCSV(data: unknown[]): Promise<Buffer>;

  /**
   * Exports data to PDF format
   * @param data - Data to export
   * @returns PDF file as buffer
   */
  exportToPDF(data: unknown[]): Promise<Buffer>;
}