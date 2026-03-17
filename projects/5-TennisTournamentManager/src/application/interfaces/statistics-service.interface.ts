/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/statistics-service.interface.ts
 * @desc Statistics service interface for participant and tournament statistics
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {StatisticsDto} from '../dto';

/**
 * Statistics service interface.
 * Handles participant performance statistics and tournament analytics.
 */
export interface IStatisticsService {
  /**
   * Retrieves statistics for a participant.
   *
   * @param participantId - ID of the participant
   * @returns Participant's statistics
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
   * Recalculates statistics for a participant.
   *
   * @param participantId - ID of the participant
   * @returns Updated participant statistics
   */
  recalculateStatistics(participantId: string): Promise<StatisticsDto>;

  /**
   * Retrieves head-to-head statistics between two players.
   *
   * @param player1Id - ID of the first player
   * @param player2Id - ID of the second player
   * @returns Head-to-head statistics
   */
  getHeadToHead(player1Id: string, player2Id: string): Promise<Record<string, unknown>>;
}
