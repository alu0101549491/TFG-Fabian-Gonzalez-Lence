/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/statistics-repository.interface.ts
 * @desc Repository interface for Statistics entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Statistics} from '../entities/statistics';

/**
 * Repository interface for Statistics entity data access operations.
 * Defines the contract for persisting and retrieving statistics data.
 */
export interface IStatisticsRepository {
  /**
   * Finds statistics by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the statistics if found, null otherwise
   */
  findById(id: string): Promise<Statistics | null>;

  /**
   * Retrieves all statistics.
   * @returns Promise resolving to an array of statistics
   */
  findAll(): Promise<Statistics[]>;

  /**
   * Persists new statistics.
   * @param entity - The statistics to save
   * @returns Promise resolving to the saved statistics
   */
  save(entity: Statistics): Promise<Statistics>;

  /**
   * Updates existing statistics.
   * @param entity - The statistics with updated data
   * @returns Promise resolving to the updated statistics
   */
  update(entity: Statistics): Promise<Statistics>;

  /**
   * Deletes statistics by its unique identifier.
   * @param id - The unique identifier of the statistics to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds statistics for a specific participant.
   * @param participantId - The unique identifier of the participant
   * @returns Promise resolving to the statistics if found, null otherwise
   */
  findByParticipant(participantId: string): Promise<Statistics | null>;

  /**
   * Finds all statistics for a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of statistics
   */
  findByTournamentId(tournamentId: string): Promise<Statistics[]>;
}
