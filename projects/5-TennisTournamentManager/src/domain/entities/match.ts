/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/match.ts
 * @desc Entity representing a tennis match between two participants. Follows the State Pattern for status transitions (MatchStatus).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MatchStatus} from '../enumerations/match-status';

/**
 * Properties for creating a Match entity.
 */
export interface MatchProps {
  /** Unique identifier for the match. */
  id: string;
  /** ID of the bracket this match belongs to. */
  bracketId: string;
  /** ID of the phase within the bracket. */
  phaseId: string;
  /** ID of the court assigned (null if not yet assigned). */
  courtId?: string | null;
  /** ID of the first player. */
  player1Id: string;
  /** ID of the second player. */
  player2Id: string;
  /** ID of the match winner (null if not yet decided). */
  winnerId?: string | null;
  /** Current match status. */
  status?: MatchStatus;
  /** Scheduled start time. */
  scheduledTime?: Date | null;
  /** Actual start time. */
  startedAt?: Date | null;
  /** Actual end time. */
  completedAt?: Date | null;
  /** Match order within the phase. */
  matchOrder?: number;
  /** Creation timestamp. */
  createdAt?: Date;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a tennis match between two participants.
 *
 * The match follows the State Pattern for status transitions:
 * SCHEDULED → IN_PROGRESS → COMPLETED
 * SCHEDULED → POSTPONED → SCHEDULED
 * IN_PROGRESS → SUSPENDED → IN_PROGRESS
 * SCHEDULED → CANCELLED | WALKOVER
 * COMPLETED → UNDER_REVIEW → COMPLETED
 */
export class Match {
  public readonly id: string;
  public readonly bracketId: string;
  public readonly phaseId: string;
  public readonly courtId: string | null;
  public readonly player1Id: string;
  public readonly player2Id: string;
  public readonly winnerId: string | null;
  public readonly status: MatchStatus;
  public readonly scheduledTime: Date | null;
  public readonly startedAt: Date | null;
  public readonly completedAt: Date | null;
  public readonly matchOrder: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: MatchProps) {
    this.id = props.id;
    this.bracketId = props.bracketId;
    this.phaseId = props.phaseId;
    this.courtId = props.courtId ?? null;
    this.player1Id = props.player1Id;
    this.player2Id = props.player2Id;
    this.winnerId = props.winnerId ?? null;
    this.status = props.status ?? MatchStatus.SCHEDULED;
    this.scheduledTime = props.scheduledTime ?? null;
    this.startedAt = props.startedAt ?? null;
    this.completedAt = props.completedAt ?? null;
    this.matchOrder = props.matchOrder ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Records the result of this match.
   *
   * @param result - The match result data
   */
  public recordResult(result: Record<string, unknown>): void {
    if (this.status !== MatchStatus.IN_PROGRESS && 
        this.status !== MatchStatus.SCHEDULED) {
      throw new Error(
        `Cannot record result for match in status ${this.status}. ` +
        'Match must be IN_PROGRESS or SCHEDULED.'
      );
    }
    
    // Validate that result contains a winner
    if (!result.winnerId) {
      throw new Error('Match result must specify a winner.');
    }
    
    // Note: Actual score recording should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Suspends the match for the given reason.
   *
   * @param reason - The reason for suspension
   */
  public suspend(reason: string): void {
    if (this.status !== MatchStatus.IN_PROGRESS) {
      throw new Error(
        `Cannot suspend match in status ${this.status}. ` +
        'Match must be IN_PROGRESS.'
      );
    }
    
    if (!reason || reason.trim().length === 0) {
      throw new Error('Suspension reason is required.');
    }
    
    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Assigns a walkover to the specified winner.
   *
   * @param winnerId - The ID of the player receiving the walkover
   */
  public assignWalkover(winnerId: string): void {
    if (this.status !== MatchStatus.SCHEDULED) {
      throw new Error(
        `Cannot assign walkover to match in status ${this.status}. ` +
        'Match must be SCHEDULED.'
      );
    }
    
    if (winnerId !== this.player1Id && winnerId !== this.player2Id) {
      throw new Error(
        'Walkover winner must be one of the match participants.'
      );
    }
    
    // Note: Actual status and winner update should be done via repository in application layer
    // This method validates the business rule only
  }
}
