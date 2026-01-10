import React from 'react';
import './MainMenu.css';

/**
 * Props for MainMenu component
 */
interface MainMenuProps {
  onNewGame?: () => void;
  onContinue?: () => void;
  onSettings?: () => void;
  hasSavedGame: boolean;
}

/**
 * MainMenu component - displays the main menu screen.
 * Provides options to start, continue, or configure the game.
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onContinue,
  onSettings,
  hasSavedGame,
}) => {
  // TODO: Implement menu interactions
  // TODO: Add animations
  // TODO: Display game stats

  return (
    <div className="main-menu">
      <div className="menu-content">
        <h1 className="game-title">Mini Balatro</h1>
        <p className="game-subtitle">Poker Roguelike</p>

        <div className="menu-buttons">
          <button className="menu-button menu-button--primary" onClick={onNewGame}>
            New Game
          </button>

          {hasSavedGame && (
            <button className="menu-button" onClick={onContinue}>
              Continue
            </button>
          )}

          <button className="menu-button" onClick={onSettings}>
            Settings
          </button>
        </div>

        <div className="menu-footer">
          <p className="version">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};