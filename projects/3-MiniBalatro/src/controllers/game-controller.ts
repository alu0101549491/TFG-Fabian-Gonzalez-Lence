// ============================================
// FILE: src/controllers/game-controller.ts
// ============================================

import { GameState } from '../models/game/game-state';
import { Shop } from '../services/shop/shop';
import { ShopItem } from '../services/shop/shop-item';
import { GamePersistence } from '../services/persistence/game-persistence';
import { Joker } from '../models/special-cards/jokers/joker';
import { Tarot } from '../models/special-cards/tarots/tarot';
import { Planet } from '../models/special-cards/planets/planet';
import { ScoreResult } from '../models/scoring/score-result';
import { Card } from '../models/core/card';
import { BossBlind } from '../models/blinds/boss-blind';
import { BossType } from '../models/blinds/boss-type.enum';
import { ShopItemType } from '../services/shop/shop-item-type.enum';

/**
 * Main game flow controller.
 * Orchestrates interactions between GameState, Shop, and Services.
 * Provides clean API for UI layer and handles game progression.
 */
export class GameController {
  private gameState: GameState | null = null;
  private shop: Shop | null = null;
  private gamePersistence: GamePersistence;
  private isInShop: boolean = false;
  private isGameActive: boolean = false;

  // Callback properties
  public onStateChange?: (state: GameState) => void;
  public onShopOpen?: (shop: Shop) => void;
  public onShopClose?: () => void;
  public onVictory?: () => void;
  public onDefeat?: () => void;
  public onBossIntro?: (bossType: BossType) => void;

  /**
   * Creates game controller with optional UI callbacks.
   * @param onStateChange - Callback when game state changes
   * @param onShopOpen - Callback when shop opens
   * @param onShopClose - Callback when shop closes
   * @param onVictory - Callback when game is won
   * @param onDefeat - Callback when game is lost
   * @param onBossIntro - Callback when boss blind is introduced
   */
  constructor(
    onStateChange?: (state: GameState) => void,
    onShopOpen?: (shop: Shop) => void,
    onShopClose?: () => void,
    onVictory?: () => void,
    onDefeat?: () => void,
    onBossIntro?: (bossType: BossType) => void
  ) {
    this.gamePersistence = new GamePersistence();
    this.onStateChange = onStateChange;
    this.onShopOpen = onShopOpen;
    this.onShopClose = onShopClose;
    this.onVictory = onVictory;
    this.onDefeat = onDefeat;
    this.onBossIntro = onBossIntro;
  }

  /**
   * Initializes a new game and deals first hand.
   */
  public startNewGame(): void {
    if (this.isGameActive) {
      this.resetGame();
    }

    this.gameState = new GameState();
    this.isGameActive = true;
    this.isInShop = false;

    // Deal initial hand
    this.gameState.dealHand();

    // Trigger state change callback
    if (this.onStateChange && this.gameState) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();

    console.log('New game started');
  }

  /**
   * Loads saved game and resumes.
   * @returns true if successfully loaded, false otherwise
   */
  public continueGame(): boolean {
    try {
      const savedState = this.gamePersistence.loadGame();
      if (!savedState) {
        return false;
      }

      this.gameState = savedState;
      this.isGameActive = true;
      this.isInShop = false;

      // Check if we need to open shop (if saved in shop state)
      // This would require additional metadata in the saved state

      // Trigger state change callback
      if (this.onStateChange && this.gameState) {
        this.onStateChange(this.gameState);
      }

      console.log('Game loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  /**
   * Toggles selection of a card in player's hand.
   * @param cardId - ID of card to toggle
   * @throws Error if game not active, in shop, or cardId invalid
   */
  public selectCard(cardId: string): void {
    if (!this.isGameActive) {
      throw new Error('Game is not active');
    }
    if (this.isInShop) {
      throw new Error('Cannot select cards while in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    this.gameState.selectCard(cardId);

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();
  }

  /**
   * Clears all selected cards.
   * @throws Error if game not active
   */
  public clearSelection(): void {
    if (!this.isGameActive) {
      throw new Error('Game is not active');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    this.gameState.clearSelection();

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }
  }

  /**
   * Plays selected cards, calculates score, checks level completion.
   * @returns ScoreResult with details of calculation
   * @throws Error if no cards selected, no hands remaining, or game not active
   */
  public playSelectedHand(): ScoreResult {
    if (!this.isGameActive) {
      throw new Error('Game is not active');
    }
    if (this.isInShop) {
      throw new Error('Cannot play hand while in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    const result = this.gameState.playHand();

    // Check if level complete
    if (this.gameState.isLevelComplete()) {
      this.completeBlind();
    }

    // Check if game over
    if (this.gameState.isGameOver()) {
      this.triggerDefeat();
    }

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();

    return result;
  }

  /**
   * Discards selected cards and draws replacements.
   * @throws Error if no cards selected, no discards remaining, or game not active
   */
  public discardSelected(): void {
    if (!this.isGameActive) {
      throw new Error('Game is not active');
    }
    if (this.isInShop) {
      throw new Error('Cannot discard cards while in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    this.gameState.discardCards();

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();
  }

  /**
   * Handles successful blind completion.
   */
  private completeBlind(): void {
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    // Add money reward
    const reward = this.gameState.getCurrentBlind().getReward();
    this.gameState.addMoney(reward);

    // Check for Golden Joker bonus
    const hasGoldenJoker = this.gameState.getJokers().some(j => j.name === 'Golden Joker');
    if (hasGoldenJoker) {
      this.gameState.addMoney(2);
    }

    // Open shop
    this.openShop();

    // Check victory condition
    if (this.checkVictoryCondition()) {
      this.triggerVictory();
    }
  }

  /**
   * Opens shop with 4 random items.
   * @throws Error if already in shop
   */
  public openShop(): void {
    if (this.isInShop) {
      throw new Error('Already in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    this.shop = new Shop(this.gameState);
    this.isInShop = true;

    // Trigger shop open callback
    if (this.onShopOpen) {
      this.onShopOpen(this.shop);
    }

    console.log('Shop opened');
  }

  /**
   * Attempts to purchase an item from shop.
   * @param itemId - ID of item to purchase
   * @returns true if successful, false if insufficient money
   * @throws Error if not in shop or itemId invalid
   */
  public purchaseShopItem(itemId: string): boolean {
    if (!this.isInShop) {
      throw new Error('Not in shop');
    }
    if (!this.shop) {
      throw new Error('Shop not initialized');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    const item = this.shop.getItem(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // Check if player can afford
    if (this.gameState.getMoney() < item.price) {
      return false;
    }

    // Spend money
    if (!this.gameState.spendMoney(item.price)) {
      return false;
    }

    // Apply item effect based on type
    switch (item.type) {
      case ShopItemType.JOKER:
        if (this.gameState.getJokers().length >= 5) {
          // Need to replace existing joker
          // UI should prompt for replacement
          return false;
        }
        this.gameState.addJoker(item.item as Joker);
        break;

      case ShopItemType.PLANET:
        (item.item as Planet).apply(this.gameState.getUpgradeManager());
        break;

      case ShopItemType.TAROT:
        if (this.gameState.getConsumables().length >= 2) {
          // Need to replace existing tarot
          // UI should prompt for replacement
          return false;
        }
        this.gameState.addConsumable(item.item as Tarot);
        break;
    }

    // Remove item from shop
    this.shop.removeItem(itemId);

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();

    return true;
  }

  /**
   * Regenerates shop items for a cost.
   * @returns true if successful, false if insufficient money
   * @throws Error if not in shop
   */
  public rerollShop(): boolean {
    if (!this.isInShop) {
      throw new Error('Not in shop');
    }
    if (!this.shop) {
      throw new Error('Shop not initialized');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    // Check if player can afford reroll
    if (this.gameState.getMoney() < this.shop.getRerollCost()) {
      return false;
    }

    // Spend money
    if (!this.gameState.spendMoney(this.shop.getRerollCost())) {
      return false;
    }

    // Regenerate shop items
    this.shop.rerollItems();

    // Trigger shop open callback (as items changed)
    if (this.onShopOpen) {
      this.onShopOpen(this.shop);
    }

    // Auto-save game state
    this.saveGame();

    return true;
  }

  /**
   * Closes shop and advances to next blind.
   * @throws Error if not in shop
   */
  public exitShop(): void {
    if (!this.isInShop) {
      throw new Error('Not in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    // Close shop
    this.shop = null;
    this.isInShop = false;

    // Advance to next blind
    this.gameState.advanceToNextBlind();

    // Deal new hand
    this.gameState.dealHand();

    // Check if boss blind for intro
    if (this.gameState.getCurrentBlind() instanceof BossBlind) {
      const bossType = (this.gameState.getCurrentBlind() as BossBlind).getBossType();
      if (this.onBossIntro) {
        this.onBossIntro(bossType);
      }
    }

    // Trigger shop close callback
    if (this.onShopClose) {
      this.onShopClose();
    }

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();

    console.log('Shop closed, advanced to next level');
  }

  /**
   * Uses a tarot card from inventory.
   * @param tarotId - ID of tarot to use
   * @param targetCardId - Optional target card ID if required
   * @throws Error if game not active, in shop, or tarotId invalid
   */
  public useConsumable(tarotId: string, targetCardId?: string): void {
    if (!this.isGameActive) {
      throw new Error('Game is not active');
    }
    if (this.isInShop) {
      throw new Error('Cannot use consumable while in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    // Find the tarot in consumables
    const tarot = this.gameState.getConsumables().find(t => t.name === tarotId);
    if (!tarot) {
      throw new Error('Tarot not found');
    }

    // Find target card if required
    let targetCard: Card | undefined;
    if (tarot.requiresTarget() && targetCardId) {
      targetCard = this.gameState.getCurrentHand().find(c => c.getId() === targetCardId);
      if (!targetCard) {
        throw new Error('Target card not found');
      }
    }

    // Use the tarot
    this.gameState.useConsumable(tarotId, targetCard);

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();
  }

  /**
   * Adds joker to active set (controller wrapper).
   * @param joker - Joker to add
   * @returns true if added, false if inventory full
   */
  public addJoker(joker: Joker): boolean {
    if (!this.isInShop) {
      throw new Error('Can only add jokers in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    return this.gameState.addJoker(joker);
  }

  /**
   * Replaces an existing joker with a new one.
   * @param oldJokerId - ID of joker to replace
   * @param newJoker - New joker to add
   * @throws Error if oldJokerId not found
   */
  public replaceJoker(oldJokerId: string, newJoker: Joker): void {
    if (!this.isInShop) {
      throw new Error('Can only replace jokers in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    this.gameState.replaceJoker(oldJokerId, newJoker);

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();
  }

  /**
   * Adds tarot to consumables (controller wrapper).
   * @param tarot - Tarot to add
   * @returns true if added, false if inventory full
   */
  public addConsumable(tarot: Tarot): boolean {
    if (!this.isInShop) {
      throw new Error('Can only add tarots in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    return this.gameState.addConsumable(tarot);
  }

  /**
   * Replaces an existing tarot with a new one.
   * @param oldTarotId - ID of tarot to replace
   * @param newTarot - New tarot to add
   * @throws Error if oldTarotId not found
   */
  public replaceConsumable(oldTarotId: string, newTarot: Tarot): void {
    if (!this.isInShop) {
      throw new Error('Can only replace tarots in shop');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    this.gameState.replaceConsumable(oldTarotId, newTarot);

    // Trigger state change callback
    if (this.onStateChange) {
      this.onStateChange(this.gameState);
    }

    // Auto-save game state
    this.saveGame();
  }

  /**
   * Checks if player has won the game.
   * @returns true if victory condition met
   */
  private checkVictoryCondition(): boolean {
    if (!this.gameState) {
      return false;
    }

    // Victory condition: Passed 8 complete rounds (24 levels)
    return this.gameState.getRoundNumber() > 8;
  }

  /**
   * Checks if player has lost the game.
   * @returns true if defeat condition met
   */
  private checkDefeatCondition(): boolean {
    if (!this.gameState) {
      return false;
    }

    return this.gameState.isGameOver();
  }

  /**
   * Handles game victory.
   */
  private triggerVictory(): void {
    this.isGameActive = false;

    // Save game as completed
    this.saveGame();

    // Trigger victory callback
    if (this.onVictory) {
      this.onVictory();
    }

    console.log('Game victory achieved!');
  }

  /**
   * Handles game defeat.
   */
  private triggerDefeat(): void {
    this.isGameActive = false;

    // Save game as lost
    this.saveGame();

    // Trigger defeat callback
    if (this.onDefeat) {
      this.onDefeat();
    }

    console.log('Game over - defeat!');
  }

  /**
   * Returns current game state (for UI access).
   * @returns GameState object
   * @throws Error if game not initialized
   */
  public getGameState(): GameState {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }
    return this.gameState;
  }

  /**
   * Returns current shop instance.
   * @returns Shop if in shop, null otherwise
   */
  public getShop(): Shop | null {
    return this.shop;
  }

  /**
   * Returns whether game is currently active.
   * @returns boolean
   */
  public isActive(): boolean {
    return this.isGameActive;
  }

  /**
   * Returns whether player is in shop.
   * @returns boolean
   */
  public isInShopMode(): boolean {
    return this.isInShop;
  }

  /**
   * Manually triggers game save.
   */
  public saveGame(): void {
    if (!this.isGameActive || !this.gameState) {
      return;
    }

    try {
      this.gamePersistence.saveGame(this.gameState);
      console.log('Game state saved');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Resets controller and clears saved game.
   */
  public resetGame(): void {
    this.gameState = null;
    this.shop = null;
    this.isGameActive = false;
    this.isInShop = false;

    try {
      this.gamePersistence.clearSavedGame();
      console.log('Game reset and saved data cleared');
    } catch (error) {
      console.error('Failed to clear saved game:', error);
    }
  }
}