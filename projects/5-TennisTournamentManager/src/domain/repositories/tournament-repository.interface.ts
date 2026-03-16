/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/tournament-repository.interface.ts
 * @desc Repository interface for Tournament entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Tournament} from '../entities/tournament.entity';
import {TournamentStatus} from '../enumerations/tournament-status.enum';

/**
 * Repository interface for Tournament entity data access operations.
 * Defines the contract for persisting and retrieving tournament data.
 */
export interface ITournamentRepository {
  /**
   * Finds a tournament by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the tournament if found, null otherwise
   */
  findById(id: string): Promise<Tournament | null>;

  /**
   * Retrieves all tournaments.
   * @returns Promise resolving to an array of tournaments
   */
  findAll(): Promise<Tournament[]>;

  /**
   * Persists a new tournament.
   * @param entity - The tournament to save
   * @returns Promise resolving to the saved tournament
   */
  save(entity: Tournament): Promise<Tournament>;

  /**
   * Updates an existing tournament.
   * @param entity - The tournament with updated data
   * @returns Promise resolving to the updated tournament
   */
  update(entity: Tournament): Promise<Tournament>;

  /**
   * Deletes a tournament by its unique identifier.
   * @param id - The unique identifier of the tournament to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all tournaments organized by a specific user.
   * @param organizerId - The unique identifier of the organizer
   * @returns Promise resolving to an array of tournaments
   */
  findByOrganizerId(organizerId: string): Promise<Tournament[]>;

  /**
   * Finds all tournaments with a specific status.
   * @param status - The tournament status to filter by
   * @returns Promise resolving to an array of tournaments with the specified status
   */
  findByStatus(status: TournamentStatus): Promise<Tournament[]>;

  /**
   * Retrieves all active tournaments.
   * @returns Promise resolving to an array of active tournaments
   */
  findActive(): Promise<Tournament[]>;
}
