/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/statistics.ts
 * @desc Entity representing aggregated statistics for a participant or tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Properties for creating a Statistics entity.
 */
export interface StatisticsProps {
  /** Unique identifier for the statistics record. */
  id: string;
  /** ID of the participant (null if tournament-wide). */
  participantId?: string | null;
  /** ID of the tournament (null if global). */
  tournamentId?: string | null;
  /** Total matches played. */
  totalMatches?: number;
  /** Total matches won. */
  wins?: number;
  /** Total matches lost. */
  losses?: number;
  /** Total sets won. */
  totalSetsWon?: number;
  /** Total sets lost. */
  totalSetsLost?: number;
  /** Total games won. */
  totalGamesWon?: number;
  /** Total games lost. */
  totalGamesLost?: number;
  /** Number of tiebreaks won. */
  tiebreaksWon?: number;
  /** Number of retirements. */
  retirements?: number;
  /** Number of walkovers received. */
  walkovers?: number;
  /** Win streak (current consecutive wins). */
  currentWinStreak?: number;
  /** Best win streak ever achieved. */
  bestWinStreak?: number;
  /** Last calculation timestamp. */
  updatedAt?: Date;
}

/**
 * Represents aggregated statistics for a participant or tournament.
 *
 * Statistics are calculated by the StatisticsService and can be scoped
 * to a specific tournament or computed globally across all tournaments.
 */
export class Statistics {
  public readonly id: string;
  public readonly participantId: string | null;
  public readonly tournamentId: string | null;
  public readonly totalMatches: number;
  public readonly wins: number;
  public readonly losses: number;
  public readonly totalSetsWon: number;
  public readonly totalSetsLost: number;
  public readonly totalGamesWon: number;
  public readonly totalGamesLost: number;
  public readonly tiebreaksWon: number;
  public readonly retirements: number;
  public readonly walkovers: number;
  public readonly currentWinStreak: number;
  public readonly bestWinStreak: number;
  public readonly updatedAt: Date;

  constructor(props: StatisticsProps) {
    this.id = props.id;
    this.participantId = props.participantId ?? null;
    this.tournamentId = props.tournamentId ?? null;
    this.totalMatches = props.totalMatches ?? 0;
    this.wins = props.wins ?? 0;
    this.losses = props.losses ?? 0;
    this.totalSetsWon = props.totalSetsWon ?? 0;
    this.totalSetsLost = props.totalSetsLost ?? 0;
    this.totalGamesWon = props.totalGamesWon ?? 0;
    this.totalGamesLost = props.totalGamesLost ?? 0;
    this.tiebreaksWon = props.tiebreaksWon ?? 0;
    this.retirements = props.retirements ?? 0;
    this.walkovers = props.walkovers ?? 0;
    this.currentWinStreak = props.currentWinStreak ?? 0;
    this.bestWinStreak = props.bestWinStreak ?? 0;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Updates statistics from a match result.
   *
   * @param match - The match data to update from
   */
  public updateFromMatch(match: Record<string, unknown>): void {
    // Note: Actual statistics aggregation should be done in the application
    // layer by the StatisticsService. This method validates the input.
    if (!match) {
      throw new Error('Match data is required to update statistics.');
    }
    
    // Validation only - real implementation in application layer
  }
}
