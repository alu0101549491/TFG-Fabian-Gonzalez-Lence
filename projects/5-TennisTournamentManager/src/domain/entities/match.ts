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
 * - SCHEDULED → IN_PROGRESS → COMPLETED | RETIRED | ABANDONED
 * - IN_PROGRESS → SUSPENDED → IN_PROGRESS
 * - SCHEDULED → WALKOVER | CANCELLED | DEFAULT | NOT_PLAYED
 * - Any state can be marked as DEAD_RUBBER (without changing competitive state)
 * - BYE is assigned at creation for automatic passes
 * 
 * Valid state transitions:
 * - SCHEDULED → IN_PROGRESS, WALKOVER, CANCELLED, DEFAULT, NOT_PLAYED, BYE
 * - IN_PROGRESS → COMPLETED, RETIRED, SUSPENDED, ABANDONED, DEFAULT
 * - SUSPENDED → IN_PROGRESS, ABANDONED, CANCELLED
 * - COMPLETED → DEAD_RUBBER (administrative marking)
 * 
 * Final states (terminal): COMPLETED, RETIRED, WALKOVER, ABANDONED, BYE, NOT_PLAYED, CANCELLED, DEFAULT
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

  /**
   * Records a retirement during the match.
   * Player retires mid-match, opponent receives victory.
   *
   * @param retiringPlayerId - The ID of the player who is retiring
   * @param reason - The reason for retirement (injury, illness, etc.)
   * @throws Error if match is not IN_PROGRESS or SUSPENDED
   */
  public retire(retiringPlayerId: string, reason?: string): void {
    if (this.status !== MatchStatus.IN_PROGRESS && this.status !== MatchStatus.SUSPENDED) {
      throw new Error(
        `Cannot retire from match in status ${this.status}. ` +
        'Match must be IN_PROGRESS or SUSPENDED.'
      );
    }

    if (retiringPlayerId !== this.player1Id && retiringPlayerId !== this.player2Id) {
      throw new Error(
        'Retiring player must be one of the match participants.'
      );
    }

    if (reason && reason.trim().length === 0) {
      throw new Error('Retirement reason cannot be empty if provided.');
    }

    // Note: Actual status and winner update should be done via repository in application layer
    // The opponent automatically wins
  }

  /**
   * Abandons the match without a valid result.
   * Match cannot be completed due to external circumstances.
   *
   * @param reason - The reason for abandonment (weather, court damage, etc.)
   * @throws Error if match is already in a final state
   */
  public abandon(reason: string): void {
    const finalStates = [
      MatchStatus.COMPLETED,
      MatchStatus.RETIRED,
      MatchStatus.WALKOVER,
      MatchStatus.ABANDONED,
      MatchStatus.CANCELLED,
      MatchStatus.DEFAULT,
      MatchStatus.NOT_PLAYED,
      MatchStatus.BYE,
    ];

    if (finalStates.includes(this.status)) {
      throw new Error(
        `Cannot abandon match in final status ${this.status}.`
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Abandonment reason is required.');
    }

    // Note: Actual status update should be done via repository in application layer
    // No winner is assigned for abandoned matches
  }

  /**
   * Cancels a scheduled match.
   * Match is cancelled before it starts.
   *
   * @param reason - The reason for cancellation
   * @throws Error if match has already started or is in a final state
   */
  public cancel(reason: string): void {
    const invalidStates = [
      MatchStatus.IN_PROGRESS,
      MatchStatus.COMPLETED,
      MatchStatus.RETIRED,
      MatchStatus.WALKOVER,
      MatchStatus.ABANDONED,
      MatchStatus.DEFAULT,
      MatchStatus.BYE,
    ];

    if (invalidStates.includes(this.status)) {
      throw new Error(
        `Cannot cancel match in status ${this.status}. ` +
        'Match must be SCHEDULED, SUSPENDED, or NOT_PLAYED.'
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Cancellation reason is required.');
    }

    // Note: Actual status update should be done via repository in application layer
  }

  /**
   * Applies a default (disciplinary disqualification) to a player.
   * Player is disqualified, opponent receives automatic victory.
   *
   * @param defaultedPlayerId - The ID of the player receiving the default
   * @param reason - The reason for default (conduct violation, etc.)
   * @throws Error if match is in a final state
   */
  public applyDefault(defaultedPlayerId: string, reason: string): void {
    const finalStates = [
      MatchStatus.COMPLETED,
      MatchStatus.RETIRED,
      MatchStatus.WALKOVER,
      MatchStatus.ABANDONED,
      MatchStatus.CANCELLED,
      MatchStatus.NOT_PLAYED,
      MatchStatus.BYE,
    ];

    if (finalStates.includes(this.status)) {
      throw new Error(
        `Cannot apply default to match in final status ${this.status}.`
      );
    }

    if (defaultedPlayerId !== this.player1Id && defaultedPlayerId !== this.player2Id) {
      throw new Error(
        'Defaulted player must be one of the match participants.'
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Default reason is required.');
    }

    // Note: Actual status and winner update should be done via repository in application layer
    // The opponent automatically wins
  }

  /**
   * Marks the match as not played.
   * Match was scheduled but never disputed.
   *
   * @param reason - The reason the match was not played
   * @throws Error if match has already started or been played
   */
  public markNotPlayed(reason: string): void {
    if (this.status !== MatchStatus.SCHEDULED) {
      throw new Error(
        `Cannot mark match as not played in status ${this.status}. ` +
        'Match must be SCHEDULED.'
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Reason for not played status is required.');
    }

    // Note: Actual status update should be done via repository in application layer
  }

  /**
   * Marks a completed match as a dead rubber.
   * Match result is recorded but has no impact on tournament standings.
   *
   * @throws Error if match is not completed
   */
  public markAsDeadRubber(): void {
    if (this.status !== MatchStatus.COMPLETED) {
      throw new Error(
        `Cannot mark match as dead rubber in status ${this.status}. ` +
        'Match must be COMPLETED first.'
      );
    }

    // Note: Actual status update should be done via repository in application layer
    // This is typically an administrative action after match completion
  }

  /**
   * Starts the match, transitioning from SCHEDULED to IN_PROGRESS.
   *
   * @throws Error if match is not SCHEDULED
   */
  public start(): void {
    if (this.status !== MatchStatus.SCHEDULED) {
      throw new Error(
        `Cannot start match in status ${this.status}. ` +
        'Match must be SCHEDULED.'
      );
    }

    // Note: Actual status and timestamp update should be done via repository in application layer
  }

  /**
   * Resumes a suspended match, transitioning back to IN_PROGRESS.
   *
   * @throws Error if match is not SUSPENDED
   */
  public resume(): void {
    if (this.status !== MatchStatus.SUSPENDED) {
      throw new Error(
        `Cannot resume match in status ${this.status}. ` +
        'Match must be SUSPENDED.'
      );
    }

    // Note: Actual status update should be done via repository in application layer
  }

  /**
   * Validates if a state transition is allowed.
   *
   * @param fromStatus - Current status
   * @param toStatus - Target status
   * @returns True if transition is valid
   */
  public static isValidTransition(fromStatus: MatchStatus, toStatus: MatchStatus): boolean {
    const transitions: Record<MatchStatus, MatchStatus[]> = {
      [MatchStatus.SCHEDULED]: [
        MatchStatus.IN_PROGRESS,
        MatchStatus.WALKOVER,
        MatchStatus.CANCELLED,
        MatchStatus.DEFAULT,
        MatchStatus.NOT_PLAYED,
        MatchStatus.BYE,
      ],
      [MatchStatus.IN_PROGRESS]: [
        MatchStatus.COMPLETED,
        MatchStatus.RETIRED,
        MatchStatus.SUSPENDED,
        MatchStatus.ABANDONED,
        MatchStatus.DEFAULT,
      ],
      [MatchStatus.SUSPENDED]: [
        MatchStatus.IN_PROGRESS,
        MatchStatus.ABANDONED,
        MatchStatus.CANCELLED,
      ],
      [MatchStatus.COMPLETED]: [
        MatchStatus.DEAD_RUBBER,
      ],
      // Final states (no transitions allowed)
      [MatchStatus.RETIRED]: [],
      [MatchStatus.WALKOVER]: [],
      [MatchStatus.ABANDONED]: [],
      [MatchStatus.BYE]: [],
      [MatchStatus.NOT_PLAYED]: [],
      [MatchStatus.CANCELLED]: [],
      [MatchStatus.DEFAULT]: [],
      [MatchStatus.DEAD_RUBBER]: [],
    };

    return transitions[fromStatus]?.includes(toStatus) ?? false;
  }
}
