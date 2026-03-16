/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/category-repository.interface.ts
 * @desc Repository interface for Category entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Category} from '../entities/category.entity';

/**
 * Repository interface for Category entity data access operations.
 * Defines the contract for persisting and retrieving category data.
 */
export interface ICategoryRepository {
  /**
   * Finds a category by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the category if found, null otherwise
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Retrieves all categories.
   * @returns Promise resolving to an array of categories
   */
  findAll(): Promise<Category[]>;

  /**
   * Persists a new category.
   * @param entity - The category to save
   * @returns Promise resolving to the saved category
   */
  save(entity: Category): Promise<Category>;

  /**
   * Updates an existing category.
   * @param entity - The category with updated data
   * @returns Promise resolving to the updated category
   */
  update(entity: Category): Promise<Category>;

  /**
   * Deletes a category by its unique identifier.
   * @param id - The unique identifier of the category to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all categories belonging to a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of categories
   */
  findByTournamentId(tournamentId: string): Promise<Category[]>;
}
