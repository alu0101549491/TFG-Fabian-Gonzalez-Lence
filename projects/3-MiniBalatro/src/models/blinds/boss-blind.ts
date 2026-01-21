// ============================================
// FILE: src/models/blinds/boss-blind.ts
// ============================================

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';
import { BossType } from './boss-type.enum';
import { GameConfig } from '../../services/config/game-config';
import { HandType } from '../poker/hand-type.enum';

/**
 * Third blind in each round (boss encounter).
 * Goal = base × 2.0 (modified by boss), Reward = $10.
 */
export class BossBlind extends Blind {
  private modifier: BlindModifier;

  /**
   * Creates a boss blind with specified boss type.
   * @param level - The level number
   * @param roundNumber - The round number
   * @param bossType - Which boss this blind represents
   * @throws Error if level or roundNumber <= 0 or invalid BossType
   */
  constructor(level: number, roundNumber: number, public readonly bossType: BossType) {
    const baseGoal = BossBlind.calculateBaseGoal(roundNumber);
    const multiplier = GameConfig.BOSS_BLIND_MULTIPLIER;
    super(level, baseGoal * multiplier, GameConfig.BOSS_BLIND_REWARD);
    this.modifier = BlindModifier.createForBoss(this.bossType);
  }

  /**
   * Returns boss-specific modifier.
   * @returns BlindModifier configured for this boss
   */
  public getModifier(): BlindModifier {
    return this.modifier;
  }

  /**
   * Sets the allowed hand types for The Mouth boss.
   * This is called after the first hand is played to lock in that hand type.
   * @param handType - The hand type to allow
   * @throws Error if not The Mouth boss or handType is null
   */
  public setAllowedHandType(handType: HandType): void {
    if (this.bossType !== BossType.THE_MOUTH) {
      throw new Error('setAllowedHandType can only be called on The Mouth boss');
    }
    if (!handType) {
      throw new Error('Hand type cannot be null');
    }

    // Create a new modifier with the locked-in hand type
    this.modifier = new BlindModifier(1.0, null, null, [handType]);
    console.log(`The Mouth: Locked in hand type ${handType}`);
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