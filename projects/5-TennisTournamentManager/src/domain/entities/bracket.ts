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
import {Match} from './match';

/**
 * Properties for creating a Bracket entity.
 */
export interface BracketProps {
  /** Unique identifier for the bracket. */
  id: string;
  /** ID of the tournament this bracket belongs to. */
  tournamentId: string;
  /** ID of the phase this bracket belongs to. */
  phaseId: string;
  /** Type of bracket format. */
  bracketType: BracketType;
  /** Number of participants in the bracket. */
  size: number;
  /** Total number of rounds in the bracket. */
  totalRounds?: number;
  /** Serialized bracket structure (JSON). */
  structure?: string;
  /** Matches within this bracket. */
  matches?: Match[];
  /** Seed assignments for participants. */
  seeds?: string[];
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
  public readonly phaseId: string;
  public readonly bracketType: BracketType;
  public readonly size: number;
  public readonly totalRounds: number;
  public readonly structure: string;
  public readonly matches: Match[];
  public readonly seeds: string[];
  public readonly isPublished: boolean;
  public readonly createdAt: Date;

  constructor(props: BracketProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.phaseId = props.phaseId;
    this.bracketType = props.bracketType;
    this.size = props.size;
    this.totalRounds = props.totalRounds ?? 0;
    this.structure = props.structure ?? '{}';
    this.matches = props.matches ?? [];
    this.seeds = props.seeds ?? [];
    this.isPublished = props.isPublished ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Generates the bracket structure with the given participants.
   *
   * @param participants - List of participant IDs to place in the bracket
   */
  public generate(participants: string[]): void {
    if (this.isPublished) {
      throw new Error('Cannot regenerate a published bracket.');
    }
    
    if (participants.length === 0) {
      throw new Error('Cannot generate bracket with no participants.');
    }
    
    if (participants.length > this.size) {
      throw new Error(
        `Number of participants (${participants.length}) exceeds bracket size (${this.size}).`
      );
    }
    
    // Note: Actual bracket generation should be done via BracketGeneratorFactory
    // in the application layer. This method validates the business rules only.
  }

  /**
   * Regenerates the bracket, optionally keeping existing results.
   *
   * @param keepResults - Whether to preserve existing match results
   */
  public regenerate(keepResults: boolean): void {
    if (this.isPublished && !keepResults) {
      throw new Error(
        'Cannot regenerate published bracket without keeping results.'
      );
    }
    
    // Note: Actual bracket regeneration should be done via BracketGeneratorFactory
    // in the application layer. This method validates the business rules only.
  }
}
