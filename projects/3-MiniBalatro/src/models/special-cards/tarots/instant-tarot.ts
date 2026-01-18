// ============================================
// FILE: src/models/special-cards/tarots/instant-tarot.ts
// ============================================

import { Tarot } from './tarot';
import { GameState } from '../../game/game-state';

/**
 * Tarot card with instant effect that doesn't require a target.
 * Example: The Hermit (doubles money).
 */
export class InstantTarot extends Tarot {
  /**
   * Creates an instant tarot with specified effect function.
   * @param id - Unique identifier for the tarot
   * @param name - Tarot card name
   * @param description - Effect description
   * @param effect - Effect function to execute
   * @throws Error if effect is null
   */
  constructor(
    id: string,
    name: string,
    description: string,
    private readonly effect: (gameState: GameState) => void
  ) {
    super(id, name, description);
    if (!effect) {
      throw new Error('Effect function cannot be null');
    }
  }

  /**
   * Executes the instant effect on game state.
   * @param gameState - The game state to modify
   * @throws Error if gameState is null
   */
  public use(gameState: GameState): void {
    if (!gameState) {
      throw new Error('Game state cannot be null');
    }

    this.effect(gameState);
    console.log(`[${this.name}] Instant effect applied`);
  }

  /**
   * Returns false (instant tarots don't need targets).
   * @returns False
   */
  public requiresTarget(): boolean {
    return false;
  }
}