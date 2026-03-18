/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file infrastructure/repositories/match-result.repository.ts
 * @desc HTTP-based implementation of IMatchResultRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {MatchResult} from '@domain/entities/match-result';
import {ConfirmationStatus} from '@domain/enumerations/confirmation-status';
import {IMatchResultRepository} from '@domain/repositories/match-result-repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IMatchResultRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class MatchResultRepositoryImpl implements IMatchResultRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a match result by its unique identifier.
   * @param id - The match result identifier
   * @returns Promise resolving to the match result or null if not found
   */
  public async findById(id: string): Promise<MatchResult | null> {
    try {
      const response = await this.httpClient.get<MatchResult>(`/match-results/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all match results from the system.
   * @returns Promise resolving to an array of all match results
   */
  public async findAll(): Promise<MatchResult[]> {
    const response = await this.httpClient.get<MatchResult[]>('/match-results');
    return response;
  }

  /**
   * Persists a new match result to the database.
   * @param matchResult - The match result entity to save
   * @returns Promise resolving to the saved match result with assigned ID
   */
  public async save(matchResult: MatchResult): Promise<MatchResult> {
    const response = await this.httpClient.post<MatchResult>('/match-results', matchResult);
    return response;
  }

  /**
   * Updates an existing match result in the database.
   * @param matchResult - The match result entity with updated data
   * @returns Promise resolving to the updated match result
   */
  public async update(matchResult: MatchResult): Promise<MatchResult> {
    const response = await this.httpClient.put<MatchResult>(`/match-results/${matchResult.id}`, matchResult);
    return response;
  }

  /**
   * Removes a match result from the database.
   * @param id - The identifier of the match result to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/match-results/${id}`);
  }

  /**
   * Retrieves all result submissions for a specific match.
   * @param matchId - The match's identifier
   * @returns Promise resolving to an array of match results
   */
  public async findByMatch(matchId: string): Promise<MatchResult[]> {
    const response = await this.httpClient.get<MatchResult[]>(`/match-results?matchId=${matchId}`);
    return response;
  }

  /**
   * Retrieves the confirmed result for a specific match.
   * @param matchId - The match's identifier
   * @returns Promise resolving to the confirmed match result or null
   */
  public async findConfirmedByMatch(matchId: string): Promise<MatchResult | null> {
    try {
      const response = await this.httpClient.get<MatchResult>(
        `/match-results?matchId=${matchId}&status=${ConfirmationStatus.CONFIRMED}`
      );
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all match results submitted by a specific user.
   * @param userId - The user's identifier
   * @returns Promise resolving to an array of match results
   */
  public async findBySubmitter(userId: string): Promise<MatchResult[]> {
    const response = await this.httpClient.get<MatchResult[]>(`/match-results?submittedBy=${userId}`);
    return response;
  }

  /**
   * Retrieves all match results with a specific confirmation status.
   * @param status - The confirmation status to filter by
   * @returns Promise resolving to an array of match results
   */
  public async findByStatus(status: ConfirmationStatus): Promise<MatchResult[]> {
    const response = await this.httpClient.get<MatchResult[]>(`/match-results?status=${status}`);
    return response;
  }

  /**
   * Retrieves all disputed results requiring admin review.
   * @returns Promise resolving to an array of disputed match results
   */
  public async findDisputed(): Promise<MatchResult[]> {
    const response = await this.httpClient.get<MatchResult[]>(
      `/match-results?status=${ConfirmationStatus.DISPUTED}`
    );
    return response;
  }
}
