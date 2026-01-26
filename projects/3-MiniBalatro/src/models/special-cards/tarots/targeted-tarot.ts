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
   * NOTE: `TargetedTarot` initializes a strategy map at construction time
   * which captures `this.effectValue`. If `effectValue` is changed after
   * construction, the strategies will still use the originally captured
   * value. To change behavior dynamically, create a new `TargetedTarot`
   * or call `initializeStrategies()` again.
   */
  private effectStrategies: Map<TarotEffect, (target: Card) => void> = new Map();

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
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.effectStrategies.set(TarotEffect.ADD_CHIPS, (target: Card) => {
      if (typeof this.effectValue !== 'number') {
        throw new Error('Effect value must be a number for ADD_CHIPS');
      }
      target.addPermanentBonus(this.effectValue, 0);
      console.log(`[${this.name}] Added ${this.effectValue} chips to ${target.getDisplayString()}`);
    });

    this.effectStrategies.set(TarotEffect.ADD_MULT, (target: Card) => {
      if (typeof this.effectValue !== 'number') {
        throw new Error('Effect value must be a number for ADD_MULT');
      }
      target.addPermanentBonus(0, this.effectValue);
      console.log(`[${this.name}] Added ${this.effectValue} mult to ${target.getDisplayString()}`);
    });

    this.effectStrategies.set(TarotEffect.CHANGE_SUIT, (target: Card) => {
      if (!Object.values(Suit).includes(this.effectValue)) {
        throw new Error('Effect value must be a valid Suit for CHANGE_SUIT');
      }
      target.changeSuit(this.effectValue);
      console.log(`[${this.name}] Changed suit of ${target.getDisplayString()} to ${this.effectValue}`);
    });

    this.effectStrategies.set(TarotEffect.UPGRADE_VALUE, (target: Card) => {
      target.upgradeValue();
      console.log(`[${this.name}] Upgraded value of ${target.getDisplayString()}`);
    });

    this.effectStrategies.set(TarotEffect.DUPLICATE, (target: Card) => {
      // Note: Actual duplication is handled by Deck; here we mark or log intent
      console.log(`[${this.name}] Marked ${target.getDisplayString()} for duplication`);
    });

    this.effectStrategies.set(TarotEffect.DESTROY, (target: Card) => {
      // Note: Actual destruction is handled by Deck; here we mark or log intent
      console.log(`[${this.name}] Marked ${target.getDisplayString()} for destruction`);
    });
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

    const strategy = this.effectStrategies.get(this.effectType);
    if (!strategy) {
      throw new Error(`Unknown tarot effect type: ${this.effectType}`);
    }
    strategy(target);
  }

  /**
   * Returns true (targeted tarots need card selection).
   * @returns True
   */
  public requiresTarget(): boolean {
    return true;
  }
}