// ============================================
// FILE: src/models/special-cards/jokers/multiplier-joker.ts
// ============================================

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';

/**
 * Joker that multiplies the total mult.
 * Applied with MULTIPLIER priority (last).
 */
export class MultiplierJoker extends Joker {
  /**
   * Creates a mult-multiplying joker with optional condition.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param multiplierValue - Factor to multiply mult by
   * @param condition - Optional condition function
   * @throws Error if multiplierValue < 1
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly multiplierValue: number,
    private readonly condition?: (context: ScoreContext) => boolean
  ) {
    super(id, name, description, JokerPriority.MULTIPLIER);
    if (multiplierValue < 1) {
      throw new Error('Multiplier value must be at least 1');
    }
  }

  /**
   * Multiplies context.mult by multiplierValue based on condition.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (this.canActivate(context)) {
      const shouldApply = this.condition ? this.condition(context) : true;
      if (shouldApply) {
        const originalMult = context.mult;
        context.mult *= this.multiplierValue;
        console.log(`[${this.name}] Multiplied mult by ${this.multiplierValue} (${originalMult} → ${context.mult})`);
      }
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