/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
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

/**
 * Type guard to check if a value is a valid Surface.
 *
 * @param value - The value to check
 * @returns True if the value is a valid Surface
 */
export function isValidSurface(value: unknown): value is Surface {
  return Object.values(Surface).includes(value as Surface);
}

/** Array of all surface types for iteration. */
export const ALL_SURFACES = Object.values(Surface);
