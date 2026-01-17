// ============================================
// FILE: src/models/scoring/score-result.ts
// ============================================

import { ScoreBreakdown } from './score-breakdown';

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
   * @throws Error if any numeric value is negative
   */
  constructor(
    public readonly totalScore: number,
    public readonly chips: number,
    public readonly mult: number,
    public readonly breakdown: ScoreBreakdown[]
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