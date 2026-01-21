// ============================================
// FILE: src/views/components/modals/BlindDefeatModal.tsx
// ============================================

import React from 'react';
import './BlindDefeatModal.css';

/**
 * Props for BlindDefeatModal component.
 */
interface BlindDefeatModalProps {
  /** The blind level where defeat occurred */
  blindLevel: number;
  /** The round number where defeat occurred */
  roundNumber: number;
  /** The score achieved before defeat */
  achievedScore: number;
  /** The target score that was needed */
  targetScore: number;
  /** Whether the blind was a boss blind */
  isBossBlind: boolean;
  /** The name of the boss blind (if applicable) */
  bossName?: string;
  /** Callback when user clicks return to menu */
  onReturnToMenu: () => void;
}

/**
 * Modal displayed when player fails to complete a blind.
 * Shows defeat message, level/boss info, round, score comparison, and return button.
 */
export const BlindDefeatModal: React.FC<BlindDefeatModalProps> = ({
  blindLevel,
  roundNumber,
  achievedScore,
  targetScore,
  isBossBlind,
  bossName,
  onReturnToMenu
}) => {
  return (
    <div className="blind-defeat-modal-overlay">
      <div className="blind-defeat-modal">
        <div className="blind-defeat-header">
          <h1 className="blind-defeat-title">Defeat!</h1>
          {isBossBlind && bossName ? (
            <p className="blind-defeat-level">Lost to {bossName}</p>
          ) : (
            <p className="blind-defeat-level">Level {blindLevel}</p>
          )}
          <p className="blind-defeat-round">Round {roundNumber}</p>
        </div>

        <div className="blind-defeat-content">
          <div className="blind-defeat-stat">
            <span className="blind-defeat-stat-label">Your Score:</span>
            <span className="blind-defeat-stat-value">{achievedScore.toLocaleString()}</span>
          </div>

          <div className="blind-defeat-stat target">
            <span className="blind-defeat-stat-label">Target Score:</span>
            <span className="blind-defeat-stat-value">{targetScore.toLocaleString()}</span>
          </div>

          <div className="blind-defeat-difference">
            <span className="blind-defeat-difference-text">
              {(targetScore - achievedScore).toLocaleString()} points short
            </span>
          </div>
        </div>

        <button 
          className="blind-defeat-return-btn"
          onClick={onReturnToMenu}
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
