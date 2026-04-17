/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 20, 2026
 * @file src/domain/enumerations/age-group.ts
 * @desc Enum defining tournament category age groups.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Age groups for tournament categories.
 */
export enum AgeGroup {
  /** Youth category (under 12) */
  YOUTH = 'YOUTH',
  /** Junior category (12-18) */
  JUNIOR = 'JUNIOR',
  /** Open category (no age restriction) */
  OPEN = 'OPEN',
  /** Veterans 35+ */
  VETERANS_35 = 'VETERANS_35',
  /** Veterans 45+ */
  VETERANS_45 = 'VETERANS_45',
  /** Veterans 55+ */
  VETERANS_55 = 'VETERANS_55',
  /** Veterans 65+ */
  VETERANS_65 = 'VETERANS_65',
}
