/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/court.repository.ts
 * @desc HTTP-based implementation of ICourtRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Court} from '@domain/entities/court';
import {ICourtRepository} from '@domain/repositories/court.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of ICourtRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class CourtRepositoryImpl implements ICourtRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a court by its unique identifier.
   * @param id - The court identifier
   * @returns Promise resolving to the court or null if not found
   */
  public async findById(id: string): Promise<Court | null> {
    try {
      const response = await this.httpClient.get<Court>(`/courts/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all courts from the system.
   * @returns Promise resolving to an array of all courts
   */
  public async findAll(): Promise<Court[]> {
    const response = await this.httpClient.get<Court[]>('/courts');
    return response;
  }

  /**
   * Persists a new court to the database.
   * @param court - The court entity to save
   * @returns Promise resolving to the saved court with assigned ID
   */
  public async save(court: Court): Promise<Court> {
    const response = await this.httpClient.post<Court>('/courts', court);
    return response;
  }

  /**
   * Updates an existing court in the database.
   * @param court - The court entity with updated data
   * @returns Promise resolving to the updated court
   */
  public async update(court: Court): Promise<Court> {
    const response = await this.httpClient.put<Court>(`/courts/${court.id}`, court);
    return response;
  }

  /**
   * Removes a court from the database.
   * @param id - The identifier of the court to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/courts/${id}`);
  }

  /**
   * Retrieves all courts belonging to a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of courts
   */
  public async findByTournamentId(tournamentId: string): Promise<Court[]> {
    const response = await this.httpClient.get<Court[]>(`/courts?tournamentId=${tournamentId}`);
    return response;
  }

  /**
   * Retrieves all available courts for scheduling.
   * @returns Promise resolving to an array of available courts
   */
  public async findAvailable(): Promise<Court[]> {
    const response = await this.httpClient.get<Court[]>('/courts?available=true');
    return response;
  }
}
