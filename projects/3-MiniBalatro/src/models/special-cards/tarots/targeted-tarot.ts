// ============================================
// FILE: src/models/special-cards/tarots/targeted-tarot.ts
// ============================================

import { Tarot } from './tarot';
import { TarotEffect } from './tarot-effect.enum';
import { Card } from '../../core/card';
import { Suit } from '../../core/suit.enum';

/**
 * Tarot card that requires selecting a target card.
 * Examples: The Empress, The Emperor, Strength, suit changes.
 */
export class TargetedTarot extends Tarot {
  /**
   * Creates a targeted tarot with specified effect.
   * @param id - Unique identifier for the tarot
   * @param name - Tarot card name
   * @param description - Effect description
   * @param effectType - Type of effect this tarot applies
   * @param effectValue - Optional value for effect
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly effectType: TarotEffect,
    public readonly effectValue?: any
  ) {
    super(id, name, description);
  }

  /**
   * Applies effect to the target card.
   * @param target - The target card to modify
   * @throws Error if target is null or invalid effectValue for effectType
   */
  public use(target: Card): void {
    if (!target) {
      throw new Error('Target card cannot be null');
    }

    switch (this.effectType) {
      case TarotEffect.ADD_CHIPS:
        if (typeof this.effectValue !== 'number') {
          throw new Error('Effect value must be a number for ADD_CHIPS');
        }
        target.addPermanentBonus(this.effectValue, 0);
        console.log(`[${this.name}] Added ${this.effectValue} chips to ${target.getDisplayString()}`);
        break;

      case TarotEffect.ADD_MULT:
        if (typeof this.effectValue !== 'number') {
          throw new Error('Effect value must be a number for ADD_MULT');
        }
        target.addPermanentBonus(0, this.effectValue);
        console.log(`[${this.name}] Added ${this.effectValue} mult to ${target.getDisplayString()}`);
        break;

      case TarotEffect.CHANGE_SUIT:
        if (!Object.values(Suit).includes(this.effectValue)) {
          throw new Error('Effect value must be a valid Suit for CHANGE_SUIT');
        }
        target.changeSuit(this.effectValue);
        console.log(`[${this.name}] Changed suit of ${target.getDisplayString()} to ${this.effectValue}`);
        break;

      case TarotEffect.UPGRADE_VALUE:
        target.upgradeValue();
        console.log(`[${this.name}] Upgraded value of ${target.getDisplayString()}`);
        break;

      case TarotEffect.DUPLICATE:
        // Note: Actual duplication would be handled by the deck
        console.log(`[${this.name}] Marked ${target.getDisplayString()} for duplication`);
        break;

      case TarotEffect.DESTROY:
        // Note: Actual destruction would be handled by the deck
        console.log(`[${this.name}] Marked ${target.getDisplayString()} for destruction`);
        break;

      default:
        throw new Error(`Unknown tarot effect type: ${this.effectType}`);
    }
  }

  /**
   * Returns true (targeted tarots need card selection).
   * @returns True
   */
  public requiresTarget(): boolean {
    return true;
  }
}