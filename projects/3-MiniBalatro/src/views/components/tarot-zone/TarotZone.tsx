// ============================================
// FILE: src/views/components/tarot-zone/TarotZone.tsx
// ============================================

import React, { useState } from 'react';
import { Tarot } from '../../../models/special-cards/tarots/tarot';
import './TarotZone.css';

/**
 * Interface for TarotZone component props.
 */
interface TarotZoneProps {
  consumables: Tarot[];
  onUseConsumable: (tarotId: string, targetCardId?: string) => void;
}

/**
 * Tarot/consumables display component.
 * Shows active tarot cards with use buttons.
 */
export const TarotZone: React.FC<TarotZoneProps> = ({
  consumables,
  onUseConsumable
}) => {
  const emptySlots = 2 - consumables.length;

  return (
    <div className="tarot-zone">
      <h3 className="zone-title">Tarot Cards</h3>
      <div className="tarot-slots">
        {consumables.map((tarot) => (
          <div key={tarot.name} className="tarot-card">
            <div className="tarot-name">{tarot.name}</div>
            <div className="tarot-description">{tarot.description}</div>
            <button
              className="use-button"
              onClick={() => onUseConsumable(tarot.name)}
            >
              Use
            </button>
          </div>
        ))}
        {[...Array(emptySlots)].map((_, index) => (
          <div key={`empty-${index}`} className="tarot-slot-empty">
            Empty
          </div>
        ))}
      </div>
    </div>
  );
};