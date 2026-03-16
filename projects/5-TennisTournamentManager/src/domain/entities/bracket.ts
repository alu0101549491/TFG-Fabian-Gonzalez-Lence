/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/bracket.ts
 * @desc Entity representing a tournament bracket/draw. Created by the BracketGeneratorFactory (Factory Pattern) based on the selected BracketType.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {BracketType} from '../enumerations/bracket-type';

/**
 * Properties for creating a Bracket entity.
 */
export interface BracketProps {
  /** Unique identifier for the bracket. */
  id: string;
  /** ID of the tournament this bracket belongs to. */
  tournamentId: string;
  /** ID of the category this bracket is for. */
  categoryId: string;
  /** Type of bracket format. */
  bracketType: BracketType;
  /** Number of participants in the bracket. */
  size: number;
  /** Total number of rounds in the bracket. */
  totalRounds?: number;
  /** Serialized bracket structure (JSON). */
  structure?: string;
  /** Whether the bracket has been finalized/published. */
  isPublished?: boolean;
  /** Creation timestamp. */
  createdAt?: Date;
}

/**
 * Represents a tournament bracket (draw) for a specific category.
 *
 * Brackets are created via the BracketGeneratorFactory (Factory Pattern)
 * which selects the appropriate IBracketGenerator implementation based
 * on the BracketType (Round Robin, Single Elimination, Double Elimination, Match Play).
 */
export class Bracket {
  public readonly id: string;
  public readonly tournamentId: string;
  public readonly categoryId: string;
  public readonly bracketType: BracketType;
  public readonly size: number;
  public readonly totalRounds: number;
  public readonly structure: string;
  public readonly isPublished: boolean;
  public readonly createdAt: Date;

  constructor(props: BracketProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.categoryId = props.categoryId;
    this.bracketType = props.bracketType;
    this.size = props.size;
    this.totalRounds = props.totalRounds ?? 0;
    this.structure = props.structure ?? '{}';
    this.isPublished = props.isPublished ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Calculates the total number of matches required for this bracket.
   *
   * @returns The total number of matches
   */
  public getTotalMatches(): number {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether the bracket structure is complete and ready for publication.
   *
   * @returns True if all positions in the bracket are filled
   */
  public isComplete(): boolean {
    throw new Error('Not implemented');
  }
}
