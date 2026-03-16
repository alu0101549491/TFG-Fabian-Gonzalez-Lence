/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/bracket-generator.factory.ts
 * @desc Bracket generator factory for creating bracket generation strategies
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {IBracketGenerator} from '../interfaces/bracket-generator.interface';
import {BracketType} from '@domain/enumerations/bracket-type';

/**
 * Bracket generator factory.
 * Implements the Factory Pattern to create appropriate bracket generators based on bracket type.
 */
export class BracketGeneratorFactory {
  /**
   * Creates a bracket generator for the specified bracket type.
   *
   * @param bracketType - Type of bracket to generate (e.g., SINGLE_ELIMINATION, ROUND_ROBIN)
   * @returns Bracket generator instance for the specified type
   * @throws {Error} If the bracket type is not supported
   */
  public createGenerator(bracketType: BracketType): IBracketGenerator {
    throw new Error('Not implemented');
  }
}
