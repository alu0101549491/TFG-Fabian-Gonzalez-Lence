/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/order-of-play-repository.interface.ts
 * @desc Repository interface for OrderOfPlay entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {OrderOfPlay} from '../entities/order-of-play.entity';

/**
 * Repository interface for OrderOfPlay entity data access operations.
 * Defines the contract for persisting and retrieving order of play data.
 */
export interface IOrderOfPlayRepository {
  /**
   * Finds an order of play entry by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the order of play if found, null otherwise
   */
  findById(id: string): Promise<OrderOfPlay | null>;

  /**
   * Retrieves all order of play entries.
   * @returns Promise resolving to an array of order of play entries
   */
  findAll(): Promise<OrderOfPlay[]>;

  /**
   * Persists a new order of play entry.
   * @param entity - The order of play to save
   * @returns Promise resolving to the saved order of play
   */
  save(entity: OrderOfPlay): Promise<OrderOfPlay>;

  /**
   * Updates an existing order of play entry.
   * @param entity - The order of play with updated data
   * @returns Promise resolving to the updated order of play
   */
  update(entity: OrderOfPlay): Promise<OrderOfPlay>;

  /**
   * Deletes an order of play entry by its unique identifier.
   * @param id - The unique identifier of the order of play to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all order of play entries for a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of order of play entries
   */
  findByTournamentId(tournamentId: string): Promise<OrderOfPlay[]>;

  /**
   * Finds all order of play entries for a specific court on a given date.
   * @param courtId - The unique identifier of the court
   * @param date - The date to filter by
   * @returns Promise resolving to an array of order of play entries
   */
  findByCourtId(courtId: string, date: Date): Promise<OrderOfPlay[]>;

  /**
   * Finds the order of play entry for a specific match.
   * @param matchId - The unique identifier of the match
   * @returns Promise resolving to the order of play if found, null otherwise
   */
  findByMatchId(matchId: string): Promise<OrderOfPlay | null>;
}
