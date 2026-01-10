import React from 'react';
import {Joker} from '@models/special-cards/jokers/joker';
import './JokerZone.css';

/**
 * Props for JokerZone component
 */
interface JokerZoneProps {
  jokers: Joker[];
  maxJokers: number;
  onJokerClick?: (jokerId: string) => void;
}

/**
 * JokerZone component - displays active joker cards.
 * Shows joker effects and allows interaction.
 */
export const JokerZone: React.FC<JokerZoneProps> = ({
  jokers,
  maxJokers,
  onJokerClick,
}) => {
  // TODO: Implement joker display
  // TODO: Add tooltips for joker effects
  // TODO: Show activation indicators

  const emptySlots = maxJokers - jokers.length;

  return (
    <div className="joker-zone">
      <h3 className="joker-zone-title">Jokers</h3>
      <div className="joker-slots">
        {jokers.map((joker) => (
          <div
            key={joker.getId()}
            className="joker-card"
            onClick={() => onJokerClick?.(joker.getId())}
            title={joker.getDescription()}
          >
            <div className="joker-name">{joker.getName()}</div>
            <div className="joker-priority">{joker.getPriority()}</div>
          </div>
        ))}
        {Array.from({length: emptySlots}).map((_, index) => (
          <div key={`empty-${index}`} className="joker-slot joker-slot--empty">
            <span className="slot-label">Empty</span>
          </div>
        ))}
      </div>
    </div>
  );
};