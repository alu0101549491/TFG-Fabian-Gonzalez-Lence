/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/court-repository.interface.ts
 * @desc Repository interface for Court entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Court} from '../entities/court.entity';

/**
 * Repository interface for Court entity data access operations.
 * Defines the contract for persisting and retrieving court data.
 */
export interface ICourtRepository {
  /**
   * Finds a court by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the court if found, null otherwise
   */
  findById(id: string): Promise<Court | null>;

  /**
   * Retrieves all courts.
   * @returns Promise resolving to an array of courts
   */
  findAll(): Promise<Court[]>;

  /**
   * Persists a new court.
   * @param entity - The court to save
   * @returns Promise resolving to the saved court
   */
  save(entity: Court): Promise<Court>;

  /**
   * Updates an existing court.
   * @param entity - The court with updated data
   * @returns Promise resolving to the updated court
   */
  update(entity: Court): Promise<Court>;

  /**
   * Deletes a court by its unique identifier.
   * @param id - The unique identifier of the court to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all courts belonging to a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of courts
   */
  findByTournamentId(tournamentId: string): Promise<Court[]>;

  /**
   * Finds all available courts for a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of available courts
   */
  findAvailable(tournamentId: string): Promise<Court[]>;
}
