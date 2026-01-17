// ============================================
// FILE: src/models/special-cards/tarots/tarot.ts
// ============================================

import { Card } from '../../core/card';
import { GameState } from '../../game/game-state';

/**
 * Abstract base class for all tarot cards.
 * Tarots are single-use consumable cards with various effects.
 */
export abstract class Tarot {
  /**
   * Creates a tarot card with specified properties.
   * @param name - Tarot card name
   * @param description - Effect description for UI
   * @throws Error if name or description is empty
   */
  constructor(
    public readonly name: string,
    public readonly description: string
  ) {
    if (!name || !description) {
      throw new Error('Tarot name and description must not be empty');
    }
  }

  /**
   * Uses the tarot card.
   * @param target - Optional target card or game state
   */
  public abstract use(target?: Card | GameState): void;

  /**
   * Returns whether this tarot needs a target card.
   * @returns True if targeted tarot, false if instant
   */
  public abstract requiresTarget(): boolean;
}
