/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/statistics.repository.ts
 * @desc HTTP-based implementation of IStatisticsRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {Statistics} from '@domain/entities/statistics';
import {IStatisticsRepository} from '@domain/repositories/statistics.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IStatisticsRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class StatisticsRepositoryImpl implements IStatisticsRepository {
  /**
   * Creates an instance of StatisticsRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds statistics by its unique identifier.
   * @param id - The statistics identifier
   * @returns Promise resolving to the statistics or null if not found
   */
  public async findById(id: string): Promise<Statistics | null> {
    try {
      const response = await this.httpClient.get<Statistics>(`/statistics/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all statistics from the system.
   * @returns Promise resolving to an array of all statistics
   */
  public async findAll(): Promise<Statistics[]> {
    const response = await this.httpClient.get<Statistics[]>('/statistics');
    return response;
  }

  /**
   * Persists new statistics to the database.
   * @param statistics - The statistics entity to save
   * @returns Promise resolving to the saved statistics with assigned ID
   */
  public async save(statistics: Statistics): Promise<Statistics> {
    const response = await this.httpClient.post<Statistics>('/statistics', statistics);
    return response;
  }

  /**
   * Updates existing statistics in the database.
   * @param statistics - The statistics entity with updated data
   * @returns Promise resolving to the updated statistics
   */
  public async update(statistics: Statistics): Promise<Statistics> {
    const response = await this.httpClient.put<Statistics>(`/statistics/${statistics.id}`, statistics);
    return response;
  }

  /**
   * Removes statistics from the database.
   * @param id - The identifier of the statistics to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/statistics/${id}`);
  }

  /**
   * Retrieves statistics for a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to the statistics or null if not found
   */
  public async findByParticipant(participantId: string): Promise<Statistics | null> {
    try {
      const response = await this.httpClient.get<Statistics>(`/statistics?participantId=${participantId}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all statistics for a specific tournament.
   * @param tournamentId - The tournament identifier
   * @returns Promise resolving to an array of statistics
   */
  public async findByTournamentId(tournamentId: string): Promise<Statistics[]> {
    const response = await this.httpClient.get<Statistics[]>(`/statistics?tournamentId=${tournamentId}`);
    return response;
  }
}
