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
    throw new Error('Not implemented');
  }

  /**
   * Exports tournament data in TODS (Tennis Open Data Standard) format.
   * @param tournamentId - The identifier of the tournament to export
   * @returns Promise resolving to binary data in TODS format
   */
  public async exportToTODS(tournamentId: string): Promise<Uint8Array> {
    throw new Error('Not implemented');
  }

  /**
   * Exports generic data to CSV format.
   * @param data - An array of objects to export as CSV
   * @returns Promise resolving to CSV-formatted string
   */
  public async exportToCsv(data: unknown[]): Promise<string> {
    throw new Error('Not implemented');
  }
}
