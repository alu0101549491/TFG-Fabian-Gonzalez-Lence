/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/entities/standing.ts
 * @desc Entity representing a participant's standing in a tournament category. Used in Round Robin groups and for final classification.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Properties for creating a Standing entity.
 */
export interface StandingProps {
  /** Unique identifier for the standing record. */
  id: string;
  /** ID of the bracket this standing belongs to. */
  bracketId: string;
  /** ID of the participant. */
  participantId: string;
  /** Current position/rank in the standings. */
  position: number;
  /** Number of matches played. */
  matchesPlayed?: number;
  /** Number of matches won. */
  matchesWon?: number;
  /** Number of matches lost. */
  matchesLost?: number;
  /** Number of sets won. */
  setsWon?: number;
  /** Number of sets lost. */
  setsLost?: number;
  /** Number of games won. */
  gamesWon?: number;
  /** Number of games lost. */
  gamesLost?: number;
  /** Total points (for points-based ranking). */
  points?: number;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a participant's standing within a bracket.
 *
 * Standings are calculated automatically based on match results using
 * the configured RankingSystem (Strategy Pattern): points-based, ratio-based, or ELO.
 */
export class Standing {
  public readonly id: string;
  public readonly bracketId: string;
  public readonly participantId: string;
  public readonly position: number;
  public readonly matchesPlayed: number;
  public readonly matchesWon: number;
  public readonly matchesLost: number;
  public readonly setsWon: number;
  public readonly setsLost: number;
  public readonly gamesWon: number;
  public readonly gamesLost: number;
  public readonly points: number;
  public readonly updatedAt: Date;

  constructor(props: StandingProps) {
    this.id = props.id;
    this.bracketId = props.bracketId;
    this.participantId = props.participantId;
    this.position = props.position;
    this.matchesPlayed = props.matchesPlayed ?? 0;
    this.matchesWon = props.matchesWon ?? 0;
    this.matchesLost = props.matchesLost ?? 0;
    this.setsWon = props.setsWon ?? 0;
    this.setsLost = props.setsLost ?? 0;
    this.gamesWon = props.gamesWon ?? 0;
    this.gamesLost = props.gamesLost ?? 0;
    this.points = props.points ?? 0;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Updates the standings statistics based on a match result.
   *
   * @param result - The match result data
   */
  public updateStats(result: Record<string, unknown>): void {
    // Note: Actual statistics calculation should be done in the application
    // layer by the StandingService using the configured RankingSystem (Strategy Pattern).
    // This method validates that the result data is provided.
    if (!result) {
      throw new Error('Match result is required to update standings.');
    }
    
    // Validation only - real implementation in application layer
  }
}
