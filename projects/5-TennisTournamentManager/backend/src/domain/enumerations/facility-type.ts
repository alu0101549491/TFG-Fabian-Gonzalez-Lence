/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file backend/src/domain/enumerations/facility-type.ts
 * @desc Enumeration defining the facility type for tennis tournaments (indoor/outdoor).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the facility type of a tennis tournament venue.
 */
export enum FacilityType {
  /** Indoor facility with controlled environment. */
  INDOOR = 'INDOOR',
  /** Outdoor facility exposed to weather conditions. */
  OUTDOOR = 'OUTDOOR',
}
