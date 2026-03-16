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
 */

import {StandingDto} from '../dto';

/**
 * Standing service interface.
 * Handles bracket-specific standings calculation and retrieval.
 */
export interface IStandingService {
  /**
   * Retrieves all standings for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns List of standings sorted by position
   */
  getStandingsByBracket(bracketId: string): Promise<StandingDto[]>;

  /**
   * Recalculates standings for a bracket based on match results.
   *
   * @param bracketId - ID of the bracket
   * @returns Updated list of standings
   */
  recalculateStandings(bracketId: string): Promise<StandingDto[]>;

  /**
   * Retrieves the standing for a specific participant in a bracket.
   *
   * @param bracketId - ID of the bracket
   * @param participantId - ID of the participant
   * @returns Participant's standing information
   */
  getParticipantStanding(bracketId: string, participantId: string): Promise<StandingDto>;
}
