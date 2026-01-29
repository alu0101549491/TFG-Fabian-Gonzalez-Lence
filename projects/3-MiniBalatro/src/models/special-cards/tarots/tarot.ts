/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/tarots/tarot.ts
 * @desc Abstract base class for all tarot cards.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Card } from '../../core/card';
import { GameState } from '../../game/game-state';

/**
 * Abstract base class for all tarot cards.
 * Tarots are single-use consumable cards with various effects.
 */
export abstract class Tarot {
  /**
   * Creates a tarot card with specified properties.
   * @param id - Unique identifier for the tarot
   * @param name - Tarot card name
   * @param description - Effect description for UI
   * @throws Error if name or description is empty
   */
  constructor(
    public readonly id: string,
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
