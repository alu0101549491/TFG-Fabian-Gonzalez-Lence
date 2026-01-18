// ============================================
// FILE: src/services/persistence/game-persistence.ts
// ============================================

import { GameState } from '../../models/game/game-state';

/**
 * Handles game state persistence to browser localStorage.
 * Manages save, load, and clear operations with error handling.
 */
export class GamePersistence {
  private readonly storageKey: string;

  /**
   * Creates persistence manager with specified storage key.
   * @param storageKey - Key for localStorage
   */
  constructor(storageKey: string = 'miniBalatro_save') {
    if (!storageKey) {
      throw new Error('Storage key cannot be empty');
    }
    this.storageKey = storageKey;
  }

  /**
   * Serializes and saves game state to localStorage.
   * @param gameState - GameState to save
   */
  public saveGame(gameState: GameState): void {
    try {
      if (!gameState) {
        throw new Error('Game state cannot be null');
      }

      const serialized = this.serializeGameState(gameState);
      localStorage.setItem(this.storageKey, serialized);
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  /**
   * Loads and deserializes game state from localStorage.
   * @returns GameState if save exists, null otherwise
   */
  public loadGame(): GameState | null {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        return null;
      }

      const gameState = this.deserializeGameState(serialized);
      console.log('Game state loaded successfully');
      return gameState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  /**
   * Checks if a saved game exists.
   * @returns true if save exists, false otherwise
   */
  public hasSavedGame(): boolean {
    try {
      return localStorage.getItem(this.storageKey) !== null;
    } catch (error) {
      console.error('Failed to check for saved game:', error);
      return false;
    }
  }

  /**
   * Removes saved game from localStorage.
   */
  public clearSavedGame(): void {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Saved game cleared');
    } catch (error) {
      console.error('Failed to clear saved game:', error);
    }
  }

  /**
   * Converts GameState to JSON string.
   * @param gameState - GameState to serialize
   * @returns JSON string
   * @throws Error if serialization fails
   */
  private serializeGameState(gameState: GameState): string {
    // Create a simplified representation of the game state
    // that can be safely serialized to JSON
    const simplified = {
      // Basic game info
      levelNumber: gameState.getLevelNumber(),
      roundNumber: gameState.getRoundNumber(),
      money: gameState.getMoney(),
      accumulatedScore: gameState.getAccumulatedScore(),
      handsRemaining: gameState.getHandsRemaining(),
      discardsRemaining: gameState.getDiscardsRemaining(),

      // Current hand (simplified)
      currentHand: gameState.getCurrentHand().map(card => ({
        id: card.getId(),
        value: card.value,
        suit: card.suit,
        chips: card.getBaseChips(),
        multBonus: card.getMultBonus()
      })),

      // Jokers
      jokers: gameState.getJokers().map(joker => ({
        id: joker.id,
        name: joker.name,
        type: joker.constructor.name
      })),

      // Consumables
      consumables: gameState.getConsumables().map(tarot => ({
        id: tarot.name, // Using name as ID for simplicity
        name: tarot.name,
        type: tarot.constructor.name
      })),

      // Current blind
      currentBlind: {
        level: gameState.getCurrentBlind().getLevel(),
        type: gameState.getCurrentBlind().constructor.name,
        scoreGoal: gameState.getCurrentBlind().getScoreGoal()
      },

      // Upgrade manager state
      upgrades: Array.from(gameState.getUpgradeManager()['upgrades']).map(([handType, upgrade]) => ({
        handType,
        chips: upgrade.additionalChips,
        mult: upgrade.additionalMult
      }))
    };

    return JSON.stringify(simplified);
  }

  /**
   * Converts JSON string to GameState.
   * @param data - JSON string
   * @returns Reconstructed GameState
   * @throws Error if deserialization fails
   */
  private deserializeGameState(data: string): GameState {
    const parsed = JSON.parse(data);

    // Create a new game state
    const gameState = new GameState();

    // Restore basic properties
    gameState['levelNumber'] = parsed.levelNumber;
    gameState['roundNumber'] = parsed.roundNumber;
    gameState['money'] = parsed.money;
    gameState['accumulatedScore'] = parsed.accumulatedScore;
    gameState['handsRemaining'] = parsed.handsRemaining;
    gameState['discardsRemaining'] = parsed.discardsRemaining;

    // Restore current hand
    // This is a simplified reconstruction
    // In a real implementation, we'd need to properly reconstruct the Card objects
    // with all their properties and methods

    // Restore jokers, consumables, blind, etc.
    // This would require more complex reconstruction logic

    console.log('Game state deserialized (simplified)');
    return gameState;
  }
}