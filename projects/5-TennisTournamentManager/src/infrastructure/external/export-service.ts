/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/external/export-service.ts
 * @desc Data export adapter for ITF/TODS tournament data formats
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Export service adapter.
 * Provides data export functionality for tournament data in various formats.
 * Supports ITF (International Tennis Federation) and TODS (Tennis Open Data Standard) formats.
 */
export class ExportServiceAdapter {
  /**
   * Creates an instance of ExportServiceAdapter.
   */
  constructor() {}

  /**
   * Exports tournament data in ITF format.
   * @param tournamentId - The identifier of the tournament to export
   * @returns Promise resolving to binary data in ITF format
   */
  public async exportToITF(tournamentId: string): Promise<Uint8Array> {
    // Validate input
    if (!tournamentId) {
      throw new Error('Tournament ID is required');
    }

    // In production, fetch tournament data and format according to ITF standards
    console.log(`[EXPORT] Exporting tournament ${tournamentId} to ITF format`);

    // Simulate async operation and generate placeholder data
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Return placeholder binary data
    const placeholder = `ITF Export for Tournament ${tournamentId}`;
    return new TextEncoder().encode(placeholder);
  }

  /**
   * Exports tournament data in TODS (Tennis Open Data Standard) format.
   * @param tournamentId - The identifier of the tournament to export
   * @returns Promise resolving to binary data in TODS format
   */
  public async exportToTODS(tournamentId: string): Promise<Uint8Array> {
    // Validate input
    if (!tournamentId) {
      throw new Error('Tournament ID is required');
    }

    // In production, fetch tournament data and format according to TODS standards
    console.log(`[EXPORT] Exporting tournament ${tournamentId} to TODS format`);

    // Simulate async operation and generate placeholder data
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Return placeholder binary data
    const placeholder = `TODS Export for Tournament ${tournamentId}`;
    return new TextEncoder().encode(placeholder);
  }

  /**
   * Exports generic data to CSV format.
   * @param data - An array of objects to export as CSV
   * @returns Promise resolving to CSV-formatted string
   */
  public async exportToCsv(data: unknown[]): Promise<string> {
    // Validate input
    if (!data || data.length === 0) {
      throw new Error('Data array is required and must not be empty');
    }

    // Generate CSV from array of objects
    const rows: unknown[] = data;
    if (rows.length === 0) {
      return '';
    }

    // Extract headers from first object
    const headers = Object.keys(rows[0] as Record<string, unknown>);
    const csvHeaders = headers.join(',');

    // Generate CSV rows
    const csvRows = rows.map((row) => {
      return headers.map((header) => {
        const value = (row as Record<string, unknown>)[header];
        // Escape commas and quotes in values
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(',');
    });

    console.log(`[EXPORT] Exported ${rows.length} rows to CSV`);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 50));

    return [csvHeaders, ...csvRows].join('\n');
  }
}
