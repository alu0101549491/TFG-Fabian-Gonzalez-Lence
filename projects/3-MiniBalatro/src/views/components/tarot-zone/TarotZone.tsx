import React from 'react';
import {Tarot} from '@models/special-cards/tarots/tarot';
import './TarotZone.css';

/**
 * Props for TarotZone component
 */
interface TarotZoneProps {
  tarots: Tarot[];
  maxTarots: number;
  onTarotClick?: (tarotId: string) => void;
}

/**
 * TarotZone component - displays consumable tarot cards.
 * Shows available tarots and allows usage.
 */
export const TarotZone: React.FC<TarotZoneProps> = ({
  tarots,
  maxTarots,
  onTarotClick,
}) => {
  // TODO: Implement tarot display
  // TODO: Add usage indicators
  // TODO: Show targeting requirements

  const emptySlots = maxTarots - tarots.length;

  return (
    <div className="tarot-zone">
      <h3 className="tarot-zone-title">Consumables</h3>
      <div className="tarot-slots">
        {tarots.map((tarot, index) => (
          <div
            key={`tarot-${index}`}
            className="tarot-card"
            onClick={() => onTarotClick?.(`tarot-${index}`)}
            title={tarot.getDescription()}
          >
            <div className="tarot-name">{tarot.getName()}</div>
          </div>
        ))}
        {Array.from({length: emptySlots}).map((_, index) => (
          <div key={`empty-${index}`} className="tarot-slot tarot-slot--empty">
            <span className="slot-label">Empty</span>
          </div>
        ))}
      </div>
    </div>
  );
};