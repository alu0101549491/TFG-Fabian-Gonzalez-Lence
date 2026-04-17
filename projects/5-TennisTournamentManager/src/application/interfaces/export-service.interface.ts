/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/interfaces/export-service.interface.ts
 * @desc Export service interface for tournament data exports (FR61-FR63)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {TournamentStatisticsDto} from '../dto/statistics.dto';
import {ExportResultDto} from '../dto/export.dto';
import {ExportFormat} from '../../domain/enumerations/export-format';

/**
 * Export service interface.
 * Handles tournament data exports in various formats (ITF, TODS, PDF, Excel).
 * 
 * @remarks
 * This service implements functional requirements FR61-FR63:
 * - FR61: ITF format export (structured CSV)
 * - FR62: TODS format export (Tennis Open Data Standards)
 * - FR63: Statistics export (PDF and Excel)
 * 
 * @example
 * ```typescript
 * // Export tournament in ITF format
 * await exportService.exportToITF('tournament-123');
 * 
 * // Export precomputed statistics to PDF
 * const stats = await statisticsService.getDetailedTournamentStatistics('tournament-123');
 * const result = await exportService.exportTournamentStatistics(stats, ExportFormat.PDF);
 * ```
 */
export interface IExportService {
  /**
   * Exports tournament data in ITF (International Tennis Federation) CSV format.
   * Implements FR61: ITF format export.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when the browser download has been triggered
   * @throws Error if tournament not found or export fails
   */
  exportToITF(tournamentId: string): Promise<void>;

  /**
   * Exports tournament data in TODS (Tennis Open Data Standards) format.
   * Implements FR62: TODS format export.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when the browser download has been triggered
   * @throws Error if tournament not found or export fails
   */
  exportToTODS(tournamentId: string): Promise<void>;

  /**
   * Exports tournament results as PDF document.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when the browser download has been triggered
   * @throws Error if export fails or tournament not found
   */
  exportResultsToPDF(tournamentId: string): Promise<void>;

  /**
   * Exports tournament results as Excel spreadsheet.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when the browser download has been triggered
   * @throws Error if export fails or tournament not found
   */
  exportResultsToExcel(tournamentId: string): Promise<void>;

  /**
   * Exports a bracket as PDF document.
   *
   * @param bracketId - Unique identifier of the bracket
   * @returns Promise that resolves when the browser download has been triggered
   * @throws Error if export fails or bracket not found
   */
  exportBracketToPDF(bracketId: string): Promise<void>;

  /**
   * Exports tournament statistics from TournamentStatisticsDto.
   * Generates a downloadable export result from pre-computed statistics data.
   * 
   * @param tournamentStats - Pre-computed tournament statistics
   * @param format - Export format (PDF or EXCEL)
   * @returns Promise resolving to export result
   */
  exportTournamentStatistics(
    tournamentStats: TournamentStatisticsDto,
    format: ExportFormat.PDF | ExportFormat.EXCEL,
  ): Promise<ExportResultDto>;

  /**
   * Downloads export result in the browser.
   * Creates a temporary download link and triggers the download.
   * 
   * @param result - Export result to download
   * @throws Error if export result is invalid
   * 
   */
  downloadExportResult(result: ExportResultDto): void;
}
