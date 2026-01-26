// ============================================
// FILE: src/models/special-cards/jokers/chip-joker.ts
// ============================================

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';

/**
 * Joker that adds chips to the score.
 * Applied with CHIPS priority (first).
 */
export class ChipJoker extends Joker {
  /**
   * Creates a chip-adding joker with optional condition.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param chipValue - Chips added per activation
   * @param condition - Optional condition function
   * @param multiplierFn - Optional function to calculate the multiplier (e.g., count odd cards)
   * @throws Error if chipValue <= 0
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly chipValue: number,
    condition?: (context: ScoreContext) => boolean,
    private readonly multiplierFn?: (context: ScoreContext) => number
  ) {
    super(id, name, description, JokerPriority.CHIPS, condition);
    if (chipValue <= 0) {
      throw new Error('Chip value must be positive');
    }
  }

  /**
   * Adds chips to context.chips based on condition and multiplier.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (!this.checkCondition(context)) {
      return;
    }
    // If there's a multiplier function (e.g., count odd cards), use it
    const multiplier = this.multiplierFn ? this.multiplierFn(context) : 1;
    const actualValue = this.chipValue * multiplier;

    context.chips += actualValue;
    console.log(`[${this.name}] Added ${actualValue} chips (Total: ${context.chips})`);
  }
}