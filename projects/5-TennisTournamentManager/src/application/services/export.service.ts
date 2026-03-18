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
        seed: reg.seed,
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
