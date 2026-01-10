import {Card} from '../../core/card';
import {GameState} from '../../game/game-state';

/**
 * Abstract base class for tarot cards.
 * Tarots provide one-time effects on cards or game state.
 */
export abstract class Tarot {
  protected name: string;
  protected description: string;

  /**
   * Creates a new Tarot instance.
   * @param {string} name - Tarot card name
   * @param {string} description - Effect description
   */
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  /**
   * Uses the tarot card on a target.
   * @param {Card | GameState} target - Target for the effect
   */
  public abstract use(target: Card | GameState): void;

  /**
   * Checks if this tarot requires a target card.
   * @return {boolean} True if target is required
   */
  public abstract requiresTarget(): boolean;

  // Getters
  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }
}