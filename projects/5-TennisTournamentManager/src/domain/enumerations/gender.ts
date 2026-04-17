/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 20, 2026
 * @file src/domain/enumerations/gender.ts
 * @desc Enum defining tournament category gender types.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Gender types for tournament categories.
 */
export enum Gender {
  /** Open to all genders */
  OPEN = 'OPEN',
  /** Men's category */
  MENS = 'MENS',
  /** Women's category */
  WOMENS = 'WOMENS',
  /** Mixed category (doubles) */
  MIXED = 'MIXED',
}
