/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/standing-service.interface.ts
 * @desc Standing service interface for bracket standings and rankings
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {StandingDto} from '../dto';

/**
 * Standing service interface.
 * Handles bracket-specific standings calculation and retrieval.
 */
export interface IStandingService {
  /**
   * Calculates all standings for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns List of standings sorted by position
   */
  calculateStandings(bracketId: string): Promise<StandingDto[]>;

  /**
   * Updates standings for a bracket based on a match result.
   *
   * @param bracketId - ID of the bracket
   * @param result - Match result data
   * @returns Updated list of standings
   */
  updateStandings(bracketId: string, result: Record<string, unknown>): Promise<StandingDto[]>;

  /**
   * Retrieves the standing for a specific participant in a bracket.
   *
   * @param bracketId - ID of the bracket
   * @param participantId - ID of the participant
   * @returns Participant's standing information
   */
  getParticipantStanding(bracketId: string, participantId: string): Promise<StandingDto>;

  /**
   * Retrieves standings for all brackets in a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of standings for all tournament brackets
   */
  getStandingsByTournament(tournamentId: string): Promise<StandingDto[]>;
}
