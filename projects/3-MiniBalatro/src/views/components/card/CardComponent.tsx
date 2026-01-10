import React from 'react';
import {Card} from '@models/core/card';
import {SUIT_SYMBOLS, SUIT_COLORS, CARD_VALUE_NAMES} from '@utils/constants';
import './CardComponent.css';

/**
 * Props for CardComponent
 */
interface CardComponentProps {
  card: Card;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  showEnhancements?: boolean;
}

/**
 * CardComponent - renders a single playing card.
 * Displays value, suit, and any enhancements (chips/mult bonuses).
 */
export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  isSelected = false,
  isDisabled = false,
  onClick,
  showEnhancements = true,
}) => {
  // TODO: Implement card rendering
  // TODO: Add animations for selection
  // TODO: Display enhancement badges

  const value = card.getValue();
  const suit = card.getSuit();
  const chipBonus = card.getChipBonus();
  const multBonus = card.getMultBonus();

  const hasEnhancements = chipBonus > 0 || multBonus > 0;
  const suitColor = SUIT_COLORS[suit];

  const cardClasses = [
    'card',
    isSelected ? 'card--selected' : '',
    isDisabled ? 'card--disabled' : '',
    hasEnhancements ? 'card--enhanced' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="card-content" style={{color: suitColor}}>
        <div className="card-value">{CARD_VALUE_NAMES[value]}</div>
        <div className="card-suit">{SUIT_SYMBOLS[suit]}</div>
      </div>

      {showEnhancements && hasEnhancements && (
        <div className="card-enhancements">
          {chipBonus > 0 && (
            <span className="enhancement enhancement--chips">
              +{chipBonus}
            </span>
          )}
          {multBonus > 0 && (
            <span className="enhancement enhancement--mult">
              +{multBonus}×
            </span>
          )}
        </div>
      )}
    </div>
  );
};