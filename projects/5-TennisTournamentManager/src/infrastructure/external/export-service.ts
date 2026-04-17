/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file src/infrastructure/external/export-service.ts
 * @desc Data export adapter for ITF/TODS tournament data formats
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {AxiosClient} from '@infrastructure/http/axios-client';

/**
 * Export service adapter.
 * Provides data export functionality for tournament data in various formats.
 * Supports ITF (International Tennis Federation) and TODS (Tennis Open Data Standard) formats.
 */
@Injectable({providedIn: 'root'})
export class ExportServiceAdapter {
  private readonly httpClient = inject(AxiosClient);

  /**
   * Fetches binary export data from the backend API.
   *
   * @param url - Export endpoint path
   * @returns Export payload as Uint8Array
   */
  private async fetchBinaryExport(url: string): Promise<Uint8Array> {
    const data = await this.httpClient.get<ArrayBuffer>(url, {responseType: 'arraybuffer'});
    return new Uint8Array(data);
  }

  /**
   * Exports tournament data in ITF format.
   * @param tournamentId - The identifier of the tournament to export
   * @returns Promise resolving to binary data in ITF format
   */
  public async exportToITF(tournamentId: string): Promise<Uint8Array> {
    if (!tournamentId) {
      throw new Error('Tournament ID is required');
    }

    return this.fetchBinaryExport(`/export/tournament/${tournamentId}/itf`);
  }

  /**
   * Exports tournament data in TODS (Tennis Open Data Standard) format.
   * @param tournamentId - The identifier of the tournament to export
   * @returns Promise resolving to binary data in TODS format
   */
  public async exportToTODS(tournamentId: string): Promise<Uint8Array> {
    if (!tournamentId) {
      throw new Error('Tournament ID is required');
    }

    return this.fetchBinaryExport(`/export/tournament/${tournamentId}/tods`);
  }

  /**
   * Exports generic data to CSV format.
   * @param data - An array of objects to export as CSV
   * @returns Promise resolving to CSV-formatted string
   */
  public async exportToCsv(data: unknown[]): Promise<string> {
    if (!data || data.length === 0) {
      throw new Error('Data array is required and must not be empty');
    }

    const rows: unknown[] = data;
    if (rows.length === 0) {
      return '';
    }

    const headers = Object.keys(rows[0] as Record<string, unknown>);
    const csvHeaders = headers.join(',');

    const csvRows = rows.map((row) => {
      return headers.map((header) => {
        const value = (row as Record<string, unknown>)[header];
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }
}
