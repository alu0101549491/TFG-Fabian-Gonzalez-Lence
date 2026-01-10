import {Blind} from './blind';

/**
 * Represents a small blind - the easiest blind type.
 * First blind of each level trio.
 */
export class SmallBlind extends Blind {
  /**
   * Creates a new SmallBlind instance.
   * @param {number} level - Current level number
   */
  constructor(level: number) {
    super(level);
    // TODO: Calculate score goal and reward
  }

  /**
   * Calculates the score goal for this small blind.
   * @return {number} Required score
   */
  public getScoreGoal(): number {
    // TODO: Implement score goal calculation
    return this.scoreGoal;
  }
}