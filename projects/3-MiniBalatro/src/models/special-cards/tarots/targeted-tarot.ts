import {Tarot} from './tarot';
import {Card} from '../../core/card';
import {TarotEffect} from './tarot-effect.enum';

/**
 * Tarot card that applies effects to a target card.
 * Requires a card to be selected before use.
 */
export class TargetedTarot extends Tarot {
  private effectType: TarotEffect;

  /**
   * Creates a new TargetedTarot instance.
   * @param {string} name - Tarot name
   * @param {string} description - Effect description
   * @param {TarotEffect} effectType - Type of effect to apply
   */
  constructor(
      name: string,
      description: string,
      effectType: TarotEffect
  ) {
    super(name, description);
    this.effectType = effectType;
  }

  /**
   * Uses the tarot on a target card.
   * @param {Card} target - Card to modify
   */
  public use(target: Card): void {
    // TODO: Implement targeted effect
  }

  /**
   * Targeted tarots require a target card.
   * @return {boolean} Always true
   */
  public requiresTarget(): boolean {
    return true;
  }

  // Getter
  public getEffectType(): TarotEffect {
    return this.effectType;
  }
}