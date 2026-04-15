/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/score.repository.ts
 * @desc HTTP-based implementation of IScoreRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Score, SetScore} from '@domain/entities/score';
import {IScoreRepository} from '@domain/repositories/score.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IScoreRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class ScoreRepositoryImpl implements IScoreRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a score by its unique identifier.
   * @param id - The score identifier
   * @returns Promise resolving to the score or null if not found
   */
  public async findById(id: string): Promise<Score | null> {
    try {
      const response = await this.httpClient.get<Score>(`/scores/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all scores from the system.
   * @returns Promise resolving to an array of all scores
   */
  public async findAll(): Promise<Score[]> {
    const response = await this.httpClient.get<Score[]>('/scores');
    return response;
  }

  /**
   * Persists a new score to the database.
   * @param score - The score entity to save
   * @returns Promise resolving to the saved score with assigned ID
   */
  public async save(score: Score): Promise<Score> {
    const response = await this.httpClient.post<Score>('/scores', score);
    return response;
  }

  /**
   * Updates an existing score in the database.
   * @param score - The score entity with updated data
   * @returns Promise resolving to the updated score
   */
  public async update(score: Score): Promise<Score> {
    const response = await this.httpClient.put<Score>(`/scores/${score.id}`, score);
    return response;
  }

  /**
   * Removes a score from the database.
   * @param id - The identifier of the score to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/scores/${id}`);
  }

  /**
   * Retrieves all scores for a specific match.
   * @param matchId - The match identifier
   * @returns Promise resolving to an array of scores
   */
  public async findByMatchId(matchId: string): Promise<Score[]> {
    const response = await this.httpClient.get<Score[]>(`/scores?matchId=${matchId}`);
    return response;
  }

  /**
   * Saves multiple scores for a match (one per set).
   * Backend endpoint: POST /api/matches/:matchId/score
   * @param matchId - The match identifier
   * @param winnerId - The winner participant ID
   * @param setScores - Array of set scores to save
   * @returns Promise resolving to the saved scores
   */
  public async saveMatchScores(matchId: string, winnerId: string, setScores: SetScore[]): Promise<Score[]> {
    // Map frontend SetScore array to backend Score entity format
    const scores = setScores.map(setScore => ({
      setNumber: setScore.setNumber,
      player1Games: setScore.participant1Games,  // Frontend: participant1Games → Backend: player1Games
      player2Games: setScore.participant2Games,  // Frontend: participant2Games → Backend: player2Games
      player1TiebreakPoints: setScore.tiebreakParticipant1 ?? null,  // Frontend: tiebreakParticipant1 → Backend: player1TiebreakPoints
      player2TiebreakPoints: setScore.tiebreakParticipant2 ?? null,  // Frontend: tiebreakParticipant2 → Backend: player2TiebreakPoints
    }));
    
    // Send all scores in a single request with winnerId (backend expects this format)
    const response = await this.httpClient.post<{scores: Score[]}>(`/matches/${matchId}/score`, {
      winnerId,
      scores
    });
    
    return response.scores;
  }
}
