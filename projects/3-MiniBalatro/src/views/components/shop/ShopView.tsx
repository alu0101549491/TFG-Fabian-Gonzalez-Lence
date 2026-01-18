// ============================================
// FILE: src/views/components/shop/ShopView.tsx
// ============================================

import React, { useState } from 'react';
import { GameController } from '../../../controllers/game-controller';
import { Shop } from '../../../services/shop/shop';
import { ShopItem } from '../../../services/shop/shop-item';
import { ShopItemType } from '../../../services/shop/shop-item-type.enum';
import './ShopView.css';

/**
 * Interface for ShopView component props.
 */
interface ShopViewProps {
  controller: GameController;
  shop: Shop | null;
  playerMoney: number;
}

/**
 * Shop interface component.
 * Displays purchasable items and shop actions.
 */
export const ShopView: React.FC<ShopViewProps> = ({
  controller,
  shop,
  playerMoney
}) => {
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  /**
   * Handles item purchase.
   * @param itemId - ID of item to purchase
   */
  const handlePurchase = (itemId: string) => {
    if (!shop) return;

    const item = shop.getItem(itemId);
    if (!item) {
      setPurchaseError('Item not found');
      return;
    }

    if (playerMoney < item.getCost()) {
      setPurchaseError('Not enough money');
      return;
    }

    const success = controller.purchaseShopItem(itemId);
    if (!success) {
      setPurchaseError('Inventory full - replace an item first');
    } else {
      setPurchaseError(null);
    }
  };

  /**
   * Handles shop reroll.
   */
  const handleReroll = () => {
    if (!shop) return;

    if (playerMoney < shop.getRerollCost()) {
      setPurchaseError('Not enough money to reroll');
      return;
    }

    const success = controller.rerollShop();
    if (!success) {
      setPurchaseError('Not enough money to reroll');
    } else {
      setPurchaseError(null);
    }
  };

  /**
   * Handles shop exit.
   */
  const handleExit = () => {
    controller.exitShop();
  };

  /**
   * Checks if player can afford an item.
   * @param cost - Item cost
   * @returns true if affordable
   */
  const canAfford = (cost: number): boolean => {
    return playerMoney >= cost;
  };

  /**
   * Gets color for item type.
   * @param type - ShopItemType
   * @returns CSS color
   */
  const getItemTypeColor = (type: ShopItemType): string => {
    switch (type) {
      case ShopItemType.JOKER: return '#e94560';
      case ShopItemType.PLANET: return '#6c5ce7';
      case ShopItemType.TAROT: return '#00d2d3';
      default: return '#ffffff';
    }
  };

  if (!shop) {
    return <div className="shop-view">Shop not available</div>;
  }

  const availableItems = shop.getAvailableItems();
  const rerollCost = shop.getRerollCost();

  return (
    <div className="shop-view">
      <div className="shop-header">
        <h2>Shop</h2>
        <div className="shop-money">Money: ${playerMoney}</div>
      </div>

      <div className="shop-items">
        {availableItems.map((shopItem) => (
          <div
            key={shopItem.getId()}
            className={`shop-item ${!canAfford(shopItem.getCost()) ? 'unaffordable' : ''}`}
          >
            <div className="item-type" style={{ color: getItemTypeColor(shopItem.getType()) }}>
              {shopItem.getType()}
            </div>
            <div className="item-name">{shopItem.getItem().name}</div>
            <div className="item-description">{shopItem.getItem().description}</div>
            <div className="item-cost">${shopItem.getCost()}</div>
            <button
              className="purchase-button"
              onClick={() => handlePurchase(shopItem.getId())}
              disabled={!canAfford(shopItem.getCost())}
            >
              Purchase
            </button>
          </div>
        ))}
      </div>

      {purchaseError && (
        <div className="error-message">{purchaseError}</div>
      )}

      <div className="shop-actions">
        <button
          className="reroll-button"
          onClick={handleReroll}
          disabled={!canAfford(rerollCost)}
        >
          Reroll (${rerollCost})
        </button>
        <button
          className="continue-button"
          onClick={handleExit}
        >
          Continue to Next Level
        </button>
      </div>
    </div>
  );
};