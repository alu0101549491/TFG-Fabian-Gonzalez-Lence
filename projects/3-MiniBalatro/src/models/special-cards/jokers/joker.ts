// ============================================
// FILE: src/models/special-cards/jokers/joker.ts
// ============================================

import { ScoreContext } from '../../scoring/score-context';
import { JokerPriority } from './joker-priority.enum';

/**
 * Abstract base class for all joker cards.
 * Jokers provide persistent bonuses during score calculation.
 */
export abstract class Joker {
  /**
   * Creates a joker with specified properties.
   * @param id - Unique identifier for the joker
   * @param name - Display name
   * @param description - Effect description for UI
   * @param priority - When this joker's effect applies
   * @param condition - Optional condition function for activation
   * @throws Error if name or description is empty
   */
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly priority: JokerPriority,
    protected readonly condition?: (context: ScoreContext) => boolean
  ) {
    if (!name || !description) {
      throw new Error('Joker name and description must not be empty');
    }
  }

  /**
   * Applies the joker's effect to the score context.
   * @param context - The score calculation context
   */
  public abstract applyEffect(context: ScoreContext): void;

  /**
   * Checks if joker's conditions are met for activation.
   * @param context - The score calculation context
   * @returns True if joker should activate
   */
  public canActivate(context: ScoreContext): boolean {
    return this.checkCondition(context);
  }

  /**
   * Protected helper for subclasses to evaluate activation condition.
   * Returns true if no condition provided or the condition function returns true.
   * @param context - The score calculation context
   */
  protected checkCondition(context: ScoreContext): boolean {
    return this.condition ? this.condition(context) : true;
  }

  /**
   * Returns the joker's priority level.
   * @returns The JokerPriority value
   */
  public getPriority(): JokerPriority {
    return this.priority;
  }
}