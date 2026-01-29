/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/views/components/tooltip/JokerTooltipContent.tsx
 * @desc Tooltip content component for joker cards showing name and description
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

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
