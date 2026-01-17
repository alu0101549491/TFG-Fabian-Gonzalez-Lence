// ============================================
// FILE: src/models/poker/hand-upgrade-manager.ts
// ============================================

import { HandType } from './hand-type.enum';
import { HandUpgrade } from './hand-upgrade';

/**
 * Manages permanent upgrades for all poker hand types.
 * Tracks cumulative bonuses from planet cards.
 */
export class HandUpgradeManager {
  private upgrades: Map<HandType, HandUpgrade>;

  /**
   * Initializes upgrade manager with zero upgrades for all hand types.
   */
  constructor() {
    this.upgrades = new Map<HandType, HandUpgrade>();

    // Initialize all hand types with zero upgrades
    const allHandTypes = Object.values(HandType);
    for (const handType of allHandTypes) {
      this.upgrades.set(handType, new HandUpgrade());
    }
  }

  /**
   * Applies permanent upgrade from planet card to specified hand type.
   * @param handType - The hand type to upgrade
   * @param chips - Additional chips to add
   * @param mult - Additional mult to add
   * @throws Error if handType is invalid or negative values are provided
   */
  public applyPlanetUpgrade(handType: HandType, chips: number, mult: number): void {
    if (!Object.values(HandType).includes(handType)) {
      throw new Error('Invalid hand type');
    }
    if (chips < 0 || mult < 0) {
      throw new Error('Upgrade values cannot be negative');
    }

    const upgrade = this.upgrades.get(handType);
    if (!upgrade) {
      throw new Error(`No upgrade record for hand type ${handType}`);
    }

    upgrade.addUpgrade(chips, mult);
    console.log(`Applied upgrade to ${handType}: +${chips} chips, +${mult} mult`);
  }

  /**
   * Returns current upgrade bonuses for a hand type.
   * @param handType - The hand type to get upgrades for
   * @returns HandUpgrade with current bonuses
   * @throws Error if handType is invalid
   */
  public getUpgradedValues(handType: HandType): HandUpgrade {
    if (!Object.values(HandType).includes(handType)) {
      throw new Error('Invalid hand type');
    }

    const upgrade = this.upgrades.get(handType);
    if (!upgrade) {
      throw new Error(`No upgrade record for hand type ${handType}`);
    }

    return upgrade;
  }

  /**
   * Resets all upgrades to zero (for new game).
   */
  public reset(): void {
    for (const handType of this.upgrades.keys()) {
      this.upgrades.set(handType, new HandUpgrade());
    }
    console.log('All hand upgrades reset');
  }
}