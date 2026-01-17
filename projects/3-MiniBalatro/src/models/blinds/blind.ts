// ============================================
// FILE: src/models/blinds/blind.ts
// ============================================

import { BlindModifier } from './blind-modifier';

/**
 * Abstract base class for all blind types.
 * Defines common interface for level progression.
 */
export abstract class Blind {
  /**
   * Creates a blind with specified properties.
   * @param level - The level/blind number (1, 2, 3, ...)
   * @param scoreGoal - Points needed to pass this blind
   * @param moneyReward - Money earned for passing
   * @throws Error if level <= 0, scoreGoal <= 0, or moneyReward < 0
   */
  constructor(
    public readonly level: number,
    public readonly scoreGoal: number,
    public readonly moneyReward: number
  ) {
    if (level <= 0) {
      throw new Error('Level must be positive');
    }
    if (scoreGoal <= 0) {
      throw new Error('Score goal must be positive');
    }
    if (moneyReward < 0) {
      throw new Error('Money reward cannot be negative');
    }
  }

  /**
   * Returns the score required to pass this blind.
   * @returns Positive number
   */
  public getScoreGoal(): number {
    return this.scoreGoal;
  }

  /**
   * Returns money earned for passing this blind.
   * @returns Non-negative number
   */
  public getReward(): number {
    return this.moneyReward;
  }

  /**
   * Returns modifier if this blind has special rules.
   * @returns BlindModifier for boss blinds, null for normal blinds
   */
  public abstract getModifier(): BlindModifier | undefined;

  /**
   * Returns the level number of this blind.
   * @returns Positive integer
   */
  public getLevel(): number {
    return this.level;
  }

  /**
   * Calculates base score goal for a round: 300 × (1.5)^(roundNumber-1).
   * @param roundNumber - The round number (1, 2, 3, ...)
   * @returns Positive number
   */
  protected static calculateBaseGoal(roundNumber: number): number {
    if (roundNumber <= 0) {
      throw new Error('Round number must be positive');
    }
    return Math.floor(300 * Math.pow(1.5, roundNumber - 1));
  }
}