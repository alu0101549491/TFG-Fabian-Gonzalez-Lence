import {BlindModifier} from './blind-modifier';

/**
 * Abstract base class for all blind types.
 * Defines score goals and rewards for completing levels.
 */
export abstract class Blind {
  protected level: number;
  protected scoreGoal: number;
  protected moneyReward: number;

  /**
   * Creates a new Blind instance.
   * @param {number} level - Current level number
   */
  constructor(level: number) {
    this.level = level;
    this.scoreGoal = 0;
    this.moneyReward = 0;
  }

  /**
   * Gets the score goal for this blind.
   * @return {number} Required score to beat blind
   */
  public abstract getScoreGoal(): number;

  /**
   * Gets the money reward for beating this blind.
   * @return {number} Money awarded
   */
  public getReward(): number {
    return this.moneyReward;
  }

  /**
   * Gets the modifier applied by this blind (if any).
   * @return {BlindModifier | null} Blind modifier or null
   */
  public getModifier(): BlindModifier | null {
    return null;
  }

  // Getter
  public getLevel(): number {
    return this.level;
  }
}