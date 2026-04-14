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
  OpponentMatchupDto,
  DoublesTeamMatchupDto,
  CategoryStatsDto,
} from '../dto/statistics.dto';
import {StatisticsRepositoryImpl} from '@infrastructure/repositories/statistics.repository';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {TournamentRepositoryImpl} from '@infrastructure/repositories/tournament.repository';
import {BracketRepositoryImpl} from '@infrastructure/repositories/bracket.repository';
import {CategoryRepositoryImpl} from '@infrastructure/repositories/category.repository';
import {UserService} from './user.service';
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
   * Bracket repository for bracket data access.
   */
  private readonly bracketRepository = inject(BracketRepositoryImpl);

  /**
   * Category repository for category data access.
   */
  private readonly categoryRepository = inject(CategoryRepositoryImpl);

  /**
   * User service for fetching participant information.
   */
  private readonly userService = inject(UserService);

  /**
   * Parses a score string (e.g., "6-4, 3-6, 7-6(3)") and returns set results.
   * 
   * @param scoreString - Score string from match
   * @param isPlayer1 - Whether the participant is player1 (affects score interpretation)
   * @returns Object with sets won/lost and games won/lost for the participant
   */
  private parseScoreString(
    scoreString: string | null | undefined,
    isPlayer1: boolean
  ): {setsWon: number, setsLost: number, gamesWon: number, gamesLost: number, tiebreaksWon: number} {
    const result = {setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, tiebreaksWon: 0};
    
    if (!scoreString || scoreString.trim() === '' || scoreString === 'N/A') {
      return result;
    }

    // Split by comma or semicolon to get individual sets
    const sets = scoreString.split(/[,;]/).map(s => s.trim());
    
    for (const setScore of sets) {
      // Match patterns like "6-4", "7-6(3)", "6-7(5)"
      const match = setScore.match(/(\d+)-(\d+)(?:\((\d+)\))?/);
      if (!match) continue;
      
      const player1Games = parseInt(match[1], 10);
      const player2Games = parseInt(match[2], 10);
      const tiebreakPoints = match[3] ? parseInt(match[3], 10) : null;
      
      // Determine participant's games and opponent's games
      const participantGames = isPlayer1 ? player1Games : player2Games;
      const opponentGames = isPlayer1 ? player2Games : player1Games;
      
      result.gamesWon += participantGames;
      result.gamesLost += opponentGames;
      
      // Determine set winner
      if (participantGames > opponentGames) {
        result.setsWon++;
        // If there was a tiebreak and participant won, they won the tiebreak
        if (tiebreakPoints !== null) {
          result.tiebreaksWon++;
        }
      } else if (opponentGames > participantGames) {
        result.setsLost++;
      }
    }
    
    return result;
  }

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
      // Count matches with definitive results (completed, retired, or walkover)
      if (!match.winnerId || 
          (match.status !== MatchStatus.COMPLETED && 
           match.status !== MatchStatus.RETIRED && 
           match.status !== MatchStatus.WALKOVER)) {
        continue;
      }
      
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
      
      // Parse score string to calculate set/game statistics
      const scoreData = this.parseScoreString(match.score, isPlayer1);
      totalSetsWon += scoreData.setsWon;
      totalSetsLost += scoreData.setsLost;
      totalGamesWon += scoreData.gamesWon;
      totalGamesLost += scoreData.gamesLost;
      
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
        
        // Add sets won/lost for this surface from parsed score
        surfaceStats[surface].setsWon += scoreData.setsWon;
        surfaceStats[surface].setsLost += scoreData.setsLost;
      }
    }
    
    // Count tiebreaks won across all matches
    let tiebreaksWon = 0;
    for (const match of matches) {
      if (!match.winnerId || match.status !== MatchStatus.COMPLETED) continue;
      
      const isPlayer1 = match.player1Id === participantId;
      const scoreData = this.parseScoreString(match.score, isPlayer1);
      tiebreaksWon += scoreData.tiebreaksWon;
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
    
    // Calculate opponent matchups
    const opponentMatchupsMap: Record<string, {matches: number, wins: number, losses: number, lastMatch?: Date}> = {};
    
    for (const match of matches) {
      if (!match.winnerId || 
          (match.status !== MatchStatus.COMPLETED && 
           match.status !== MatchStatus.RETIRED && 
           match.status !== MatchStatus.WALKOVER)) {
        continue;
      }
      
      // Determine opponent ID
      const opponentId = match.player1Id === participantId ? match.player2Id : match.player1Id;
      const didWin = match.winnerId === participantId;
      const matchDate = match.completedAt || match.updatedAt;
      
      if (!opponentMatchupsMap[opponentId]) {
        opponentMatchupsMap[opponentId] = {matches: 0, wins: 0, losses: 0};
      }
      
      opponentMatchupsMap[opponentId].matches++;
      if (didWin) {
        opponentMatchupsMap[opponentId].wins++;
      } else {
        opponentMatchupsMap[opponentId].losses++;
      }
      
      // Track most recent match
      if (!opponentMatchupsMap[opponentId].lastMatch || matchDate > opponentMatchupsMap[opponentId].lastMatch!) {
        opponentMatchupsMap[opponentId].lastMatch = matchDate;
      }
    }
    
    // Fetch opponent names and create DTOs
    const opponentMatchups: OpponentMatchupDto[] = [];
    
    for (const [opponentId, stats] of Object.entries(opponentMatchupsMap)) {
      try {
        const opponentUser = await this.userService.getPublicUserInfo(opponentId);
        const opponentName = opponentUser.firstName && opponentUser.lastName
          ? `${opponentUser.firstName} ${opponentUser.lastName}`
          : opponentUser.username || 'Unknown';
        
        opponentMatchups.push({
          opponentId,
          opponentName,
          totalMatches: stats.matches,
          wins: stats.wins,
          losses: stats.losses,
          winPercentage: stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0,
          lastMatch: stats.lastMatch,
        });
      } catch (error) {
        // If user fetch fails, use Unknown
        opponentMatchups.push({
          opponentId,
          opponentName: 'Unknown',
          totalMatches: stats.matches,
          wins: stats.wins,
          losses: stats.losses,
          winPercentage: stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0,
          lastMatch: stats.lastMatch,
        });
      }
    }
    
    // Sort by total matches (most frequent opponents first)
    opponentMatchups.sort((a, b) => b.totalMatches - a.totalMatches);
    
    // Calculate doubles team matchups (separate from singles matchups)
    const doublesTeamMatchupsMap: Record<string, {matches: number, wins: number, losses: number, lastMatch?: Date}> = {};
    
    for (const match of matches) {
      // Only process doubles matches
      const isDoubles = Boolean((match as any).participant1TeamId || (match as any).participant2TeamId);
      if (!isDoubles) continue;
      
      // For doubles matches, check winnerTeamId instead of winnerId
      const hasWinner = isDoubles ? Boolean((match as any).winnerTeamId) : Boolean(match.winnerId);
      if (!hasWinner || 
          (match.status !== MatchStatus.COMPLETED && 
           match.status !== MatchStatus.RETIRED && 
           match.status !== MatchStatus.WALKOVER)) {
        continue;
      }
      
      // Find which team the participant belongs to
      const participant1Team = (match as any).participant1Team;
      const participant2Team = (match as any).participant2Team;
      
      const participantInTeam1 = participant1Team && 
        (participant1Team.player1?.id === participantId || participant1Team.player2?.id === participantId);
      const participantInTeam2 = participant2Team && 
        (participant2Team.player1?.id === participantId || participant2Team.player2?.id === participantId);
      
      if (!participantInTeam1 && !participantInTeam2) continue;
      
      // Determine opponent team ID
      const opponentTeamId = participantInTeam1 
        ? (match as any).participant2TeamId 
        : (match as any).participant1TeamId;
      
      const didWin = (match as any).winnerTeamId === (participantInTeam1 ? (match as any).participant1TeamId : (match as any).participant2TeamId);
      const matchDate = match.completedAt || match.updatedAt;
      
      if (!doublesTeamMatchupsMap[opponentTeamId]) {
        doublesTeamMatchupsMap[opponentTeamId] = {matches: 0, wins: 0, losses: 0};
      }
      
      doublesTeamMatchupsMap[opponentTeamId].matches++;
      if (didWin) {
        doublesTeamMatchupsMap[opponentTeamId].wins++;
      } else {
        doublesTeamMatchupsMap[opponentTeamId].losses++;
      }
      
      // Track most recent match
      if (!doublesTeamMatchupsMap[opponentTeamId].lastMatch || matchDate > doublesTeamMatchupsMap[opponentTeamId].lastMatch!) {
        doublesTeamMatchupsMap[opponentTeamId].lastMatch = matchDate;
      }
    }
    
    // Fetch opponent team names and create DTOs
    const doublesTeamMatchups: DoublesTeamMatchupDto[] = [];
    
    for (const [opponentTeamId, stats] of Object.entries(doublesTeamMatchupsMap)) {
      // Find the team data in one of the matches
      let opponentTeamName = 'Unknown';
      for (const match of matches) {
        const isDoubles = Boolean((match as any).participant1TeamId || (match as any).participant2TeamId);
        if (!isDoubles) continue;
        
        if ((match as any).participant1TeamId === opponentTeamId && (match as any).participant1Team) {
          const team = (match as any).participant1Team;
          opponentTeamName = `${team.player1.firstName} ${team.player1.lastName} / ${team.player2.firstName} ${team.player2.lastName}`;
          break;
        } else if ((match as any).participant2TeamId === opponentTeamId && (match as any).participant2Team) {
          const team = (match as any).participant2Team;
          opponentTeamName = `${team.player1.firstName} ${team.player1.lastName} / ${team.player2.firstName} ${team.player2.lastName}`;
          break;
        }
      }
      
      doublesTeamMatchups.push({
        opponentTeamId,
        opponentTeamName,
        totalMatches: stats.matches,
        wins: stats.wins,
        losses: stats.losses,
        winPercentage: stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0,
        lastMatch: stats.lastMatch,
      });
    }
    
    // Sort by total matches (most frequent opponent teams first)
    doublesTeamMatchups.sort((a, b) => b.totalMatches - a.totalMatches);
    
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
      opponentMatchups: opponentMatchups.length > 0 ? opponentMatchups : undefined,
      doublesTeamMatchups: doublesTeamMatchups.length > 0 ? doublesTeamMatchups : undefined,
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
    
    // Get categories for breakdown (FR46: rankings by category)
    const categories = await this.categoryRepository.findByTournamentId(tournamentId);
    
    // Get all brackets for this tournament
    const brackets = await this.bracketRepository.findByTournament(tournamentId);
    
    // Get all matches for this tournament by fetching matches for each bracket
    const matchPromises = brackets.map(bracket => this.matchRepository.findByBracket(bracket.id));
    const matchArrays = await Promise.all(matchPromises);
    const allMatches = matchArrays.flat();
    
    // Calculate result distribution
    const resultDistribution: ResultDistributionDto = {
      completed: allMatches.filter((m) => m.status === MatchStatus.COMPLETED).length,
      pending: allMatches.filter((m) => m.status === MatchStatus.NOT_SCHEDULED || m.status === MatchStatus.SCHEDULED).length,
      inProgress: allMatches.filter((m) => m.status === MatchStatus.IN_PROGRESS).length,
      cancelled: allMatches.filter((m) => m.status === MatchStatus.CANCELLED).length,
      walkovers: allMatches.filter((m) => m.status === MatchStatus.WALKOVER).length,
      retirements: allMatches.filter((m) => m.status === MatchStatus.RETIRED).length,
    };
    
    // Calculate participant activity and performance
    const participantActivity: Map<string, {matches: number, sets: number, games: number}> = new Map();
    const participantPerformance: Map<string, {wins: number, losses: number, streak: number}> = new Map();
    
    // First pass: count wins/losses and activity
    for (const match of allMatches) {
      // Count matches that have a definitive result (completed, retired, or walkover)
      if (match.status === MatchStatus.COMPLETED || 
          match.status === MatchStatus.RETIRED || 
          match.status === MatchStatus.WALKOVER) {
        
        // Detect if this is a doubles match
        const isDoubles = Boolean((match as any).participant1TeamId || (match as any).participant2TeamId);
        
        // Track activity for both participants (either players or teams)
        let participant1: string;
        let participant2: string;
        let winnerId: string | null;
        
        if (isDoubles) {
          // For doubles: use team IDs
          participant1 = (match as any).participant1TeamId || '';
          participant2 = (match as any).participant2TeamId || '';
          winnerId = (match as any).winnerTeamId || null;
        } else {
          // For singles: use player IDs
          participant1 = match.player1Id || '';
          participant2 = match.player2Id || '';
          winnerId = match.winnerId;
        }
        
        if (!participantActivity.has(participant1)) {
          participantActivity.set(participant1, {matches: 0, sets: 0, games: 0});
        }
        if (!participantActivity.has(participant2)) {
          participantActivity.set(participant2, {matches: 0, sets: 0, games: 0});
        }
        
        participantActivity.get(participant1)!.matches++;
        participantActivity.get(participant2)!.matches++;
        
        // Parse scores to count sets and games PLAYED (both players play the same sets/games)
        if (match.scores && match.scores.length > 0) {
          let setsPlayed = 0;
          let totalGamesInMatch = 0;
          
          for (const scoreEntry of match.scores) {
            const player1Games = scoreEntry.player1Games || 0;
            const player2Games = scoreEntry.player2Games || 0;
            
            // Only count sets that were actually played (not 0-0 placeholder sets)
            if (player1Games > 0 || player2Games > 0) {
              setsPlayed++;
              totalGamesInMatch += player1Games + player2Games;
            }
          }
          
          // Both players played the same number of sets and games
          participantActivity.get(participant1)!.sets += setsPlayed;
          participantActivity.get(participant1)!.games += totalGamesInMatch;
          participantActivity.get(participant2)!.sets += setsPlayed;
          participantActivity.get(participant2)!.games += totalGamesInMatch;
        } else if (match.score && match.score.trim().length > 0) {
          // Fallback: parse score string (format: "6-4, 3-6, 7-6")
          const sets = match.score.split(',').map(s => s.trim()).filter(s => s.length > 0);
          let setsPlayed = 0;
          let totalGamesInMatch = 0;
          
          for (const setScore of sets) {
            const games = setScore.split('-').map(g => parseInt(g.trim(), 10));
            if (games.length === 2 && !isNaN(games[0]) && !isNaN(games[1])) {
              // Only count sets that were actually played
              if (games[0] > 0 || games[1] > 0) {
                setsPlayed++;
                totalGamesInMatch += games[0] + games[1];
              }
            }
          }
          
          // Both players played the same number of sets and games
          participantActivity.get(participant1)!.sets += setsPlayed;
          participantActivity.get(participant1)!.games += totalGamesInMatch;
          participantActivity.get(participant2)!.sets += setsPlayed;
          participantActivity.get(participant2)!.games += totalGamesInMatch;
        }
        
        // Track performance        
        if (!participantPerformance.has(participant1)) {
          participantPerformance.set(participant1, {wins: 0, losses: 0, streak: 0});
        }
        if (!participantPerformance.has(participant2)) {
          participantPerformance.set(participant2, {wins: 0, losses: 0, streak: 0});
        }
        
        if (winnerId && winnerId === participant1) {
          participantPerformance.get(participant1)!.wins++;
          participantPerformance.get(participant2)!.losses++;
        } else if (winnerId && winnerId === participant2) {
          participantPerformance.get(participant2)!.wins++;
          participantPerformance.get(participant1)!.losses++;
        }
      }
    }
    
    // Second pass: calculate current win streaks by sorting matches chronologically
    const finishedMatches = allMatches.filter(
      (m) => m.status === MatchStatus.COMPLETED || 
             m.status === MatchStatus.RETIRED || 
             m.status === MatchStatus.WALKOVER
    ).sort((a, b) => {
      // Sort by completion date (most recent last)
      const dateA = a.completedAt || a.updatedAt;
      const dateB = b.completedAt || b.updatedAt;
      return dateA.getTime() - dateB.getTime();
    });
    
    // Calculate streaks for each participant
    const participantMatches: Map<string, Array<{date: Date, won: boolean}>> = new Map();
    
    for (const match of finishedMatches) {
      // Detect if this is a doubles match
      const isDoubles = Boolean((match as any).participant1TeamId || (match as any).participant2TeamId);
      
      let participant1: string;
      let participant2: string;
      let winnerId: string | null;
      const matchDate = match.completedAt || match.updatedAt;
      
      if (isDoubles) {
        // For doubles: use team IDs
        participant1 = (match as any).participant1TeamId || '';
        participant2 = (match as any).participant2TeamId || '';
        winnerId = (match as any).winnerTeamId || null;
      } else {
        // For singles: use player IDs
        participant1 = match.player1Id || '';
        participant2 = match.player2Id || '';
        winnerId = match.winnerId;
      }
      
      if (!participantMatches.has(participant1)) {
        participantMatches.set(participant1, []);
      }
      if (!participantMatches.has(participant2)) {
        participantMatches.set(participant2, []);
      }
      
      participantMatches.get(participant1)!.push({
        date: matchDate,
        won: winnerId === participant1
      });
      participantMatches.get(participant2)!.push({
        date: matchDate,
        won: winnerId === participant2
      });
    }
    
    // Calculate current streak for each participant (from most recent matches backwards)
    for (const [participantId, matches] of participantMatches.entries()) {
      let currentStreak = 0;
      
      // Iterate from most recent match backwards
      for (let i = matches.length - 1; i >= 0; i--) {
        if (matches[i].won) {
          currentStreak++;
        } else {
          // Streak broken by a loss
          break;
        }
      }
      
      // Update the streak in performance map
      if (participantPerformance.has(participantId)) {
        participantPerformance.get(participantId)!.streak = currentStreak;
      }
    }
    
    // Fetch participant names for all participants with activity or performance data
    const allParticipantIds = new Set<string>([
      ...participantActivity.keys(),
      ...participantPerformance.keys()
    ]);
    
    // Separate singles players from doubles teams
    const playerIds = new Set<string>();
    const teamIds = new Set<string>();
    
    for (const participantId of allParticipantIds) {
      if (participantId.startsWith('dbl_')) {
        teamIds.add(participantId);
      } else if (participantId.startsWith('usr_')) {
        playerIds.add(participantId);
      }
    }
    
    // Fetch user info in parallel for all single players
    const participantNames = new Map<string, string>();
    
    // Fetch singles player names
    await Promise.all(
      Array.from(playerIds).map(async (playerId) => {
        try {
          const user = await this.userService.getPublicUserInfo(playerId);
          const fullName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.username || 'Unknown';
          participantNames.set(playerId, fullName);
        } catch (error) {
          // If user not found, use 'Unknown'
          participantNames.set(playerId, 'Unknown');
        }
      })
    );
    
    // Fetch doubles team names from match data (teams are already enriched in matches)
    for (const teamId of teamIds) {
      let teamName = 'Unknown';
      
      // Find a match with this team ID to get the team data
      const matchWithTeam = allMatches.find(
        m => (m as any).participant1TeamId === teamId || (m as any).participant2TeamId === teamId
      );
      
      if (matchWithTeam) {
        const team = (matchWithTeam as any).participant1TeamId === teamId 
          ? (matchWithTeam as any).participant1Team 
          : (matchWithTeam as any).participant2Team;
        
        if (team && team.player1 && team.player2) {
          // Format as "FirstName LastName / FirstName LastName"
          const player1Name = `${team.player1.firstName || ''} ${team.player1.lastName || ''}`.trim();
          const player2Name = `${team.player2.firstName || ''} ${team.player2.lastName || ''}`.trim();
          teamName = `${player1Name} / ${player2Name}`;
        }
      }
      
      participantNames.set(teamId, teamName);
    }
    
    // Convert to DTOs and sort
    const mostActiveParticipants: ParticipantActivityDto[] = Array.from(participantActivity.entries())
      .map(([participantId, activity]) => ({
        participantId,
        participantName: participantNames.get(participantId) || 'Unknown',
        matchesPlayed: activity.matches,
        setsPlayed: activity.sets,
        gamesPlayed: activity.games,
      }))
      .sort((a, b) => b.matchesPlayed - a.matchesPlayed)
      .slice(0, 10);
    
    const topPerformers: ParticipantPerformanceDto[] = Array.from(participantPerformance.entries())
      .map(([participantId, performance]) => ({
        participantId,
        participantName: participantNames.get(participantId) || 'Unknown',
        wins: performance.wins,
        losses: performance.losses,
        winPercentage: performance.wins + performance.losses > 0 
          ? (performance.wins / (performance.wins + performance.losses)) * 100 
          : 0,
        currentStreak: performance.streak,
      }))
      .sort((a, b) => b.winPercentage - a.winPercentage)
      .slice(0, 10);
    
    // Calculate total finished matches (completed, retired, walkover all count as finished)
    const totalFinishedMatches = resultDistribution.completed + resultDistribution.retirements + resultDistribution.walkovers;

    // Build category breakdown (FR46: rankings by category)
    const categoryBreakdown: CategoryStatsDto[] = categories.map(cat => {
      // Participants registered in this category
      const catRegistrations = registrations.filter(r => r.categoryId === cat.id);
      // Matches in this category (via brackets whose phaseId maps to this category's brackets)
      // We approximate by counting matches where both participants are registered in this category
      const catParticipantIds = new Set(catRegistrations.map(r => r.participantId));
      const catMatches = allMatches.filter(
        m => {
          // Check if this is a doubles match
          const isDoubles = Boolean((m as any).participant1TeamId || (m as any).participant2TeamId);
          
          if (isDoubles) {
            // For doubles, check if the team members are registered in this category
            // This is an approximation since we're checking by team ID
            const team1Id = (m as any).participant1TeamId;
            const team2Id = (m as any).participant2TeamId;
            return team1Id || team2Id; // Include all doubles matches for now
          } else {
            // For singles, check if players are registered in this category
            return (m.player1Id && catParticipantIds.has(m.player1Id)) ||
                   (m.player2Id && catParticipantIds.has(m.player2Id));
          }
        }
      );
      const catCompleted = catMatches.filter(
        m => m.status === MatchStatus.COMPLETED || m.status === MatchStatus.RETIRED || m.status === MatchStatus.WALKOVER
      );

      // Find top performer in this category
      let topPerformer: string | undefined;
      let bestWinRate = -1;
      for (const [pid, perf] of participantPerformance.entries()) {
        if (!catParticipantIds.has(pid) && !pid.startsWith('dbl_')) continue; // Include teams
        const total = perf.wins + perf.losses;
        if (total === 0) continue;
        const rate = perf.wins / total;
        if (rate > bestWinRate) {
          bestWinRate = rate;
          topPerformer = participantNames.get(pid);
        }
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalParticipants: catRegistrations.length,
        totalMatches: catMatches.length,
        completedMatches: catCompleted.length,
        topPerformer,
      };
    });

    return {
      tournamentId,
      tournamentName: tournament.name,
      totalParticipants: registrations.length,
      totalMatches: allMatches.length,
      completedMatches: totalFinishedMatches,
      pendingMatches: resultDistribution.pending,
      resultDistribution,
      mostActiveParticipants,
      topPerformers,
      categoryBreakdown,
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
   * Includes match history with scores, surface performance, and tournament context.
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

    // Load player labels (non-blocking if user lookup fails)
    const [player1, player2] = await Promise.all([
      this.userService.getUserById(player1Id).catch(() => null),
      this.userService.getUserById(player2Id).catch(() => null),
    ]);

    // Caches to avoid repeated API lookups for the same bracket/tournament
    const bracketToTournamentId = new Map<string, string | null>();
    const tournamentNameCache = new Map<string, string>();
    const tournamentSurfaceCache = new Map<string, string | undefined>();

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
      // Only process completed matches for stats
      if (match.status === MatchStatus.COMPLETED || match.status === MatchStatus.RETIRED || match.status === MatchStatus.WALKOVER) {
        // Count wins
        if (match.winnerId === player1Id) {
          player1Wins++;
        } else if (match.winnerId === player2Id) {
          player2Wins++;
        }

        // Track set totals from score string
        const isPlayer1 = match.player1Id === player1Id;
        const scoreData = this.parseScoreString(match.score, isPlayer1);
        player1SetsWon += scoreData.setsWon;
        player2SetsWon += scoreData.setsLost;  // Player2's sets won = Player1's sets lost

        // Resolve tournament info from bracketId (safe for public users)
        let tournamentName = 'Unknown Tournament';
        let surface = (match as Record<string, unknown>)['surface'] as string | undefined;

        let tournamentId = bracketToTournamentId.get(match.bracketId);
        if (tournamentId === undefined) {
          const bracket = await this.bracketRepository.findById(match.bracketId).catch(() => null);
          tournamentId = bracket?.tournamentId ?? null;
          bracketToTournamentId.set(match.bracketId, tournamentId);
        }

        if (tournamentId) {
          if (!tournamentNameCache.has(tournamentId)) {
            const tournament = await this.tournamentRepository.findById(tournamentId).catch(() => null);
            tournamentNameCache.set(tournamentId, tournament?.name ?? 'Unknown Tournament');
            tournamentSurfaceCache.set(tournamentId, tournament?.surface as string | undefined);
          }

          tournamentName = tournamentNameCache.get(tournamentId) ?? 'Unknown Tournament';
          surface = tournamentSurfaceCache.get(tournamentId) ?? surface;
        }

        // Add to match history
        matchHistory.push({
          matchId: match.id,
          date: match.createdAt,
          tournamentName,
          surface,
          score: match.score || 'N/A',
          winnerId: match.winnerId || 'Unknown',
        });
      }
    }

    // Sort match history by date (most recent first)
    matchHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const h2hDto: HeadToHeadDto = {
      player1Id,
      player1Name: player1 ? `${player1.firstName} ${player1.lastName}` : 'Unknown Player',
      player2Id,
      player2Name: player2 ? `${player2.firstName} ${player2.lastName}` : 'Unknown Player',
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

  /**
   * Get head-to-head statistics between a participant's team and an opponent team (doubles).
   *
   * @param participantId - ID of the participant (player)
   * @param opponentTeamId - ID of the opponent doubles team
   * @returns Team head-to-head statistics
   */
  public async getTeamHeadToHead(participantId: string, opponentTeamId: string): Promise<Record<string, unknown>> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }

    if (!opponentTeamId || opponentTeamId.trim().length === 0) {
      throw new Error('Opponent team ID is required');
    }

    // Caches
    const bracketToTournamentId = new Map<string, string | null>();
    const tournamentNameCache = new Map<string, string>();
    const tournamentSurfaceCache = new Map<string, string | undefined>();

    // Get all matches
    const matches = await this.matchRepository.findAll();
    
    // Filter doubles matches involving the participant and the opponent team
    const teamH2hMatches = matches.filter((match) => {
      const isDoubles = Boolean((match as any).participant1TeamId || (match as any).participant2TeamId);
      if (!isDoubles) return false;

      const participant1Team = (match as any).participant1Team;
      const participant2Team = (match as any).participant2Team;

      const participantInTeam1 = participant1Team && 
        (participant1Team.player1?.id === participantId || participant1Team.player2?.id === participantId);
      const participantInTeam2 = participant2Team && 
        (participant2Team.player1?.id === participantId || participant2Team.player2?.id === participantId);

      if (!participantInTeam1 && !participantInTeam2) return false;

      // Check if opponent team is involved
      const team1Id = (match as any).participant1TeamId;
      const team2Id = (match as any).participant2TeamId;

      if (participantInTeam1 && team2Id === opponentTeamId) return true;
      if (participantInTeam2 && team1Id === opponentTeamId) return true;

      return false;
    });

    // Calculate statistics
    let participantTeamWins = 0;
    let opponentTeamWins = 0;
    let participantTeamSetsWon = 0;
    let opponentTeamSetsWon = 0;
    let participantTeamId = '';
    let participantTeamName = 'Unknown Team';
    let opponentTeamName = 'Unknown Team';
    const matchHistory: TeamHeadToHeadMatchDto[] = [];

    for (const match of teamH2hMatches) {
      if (match.status === MatchStatus.COMPLETED || match.status === MatchStatus.RETIRED || match.status === MatchStatus.WALKOVER) {
        const participant1Team = (match as any).participant1Team;
        const participant2Team = (match as any).participant2Team;

        const participantInTeam1 = participant1Team && 
          (participant1Team.player1?.id === participantId || participant1Team.player2?.id === participantId);
        
        participantTeamId = participantInTeam1 ? (match as any).participant1TeamId : (match as any).participant2TeamId;
        const winnerTeamId = (match as any).winnerTeamId;

        // Get team names
        if (participant1Team && participantInTeam1) {
          participantTeamName = `${participant1Team.player1.firstName} ${participant1Team.player1.lastName} / ${participant1Team.player2.firstName} ${participant1Team.player2.lastName}`;
        }
        if (participant2Team && !participantInTeam1) {
          participantTeamName = `${participant2Team.player1.firstName} ${participant2Team.player1.lastName} / ${participant2Team.player2.firstName} ${participant2Team.player2.lastName}`;
        }
        if (participant1Team && !participantInTeam1) {
          opponentTeamName = `${participant1Team.player1.firstName} ${participant1Team.player1.lastName} / ${participant1Team.player2.firstName} ${participant1Team.player2.lastName}`;
        }
        if (participant2Team && participantInTeam1) {
          opponentTeamName = `${participant2Team.player1.firstName} ${participant2Team.player1.lastName} / ${participant2Team.player2.firstName} ${participant2Team.player2.lastName}`;
        }

        // Count wins
        if (winnerTeamId === participantTeamId) {
          participantTeamWins++;
        } else {
          opponentTeamWins++;
        }

        // Track set totals
        const isParticipantTeam1 = participantInTeam1;
        const scoreData = this.parseScoreString(match.score, isParticipantTeam1);
        participantTeamSetsWon += scoreData.setsWon;
        opponentTeamSetsWon += scoreData.setsLost;

        // Resolve tournament info
        let tournamentName = 'Unknown Tournament';
        let surface: string | undefined;

        let tournamentId = bracketToTournamentId.get(match.bracketId);
        if (tournamentId === undefined) {
          const bracket = await this.bracketRepository.findById(match.bracketId).catch(() => null);
          tournamentId = bracket?.tournamentId ?? null;
          bracketToTournamentId.set(match.bracketId, tournamentId);
        }

        if (tournamentId) {
          if (!tournamentNameCache.has(tournamentId)) {
            const tournament = await this.tournamentRepository.findById(tournamentId).catch(() => null);
            tournamentNameCache.set(tournamentId, tournament?.name ?? 'Unknown Tournament');
            tournamentSurfaceCache.set(tournamentId, tournament?.surface as string | undefined);
          }

          tournamentName = tournamentNameCache.get(tournamentId) ?? 'Unknown Tournament';
          surface = tournamentSurfaceCache.get(tournamentId);
        }

        matchHistory.push({
          matchId: match.id,
          date: match.createdAt,
          tournamentName,
          surface,
          score: match.score || 'N/A',
          winnerTeamId: winnerTeamId || 'Unknown',
        });
      }
    }

    // Sort by most recent first
    matchHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const teamH2hDto: TeamHeadToHeadDto = {
      participantTeamId,
      participantTeamName,
      opponentTeamId,
      opponentTeamName,
      totalMatches: teamH2hMatches.length,
      participantTeamWins,
      opponentTeamWins,
      participantTeamSetsWon,
      opponentTeamSetsWon,
      lastMatch: matchHistory.length > 0 ? matchHistory[0].date : undefined,
      matchHistory,
    };

    return teamH2hDto as unknown as Record<string, unknown>;
  }
}
