// ============================================
// FILE: src/models/blinds/big-blind.ts
// ============================================

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';
import { GameConfig } from '../../services/config/game-config';

/**
 * Second blind in each round (medium difficulty).
 * Goal = base × 1.5, Reward = $5.
 */
export class BigBlind extends Blind {
  /**
   * Creates a big blind for the specified round.
   * @param level - The level number
   * @param roundNumber - The round number
   * @throws Error if level or roundNumber <= 0
   */
  constructor(level: number, roundNumber: number) {
    const baseGoal = BigBlind.calculateBaseGoal(roundNumber);
    const multiplier = GameConfig.BIG_BLIND_MULTIPLIER;
    super(level, Math.floor(baseGoal * multiplier), GameConfig.BIG_BLIND_REWARD);
  }

  /**
   * Returns null (big blinds have no modifiers).
   * @returns null
   */
  public getModifier(): BlindModifier | undefined {
    return undefined;
  }
}