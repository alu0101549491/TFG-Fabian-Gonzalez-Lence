/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/views/components/modals/BlindDefeatModal.tsx
 * @desc Modal for blind defeat displaying level/boss info, round, score comparison, and return button
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

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
    <div className="blind-defeat-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="defeat-title">
      <div className="blind-defeat-modal">
        <div className="blind-defeat-header">
          <h1 id="defeat-title" className="blind-defeat-title">Defeat!</h1>
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
