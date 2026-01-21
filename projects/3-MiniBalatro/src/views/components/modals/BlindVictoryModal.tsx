// ============================================
// FILE: src/views/components/modals/BlindVictoryModal.tsx
// ============================================

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
    <div className="blind-victory-modal-overlay">
      <div className="blind-victory-modal">
        <div className="blind-victory-header">
          <h1 className="blind-victory-title">Blind Cleared!</h1>
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
