/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file application/dto/statistics.dto.ts
 * @desc Data transfer objects for statistics-related operations (FR45-FR46)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Surface} from '../../domain/enumerations/surface';

/** DTO for statistics output representation (FR45: Personal participant statistics). */
export interface StatisticsDto {
  participantId: string | null;
  participantName: string | null;
  tournamentId: string | null;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winPercentage: number;
  totalSetsWon: number;
  totalSetsLost: number;
  setRatio: number;
  totalGamesWon: number;
  totalGamesLost: number;
  tiebreaksWon: number;
  currentWinStreak: number;
  bestWinStreak: number;
  currentLossStreak?: number;
  worstLossStreak?: number;
  performanceBySurface?: Record<string, SurfacePerformanceDto>;
  opponentMatchups?: OpponentMatchupDto[];
}

/** DTO for opponent matchup history. */
export interface OpponentMatchupDto {
  opponentId: string;
  opponentName: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winPercentage: number;
  lastMatch?: Date;
}

/** DTO for surface-specific performance statistics. */
export interface SurfacePerformanceDto {
  surface: Surface;
  matches: number;
  wins: number;
  losses: number;
  winPercentage: number;
  setsWon: number;
  setsLost: number;
}

/** DTO for tournament-level statistics (FR46: Tournament statistics). */
export interface TournamentStatisticsDto {
  tournamentId: string;
  tournamentName: string;
  totalParticipants: number;
  totalMatches: number;
  completedMatches: number;
  pendingMatches: number;
  resultDistribution: ResultDistributionDto;
  mostActiveParticipants: ParticipantActivityDto[];
  topPerformers: ParticipantPerformanceDto[];
}

/** DTO for result distribution in tournament. */
export interface ResultDistributionDto {
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  walkovers: number;
  retirements: number;
}

/** DTO for participant activity metrics. */
export interface ParticipantActivityDto {
  participantId: string;
  participantName: string;
  matchesPlayed: number;
  setsPlayed: number;
  gamesPlayed: number;
}

/** DTO for participant performance metrics. */
export interface ParticipantPerformanceDto {
  participantId: string;
  participantName: string;
  wins: number;
  losses: number;
  winPercentage: number;
  currentStreak: number;
}

/** DTO for enhanced head-to-head statistics. */
export interface HeadToHeadDto {
  player1Id: string;
  player1Name?: string;
  player2Id: string;
  player2Name?: string;
  totalMatches: number;
  player1Wins: number;
  player2Wins: number;
  player1SetsWon: number;
  player2SetsWon: number;
  lastMatch?: Date;
  matchHistory?: HeadToHeadMatchDto[];
}

/** DTO for individual match in head-to-head history. */
export interface HeadToHeadMatchDto {
  matchId: string;
  date: Date;
  tournamentName?: string;
  surface?: Surface;
  score: string;
  winnerId: string;
}
