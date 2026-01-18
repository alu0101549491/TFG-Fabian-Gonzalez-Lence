// ============================================
// FILE: src/services/shop/shop.ts
// ============================================

import { ShopItem } from './shop-item';
import { ShopItemGenerator } from './shop-item-generator';
import { ShopItemType } from './shop-item-type.enum';

/**
 * Manages shop inventory and transactions.
 * Handles item generation, purchases, and rerolls.
 */
export class Shop {
  private availableItems: ShopItem[];
  private rerollCost: number;

  /**
   * Creates a shop with specified reroll cost.
   * @param rerollCost - Cost to regenerate shop items
   * @throws Error if rerollCost <= 0
   */
  constructor(rerollCost: number = 2) {
    if (rerollCost <= 0) {
      throw new Error('Reroll cost must be positive');
    }

    this.availableItems = [];
    this.rerollCost = rerollCost;
  }

  /**
   * Generates new shop inventory.
   * @param count - Number of items to generate
   * @throws Error if count <= 0
   */
  public generateItems(count: number = 4): void {
    if (count <= 0) {
      throw new Error('Count must be positive');
    }

    const generator = new ShopItemGenerator();
    this.availableItems = generator.generateShopItems(count);

    console.log(`Generated ${this.availableItems.length} shop items`);
  }

  /**
   * Attempts to purchase item if affordable.
   * @param itemId - ID of item to purchase
   * @param playerMoney - Player's current money
   * @returns ShopItem if successful, null if not affordable
   * @throws Error if itemId not found
   */
  public purchaseItem(itemId: string, playerMoney: number): ShopItem | null {
    const itemIndex = this.availableItems.findIndex(item => item.getId() === itemId);
    if (itemIndex === -1) {
      throw new Error(`Item with ID ${itemId} not found`);
    }

    const item = this.availableItems[itemIndex];
    if (playerMoney >= item.getCost()) {
      // Remove item from shop
      this.availableItems.splice(itemIndex, 1);
      console.log(`Purchased item ${item.getId()} for $${item.getCost()}`);
      return item;
    }

    return null;
  }

  /**
   * Regenerates shop items if player can afford reroll cost.
   * @param playerMoney - Player's current money
   * @returns true if successful, false if not affordable
   */
  public reroll(playerMoney: number): boolean {
    if (playerMoney >= this.rerollCost) {
      this.generateItems(4);
      console.log(`Shop rerolled for $${this.rerollCost}`);
      return true;
    }
    return false;
  }

  /**
   * Returns copy of available items.
   * @returns Array of ShopItems
   */
  public getAvailableItems(): ShopItem[] {
    return [...this.availableItems];
  }

  /**
   * Returns cost to reroll shop.
   * @returns Positive number
   */
  public getRerollCost(): number {
    return this.rerollCost;
  }

  /**
   * Returns number of items in shop.
   * @returns Integer 0-4
   */
  public getItemCount(): number {
    return this.availableItems.length;
  }

  /**
   * Gets an item by ID.
   * @param itemId - ID of item to get
   * @returns ShopItem if found, undefined otherwise
   */
  public getItem(itemId: string): ShopItem | undefined {
    return this.availableItems.find(item => item.getId() === itemId);
  }

  /**
   * Removes an item by ID.
   * @param itemId - ID of item to remove
   */
  public removeItem(itemId: string): void {
    this.availableItems = this.availableItems.filter(item => item.getId() !== itemId);
  }
}