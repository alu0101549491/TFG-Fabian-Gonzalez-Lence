// ============================================
// FILE: src/services/shop/shop-item.ts
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { ShopItemType } from './shop-item-type.enum';
import { Joker } from '../../models/special-cards/jokers/joker';
import { Planet } from '../../models/special-cards/planets/planet';
import { Tarot } from '../../models/special-cards/tarots/tarot';

/**
 * Represents a single purchasable item in the shop.
 * Contains the special card and its cost.
 */
export class ShopItem {
  private readonly id: string;

  /**
   * Creates a shop item with specified properties.
   * @param type - Type of item (Joker/Planet/Tarot)
   * @param item - The actual special card object
   * @param cost - Purchase price
   * @throws Error if item null or cost <= 0
   */
  constructor(
    public readonly type: ShopItemType,
    public readonly item: Joker | Planet | Tarot,
    public readonly cost: number
  ) {
    if (!item) {
      throw new Error('Item cannot be null');
    }
    if (cost <= 0) {
      throw new Error('Cost must be positive');
    }

    this.id = uuidv4();
  }

  /**
   * Returns the item's unique ID.
   * @returns The item ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the item type.
   * @returns The ShopItemType enum
   */
  public getType(): ShopItemType {
    return this.type;
  }

  /**
   * Returns the special card object.
   * @returns Joker, Planet, or Tarot
   */
  public getItem(): Joker | Planet | Tarot {
    return this.item;
  }

  /**
   * Returns the purchase cost.
   * @returns Positive number
   */
  public getCost(): number {
    return this.cost;
  }
}