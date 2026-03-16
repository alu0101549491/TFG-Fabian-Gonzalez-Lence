/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/order-of-play.ts
 * @desc Entity representing a scheduled entry in the order of play. Maps matches to courts and time slots.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Properties for creating an OrderOfPlay entity.
 */
export interface OrderOfPlayProps {
  /** Unique identifier for the order-of-play entry. */
  id: string;
  /** ID of the tournament this scheduling belongs to. */
  tournamentId: string;
  /** ID of the match being scheduled. */
  matchId: string;
  /** ID of the court assigned. */
  courtId: string;
  /** Scheduled date of play. */
  scheduledDate: Date;
  /** Scheduled start time. */
  startTime: Date;
  /** Estimated end time. */
  estimatedEndTime?: Date | null;
  /** Order of play on the court for this day (1 = first match, etc.). */
  courtOrder: number;
  /** Whether this scheduling has been published to participants. */
  isPublished?: boolean;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a single entry in the tournament order of play.
 *
 * The order of play maps matches to specific courts and time slots,
 * ensuring no scheduling conflicts and efficient use of court resources.
 */
export class OrderOfPlay {
  public readonly id: string;
  public readonly tournamentId: string;
  public readonly matchId: string;
  public readonly courtId: string;
  public readonly scheduledDate: Date;
  public readonly startTime: Date;
  public readonly estimatedEndTime: Date | null;
  public readonly courtOrder: number;
  public readonly isPublished: boolean;
  public readonly updatedAt: Date;

  constructor(props: OrderOfPlayProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.matchId = props.matchId;
    this.courtId = props.courtId;
    this.scheduledDate = props.scheduledDate;
    this.startTime = props.startTime;
    this.estimatedEndTime = props.estimatedEndTime ?? null;
    this.courtOrder = props.courtOrder;
    this.isPublished = props.isPublished ?? false;
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Checks whether this entry conflicts with another entry on the same court.
   *
   * @param other - The other order-of-play entry to compare
   * @returns True if there is a time overlap on the same court
   */
  public conflictsWith(other: OrderOfPlay): boolean {
    throw new Error('Not implemented');
  }
}
