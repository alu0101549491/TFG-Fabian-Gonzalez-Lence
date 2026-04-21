/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/domain/enumerations/export-format.ts
 * @desc Export format enumeration for tournament data exports (FR61-FR63)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Export format options for tournament data.
 * Defines supported export formats according to FR61-FR63.
 * 
 * @remarks
 * Used by ExportService to determine output format.
 * Different formats serve different purposes:
 * - ITF_CSV: Official ITF tournament reporting
 * - TODS: Tennis Open Data Standards (JSON-based)
 * - PDF: Human-readable statistics and results
 * - EXCEL: Spreadsheet format for data analysis
 * - CSV: Generic CSV for flexibility
 * 
 * @example
 * ```typescript
 * const format = ExportFormat.ITF_CSV;
 * await exportService.exportTournament(tournamentId, format);
 * ```
 */
export enum ExportFormat {
  /**
   * ITF (International Tennis Federation) format.
   * Structured CSV according to ITF standard for official tournament reporting.
   * Used for submitting results to ITF database.
   */
  ITF_CSV = 'ITF_CSV',

  /**
   * TODS (Tennis Open Data Standards) format.
   * JSON-based standard for interoperability between tennis systems.
   * Enables data exchange with other tournament software.
   */
  TODS = 'TODS',

  /**
   * PDF (Portable Document Format).
   * Human-readable format for statistics and results.
   * Used for printing and archival purposes.
   */
  PDF = 'PDF',

  /**
   * Excel (Microsoft Excel format - .xlsx).
   * Spreadsheet format for detailed data analysis.
   * Allows administrators to manipulate and analyze tournament data.
   */
  EXCEL = 'EXCEL',

  /**
   * Generic CSV (Comma-Separated Values).
   * Simple text format for maximum compatibility.
   * Used for custom data processing and integration.
   */
  CSV = 'CSV',
}
