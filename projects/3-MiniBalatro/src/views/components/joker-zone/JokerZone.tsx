// ============================================
// FILE: src/views/components/joker-zone/JokerZone.tsx
// ============================================

import React from 'react';
import { Joker } from '../../../models/special-cards/jokers/joker';
import { GameConfig } from '../../../services/config/game-config';
import { Tooltip } from '../tooltip/Tooltip';
import { JokerTooltipContent } from '../tooltip/JokerTooltipContent';
import './JokerZone.css';

/**
 * Interface for JokerZone component props.
 */
interface JokerZoneProps {
  jokers: Joker[];
  onRemoveJoker?: (jokerId: string) => void;
}

/**
 * Joker display area component.
 * Shows active jokers with effects and hover tooltips.
 */
export const JokerZone: React.FC<JokerZoneProps> = ({ jokers, onRemoveJoker }) => {
  const emptySlots = GameConfig.MAX_JOKERS - jokers.length;

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

    return `${import.meta.env.BASE_URL}assets/jokers/${baseName}.png`;
  };

  return (
    <div className="joker-zone">
      <div className="joker-slots">
        {jokers.map((joker /*, index*/) => (
          <Tooltip key={joker.id} content={<JokerTooltipContent joker={joker} />}>
            <div className="joker-card">
              {onRemoveJoker && (
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Remove ${joker.name}?`)) {
                      onRemoveJoker(joker.id);
                    }
                  }}
                  title="Remove joker"
                >
                  ✖
                </button>
              )}
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
                {/* <div className="joker-order">{index + 1}</div> */}
                <div className="joker-name">{joker.name}</div>
              </div>
            </div>
          </Tooltip>
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
