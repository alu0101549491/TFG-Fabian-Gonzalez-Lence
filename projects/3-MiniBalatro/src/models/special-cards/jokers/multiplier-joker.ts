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
   * Creates a mult-multiplying joker with optional condition and dynamic multiplier.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param multiplierValue - Base factor to multiply mult by
   * @param condition - Optional condition function
   * @param multiplierFn - Optional function to calculate dynamic multiplier count
   * @throws Error if multiplierValue < 1
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly multiplierValue: number,
    condition?: (context: ScoreContext) => boolean,
    private readonly multiplierFn?: (context: ScoreContext) => number
  ) {
    super(id, name, description, JokerPriority.MULTIPLIER, condition);
    if (multiplierValue < 1) {
      throw new Error('Multiplier value must be at least 1');
    }
  }

  /**
   * Multiplies context.mult by multiplierValue (optionally scaled) based on condition.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (!this.checkCondition(context)) {
      return;
    }
    const originalMult = context.mult;
    // Calculate dynamic multiplier (default: use base value)
    const multiplierCount = this.multiplierFn ? this.multiplierFn(context) : 1;
    const actualMultiplier = this.multiplierValue * multiplierCount;
    context.mult *= actualMultiplier;
    console.log(`[${this.name}] Multiplied mult by ${actualMultiplier} (${originalMult} → ${context.mult})`);
  }
}