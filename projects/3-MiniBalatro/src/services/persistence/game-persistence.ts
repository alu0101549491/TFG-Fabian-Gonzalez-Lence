// ============================================
// FILE: src/services/persistence/game-persistence.ts
// ============================================

import { GameState } from '../../models/game/game-state';
import { Card } from '../../models/core/card';
import { BalancingConfig } from '../config/balancing-config';
import { ShopItemGenerator } from '../shop/shop-item-generator';
import { SmallBlind } from '../../models/blinds/small-blind';
import { BigBlind } from '../../models/blinds/big-blind';
import { BossBlind } from '../../models/blinds/boss-blind';
import { BossType } from '../../models/blinds/boss-type.enum';

/**
 * Handles game state persistence to browser localStorage.
 * Manages save, load, and clear operations with error handling.
 */
export class GamePersistence {
  private readonly storageKey: string;
  private readonly controllerStateKey: string;
  private itemGenerator: ShopItemGenerator;
  private balancingConfig: BalancingConfig;

  /**
   * Creates persistence manager with specified storage key.
   * @param storageKey - Key for localStorage
   */
  constructor(storageKey: string = 'miniBalatro_save') {
    if (!storageKey) {
      throw new Error('Storage key cannot be empty');
    }
    this.storageKey = storageKey;
    this.controllerStateKey = `${storageKey}_controller`;
    this.itemGenerator = new ShopItemGenerator();
    this.balancingConfig = new BalancingConfig();
    // Initialize async loading
    this.balancingConfig.initializeAsync().catch(error => {
      console.error('Failed to load balancing config for persistence:', error);
    });
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
      localStorage.removeItem(this.controllerStateKey);
      console.log('Saved game cleared');
    } catch (error) {
      console.error('Failed to clear saved game:', error);
    }
  }

  /**
   * Saves controller state (isInShop flag and blind victory state).
   * @param isInShop - Whether player is currently in shop
   * @param victoryState - Optional victory state information
   */
  public saveControllerState(
    isInShop: boolean,
    victoryState?: {
      isPending: boolean;
      score: number;
      reward: number;
      blindLevel: number;
    }
  ): void {
    try {
      const controllerState = {
        isInShop,
        victoryState: victoryState || { isPending: false, score: 0, reward: 0, blindLevel: 0 }
      };
      localStorage.setItem(this.controllerStateKey, JSON.stringify(controllerState));
      console.log(`Controller state saved: isInShop=${isInShop}, pendingVictory=${victoryState?.isPending || false}`);
    } catch (error) {
      console.error('Failed to save controller state:', error);
    }
  }

  /**
   * Loads controller state.
   * @returns Object with isInShop flag and victory state, or null if not found
   */
  public loadControllerState(): {
    isInShop: boolean;
    victoryState: {
      isPending: boolean;
      score: number;
      reward: number;
      blindLevel: number;
    };
  } | null {
    try {
      const serialized = localStorage.getItem(this.controllerStateKey);
      if (!serialized) {
        return null;
      }
      const parsed = JSON.parse(serialized);
      const result = {
        isInShop: parsed.isInShop || false,
        victoryState: parsed.victoryState || { isPending: false, score: 0, reward: 0, blindLevel: 0 }
      };
      console.log(`Controller state loaded: isInShop=${result.isInShop}, pendingVictory=${result.victoryState.isPending}`);
      return result;
    } catch (error) {
      console.error('Failed to load controller state:', error);
      return null;
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
    const deck = gameState.getDeck();
    
    const simplified = {
      // Basic game info
      levelNumber: gameState.getLevelNumber(),
      roundNumber: gameState.getRoundNumber(),
      money: gameState.getMoney(),
      accumulatedScore: gameState.getAccumulatedScore(),
      handsRemaining: gameState.getHandsRemaining(),
      discardsRemaining: gameState.getDiscardsRemaining(),

      // Deck state
      deckCards: deck.getCards().map(card => ({
        value: card.value,
        suit: card.suit,
        chips: card.getBaseChips(),
        multBonus: card.getMultBonus()
      })),
      discardPile: deck.getDiscardPile().map(card => ({
        value: card.value,
        suit: card.suit,
        chips: card.getBaseChips(),
        multBonus: card.getMultBonus()
      })),
      maxDeckSize: deck.getMaxDeckSize(),  // Save maximum deck size

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
        id: tarot.id,
        name: tarot.name,
        description: tarot.description,
        type: tarot.constructor.name
      })),

      // Current blind
      currentBlind: {
        level: gameState.getCurrentBlind().getLevel(),
        roundNumber: gameState.getRoundNumber(),
        type: gameState.getCurrentBlind().constructor.name,
        scoreGoal: gameState.getCurrentBlind().getScoreGoal(),
        // Save boss type if this is a boss blind
        bossType: gameState.getCurrentBlind() instanceof BossBlind 
          ? (gameState.getCurrentBlind() as BossBlind).getBossType() 
          : undefined,
        // Save The Mouth's locked hand type if it has been set
        lockedHandType: gameState.getCurrentBlind() instanceof BossBlind 
          ? (gameState.getCurrentBlind() as BossBlind).getModifier().allowedHandTypes?.[0]
          : undefined
      },

      // Upgrade manager state
      upgrades: Array.from(gameState.getUpgradeManager()['upgrades']).map(([handType, upgrade]) => ({
        handType,
        chips: upgrade.additionalChips,
        mult: upgrade.additionalMult,
        level: upgrade.level
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

    // Restore deck state
    if (parsed.deckCards && Array.isArray(parsed.deckCards) && parsed.discardPile && Array.isArray(parsed.discardPile)) {
      const deckCards = parsed.deckCards.map((cardData: any) => {
        const card = new Card(cardData.value, cardData.suit);
        if (cardData.chips || cardData.multBonus) {
          const baseChips = card.getBaseChips();
          const chipBonus = (cardData.chips || 0) - baseChips;
          if (chipBonus > 0 || cardData.multBonus > 0) {
            card.addPermanentBonus(Math.max(0, chipBonus), cardData.multBonus || 0);
          }
        }
        return card;
      });

      const discardPileCards = parsed.discardPile.map((cardData: any) => {
        const card = new Card(cardData.value, cardData.suit);
        if (cardData.chips || cardData.multBonus) {
          const baseChips = card.getBaseChips();
          const chipBonus = (cardData.chips || 0) - baseChips;
          if (chipBonus > 0 || cardData.multBonus > 0) {
            card.addPermanentBonus(Math.max(0, chipBonus), cardData.multBonus || 0);
          }
        }
        return card;
      });

      const deck = gameState.getDeck();
      deck.setState(deckCards, discardPileCards, parsed.maxDeckSize);
      console.log(`Restored deck: ${deckCards.length} cards in deck, ${discardPileCards.length} in discard pile, max: ${parsed.maxDeckSize || 'not saved (defaulting to current total)'}`);
    }

    // Restore current hand by reconstructing Card objects
    if (parsed.currentHand && Array.isArray(parsed.currentHand)) {
      const restoredHand = parsed.currentHand.map((cardData: any) => {
        const card = new Card(cardData.value, cardData.suit);
        // Note: Card IDs will be regenerated (UUID), but value/suit are preserved
        // Restore bonuses if they exist
        if (cardData.chips || cardData.multBonus) {
          const baseChips = card.getBaseChips();
          const chipBonus = (cardData.chips || 0) - baseChips;
          if (chipBonus > 0 || cardData.multBonus > 0) {
            card.addPermanentBonus(Math.max(0, chipBonus), cardData.multBonus || 0);
          }
        }
        return card;
      });
      gameState['currentHand'] = restoredHand;
      console.log(`Restored hand with ${restoredHand.length} cards`);
    }

    // Restore upgrade manager state
    if (parsed.upgrades && Array.isArray(parsed.upgrades)) {
      const upgradeManager = gameState.getUpgradeManager();
      parsed.upgrades.forEach((upgradeData: any) => {
        if (upgradeData.chips > 0 || upgradeData.mult > 0 || upgradeData.level > 1) {
          // Use restoreUpgrade to properly set level without incrementing
          upgradeManager.restoreUpgrade(
            upgradeData.handType,
            upgradeData.chips,
            upgradeData.mult,
            upgradeData.level || 1 // Default to 1 for old saves without level
          );
        }
      });
      console.log(`Restored ${parsed.upgrades.length} hand upgrades`);
    }

    // Restore jokers
    if (parsed.jokers && Array.isArray(parsed.jokers)) {
      parsed.jokers.forEach((jokerData: any) => {
        try {
          // Recreate the specific joker by ID
          const joker = this.itemGenerator.generateJokerById(jokerData.id);
          gameState.addJoker(joker);
        } catch (error) {
          console.error(`Failed to restore joker: ${jokerData.name} (${jokerData.id})`, error);
        }
      });
      console.log(`Restored ${parsed.jokers.length} jokers`);
    }

    // Restore consumables (tarots)
    if (parsed.consumables && Array.isArray(parsed.consumables)) {
      parsed.consumables.forEach((tarotData: any) => {
        try {
          // Recreate the specific tarot by ID
          const tarot = this.itemGenerator.generateTarotById(tarotData.id);
          gameState.addConsumable(tarot);
        } catch (error) {
          console.error(`Failed to restore consumable: ${tarotData.name} (${tarotData.id})`, error);
        }
      });
      console.log(`Restored ${parsed.consumables.length} consumables`);
    }

    // Restore current blind
    if (parsed.currentBlind) {
      try {
        const blindLevel = parsed.currentBlind.level;
        const roundNumber = parsed.currentBlind.roundNumber || parsed.roundNumber;
        const blindType = parsed.currentBlind.type;
        
        // Create the appropriate blind type based on the class name
        if (blindType === 'SmallBlind') {
          gameState['currentBlind'] = new SmallBlind(blindLevel, roundNumber);
        } else if (blindType === 'BigBlind') {
          gameState['currentBlind'] = new BigBlind(blindLevel, roundNumber);
        } else if (blindType === 'BossBlind') {
          // Restore the actual boss type (default to THE_WALL if not saved)
          const bossType = parsed.currentBlind.bossType || BossType.THE_WALL;
          const bossBlind = new BossBlind(blindLevel, roundNumber, bossType);
          
          // If The Mouth boss has a locked hand type, restore it
          if (bossType === BossType.THE_MOUTH && parsed.currentBlind.lockedHandType) {
            bossBlind.setAllowedHandType(parsed.currentBlind.lockedHandType);
            console.log(`Restored The Mouth with locked hand type: ${parsed.currentBlind.lockedHandType}`);
          }
          
          gameState['currentBlind'] = bossBlind;
          console.log(`Restored boss blind: ${bossType} at level ${blindLevel}`);
        }
        
        if (blindType !== 'BossBlind') {
          console.log(`Restored blind: ${blindType} at level ${blindLevel}`);
        }
      } catch (error) {
        console.error('Failed to restore blind', error);
      }
    }

    console.log('Game state deserialized');
    return gameState;
  }
}