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
import { BossBlind } from '../../../models/blinds/boss-blind';
import { BlindGenerator } from '../../../models/blinds/blind-generator';
import { getBossDisplayName, getBossDescription } from '../../../models/blinds/boss-type.enum';
import { GameConfig } from '../../../services/config/game-config';
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
   * Checks if current hand is blocked by The Mouth boss.
   * @returns true if hand won't count for score
   */
  const isHandBlocked = (): boolean => {
    if (!previewScore) return false;
    // If preview shows 0 total despite having a hand type, it's blocked
    return previewScore.total === 0 && previewScore.handType !== undefined && selectedCards.length > 0;
  };

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
  const handlePlayHand = async () => {
    const result = await controller.playSelectedHand();
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

  /**
   * Handles removing a joker.
   * @param jokerId - ID of the joker to remove
   */
  const handleRemoveJoker = (jokerId: string) => {
    controller.removeJoker(jokerId);
    setForceUpdate(prev => prev + 1);
  };

  /**
   * Handles removing a consumable from inventory.
   * @param index - Index of the tarot to remove in the consumables array
   */
  const handleRemoveConsumable = (index: number) => {
    controller.removeConsumableByIndex(index);
    setForceUpdate(prev => prev + 1);
  };

  const currentBlind = gameState.getCurrentBlind();
  const handsRemaining = gameState.getHandsRemaining();
  const discardsRemaining = gameState.getDiscardsRemaining();
  const currentScore = gameState.getAccumulatedScore();
  const goalScore = currentBlind.getScoreGoal();
  const progressPercent = Math.min((currentScore / goalScore) * 100, 100);

  // Check if current blind is a boss blind
  const isBossBlind = currentBlind instanceof BossBlind;
  const bossName = isBossBlind ? getBossDisplayName((currentBlind as BossBlind).getBossType()) : null;
  const bossEffect = isBossBlind ? getBossDescription((currentBlind as BossBlind).getBossType()) : null;

  return (
    <div className="game-board">
      {/* Top Header Bar */}
      <div className="game-board__header">
        <span className="game-board__level">
          Level: {gameState.getLevelNumber()} - {BlindGenerator.getBlindTypeForLevel(gameState.getLevelNumber())} Blind
        </span>
        <span className="game-board__money">Money: ${gameState.getMoney()}</span>
        <span className="game-board__round">Round: {gameState.getRoundNumber()}</span>
        <span className="game-board__deck">Deck: {gameState.getDeck().getRemaining()}/{gameState.getDeck().getMaxDeckSize()} cards</span>
      </div>

      {/* Boss Blind Info (only shown for boss blinds) */}
      {isBossBlind && (
        <div className="game-board__boss-info">
          <div className="boss-info__container">
            <h2 className="boss-info__name">{bossName}</h2>
            <p className="boss-info__effect">{bossEffect}</p>
          </div>
        </div>
      )}

      {/* Special Cards Row */}
      <div className="game-board__special-cards">
        <div className="special-cards-section">
          <h3 className="section-title">Jokers</h3>
          <JokerZone 
            jokers={gameState.getJokers()}
            onRemoveJoker={handleRemoveJoker}
          />
        </div>
        <div className="special-cards-section">
          <h3 className="section-title">Consumables</h3>
          <TarotZone
            consumables={gameState.getConsumables()}
            onUseConsumable={handleUseConsumable}
            onRemoveConsumable={handleRemoveConsumable}
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
          {isHandBlocked() ? (
            <div className="preview-warning">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">
                Hand type "{previewScore.handType?.replace(/_/g, ' ')}" won't count! 
                {isBossBlind && bossName === 'The Mouth' && (
                  <span> Only one hand type allowed for The Mouth!</span>
                )}
              </span>
            </div>
          ) : (
            <>
              <span className="preview-hand-type">
                {previewScore.handType?.replace(/_/g, ' ')}
              </span>
              <span className="preview-calculation">
                {previewScore.chips} chips × {previewScore.mult} mult = {previewScore.total} pts
              </span>
            </>
          )}
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
          <span className="counter">Hands: {handsRemaining}/{GameConfig.MAX_HANDS_PER_BLIND}</span>
          <span className="counter">Discards: {discardsRemaining}/{GameConfig.MAX_DISCARDS_PER_BLIND}</span>
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