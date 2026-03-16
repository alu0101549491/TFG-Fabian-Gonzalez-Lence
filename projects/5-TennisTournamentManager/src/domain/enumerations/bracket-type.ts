/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/enumerations/bracket-type.ts
 * @desc Enumeration defining the supported bracket/draw formats for tournament phases.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the type of bracket format used in a tournament phase.
 * Used by BracketGeneratorFactory (Factory Pattern) to select the appropriate generator.
 */
export enum BracketType {
  /** Round Robin: all participants play against each other in the group. */
  ROUND_ROBIN = 'ROUND_ROBIN',
  /** Single elimination knockout: loser is eliminated immediately. */
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  /** Double elimination: participant must lose twice to be eliminated. */
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  /** Match Play: head-to-head format with cumulative scoring. */
  MATCH_PLAY = 'MATCH_PLAY',
}

/**
 * Type guard to check if a value is a valid BracketType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid BracketType
 */
export function isValidBracketType(value: unknown): value is BracketType {
  return Object.values(BracketType).includes(value as BracketType);
}

/** Array of all bracket types for iteration. */
export const ALL_BRACKET_TYPES = Object.values(BracketType);
