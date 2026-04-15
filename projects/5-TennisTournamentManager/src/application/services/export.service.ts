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
    const primaryColor: [number, number, number] = [30, 64, 175]; // #1e40af Royal blue
    const primaryLight: [number, number, number] = [219, 234, 254]; // #dbeafe Light blue background
    const accentColor: [number, number, number] = [220, 38, 38]; // #dc2626 Crimson red
    const accentLight: [number, number, number] = [254, 226, 226]; // #fee2e2 Light red
    const textColor: [number, number, number] = [55, 65, 81]; // #374151 Dark gray
    const borderColor: [number, number, number] = [229, 231, 235]; // #e5e7eb Light border
    const successColor: [number, number, number] = [34, 197, 94]; // #22c55e Green

    // Header background with gradient effect (simulated with rectangle)
    doc.setFillColor(...primaryLight);
    doc.rect(0, 0, 210, 45, 'F');

    // Title with shadow effect
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Tournament Statistics', 105, 22, {align: 'center'});

    // Tournament name
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(stats.tournamentName, 105, 34, {align: 'center'});

    // Overview section with card-like styling
    let yPos = 55;
    
    // Section header with underline
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview', 14, yPos);
    
    // Decorative underline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 50, yPos + 1);

    // Create card background for overview
    yPos += 5;
    doc.setFillColor(250, 250, 250); // Very light gray
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.roundedRect(14, yPos, 182, 40, 2, 2, 'FD');

    // Overview metrics in grid layout
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);

    // Left column
    doc.text('Total Participants', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);
    doc.setFontSize(16);
    doc.text(stats.totalParticipants.toString(), 20, yPos + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Total Matches', 20, yPos + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);
    doc.setFontSize(16);
    doc.text(stats.totalMatches.toString(), 20, yPos + 25);

    // Middle column
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Completed Matches', 75, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...successColor);
    doc.setFontSize(16);
    doc.text(stats.completedMatches.toString(), 75, yPos + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Pending Matches', 75, yPos + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(16);
    doc.text(stats.pendingMatches.toString(), 75, yPos + 25);

    // Right column - Completion rate with circular progress indicator
    const completionRate = stats.totalMatches > 0 
      ? ((stats.completedMatches / stats.totalMatches) * 100).toFixed(1)
      : '0';
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Completion Rate', 140, yPos);
    
    // Large percentage display
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(completionRate + '%', 140, yPos + 10);
    
    // Progress bar
    const barWidth = 50;
    const barHeight = 6;
    const barX = 140;
    const barY = yPos + 14;
    
    // Background bar
    doc.setFillColor(...borderColor);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    
    // Progress bar fill
    const fillWidth = (barWidth * parseFloat(completionRate)) / 100;
    doc.setFillColor(...successColor);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, 'F');

    // Match Status Distribution section
    yPos = 110;
    
    // Section header with underline
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Match Status Distribution', 14, yPos);
    
    // Decorative underline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 80, yPos + 1);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Count', 'Percentage']],
      body: [
        [
          'Completed', 
          stats.resultDistribution.completed.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.completed / stats.totalMatches) * 100).toFixed(1) : '0'}%`
        ],
        [
          'Pending', 
          stats.resultDistribution.pending.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.pending / stats.totalMatches) * 100).toFixed(1) : '0'}%`
        ],
        [
          'In Progress', 
          stats.resultDistribution.inProgress.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.inProgress / stats.totalMatches) * 100).toFixed(1) : '0'}%`
        ],
        [
          'Cancelled', 
          stats.resultDistribution.cancelled.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.cancelled / stats.totalMatches) * 100).toFixed(1) : '0'}%`
        ],
        [
          'Walkovers', 
          stats.resultDistribution.walkovers.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.walkovers / stats.totalMatches) * 100).toFixed(1) : '0'}%`
        ],
        [
          'Retirements', 
          stats.resultDistribution.retirements.toString(),
          `${stats.totalMatches > 0 ? ((stats.resultDistribution.retirements / stats.totalMatches) * 100).toFixed(1) : '0'}%`
        ],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Very light gray
      },
      columnStyles: {
        0: {cellWidth: 70},
        1: {cellWidth: 50, halign: 'center'},
        2: {cellWidth: 52, halign: 'center'},
      },
      margin: {left: 14, right: 14},
    });

    // Top Performers section
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    // Section header with underline
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Performers', 14, yPos);
    
    // Decorative underline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 55, yPos + 1);

    yPos += 5;
    const performersData = stats.topPerformers.map((p, index) => {
      const streakText = p.currentStreak > 0 ? `+${p.currentStreak}` : p.currentStreak.toString();
      const rankDisplay = index < 3 ? `#${index + 1}` : `${index + 1}.`;
      
      return [
        rankDisplay,
        p.participantName,
        p.wins.toString(),
        p.losses.toString(),
        `${p.winPercentage.toFixed(1)}%`,
        streakText,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Player', 'W', 'L', 'Win %', 'Streak']],
      body: performersData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: {cellWidth: 12, halign: 'center', fontStyle: 'bold'},
        1: {cellWidth: 70, halign: 'left'},
        2: {cellWidth: 18, halign: 'center'},
        3: {cellWidth: 18, halign: 'center'},
        4: {cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: successColor},
        5: {cellWidth: 26, halign: 'center'},
      },
      margin: {left: 14, right: 14},
      didParseCell: (data: any) => {
        // Highlight top 3 performers with special background
        if (data.section === 'body' && data.row.index < 3) {
          if (data.column.index === 0) {
            // Rank column for top 3
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [255, 255, 255]; // White text
            // Gold, Silver, Bronze backgrounds
            if (data.row.index === 0) {
              data.cell.styles.fillColor = [255, 215, 0]; // Gold
            } else if (data.row.index === 1) {
              data.cell.styles.fillColor = [192, 192, 192]; // Silver
            } else if (data.row.index === 2) {
              data.cell.styles.fillColor = [205, 127, 50]; // Bronze
            }
          }
          if (data.column.index === 1) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Color-code streaks
        if (data.section === 'body' && data.column.index === 5) {
          const streakValue = stats.topPerformers[data.row.index]?.currentStreak || 0;
          if (streakValue > 0) {
            data.cell.styles.textColor = successColor;
            data.cell.styles.fontStyle = 'bold';
          } else if (streakValue < 0) {
            data.cell.styles.textColor = accentColor;
          }
        }
      },
    });

    // Most Active Participants section
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    // Section header with underline
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Most Active Participants', 14, yPos);
    
    // Decorative underline
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 1, 75, yPos + 1);

    yPos += 5;
    const activityData = stats.mostActiveParticipants.map((p, index) => [
      `${index + 1}.`,
      p.participantName,
      p.matchesPlayed.toString(),
      p.setsPlayed.toString(),
      p.gamesPlayed.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Player', 'Matches', 'Sets', 'Games']],
      body: activityData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: {cellWidth: 12, halign: 'center', fontStyle: 'bold'},
        1: {cellWidth: 80, halign: 'left'},
        2: {cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: primaryColor},
        3: {cellWidth: 25, halign: 'center'},
        4: {cellWidth: 25, halign: 'center'},
      },
      margin: {left: 14, right: 14},
    });

    // Add decorative footer section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Info box at bottom
    if (finalY < doc.internal.pageSize.height - 30) {
      doc.setFillColor(...primaryLight);
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, finalY, 182, 15, 2, 2, 'FD');
      
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'italic');
      doc.text('Note: Statistics calculated based on completed matches only', 20, finalY + 6);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, finalY + 11);
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer border line
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Tournament Statistics Report | Page ${i} of ${pageCount}`,
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
