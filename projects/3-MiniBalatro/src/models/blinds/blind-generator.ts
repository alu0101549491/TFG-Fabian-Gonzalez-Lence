import {Blind} from './blind';
import {SmallBlind} from './small-blind';
import {BigBlind} from './big-blind';
import {BossBlind} from './boss-blind';
import {BossType} from './boss-type.enum';

/**
 * Generates appropriate blinds based on round number.
 * Handles the small → big → boss progression.
 */
export class BlindGenerator {
  /**
   * Generates a blind for the given round number.
   * @param {number} roundNumber - Current round (1-indexed)
   * @return {Blind} Generated blind
   */
  public generateBlind(roundNumber: number): Blind {
    // TODO: Implement blind generation logic
    // Round % 3 === 1 → SmallBlind
    // Round % 3 === 2 → BigBlind
    // Round % 3 === 0 → BossBlind
    return new SmallBlind(roundNumber);
  }

  /**
   * Selects a random boss type.
   * @return {BossType} Random boss type
   */
  private selectRandomBoss(): BossType {
    // TODO: Implement random boss selection
    return BossType.THE_WALL;
  }

  /**
   * Calculates base score goal for a given round.
   * @param {number} round - Round number
   * @return {number} Base score goal
   */
  private calculateBaseGoal(round: number): number {
    // TODO: Implement base goal calculation with scaling
    return 300;
  }
}