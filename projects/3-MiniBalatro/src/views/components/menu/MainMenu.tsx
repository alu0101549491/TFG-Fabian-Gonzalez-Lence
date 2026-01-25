// ============================================
// FILE: src/views/components/menu/MainMenu.tsx
// ============================================

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
