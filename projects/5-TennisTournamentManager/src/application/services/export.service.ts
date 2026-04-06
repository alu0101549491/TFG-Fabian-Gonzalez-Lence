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
export class ExportService {
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
    format: ExportFormat
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
   * 
   * @param stats - Tournament statistics data
   * @returns Export result with PDF data
   */
  private generateStatisticsPDF(stats: TournamentStatisticsDto): ExportResultDto {
    const doc = new jsPDF();
    
    // Color scheme matching application theme
    const primaryColor: [number, number, number] = [30, 64, 175]; // #1e40af
    const accentColor: [number, number, number] = [220, 38, 38]; // #dc2626
    const textColor: [number, number, number] = [55, 65, 81]; // #374151

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Tournament Statistics', 105, 20, {align: 'center'});

    // Tournament name
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(stats.tournamentName, 105, 30, {align: 'center'});

    // Overview section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview', 14, 45);

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    let yPos = 53;
    doc.text(`Total Participants: ${stats.totalParticipants}`, 14, yPos);
    yPos += 6;
    doc.text(`Total Matches: ${stats.totalMatches}`, 14, yPos);
    yPos += 6;
    doc.text(`Completed Matches: ${stats.completedMatches}`, 14, yPos);
    yPos += 6;
    doc.text(`Pending Matches: ${stats.pendingMatches}`, 14, yPos);
    yPos += 6;
    const completionRate = stats.totalMatches > 0 
      ? ((stats.completedMatches / stats.totalMatches) * 100).toFixed(1)
      : '0';
    doc.text(`Completion Rate: ${completionRate}%`, 14, yPos);

    // Result Distribution table
    yPos += 12;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Match Status Distribution', 14, yPos);
    
    yPos += 2;
    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Count']],
      body: [
        ['Completed', stats.resultDistribution.completed.toString()],
        ['Pending', stats.resultDistribution.pending.toString()],
        ['In Progress', stats.resultDistribution.inProgress.toString()],
        ['Cancelled', stats.resultDistribution.cancelled.toString()],
        ['Walkovers', stats.resultDistribution.walkovers.toString()],
        ['Retirements', stats.resultDistribution.retirements.toString()],
      ],
      theme: 'striped',
      headStyles: {fillColor: primaryColor},
      margin: {left: 14},
    });

    // Top Performers table
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Performers', 14, yPos);

    yPos += 2;
    const performersData = stats.topPerformers.map((p) => [
      p.participantName,
      p.wins.toString(),
      p.losses.toString(),
      `${p.winPercentage.toFixed(1)}%`,
      p.currentStreak > 0 ? `+${p.currentStreak}` : p.currentStreak.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Player', 'Wins', 'Losses', 'Win %', 'Streak']],
      body: performersData,
      theme: 'striped',
      headStyles: {fillColor: primaryColor},
      margin: {left: 14},
    });

    // Most Active Participants table
    yPos = (doc as any).lastAutoTable.finalY + 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Most Active Participants', 14, yPos);

    yPos += 2;
    const activityData = stats.mostActiveParticipants.map((p) => [
      p.participantName,
      p.matchesPlayed.toString(),
      p.setsPlayed.toString(),
      p.gamesPlayed.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Player', 'Matches', 'Sets', 'Games']],
      body: activityData,
      theme: 'striped',
      headStyles: {fillColor: primaryColor},
      margin: {left: 14},
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128); // gray
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        105,
        doc.internal.pageSize.height - 10,
        {align: 'center'}
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
