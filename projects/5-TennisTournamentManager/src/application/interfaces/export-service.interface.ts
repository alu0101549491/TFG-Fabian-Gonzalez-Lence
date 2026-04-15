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

import {ExportRequestDto, ExportResultDto, StatisticsExportRequestDto} from '../dto/export.dto';
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
 * const result = await exportService.exportTournament({
 *   tournamentId: 'tournament-123',
 *   format: ExportFormat.ITF_CSV
 * });
 * 
 * // Export statistics to PDF
 * const stats = await exportService.exportStatistics({
 *   tournamentId: 'tournament-123',
 *   format: ExportFormat.PDF
 * });
 * ```
 */
export interface IExportService {
  /**
   * Exports tournament data in specified format.
   * 
   * @param request - Export request parameters
   * @returns Promise resolving to export result with binary data
   * @throws Error if tournament not found or export fails
   * 
   * @example
   * ```typescript
   * const result = await exportService.exportTournament({
   *   tournamentId: 'tournament-123',
   *   format: ExportFormat.ITF_CSV,
   *   includeStatistics: true
   * });
   * 
   * if (result.success) {
   *   // Download or save result.data
   *   console.log(`Export successful: ${result.filename}`);
   * }
   * ```
   */
  exportTournament(request: ExportRequestDto): Promise<ExportResultDto>;

  /**
   * Exports tournament data in ITF (International Tennis Federation) CSV format.
   * Implements FR61: ITF format export.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise resolving to export result with ITF-formatted CSV
   * @throws Error if tournament not found
   * 
   * @remarks
   * ITF format includes:
   * - Tournament metadata (name, dates, location)
   * - Player list with ITF IDs and rankings
   * - Match results with scores
   * - Final standings
   * 
   * @example
   * ```typescript
   * const result = await exportService.exportToITF('tournament-123');
   * // result.data contains ITF-formatted CSV
   * ```
   */
  exportToITF(tournamentId: string): Promise<ExportResultDto>;

  /**
   * Exports tournament data in TODS (Tennis Open Data Standards) format.
   * Implements FR62: TODS format export.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise resolving to export result with TODS-formatted JSON
   * @throws Error if tournament not found
   * 
   * @remarks
   * TODS format is a JSON-based standard for interoperability.
   * Enables data exchange with other tournament management systems.
   * 
   * @example
   * ```typescript
   * const result = await exportService.exportToTODS('tournament-123');
   * // result.data contains TODS-formatted JSON
   * ```
   */
  exportToTODS(tournamentId: string): Promise<ExportResultDto>;

  /**
   * Exports tournament statistics in PDF or Excel format.
   * Implements FR63: Statistics export.
   * 
   * @param request - Statistics export request parameters
   * @returns Promise resolving to export result with formatted statistics
   * @throws Error if tournament not found or format not supported
   * 
   * @remarks
   * Statistics include:
   * - Player performance metrics (win/loss, points, rankings)
   * - Match statistics (duration, scores, patterns)
   * - Tournament aggregates (total matches, participants)
   * - Head-to-head comparisons (optional)
   * 
   * @example
   * ```typescript
   * const result = await exportService.exportStatistics({
   *   tournamentId: 'tournament-123',
   *   format: ExportFormat.PDF,
   *   includeIndividualStats: true,
   *   includeHeadToHead: true
   * });
   * ```
   */
  exportStatistics(request: StatisticsExportRequestDto): Promise<ExportResultDto>;

  /**
   * Exports tournament statistics from TournamentStatisticsDto.
   * Simplified method that accepts pre-computed statistics data.
   * 
   * @param tournamentStats - Pre-computed tournament statistics
   * @param format - Export format (PDF or EXCEL)
   * @returns Promise resolving to export result
   * 
   * @remarks
   * This method is more efficient as it uses already-computed statistics
   * rather than recalculating from raw data. Use this when you already
   * have the TournamentStatisticsDto available (e.g., from the UI).
   * 
   * @example
   * ```typescript
   * const stats = await statisticsService.getDetailedTournamentStatistics(tournamentId);
   * const result = await exportService.exportTournamentStatistics(stats, ExportFormat.PDF);
   * if (result.success) {
   *   exportService.downloadExportResult(result);
   * }
   * ```
   */
  exportTournamentStatistics(tournamentStats: any, format: ExportFormat): Promise<ExportResultDto>;

  /**
   * Exports generic data to CSV format.
   * 
   * @param data - Array of objects to export
   * @param filename - Desired filename for export
   * @returns Promise resolving to export result with CSV data
   * @throws Error if data is empty or invalid
   * 
   * @remarks
   * Generic CSV export for flexibility.
   * Automatically generates headers from object keys.
   * Handles escaping of special characters.
   * 
   * @example
   * ```typescript
   * const matches = [
   *   { player1: 'Nadal', player2: 'Federer', score: '6-4 6-3' },
   *   { player1: 'Djokovic', player2: 'Murray', score: '7-5 6-4' }
   * ];
   * const result = await exportService.exportToCSV(matches, 'matches.csv');
   * ```
   */
  exportToCSV(data: unknown[], filename: string): Promise<ExportResultDto>;

  /**
   * Gets supported export formats for a tournament.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise resolving to array of supported formats
   * 
   * @remarks
   * Some formats may not be available depending on tournament state:
   * - ITF format requires completed matches
   * - TODS format requires certain metadata
   * - Statistics export requires computed statistics
   * 
   * @example
   * ```typescript
   * const formats = await exportService.getSupportedFormats('tournament-123');
   * // formats: [ExportFormat.ITF_CSV, ExportFormat.TODS, ExportFormat.PDF]
   * ```
   */
  getSupportedFormats(tournamentId: string): Promise<ExportFormat[]>;

  /**
   * Downloads export result in the browser.
   * Creates a temporary download link and triggers the download.
   * 
   * @param result - Export result to download
   * @throws Error if export result is invalid
   * 
   * @remarks
   * This method handles browser download triggering by:
   * - Creating a Blob from the binary data
   * - Generating a temporary URL
   * - Creating and clicking a download link
   * - Cleaning up resources
   * 
   * @example
   * ```typescript
   * const result = await exportService.exportStatistics({
   *   tournamentId: 'tournament-123',
   *   format: ExportFormat.PDF
   * });
   * 
   * if (result.success) {
   *   exportService.downloadExportResult(result);
   * }
   * ```
   */
  downloadExportResult(result: ExportResultDto): void;
}
