// ============================================
// FILE: src/views/components/joker-zone/JokerZone.tsx
// ============================================

import React from 'react';
import { Joker } from '../../../models/special-cards/jokers/joker';
import './JokerZone.css';

/**
 * Interface for JokerZone component props.
 */
interface JokerZoneProps {
  jokers: Joker[];
}

/**
 * Joker display area component.
 * Shows active jokers with effects.
 */
export const JokerZone: React.FC<JokerZoneProps> = ({ jokers }) => {
  const emptySlots = 5 - jokers.length;

  return (
    <div className="joker-zone">
      <h3 className="zone-title">Jokers</h3>
      <div className="joker-slots">
        {jokers.map((joker, index) => (
          <div key={joker.id} className="joker-card">
            <div className="joker-order">{index + 1}</div>
            <div className="joker-name">{joker.name}</div>
            <div className="joker-description">{joker.description}</div>
          </div>
        ))}
        {[...Array(emptySlots)].map((_, index) => (
          <div key={`empty-${index}`} className="joker-slot-empty">
            Empty
          </div>
        ))}
      </div>
    </div>
  );
};
