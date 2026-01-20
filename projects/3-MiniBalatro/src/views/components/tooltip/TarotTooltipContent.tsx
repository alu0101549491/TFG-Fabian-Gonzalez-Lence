// ============================================
// FILE: src/views/components/tooltip/TarotTooltipContent.tsx
// ============================================

import React from 'react';
import { Tarot } from '../../../models/special-cards/tarots/tarot';

/**
 * Interface for TarotTooltipContent props.
 */
interface TarotTooltipContentProps {
  tarot: Tarot;
}

/**
 * Tooltip content component for tarot cards.
 * Shows tarot name and description.
 */
export const TarotTooltipContent: React.FC<TarotTooltipContentProps> = ({ tarot }) => {
  return (
    <div className="tooltip-content">
      <div className="tooltip-title">
        {tarot.name}
      </div>
      
      <div className="tooltip-description">
        {tarot.description}
      </div>
    </div>
  );
};
