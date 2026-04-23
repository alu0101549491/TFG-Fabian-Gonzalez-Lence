/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/export.service.ts
 * @desc Export service for tournament data exports in ITF, TODS, PDF, and Excel formats (FR61-FR63)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {AxiosClient} from '@infrastructure/http/axios-client';
import type {TournamentStatisticsDto} from '@application/dto/statistics.dto';
import type {ExportResultDto} from '@application/dto/export.dto';
import type {IExportService} from '@application/interfaces/export-service.interface';
import {ExportFormat} from '@domain/enumerations/export-format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export service implementation.
 * Handles tournament data exports by calling backend APIs that generate files in various formats.
 * 
 * @remarks
 * This service implements functional requirements:
 * - FR61: ITF format export (structured CSV according to ITF standard)
 * - FR62: TODS format export (Tennis Open Data Standards for interoperability)
 * - FR63: Statistics export (PDF and Excel for administrators)
 * 
 * @example
 * ```typescript
 * // Inject service
 * private readonly exportService = inject(ExportService);
 * 
 * // Export tournament in ITF format
 * await this.exportService.exportToITF('tournament-123');
 * 
 * // Export results to PDF
 * await this.exportService.exportResultsToPDF('tournament-123');
 * ```
 */
@Injectable({providedIn: 'root'})
export class ExportService implements IExportService {
  /**
   * HTTP client for API calls.
   */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Exports tournament data in ITF CSV format.
   * Downloads the file directly to the user's browser.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when download completes
   * @throws Error if export fails or tournament not found
   */
  public async exportToITF(tournamentId: string): Promise<void> {
    try {
      const data = await this.httpClient.get<ArrayBuffer>(
        `/export/tournament/${tournamentId}/itf`,
        {responseType: 'arraybuffer'}
      );
      
      this.downloadFile(
        data,
        `ITF_Tournament_${tournamentId}_${this.getDateString()}.csv`,
        'text/csv'
      );
    } catch (error) {
      console.error('ITF export failed:', error);
      throw new Error('Failed to export tournament in ITF format');
    }
  }

  /**
   * Exports tournament data in TODS JSON format.
   * Downloads the file directly to the user's browser.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when download completes
   * @throws Error if export fails or tournament not found
   */
  public async exportToTODS(tournamentId: string): Promise<void> {
    try {
      const data = await this.httpClient.get<ArrayBuffer>(
        `/export/tournament/${tournamentId}/tods`,
        {responseType: 'arraybuffer'}
      );
      
      this.downloadFile(
        data,
        `TODS_Tournament_${tournamentId}_${this.getDateString()}.json`,
        'application/json'
      );
    } catch (error) {
      console.error('TODS export failed:', error);
      throw new Error('Failed to export tournament in TODS format');
    }
  }

  /**
   * Exports tournament results as PDF document.
   * Downloads the file directly to the user's browser.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when download completes
   * @throws Error if export fails or tournament not found
   */
  public async exportResultsToPDF(tournamentId: string): Promise<void> {
    try {
      const data = await this.httpClient.get<ArrayBuffer>(
        `/export/tournament/${tournamentId}/pdf`,
        {responseType: 'arraybuffer'}
      );
      
      this.downloadFile(
        data,
        `Tournament_Results_${tournamentId}_${this.getDateString()}.pdf`,
        'application/pdf'
      );
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export tournament results as PDF');
    }
  }

  /**
   * Exports tournament results as Excel spreadsheet.
   * Downloads the file directly to the user's browser.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise that resolves when download completes
   * @throws Error if export fails or tournament not found
   */
  public async exportResultsToExcel(tournamentId: string): Promise<void> {
    try {
      const data = await this.httpClient.get<ArrayBuffer>(
        `/export/tournament/${tournamentId}/excel`,
        {responseType: 'arraybuffer'}
      );
      
      this.downloadFile(
        data,
        `Tournament_Results_${tournamentId}_${this.getDateString()}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    } catch (error) {
      console.error('Excel export failed:', error);
      throw new Error('Failed to export tournament results as Excel');
    }
  }

  /**
   * Exports bracket structure as PDF document.
   * Downloads the file directly to the user's browser.
   * 
   * @param bracketId - Unique identifier of the bracket
   * @returns Promise that resolves when download completes
   * @throws Error if export fails or bracket not found
   */
  public async exportBracketToPDF(bracketId: string): Promise<void> {
    try {
      const data = await this.httpClient.get<ArrayBuffer>(
        `/export/bracket/${bracketId}/pdf`,
        {responseType: 'arraybuffer'}
      );
      
      this.downloadFile(
        data,
        `Bracket_${bracketId}_${this.getDateString()}.pdf`,
        'application/pdf'
      );
    } catch (error) {
      console.error('Bracket PDF export failed:', error);
      throw new Error('Failed to export bracket as PDF');
    }
  }

  /**
   * Exports tournament statistics as PDF or Excel.
   * Generates the document client-side from pre-computed statistics data.
   * 
   * @param tournamentStats - Pre-computed tournament statistics
   * @param format - Export format (PDF or EXCEL)
   * @returns Promise resolving to export result
   * @throws Error if format not supported or generation fails
   */
  public async exportTournamentStatistics(
    tournamentStats: TournamentStatisticsDto,
    format: ExportFormat.PDF | ExportFormat.EXCEL,
  ): Promise<ExportResultDto> {
    try {
      if (format === ExportFormat.PDF) {
        return this.generateStatisticsPDF(tournamentStats);
      } else if (format === ExportFormat.EXCEL) {
        return this.generateStatisticsExcel(tournamentStats);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Statistics export failed:', error);
      return {
        success: false,
        format,
        exportedAt: new Date(),
        error: 'Failed to export statistics',
        errorDetails: {originalError: error},
      };
    }
  }

  /**
   * Downloads an export result to the user's browser.
   * 
   * @param result - Export result to download
   */
  public downloadExportResult(result: ExportResultDto): void {
    if (!result.success || !result.data || !result.filename) {
      console.error('Cannot download invalid export result', result);
      return;
    }

    const blob = new Blob([result.data], {type: result.mimeType});
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generates tournament statistics as PDF document.
   * Uses a professional green/teal color scheme matching the application theme.
   * Sections: header, overview, match status distribution, top performers,
   * most active participants, category breakdown, and per-page footer.
   *
   * @param stats - Tournament statistics data
   * @returns Export result with PDF data
   */
  private generateStatisticsPDF(stats: TournamentStatisticsDto): ExportResultDto {
    const doc = new jsPDF();

    // ── Color palette (matches app CSS variables) ──────────────────────────
    const primaryDark: [number, number, number] = [27, 94, 32];    // #1b5e20
    const primaryColor: [number, number, number] = [46, 125, 50];  // #2e7d32
    const secondaryColor: [number, number, number] = [15, 118, 110]; // #0f766e
    const primaryLight: [number, number, number] = [232, 245, 233]; // #e8f5e9
    const accentColor: [number, number, number] = [245, 124, 0];   // #f57c00
    const textColor: [number, number, number] = [55, 65, 81];      // #374151
    const borderColor: [number, number, number] = [229, 231, 235]; // #e5e7eb
    const successColor: [number, number, number] = [46, 125, 50];  // #2e7d32
    const pageWidth = doc.internal.pageSize.width;

    /** Draws a compact header band used on pages 2+ to identify the document. */
    const drawPageHeader = (page: number): void => {
      doc.setFillColor(...primaryDark);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(`${stats.tournamentName} — Tournament Statistics`, 14, 8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${page}`, pageWidth - 14, 8, {align: 'right'});
    };

    // ── Page 1 Hero Header ─────────────────────────────────────────────────
    // Background rectangle — dark green
    doc.setFillColor(...primaryDark);
    doc.rect(0, 0, pageWidth, 48, 'F');

    // Decorative diagonal stripe (teal overlay)
    doc.setFillColor(...secondaryColor);
    doc.triangle(pageWidth - 60, 0, pageWidth, 0, pageWidth, 48, 'F');

    // Main title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Tournament Statistics', 14, 22);

    // Tournament name subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 230, 201); // Light green text
    doc.text(stats.tournamentName, 14, 34);

    // Generated date in header
    doc.setFontSize(8);
    doc.setTextColor(178, 223, 185);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 43);

    // ── Overview Section ───────────────────────────────────────────────────
    let yPos = 58;

    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview', 14, yPos);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 48, yPos + 1);

    yPos += 6;
    doc.setFillColor(250, 253, 250);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, yPos, 182, 40, 2, 2, 'FD');

    // Metrics — row 1
    yPos += 8;
    const col = [20, 75, 140] as const;

    const drawMetric = (x: number, y: number, label: string, value: string, color: [number, number, number]): void => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(label, x, y);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(value, x, y + 8);
    };

    drawMetric(col[0], yPos, 'Total Participants', stats.totalParticipants.toString(), primaryColor);
    drawMetric(col[1], yPos, 'Total Matches', stats.totalMatches.toString(), primaryColor);

    // Completion rate with progress bar
    const completionRate = stats.totalMatches > 0
      ? ((stats.completedMatches / stats.totalMatches) * 100).toFixed(1)
      : '0';
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text('Completion Rate', col[2], yPos);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`${completionRate}%`, col[2], yPos + 8);

    // Row 2
    yPos += 18;
    drawMetric(col[0], yPos, 'Completed', stats.completedMatches.toString(), successColor);
    drawMetric(col[1], yPos, 'Pending', stats.pendingMatches.toString(), accentColor);

    // Progress bar
    const barY = yPos + 2;
    doc.setFillColor(...borderColor);
    doc.roundedRect(col[2], barY, 50, 6, 2, 2, 'F');
    const fill = Math.max(0, Math.min(50, (50 * parseFloat(completionRate)) / 100));
    doc.setFillColor(...successColor);
    if (fill > 0) doc.roundedRect(col[2], barY, fill, 6, 2, 2, 'F');

    // ── Match Status Distribution ──────────────────────────────────────────
    yPos = 115;

    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Match Status Distribution', 14, yPos);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 82, yPos + 1);

    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Count', 'Percentage']],
      body: [
        ['Completed', stats.resultDistribution.completed.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.completed / stats.totalMatches) * 100).toFixed(1) : '0'}%`],
        ['Pending', stats.resultDistribution.pending.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.pending / stats.totalMatches) * 100).toFixed(1) : '0'}%`],
        ['In Progress', stats.resultDistribution.inProgress.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.inProgress / stats.totalMatches) * 100).toFixed(1) : '0'}%`],
        ['Cancelled', stats.resultDistribution.cancelled.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.cancelled / stats.totalMatches) * 100).toFixed(1) : '0'}%`],
        ['Walkovers', stats.resultDistribution.walkovers.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.walkovers / stats.totalMatches) * 100).toFixed(1) : '0'}%`],
        ['Retirements', stats.resultDistribution.retirements.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.retirements / stats.totalMatches) * 100).toFixed(1) : '0'}%`],
      ],
      theme: 'grid',
      headStyles: {fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10},
      bodyStyles: {fontSize: 9, textColor: textColor},
      alternateRowStyles: {fillColor: [249, 252, 249]},
      columnStyles: {
        0: {cellWidth: 70},
        1: {cellWidth: 50, halign: 'center'},
        2: {cellWidth: 52, halign: 'center', fontStyle: 'bold'},
      },
      margin: {left: 14, right: 14},
    });

    // ── Top Performers ─────────────────────────────────────────────────────
    yPos = (doc as any).lastAutoTable.finalY + 14;
    if (yPos > 230) { doc.addPage(); yPos = 18; }

    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Performers', 14, yPos);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 57, yPos + 1);

    yPos += 5;
    const performersData = stats.topPerformers.map((p, i) => [
      i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}.`,
      p.participantName,
      p.wins.toString(),
      p.losses.toString(),
      `${p.winPercentage.toFixed(1)}%`,
      p.currentStreak > 0 ? `+${p.currentStreak}` : p.currentStreak < 0 ? `${p.currentStreak}` : '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Rank', 'Player', 'W', 'L', 'Win %', 'Streak']],
      body: performersData,
      theme: 'grid',
      headStyles: {fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10, halign: 'center'},
      bodyStyles: {fontSize: 9, textColor: textColor},
      alternateRowStyles: {fillColor: [249, 252, 249]},
      columnStyles: {
        0: {cellWidth: 18, halign: 'center', fontStyle: 'bold'},
        1: {cellWidth: 64},
        2: {cellWidth: 18, halign: 'center'},
        3: {cellWidth: 18, halign: 'center'},
        4: {cellWidth: 28, halign: 'center', fontStyle: 'bold'},
        5: {cellWidth: 26, halign: 'center', fontStyle: 'bold'},
      },
      margin: {left: 14, right: 14},
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          data.cell.styles.textColor = successColor;
        }
        if (data.section === 'body' && data.column.index === 5) {
          const streak = stats.topPerformers[data.row.index]?.currentStreak ?? 0;
          data.cell.styles.textColor = streak > 0 ? successColor : streak < 0 ? accentColor : textColor;
        }
      },
    });

    // ── Most Active Participants ───────────────────────────────────────────
    yPos = (doc as any).lastAutoTable.finalY + 14;
    if (yPos > 230) { doc.addPage(); yPos = 18; }

    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Most Active Participants', 14, yPos);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 78, yPos + 1);

    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Player', 'Matches', 'Sets', 'Games']],
      body: stats.mostActiveParticipants.map((p, i) => [
        `${i + 1}.`, p.participantName, p.matchesPlayed.toString(), p.setsPlayed.toString(), p.gamesPlayed.toString(),
      ]),
      theme: 'grid',
      headStyles: {fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10, halign: 'center'},
      bodyStyles: {fontSize: 9, textColor: textColor},
      alternateRowStyles: {fillColor: [249, 252, 249]},
      columnStyles: {
        0: {cellWidth: 12, halign: 'center', fontStyle: 'bold'},
        1: {cellWidth: 80},
        2: {cellWidth: 30, halign: 'center', fontStyle: 'bold'},
        3: {cellWidth: 25, halign: 'center'},
        4: {cellWidth: 25, halign: 'center'},
      },
      margin: {left: 14, right: 14},
    });

    // ── Category Breakdown ─────────────────────────────────────────────────
    if (stats.categoryBreakdown && stats.categoryBreakdown.length > 0) {
      yPos = (doc as any).lastAutoTable.finalY + 14;
      if (yPos > 230) { doc.addPage(); yPos = 18; }

      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Breakdown', 14, yPos);
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(14, yPos + 1, 65, yPos + 1);

      yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Participants', 'Total Matches', 'Completed', 'Top Performer']],
        body: stats.categoryBreakdown.map(c => [
          c.categoryName,
          c.totalParticipants.toString(),
          c.totalMatches.toString(),
          c.completedMatches.toString(),
          c.topPerformer ?? '—',
        ]),
        theme: 'grid',
        headStyles: {fillColor: secondaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10},
        bodyStyles: {fontSize: 9, textColor: textColor},
        alternateRowStyles: {fillColor: [240, 253, 250]},
        columnStyles: {
          0: {cellWidth: 50, fontStyle: 'bold'},
          1: {cellWidth: 30, halign: 'center'},
          2: {cellWidth: 30, halign: 'center'},
          3: {cellWidth: 30, halign: 'center'},
          4: {cellWidth: 42},
        },
        margin: {left: 14, right: 14},
      });
    }

    // ── Footer on every page ───────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Compact header band on pages 2+
      if (i > 1) {
        drawPageHeader(i);
      }

      // Bottom footer line
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.line(14, doc.internal.pageSize.height - 14, pageWidth - 14, doc.internal.pageSize.height - 14);

      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${stats.tournamentName} — Statistics Report  |  Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 9,
        {align: 'center'},
      );
    }

    const pdfData = doc.output('arraybuffer');
    const filename = `Tournament_Statistics_${stats.tournamentId}_${this.getDateString()}.pdf`;

    return {
      success: true,
      format: ExportFormat.PDF,
      data: new Uint8Array(pdfData),
      filename,
      mimeType: 'application/pdf',
      exportedAt: new Date(),
      recordCount: stats.totalMatches,
    };
  }

  /**
   * Generates tournament statistics as Excel spreadsheet (CSV format).
   * 
   * @param stats - Tournament statistics data
   * @returns Export result with Excel data
   */
  private generateStatisticsExcel(stats: TournamentStatisticsDto): ExportResultDto {
    let csv = '';

    // Header
    csv += `Tournament Statistics\n`;
    csv += `Tournament: ${stats.tournamentName}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Overview
    csv += `Overview\n`;
    csv += `Total Participants,${stats.totalParticipants}\n`;
    csv += `Total Matches,${stats.totalMatches}\n`;
    csv += `Completed Matches,${stats.completedMatches}\n`;
    csv += `Pending Matches,${stats.pendingMatches}\n`;
    const completionRate = stats.totalMatches > 0 
      ? ((stats.completedMatches / stats.totalMatches) * 100).toFixed(1)
      : '0';
    csv += `Completion Rate,${completionRate}%\n\n`;

    // Result Distribution
    csv += `Match Status Distribution\n`;
    csv += `Status,Count\n`;
    csv += `Completed,${stats.resultDistribution.completed}\n`;
    csv += `Pending,${stats.resultDistribution.pending}\n`;
    csv += `In Progress,${stats.resultDistribution.inProgress}\n`;
    csv += `Cancelled,${stats.resultDistribution.cancelled}\n`;
    csv += `Walkovers,${stats.resultDistribution.walkovers}\n`;
    csv += `Retirements,${stats.resultDistribution.retirements}\n\n`;

    // Top Performers
    csv += `Top Performers\n`;
    csv += `Player,Wins,Losses,Win %,Streak\n`;
    stats.topPerformers.forEach((p) => {
      const streak = p.currentStreak > 0 ? `+${p.currentStreak}` : p.currentStreak;
      csv += `${p.participantName},${p.wins},${p.losses},${p.winPercentage.toFixed(1)}%,${streak}\n`;
    });
    csv += `\n`;

    // Most Active Participants
    csv += `Most Active Participants\n`;
    csv += `Player,Matches,Sets,Games\n`;
    stats.mostActiveParticipants.forEach((p) => {
      csv += `${p.participantName},${p.matchesPlayed},${p.setsPlayed},${p.gamesPlayed}\n`;
    });

    const csvData = new TextEncoder().encode(csv);
    const filename = `Tournament_Statistics_${stats.tournamentId}_${this.getDateString()}.csv`;

    return {
      success: true,
      format: ExportFormat.EXCEL,
      data: csvData,
      filename,
      mimeType: 'text/csv',
      exportedAt: new Date(),
      recordCount: stats.totalMatches,
    };
  }

  /**
   * Triggers a browser download for the given file data.
   * Creates a temporary anchor element to initiate the download.
   * 
   * @param data - Binary file data
   * @param filename - Name for the downloaded file
   * @param mimeType - MIME type of the file
   */
  private downloadFile(data: ArrayBuffer, filename: string, mimeType: string): void {
    const blob = new Blob([data], {type: mimeType});
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Gets a formatted date string for filenames (YYYY-MM-DD format).
   * 
   * @returns Date string in YYYY-MM-DD format
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}
