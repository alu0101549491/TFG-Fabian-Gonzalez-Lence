// ============================================
// FILE: src/views/components/card/CardComponent.tsx
// ============================================

import React from 'react';
import { Card } from '../../../models/core/card';
import { CardValue } from '../../../models/core/card-value.enum';
import { Suit } from '../../../models/core/suit.enum';
import { getSuitSymbol, getSuitColor } from '../../../models/core/suit.enum';
import { getDisplayString } from '../../../models/core/card-value.enum';
import './CardComponent.css';

/**
 * Interface for CardComponent props.
 */
interface CardComponentProps {
  card: Card;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Individual playing card component.
 * Displays card value, suit, and bonuses.
 */
export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isSelected,
  onClick
}) => {
  /**
   * Gets the display string for a card value.
   * @param value - CardValue enum
   * @returns Display string
   */
  const getValueDisplay = (value: CardValue): string => {
    return getDisplayString(value);
  };

  const suitSymbol = getSuitSymbol(card.suit);
  const suitColor = getSuitColor(card.suit);
  const valueDisplay = getValueDisplay(card.value);

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-corner top-left" style={{ color: suitColor }}>
        <div className="card-value">{valueDisplay}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
      <div className="card-center" style={{ color: suitColor }}>
        <span className="suit-symbol-large">{suitSymbol}</span>
      </div>
      <div className="card-corner bottom-right" style={{ color: suitColor }}>
        <div className="card-value">{valueDisplay}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
      {(card.getBaseChips() > 0 || card.getMultBonus() > 0) && (
        <div className="card-bonuses">
          {card.getBaseChips() > 0 && <span className="bonus-chips">+{card.getBaseChips()}</span>}
          {card.getMultBonus() > 0 && <span className="bonus-mult">+{card.getMultBonus()}</span>}
        </div>
      )}
    </div>
  );
};