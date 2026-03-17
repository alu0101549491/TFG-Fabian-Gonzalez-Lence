/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/bracket-type.ts
 * @desc Enumeration defining the supported bracket/draw formats for tournament phases.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the type of bracket format used in a tournament phase.
 * Used by BracketGeneratorFactory (Factory Pattern) to select the appropriate generator.
 */
export enum BracketType {
  /** Single elimination knockout: loser is eliminated immediately. */
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  /** Round Robin: all participants play against each other in the group. */
  ROUND_ROBIN = 'ROUND_ROBIN',
  /** Match Play: open format without fixed draw structure. */
  MATCH_PLAY = 'MATCH_PLAY',
}
