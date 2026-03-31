/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/bracket-service.interface.ts
 * @desc Bracket service interface for tournament bracket generation and management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {GenerateBracketDto, BracketDto, PhaseDto} from '../dto';

/**
 * Bracket service interface.
 * Handles bracket generation, publication, and phase management.
 */
export interface IBracketService {
  /**
   * Generates a new bracket for a category.
   *
   * @param data - Bracket generation parameters
   * @param userId - ID of the user generating the bracket
   * @returns Generated bracket information
   */
  generateBracket(data: GenerateBracketDto, userId: string): Promise<BracketDto>;

  /**
   * Retrieves a bracket by its ID.
   *
   * @param bracketId - ID of the bracket
   * @returns Bracket information
   */
  getBracketById(bracketId: string): Promise<BracketDto>;

  /**
   * Retrieves all brackets for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of brackets
   */
  getBracketsByTournament(tournamentId: string): Promise<BracketDto[]>;

  /**
   * Publishes a bracket, making it visible to participants.
   *
   * @param bracketId - ID of the bracket to publish
   * @param userId - ID of the user publishing the bracket
   * @returns Published bracket information
   */
  publishBracket(bracketId: string, userId: string): Promise<BracketDto>;

  /**
   * Retrieves all phases for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns List of phases
   */
  getPhases(bracketId: string): Promise<PhaseDto[]>;

  /**
   * Regenerates an existing bracket.
   *
   * @param bracketId - ID of the bracket to regenerate
   * @param userId - ID of the user performing the regeneration
   * @param keepResults - Whether to preserve existing match results
   * @returns Regenerated bracket information
   */
  regenerateBracket(bracketId: string, userId: string, keepResults?: boolean): Promise<BracketDto>;
}
