/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/views/components/hand/Hand.tsx
 * @desc Player hand display component showing 8 cards with selection handling
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import React from 'react';
import { Card } from '../../../models/core/card';
import { CardComponent } from '../card/CardComponent';
import { GameConfig } from '../../../services/config/game-config';
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
        Selected: {selectedCards.length}/{GameConfig.MAX_CARDS_TO_PLAY}
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