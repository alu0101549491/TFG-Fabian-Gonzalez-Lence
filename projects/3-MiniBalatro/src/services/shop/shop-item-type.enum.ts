/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/shop/shop-item-type.enum.ts
 * @desc Shop item type enumeration and utility functions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { GameConfig } from '../config/game-config';

/**
 * Enum defining purchasable item types in shop.
 */
export enum ShopItemType {
  JOKER = 'JOKER',
  PLANET = 'PLANET',
  TAROT = 'TAROT'
}

/**
 * Returns the display name for an item type.
 * @param type - The item type
 * @returns Display name
 */
export function getItemTypeDisplayName(type: ShopItemType): string {
  switch (type) {
    case ShopItemType.JOKER: return 'Joker';
    case ShopItemType.PLANET: return 'Planet Card';
    case ShopItemType.TAROT: return 'Tarot Card';
    default: return 'Unknown Item';
  }
}

/**
 * Returns the default cost for an item type.
 * @param type - The item type
 * @returns Default cost
 */
export function getDefaultCost(type: ShopItemType): number {
  switch (type) {
    case ShopItemType.JOKER: return GameConfig.JOKER_COST;
    case ShopItemType.PLANET: return GameConfig.PLANET_COST;
    case ShopItemType.TAROT: return GameConfig.TAROT_COST;
    default: return 0;
  }
}