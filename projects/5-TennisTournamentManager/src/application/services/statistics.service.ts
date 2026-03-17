/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/statistics.service.ts
 * @desc Statistics service implementation for participant and tournament statistics
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {IStatisticsService} from '../interfaces/statistics-service.interface';
import {StatisticsDto} from '../dto';
import {IStatisticsRepository} from '@domain/repositories/statistics-repository.interface';
import {IMatchRepository} from '@domain/repositories/match-repository.interface';

/**
 * Statistics service implementation.
 * Handles participant performance statistics and tournament analytics.
 */
export class StatisticsService implements IStatisticsService {
  /**
   * Creates a new StatisticsService instance.
   *
   * @param statisticsRepository - Statistics repository for data access
   * @param matchRepository - Match repository for match data access
   */
  public constructor(
    private readonly statisticsRepository: IStatisticsRepository,
    private readonly matchRepository: IMatchRepository,
  ) {}

  /**
   * Retrieves statistics for a participant.
   *
   * @param participantId - ID of the participant
   * @returns Participant's statistics
   */
  public async getParticipantStatistics(participantId: string): Promise<StatisticsDto> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    // Get participant's matches
    const matches = await this.matchRepository.findByParticipantId(participantId);
    
    // Calculate statistics
    let totalMatches = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalSetsWon = 0;
    let totalSetsLost = 0;
    let totalGamesWon = 0;
    let totalGamesLost = 0;
    let currentWinStreak = 0;
    let bestWinStreak = 0;
    let tempStreak = 0;
    
    for (const match of matches) {
      if (!match.winnerId) continue;
      
      totalMatches++;
      
      if (match.winnerId === participantId) {
        totalWins++;
        tempStreak++;
        if (tempStreak > bestWinStreak) bestWinStreak = tempStreak;
        currentWinStreak = tempStreak;
      } else {
        totalLosses++;
        tempStreak = 0;
        currentWinStreak = 0;
      }
    }
    
    const winPercentage = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    const setRatio = totalSetsLost > 0 ? totalSetsWon / totalSetsLost : totalSetsWon;
    
    return {
      participantId,
      participantName: null,
      tournamentId: null,
      totalMatches,
      totalWins,
      totalLosses,
      winPercentage,
      totalSetsWon,
      totalSetsLost,
      setRatio,
      totalGamesWon,
      totalGamesLost,
      tiebreaksWon: 0,
      currentWinStreak,
      bestWinStreak,
    };
  }

  /**
   * Retrieves statistics for all participants in a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of participant statistics
   */
  public async getTournamentStatistics(tournamentId: string): Promise<StatisticsDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    // In real implementation, get all unique participants from tournament
    // and calculate statistics for each
    const statistics: StatisticsDto[] = [];
    
    return statistics;
  }

  /**
   * Recalculates statistics for a participant.
   *
   * @param participantId - ID of the participant
   * @returns Updated participant statistics
   */
  public async recalculateStatistics(participantId: string): Promise<StatisticsDto> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    // Recalculate and return statistics
    return await this.getParticipantStatistics(participantId);
  }

  /**
   * Retrieves head-to-head statistics between two players.
   *
   * @param player1Id - ID of the first player
   * @param player2Id - ID of the second player
   * @returns Head-to-head statistics
   */
  public async getHeadToHead(player1Id: string, player2Id: string): Promise<Record<string, unknown>> {
    // Validate input
    if (!player1Id || player1Id.trim().length === 0) {
      throw new Error('Player 1 ID is required');
    }
    
    if (!player2Id || player2Id.trim().length === 0) {
      throw new Error('Player 2 ID is required');
    }
    
    // Get all matches between the two players
    const matches = await this.matchRepository.findAll();
    const h2hMatches = matches.filter(
      m => (m.player1Id === player1Id && m.player2Id === player2Id) ||
           (m.player1Id === player2Id && m.player2Id === player1Id)
    );
    
    // Calculate head-to-head stats
    let player1Wins = 0;
    let player2Wins = 0;
    
    for (const match of h2hMatches) {
      if (match.winnerId === player1Id) player1Wins++;
      if (match.winnerId === player2Id) player2Wins++;
    }
    
    return {
      player1Id,
      player2Id,
      totalMatches: h2hMatches.length,
      player1Wins,
      player2Wins,
      lastMatch: h2hMatches.length > 0 ? h2hMatches[h2hMatches.length - 1].createdAt : null,
    };
  }
}
