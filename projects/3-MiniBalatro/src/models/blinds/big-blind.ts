/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/big-blind.ts
 * @desc Second blind in each round with medium difficulty.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

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

  /**
   * Returns the blind type identifier.
   * @returns 'BigBlind'
   */
  public getBlindType(): string {
    return 'BigBlind';
  }
}