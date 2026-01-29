/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/views/components/score-display/ScoreDisplay.tsx
 * @desc Score information panel component showing current score, goal, and preview
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import React from 'react';
import './ScoreDisplay.css';

/**
 * Interface for ScoreDisplay component props.
 */
interface ScoreDisplayProps {
  currentScore: number;
  goalScore: number;
  previewScore: { chips: number; mult: number; total: number } | null;
}

/**
 * Score information panel component.
 * Shows current score, goal, and preview.
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  currentScore,
  goalScore,
  previewScore
}) => {
  /**
   * Calculates progress percentage.
   * @returns Percentage (0-100)
   */
  const calculateProgress = (): number => {
    return Math.min(100, (currentScore / goalScore) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="score-display">
      <div className="goal-section">
        <h3>Goal: {goalScore} pts</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="score-text">
          Score: {currentScore} pts ({progress.toFixed(1)}%)
        </div>
      </div>

      {previewScore && (
        <div className="preview-section">
          <h4>Preview:</h4>
          <div className="preview-breakdown">
            <span className="chips">{previewScore.chips} chips</span>
            <span className="multiply">×</span>
            <span className="mult">{previewScore.mult} mult</span>
            <span className="equals">=</span>
            <span className="total">{previewScore.total} pts</span>
          </div>
        </div>
      )}
    </div>
  );
};