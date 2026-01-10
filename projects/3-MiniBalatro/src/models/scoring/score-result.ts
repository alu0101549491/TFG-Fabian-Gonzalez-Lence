import {ScoreBreakdown} from './score-breakdown';

/**
 * Represents the final result of a score calculation.
 * Contains total score and detailed breakdown of how it was calculated.
 */
export class ScoreResult {
  public totalScore: number;
  public chips: number;
  public mult: number;
  public breakdown: ScoreBreakdown[];

  /**
   * Creates a new ScoreResult instance.
   * @param {number} totalScore - Final calculated score
   * @param {number} chips - Final chip value
   * @param {number} mult - Final multiplier value
   * @param {ScoreBreakdown[]} breakdown - Step-by-step calculation
   */
  constructor(
      totalScore: number,
      chips: number,
      mult: number,
      breakdown: ScoreBreakdown[]
  ) {
    this.totalScore = totalScore;
    this.chips = chips;
    this.mult = mult;
    this.breakdown = breakdown;
  }
}