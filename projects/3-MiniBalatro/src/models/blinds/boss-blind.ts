// ============================================
// FILE: src/models/blinds/boss-blind.ts
// ============================================

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';
import { BossType } from './boss-type.enum';

/**
 * Third blind in each round (boss encounter).
 * Goal = base × 2.0 (modified by boss), Reward = $10.
 */
export class BossBlind extends Blind {
  /**
   * Creates a boss blind with specified boss type.
   * @param level - The level number
   * @param roundNumber - The round number
   * @param bossType - Which boss this blind represents
   * @throws Error if level or roundNumber <= 0 or invalid BossType
   */
  constructor(level: number, roundNumber: number, public readonly bossType: BossType) {
    const baseGoal = BossBlind.calculateBaseGoal(roundNumber);
    super(level, baseGoal * 2, 10);
  }

  /**
   * Returns boss-specific modifier.
   * @returns BlindModifier configured for this boss
   */
  public getModifier(): BlindModifier {
    return BlindModifier.createForBoss(this.bossType);
  }

  /**
   * Returns the type of boss for this blind.
   * @returns BossType enum value
   */
  public getBossType(): BossType {
    return this.bossType;
  }

  /**
   * Returns score goal modified by boss (if boss affects goal).
   * @returns Modified goal
   */
  public getScoreGoal(): number {
    const modifier = this.getModifier();
    return Math.floor(super.getScoreGoal() * modifier.goalMultiplier);
  }
}