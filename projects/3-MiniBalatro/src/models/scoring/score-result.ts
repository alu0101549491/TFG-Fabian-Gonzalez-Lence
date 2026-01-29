/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/scoring/score-result.ts
 * @desc Complete score calculation result with breakdown.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { ScoreBreakdown } from './score-breakdown';
import { HandType } from '../poker/hand-type.enum';

/**
 * Encapsulates complete score calculation result.
 * Contains final score, components, and detailed breakdown.
 */
export class ScoreResult {
  /**
   * Creates a score result with all calculation details.
   * @param totalScore - Final calculated score (chips × mult)
   * @param chips - Final total chips after all additions
   * @param mult - Final total mult after all additions and multiplications
   * @param breakdown - Detailed list of all score contributions
   * @param handType - The type of poker hand played
   * @throws Error if any numeric value is negative
   */
  constructor(
    public readonly totalScore: number,
    public readonly chips: number,
    public readonly mult: number,
    public readonly breakdown: ScoreBreakdown[],
    public readonly handType?: HandType
  ) {
    if (totalScore < 0 || chips < 0 || mult < 0) {
      throw new Error('Score values cannot be negative');
    }
    if (!breakdown) {
      throw new Error('Breakdown array cannot be null');
    }
  }

  /**
   * Adds a breakdown entry to the result.
   * @param breakdown - Breakdown entry to add
   * @throws Error if breakdown is null
   */
  public addBreakdown(breakdown: ScoreBreakdown): void {
    if (!breakdown) {
      throw new Error('Breakdown cannot be null');
    }
    this.breakdown.push(breakdown);
  }
}