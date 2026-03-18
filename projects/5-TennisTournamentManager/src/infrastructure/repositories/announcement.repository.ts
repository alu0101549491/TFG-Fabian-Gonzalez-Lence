/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/announcement.repository.ts
 * @desc HTTP-based implementation of IAnnouncementRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Announcement} from '@domain/entities/announcement';
import {IAnnouncementRepository} from '@domain/repositories/announcement.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IAnnouncementRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class AnnouncementRepositoryImpl implements IAnnouncementRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds an announcement by its unique identifier.
   * @param id - The announcement identifier
   * @returns Promise resolving to the announcement or null if not found
   */
  public async findById(id: string): Promise<Announcement | null> {
    try {
      const response = await this.httpClient.get<Announcement>(`/announcements/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all announcements from the system.
   * @returns Promise resolving to an array of all announcements
   */
  public async findAll(): Promise<Announcement[]> {
    const response = await this.httpClient.get<Announcement[]>('/announcements');
    return response;
  }

  /**
   * Persists a new announcement to the database.
   * @param announcement - The announcement entity to save
   * @returns Promise resolving to the saved announcement with assigned ID
   */
  public async save(announcement: Announcement): Promise<Announcement> {
    const response = await this.httpClient.post<Announcement>('/announcements', announcement);
    return response;
  }

  /**
   * Updates an existing announcement in the database.
   * @param announcement - The announcement entity with updated data
   * @returns Promise resolving to the updated announcement
   */
  public async update(announcement: Announcement): Promise<Announcement> {
    const response = await this.httpClient.put<Announcement>(`/announcements/${announcement.id}`, announcement);
    return response;
  }

  /**
   * Removes an announcement from the database.
   * @param id - The identifier of the announcement to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/announcements/${id}`);
  }

  /**
   * Retrieves all announcements for a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of announcements
   */
  public async findByTournamentId(tournamentId: string): Promise<Announcement[]> {
    const response = await this.httpClient.get<Announcement[]>(`/announcements?tournamentId=${tournamentId}`);
    return response;
  }

  /**
   * Retrieves all published announcements.
   * @returns Promise resolving to an array of published announcements
   */
  public async findPublished(): Promise<Announcement[]> {
    const response = await this.httpClient.get<Announcement[]>('/announcements?published=true');
    return response;
  }
}
