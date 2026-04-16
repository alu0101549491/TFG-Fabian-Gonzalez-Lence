/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/category.ts
 * @desc Entity representing a tournament category (e.g., Men's Singles, Women's Doubles, U18). Categories subdivide a tournament into distinct competitive divisions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Properties for creating a Category entity.
 */
export interface CategoryProps {
  /** Unique identifier for the category. */
  id: string;
  /** ID of the tournament this category belongs to. */
  tournamentId: string;
  /** Name of the category (e.g., "Men's Singles", "U18"). */
  name: string;
  /** Optional description of the category rules or restrictions. */
  description?: string;
  /** Minimum age for participants (null if unrestricted). */
  minAge?: number | null;
  /** Maximum age for participants (null if unrestricted). */
  maxAge?: number | null;
  /** Gender restriction: 'M', 'F', or null for mixed. */
  gender?: string | null;
  /** Maximum number of participants in this category. */
  maxQuota?: number;
  /** Number of reserved spots. */
  reservedSpots?: number;
  /** Creation timestamp. */
  createdAt?: Date;
}

/**
 * Represents a competitive category within a tournament.
 *
 * Categories allow a single tournament to host multiple divisions
 * (e.g., age groups, gender, skill level), each with its own bracket,
 * standings, and order of play.
 */
export class Category {
  public readonly id: string;
  public readonly tournamentId: string;
  public readonly name: string;
  public readonly description: string;
  public readonly minAge: number | null;
  public readonly maxAge: number | null;
  public readonly gender: string | null;
  public readonly maxQuota: number;
  public readonly reservedSpots: number;
  public readonly createdAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.name = props.name;
    this.description = props.description ?? '';
    this.minAge = props.minAge ?? null;
    this.maxAge = props.maxAge ?? null;
    this.gender = props.gender ?? null;
    this.maxQuota = props.maxQuota ?? 32;
    this.reservedSpots = props.reservedSpots ?? 0;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Checks whether this category has available spots for registration.
   *
   * @returns True if there are spots available
   */
  public hasAvailableSpots(): boolean {
    // Category has available spots if reserved spots haven't filled the quota
    // Actual participant count should be checked in application layer
    return this.reservedSpots < this.maxQuota;
  }
}
