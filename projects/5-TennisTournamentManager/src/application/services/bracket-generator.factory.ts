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

import {Injectable} from '@angular/core';
import {IBracketGenerator} from '../interfaces/bracket-generator.interface';
import {BracketType} from '@domain/enumerations/bracket-type';

/**
 * Bracket generator factory.
 * Implements the Factory Pattern to create appropriate bracket generators based on bracket type.
 */
@Injectable({providedIn: 'root'})
export class BracketGeneratorFactory {
  /**
   * Creates a bracket generator for the specified bracket type.
   *
   * @param bracketType - Type of bracket to generate (e.g., SINGLE_ELIMINATION, ROUND_ROBIN)
   * @returns Bracket generator instance for the specified type
   * @throws {Error} If the bracket type is not supported
   */
  public createGenerator(bracketType: BracketType): IBracketGenerator {
    // Validate input
    if (!bracketType) {
      throw new Error('Bracket type is required');
    }
    
    // Create appropriate generator based on type
    switch (bracketType) {
      case BracketType.SINGLE_ELIMINATION:
        // In real implementation, return new SingleEliminationGenerator()
        throw new Error(`Single elimination bracket generator not yet implemented`);
      
      case BracketType.ROUND_ROBIN:
        // In real implementation, return new RoundRobinGenerator()
        throw new Error(`Round robin bracket generator not yet implemented`);
      
      case BracketType.MATCH_PLAY:
        // In real implementation, return new MatchPlayGenerator()
        throw new Error(`Match play bracket generator not yet implemented`);
      
      default:
        throw new Error(`Unsupported bracket type: ${bracketType}`);\n    }\n  }\n}
