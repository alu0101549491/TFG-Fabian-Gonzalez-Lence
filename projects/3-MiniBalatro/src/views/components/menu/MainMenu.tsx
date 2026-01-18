// ============================================
// FILE: src/views/components/menu/MainMenu.tsx
// ============================================

import React from 'react';
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
 * Displays game start options.
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
  hasSavedGame
}) => {
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
        <button className="menu-button">
          Help
        </button>
      </div>
    </div>
  );
};