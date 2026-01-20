// ============================================
// FILE: src/views/components/tooltip/CardTooltipContent.tsx
// ============================================

import React from 'react';
import { Card } from '../../../models/core/card';
import { Suit } from '../../../models/core/suit.enum';
import { getBaseChipsForValue } from '../../../models/core/card-value.enum';

/**
 * Interface for CardTooltipContent props.
 */
interface CardTooltipContentProps {
  card: Card;
}

/**
 * Gets the human-readable name for a suit.
 */
const getSuitName = (suit: Suit): string => {
  switch (suit) {
    case Suit.DIAMONDS:
      return 'Diamonds';
    case Suit.HEARTS:
      return 'Hearts';
    case Suit.SPADES:
      return 'Spades';
    case Suit.CLUBS:
      return 'Clubs';
    default:
      return suit;
  }
};

/**
 * Tooltip content component for playing cards.
 * Shows card name, base chips, and bonuses.
 */
export const CardTooltipContent: React.FC<CardTooltipContentProps> = ({ card }) => {
  const valueDisplay = card.getDisplayString();
  const suitName = getSuitName(card.suit);
  
  // Get base chips for this card value
  const baseChips = getBaseChipsForValue(card.value);
  
  // Calculate bonuses by comparing total with base
  const totalChips = card.getBaseChips();
  const chipBonus = totalChips - baseChips;
  const multBonus = card.getMultBonus();

  return (
    <div className="tooltip-content">
      <div className="tooltip-title">
        {valueDisplay} of {suitName}
      </div>
      
      <div className="tooltip-stats">
        <div className="tooltip-stat">
          <span className="tooltip-label">Base Chips</span>
          <span className="tooltip-value tooltip-value--chips">
            {baseChips}
          </span>
        </div>

        {chipBonus > 0 && (
          <div className="tooltip-stat">
            <span className="tooltip-label">Chip Bonus</span>
            <span className="tooltip-value tooltip-value--bonus">
              +{chipBonus}
            </span>
          </div>
        )}

        {multBonus > 0 && (
          <div className="tooltip-stat">
            <span className="tooltip-label">Mult Bonus</span>
            <span className="tooltip-value tooltip-value--mult">
              +{multBonus}
            </span>
          </div>
        )}
      </div>

      {(chipBonus > 0 || multBonus > 0) && (
        <div className="tooltip-section">
          <span className="tooltip-label">Total Value</span>
          <span className="tooltip-value">
            {totalChips} chips
            {multBonus > 0 && `, +${multBonus} mult`}
          </span>
        </div>
      )}
    </div>
  );
};
