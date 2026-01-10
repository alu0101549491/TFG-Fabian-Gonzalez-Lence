import React from 'react';
import {HandType} from '@models/poker/hand-type.enum';
import {HAND_TYPE_NAMES} from '@utils/constants';
import './ScoreDisplay.css';

/**
 * Props for ScoreDisplay component
 */
interface ScoreDisplayProps {
  currentScore: number;
  targetScore: number;
  chips: number;
  mult: number;
  handsRemaining: number;
  discardsRemaining: number;
  currentHandType?: HandType;
  money: number;
}

/**
 * ScoreDisplay component - shows current scoring information.
 * Displays score progress, hand type, and remaining resources.
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  currentScore,
  targetScore,
  chips,
  mult,
  handsRemaining,
  discardsRemaining,
  currentHandType,
  money,
}) => {
  // TODO: Implement score display
  // TODO: Add progress bar
  // TODO: Animate score changes

  const progress = Math.min((currentScore / targetScore) * 100, 100);

  return (
    <div className="score-display">
      <div className="score-main">
        <div className="score-values">
          <div className="score-item score-item--chips">
            <span className="score-label">Chips</span>
            <span className="score-value">{chips}</span>
          </div>
          <div className="score-operator">×</div>
          <div className="score-item score-item--mult">
            <span className="score-label">Mult</span>
            <span className="score-value">{mult}</span>
          </div>
          <div className="score-operator">=</div>
          <div className="score-item score-item--total">
            <span className="score-label">Score</span>
            <span className="score-value">{currentScore}</span>
          </div>
        </div>

        <div className="score-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{width: `${progress}%`}}
            />
          </div>
          <div className="progress-text">
            {currentScore} / {targetScore}
          </div>
        </div>
      </div>

      <div className="score-info">
        <div className="info-group">
          {currentHandType && (
            <div className="hand-type">
              {HAND_TYPE_NAMES[currentHandType]}
            </div>
          )}
        </div>

        <div className="info-group">
          <div className="resource">
            <span className="resource-label">Hands:</span>
            <span className="resource-value">{handsRemaining}</span>
          </div>
          <div className="resource">
            <span className="resource-label">Discards:</span>
            <span className="resource-value">{discardsRemaining}</span>
          </div>
          <div className="resource resource--money">
            <span className="resource-label">$</span>
            <span className="resource-value">{money}</span>
          </div>
        </div>
      </div>
    </div>
  );
};