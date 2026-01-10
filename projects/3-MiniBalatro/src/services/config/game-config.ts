import {CardValue} from '../../models/core/card-value.enum';
import {HandType} from '../../models/poker/hand-type.enum';
import {HandUpgrade} from '../../models/poker/hand-upgrade';

/**
 * Static configuration for game constants.
 * Singleton pattern - provides centralized game settings.
 */
export class GameConfig {
  // Economy
  public static readonly INITIAL_MONEY: number = 4;
  public static readonly JOKER_COST: number = 5;
  public static readonly PLANET_COST: number = 3;
  public static readonly TAROT_COST: number = 3;

  // Limits
  public static readonly MAX_JOKERS: number = 5;
  public static readonly MAX_CONSUMABLES: number = 2;
  public static readonly HAND_SIZE: number = 8;
  public static readonly MAX_HANDS_PER_BLIND: number = 4;
  public static readonly MAX_DISCARDS_PER_BLIND: number = 3;

  /**
   * Gets the chip value for a card value.
   * @param {CardValue} value - Card value
   * @return {number} Chip value
   */
  public static getCardValue(value: CardValue): number {
    // TODO: Implement card value mapping
    return 0;
  }

  /**
   * Gets the base chips and mult for a hand type.
   * @param {HandType} handType - Hand type
   * @return {HandUpgrade} Base values
   */
  public static getHandBaseValues(handType: HandType): HandUpgrade {
    // TODO: Implement hand base values mapping
    return new HandUpgrade();
  }
}