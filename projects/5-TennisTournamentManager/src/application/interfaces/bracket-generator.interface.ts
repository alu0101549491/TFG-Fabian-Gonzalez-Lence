/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/bracket-generator.interface.ts
 * @desc Bracket generator interface for implementing different bracket generation strategies
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Bracket} from '@domain/entities/bracket';
import {Registration} from '@domain/entities/registration';

/**
 * Bracket generator interface.
 * Defines the contract for bracket generation strategies (Strategy Pattern).
 * Different implementations can generate single-elimination, round-robin, or other bracket types.
 */
export interface IBracketGenerator {
  /**
   * Generates bracket structure from confirmed registrations.
   *
   * @param registrations - List of confirmed participant registrations
   * @param categoryId - ID of the category for this bracket
   * @param tournamentId - ID of the tournament
   * @returns Generated bracket with phases and matches
   */
  generate(registrations: Registration[], categoryId: string, tournamentId: string): Promise<Bracket>;

  /**
   * Validates that the registrations meet minimum requirements for this bracket type.
   *
   * @param registrations - List of participant registrations to validate
   * @returns True if the registrations are valid for this bracket type, false otherwise
   */
  validate(registrations: Registration[]): boolean;
}
