// ============================================
// FILE: src/services/shop/shop-item-type.enum.ts
// ============================================

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
    case ShopItemType.JOKER: return 5;
    case ShopItemType.PLANET: return 3;
    case ShopItemType.TAROT: return 3;
    default: return 0;
  }
}