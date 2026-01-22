// ============================================
// FILE: src/views/components/tooltip/JokerTooltipContent.tsx
// ============================================

import React from 'react';
import { Joker } from '../../../models/special-cards/jokers/joker';

/**
 * Interface for JokerTooltipContent props.
 */
interface JokerTooltipContentProps {
  joker: Joker;
}

/**
 * Tooltip content component for joker cards.
 * Shows joker name and description.
 */
export const JokerTooltipContent: React.FC<JokerTooltipContentProps> = ({ joker }) => {
  return (
    <div className="tooltip-content">
      <div className="tooltip-title">
        {joker.name}
      </div>
      
      <div className="tooltip-description">
        {joker.description}
      </div>
    </div>
  );
};
