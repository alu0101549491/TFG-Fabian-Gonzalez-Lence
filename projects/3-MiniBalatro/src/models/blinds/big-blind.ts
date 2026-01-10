import {Blind} from './blind';

/**
 * Represents a big blind - medium difficulty.
 * Second blind of each level trio.
 */
export class BigBlind extends Blind {
  /**
   * Creates a new BigBlind instance.
   * @param {number} level - Current level number
   */
  constructor(level: number) {
    super(level);
    // TODO: Calculate score goal and reward
  }

  /**
   * Calculates the score goal for this big blind.
   * @return {number} Required score
   */
  public getScoreGoal(): number {
    // TODO: Implement score goal calculation
    return this.scoreGoal;
  }
}