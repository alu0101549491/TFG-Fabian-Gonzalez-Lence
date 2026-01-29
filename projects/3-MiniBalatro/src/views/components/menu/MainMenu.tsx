/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/views/components/menu/MainMenu.tsx
 * @desc Main menu screen component displaying game start options and help modal
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import React, { useState } from 'react';
import { HelpModal } from '../modals/HelpModal';
import './MainMenu.css';

/**
 * Interface for MainMenu component props.
 */
interface MainMenuProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  hasSavedGame: boolean;
}

/**
 * Main menu screen component.
 * Displays game start options and help modal.
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
  hasSavedGame
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="main-menu">
      <h1 className="game-title">Mini Balatro</h1>
      <div className="menu-buttons">
        <button
          className="menu-button"
          onClick={onStartNewGame}
        >
          New Game
        </button>
        <button
          className="menu-button"
          onClick={onContinueGame}
          disabled={!hasSavedGame}
        >
          Continue
        </button>
        <button 
          className="menu-button"
          onClick={() => setShowHelp(true)}
        >
          How To Play
        </button>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};
