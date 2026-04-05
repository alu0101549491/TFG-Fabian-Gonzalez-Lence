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
import {IExportService} from '../interfaces/export-service.interface';
import {ExportRequestDto, ExportResultDto, StatisticsExportRequestDto} from '../dto/export.dto';
import {ExportFormat} from '../../domain/enumerations/export-format';
import {ITournamentRepository} from '../../domain/repositories/tournament-repository.interface';
import {IRegistrationRepository} from '../../domain/repositories/registration-repository.interface';
import {IStatisticsRepository} from '../../domain/repositories/statistics-repository.interface';
import {TournamentRepositoryImpl} from '../../infrastructure/repositories/tournament.repository';
import {RegistrationRepositoryImpl} from '../../infrastructure/repositories/registration.repository';
import {StatisticsRepositoryImpl} from '../../infrastructure/repositories/statistics.repository';
import {ExportServiceAdapter} from '../../infrastructure/external/export-service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export service implementation.
 * Handles tournament data exports in various formats (ITF, TODS, PDF, Excel, CSV).
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
 * const result = await this.exportService.exportToITF('tournament-123');
 * 
 * // Export statistics to PDF
 * const stats = await this.exportService.exportStatistics({
 *   tournamentId: 'tournament-123',
 *   format: ExportFormat.PDF
 * });
 * ```
 */
@Injectable({providedIn: 'root'})
export class ExportService implements IExportService {
  /**
   * Tournament repository for accessing tournament data.
   */
  private readonly tournamentRepository: ITournamentRepository = inject(TournamentRepositoryImpl);

  /**
   * Registration repository for accessing participant data.
   */
  private readonly registrationRepository: IRegistrationRepository = inject(RegistrationRepositoryImpl);

  /**
   * Statistics repository for accessing performance data.
   */
  private readonly statisticsRepository: IStatisticsRepository = inject(StatisticsRepositoryImpl);

  /**
   * Export service adapter for low-level format conversions.
   */
  private readonly exportAdapter: ExportServiceAdapter = new ExportServiceAdapter();

  /**
   * Exports tournament data in specified format.
   * 
   * @param request - Export request parameters
   * @returns Promise resolving to export result with binary data
   * @throws Error if tournament not found or export fails
   */
  public async exportTournament(request: ExportRequestDto): Promise<ExportResultDto> {
    try {
      // Validate request
      if (!request.tournamentId) {
        return this.createErrorResult(request.format, 'Tournament ID is required');
      }

      // Verify tournament exists
      const tournament = await this.tournamentRepository.findById(request.tournamentId);
      if (!tournament) {
        return this.createErrorResult(request.format, 'Tournament not found');
      }

      // Route to appropriate export method based on format
      switch (request.format) {
        case ExportFormat.ITF_CSV:
          return await this.exportToITF(request.tournamentId);
        
        case ExportFormat.TODS:
          return await this.exportToTODS(request.tournamentId);
        
        case ExportFormat.PDF:
          return await this.exportStatistics({
            tournamentId: request.tournamentId,
            format: ExportFormat.PDF,
            includeIndividualStats: request.includeStatistics,
          });
        
        case ExportFormat.EXCEL:
          return await this.exportStatistics({
            tournamentId: request.tournamentId,
            format: ExportFormat.EXCEL,
            includeIndividualStats: request.includeStatistics,
          });
        
        case ExportFormat.CSV:
          // For generic CSV, export tournament summary data
          const summaryData = await this.prepareTournamentSummary(request.tournamentId);
          return await this.exportToCSV(summaryData, `${tournament.name.replace(/\s/g, '_')}.csv`);
        
        default:
          return this.createErrorResult(request.format, 'Unsupported export format');
      }
    } catch (error) {
      return this.createErrorResult(
        request.format,
        'Export failed',
        {originalError: (error as Error).message}
      );
    }
  }

  /**
   * Exports tournament data in ITF (International Tennis Federation) CSV format.
   * Implements FR61: ITF format export.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise resolving to export result with ITF-formatted CSV
   * @throws Error if tournament not found
   */
  public async exportToITF(tournamentId: string): Promise<ExportResultDto> {
    try {
      // Validate input
      if (!tournamentId) {
        return this.createErrorResult(ExportFormat.ITF_CSV, 'Tournament ID is required');
      }

      // Fetch tournament data
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return this.createErrorResult(ExportFormat.ITF_CSV, 'Tournament not found');
      }

      // Fetch related data
      // Note: Match repository doesn't have findByTournamentId, fetch via phases
      // For now, use empty array as placeholder - can be enhanced with phase queries
      const matches: any[] = []; // TODO: Implement via phases
      const registrations = await this.registrationRepository.findByTournament(tournamentId);

      // Prepare ITF-formatted data
      const itfData = this.prepareITFData(tournament, matches, registrations);

      // Convert to CSV format using adapter
      const csvContent = await this.exportAdapter.exportToCsv(itfData);

      // Generate filename and return result
      const filename = `ITF_${tournament.name.replace(/\s/g, '_')}_${this.getDateString()}.csv`;
      const data = new TextEncoder().encode(csvContent);

      return {
        success: true,
        format: ExportFormat.ITF_CSV,
        data,
        filename,
        mimeType: 'text/csv',
        exportedAt: new Date(),
        recordCount: itfData.length,
      };
    } catch (error) {
      return this.createErrorResult(
        ExportFormat.ITF_CSV,
        'ITF export failed',
        {originalError: (error as Error).message}
      );
    }
  }

  /**
   * Exports tournament data in TODS (Tennis Open Data Standards) format.
   * Implements FR62: TODS format export.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise resolving to export result with TODS-formatted JSON
   * @throws Error if tournament not found
   */
  public async exportToTODS(tournamentId: string): Promise<ExportResultDto> {
    try {
      // Validate input
      if (!tournamentId) {
        return this.createErrorResult(ExportFormat.TODS, 'Tournament ID is required');
      }

      // Fetch tournament data
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return this.createErrorResult(ExportFormat.TODS, 'Tournament not found');
      }

      // Fetch related data
      // Note: Match repository doesn't have findByTournamentId, fetch via phases
      // For now, use empty array as placeholder - can be enhanced with phase queries
      const matches: any[] = []; // TODO: Implement via phases
      const registrations = await this.registrationRepository.findByTournament(tournamentId);

      // Prepare TODS-formatted data (JSON structure)
      const todsData = this.prepareTODSData(tournament, matches, registrations);
      const jsonContent = JSON.stringify(todsData, null, 2);

      // Generate filename and return result
      const filename = `TODS_${tournament.name.replace(/\s/g, '_')}_${this.getDateString()}.json`;
      const data = new TextEncoder().encode(jsonContent);

      return {
        success: true,
        format: ExportFormat.TODS,
        data,
        filename,
        mimeType: 'application/json',
        exportedAt: new Date(),
        recordCount: matches.length,
      };
    } catch (error) {
      return this.createErrorResult(
        ExportFormat.TODS,
        'TODS export failed',
        {originalError: (error as Error).message}
      );
    }
  }

  /**
   * Exports tournament statistics in PDF or Excel format.
   * Implements FR63: Statistics export.
   * 
   * @param request - Statistics export request parameters
   * @returns Promise resolving to export result with formatted statistics
   * @throws Error if tournament not found or format not supported
   */
  public async exportStatistics(request: StatisticsExportRequestDto): Promise<ExportResultDto> {
    try {
      // Validate request
      if (!request.tournamentId) {
        return this.createErrorResult(request.format, 'Tournament ID is required');
      }

      // Fetch tournament data
      const tournament = await this.tournamentRepository.findById(request.tournamentId);
      if (!tournament) {
        return this.createErrorResult(request.format, 'Tournament not found');
      }

      // Fetch statistics
      const statistics = await this.statisticsRepository.findByTournamentId(request.tournamentId);

      // Prepare statistics data
      const statsData = this.prepareStatisticsData(statistics);

      // Generate export based on format
      if (request.format === ExportFormat.PDF) {
        return await this.exportStatisticsToPDF(tournament, statsData);
      } else if (request.format === ExportFormat.EXCEL) {
        return await this.exportStatisticsToExcel(tournament, statsData);
      } else {
        return this.createErrorResult(request.format, 'Unsupported statistics export format');
      }
    } catch (error) {
      return this.createErrorResult(
        request.format,
        'Statistics export failed',
        {originalError: (error as Error).message}
      );
    }
  }

  /**
   * Exports tournament statistics from TournamentStatisticsDto.
   * Simplified method that accepts pre-computed statistics data.
   * 
   * @param tournamentStats - Pre-computed tournament statistics
   * @param format - Export format (PDF or EXCEL)
   * @returns Promise resolving to export result
   */
  public async exportTournamentStatistics(
    tournamentStats: any,
    format: ExportFormat
  ): Promise<ExportResultDto> {
    try {
      // Prepare data for export
      const exportData = this.prepareTournamentStatsForExport(tournamentStats);

      // Generate export based on format
      if (format === ExportFormat.PDF) {
        return await this.exportTournamentStatsToPDF(tournamentStats, exportData);
      } else if (format === ExportFormat.EXCEL) {
        return await this.exportTournamentStatsToExcel(tournamentStats, exportData);
      } else {
        return this.createErrorResult(format, 'Unsupported statistics export format');
      }
    } catch (error) {
      return this.createErrorResult(
        format,
        'Statistics export failed',
        {originalError: (error as Error).message}
      );
    }
  }

  /**
   * Downloads export result in the browser.
   * Creates a temporary download link and triggers the download.
   * 
   * @param result - Export result to download
   */
  public downloadExportResult(result: ExportResultDto): void {
    if (!result.success || !result.data || !result.filename) {
      throw new Error('Invalid export result');
    }

    // Create a Blob from the data
    const blob = new Blob([result.data], {type: result.mimeType || 'application/octet-stream'});
    
    // Create a temporary URL
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exports generic data to CSV format.
   * 
   * @param data - Array of objects to export
   * @param filename - Desired filename for export
   * @returns Promise resolving to export result with CSV data
   * @throws Error if data is empty or invalid
   */
  public async exportToCSV(data: unknown[], filename: string): Promise<ExportResultDto> {
    try {
      // Validate input
      if (!data || data.length === 0) {
        return this.createErrorResult(ExportFormat.CSV, 'No data to export');
      }

      // Convert to CSV using adapter
      const csvContent = await this.exportAdapter.exportToCsv(data);
      const encodedData = new TextEncoder().encode(csvContent);

      // Ensure filename has .csv extension
      const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

      return {
        success: true,
        format: ExportFormat.CSV,
        data: encodedData,
        filename: finalFilename,
        mimeType: 'text/csv',
        exportedAt: new Date(),
        recordCount: data.length,
      };
    } catch (error) {
      return this.createErrorResult(
        ExportFormat.CSV,
        'CSV export failed',
        {originalError: (error as Error).message}
      );
    }
  }

  /**
   * Gets supported export formats for a tournament.
   * 
   * @param tournamentId - Unique identifier of the tournament
   * @returns Promise resolving to array of supported formats
   */
  public async getSupportedFormats(tournamentId: string): Promise<ExportFormat[]> {
    // Validate input
    if (!tournamentId) {
      return [];
    }

    // Verify tournament exists
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      return [];
    }

    // All formats are supported for now
    // In future, can check tournament status and data availability
    return [
      ExportFormat.ITF_CSV,
      ExportFormat.TODS,
      ExportFormat.PDF,
      ExportFormat.EXCEL,
      ExportFormat.CSV,
    ];
  }

  /**
   * Prepares ITF-formatted data from tournament, matches, and registrations.
   * ITF format includes structured CSV with tournament metadata, player list, match results, and standings.
   * 
   * @param tournament - Tournament entity
   * @param matches - Array of match entities
   * @param registrations - Array of registration entities
   * @returns Array of ITF-formatted records
   * @private
   */
  private prepareITFData(tournament: any, matches: any[], registrations: any[]): Record<string, unknown>[] {
    const itfRecords: Record<string, unknown>[] = [];

    // Add tournament metadata
    itfRecords.push({
      Section: 'Tournament',
      Name: tournament.name,
      Location: tournament.location,
      Surface: tournament.surface,
      StartDate: this.formatDate(tournament.startDate),
      EndDate: this.formatDate(tournament.endDate),
      Status: tournament.status,
    });

    // Add player list
    for (const registration of registrations) {
      itfRecords.push({
        Section: 'Player',
        ParticipantId: registration.id,
        Name: `${registration.userId}`, // In real implementation, fetch user details
        Status: registration.status,
        AcceptanceType: registration.acceptanceType,
      });
    }

    // Add match results
    for (const match of matches) {
      itfRecords.push({
        Section: 'Match',
        MatchId: match.id,
        Round: match.round || 'N/A',
        Player1: match.participant1Id,
        Player2: match.participant2Id,
        Score: match.score || 'Pending',
        WinnerId: match.winnerId || 'TBD',
        Status: match.status,
        ScheduledAt: match.scheduledAt ? this.formatDate(match.scheduledAt) : 'N/A',
      });
    }

    return itfRecords;
  }

  /**
   * Prepares TODS-formatted data from tournament, matches, and registrations.
   * TODS format is a JSON-based standard for tournament data interoperability.
   * 
   * @param tournament - Tournament entity
   * @param matches - Array of match entities
   * @param registrations - Array of registration entities
   * @returns TODS-formatted JSON object
   * @private
   * @see {@link https://itftennis.atlassian.net/wiki/spaces/TODS/overview TODS Documentation}
   */
  private prepareTODSData(tournament: any, matches: any[], registrations: any[]): Record<string, unknown> {
    return {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        location: tournament.location,
        surface: tournament.surface,
        startDate: this.formatDate(tournament.startDate),
        endDate: this.formatDate(tournament.endDate),
        status: tournament.status,
        maxParticipants: tournament.maxParticipants,
        rankingSystem: tournament.rankingSystem,
      },
      participants: registrations.map((reg) => ({
        id: reg.id,
        userId: reg.userId,
        status: reg.status,
        acceptanceType: reg.acceptanceType,
        seedNumber: reg.seedNumber,
        registeredAt: this.formatDate(reg.createdAt),
      })),
      matches: matches.map((match) => ({
        id: match.id,
        round: match.round,
        participant1Id: match.participant1Id,
        participant2Id: match.participant2Id,
        score: match.score,
        winnerId: match.winnerId,
        status: match.status,
        scheduledAt: match.scheduledAt ? this.formatDate(match.scheduledAt) : null,
        startedAt: match.startedAt ? this.formatDate(match.startedAt) : null,
        completedAt: match.completedAt ? this.formatDate(match.completedAt) : null,
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: 'Tennis Tournament Manager',
      version: '1.0',
    };
  }

  /**
   * Prepares statistics data for export.
   * 
   * @param statistics - Array of statistics entities
   * @returns Array of formatted statistics records
   * @private
   */
  private prepareStatisticsData(statistics: any[]): Record<string, unknown>[] {
    return statistics.map((stat) => ({
      ParticipantId: stat.participantId,
      MatchesPlayed: stat.matchesPlayed || 0,
      MatchesWon: stat.matchesWon || 0,
      MatchesLost: stat.matchesLost || 0,
      SetsWon: stat.setsWon || 0,
      SetsLost: stat.setsLost || 0,
      GamesWon: stat.gamesWon || 0,
      GamesLost: stat.gamesLost || 0,
      WinRate: stat.matchesPlayed > 0 ? ((stat.matchesWon / stat.matchesPlayed) * 100).toFixed(2) + '%' : '0%',
    }));
  }

  /**
   * Exports statistics to PDF format.
   * 
   * @param tournament - Tournament entity
   * @param statsData - Prepared statistics data
   * @returns Promise resolving to export result
   * @private
   */
  private async exportStatisticsToPDF(tournament: any, statsData: Record<string, unknown>[]): Promise<ExportResultDto> {
    // Placeholder: In production, use a PDF library like pdfkit
    const pdfPlaceholder = `
      Tournament Statistics Report
      =============================
      Tournament: ${tournament.name}
      Location: ${tournament.location}
      Date: ${this.formatDate(tournament.startDate)} - ${this.formatDate(tournament.endDate)}
      
      Participant Statistics:
      ${JSON.stringify(statsData, null, 2)}
    `;

    const filename = `Statistics_${tournament.name.replace(/\s/g, '_')}_${this.getDateString()}.pdf`;
    const data = new TextEncoder().encode(pdfPlaceholder);

    return {
      success: true,
      format: ExportFormat.PDF,
      data,
      filename,
      mimeType: 'application/pdf',
      exportedAt: new Date(),
      recordCount: statsData.length,
    };
  }

  /**
   * Exports statistics to Excel format.
   * 
   * @param tournament - Tournament entity
   * @param statsData - Prepared statistics data
   * @returns Promise resolving to export result
   * @private
   */
  private async exportStatisticsToExcel(tournament: any, statsData: Record<string, unknown>[]): Promise<ExportResultDto> {
    // Placeholder: In production, use a library like exceljs
    // For now, export as CSV which Excel can open
    const csvContent = await this.exportAdapter.exportToCsv(statsData);
    const filename = `Statistics_${tournament.name.replace(/\s/g, '_')}_${this.getDateString()}.xlsx`;
    const data = new TextEncoder().encode(csvContent);

    return {
      success: true,
      format: ExportFormat.EXCEL,
      data,
      filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      exportedAt: new Date(),
      recordCount: statsData.length,
    };
  }

  /**
   * Prepares tournament summary data for generic CSV export.
   * 
   * @param tournamentId - Tournament identifier
   * @returns Promise resolving to summary data
   * @private
   */
  private async prepareTournamentSummary(tournamentId: string): Promise<Record<string, unknown>[]> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    const registrations = await this.registrationRepository.findByTournament(tournamentId);
    // Note: Match repository doesn't have findByTournamentId
    // For summary, we can aggregate from phases or use 0 as placeholder
    const matches: any[] = []; // TODO: Implement via phases

    return [{
      TournamentId: tournament?.id,
      TournamentName: tournament?.name,
      Location: tournament?.location,
      StartDate: tournament?.startDate ? this.formatDate(tournament.startDate) : 'N/A',
      EndDate: tournament?.endDate ? this.formatDate(tournament.endDate) : 'N/A',
      Status: tournament?.status,
      TotalParticipants: registrations.length,
      TotalMatches: matches.length,
      CompletedMatches: matches.filter((m: any) => m.winnerId).length,
    }];
  }

  /**
   * Creates an error result for export operations.
   * 
   * @param format - Export format
   * @param error - Error message
   * @param errorDetails - Optional detailed error information
   * @returns Export result with error information
   * @private
   */
  private createErrorResult(
    format: ExportFormat,
    error: string,
    errorDetails?: Record<string, unknown>
  ): ExportResultDto {
    return {
      success: false,
      format,
      error,
      errorDetails,
      exportedAt: new Date(),
    };
  }

  /**
   * Formats a date to ISO 8601 string.
   * 
   * @param date - Date to format
   * @returns Formatted date string
   * @private
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Prepares TournamentStatisticsDto data for export.
   * 
   * @param stats - Tournament statistics DTO
   * @returns Array of formatted records for export
   * @private
   */
  private prepareTournamentStatsForExport(stats: any): Record<string, unknown>[] {
    const exportData: Record<string, unknown>[] = [];

    // Add summary section
    exportData.push({
      Section: 'Tournament Summary',
      Tournament: stats.tournamentName || 'Unknown',
      TotalParticipants: stats.totalParticipants || 0,
      TotalMatches: stats.totalMatches || 0,
      CompletedMatches: stats.completedMatches || 0,
      PendingMatches: stats.pendingMatches || 0,
      CompletionRate: stats.totalMatches > 0 
        ? `${((stats.completedMatches / stats.totalMatches) * 100).toFixed(1)}%`
        : '0%',
    });

    // Add result distribution
    if (stats.resultDistribution) {
      exportData.push({
        Section: 'Result Distribution',
        Completed: stats.resultDistribution.completed || 0,
        Pending: stats.resultDistribution.pending || 0,
        InProgress: stats.resultDistribution.inProgress || 0,
        Cancelled: stats.resultDistribution.cancelled || 0,
        Walkovers: stats.resultDistribution.walkovers || 0,
        Retirements: stats.resultDistribution.retirements || 0,
      });
    }

    // Add top performers
    if (stats.topPerformers && stats.topPerformers.length > 0) {
      stats.topPerformers.forEach((performer: any, index: number) => {
        exportData.push({
          Section: 'Top Performers',
          Rank: index + 1,
          Participant: performer.participantName || 'Unknown',
          Wins: performer.wins || 0,
          Losses: performer.losses || 0,
          WinRate: `${(performer.winPercentage || 0).toFixed(1)}%`,
          CurrentStreak: performer.currentStreak || 0,
        });
      });
    }

    // Add most active participants
    if (stats.mostActiveParticipants && stats.mostActiveParticipants.length > 0) {
      stats.mostActiveParticipants.forEach((participant: any, index: number) => {
        exportData.push({
          Section: 'Most Active',
          Rank: index + 1,
          Participant: participant.participantName || 'Unknown',
          MatchesPlayed: participant.matchesPlayed || 0,
          SetsPlayed: participant.setsPlayed || 0,
          GamesPlayed: participant.gamesPlayed || 0,
        });
      });
    }

    return exportData;
  }

  /**
   * Exports tournament statistics to PDF format.
   * 
   * @param stats - Tournament statistics
   * @param exportData - Prepared export data
   * @returns Promise resolving to export result
   * @private
   */
  private async exportTournamentStatsToPDF(stats: any, exportData: Record<string, unknown>[]): Promise<ExportResultDto> {
    // Create PDF document using jsPDF
    const doc = new jsPDF();
    
    // Application colors (matching the green/teal theme)
    const primaryColor = [52, 168, 83]; // Green
    const secondaryColor = [26, 115, 232]; // Blue
    const accentColor = [234, 67, 53]; // Red accent
    const darkGray = [60, 64, 67];
    const lightGray = [248, 249, 250];
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header with colored background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TOURNAMENT STATISTICS REPORT', pageWidth / 2, 22, { align: 'center' });
    
    yPosition = 50;

    // Tournament Summary Card
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, yPosition - 5, pageWidth - 30, 55, 3, 3, 'F');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tournament Overview', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const tournamentName = stats.tournamentName || 'Unknown Tournament';
    doc.text(`Tournament: ${tournamentName}`, 20, yPosition);
    yPosition += 6;
    
    // Create two-column layout for stats
    const col1X = 20;
    const col2X = pageWidth / 2 + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Participants:', col1X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${stats.totalParticipants || 0}`, col1X + 45, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Matches:', col2X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${stats.totalMatches || 0}`, col2X + 35, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Completed:', col1X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${stats.completedMatches || 0}`, col1X + 45, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Pending:', col2X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${stats.pendingMatches || 0}`, col2X + 35, yPosition);
    yPosition += 6;
    
    // Completion rate with progress bar
    const completionRate = stats.totalMatches > 0 
      ? (stats.completedMatches / stats.totalMatches) * 100
      : 0;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Completion Rate:', col1X, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${completionRate.toFixed(1)}%`, col1X + 45, yPosition);
    
    // Progress bar
    const barWidth = 80;
    const barHeight = 4;
    const barX = col2X;
    const barY = yPosition - 3;
    
    // Background bar
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    
    // Progress bar
    const progressWidth = (barWidth * completionRate) / 100;
    doc.setFillColor(...primaryColor);
    doc.roundedRect(barX, barY, progressWidth, barHeight, 2, 2, 'F');
    
    yPosition += 15;

    // Result Distribution Table
    if (stats.resultDistribution) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkGray);
      doc.text('Result Distribution', 20, yPosition);
      yPosition += 5;
      
      const totalMatches = stats.totalMatches || 1; // Avoid division by zero
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Status', 'Count', 'Percentage']],
        body: [
          ['Completed', stats.resultDistribution.completed || 0, `${(((stats.resultDistribution.completed || 0) / totalMatches) * 100).toFixed(1)}%`],
          ['Pending', stats.resultDistribution.pending || 0, `${(((stats.resultDistribution.pending || 0) / totalMatches) * 100).toFixed(1)}%`],
          ['In Progress', stats.resultDistribution.inProgress || 0, `${(((stats.resultDistribution.inProgress || 0) / totalMatches) * 100).toFixed(1)}%`],
          ['Cancelled', stats.resultDistribution.cancelled || 0, `${(((stats.resultDistribution.cancelled || 0) / totalMatches) * 100).toFixed(1)}%`],
          ['Walkovers', stats.resultDistribution.walkovers || 0, `${(((stats.resultDistribution.walkovers || 0) / totalMatches) * 100).toFixed(1)}%`],
          ['Retirements', stats.resultDistribution.retirements || 0, `${(((stats.resultDistribution.retirements || 0) / totalMatches) * 100).toFixed(1)}%`],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray,
        },
        alternateRowStyles: {
          fillColor: lightGray,
        },
        margin: { left: 20, right: 20 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Top Performers Table
    if (stats.topPerformers && stats.topPerformers.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkGray);
      doc.text('Top Performers', 20, yPosition);
      yPosition += 5;
      
      const topPerformersData = stats.topPerformers.slice(0, 10).map((p: any, i: number) => [
        `${i + 1}`,
        p.participantName,
        p.wins || 0,
        p.losses || 0,
        `${(p.winPercentage || 0).toFixed(1)}%`,
        p.currentStreak || 0,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Rank', 'Player', 'Wins', 'Losses', 'Win Rate', 'Streak']],
        body: topPerformersData,
        theme: 'striped',
        headStyles: {
          fillColor: secondaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 25 },
          5: { halign: 'center', cellWidth: 20 },
        },
        alternateRowStyles: {
          fillColor: lightGray,
        },
        margin: { left: 20, right: 20 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Most Active Participants Table
    if (stats.mostActiveParticipants && stats.mostActiveParticipants.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkGray);
      doc.text('Most Active Participants', 20, yPosition);
      yPosition += 5;
      
      const activeData = stats.mostActiveParticipants.slice(0, 10).map((p: any, i: number) => [
        `${i + 1}`,
        p.participantName,
        p.matchesPlayed || 0,
        p.setsPlayed || 0,
        p.gamesPlayed || 0,
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Rank', 'Player', 'Matches', 'Sets', 'Games']],
        body: activeData,
        theme: 'striped',
        headStyles: {
          fillColor: accentColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'center', cellWidth: 25 },
        },
        alternateRowStyles: {
          fillColor: lightGray,
        },
        margin: { left: 20, right: 20 },
      });
    }

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      
      const exportDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Exported on ${exportDate}`, 20, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    // Convert PDF to blob
    const pdfBlob = doc.output('blob');
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    const data = new Uint8Array(pdfArrayBuffer);
    
    const filename = `Statistics_${(stats.tournamentName || 'Tournament').replace(/\s/g, '_')}_${this.getDateString()}.pdf`;

    return {
      success: true,
      format: ExportFormat.PDF,
      data,
      filename,
      mimeType: 'application/pdf',
      exportedAt: new Date(),
      recordCount: exportData.length,
    };
  }

  /**
   * Exports tournament statistics to Excel format (CSV).
   * Creates a properly formatted multi-section CSV with section headers.
   * 
   * @param stats - Tournament statistics
   * @param exportData - Prepared export data
   * @returns Promise resolving to export result
   * @private
   */
  private async exportTournamentStatsToExcel(stats: any, exportData: Record<string, unknown>[]): Promise<ExportResultDto> {
    // Build CSV manually to support multiple sections with different columns
    const csvLines: string[] = [];
    
    // Helper function to escape CSV values
    const escapeCsvValue = (value: unknown): string => {
      const stringValue = String(value ?? '');
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    };

    // Section 1: Tournament Summary
    csvLines.push('TOURNAMENT SUMMARY');
    csvLines.push('Tournament,Total Participants,Total Matches,Completed Matches,Pending Matches,Completion Rate');
    csvLines.push([
      escapeCsvValue(stats.tournamentName || 'Unknown'),
      escapeCsvValue(stats.totalParticipants || 0),
      escapeCsvValue(stats.totalMatches || 0),
      escapeCsvValue(stats.completedMatches || 0),
      escapeCsvValue(stats.pendingMatches || 0),
      escapeCsvValue(stats.totalMatches > 0 
        ? `${((stats.completedMatches / stats.totalMatches) * 100).toFixed(1)}%`
        : '0%')
    ].join(','));
    csvLines.push(''); // Blank line separator

    // Section 2: Result Distribution
    if (stats.resultDistribution) {
      csvLines.push('RESULT DISTRIBUTION');
      csvLines.push('Completed,Pending,In Progress,Cancelled,Walkovers,Retirements');
      csvLines.push([
        escapeCsvValue(stats.resultDistribution.completed || 0),
        escapeCsvValue(stats.resultDistribution.pending || 0),
        escapeCsvValue(stats.resultDistribution.inProgress || 0),
        escapeCsvValue(stats.resultDistribution.cancelled || 0),
        escapeCsvValue(stats.resultDistribution.walkovers || 0),
        escapeCsvValue(stats.resultDistribution.retirements || 0)
      ].join(','));
      csvLines.push(''); // Blank line separator
    }

    // Section 3: Top Performers
    if (stats.topPerformers && stats.topPerformers.length > 0) {
      csvLines.push('TOP PERFORMERS');
      csvLines.push('Rank,Participant,Wins,Losses,Win Rate,Current Streak');
      stats.topPerformers.forEach((performer: any, index: number) => {
        csvLines.push([
          escapeCsvValue(index + 1),
          escapeCsvValue(performer.participantName || 'Unknown'),
          escapeCsvValue(performer.wins || 0),
          escapeCsvValue(performer.losses || 0),
          escapeCsvValue(`${(performer.winPercentage || 0).toFixed(1)}%`),
          escapeCsvValue(performer.currentStreak || 0)
        ].join(','));
      });
      csvLines.push(''); // Blank line separator
    }

    // Section 4: Most Active Participants
    if (stats.mostActiveParticipants && stats.mostActiveParticipants.length > 0) {
      csvLines.push('MOST ACTIVE PARTICIPANTS');
      csvLines.push('Rank,Participant,Matches Played,Sets Played,Games Played');
      stats.mostActiveParticipants.forEach((participant: any, index: number) => {
        csvLines.push([
          escapeCsvValue(index + 1),
          escapeCsvValue(participant.participantName || 'Unknown'),
          escapeCsvValue(participant.matchesPlayed || 0),
          escapeCsvValue(participant.setsPlayed || 0),
          escapeCsvValue(participant.gamesPlayed || 0)
        ].join(','));
      });
    }

    const csvContent = csvLines.join('\n');
    const filename = `Statistics_${(stats.tournamentName || 'Tournament').replace(/\s/g, '_')}_${this.getDateString()}.csv`;
    const data = new TextEncoder().encode(csvContent);

    return {
      success: true,
      format: ExportFormat.EXCEL,
      data,
      filename,
      mimeType: 'text/csv',
      exportedAt: new Date(),
      recordCount: exportData.length,
    };
  }

  /**
   * Gets current date as string in YYYYMMDD format.
   * 
   * @returns Date string
   * @private
   */
  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  }
}
