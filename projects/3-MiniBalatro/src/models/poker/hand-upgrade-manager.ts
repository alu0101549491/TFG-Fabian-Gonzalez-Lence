import {HandType} from './hand-type.enum';
import {HandUpgrade} from './hand-upgrade';

/**
 * Manages permanent upgrades to poker hand types.
 * Tracks and applies planet card effects to hands.
 */
export class HandUpgradeManager {
  private upgrades: Map<HandType, HandUpgrade>;

  constructor() {
    // TODO: Initialize upgrades map
  }

  /**
   * Applies a planet upgrade to a specific hand type.
   * @param {HandType} handType - Hand type to upgrade
   * @param {number} chips - Chips to add
   * @param {number} mult - Mult to add
   */
  public applyPlanetUpgrade(
      handType: HandType,
      chips: number,
      mult: number
  ): void {
    // TODO: Implement upgrade application
  }

  /**
   * Gets the current upgrade values for a hand type.
   * @param {HandType} handType - Hand type to query
   * @return {HandUpgrade} Current upgrade values
   */
  public getUpgradedValues(handType: HandType): HandUpgrade {
    // TODO: Implement upgrade retrieval
    return new HandUpgrade();
  }

  /**
   * Resets all hand upgrades to zero.
   */
  public reset(): void {
    // TODO: Implement reset
  }
}