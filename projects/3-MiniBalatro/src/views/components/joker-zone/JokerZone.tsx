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

  /**
   * Gets the image path for a joker based on its name.
   * @param jokerName - Name of the joker
   * @returns Path to the image asset
   */
  const getJokerImage = (jokerName: string): string => {
    // Convert name to filename format (e.g., "Greedy Joker" -> "greedyJoker")
    const baseName = jokerName
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    return `/assets/jokers/${baseName}.png`;
  };

  return (
    <div className="joker-zone">
      <div className="joker-slots">
        {jokers.map((joker, index) => (
          <div key={joker.id} className="joker-card">
            <img 
              src={getJokerImage(joker.name)} 
              alt={joker.name}
              className="joker-image"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="joker-info">
              <div className="joker-order">{index + 1}</div>
              <div className="joker-name">{joker.name}</div>
            </div>
          </div>
        ))}
        {[...Array(emptySlots)].map((_, index) => (
          <div key={`empty-${index}`} className="joker-slot-empty">
            <div className="empty-slot-icon">?</div>
            <div className="empty-slot-text">Empty Slot</div>
          </div>
        ))}
      </div>
    </div>
  );
};
