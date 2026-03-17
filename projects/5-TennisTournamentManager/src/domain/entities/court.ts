/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/court.ts
 * @desc Entity representing a tennis court at a tournament venue. Courts are assigned to matches in the order of play.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Surface} from '../enumerations/surface';

/**
 * Properties for creating a Court entity.
 */
export interface CourtProps {
  /** Unique identifier for the court. */
  id: string;
  /** ID of the tournament this court belongs to. */
  tournamentId: string;
  /** Display name or number of the court (e.g., "Centre Court", "Court 3"). */
  name: string;
  /** Surface type of this specific court. */
  surface: Surface;
  /** Whether the court is indoor. */
  isIndoor?: boolean;
  /** Seating capacity of the court. */
  capacity?: number;
  /** Available time slots for this court (value object placeholders). */
  availableSlots?: string[];
  /** Whether the court is currently available for scheduling. */
  isAvailable?: boolean;
}

/**
 * Represents a physical tennis court at the tournament venue.
 *
 * Courts are resources assigned to matches during order-of-play generation.
 * Each court has a surface type, availability status, and optional capacity.
 */
export class Court {
  public readonly id: string;
  public readonly tournamentId: string;
  public readonly name: string;
  public readonly surface: Surface;
  public readonly isIndoor: boolean;
  public readonly capacity: number;
  public readonly availableSlots: string[];
  public readonly isAvailable: boolean;

  constructor(props: CourtProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.name = props.name;
    this.surface = props.surface;
    this.isIndoor = props.isIndoor ?? false;
    this.capacity = props.capacity ?? 0;
    this.availableSlots = props.availableSlots ?? [];
    this.isAvailable = props.isAvailable ?? true;
  }

  /**
   * Checks whether this court can host a match at a given time slot.
   *
   * @param startTime - Proposed match start time
   * @param endTime - Proposed match end time
   * @returns True if the court is available for the time slot
   */
  public isAvailableAt(startTime: Date, endTime: Date): boolean {
    throw new Error('Not implemented');
  }
}
