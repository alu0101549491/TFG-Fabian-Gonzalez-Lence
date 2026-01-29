/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/small-blind.ts
 * @desc First blind in each round with base difficulty.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';
import { GameConfig } from '../../services/config/game-config';

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
    super(level, baseGoal, GameConfig.SMALL_BLIND_REWARD);
  }

  /**
   * Returns null (small blinds have no modifiers).
   * @returns null
   */
  public getModifier(): BlindModifier | undefined {
    return undefined;
  }

  /**
   * Returns the blind type identifier.
   * @returns 'SmallBlind'
   */
  public getBlindType(): string {
    return 'SmallBlind';
  }
}