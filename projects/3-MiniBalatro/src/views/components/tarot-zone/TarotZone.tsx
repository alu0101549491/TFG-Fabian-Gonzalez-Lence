// ============================================
// FILE: src/views/components/tarot-zone/TarotZone.tsx
// ============================================

import React from 'react';
import { Tarot } from '../../../models/special-cards/tarots/tarot';
import './TarotZone.css';

/**
 * Interface for TarotZone component props.
 */
interface TarotZoneProps {
  consumables: Tarot[];
  onUseConsumable: (tarotId: string, targetCardId?: string) => void;
  selectedCardIds?: string[]; // IDs of currently selected cards
}

/**
 * Tarot/consumables display component.
 * Shows active tarot cards with use buttons.
 */
export const TarotZone: React.FC<TarotZoneProps> = ({
  consumables,
  onUseConsumable,
  selectedCardIds = []
}) => {
  const emptySlots = 2 - consumables.length;

  /**
   * Handles using a tarot card.
   * @param tarot - The tarot to use
   */
  const handleUseTarot = (tarot: Tarot) => {
    // If tarot requires target and we have a selected card, use the first one
    if (tarot.requiresTarget()) {
      if (selectedCardIds.length === 0) {
        alert('Please select a card first!');
        return;
      }
      // Use the first selected card as target
      onUseConsumable(tarot.id, selectedCardIds[0]);
    } else {
      // Instant tarot, no target needed
      onUseConsumable(tarot.id);
    }
  };

  /**
   * Gets the image path for a tarot based on its name.
   * @param tarotName - Name of the tarot
   * @returns Path to the image asset
   */
  const getTarotImage = (tarotName: string): string => {
    // Convert name to filename format (e.g., "The Hermit" -> "theHermit")
    const baseName = tarotName
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    return `/assets/tarots/${baseName}.png`;
  };

  return (
    <div className="tarot-zone">
      <div className="tarot-slots">
        {consumables.map((tarot) => (
          <div key={tarot.id} className="tarot-card">
            <img 
              src={getTarotImage(tarot.name)} 
              alt={tarot.name}
              className="tarot-image"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="tarot-info">
              <div className="tarot-name">{tarot.name}</div>
              <button
                className="use-button"
                onClick={() => handleUseTarot(tarot)}
              >
                Use
              </button>
            </div>
          </div>
        ))}
        {[...Array(emptySlots)].map((_, index) => (
          <div key={`empty-${index}`} className="tarot-slot-empty">
            <div className="empty-slot-icon">🌟</div>
            <div className="empty-slot-text">Empty Slot</div>
          </div>
        ))}
      </div>
    </div>
  );
};