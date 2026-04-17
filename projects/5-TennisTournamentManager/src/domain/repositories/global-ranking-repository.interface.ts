/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/repositories/global-ranking-repository.interface.ts
 * @desc Repository interface for GlobalRanking entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {GlobalRanking} from '../entities/global-ranking';

/**
 * Repository interface for GlobalRanking entity data access operations.
 * Defines the contract for persisting and retrieving global ranking data.
 */
export interface IGlobalRankingRepository {
  /**
   * Finds a global ranking by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the global ranking if found, null otherwise
   */
  findById(id: string): Promise<GlobalRanking | null>;

  /**
   * Retrieves all global rankings.
   * @returns Promise resolving to an array of global rankings
   */
  findAll(): Promise<GlobalRanking[]>;

  /**
   * Persists a new global ranking.
   * @param entity - The global ranking to save
   * @returns Promise resolving to the saved global ranking
   */
  save(entity: GlobalRanking): Promise<GlobalRanking>;

  /**
   * Updates an existing global ranking.
   * @param entity - The global ranking with updated data
   * @returns Promise resolving to the updated global ranking
   */
  update(entity: GlobalRanking): Promise<GlobalRanking>;

  /**
   * Deletes a global ranking by its unique identifier.
   * @param id - The unique identifier of the global ranking to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds the global ranking for a specific participant.
   * @param participantId - The unique identifier of the participant
   * @returns Promise resolving to the global ranking if found, null otherwise
   */
  findByParticipant(participantId: string): Promise<GlobalRanking | null>;

  /**
   * Retrieves the top N participants in the global ranking.
   * @param n - The number of top-ranked participants to retrieve
   * @returns Promise resolving to an array of global rankings
   */
  findTopN(n: number): Promise<GlobalRanking[]>;
}
