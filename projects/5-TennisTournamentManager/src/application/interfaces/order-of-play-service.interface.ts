/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/order-of-play-service.interface.ts
 * @desc Order of play service interface for match scheduling and court assignment
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {CreateOrderOfPlayDto, OrderOfPlayDto} from '../dto';

/**
 * Order of play service interface.
 * Handles match scheduling, court assignments, and order of play management.
 */
export interface IOrderOfPlayService {
  /**
   * Creates a new order of play entry.
   *
   * @param data - Order of play creation data
   * @param userId - ID of the user creating the entry
   * @returns Created order of play entry
   */
  createEntry(data: CreateOrderOfPlayDto, userId: string): Promise<OrderOfPlayDto>;

  /**
   * Retrieves all order of play entries for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of order of play entries
   */
  getByTournament(tournamentId: string): Promise<OrderOfPlayDto[]>;

  /**
   * Retrieves order of play entries for a specific date.
   *
   * @param tournamentId - ID of the tournament
   * @param date - Date to query
   * @returns List of order of play entries for the date
   */
  getByDate(tournamentId: string, date: Date): Promise<OrderOfPlayDto[]>;

  /**
   * Retrieves order of play entries for a specific court on a date.
   *
   * @param courtId - ID of the court
   * @param date - Date to query
   * @returns List of order of play entries for the court
   */
  getByCourt(courtId: string, date: Date): Promise<OrderOfPlayDto[]>;

  /**
   * Publishes the order of play, notifying participants.
   *
   * @param id - ID of the order of play entry to publish
   * @param userId - ID of the user publishing the schedule
   */
  publishOrderOfPlay(id: string, userId: string): Promise<void>;

  /**
   * Generates order of play entries for a tournament date.
   *
   * @param tournamentId - ID of the tournament
   * @param date - Date to generate schedule for
   * @param userId - ID of the user triggering generation
   * @returns Generated order of play entries
   */
  generateOrderOfPlay(tournamentId: string, date: Date, userId: string): Promise<OrderOfPlayDto[]>;
}
