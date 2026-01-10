import {Blind} from './blind';
import {BossType} from './boss-type.enum';
import {BlindModifier} from './blind-modifier';

/**
 * Represents a boss blind - hardest blind with special mechanics.
 * Third blind of each level trio (every third level).
 */
export class BossBlind extends Blind {
  private bossType: BossType;

  /**
   * Creates a new BossBlind instance.
   * @param {number} level - Current level number
   * @param {BossType} bossType - Type of boss
   */
  constructor(level: number, bossType: BossType) {
    super(level);
    this.bossType = bossType;
    // TODO: Calculate score goal and reward
  }

  /**
   * Calculates the score goal for this boss blind.
   * @return {number} Required score
   */
  public getScoreGoal(): number {
    // TODO: Implement score goal calculation
    return this.scoreGoal;
  }

  /**
   * Gets the modifier specific to this boss type.
   * @return {BlindModifier} Boss-specific modifier
   */
  public getModifier(): BlindModifier {
    // TODO: Implement boss-specific modifier creation
    return new BlindModifier();
  }

  /**
   * Gets the boss type.
   * @return {BossType} Type of boss
   */
  public getBossType(): BossType {
    return this.bossType;
  }
}