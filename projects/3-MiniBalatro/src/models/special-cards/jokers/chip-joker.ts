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
   * @throws Error if chipValue <= 0
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly chipValue: number,
    private readonly condition?: (context: ScoreContext) => boolean
  ) {
    super(id, name, description, JokerPriority.CHIPS);
    if (chipValue <= 0) {
      throw new Error('Chip value must be positive');
    }
  }

  /**
   * Adds chips to context.chips based on condition.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (this.canActivate(context)) {
      const actualValue = typeof this.condition === 'function'
        ? (this.condition(context) ? this.chipValue : 0)
        : this.chipValue;

      context.chips += actualValue;
      console.log(`[${this.name}] Added ${actualValue} chips (Total: ${context.chips})`);
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