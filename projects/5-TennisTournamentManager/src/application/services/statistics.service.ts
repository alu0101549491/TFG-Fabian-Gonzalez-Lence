/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/statistics.service.ts
 * @desc Enhanced statistics service for participant and tournament statistics (FR45-FR46)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {IStatisticsService} from '../interfaces/statistics-service.interface';
import {
  StatisticsDto,
  SurfacePerformanceDto,
  TournamentStatisticsDto,
  HeadToHeadDto,
  ResultDistributionDto,
  ParticipantActivityDto,
  ParticipantPerformanceDto,
  HeadToHeadMatchDto,
} from '../dto/statistics.dto';
import {StatisticsRepositoryImpl} from '@infrastructure/repositories/statistics.repository';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {TournamentRepositoryImpl} from '@infrastructure/repositories/tournament.repository';
import {Surface} from '../../domain/enumerations/surface';
import {MatchStatus} from '../../domain/enumerations/match-status';

/**
 * Statistics service implementation.
 * Handles participant performance statistics and tournament analytics (FR45-FR46).
 * 
 * @remarks
 * Implements:
 * - FR45: Personal participant statistics (win/loss, streaks, performance by surface, head-to-head)
 * - FR46: Tournament statistics (total participants, matches, result distribution, top performers)
 */
@Injectable({providedIn: 'root'})
export class StatisticsService implements IStatisticsService {
  /**
   * Statistics repository for data access.
   */
  private readonly statisticsRepository = inject(StatisticsRepositoryImpl);

  /**
   * Match repository for match data access.
   */
  private readonly matchRepository = inject(MatchRepositoryImpl);

  /**
   * Registration repository for participant data access.
   */
  private readonly registrationRepository = inject(RegistrationRepositoryImpl);

  /**
   * Tournament repository for tournament data access.
   */
  private readonly tournamentRepository = inject(TournamentRepositoryImpl);

  /**
   * Retrieves enhanced statistics for a participant (FR45).
   * Includes win/loss records, percentages, streaks, and performance by surface.
   *
   * @param participantId - ID of the participant
   * @returns Participant's comprehensive statistics
   */
  public async getParticipantStatistics(participantId: string): Promise<StatisticsDto> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    // Get participant's matches
    const matches = await this.matchRepository.findByParticipantId(participantId);
    
    // Initialize statistics counters
    let totalMatches = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalSetsWon = 0;
    let totalSetsLost = 0;
    let totalGamesWon = 0;
    let totalGamesLost = 0;
    
    // Streak tracking
    let currentWinStreak = 0;
    let bestWinStreak = 0;
    let currentLossStreak = 0;
    let worstLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    
    // Performance by surface tracking
    const surfaceStats: Record<string, {matches: number, wins: number, losses: number, setsWon: number, setsLost: number}> = {};
    
    // Process each match
    for (const match of matches) {
      // Only count completed matches
      if (!match.winnerId || match.status !== MatchStatus.COMPLETED) continue;
      
      totalMatches++;
      const didWin = match.winnerId === participantId;
      
      // Determine if participant is player1 or player2
      const isPlayer1 = match.player1Id === participantId;
      
      // Update win/loss counters
      if (didWin) {
        totalWins++;
        tempWinStreak++;
        tempLossStreak = 0;
        
        if (tempWinStreak > bestWinStreak) {
          bestWinStreak = tempWinStreak;
        }
        currentWinStreak = tempWinStreak;
        currentLossStreak = 0;
      } else {
        totalLosses++;
        tempLossStreak++;
        tempWinStreak = 0;
        
        if (tempLossStreak > worstLossStreak) {
          worstLossStreak = tempLossStreak;
        }
        currentLossStreak = tempLossStreak;
        currentWinStreak = 0;
      }
      
      // Process scores to calculate set/game statistics
      if (match.scores && match.scores.length > 0) {
        for (const score of match.scores) {
          const participantGames = isPlayer1 ? score.player1Games : score.player2Games;
          const opponentGames = isPlayer1 ? score.player2Games : score.player1Games;
          const participantTiebreakPoints = isPlayer1 ? score.player1TiebreakPoints : score.player2TiebreakPoints;
          const opponentTiebreakPoints = isPlayer1 ? score.player2TiebreakPoints : score.player1TiebreakPoints;
          
          // Count games won and lost
          totalGamesWon += participantGames;
          totalGamesLost += opponentGames;
          
          // Determine set winner
          if (participantGames > opponentGames) {
            totalSetsWon++;
          } else if (opponentGames > participantGames) {
            totalSetsLost++;
          }
          
          // Check for tiebreak win (tiebreak exists and participant won the set)
          if (participantTiebreakPoints !== null && participantTiebreakPoints !== undefined &&
              opponentTiebreakPoints !== null && opponentTiebreakPoints !== undefined) {
            // This was a tiebreak - participant won if they won this set
            if (participantGames > opponentGames) {
              // Participant won the tiebreak
              // Note: We increment tiebreaksWon counter below after loop
            }
          }
        }
      }
      
      // Track performance by surface (if available)
      const surface = (match as any).surface as Surface;
      if (surface) {
        if (!surfaceStats[surface]) {
          surfaceStats[surface] = {matches: 0, wins: 0, losses: 0, setsWon: 0, setsLost: 0};
        }
        surfaceStats[surface].matches++;
        if (didWin) {
          surfaceStats[surface].wins++;
        } else {
          surfaceStats[surface].losses++;
        }
        
        // Add sets won/lost for this surface
        if (match.scores && match.scores.length > 0) {
          for (const score of match.scores) {
            const participantGames = isPlayer1 ? score.player1Games : score.player2Games;
            const opponentGames = isPlayer1 ? score.player2Games : score.player1Games;
            
            if (participantGames > opponentGames) {
              surfaceStats[surface].setsWon++;
            } else if (opponentGames > participantGames) {
              surfaceStats[surface].setsLost++;
            }
          }
        }
      }
    }
    
    // Count tiebreaks won across all matches
    let tiebreaksWon = 0;
    for (const match of matches) {
      if (!match.winnerId || match.status !== MatchStatus.COMPLETED) continue;
      if (!match.scores || match.scores.length === 0) continue;
      
      const isPlayer1 = match.player1Id === participantId;
      
      for (const score of match.scores) {
        const participantGames = isPlayer1 ? score.player1Games : score.player2Games;
        const opponentGames = isPlayer1 ? score.player2Games : score.player1Games;
        const participantTiebreakPoints = isPlayer1 ? score.player1TiebreakPoints : score.player2TiebreakPoints;
        const opponentTiebreakPoints = isPlayer1 ? score.player2TiebreakPoints : score.player1TiebreakPoints;
        
        // If tiebreak points exist and participant won the set, they won the tiebreak
        if (participantTiebreakPoints !== null && participantTiebreakPoints !== undefined &&
            opponentTiebreakPoints !== null && opponentTiebreakPoints !== undefined &&
            participantGames > opponentGames) {
          tiebreaksWon++;
        }
      }
    }
    
    // Calculate percentages and ratios
    const winPercentage = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    const setRatio = totalSetsLost > 0 ? totalSetsWon / totalSetsLost : totalSetsWon;
    
    // Convert surface stats to DTOs
    const performanceBySurface: Record<string, SurfacePerformanceDto> = {};
    for (const [surface, stats] of Object.entries(surfaceStats)) {
      performanceBySurface[surface] = {
        surface: surface as Surface,
        matches: stats.matches,
        wins: stats.wins,
        losses: stats.losses,
        winPercentage: stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0,
        setsWon: stats.setsWon,
        setsLost: stats.setsLost,
      };
    }
    
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
      tiebreaksWon,
      currentWinStreak,
      bestWinStreak,
      currentLossStreak,
      worstLossStreak,
      performanceBySurface: Object.keys(performanceBySurface).length > 0 ? performanceBySurface : undefined,
    };
  }

  /**
   * Retrieves comprehensive statistics for all participants in a tournament (FR46).
   * Includes total participants, matches, result distribution, and top performers.
   *
   * @param tournamentId - ID of the tournament
   * @returns Tournament-level statistics
   */
  public async getTournamentStatistics(tournamentId: string): Promise<StatisticsDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    // Get all registrations for this tournament
    const registrations = await this.registrationRepository.findByTournament(tournamentId);
    const participantIds = registrations.map((r) => r.userId);
    
    // Get statistics for each participant
    const statistics: StatisticsDto[] = [];
    
    for (const participantId of participantIds) {
      try {
        const participantStats = await this.getParticipantStatistics(participantId);
        // Filter to only tournament-specific matches if possible
        statistics.push({
          ...participantStats,
          tournamentId,
        });
      } catch (error) {
        console.error(`Failed to get statistics for participant ${participantId}:`, error);
      }
    }
    
    return statistics;
  }

  /**
   * Gets detailed tournament statistics including result distribution and top performers (FR46).
   *
   * @param tournamentId - ID of the tournament
   * @returns Comprehensive tournament statistics
   */
  public async getDetailedTournamentStatistics(tournamentId: string): Promise<TournamentStatisticsDto> {
    // Validate input
    if (!tournamentId ||tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    // Get tournament data
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Get registrations
    const registrations = await this.registrationRepository.findByTournament(tournamentId);
    
    // Get all matches (placeholder - ideally get by tournament)
    const allMatches = await this.matchRepository.findAll();
    
    // Calculate result distribution
    const resultDistribution: ResultDistributionDto = {
      completed: allMatches.filter((m) => m.status === MatchStatus.COMPLETED).length,
      pending: allMatches.filter((m) => m.status === MatchStatus.SCHEDULED).length,
      inProgress: allMatches.filter((m) => m.status === MatchStatus.IN_PROGRESS).length,
      cancelled: allMatches.filter((m) => m.status === MatchStatus.CANCELLED).length,
      walkovers: allMatches.filter((m) => m.status === MatchStatus.WALKOVER).length,
      retirements: allMatches.filter((m) => m.status === MatchStatus.RETIRED).length,
    };
    
    // Calculate participant activity
    const participantActivity: Map<string, {matches: number, sets: number, games: number}> = new Map();
    const participantPerformance: Map<string, {wins: number, losses: number, streak: number}> = new Map();
    
    for (const match of allMatches) {
      if (match.status === MatchStatus.COMPLETED) {
        // Track activity for both players
        const player1 = match.player1Id || '';
        const player2 = match.player2Id || '';
        
        if (!participantActivity.has(player1)) {
          participantActivity.set(player1, {matches: 0, sets: 0, games: 0});
        }
        if (!participantActivity.has(player2)) {
          participantActivity.set(player2, {matches: 0, sets: 0, games: 0});
        }
        
        participantActivity.get(player1)!.matches++;
        participantActivity.get(player2)!.matches++;
        
        // Track performance        
        if (!participantPerformance.has(player1)) {
          participantPerformance.set(player1, {wins: 0, losses: 0, streak: 0});
        }
        if (!participantPerformance.has(player2)) {
          participantPerformance.set(player2, {wins: 0, losses: 0, streak: 0});
        }
        
        if (match.winnerId === player1) {
          participantPerformance.get(player1)!.wins++;
          participantPerformance.get(player2)!.losses++;
        } else if (match.winnerId === player2) {
          participantPerformance.get(player2)!.wins++;
          participantPerformance.get(player1)!.losses++;
        }
      }
    }
    
    // Convert to DTOs and sort
    const mostActiveParticipants: ParticipantActivityDto[] = Array.from(participantActivity.entries())
      .map(([participantId, activity]) => ({
        participantId,
        participantName: 'Unknown', // Would fetch from user service
        matchesPlayed: activity.matches,
        setsPlayed: activity.sets,
        gamesPlayed: activity.games,
      }))
      .sort((a, b) => b.matchesPlayed - a.matchesPlayed)
      .slice(0, 10);
    
    const topPerformers: ParticipantPerformanceDto[] = Array.from(participantPerformance.entries())
      .map(([participantId, performance]) => ({
        participantId,
        participantName: 'Unknown', // Would fetch from user service
        wins: performance.wins,
        losses: performance.losses,
        winPercentage: performance.wins + performance.losses > 0 
          ? (performance.wins / (performance.wins + performance.losses)) * 100 
          : 0,
        currentStreak: performance.streak,
      }))
      .sort((a, b) => b.winPercentage - a.winPercentage)
      .slice(0, 10);
    
    return {
      tournamentId,
      tournamentName: tournament.name,
      totalParticipants: registrations.length,
      totalMatches: allMatches.length,
      completedMatches: resultDistribution.completed,
      pendingMatches: resultDistribution.pending,
      resultDistribution,
      mostActiveParticipants,
      topPerformers,
    };
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
   * Retrieves enhanced head-to-head statistics between two players (FR45).
   * Includes match history, surface performance, and detailed statistics.
   *
   * @param player1Id - ID of the first player
   * @param player2Id - ID of the second player
   * @returns Enhanced head-to-head statistics
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
      (m) =>
        (m.player1Id === player1Id && m.player2Id === player2Id) ||
        (m.player1Id === player2Id && m.player2Id === player1Id)
    );
    
    // Calculate head-to-head stats
    let player1Wins = 0;
    let player2Wins = 0;
    let player1SetsWon = 0;
    let player2SetsWon = 0;
    const matchHistory: HeadToHeadMatchDto[] = [];
    
    for (const match of h2hMatches) {
      // Count wins
      if (match.winnerId === player1Id) {
        player1Wins++;
      } else if (match.winnerId === player2Id) {
        player2Wins++;
      }
      
      // Track sets (would need match score parsing)
      // Placeholder: player1SetsWon += ...
      
      // Add to match history
      if (match.status === MatchStatus.COMPLETED) {
        matchHistory.push({
          matchId: match.id,
          date: match.createdAt,
          tournamentName: undefined, // Would fetch tournament name
          surface: undefined, // Would fetch from tournament/match
          score: match.score || 'N/A',
          winnerId: match.winnerId || 'Unknown',
        });
      }
    }
    
    // Sort match history by date (most recent first)
    matchHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const h2hDto: HeadToHeadDto = {
      player1Id,
      player1Name: undefined, // Would fetch from user service
      player2Id,
      player2Name: undefined, // Would fetch from user service
      totalMatches: h2hMatches.length,
      player1Wins,
      player2Wins,
      player1SetsWon,
      player2SetsWon,
      lastMatch: matchHistory.length > 0 ? matchHistory[0].date : undefined,
      matchHistory,
    };
    
    return h2hDto as unknown as Record<string, unknown>;
  }
}
