// ============================================
// FILE: src/views/components/shop/ShopView.tsx
// ============================================

import React, { useState } from 'react';
import { GameController } from '../../../controllers/game-controller';
import { Shop } from '../../../services/shop/shop';
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
  const [availableItems, setAvailableItems] = useState(shop?.getAvailableItems() || []);
  const [currentMoney, setCurrentMoney] = useState(playerMoney);

  // Update items and money when shop or playerMoney changes
  React.useEffect(() => {
    if (shop) {
      setAvailableItems(shop.getAvailableItems());
    }
    setCurrentMoney(playerMoney);
  }, [shop, playerMoney]);

  /**
   * Gets the image path for a special card based on its name and type.
   * @param itemName - Name of the item
   * @param itemType - Type of the item (JOKER, PLANET, TAROT)
   * @returns Path to the image asset
   */
  const getCardImage = (itemName: string, itemType: ShopItemType): string => {
    // Convert name to filename format (e.g., "Greedy Joker" -> "greedyJoker")
    const baseName = itemName
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    switch (itemType) {
      case ShopItemType.JOKER:
        return `${import.meta.env.BASE_URL}assets/jokers/${baseName}.png`;
      case ShopItemType.PLANET:
        return `${import.meta.env.BASE_URL}assets/planets/${baseName}.png`;
      case ShopItemType.TAROT:
        return `${import.meta.env.BASE_URL}assets/tarots/${baseName}.png`;
      default:
        return '';
    }
  };

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

    if (currentMoney < item.getCost()) {
      setPurchaseError('Not enough money');
      return;
    }

    const success = controller.purchaseShopItem(itemId);
    if (!success) {
      setPurchaseError('Inventory full - replace an item first');
    } else {
      setPurchaseError(null);
      // Update local state immediately for responsive UI
      setAvailableItems(shop.getAvailableItems());
      setCurrentMoney(controller.getGameState()?.getMoney() || currentMoney);
    }
  };

  /**
   * Handles shop reroll.
   */
  const handleReroll = async () => {
    if (!shop) return;

    if (currentMoney < shop.getRerollCost()) {
      setPurchaseError('Not enough money to reroll');
      return;
    }

    const success = await controller.rerollShop();
    if (!success) {
      setPurchaseError('Not enough money to reroll');
    } else {
      setPurchaseError(null);
      // Update local state immediately
      setAvailableItems(shop.getAvailableItems());
      setCurrentMoney(controller.getGameState()?.getMoney() || currentMoney);
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
    return currentMoney >= cost;
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

  const rerollCost = shop.getRerollCost();

  return (
    <div className="shop-view">
      <div className="shop-header">
        <h2>Shop</h2>
        <div className="shop-money">Money: ${currentMoney}</div>
      </div>

      <div className="shop-items">
        {availableItems.map((shopItem) => {
          const item = shopItem.getItem();
          const itemType = shopItem.getType();
          const imagePath = getCardImage(item.name, itemType);
          
          // Get description safely
          let description = 'Special card';
          if ('description' in item && item.description) {
            description = item.description;
          } else if ('getDescription' in item && typeof item.getDescription === 'function') {
            description = item.getDescription();
          }

          return (
            <div
              key={shopItem.getId()}
              className={`shop-item ${!canAfford(shopItem.getCost()) ? 'unaffordable' : ''}`}
            >
              <img 
                src={imagePath} 
                alt={item.name}
                className="item-image"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="item-info">
                <div className="item-type" style={{ color: getItemTypeColor(itemType) }}>
                  {itemType}
                </div>
                <div className="item-name">{item.name}</div>
                <div className="item-description">{description}</div>
              </div>
              <div className="item-footer">
                <div className="item-cost">${shopItem.getCost()}</div>
                <button
                  className="purchase-button"
                  onClick={() => handlePurchase(shopItem.getId())}
                  disabled={!canAfford(shopItem.getCost())}
                >
                  Purchase
                </button>
              </div>
            </div>
          );
        })}
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