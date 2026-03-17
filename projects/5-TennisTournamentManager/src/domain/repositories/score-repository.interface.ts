/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/score-repository.interface.ts
 * @desc Repository interface for Score entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Score} from '../entities/score';

/**
 * Repository interface for Score entity data access operations.
 * Defines the contract for persisting and retrieving score data.
 */
export interface IScoreRepository {
  /**
   * Finds a score by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the score if found, null otherwise
   */
  findById(id: string): Promise<Score | null>;

  /**
   * Retrieves all scores.
   * @returns Promise resolving to an array of scores
   */
  findAll(): Promise<Score[]>;

  /**
   * Persists a new score.
   * @param entity - The score to save
   * @returns Promise resolving to the saved score
   */
  save(entity: Score): Promise<Score>;

  /**
   * Updates an existing score.
   * @param entity - The score with updated data
   * @returns Promise resolving to the updated score
   */
  update(entity: Score): Promise<Score>;

  /**
   * Deletes a score by its unique identifier.
   * @param id - The unique identifier of the score to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds the score for a specific match.
   * @param matchId - The unique identifier of the match
   * @returns Promise resolving to the score if found, null otherwise
   */
  findByMatchId(matchId: string): Promise<Score | null>;
}
