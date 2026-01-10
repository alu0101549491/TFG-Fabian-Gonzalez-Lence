import {ShopItemType} from './shop-item-type.enum';
import {Joker} from '../../models/special-cards/jokers/joker';
import {Planet} from '../../models/special-cards/planets/planet';
import {Tarot} from '../../models/special-cards/tarots/tarot';

/**
 * Represents an item available for purchase in the shop.
 */
export class ShopItem {
  public id: string;
  public type: ShopItemType;
  public item: Joker | Planet | Tarot;
  public cost: number;

  /**
   * Creates a new ShopItem instance.
   * @param {string} id - Unique item identifier
   * @param {ShopItemType} type - Type of item
   * @param {Joker | Planet | Tarot} item - The actual item
   * @param {number} cost - Purchase cost
   */
  constructor(
      id: string,
      type: ShopItemType,
      item: Joker | Planet | Tarot,
      cost: number
  ) {
    this.id = id;
    this.type = type;
    this.item = item;
    this.cost = cost;
  }
}