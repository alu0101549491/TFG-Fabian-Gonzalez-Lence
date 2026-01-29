/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/views/components/modals/BlindVictoryModal.tsx
 * @desc Modal for blind victory showing completion message, score, rewards, and button to proceed to shop
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import React from 'react';
import './BlindVictoryModal.css';

/**
 * Props for BlindVictoryModal component.
 */
interface BlindVictoryModalProps {
  /** The blind level that was completed */
  blindLevel: number;
  /** The final score achieved */
  finalScore: number;
  /** The money reward earned */
  moneyReward: number;
  /** Callback when user clicks continue to shop */
  onContinue: () => void;
}

/**
 * Modal displayed when player successfully completes a blind.
 * Shows completion message, score, rewards, and button to proceed to shop.
 */
export const BlindVictoryModal: React.FC<BlindVictoryModalProps> = ({
  blindLevel,
  finalScore,
  moneyReward,
  onContinue
}) => {
  return (
    <div className="blind-victory-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="victory-title">
      <div className="blind-victory-modal">
        <div className="blind-victory-header">
          <h1 id="victory-title" className="blind-victory-title">Blind Cleared!</h1>
          <p className="blind-victory-level">Level {blindLevel}</p>
        </div>

        <div className="blind-victory-content">
          <div className="blind-victory-stat">
            <span className="blind-victory-stat-label">Final Score:</span>
            <span className="blind-victory-stat-value">{finalScore.toLocaleString()}</span>
          </div>

          <div className="blind-victory-stat reward">
            <span className="blind-victory-stat-label">Reward:</span>
            <span className="blind-victory-stat-value">+${moneyReward}</span>
          </div>
        </div>

        <button 
          className="blind-victory-continue-btn"
          onClick={onContinue}
        >
          Continue to Shop
        </button>
      </div>
    </div>
  );
};
