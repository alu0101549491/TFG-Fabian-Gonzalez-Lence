// ============================================
// FILE: src/views/App.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import { GameController } from '../controllers/game-controller';
import { GameState } from '../models/game/game-state';
import { MainMenu } from './components/menu/MainMenu';
import { GameBoard } from './components/game-board/GameBoard';
import { ShopView } from './components/shop/ShopView';
import { BlindVictoryModal } from './components/modals/BlindVictoryModal';
import { BlindDefeatModal } from './components/modals/BlindDefeatModal';
import { GameVictoryModal } from './components/modals/GameVictoryModal';
import './App.css';

/**
 * Main application component.
 * Manages global state and routing between screens.
 */
export const App: React.FC = () => {
  const [controller, setController] = useState<GameController | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'shop'>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isInShop, setIsInShop] = useState<boolean>(false);
  const [showBlindVictory, setShowBlindVictory] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<{
    blindLevel: number;
    score: number;
    reward: number;
  } | null>(null);
  const [showBlindDefeat, setShowBlindDefeat] = useState<boolean>(false);
  const [defeatData, setDefeatData] = useState<{
    blindLevel: number;
    roundNumber: number;
    achievedScore: number;
    targetScore: number;
    isBossBlind: boolean;
    bossName?: string;
  } | null>(null);
  const [showGameVictory, setShowGameVictory] = useState<boolean>(false);
  const [gameVictoryScore, setGameVictoryScore] = useState<number>(0);

  // Initialize game controller on mount
  useEffect(() => {
    const newController = new GameController(
      (state) => handleStateChange(state),
      () => handleShopOpen(),
      () => handleShopClose(),
      () => handleVictory(newController),
      () => handleDefeat(),
      undefined, // Boss intro callback (not used currently)
      (blindLevel, score, reward) => handleBlindVictory(blindLevel, score, reward),
      (blindLevel, roundNumber, achievedScore, targetScore, isBossBlind, bossName) =>
        handleBlindDefeat(blindLevel, roundNumber, achievedScore, targetScore, isBossBlind, bossName)
    );
    setController(newController);
    
    // Expose controller globally for debugging (development only)
    if (import.meta.env.DEV) {
      (window as any).gameController = newController;
    }
  }, []);

  /**
   * Handles game state changes from controller.
   * @param state - Updated game state
   */
  const handleStateChange = (state: GameState) => {
    setGameState(state);
    
    // Expose game state globally for debugging (development only)
    if (import.meta.env.DEV) {
      (window as any).gameState = state;
    }
  };

  /**
   * Handles shop opening.
   */
  const handleShopOpen = () => {
    setIsInShop(true);
    setCurrentScreen('game');
  };

  /**
   * Handles shop closing.
   */
  const handleShopClose = () => {
    setIsInShop(false);
  };

  /**
   * Handles game victory.
   */
  const handleVictory = (ctrl: GameController) => {
    console.log('🎉 handleVictory called!');
    if (ctrl) {
      // Get the final score from the controller (stored during blind completion)
      const finalScore = ctrl.getVictoryScore();
      console.log('Final score:', finalScore);
      setGameVictoryScore(finalScore);
      setShowGameVictory(true);
      console.log('Game victory modal should show now');
    } else {
      console.log('ERROR: No controller available');
    }
  };

  /**
   * Handles game defeat.
   */
  const handleDefeat = () => {
    // alert('Game Over! You lost.');
    setCurrentScreen('menu');
  };

  /**
   * Handles blind victory (shows modal).
   */
  const handleBlindVictory = (blindLevel: number, score: number, reward: number) => {
    setVictoryData({ blindLevel, score, reward });
    setShowBlindVictory(true);
  };

  /**
   * Handles continuing from blind victory modal to shop.
   */
  const handleContinueToShop = async () => {
    if (controller) {
      setShowBlindVictory(false);
      await controller.confirmBlindVictory();
    }
  };

  /**
   * Handles blind defeat (shows modal).
   */
  const handleBlindDefeat = (
    blindLevel: number,
    roundNumber: number,
    achievedScore: number,
    targetScore: number,
    isBossBlind: boolean,
    bossName?: string
  ) => {
    setDefeatData({
      blindLevel,
      roundNumber,
      achievedScore,
      targetScore,
      isBossBlind,
      bossName
    });
    setShowBlindDefeat(true);
  };

  /**
   * Handles returning to menu from defeat modal.
   */
  const handleReturnToMenu = () => {
    if (controller) {
      setShowBlindDefeat(false);
      controller.confirmBlindDefeat();
      // The onDefeat callback will trigger and change the screen
    }
  };

  /**
   * Starts a new game.
   */
  const handleStartNewGame = () => {
    if (controller) {
      controller.startNewGame();
      setCurrentScreen('game');
    }
  };

  /**
   * Continues a saved game.
   */
  const handleContinueGame = async () => {
    if (controller) {
      const success = await controller.continueGame();
      if (success) {
        setCurrentScreen('game');
      } else {
        alert('No saved game found.');
      }
    }
  };

  /**
   * Handles returning to menu from game victory modal.
   */
  const handleGameVictoryReturnToMenu = () => {
    setShowGameVictory(false);
    setCurrentScreen('menu');
  };

  return (
    <div className="app">
      {currentScreen === 'menu' && controller && (
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          hasSavedGame={controller.hasSavedGame()}
        />
      )}
      {currentScreen === 'game' && controller && gameState && !isInShop && (
        <GameBoard
          controller={controller}
          gameState={gameState}
        />
      )}
      {currentScreen === 'game' && controller && gameState && isInShop && (
        <ShopView
          controller={controller}
          shop={controller.getShop()}
          playerMoney={gameState.getMoney()}
        />
      )}
      {showBlindVictory && victoryData && (
        <BlindVictoryModal
          blindLevel={victoryData.blindLevel}
          finalScore={victoryData.score}
          moneyReward={victoryData.reward}
          onContinue={handleContinueToShop}
        />
      )}
      {showBlindDefeat && defeatData && (
        <BlindDefeatModal
          blindLevel={defeatData.blindLevel}
          roundNumber={defeatData.roundNumber}
          achievedScore={defeatData.achievedScore}
          targetScore={defeatData.targetScore}
          isBossBlind={defeatData.isBossBlind}
          bossName={defeatData.bossName}
          onReturnToMenu={handleReturnToMenu}
        />
      )}
      {showGameVictory && (
        <GameVictoryModal
          finalScore={gameVictoryScore}
          onReturnToMenu={handleGameVictoryReturnToMenu}
        />
      )}
    </div>
  );
};
