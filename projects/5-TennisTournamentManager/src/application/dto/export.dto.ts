/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/dto/export.dto.ts
 * @desc Data Transfer Objects for export operations (FR61-FR63)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {ExportFormat} from '../../domain/enumerations/export-format';

/**
 * DTO for export request parameters.
 * Contains all necessary information to perform a tournament data export.
 * 
 * @example
 * ```typescript
 * const request: ExportRequestDto = {

 *   format: ExportFormat.ITF_CSV,
 *   includeStatistics: true,
 *   includeMatches: true,
 *   includePlayers: true
 * };
 * ```
 */
export interface ExportRequestDto {
  /**
   * Unique identifier of the tournament to export.
   * Required for all export operations.
   */
  readonly tournamentId: string;

  /**
   * Desired export format.
   * Determines the structure and content of the output file.
   */
  readonly format: ExportFormat;

  /**
   * Whether to include statistics in the export.
   * @defaultValue true
   */
  readonly includeStatistics?: boolean;

  /**
   * Whether to include match results in the export.
   * @defaultValue true
   */
  readonly includeMatches?: boolean;

  /**
   * Whether to include player/participant data in the export.
   * @defaultValue true
   */
  readonly includePlayers?: boolean;

  /**
   * Whether to include bracket/draw structure.
   * @defaultValue true
   */
  readonly includeBrackets?: boolean;

  /**
   * Optional phase ID to export specific phase only.
   * If not provided, exports entire tournament.
   */
  readonly phaseId?: string;

  /**
   * Optional category ID to export specific category only.
   * If not provided, exports all categories.
   */
  readonly categoryId?: string;
}

/**
 * DTO for export response result.
 * Contains the exported data and metadata about the export operation.
 * 
 * @example
 * ```typescript
 * const result: ExportResultDto = {
 *   success: true,
 *   format: ExportFormat.ITF_CSV,
 *   data: new Uint8Array([...]),
 *   filename: 'tournament-2026-results.csv',
 *   mimeType: 'text/csv',
 *   exportedAt: new Date()
 * };
 * ```
 */
export interface ExportResultDto {
  /**
   * Whether the export operation succeeded.
   */
  readonly success: boolean;

  /**
   * Format of the exported data.
   */
  readonly format: ExportFormat;

  /**
   * The exported data as binary content.
   * Can be saved to file or sent as HTTP response.
   */
  readonly data?: Uint8Array | string;

  /**
   * Suggested filename for the export.
   * Includes appropriate file extension.
   */
  readonly filename?: string;

  /**
   * MIME type for HTTP Content-Type header.
   * Used when serving export as download.
   */
  readonly mimeType?: string;

  /**
   * Timestamp when export was generated.
   */
  readonly exportedAt: Date;

  /**
   * Number of records included in export.
   * Useful for validation and logging.
   */
  readonly recordCount?: number;

  /**
   * Error message if export failed.
   * Only present when success is false.
   */
  readonly error?: string;

  /**
   * Detailed error information for debugging.
   * Only present when success is false.
   */
  readonly errorDetails?: Record<string, unknown>;
}

/**
 * DTO for statistics export request.
 * Specialized request for exporting statistics only (FR63).
 * 
 * @example
 * ```typescript
 * const request: StatisticsExportRequestDto = {
 *   tournamentId: 'tournament-123',
 *   format: ExportFormat.PDF,
 *   includeIndividualStats: true,
 *   includeTeamStats: false,
 *   includeHeadToHead: true
 * };
 * ```
 */
export interface StatisticsExportRequestDto {
  /**
   * Unique identifier of the tournament.
   */
  readonly tournamentId: string;

  /**
   * Export format (typically PDF or EXCEL for statistics).
   */
  readonly format: ExportFormat.PDF | ExportFormat.EXCEL;

  /**
   * Whether to include individual player statistics.
   * @defaultValue true
   */
  readonly includeIndividualStats?: boolean;

  /**
   * Whether to include team/category aggregate statistics.
   * @defaultValue true
   */
  readonly includeTeamStats?: boolean;

  /**
   * Whether to include head-to-head comparisons.
   * @defaultValue false
   */
  readonly includeHeadToHead?: boolean;

  /**
   * Optional participant ID to export statistics for specific player only.
   */
  readonly participantId?: string;

  /**
   * Optional category ID to export statistics for specific category only.
   */
  readonly categoryId?: string;
}
