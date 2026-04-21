/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 20, 2026
 * @file src/domain/enumerations/tournament-type.ts
 * @desc Enumeration for tournament types (singles or doubles play).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * TournamentType enumeration defines whether a tournament is singles or doubles.
 */
export enum TournamentType {
  /** Singles tournament (1 vs 1). */
  SINGLES = 'SINGLES',
  /** Doubles tournament (2 vs 2, formed pairs). */
  DOUBLES = 'DOUBLES',
}
