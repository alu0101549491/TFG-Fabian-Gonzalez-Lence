// ============================================
// FILE: src/models/special-cards/tarots/tarot-effect.enum.ts
// ============================================

/**
 * Enum defining all tarot card effect types.
 */
export enum TarotEffect {
  ADD_CHIPS = 'ADD_CHIPS',         // The Emperor
  ADD_MULT = 'ADD_MULT',           // The Empress
  CHANGE_SUIT = 'CHANGE_SUIT',     // The Star, Moon, Sun, World
  UPGRADE_VALUE = 'UPGRADE_VALUE', // Strength
  DUPLICATE = 'DUPLICATE',         // Death
  DESTROY = 'DESTROY'              // The Hanged Man
}