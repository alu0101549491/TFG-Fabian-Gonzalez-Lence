/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/bracket-repository.interface.ts
 * @desc Repository interface for Bracket entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Bracket} from '../entities/bracket.entity';

/**
 * Repository interface for Bracket entity data access operations.
 * Defines the contract for persisting and retrieving bracket data.
 */
export interface IBracketRepository {
  /**
   * Finds a bracket by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the bracket if found, null otherwise
   */
  findById(id: string): Promise<Bracket | null>;

  /**
   * Retrieves all brackets.
   * @returns Promise resolving to an array of brackets
   */
  findAll(): Promise<Bracket[]>;

  /**
   * Persists a new bracket.
   * @param entity - The bracket to save
   * @returns Promise resolving to the saved bracket
   */
  save(entity: Bracket): Promise<Bracket>;

  /**
   * Updates an existing bracket.
   * @param entity - The bracket with updated data
   * @returns Promise resolving to the updated bracket
   */
  update(entity: Bracket): Promise<Bracket>;

  /**
   * Deletes a bracket by its unique identifier.
   * @param id - The unique identifier of the bracket to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all brackets belonging to a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of brackets
   */
  findByTournament(tournamentId: string): Promise<Bracket[]>;

  /**
   * Finds a bracket for a specific category.
   * @param categoryId - The unique identifier of the category
   * @returns Promise resolving to the bracket if found, null otherwise
   */
  findByCategoryId(categoryId: string): Promise<Bracket | null>;
}
