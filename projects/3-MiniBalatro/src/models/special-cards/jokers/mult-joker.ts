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
   * @throws Error if multValue <= 0
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly multValue: number,
    private readonly condition?: (context: ScoreContext) => boolean
  ) {
    super(id, name, description, JokerPriority.MULT);
    if (multValue <= 0) {
      throw new Error('Mult value must be positive');
    }
  }

  /**
   * Adds mult to context.mult based on condition.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (this.canActivate(context)) {
      const actualValue = typeof this.condition === 'function'
        ? (this.condition(context) ? this.multValue : 0)
        : this.multValue;

      context.mult += actualValue;
      console.log(`[${this.name}] Added ${actualValue} mult (Total: ${context.mult})`);
    }
  }

  /**
   * Checks if joker's conditions are met for activation.
   * @param context - The score calculation context
   * @returns True if joker should activate
   */
  public canActivate(context: ScoreContext): boolean {
    return this.condition ? this.condition(context) : true;
  }
}