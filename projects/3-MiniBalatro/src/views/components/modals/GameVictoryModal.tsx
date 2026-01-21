// ============================================
// FILE: src/views/components/modals/GameVictoryModal.tsx
// ============================================

import React from 'react';
import './GameVictoryModal.css';

/**
 * Props for GameVictoryModal component.
 */
interface GameVictoryModalProps {
  /** The final score achieved in the last blind */
  finalScore: number;
  /** Callback when user clicks return to menu */
  onReturnToMenu: () => void;
}

/**
 * Modal displayed when player wins the entire game (completes Round 8).
 * Shows victory message and only allows returning to main menu.
 */
export const GameVictoryModal: React.FC<GameVictoryModalProps> = ({
  finalScore,
  onReturnToMenu
}) => {
  return (
    <div className="game-victory-modal-overlay">
      <div className="game-victory-modal">
        <div className="game-victory-header">
          <h1 className="game-victory-title">🎉 Victory! 🎉</h1>
          <p className="game-victory-subtitle">You've conquered all 8 rounds!</p>
        </div>

        <div className="game-victory-content">
          <div className="game-victory-message">
            <p>Congratulations! You've mastered Mini Balatro!</p>
          </div>

          <div className="game-victory-stat">
            <span className="game-victory-stat-label">Final Boss Score:</span>
            <span className="game-victory-stat-value">{finalScore.toLocaleString()}</span>
          </div>

          <div className="game-victory-achievement">
            <div className="game-victory-trophy">🏆</div>
            <p className="game-victory-achievement-text">Game Completed</p>
          </div>
        </div>

        <button 
          className="game-victory-menu-btn"
          onClick={onReturnToMenu}
        >
          Return to Main Menu
        </button>
      </div>
    </div>
  );
};
