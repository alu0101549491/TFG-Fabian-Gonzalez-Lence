/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/standing.repository.ts
 * @desc HTTP-based implementation of IStandingRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {Standing} from '@domain/entities/standing';
import {IStandingRepository} from '@domain/repositories/standing.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IStandingRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class StandingRepositoryImpl implements IStandingRepository {
  /**
   * Creates an instance of StandingRepositoryImpl.
   * @param httpClient - The HTTP client for making API requests
   */
  constructor(private readonly httpClient: AxiosClient) {}

  /**
   * Finds a standing by its unique identifier.
   * @param id - The standing identifier
   * @returns Promise resolving to the standing or null if not found
   */
  public async findById(id: string): Promise<Standing | null> {
    try {
      const response = await this.httpClient.get<Standing>(`/standings/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all standings from the system.
   * @returns Promise resolving to an array of all standings
   */
  public async findAll(): Promise<Standing[]> {
    const response = await this.httpClient.get<Standing[]>('/standings');
    return response;
  }

  /**
   * Persists a new standing to the database.
   * @param standing - The standing entity to save
   * @returns Promise resolving to the saved standing with assigned ID
   */
  public async save(standing: Standing): Promise<Standing> {
    const response = await this.httpClient.post<Standing>('/standings', standing);
    return response;
  }

  /**
   * Updates an existing standing in the database.
   * @param standing - The standing entity with updated data
   * @returns Promise resolving to the updated standing
   */
  public async update(standing: Standing): Promise<Standing> {
    const response = await this.httpClient.put<Standing>(`/standings/${standing.id}`, standing);
    return response;
  }

  /**
   * Removes a standing from the database.
   * @param id - The identifier of the standing to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/standings/${id}`);
  }

  /**
   * Retrieves all standings for a specific bracket.
   * @param bracketId - The bracket identifier
   * @returns Promise resolving to an array of standings
   */
  public async findByBracket(bracketId: string): Promise<Standing[]> {
    const response = await this.httpClient.get<Standing[]>(`/standings?bracketId=${bracketId}`);
    return response;
  }

  /**
   * Retrieves all standings for a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to an array of standings
   */
  public async findByParticipantId(participantId: string): Promise<Standing[]> {
    const response = await this.httpClient.get<Standing[]>(`/standings?participantId=${participantId}`);
    return response;
  }
}
