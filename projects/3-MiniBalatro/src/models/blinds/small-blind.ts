// ============================================
// FILE: src/models/blinds/small-blind.ts
// ============================================

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';

/**
 * First blind in each round (easiest difficulty).
 * Goal = base × 1.0, Reward = $2.
 */
export class SmallBlind extends Blind {
  /**
   * Creates a small blind for the specified round.
   * @param level - The level number
   * @param roundNumber - The round number
   * @throws Error if level or roundNumber <= 0
   */
  constructor(level: number, roundNumber: number) {
    const baseGoal = SmallBlind.calculateBaseGoal(roundNumber);
    super(level, baseGoal, 2);
  }

  /**
   * Returns null (small blinds have no modifiers).
   * @returns null
   */
  public getModifier(): BlindModifier | undefined {
    return undefined;
  }
}