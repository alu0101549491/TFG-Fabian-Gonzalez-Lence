/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/surface.ts
 * @desc Enumeration defining the court surface types for tennis matches.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the surface type of a tennis court.
 */
export enum Surface {
  /** Hard court surface (e.g., US Open, Australian Open). */
  HARD = 'HARD',
  /** Clay/terre battue surface (e.g., Roland Garros). */
  CLAY = 'CLAY',
  /** Natural grass surface (e.g., Wimbledon). */
  GRASS = 'GRASS',
  /** Indoor court surface. */
  INDOOR = 'INDOOR',
}
