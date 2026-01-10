import React from 'react';
import {Card} from '@models/core/card';
import {CardComponent} from '../card/CardComponent';
import './Hand.css';

/**
 * Props for Hand component
 */
interface HandProps {
  cards: Card[];
  selectedCards: string[];
  onCardSelect?: (cardId: string) => void;
  isDisabled?: boolean;
}

/**
 * Hand component - displays player's current hand of cards.
 * Allows selection/deselection of cards for playing or discarding.
 */
export const Hand: React.FC<HandProps> = ({
  cards,
  selectedCards,
  onCardSelect,
  isDisabled = false,
}) => {
  // TODO: Implement hand rendering logic
  // TODO: Handle card selection
  // TODO: Apply visual feedback for selected cards

  const handleCardClick = (cardId: string): void => {
    if (!isDisabled && onCardSelect) {
      onCardSelect(cardId);
    }
  };

  return (
    <div className="hand">
      <div className="hand-cards">
        {cards.map((card) => (
          <CardComponent
            key={card.getId()}
            card={card}
            isSelected={selectedCards.includes(card.getId())}
            onClick={() => handleCardClick(card.getId())}
            isDisabled={isDisabled}
          />
        ))}
      </div>
      <div className="hand-info">
        <span className="card-count">
          {cards.length} card{cards.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};