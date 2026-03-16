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
  /** ID of the first participant. */
  participant1Id: string;
  /** ID of the second participant. */
  participant2Id: string;
  /** ID of the match winner (null if not yet decided). */
  winnerId?: string | null;
  /** Current match status. */
  status?: MatchStatus;
  /** Scheduled start time. */
  scheduledAt?: Date | null;
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
  public readonly participant1Id: string;
  public readonly participant2Id: string;
  public readonly winnerId: string | null;
  public readonly status: MatchStatus;
  public readonly scheduledAt: Date | null;
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
    this.participant1Id = props.participant1Id;
    this.participant2Id = props.participant2Id;
    this.winnerId = props.winnerId ?? null;
    this.status = props.status ?? MatchStatus.SCHEDULED;
    this.scheduledAt = props.scheduledAt ?? null;
    this.startedAt = props.startedAt ?? null;
    this.completedAt = props.completedAt ?? null;
    this.matchOrder = props.matchOrder ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Checks whether the match can transition to the given status.
   *
   * @param newStatus - The target status to transition to
   * @returns True if the transition is valid per the state machine
   */
  public canTransitionTo(newStatus: MatchStatus): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether a given participant is involved in this match.
   *
   * @param participantId - The ID of the participant to check
   * @returns True if the participant is one of the two players
   */
  public hasParticipant(participantId: string): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether the match has been decided (has a winner or is a walkover).
   *
   * @returns True if the match result is final
   */
  public isDecided(): boolean {
    throw new Error('Not implemented');
  }
}
