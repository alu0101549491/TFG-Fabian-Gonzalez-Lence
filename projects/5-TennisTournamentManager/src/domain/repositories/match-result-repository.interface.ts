/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/domain/repositories/match-result-repository.interface.ts
 * @desc Repository interface for MatchResult entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MatchResult} from '../entities/match-result';
import {ConfirmationStatus} from '../enumerations/confirmation-status';

/**
 * Repository interface for MatchResult entity data access operations.
 * Defines the contract for persisting and retrieving match result data.
 */
export interface IMatchResultRepository {
  /**
   * Finds a match result by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the match result if found, null otherwise
   */
  findById(id: string): Promise<MatchResult | null>;

  /**
   * Retrieves all match results.
   * @returns Promise resolving to an array of match results
   */
  findAll(): Promise<MatchResult[]>;

  /**
   * Persists a new match result.
   * @param entity - The match result to save
   * @returns Promise resolving to the saved match result
   */
  save(entity: MatchResult): Promise<MatchResult>;

  /**
   * Updates an existing match result.
   * @param entity - The match result with updated data
   * @returns Promise resolving to the updated match result
   */
  update(entity: MatchResult): Promise<MatchResult>;

  /**
   * Deletes a match result by its unique identifier.
   * @param id - The unique identifier of the match result to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all result submissions for a specific match.
   * Multiple submissions can exist if results are disputed or rejected.
   * @param matchId - The unique identifier of the match
   * @returns Promise resolving to an array of match results
   */
  findByMatch(matchId: string): Promise<MatchResult[]>;

  /**
   * Finds the confirmed result for a specific match.
   * Returns null if no confirmed result exists.
   * @param matchId - The unique identifier of the match
   * @returns Promise resolving to the confirmed match result or null
   */
  findConfirmedByMatch(matchId: string): Promise<MatchResult | null>;

  /**
   * Finds all match results submitted by a specific user.
   * @param userId - The unique identifier of the user
   * @returns Promise resolving to an array of match results
   */
  findBySubmitter(userId: string): Promise<MatchResult[]>;

  /**
   * Finds all match results with a specific confirmation status.
   * @param status - The confirmation status to filter by
   * @returns Promise resolving to an array of match results
   */
  findByStatus(status: ConfirmationStatus): Promise<MatchResult[]>;

  /**
   * Finds all disputed results requiring admin review.
   * @returns Promise resolving to an array of disputed match results
   */
  findDisputed(): Promise<MatchResult[]>;
}
