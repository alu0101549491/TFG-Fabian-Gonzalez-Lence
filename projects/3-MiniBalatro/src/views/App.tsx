// ============================================
// FILE: src/views/App.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import { GameController } from '../controllers/game-controller';
import { GameState } from '../models/game/game-state';
import { MainMenu } from './components/menu/MainMenu';
import { GameBoard } from './components/game-board/GameBoard';
import { ShopView } from './components/shop/ShopView';
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

  // Initialize controller on mount
  useEffect(() => {
    const newController = new GameController(
      (state) => handleStateChange(state),
      () => handleShopOpen(),
      () => handleShopClose(),
      () => handleVictory(),
      () => handleDefeat()
    );
    setController(newController);
  }, []);

  /**
   * Handles game state changes from controller.
   * @param state - Updated game state
   */
  const handleStateChange = (state: GameState) => {
    setGameState(state);
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
  const handleVictory = () => {
    alert('Congratulations! You won the game!');
    setCurrentScreen('menu');
  };

  /**
   * Handles game defeat.
   */
  const handleDefeat = () => {
    alert('Game Over! You lost.');
    setCurrentScreen('menu');
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
  const handleContinueGame = () => {
    if (controller) {
      const success = controller.continueGame();
      if (success) {
        setCurrentScreen('game');
      } else {
        alert('No saved game found.');
      }
    }
  };

  /**
   * Returns to main menu.
   */
  const handleReturnToMenu = () => {
    setCurrentScreen('menu');
  };

  return (
    <div className="app">
      {currentScreen === 'menu' && controller && (
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          hasSavedGame={controller.gamePersistence.hasSavedGame()}
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
    </div>
  );
};
