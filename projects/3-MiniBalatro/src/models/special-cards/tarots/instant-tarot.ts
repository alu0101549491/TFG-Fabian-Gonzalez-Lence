import {Tarot} from './tarot';
import {GameState} from '../../game/game-state';

/**
 * Tarot card that applies instant effects to game state.
 * Does not require a target card.
 */
export class InstantTarot extends Tarot {
  private effect: (gameState: GameState) => void;

  /**
   * Creates a new InstantTarot instance.
   * @param {string} name - Tarot name
   * @param {string} description - Effect description
   * @param {Function} effect - Effect function to apply
   */
  constructor(
      name: string,
      description: string,
      effect: (gameState: GameState) => void
  ) {
    super(name, description);
    this.effect = effect;
  }

  /**
   * Uses the tarot on game state.
   * @param {GameState} gameState - Current game state
   */
  public use(gameState: GameState): void {
    // TODO: Implement instant effect
  }

  /**
   * Instant tarots don't require a target card.
   * @return {boolean} Always false
   */
  public requiresTarget(): boolean {
    return false;
  }
}