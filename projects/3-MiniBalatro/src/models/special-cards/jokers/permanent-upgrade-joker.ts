// ============================================
// FILE: src/models/special-cards/jokers/permanent-upgrade-joker.ts
// ============================================

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';
import { Card } from '../../core/card';

/**
 * Joker that permanently upgrades cards when played.
 * Unlike regular jokers that modify the score, this type modifies
 * the cards themselves, adding permanent bonuses that persist.
 * 
 * Example: Hiker - Each played card gains +5 chips permanently.
 * If you play a 10♦ (base 10 chips), it becomes (10 + 5 = 15 chips).
 * Play it again, it becomes (15 + 5 = 20 chips), and so on.
 */
export class PermanentUpgradeJoker extends Joker {
  /**
   * Creates a permanent upgrade joker.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param chipBonus - Chips to add to each card (default 5)
   * @param multBonus - Mult to add to each card (default 0)
   */
  constructor(
    id: string,
    name: string,
    description: string,
    private readonly chipBonus: number = 5,
    private readonly multBonus: number = 0
  ) {
    super(id, name, description, JokerPriority.CHIPS);
  }

  /**
   * Returns CHIPS priority (happens before MULT and MULTIPLIER).
   * This ensures upgrades are applied early in the calculation.
   * @returns JokerPriority.CHIPS
   */
  public getPriority(): JokerPriority {
    return JokerPriority.CHIPS;
  }

  /**
   * Permanent upgrade jokers don't modify the score directly.
   * They modify cards AFTER the hand is played.
   * This method is here for compatibility but does nothing.
   * @param _context - Score context (unused)
   */
  public applyEffect(_context: ScoreContext): void {
    // NO-OP: Permanent upgrades happen AFTER scoring, not during
    // See GameState.playHand() for where cards are actually upgraded
  }

  /**
   * Always returns true - permanent upgrades always apply.
   * @param _context - Score context (unused)
   * @returns true
   */
  public canActivate(_context: ScoreContext): boolean {
    return true;
  }

  /**
   * Applies permanent upgrade to a single card.
   * @param card - The card to upgrade
   */
  public upgradeCard(card: Card): void {
    card.addPermanentBonus(this.chipBonus, this.multBonus);
    console.log(`[${this.name}] Upgraded card: +${this.chipBonus} chips, +${this.multBonus} mult`);
  }

  /**
   * Applies permanent upgrades to all cards in an array.
   * @param cards - The cards to upgrade
   */
  public upgradeCards(cards: Card[]): void {
    for (const card of cards) {
      this.upgradeCard(card);
    }
  }

  /**
   * Returns the chip bonus value.
   * @returns Chip bonus per card
   */
  public getChipBonus(): number {
    return this.chipBonus;
  }

  /**
   * Returns the mult bonus value.
   * @returns Mult bonus per card
   */
  public getMultBonus(): number {
    return this.multBonus;
  }
}
