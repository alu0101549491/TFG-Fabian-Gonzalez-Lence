/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 20, 2026
 * @file src/application/dto/category.dto.ts
 * @desc Data Transfer Objects for tournament category operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * DTO for creating a new category.
 */
export interface CreateCategoryDto {
  /** Tournament ID this category belongs to */
  tournamentId: string;
  /** Category name (e.g., "Men's Singles", "Women's Doubles") */
  name: string;
  /** Gender category (e.g., OPEN, MENS, WOMENS, MIXED) */
  gender: string;
  /** Age group (e.g., YOUTH, JUNIOR, OPEN, VETERANS) */
  ageGroup: string;
  /** Maximum number of participants in this category */
  maxParticipants: number;
}

/**
 * DTO representing a category.
 */
export interface CategoryDto {
 /** Unique category identifier */
  id: string;
  /** Tournament ID this category belongs to */
  tournamentId: string;
  /** Category name */
  name: string;
  /** Gender category */
  gender: string;
  /** Age group */
  ageGroup: string;
  /** Maximum number of participants */
  maxParticipants: number;
}
