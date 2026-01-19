// ============================================
// FILE: src/views/components/game-board/GameBoard.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import { GameController } from '../../../controllers/game-controller';
import { GameState } from '../../../models/game/game-state';
import { Hand } from '../hand/Hand';
import { JokerZone } from '../joker-zone/JokerZone';
import { TarotZone } from '../tarot-zone/TarotZone';
import { HandInfoPanel } from '../hand-info-panel/HandInfoPanel';
import { Card } from '../../../models/core/card';
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
 * Coordinates all game UI elements in a horizontal layout.
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  controller,
  gameState
}) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [previewScore, setPreviewScore] = useState<{chips: number, mult: number, total: number, handType?: string} | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isHandInfoOpen, setIsHandInfoOpen] = useState(false);

  // Update selected cards when game state changes
  useEffect(() => {
    setSelectedCards([...gameState.getSelectedCards()]);
  }, [gameState, forceUpdate]);

  // Calculate preview score when selection changes
  useEffect(() => {
    if (selectedCards.length > 0) {
      try {
        const preview = controller.getPreviewScore();
        if (preview) {
          setPreviewScore({
            chips: preview.chips,
            mult: preview.mult,
            total: preview.totalScore,
            handType: preview.handType
          });
        } else {
          setPreviewScore(null);
        }
      } catch (error) {
        console.error('Error calculating preview:', error);
        setPreviewScore(null);
      }
    } else {
      setPreviewScore(null);
    }
  }, [selectedCards, controller]);

  /**
   * Handles card selection.
   * @param cardId - ID of card to select/deselect
   */
  const handleSelectCard = (cardId: string) => {
    console.log('Card selected:', cardId);
    controller.selectCard(cardId);
    // Force component to update with new selection
    setForceUpdate(prev => prev + 1);
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
    // Clear selection and force update to show new cards
    setSelectedCards([]);
    setForceUpdate(prev => prev + 1);
  };

  /**
   * Handles discarding selected cards.
   */
  const handleDiscard = () => {
    controller.discardSelected();
    // Clear selection and force update to show new cards
    setSelectedCards([]);
    setForceUpdate(prev => prev + 1);
  };

  /**
   * Handles using a consumable/tarot card.
   * @param tarotId - ID of the tarot card to use
   * @param targetId - Optional ID of the target card
   */
  const handleUseConsumable = (tarotId: string, targetId?: string) => {
    controller.useConsumable(tarotId, targetId);
    // Clear selection and force update to reflect changes immediately
    setSelectedCards([]);
    setForceUpdate(prev => prev + 1);
  };

  const currentBlind = gameState.getCurrentBlind();
  const handsRemaining = gameState.getHandsRemaining();
  const discardsRemaining = gameState.getDiscardsRemaining();
  const currentScore = gameState.getAccumulatedScore();
  const goalScore = currentBlind.getScoreGoal();
  const progressPercent = Math.min((currentScore / goalScore) * 100, 100);
  const deckRemaining = gameState.getDeckRemaining();

  return (
    <div className="game-board">
      {/* Top Header Bar */}
      <div className="game-board__header">
        <span className="game-board__level">
          Level: {gameState.getLevelNumber()} - {currentBlind.constructor.name.replace('Blind', ' Blind')}
        </span>
        <span className="game-board__money">Money: ${gameState.getMoney()}</span>
        <span className="game-board__round">Round: {gameState.getRoundNumber()}</span>
        <span className="game-board__deck">Deck: {deckRemaining} cards</span>
      </div>

      {/* Special Cards Row */}
      <div className="game-board__special-cards">
        <div className="special-cards-section">
          <h3 className="section-title">Jokers</h3>
          <JokerZone jokers={gameState.getJokers()} />
        </div>
        <div className="special-cards-section">
          <h3 className="section-title">Consumables</h3>
          <TarotZone
            consumables={gameState.getConsumables()}
            onUseConsumable={handleUseConsumable}
            selectedCardIds={selectedCards.map(card => card.getId())}
          />
        </div>
      </div>

      {/* Score Goal Section */}
      <div className="game-board__goal">
        <h3 className="goal-title">Goal: {goalScore} pts</h3>
        <div className="goal-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-text">
            Accumulated: {currentScore} pts ({Math.floor(progressPercent)}%)
          </span>
        </div>
      </div>

      {/* Hand Display Area */}
      <div className="game-board__hand-area">
        <div className="hand-label">
          Current hand ({selectedCards.length} selected):
        </div>
        <Hand
          key={`hand-${forceUpdate}-${gameState.getCurrentHand().length}`}
          cards={gameState.getCurrentHand()}
          selectedCards={selectedCards}
          onSelectCard={handleSelectCard}
        />
      </div>

      {/* Preview Score */}
      {previewScore && (
        <div className="game-board__preview">
          <span className="preview-hand-type">
            {previewScore.handType?.replace(/_/g, ' ')}
          </span>
          <span className="preview-calculation">
            {previewScore.chips} chips × {previewScore.mult} mult = {previewScore.total} pts
          </span>
        </div>
      )}

      {/* Action Buttons and Counters */}
      <div className="game-board__actions">
        <div className="action-buttons">
          <button
            className="action-button action-button--play"
            onClick={handlePlayHand}
            disabled={selectedCards.length === 0 || handsRemaining === 0}
          >
            Play Hand
          </button>
          <button
            className="action-button action-button--discard"
            onClick={handleDiscard}
            disabled={selectedCards.length === 0 || discardsRemaining === 0}
          >
            Discard
          </button>
          <button
            className="action-button action-button--info"
            onClick={() => setIsHandInfoOpen(true)}
          >
            📊 Hand Info
          </button>
        </div>
        <div className="counters">
          <span className="counter">Hands: {handsRemaining}/3</span>
          <span className="counter">Discards: {discardsRemaining}/3</span>
        </div>
      </div>

      {/* Hand Info Panel */}
      <HandInfoPanel
        upgradeManager={gameState.getUpgradeManager()}
        isOpen={isHandInfoOpen}
        onClose={() => setIsHandInfoOpen(false)}
      />
    </div>
  );
};