import React from 'react';
import {ShopItem} from '@services/shop/shop-item';
import './ShopView.css';

/**
 * Props for ShopView component
 */
interface ShopViewProps {
  items: ShopItem[];
  money: number;
  rerollCost: number;
  onPurchase?: (itemId: string) => void;
  onReroll?: () => void;
  onExit?: () => void;
}

/**
 * ShopView component - displays the shop interface.
 * Shows purchasable items and allows transactions.
 */
export const ShopView: React.FC<ShopViewProps> = ({
  items,
  money,
  rerollCost,
  onPurchase,
  onReroll,
  onExit,
}) => {
  // TODO: Implement shop display
  // TODO: Handle purchases
  // TODO: Show affordability indicators

  const canReroll = money >= rerollCost;

  return (
    <div className="shop-view">
      <div className="shop-header">
        <h2 className="shop-title">Shop</h2>
        <div className="shop-money">${money}</div>
      </div>

      <div className="shop-items">
        {items.map((item) => {
          const canAfford = money >= item.cost;

          return (
            <div
              key={item.id}
              className={`shop-item ${!canAfford ? 'shop-item--locked' : ''}`}
              onClick={() => canAfford && onPurchase?.(item.id)}
            >
              <div className="shop-item-type">{item.type}</div>
              <div className="shop-item-name">
                {/* TODO: Get name from item */}
                Item
              </div>
              <div className="shop-item-cost">${item.cost}</div>
            </div>
          );
        })}
      </div>

      <div className="shop-actions">
        <button
          className="shop-button shop-button--reroll"
          onClick={onReroll}
          disabled={!canReroll}
        >
          Reroll (${rerollCost})
        </button>
        <button
          className="shop-button shop-button--exit"
          onClick={onExit}
        >
          Continue
        </button>
      </div>
    </div>
  );
};