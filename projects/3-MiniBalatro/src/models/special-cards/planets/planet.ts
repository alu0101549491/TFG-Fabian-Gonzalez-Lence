// ============================================
// FILE: src/models/special-cards/planets/planet.ts
// ============================================

import { HandType } from '../../poker/hand-type.enum';
import { HandUpgradeManager } from '../../poker/hand-upgrade-manager';

/**
 * Represents a planet card that permanently upgrades a poker hand type.
 * Planet effects are cumulative and persist for the entire game.
 */
export class Planet {
  /**
   * Creates a planet card with specified upgrades.
   * @param name - Planet name
   * @param targetHandType - Which hand type this upgrades
   * @param chipsBonus - Additional chips to add
   * @param multBonus - Additional mult to add
   * @throws Error if negative bonuses provided
   */
  constructor(
    public readonly name: string,
    public readonly targetHandType: HandType,
    public readonly chipsBonus: number,
    public readonly multBonus: number
  ) {
    if (chipsBonus < 0 || multBonus < 0) {
      throw new Error('Planet bonuses cannot be negative');
    }
  }

  /**
   * Applies this planet's bonuses to the upgrade manager.
   * @param upgradeManager - The hand upgrade manager
   * @throws Error if upgradeManager is null
   */
  public apply(upgradeManager: HandUpgradeManager): void {
    if (!upgradeManager) {
      throw new Error('Upgrade manager cannot be null');
    }

    upgradeManager.applyPlanetUpgrade(
      this.targetHandType,
      this.chipsBonus,
      this.multBonus
    );

    console.log(`[${this.name}] Applied upgrade to ${this.targetHandType}: +${this.chipsBonus} chips, +${this.multBonus} mult`);
  }
}