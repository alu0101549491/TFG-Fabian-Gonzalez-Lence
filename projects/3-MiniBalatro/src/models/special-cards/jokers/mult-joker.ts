// ============================================
// FILE: src/models/special-cards/jokers/mult-joker.ts
// ============================================

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';

/**
 * Joker that adds mult to the score.
 * Applied with MULT priority (second).
 */
export class MultJoker extends Joker {
  /**
   * Creates a mult-adding joker with optional condition.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param multValue - Mult added per activation
   * @param condition - Optional condition function
   * @param multiplierFn - Optional function to calculate the multiplier (e.g., count diamonds)
   * @throws Error if multValue <= 0
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly multValue: number,
    condition?: (context: ScoreContext) => boolean,
    private readonly multiplierFn?: (context: ScoreContext) => number
  ) {
    super(id, name, description, JokerPriority.MULT, condition);
    if (multValue <= 0) {
      throw new Error('Mult value must be positive');
    }
  }

  /**
   * Adds mult to context.mult based on condition and multiplier.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (!this.checkCondition(context)) {
      return;
    }
    // If there's a multiplier function (e.g., count diamonds), use it
    const multiplier = this.multiplierFn ? this.multiplierFn(context) : 1;
    const actualValue = this.multValue * multiplier;

    context.mult += actualValue;
    console.log(`[${this.name}] Added ${actualValue} mult (Total: ${context.mult})`);
  }
}