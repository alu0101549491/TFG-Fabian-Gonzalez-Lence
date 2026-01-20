// ============================================
// FILE: src/views/components/card/CardComponent.tsx
// ============================================

import React from 'react';
import { Card } from '../../../models/core/card';
import { getSuitSymbol, getSuitColor } from '../../../utils/constants';
import { Tooltip } from '../tooltip/Tooltip';
import { CardTooltipContent } from '../tooltip/CardTooltipContent';
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
 * Displays card value, suit, and bonuses with hover tooltip.
 */
export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isSelected,
  onClick
}) => {
  const suitSymbol = getSuitSymbol(card.suit);
  const suitColor = getSuitColor(card.suit);
  const valueDisplay = card.getDisplayString();

  return (
    <Tooltip content={<CardTooltipContent card={card} />}>
      <div
        className={`card ${isSelected ? 'card--selected' : ''}`}
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
    </Tooltip>
  );
};