/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/statistics-service.interface.ts
 * @desc Statistics service interface for participant and tournament statistics (FR45-FR46)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {StatisticsDto, TournamentStatisticsDto} from '../dto';

/**
 * Statistics service interface.
 * Handles participant performance statistics, tournament analytics, and head-to-head comparisons.
 * 
 * @remarks
 * Implements FR45 (Personal Statistics) and FR46 (Tournament Statistics).
 */
export interface IStatisticsService {
  /**
   * Retrieves enhanced statistics for a participant (FR45).
   * Includes performance by surface, win/loss streaks, and comprehensive match statistics.
   *
   * @param participantId - ID of the participant
   * @returns Participant's statistics with enhanced metrics
   */
  getParticipantStatistics(participantId: string): Promise<StatisticsDto>;

  /**
   * Retrieves statistics for all participants in a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of participant statistics
   */
  getTournamentStatistics(tournamentId: string): Promise<StatisticsDto[]>;

  /**
   * Retrieves detailed tournament-level statistics (FR46).
   * Includes result distribution, top performers, and most active participants.
   *
   * @param tournamentId - ID of the tournament
   * @returns Comprehensive tournament statistics
   */
  getDetailedTournamentStatistics(tournamentId: string): Promise<TournamentStatisticsDto>;

  /**
   * Recalculates statistics for a participant.
   *
   * @param participantId - ID of the participant
   * @returns Updated participant statistics
   */
  recalculateStatistics(participantId: string): Promise<StatisticsDto>;

  /**
   * Retrieves enhanced head-to-head statistics between two players (FR45).
   * Includes match history, surface performance, and detailed statistics.
   *
   * @param player1Id - ID of the first player
   * @param player2Id - ID of the second player
   * @returns Enhanced head-to-head statistics
   */
  getHeadToHead(player1Id: string, player2Id: string): Promise<Record<string, unknown>>;
}
