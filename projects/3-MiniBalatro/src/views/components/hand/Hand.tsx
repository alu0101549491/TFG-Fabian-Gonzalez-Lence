// ============================================
// FILE: src/views/components/hand/Hand.tsx
// ============================================

import React from 'react';
import { Card } from '../../../models/core/card';
import { CardComponent } from '../card/CardComponent';
import './Hand.css';

/**
 * Interface for Hand component props.
 */
interface HandProps {
  cards: Card[];
  selectedCards: Card[];
  onSelectCard: (cardId: string) => void;
}

/**
 * Player hand display component.
 * Shows 8 cards with selection handling.
 */
export const Hand: React.FC<HandProps> = ({
  cards,
  selectedCards,
  onSelectCard
}) => {
  return (
    <div className="hand">
      <div className="selection-indicator">
        Selected: {selectedCards.length}/5
      </div>
      <div className="cards-container">
        {cards.map((card) => (
          <CardComponent
            key={card.getId()}
            card={card}
            isSelected={selectedCards.some(c => c.getId() === card.getId())}
            onClick={() => onSelectCard(card.getId())}
          />
        ))}
      </div>
    </div>
  );
};