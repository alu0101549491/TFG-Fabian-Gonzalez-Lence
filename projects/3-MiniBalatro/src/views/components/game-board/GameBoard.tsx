// ============================================
// FILE: src/views/components/game-board/GameBoard.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import { GameController } from '../../../controllers/game-controller';
import { GameState } from '../../../models/game/game-state';
import { Hand } from '../hand/Hand';
import { JokerZone } from '../joker-zone/JokerZone';
import { TarotZone } from '../tarot-zone/TarotZone';
import { ScoreDisplay } from '../score-display/ScoreDisplay';
import { Card } from '../../../models/core/card';
import { ScoreResult } from '../../../models/scoring/score-result';
import './GameBoard.css';

/**
 * Interface for GameBoard component props.
 */
interface GameBoardProps {
  controller: GameController;
  gameState: GameState;
}

/**
 * Main game board container component.
 * Coordinates all game UI elements.
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  controller,
  gameState
}) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [previewScore, setPreviewScore] = useState<{chips: number, mult: number, total: number} | null>(null);

  // Update selected cards when game state changes
  useEffect(() => {
    setSelectedCards(gameState.getSelectedCards());
  }, [gameState]);

  /**
   * Handles card selection.
   * @param cardId - ID of card to select/deselect
   */
  const handleSelectCard = (cardId: string) => {
    controller.selectCard(cardId);
  };

  /**
   * Handles playing the selected hand.
   */
  const handlePlayHand = () => {
    const result = controller.playSelectedHand();
    // Update preview score based on result
    if (result) {
      setPreviewScore({
        chips: result.chips,
        mult: result.mult,
        total: result.totalScore
      });
    }
  };

  /**
   * Handles discarding selected cards.
   */
  const handleDiscard = () => {
    controller.discardSelected();
  };

  /**
   * Calculates preview score for selected cards.
   */
  const calculatePreviewScore = () => {
    if (selectedCards.length === 0) return null;

    // This is a simplified preview - in a real implementation,
    // we would use the score calculator to get an accurate preview
    const baseChips = selectedCards.reduce((sum, card) => sum + card.getBaseChips(), 0);
    const baseMult = 1; // Simplified for preview

    return {
      chips: baseChips,
      mult: baseMult,
      total: baseChips * baseMult
    };
  };

  const currentBlind = gameState.getCurrentBlind();
  const handsRemaining = gameState.getHandsRemaining();
  const discardsRemaining = gameState.getDiscardsRemaining();

  return (
    <div className="game-board">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="level-info">
          Level: {gameState.getLevelNumber()} - {currentBlind.constructor.name}
        </div>
        <div className="money">Money: ${gameState.getMoney()}</div>
        <div className="round-info">Round: {gameState.getRoundNumber()}</div>
      </div>

      {/* Joker Zone */}
      <JokerZone
        jokers={gameState.getJokers()}
      />

      {/* Tarot Zone */}
      <TarotZone
        consumables={gameState.getConsumables()}
        onUseConsumable={(tarotId, targetId) => controller.useConsumable(tarotId, targetId)}
      />

      {/* Score Display */}
      <ScoreDisplay
        currentScore={gameState.getAccumulatedScore()}
        goalScore={currentBlind.getScoreGoal()}
        previewScore={previewScore}
      />

      {/* Hand Display */}
      <Hand
        cards={gameState.getCurrentHand()}
        selectedCards={selectedCards}
        onSelectCard={handleSelectCard}
      />

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-button"
          onClick={handlePlayHand}
          disabled={selectedCards.length === 0 || handsRemaining === 0}
        >
          Play Hand
        </button>
        <button
          className="action-button"
          onClick={handleDiscard}
          disabled={selectedCards.length === 0 || discardsRemaining === 0}
        >
          Discard
        </button>
      </div>

      {/* Counters */}
      <div className="counters">
        <div className="counter">Hands: {handsRemaining}/3</div>
        <div className="counter">Discards: {discardsRemaining}/3</div>
      </div>
    </div>
  );
};