/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/repositories/announcement-repository.interface.ts
 * @desc Repository interface for Announcement entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Announcement} from '../entities/announcement';

/**
 * Repository interface for Announcement entity data access operations.
 * Defines the contract for persisting and retrieving announcement data.
 */
export interface IAnnouncementRepository {
  /**
   * Finds an announcement by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the announcement if found, null otherwise
   */
  findById(id: string): Promise<Announcement | null>;

  /**
   * Retrieves all announcements.
   * @returns Promise resolving to an array of announcements
   */
  findAll(): Promise<Announcement[]>;

  /**
   * Persists a new announcement.
   * @param entity - The announcement to save
   * @returns Promise resolving to the saved announcement
   */
  save(entity: Announcement): Promise<Announcement>;

  /**
   * Updates an existing announcement.
   * @param entity - The announcement with updated data
   * @returns Promise resolving to the updated announcement
   */
  update(entity: Announcement): Promise<Announcement>;

  /**
   * Deletes an announcement by its unique identifier.
   * @param id - The unique identifier of the announcement to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all announcements for a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of announcements
   */
  findByTournamentId(tournamentId: string): Promise<Announcement[]>;

  /**
   * Finds all published announcements for a specific tournament.
   * @param tournamentId - The unique identifier of the tournament
   * @returns Promise resolving to an array of published announcements
   */
  findPublished(tournamentId: string): Promise<Announcement[]>;
}
