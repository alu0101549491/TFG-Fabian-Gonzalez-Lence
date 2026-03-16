/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/score.ts
 * @desc Entity representing the score of a tennis match. Captures set-by-set scoring with optional tiebreak details.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the score of a single set within a match.
 */
export interface SetScore {
  /** Set number (1-indexed). */
  setNumber: number;
  /** Games won by participant 1 in this set. */
  participant1Games: number;
  /** Games won by participant 2 in this set. */
  participant2Games: number;
  /** Tiebreak points for participant 1 (null if no tiebreak). */
  tiebreakParticipant1?: number | null;
  /** Tiebreak points for participant 2 (null if no tiebreak). */
  tiebreakParticipant2?: number | null;
}

/**
 * Properties for creating a Score entity.
 */
export interface ScoreProps {
  /** Unique identifier for the score record. */
  id: string;
  /** ID of the match this score belongs to. */
  matchId: string;
  /** Array of set scores. */
  sets: SetScore[];
  /** Whether the match was a retirement (player withdrew mid-match). */
  isRetirement?: boolean;
  /** ID of the retiring participant (if applicable). */
  retiredParticipantId?: string | null;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents the full score of a tennis match.
 *
 * Scores are recorded set by set, with optional tiebreak details.
 * Supports retirement scenarios where a player withdraws mid-match.
 */
export class Score {
  public readonly id: string;
  public readonly matchId: string;
  public readonly sets: SetScore[];
  public readonly isRetirement: boolean;
  public readonly retiredParticipantId: string | null;
  public readonly updatedAt: Date;

  constructor(props: ScoreProps) {
    this.id = props.id;
    this.matchId = props.matchId;
    this.sets = props.sets;
    this.isRetirement = props.isRetirement ?? false;
    this.retiredParticipantId = props.retiredParticipantId ?? null;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Returns the score as a formatted string (e.g., "6-4, 3-6, 7-6(5)").
   *
   * @returns The formatted score string
   */
  public toDisplayString(): string {
    throw new Error('Not implemented');
  }

  /**
   * Calculates the total sets won by each participant.
   *
   * @returns An object with sets won by participant 1 and participant 2
   */
  public getSetsWon(): {participant1: number; participant2: number} {
    throw new Error('Not implemented');
  }
}
