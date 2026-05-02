# TESTING CONTEXT
Project: Mini Balatro
Components under test: GameController (game flow orchestrator)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/controllers/game-controller.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/controllers/game-controller.ts
 * @desc Main game flow controller orchestrating GameState, Shop, and persistence services.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { GameState } from '../models/game/game-state';
import { Shop } from '../services/shop/shop';
import { GamePersistence } from '../services/persistence/game-persistence';
import { Joker } from '../models/special-cards/jokers/joker';
import { Tarot } from '../models/special-cards/tarots/tarot';
import { Planet } from '../models/special-cards/planets/planet';
import { ScoreResult } from '../models/scoring/score-result';
import { Card } from '../models/core/card';
import { BossBlind } from '../models/blinds/boss-blind';
import { BossType, getBossDisplayName } from '../models/blinds/boss-type.enum';
import { ShopItemType } from '../services/shop/shop-item-type.enum';
import { GameConfig } from '../services/config/game-config';

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
  
  // Blind victory state
  private isPendingBlindVictory: boolean = false;
  private victoryScore: number = 0;
  private victoryReward: number = 0;
  private victoryBlindLevel: number = 0;

  // Blind defeat state
  private isPendingBlindDefeat: boolean = false;
  private defeatBlindLevel: number = 0;
  private defeatRoundNumber: number = 0;
  private defeatAchievedScore: number = 0;
  private defeatTargetScore: number = 0;
  private defeatIsBoss: boolean = false;
  private defeatBossName: string = '';

  // Callback properties
  public onStateChange?: (state: GameState) => void;
  public onShopOpen?: (shop: Shop) => void;
  public onShopClose?: () => void;
  public onVictory?: () => void;
  public onDefeat?: () => void;
  public onBossIntro?: (bossType: BossType) => void;
  public onBlindVictory?: (blindLevel: number, score: number, reward: number) => void;
  public onBlindDefeat?: (
    blindLevel: number,
    roundNumber: number,
    achievedScore: number,
    targetScore: number,
    isBossBlind: boolean,
    bossName?: string
  ) => void;

  /**
   * Creates game controller with optional UI callbacks.
   * @param onStateChange - Callback when game state changes
   * @param onShopOpen - Callback when shop opens
   * @param onShopClose - Callback when shop closes
   * @param onVictory - Callback when game is won
   * @param onDefeat - Callback when game is lost
   * @param onBossIntro - Callback when boss blind is introduced
   * @param onBlindVictory - Callback when blind is successfully cleared
   * @param onBlindDefeat - Callback when blind is failed
   */
  constructor(
    onStateChange?: (state: GameState) => void,
    onShopOpen?: (shop: Shop) => void,
    onShopClose?: () => void,
    onVictory?: () => void,
    onDefeat?: () => void,
    onBossIntro?: (bossType: BossType) => void,
    onBlindVictory?: (blindLevel: number, score: number, reward: number) => void,
    onBlindDefeat?: (
      blindLevel: number,
      roundNumber: number,
      achievedScore: number,
      targetScore: number,
      isBossBlind: boolean,
      bossName?: string
    ) => void
  ) {
    this.gamePersistence = new GamePersistence();
    this.onStateChange = onStateChange;
    this.onShopOpen = onShopOpen;
    this.onShopClose = onShopClose;
    this.onVictory = onVictory;
    this.onDefeat = onDefeat;
    this.onBossIntro = onBossIntro;
    this.onBlindVictory = onBlindVictory;
    this.onBlindDefeat = onBlindDefeat;
  }

  /**
   * Validation helper: ensure game is active and gameState exists.
   * @throws Error if game not active
   */
  private validateGameActive(): void {
    if (!this.isGameActive || !this.gameState) {
      throw new Error('Game is not active');
    }
  }

  /**
   * Validation helper: ensure action is not performed while in shop.
   * @throws Error if currently in shop
   */
  private validateNotInShop(): void {
    if (this.isInShop) {
      throw new Error('This action cannot be performed while in shop');
    }
  }

  /**
   * Validation helper: ensure we are currently in shop and shop exists.
   * @throws Error if not in shop
   */
  private validateInShop(): void {
    if (!this.isInShop || !this.shop) {
      throw new Error('Shop is not open');
    }
  }

  /**
   * Auto-save helper that wraps saveGame for reuse.
   */
  private autoSave(): void {
    try {
      this.saveGame();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * Safely invoke the onStateChange callback.
   */
  private triggerStateChange(): void {
    if (this.onStateChange && this.gameState) {
      try {
        this.onStateChange(this.gameState);
      } catch (error) {
        console.error('State change callback error:', error);
      }
    }
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

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();

    console.log('New game started');
  }

  /**
   * Loads saved game and resumes.
   * @returns Promise resolving to true if successfully loaded, false otherwise
   */
  public async continueGame(): Promise<boolean> {
    try {
      const savedState = this.gamePersistence.loadGame();
      if (!savedState) {
        return false;
      }

      this.gameState = savedState;
      this.isGameActive = true;
      
      // Load controller state
      const controllerState = this.gamePersistence.loadControllerState();
      const wasInShop = controllerState?.isInShop || false;
      const victoryState = controllerState?.victoryState;
      
      // Restore victory state if pending
      if (victoryState?.isPending) {
        this.isPendingBlindVictory = true;
        this.victoryScore = victoryState.score;
        this.victoryReward = victoryState.reward;
        this.victoryBlindLevel = victoryState.blindLevel;
        
        // Trigger blind victory callback to show modal
        if (this.onBlindVictory) {
          this.onBlindVictory(this.victoryBlindLevel, this.victoryScore, this.victoryReward);
        }
        
        console.log('Restored pending blind victory state');
      }
      // If player was in shop, restore shop state
      else if (wasInShop) {
        this.isInShop = false; // Will be set by openShop
        
        // Try to restore saved shop items
        const savedShopItems = controllerState?.shopItems;
        if (savedShopItems && savedShopItems.length > 0) {
          // Restore shop with saved items
          this.shop = new Shop();
          const restoredItems = await this.gamePersistence.deserializeShopItems(savedShopItems);
          this.shop.setItems(restoredItems);
          this.isInShop = true;
          
          // Trigger shop open callback
          if (this.onShopOpen) {
            this.onShopOpen(this.shop);
          }
          
          console.log(`Restored shop state with ${restoredItems.length} items`);
        } else {
          // Fallback: generate new shop items if none were saved
          await this.openShop();
          console.log('Shop state restored with new items (no saved items found)');
        }
      } else {
        // Check if hand is empty and deal cards if needed
        const currentHand = savedState.getCurrentHand();
        if (currentHand.length === 0) {
          try {
            savedState.dealHand();
            console.log('Dealt new hand after loading game (hand was empty)');
          } catch (error) {
            console.error('Could not deal hand:', error);
          }
        } else {
          console.log(`Restored hand with ${currentHand.length} cards`);
        }
        
        this.isInShop = false;
      }

      // Trigger state change callback
      this.triggerStateChange();

      console.log('Game loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  /**
   * Checks if a saved game exists.
   * @returns true if saved game exists, false otherwise
   */
  public hasSavedGame(): boolean {
    return this.gamePersistence.hasSavedGame();
  }

  /**
   * Toggles selection of a card in player's hand.
   * @param cardId - ID of card to toggle
   * @throws Error if game not active, in shop, or cardId invalid
   */
  public selectCard(cardId: string): void {
    this.validateGameActive();
    this.validateNotInShop();

    this.gameState!.selectCard(cardId);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Clears all selected cards.
   * @throws Error if game not active
   */
  public clearSelection(): void {
    this.validateGameActive();

    this.gameState!.clearSelection();

    // Trigger state change callback
    this.triggerStateChange();
  }

  /**
   * Plays selected cards, calculates score, checks level completion.
   * @returns Promise resolving to ScoreResult with details of calculation
   * @throws Error if no cards selected, no hands remaining, or game not active
   */
  public async playSelectedHand(): Promise<ScoreResult> {
    this.validateGameActive();
    this.validateNotInShop();

    const result = this.gameState!.playHand();

    // Check if level complete
    if (this.gameState!.isLevelComplete()) {
      await this.completeBlind();
    }

    // Check if game over
    if (this.gameState!.isGameOver()) {
      this.triggerDefeat();
    }

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();

    return result;
  }

  /**
   * Discards selected cards and draws replacements.
   * @throws Error if no cards selected, no discards remaining, or game not active
   */
  public discardSelected(): void {
    this.validateGameActive();
    this.validateNotInShop();

    this.gameState!.discardCards();

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Handles successful blind completion.
   */
  private async completeBlind(): Promise<void> {
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    // Apply level rewards (blind reward + economic jokers) via GameState helper
    const totalReward = this.gameState.applyLevelRewards();

    // Store victory information for modal
    this.isPendingBlindVictory = true;
    this.victoryScore = this.gameState.getAccumulatedScore(); // Blind completion score
    this.victoryReward = totalReward;
    this.victoryBlindLevel = this.gameState.getLevelNumber();

    // Check if this is the final boss (Round 8, Level 24)
    const isGameWon = this.checkVictoryCondition();

    // Save game state with pending victory
    this.saveGame();

    if (isGameWon) {
      // Trigger game victory instead of blind victory
      this.triggerVictory();
    } else {
      // Trigger blind victory callback to show modal
      if (this.onBlindVictory) {
        this.onBlindVictory(this.victoryBlindLevel, this.victoryScore, this.victoryReward);
      }
    }
  }

  /**
   * Opens shop with 4 random items.
   * Prevents duplicate jokers (both owned and in shop).
   * @returns Promise that resolves when shop is ready
   * @throws Error if already in shop
   */
  public async openShop(): Promise<void> {
    this.validateGameActive();
    this.validateNotInShop();

    // Get IDs of currently owned jokers to prevent duplicates
    const ownedJokerIds = this.gameState!.getJokers().map(joker => joker.id);

    this.shop = new Shop();
    await this.shop.generateItems(GameConfig.ITEMS_PER_SHOP, ownedJokerIds); // Generate 4 random items
    this.isInShop = true;

    // Trigger shop open callback
    if (this.onShopOpen) {
      this.onShopOpen(this.shop);
    }

    console.log(`Shop opened with ${this.shop.getAvailableItems().length} items (excluding ${ownedJokerIds.length} owned jokers)`);
  }

  /**
   * Confirms blind victory and opens shop.
   * Should be called after player sees victory modal.
   */
  public async confirmBlindVictory(): Promise<void> {
    if (!this.isPendingBlindVictory) {
      throw new Error('No pending blind victory');
    }

    // Clear victory state
    this.isPendingBlindVictory = false;
    this.victoryScore = 0;
    this.victoryReward = 0;
    this.victoryBlindLevel = 0;

    // Open shop
    await this.openShop();

    // Auto-save game state (now in shop, victory cleared)
    this.autoSave();
  }

  /**
   * Confirms blind defeat and clears game state.
   * Should be called after player sees defeat modal.
   */
  public confirmBlindDefeat(): void {
    if (!this.isPendingBlindDefeat) {
      throw new Error('No pending blind defeat');
    }

    // Clear defeat state
    this.isPendingBlindDefeat = false;
    this.defeatBlindLevel = 0;
    this.defeatRoundNumber = 0;
    this.defeatAchievedScore = 0;
    this.defeatTargetScore = 0;
    this.defeatIsBoss = false;
    this.defeatBossName = '';

    // Trigger the old onDefeat callback for screen transition
    if (this.onDefeat) {
      this.onDefeat();
    }
  }

  /**
   * Attempts to purchase an item from shop.
   * @param itemId - ID of item to purchase
   * @returns true if successful, false if insufficient money
   * @throws Error if not in shop or itemId invalid
   */
  public purchaseShopItem(itemId: string): boolean {
    this.validateInShop();
    this.validateGameActive();

    const item = this.shop!.getItem(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // Check if player can afford
    if (this.gameState!.getMoney() < item.cost) {
      return false;
    }

    // Spend money
    if (!this.gameState!.spendMoney(item.cost)) {
      return false;
    }

    // Apply item effect based on type
    switch (item.type) {
      case ShopItemType.JOKER:
        if (this.gameState!.getJokers().length >= 5) {
          // Need to replace existing joker
          // UI should prompt for replacement
          return false;
        }
        this.gameState!.addJoker(item.item as Joker);
        break;

      case ShopItemType.PLANET:
        (item.item as Planet).apply(this.gameState!.getUpgradeManager());
        break;

      case ShopItemType.TAROT:
        if (this.gameState!.getConsumables().length >= 2) {
          // Need to replace existing tarot
          // UI should prompt for replacement
          return false;
        }
        this.gameState!.addConsumable(item.item as Tarot);
        break;
    }

    // Remove item from shop
    this.shop!.removeItem(itemId);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();

    return true;
  }

  /**
   * Regenerates shop items for a cost.
   * Prevents duplicate jokers (both owned and in shop).
   * @returns Promise resolving to true if successful, false if insufficient money
   * @throws Error if not in shop
   */
  public async rerollShop(): Promise<boolean> {
    this.validateInShop();
    this.validateGameActive();

    // Check if player can afford reroll
    if (this.gameState!.getMoney() < this.shop!.getRerollCost()) {
      return false;
    }

    // Spend money
    if (!this.gameState!.spendMoney(this.shop!.getRerollCost())) {
      return false;
    }

    // Get IDs of currently owned jokers to prevent duplicates
    const ownedJokerIds = this.gameState!.getJokers().map(joker => joker.id);

    // Regenerate shop items
    await this.shop!.reroll(this.gameState!.getMoney(), ownedJokerIds);

    // Trigger shop open callback (as items changed)
    if (this.onShopOpen) {
      try {
        this.onShopOpen(this.shop!);
      } catch (error) {
        console.error('Shop open callback error:', error);
      }
    }

    // Auto-save game state
    this.autoSave();

    return true;
  }

  /**
   * Closes shop and advances to next blind.
   * @throws Error if not in shop
   */
  public exitShop(): void {
    this.validateInShop();
    this.validateGameActive();

    // Close shop
    this.shop = null;
    this.isInShop = false;

    // Advance to next blind
    this.gameState!.advanceToNextBlind();

    // Deal new hand
    this.gameState!.dealHand();

    // Check if boss blind for intro
    if (this.gameState!.getCurrentBlind() instanceof BossBlind) {
      const bossType = (this.gameState!.getCurrentBlind() as BossBlind).getBossType();
      if (this.onBossIntro) {
        try {
          this.onBossIntro(bossType);
        } catch (error) {
          console.error('onBossIntro callback error:', error);
        }
      }
    }

    // Trigger shop close callback
    if (this.onShopClose) {
      try {
        this.onShopClose();
      } catch (error) {
        console.error('onShopClose callback error:', error);
      }
    }

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();

    console.log('Shop closed, advanced to next level');
  }

  /**
   * Uses a tarot card from inventory.
   * @param tarotId - ID of tarot to use
   * @param targetCardId - Optional target card ID if required
   * @throws Error if game not active, in shop, or tarotId invalid
   */
  public useConsumable(tarotId: string, targetCardId?: string): void {
    this.validateGameActive();
    this.validateNotInShop();

    // Find the tarot in consumables
    const tarot = this.gameState!.getConsumables().find(t => t.id === tarotId);
    if (!tarot) {
      throw new Error('Tarot not found');
    }

    // Find target card if required
    let targetCard: Card | undefined;
    if (tarot.requiresTarget() && targetCardId) {
      targetCard = this.gameState!.getCurrentHand().find(c => c.getId() === targetCardId);
      if (!targetCard) {
        throw new Error('Target card not found');
      }
    }

    // Use the tarot
    this.gameState!.useConsumable(tarotId, targetCard);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Adds joker to active set (controller wrapper).
   * @param joker - Joker to add
   * @returns true if added, false if inventory full
   */
  public addJoker(joker: Joker): boolean {
    this.validateInShop();
    this.validateGameActive();

    return this.gameState!.addJoker(joker);
  }

  /**
   * Replaces an existing joker with a new one.
   * @param oldJokerId - ID of joker to replace
   * @param newJoker - New joker to add
   * @throws Error if oldJokerId not found
   */
  public replaceJoker(oldJokerId: string, newJoker: Joker): void {
    this.validateInShop();
    this.validateGameActive();

    this.gameState!.replaceJoker(oldJokerId, newJoker);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Adds tarot to consumables (controller wrapper).
   * @param tarot - Tarot to add
   * @returns true if added, false if inventory full
   */
  public addConsumable(tarot: Tarot): boolean {
    this.validateInShop();
    this.validateGameActive();

    return this.gameState!.addConsumable(tarot);
  }

  /**
   * Replaces an existing tarot with a new one.
   * @param oldTarotId - ID of tarot to replace
   * @param newTarot - New tarot to add
   * @throws Error if oldTarotId not found
   */
  public replaceConsumable(oldTarotId: string, newTarot: Tarot): void {
    this.validateInShop();
    this.validateGameActive();

    this.gameState!.replaceConsumable(oldTarotId, newTarot);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Removes a joker from the active set.
   * @param jokerId - ID of joker to remove
   * @throws Error if jokerId not found
   */
  public removeJoker(jokerId: string): void {
    this.validateGameActive();

    this.gameState!.removeJoker(jokerId);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Removes a tarot/consumable from inventory.
   * @param tarotId - ID of tarot to remove
   * @throws Error if tarotId not found
   */
  public removeConsumable(tarotId: string): void {
    this.validateGameActive();

    this.gameState!.removeConsumable(tarotId);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Removes a tarot/consumable from inventory by index.
   * This is useful when there are multiple consumables with the same ID.
   * @param index - Index of tarot to remove in the consumables array
   * @throws Error if index is out of bounds
   */
  public removeConsumableByIndex(index: number): void {
    this.validateGameActive();

    this.gameState!.removeConsumableByIndex(index);

    // Trigger state change callback and auto-save
    this.triggerStateChange();
    this.autoSave();
  }

  /**
   * Checks if player has won the game.
   * @returns true if victory condition met
   */
  private checkVictoryCondition(): boolean {
    if (!this.gameState) {
      return false;
    }

    // Victory condition: Just completed the final round's boss blind
    // Check if current round equals VICTORY_ROUNDS and we're at a boss blind (level % 3 === 0)
    const currentRound = this.gameState.getRoundNumber();
    const currentLevel = this.gameState.getLevelNumber();
    const isCompletingBossBlind = currentLevel % 3 === 0;
    
    return currentRound === GameConfig.VICTORY_ROUNDS && isCompletingBossBlind;
  }

  /**
   * Handles game victory.
   */
  private triggerVictory(): void {
    this.isGameActive = false;

    // Save game as completed
    this.saveGame();

    // Trigger victory callback with final score
    if (this.onVictory) {
      this.onVictory();
    }

    console.log('Game victory achieved!');
  }

  /**
   * Handles game defeat.
   */
  private triggerDefeat(): void {
    if (!this.gameState) {
      return;
    }

    // Gather defeat information
    const currentBlind = this.gameState.getCurrentBlind();
    this.defeatBlindLevel = this.gameState.getLevelNumber();
    this.defeatRoundNumber = this.gameState.getRoundNumber();
    this.defeatAchievedScore = this.gameState.getAccumulatedScore();
    this.defeatTargetScore = currentBlind.getScoreGoal();
    
    // Check if it's a boss blind
    if (currentBlind instanceof BossBlind) {
      this.defeatIsBoss = true;
      this.defeatBossName = getBossDisplayName(currentBlind.getBossType());
    } else {
      this.defeatIsBoss = false;
      this.defeatBossName = '';
    }

    this.isPendingBlindDefeat = true;
    this.isGameActive = false;

    // Trigger defeat modal callback
    if (this.onBlindDefeat) {
      this.onBlindDefeat(
        this.defeatBlindLevel,
        this.defeatRoundNumber,
        this.defeatAchievedScore,
        this.defeatTargetScore,
        this.defeatIsBoss,
        this.defeatBossName || undefined
      );
    }

    // Save game as lost
    this.saveGame();

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
   * Gets the victory score (score from completing the final boss).
   * @returns Victory score, or 0 if no victory pending
   */
  public getVictoryScore(): number {
    return this.victoryScore;
  }

  /**
   * Gets preview score for currently selected cards.
   * @returns ScoreResult with preview calculations, or null if no cards selected
   * @throws Error if game not active
   */
  public getPreviewScore(): ScoreResult | null {
    if (!this.isGameActive) {
      throw new Error('Game is not active');
    }
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }
    return this.gameState.getPreviewScore();
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
      
      // Serialize shop items if in shop
      const shopItems = this.isInShop && this.shop
        ? this.gamePersistence.serializeShopItems(this.shop.getAvailableItems())
        : [];
      
      this.gamePersistence.saveControllerState(this.isInShop, {
        isPending: this.isPendingBlindVictory,
        score: this.victoryScore,
        reward: this.victoryReward,
        blindLevel: this.victoryBlindLevel
      }, shopItems);
      console.log('Game state and controller state saved');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Returns whether a blind victory is pending confirmation.
   * @returns boolean
   */
  public isPendingVictory(): boolean {
    return this.isPendingBlindVictory;
  }

  /**
   * Gets the victory information for the modal.
   * @returns Object with blind level, score, and reward, or null if no pending victory
   */
  public getVictoryInfo(): { blindLevel: number; score: number; reward: number } | null {
    if (!this.isPendingBlindVictory) {
      return null;
    }
    return {
      blindLevel: this.victoryBlindLevel,
      score: this.victoryScore,
      reward: this.victoryReward
    };
  }

  /**
   * Returns whether a blind defeat is pending confirmation.
   * @returns boolean
   */
  public isPendingDefeat(): boolean {
    return this.isPendingBlindDefeat;
  }

  /**
   * Gets the defeat information for the modal.
   * @returns Object with defeat details, or null if no pending defeat
   */
  public getDefeatInfo(): {
    blindLevel: number;
    roundNumber: number;
    achievedScore: number;
    targetScore: number;
    isBossBlind: boolean;
    bossName?: string;
  } | null {
    if (!this.isPendingBlindDefeat) {
      return null;
    }
    return {
      blindLevel: this.defeatBlindLevel,
      roundNumber: this.defeatRoundNumber,
      achievedScore: this.defeatAchievedScore,
      targetScore: this.defeatTargetScore,
      isBossBlind: this.defeatIsBoss,
      bossName: this.defeatBossName || undefined
    };
  }

  /**
   * Resets controller and clears saved game.
   */
  public resetGame(): void {
    this.gameState = null;
    this.shop = null;
    this.isGameActive = false;
    this.isInShop = false;
    this.isPendingBlindVictory = false;
    this.victoryScore = 0;
    this.victoryReward = 0;
    this.victoryBlindLevel = 0;
    this.isPendingBlindDefeat = false;
    this.defeatBlindLevel = 0;
    this.defeatRoundNumber = 0;
    this.defeatAchievedScore = 0;
    this.defeatTargetScore = 0;
    this.defeatIsBoss = false;
    this.defeatBossName = '';

    try {
      this.gamePersistence.clearSavedGame();
      console.log('Game reset and saved data cleared');
    } catch (error) {
      console.error('Failed to clear saved game:', error);
    }
  }
}
```

# JEST CONFIGURATION
```json
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@views/(.*)$': '<rootDir>/src/views/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/main.tsx',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
```

# TYPESCRIPT CONFIGURATION
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/models/*"],
      "@controllers/*": ["src/controllers/*"],
      "@services/*": ["src/services/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },

    /* Additional options */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

# REQUIREMENTS SPECIFICATION

## GameController Class Requirements:

### Properties:
- **gameState**: GameState | null (null before game starts)
- **shop**: Shop | null (null when not in shop)
- **gamePersistence**: GamePersistence instance
- **isInShop**: boolean (shop state flag)
- **isGameActive**: boolean (game running flag)
- **Callbacks**: onStateChange, onShopOpen, onShopClose, onVictory, onDefeat

### Callback Types:
```typescript
type StateChangeCallback = () => void;
type ShopCallback = () => void;
type GameEndCallback = () => void;
```

### Constructor:
- Accepts callback functions (all optional)
- Initializes GamePersistence
- Sets gameState = null
- Sets shop = null
- Sets isInShop = false
- Sets isGameActive = false

### Game Lifecycle:

**startNewGame(): void**
- Creates new GameState instance
- Calls gameState.dealHand()
- Sets isGameActive = true
- Triggers onStateChange callback
- Auto-saves game state

**continueGame(): boolean**
- Loads game from GamePersistence
- If save exists: restores GameState, returns true
- If no save: returns false
- Sets isGameActive = true
- Triggers onStateChange callback

**endGame(): void**
- Sets isGameActive = false
- Sets gameState = null
- Sets shop = null
- Clears saved game (optional)
- Triggers onStateChange callback

### Player Actions (delegate to GameState):

**selectCard(cardId: string): void**
- Validates game is active
- Validates not in shop
- Calls gameState.selectCard(cardId)
- Triggers onStateChange callback
- Auto-saves

**clearSelection(): void**
- Validates game is active
- Calls gameState.clearSelection()
- Triggers onStateChange callback

**playSelectedHand(): void**
- Validates game is active
- Validates not in shop
- Calls gameState.playHand()
- Checks if level complete: calls completeBlind()
- Checks if game over: calls triggerDefeat()
- Triggers onStateChange callback
- Auto-saves

**discardSelected(): void**
- Validates game is active
- Validates not in shop
- Calls gameState.discardCards()
- Triggers onStateChange callback
- Auto-saves

### Level Completion Flow:

**completeBlind() [PRIVATE]:**
- Awards blind reward money
- Opens shop (calls openShop())
- Triggers onStateChange callback

**openShop(): void**
- Sets isInShop = true
- Creates new Shop instance with 4 items
- Triggers onShopOpen callback
- Auto-saves

**exitShop(): void**
- Sets isInShop = false
- Sets shop = null
- Calls gameState.advanceToNextBlind()
- Calls gameState.dealHand()
- Checks victory condition (level > 24)
- If victory: calls triggerVictory()
- Triggers onShopClose callback
- Triggers onStateChange callback
- Auto-saves

### Shop Actions:

**purchaseShopItem(itemId: string): boolean**
- Validates in shop
- Validates game is active
- Gets item from shop
- Checks if player can afford
- If affordable:
  - Deducts money via gameState.spendMoney()
  - Applies item based on type:
    - **Joker**: gameState.addJoker() or replaceJoker()
    - **Planet**: gameState.applyPlanetCard()
    - **Tarot**: gameState.addConsumable() or replaceConsumable()
  - Calls shop.purchaseItem(itemId, money)
  - Triggers onStateChange callback
  - Auto-saves
  - Returns true
- If not affordable: returns false

**rerollShop(): boolean**
- Validates in shop
- Checks if player can afford reroll cost ($3)
- If affordable:
  - Calls shop.reroll(money)
  - Deducts money via gameState.spendMoney()
  - Triggers onStateChange callback
  - Auto-saves
  - Returns true
- If not affordable: returns false

### Consumable Actions:

**useConsumable(consumableIndex: number, targetCardId?: string): void**
- Validates game is active
- Validates not in shop
- Gets consumable at index
- If TargetedTarot:
  - Requires targetCardId
  - Calls gameState.applyTargetedTarot(tarot, targetCardId)
  - Handles special effects (Death duplicate, Hanged Man destroy)
- If InstantTarot:
  - Calls gameState.applyInstantTarot(tarot)
- Removes consumable from inventory
- Triggers onStateChange callback
- Auto-saves

### Victory/Defeat:

**checkVictoryCondition() [PRIVATE]:**
- Returns true if gameState.getLevelNumber() > 24
- Called after exitShop()

**checkDefeatCondition() [PRIVATE]:**
- Returns true if gameState.isGameOver()
- Called after playSelectedHand()

**triggerVictory() [PRIVATE]:**
- Sets isGameActive = false
- Triggers onVictory callback
- Clears saved game

**triggerDefeat() [PRIVATE]:**
- Sets isGameActive = false
- Triggers onDefeat callback
- Clears saved game

### Auto-Save:

**saveGame() [PRIVATE]:**
- Calls gamePersistence.saveGame(gameState)
- Wrapped in try-catch (errors logged, not thrown)
- Called after every significant state change

### Getters:

- getGameState(): GameState | null
- getShop(): Shop | null
- isInShop(): boolean
- isGameActive(): boolean

## Shop Item Handling:

### Joker Purchase:
- If joker slots < 5: addJoker()
- If joker slots = 5: UI must prompt which to replace, then replaceJoker(index)

### Consumable Purchase:
- If consumable slots < 2: addConsumable()
- If consumable slots = 2: UI must prompt which to replace, then replaceConsumable(index)

### Planet Purchase:
- Immediately apply to upgradeManager
- Does NOT go into inventory

## Edge Cases:
- Action before game started (throw error)
- Action while in shop (throw error for game actions)
- Action outside shop (throw error for shop actions)
- Purchase with insufficient funds (return false, no change)
- Reroll with insufficient funds (return false)
- Death tarot: duplicate card added to deck
- Hanged Man tarot: card removed from hand
- Victory check after every exitShop()
- Defeat check after every playSelectedHand()
- Persistence errors handled gracefully (logged, not thrown)
- Null gameState when expected (validation)

# TASK

Generate a complete unit test suite for GameController that covers:

## 1. Constructor Tests

- [ ] Initializes with null gameState
- [ ] Initializes with null shop
- [ ] Sets isInShop to false
- [ ] Sets isGameActive to false
- [ ] Initializes GamePersistence
- [ ] Accepts optional callbacks
- [ ] Works without callbacks (no errors)

## 2. Game Lifecycle Tests

### startNewGame():
- [ ] Creates new GameState
- [ ] Deals initial hand
- [ ] Sets isGameActive to true
- [ ] Triggers onStateChange callback
- [ ] Auto-saves game state
- [ ] gameState is not null after start

### continueGame():
- [ ] Returns true if saved game exists
- [ ] Restores GameState from save
- [ ] Sets isGameActive to true
- [ ] Triggers onStateChange callback
- [ ] Returns false if no saved game
- [ ] Does not change state if no save

### endGame():
- [ ] Sets isGameActive to false
- [ ] Sets gameState to null
- [ ] Sets shop to null
- [ ] Triggers onStateChange callback
- [ ] Can be called multiple times (idempotent)

## 3. Player Action Tests (Delegation)

### selectCard():
- [ ] Validates game is active
- [ ] Validates not in shop
- [ ] Calls gameState.selectCard(cardId)
- [ ] Triggers onStateChange callback
- [ ] Auto-saves after selection
- [ ] Throws error if game not active
- [ ] Throws error if in shop

### clearSelection():
- [ ] Validates game is active
- [ ] Calls gameState.clearSelection()
- [ ] Triggers onStateChange callback
- [ ] Throws error if game not active

### playSelectedHand():
- [ ] Validates game is active
- [ ] Validates not in shop
- [ ] Calls gameState.playHand()
- [ ] Triggers onStateChange callback
- [ ] Auto-saves after play
- [ ] Checks level completion
- [ ] Checks defeat condition
- [ ] Opens shop when level complete
- [ ] Triggers onDefeat when game over

### discardSelected():
- [ ] Validates game is active
- [ ] Validates not in shop
- [ ] Calls gameState.discardCards()
- [ ] Triggers onStateChange callback
- [ ] Auto-saves after discard

## 4. Level Completion Flow Tests

### completeBlind():
- [ ] Called when level complete
- [ ] Opens shop
- [ ] Triggers onShopOpen callback
- [ ] Shop has 4 items

### openShop():
- [ ] Sets isInShop to true
- [ ] Creates new Shop instance
- [ ] Shop has 4 items
- [ ] Triggers onShopOpen callback
- [ ] Auto-saves state

### exitShop():
- [ ] Sets isInShop to false
- [ ] Sets shop to null
- [ ] Calls gameState.advanceToNextBlind()
- [ ] Calls gameState.dealHand()
- [ ] Checks victory condition
- [ ] Triggers onShopClose callback
- [ ] Triggers onStateChange callback
- [ ] Auto-saves state
- [ ] Triggers onVictory if level > 24

## 5. Shop Action Tests

### purchaseShopItem() - Success Cases:
- [ ] Joker purchase when slots available
- [ ] Planet purchase (immediate application)
- [ ] Tarot purchase when slots available
- [ ] Deducts money correctly
- [ ] Returns true on success
- [ ] Triggers onStateChange callback
- [ ] Auto-saves after purchase
- [ ] Item removed from shop

### purchaseShopItem() - Failure Cases:
- [ ] Returns false when insufficient funds
- [ ] No money deducted on failure
- [ ] No item added on failure
- [ ] Shop state unchanged on failure

### purchaseShopItem() - Inventory Full:
- [ ] Joker when 5 jokers present (needs replaceJoker)
- [ ] Tarot when 2 tarots present (needs replaceConsumable)
- [ ] Throws error or handles gracefully

### purchaseShopItem() - Validation:
- [ ] Throws error if not in shop
- [ ] Throws error if game not active
- [ ] Throws error on invalid itemId

### rerollShop():
- [ ] Returns true when affordable
- [ ] Deducts reroll cost ($3)
- [ ] Regenerates shop items
- [ ] Returns false when insufficient funds
- [ ] No money deducted on failure
- [ ] Shop unchanged on failure
- [ ] Triggers onStateChange callback
- [ ] Auto-saves on success

## 6. Consumable Action Tests

### useConsumable() - Targeted Tarots:
- [ ] The Emperor: adds chips to target card
- [ ] The Empress: adds mult to target card
- [ ] Strength: upgrades target card value
- [ ] The Star/Moon/Sun/World: changes card suit
- [ ] Requires targetCardId parameter
- [ ] Throws error if targetCardId not provided
- [ ] Removes consumable after use
- [ ] Triggers onStateChange callback
- [ ] Auto-saves after use

### useConsumable() - Instant Tarots:
- [ ] The Hermit: doubles money
- [ ] Does not require targetCardId
- [ ] Removes consumable after use
- [ ] Triggers onStateChange callback

### useConsumable() - Special Effects:
- [ ] Death: duplicates card, adds to deck
- [ ] Hanged Man: destroys card, removes from hand
- [ ] Effects applied correctly

### useConsumable() - Validation:
- [ ] Throws error if game not active
- [ ] Throws error if in shop
- [ ] Throws error on invalid consumable index

## 7. Victory/Defeat Tests

### Victory Condition:
- [ ] checkVictoryCondition returns true when level > 24
- [ ] checkVictoryCondition returns false when level ≤ 24
- [ ] triggerVictory sets isGameActive to false
- [ ] triggerVictory triggers onVictory callback
- [ ] triggerVictory clears saved game
- [ ] Victory checked after exitShop()

### Defeat Condition:
- [ ] checkDefeatCondition returns true when gameState.isGameOver()
- [ ] checkDefeatCondition returns false otherwise
- [ ] triggerDefeat sets isGameActive to false
- [ ] triggerDefeat triggers onDefeat callback
- [ ] triggerDefeat clears saved game
- [ ] Defeat checked after playSelectedHand()

## 8. Auto-Save Tests

### saveGame():
- [ ] Called after startNewGame()
- [ ] Called after selectCard()
- [ ] Called after playSelectedHand()
- [ ] Called after discardSelected()
- [ ] Called after purchaseShopItem()
- [ ] Called after rerollShop()
- [ ] Called after exitShop()
- [ ] Called after useConsumable()
- [ ] Errors caught and logged (not thrown)

### Persistence Integration:
- [ ] GamePersistence.saveGame() called with gameState
- [ ] Save errors don't crash game
- [ ] Can continue game after save error

## 9. Callback Tests

### onStateChange:
- [ ] Triggered after startNewGame()
- [ ] Triggered after selectCard()
- [ ] Triggered after playSelectedHand()
- [ ] Triggered after discardSelected()
- [ ] Triggered after purchaseShopItem()
- [ ] Triggered after exitShop()
- [ ] Not triggered if callback not provided

### onShopOpen:
- [ ] Triggered when shop opens
- [ ] Triggered after level completion
- [ ] Not triggered if callback not provided

### onShopClose:
- [ ] Triggered when shop closes
- [ ] Triggered after exitShop()
- [ ] Not triggered if callback not provided

### onVictory:
- [ ] Triggered when game won
- [ ] Triggered only once
- [ ] Not triggered if callback not provided

### onDefeat:
- [ ] Triggered when game lost
- [ ] Triggered only once
- [ ] Not triggered if callback not provided

## 10. Complete Game Flow Integration Tests

### Full Level Cycle:
- [ ] Start game
- [ ] Play hands until level complete
- [ ] Shop opens automatically
- [ ] Purchase item
- [ ] Exit shop
- [ ] Next level starts
- [ ] Repeat until victory or defeat

### Victory Path:
- [ ] Start game
- [ ] Complete 24 levels (simplified/mocked)
- [ ] Shop after level 24
- [ ] Exit shop
- [ ] Victory triggered
- [ ] onVictory callback called
- [ ] Game becomes inactive

### Defeat Path:
- [ ] Start game
- [ ] Play 3 hands with low score
- [ ] All hands exhausted
- [ ] Score < goal
- [ ] Defeat triggered
- [ ] onDefeat callback called
- [ ] Game becomes inactive

### With Shop Purchases:
- [ ] Purchase Joker in shop
- [ ] Joker persists across levels
- [ ] Joker affects score calculation
- [ ] Purchase Planet
- [ ] Upgrade reflected in next hand

### Save/Load Cycle:
- [ ] Start game
- [ ] Play some hands
- [ ] Auto-save occurs
- [ ] Create new controller
- [ ] Continue game
- [ ] State restored correctly
- [ ] Can continue playing

## 11. Edge Cases

### State Validation:
- [ ] Actions before game started throw error
- [ ] Shop actions outside shop throw error
- [ ] Game actions in shop throw error
- [ ] Null checks on gameState

### Inventory Management:
- [ ] Joker purchase when 5 slots full (error or special handling)
- [ ] Tarot purchase when 2 slots full (error or special handling)
- [ ] Planet purchase always succeeds (no inventory)

### Money Edge Cases:
- [ ] Purchase when money = exact cost
- [ ] Purchase when money = $0 (fails)
- [ ] Reroll when money = $2 (fails, cost is $3)
- [ ] Hermit tarot with $0 money (results in $0)

### Callback Safety:
- [ ] Null callbacks don't throw errors
- [ ] Callback errors don't crash controller
- [ ] Multiple callbacks can be registered

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GameController } from '@/controllers';
import { GameState } from '@/models/game';
import { Shop } from '@/services/shop';
import { GamePersistence } from '@/services/persistence';

describe('GameController', () => {
  let controller: GameController;
  let onStateChange: jest.Mock;
  let onShopOpen: jest.Mock;
  let onShopClose: jest.Mock;
  let onVictory: jest.Mock;
  let onDefeat: jest.Mock;

  beforeEach(() => {
    // Create mock callbacks
    onStateChange = jest.fn();
    onShopOpen = jest.fn();
    onShopClose = jest.fn();
    onVictory = jest.fn();
    onDefeat = jest.fn();

    controller = new GameController({
      onStateChange,
      onShopOpen,
      onShopClose,
      onVictory,
      onDefeat
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with null gameState', () => {
      // ASSERT
      expect(controller.getGameState()).toBeNull();
    });

    it('should initialize with null shop', () => {
      // ASSERT
      expect(controller.getShop()).toBeNull();
    });

    it('should set isInShop to false', () => {
      // ASSERT
      expect(controller.isInShop()).toBe(false);
    });

    it('should set isGameActive to false', () => {
      // ASSERT
      expect(controller.isGameActive()).toBe(false);
    });

    it('should work without callbacks', () => {
      // ACT
      const controllerWithoutCallbacks = new GameController();
      
      // ASSERT
      expect(controllerWithoutCallbacks).toBeDefined();
    });
  });

  describe('Game Lifecycle', () => {
    describe('startNewGame', () => {
      it('should create new GameState', () => {
        // ACT
        controller.startNewGame();
        
        // ASSERT
        expect(controller.getGameState()).not.toBeNull();
        expect(controller.getGameState()).toBeInstanceOf(GameState);
      });

      it('should deal initial hand', () => {
        // ACT
        controller.startNewGame();
        
        // ASSERT
        const gameState = controller.getGameState();
        expect(gameState!.getCurrentHand()).toHaveLength(8);
      });

      it('should set isGameActive to true', () => {
        // ACT
        controller.startNewGame();
        
        // ASSERT
        expect(controller.isGameActive()).toBe(true);
      });

      it('should trigger onStateChange callback', () => {
        // ACT
        controller.startNewGame();
        
        // ASSERT
        expect(onStateChange).toHaveBeenCalled();
      });
    });

    describe('continueGame', () => {
      it('should return false if no saved game exists', () => {
        // ACT
        const result = controller.continueGame();
        
        // ASSERT
        expect(result).toBe(false);
        expect(controller.getGameState()).toBeNull();
      });

      it('should return true and restore state if saved game exists', () => {
        // ARRANGE - Save a game first
        controller.startNewGame();
        // Game is auto-saved
        
        // Create new controller
        const newController = new GameController();
        
        // ACT
        const result = newController.continueGame();
        
        // ASSERT
        expect(result).toBe(true);
        expect(newController.getGameState()).not.toBeNull();
        expect(newController.isGameActive()).toBe(true);
      });
    });

    describe('endGame', () => {
      it('should set isGameActive to false', () => {
        // ARRANGE
        controller.startNewGame();
        
        // ACT
        controller.endGame();
        
        // ASSERT
        expect(controller.isGameActive()).toBe(false);
      });

      it('should set gameState to null', () => {
        // ARRANGE
        controller.startNewGame();
        
        // ACT
        controller.endGame();
        
        // ASSERT
        expect(controller.getGameState()).toBeNull();
      });

      it('should trigger onStateChange callback', () => {
        // ARRANGE
        controller.startNewGame();
        onStateChange.mockClear(); // Clear previous calls
        
        // ACT
        controller.endGame();
        
        // ASSERT
        expect(onStateChange).toHaveBeenCalled();
      });
    });
  });

  describe('Player Actions', () => {
    beforeEach(() => {
      controller.startNewGame();
      onStateChange.mockClear(); // Clear constructor calls
    });

    describe('selectCard', () => {
      it('should call gameState.selectCard()', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        const hand = gameState.getCurrentHand();
        const cardId = hand[0].id;
        
        // ACT
        controller.selectCard(cardId);
        
        // ASSERT
        expect(gameState.getSelectedCards()).toHaveLength(1);
        expect(gameState.getSelectedCards()[0].id).toBe(cardId);
      });

      it('should trigger onStateChange callback', () => {
        // ARRANGE
        const hand = controller.getGameState()!.getCurrentHand();
        
        // ACT
        controller.selectCard(hand[0].id);
        
        // ASSERT
        expect(onStateChange).toHaveBeenCalled();
      });

      it('should throw error if game not active', () => {
        // ARRANGE
        controller.endGame();
        
        // ACT & ASSERT
        expect(() => controller.selectCard('some-id'))
          .toThrow('Game is not active');
      });

      it('should throw error if in shop', () => {
        // ARRANGE
        // Manually set isInShop for test
        controller['isInShop'] = true;
        
        // ACT & ASSERT
        expect(() => controller.selectCard('some-id'))
          .toThrow('Cannot select cards while in shop');
      });
    });

    describe('playSelectedHand', () => {
      it('should call gameState.playHand()', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        const hand = gameState.getCurrentHand();
        controller.selectCard(hand[0].id);
        controller.selectCard(hand[1].id);
        
        // ACT
        controller.playSelectedHand();
        
        // ASSERT
        expect(gameState.getHandsRemaining()).toBe(2); // Decremented from 3
        expect(gameState.getAccumulatedScore()).toBeGreaterThan(0);
      });

      it('should trigger onStateChange callback', () => {
        // ARRANGE
        const hand = controller.getGameState()!.getCurrentHand();
        controller.selectCard(hand[0].id);
        onStateChange.mockClear();
        
        // ACT
        controller.playSelectedHand();
        
        // ASSERT
        expect(onStateChange).toHaveBeenCalled();
      });

      it('should open shop when level complete', () => {
        // ARRANGE - Play hands until level complete
        const gameState = controller.getGameState()!;
        
        // Manually set accumulated score to complete level
        gameState['accumulatedScore'] = 300; // Meets goal
        
        const hand = gameState.getCurrentHand();
        controller.selectCard(hand[0].id);
        
        // ACT
        controller.playSelectedHand();
        
        // ASSERT
        expect(controller.isInShop()).toBe(true);
        expect(onShopOpen).toHaveBeenCalled();
      });

      it('should trigger defeat when game over', () => {
        // ARRANGE - Exhaust all hands with low score
        const gameState = controller.getGameState()!;
        
        // Play 3 hands with minimal cards
        for (let i = 0; i < 3; i++) {
          const hand = gameState.getCurrentHand();
          controller.selectCard(hand[0].id); // Single card
          controller.playSelectedHand();
          
          if (i < 2) {
            gameState.dealHand(); // Deal for next hand
          }
        }
        
        // ASSERT
        if (gameState.getAccumulatedScore() < 300) {
          expect(controller.isGameActive()).toBe(false);
          expect(onDefeat).toHaveBeenCalled();
        }
      });
    });

    describe('discardSelected', () => {
      it('should call gameState.discardCards()', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        const hand = gameState.getCurrentHand();
        controller.selectCard(hand[0].id);
        
        // ACT
        controller.discardSelected();
        
        // ASSERT
        expect(gameState.getDiscardsRemaining()).toBe(2); // Decremented from 3
        expect(gameState.getCurrentHand()).toHaveLength(8); // Replaced
      });

      it('should trigger onStateChange callback', () => {
        // ARRANGE
        const hand = controller.getGameState()!.getCurrentHand();
        controller.selectCard(hand[0].id);
        onStateChange.mockClear();
        
        // ACT
        controller.discardSelected();
        
        // ASSERT
        expect(onStateChange).toHaveBeenCalled();
      });
    });
  });

  describe('Shop Flow', () => {
    beforeEach(() => {
      controller.startNewGame();
      
      // Complete level to open shop
      const gameState = controller.getGameState()!;
      gameState['accumulatedScore'] = 300; // Force level complete
      
      const hand = gameState.getCurrentHand();
      controller.selectCard(hand[0].id);
      controller.playSelectedHand();
    });

    describe('openShop', () => {
      it('should set isInShop to true', () => {
        // ASSERT (shop already opened in beforeEach)
        expect(controller.isInShop()).toBe(true);
      });

      it('should create new Shop instance', () => {
        // ASSERT
        expect(controller.getShop()).not.toBeNull();
        expect(controller.getShop()).toBeInstanceOf(Shop);
      });

      it('should have 4 items in shop', () => {
        // ASSERT
        const shop = controller.getShop()!;
        expect(shop.getAvailableItems()).toHaveLength(4);
      });

      it('should trigger onShopOpen callback', () => {
        // ASSERT (already triggered in beforeEach)
        expect(onShopOpen).toHaveBeenCalled();
      });
    });

    describe('exitShop', () => {
      it('should set isInShop to false', () => {
        // ACT
        controller.exitShop();
        
        // ASSERT
        expect(controller.isInShop()).toBe(false);
      });

      it('should set shop to null', () => {
        // ACT
        controller.exitShop();
        
        // ASSERT
        expect(controller.getShop()).toBeNull();
      });

      it('should advance to next blind', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        const levelBefore = gameState.getLevelNumber();
        
        // ACT
        controller.exitShop();
        
        // ASSERT
        expect(gameState.getLevelNumber()).toBe(levelBefore + 1);
      });

      it('should deal new hand', () => {
        // ACT
        controller.exitShop();
        
        // ASSERT
        const gameState = controller.getGameState()!;
        expect(gameState.getCurrentHand()).toHaveLength(8);
      });

      it('should trigger onShopClose callback', () => {
        // ACT
        controller.exitShop();
        
        // ASSERT
        expect(onShopClose).toHaveBeenCalled();
      });
    });

    describe('purchaseShopItem', () => {
      it('should purchase joker when affordable', () => {
        // ARRANGE
        const shop = controller.getShop()!;
        const items = shop.getAvailableItems();
        const jokerItem = items.find(item => item.type === 'JOKER');
        
        if (jokerItem) {
          const gameState = controller.getGameState()!;
          const moneyBefore = gameState.getMoney();
          
          // ACT
          const result = controller.purchaseShopItem(jokerItem.id);
          
          // ASSERT
          expect(result).toBe(true);
          expect(gameState.getMoney()).toBe(moneyBefore - jokerItem.cost);
          expect(gameState.getJokers()).toHaveLength(1);
        }
      });

      it('should purchase planet and apply upgrade', () => {
        // ARRANGE
        const shop = controller.getShop()!;
        const items = shop.getAvailableItems();
        const planetItem = items.find(item => item.type === 'PLANET');
        
        if (planetItem) {
          const gameState = controller.getGameState()!;
          
          // ACT
          const result = controller.purchaseShopItem(planetItem.id);
          
          // ASSERT
          expect(result).toBe(true);
          // Planet applied immediately, not in inventory
          expect(gameState.getConsumables()).toHaveLength(0);
        }
      });

      it('should return false when insufficient funds', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        // Spend all money
        gameState.spendMoney(gameState.getMoney());
        
        const shop = controller.getShop()!;
        const items = shop.getAvailableItems();
        const itemId = items[0].id;
        
        // ACT
        const result = controller.purchaseShopItem(itemId);
        
        // ASSERT
        expect(result).toBe(false);
        expect(gameState.getMoney()).toBe(0); // No change
      });

      it('should trigger onStateChange callback on success', () => {
        // ARRANGE
        const shop = controller.getShop()!;
        const items = shop.getAvailableItems();
        onStateChange.mockClear();
        
        // ACT
        controller.purchaseShopItem(items[0].id);
        
        // ASSERT (if affordable)
        if (controller.getGameState()!.getMoney() >= items[0].cost) {
          expect(onStateChange).toHaveBeenCalled();
        }
      });
    });

    describe('rerollShop', () => {
      it('should reroll when affordable', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        gameState.addMoney(10); // Ensure enough money
        
        const shop = controller.getShop()!;
        const itemsBefore = shop.getAvailableItems().map(i => i.id);
        
        // ACT
        const result = controller.rerollShop();
        
        // ASSERT
        expect(result).toBe(true);
        expect(gameState.getMoney()).toBeLessThan(gameState.getMoney() + 3); // Deducted $3
        
        const itemsAfter = shop.getAvailableItems().map(i => i.id);
        expect(itemsAfter).not.toEqual(itemsBefore); // New items
      });

      it('should return false when insufficient funds', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        gameState.spendMoney(gameState.getMoney()); // $0
        
        // ACT
        const result = controller.rerollShop();
        
        // ASSERT
        expect(result).toBe(false);
      });
    });
  });

  describe('Consumable Actions', () => {
    beforeEach(() => {
      controller.startNewGame();
      
      // Add a consumable for testing
      const gameState = controller.getGameState()!;
      const tarot = new TargetedTarot(
        'empress',
        'Empress',
        'Add mult',
        TarotEffect.ADD_MULT,
        (card) => card.addPermanentBonus(0, 4)
      );
      gameState.addConsumable(tarot);
    });

    describe('useConsumable', () => {
      it('should use targeted tarot with target card', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        const hand = gameState.getCurrentHand();
        const targetCard = hand[0];
        
        // ACT
        controller.useConsumable(0, targetCard.id);
        
        // ASSERT
        expect(targetCard.multBonus).toBe(4);
        expect(gameState.getConsumables()).toHaveLength(0); // Removed
      });

      it('should remove consumable after use', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        const hand = gameState.getCurrentHand();
        
        // ACT
        controller.useConsumable(0, hand[0].id);
        
        // ASSERT
        expect(gameState.getConsumables()).toHaveLength(0);
      });

      it('should trigger onStateChange callback', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        const hand = gameState.getCurrentHand();
        onStateChange.mockClear();
        
        // ACT
        controller.useConsumable(0, hand[0].id);
        
        // ASSERT
        expect(onStateChange).toHaveBeenCalled();
      });

      it('should throw error if game not active', () => {
        // ARRANGE
        controller.endGame();
        
        // ACT & ASSERT
        expect(() => controller.useConsumable(0, 'card-id'))
          .toThrow('Game is not active');
      });

      it('should throw error if in shop', () => {
        // ARRANGE - Force shop state
        controller['isInShop'] = true;
        
        // ACT & ASSERT
        expect(() => controller.useConsumable(0, 'card-id'))
          .toThrow('Cannot use consumables in shop');
      });
    });
  });

  describe('Victory/Defeat Conditions', () => {
    beforeEach(() => {
      controller.startNewGame();
    });

    describe('Victory', () => {
      it('should trigger victory when level > 24', () => {
        // ARRANGE - Force level to 25
        const gameState = controller.getGameState()!;
        gameState['levelNumber'] = 25;
        
        // Simulate shop exit (which checks victory)
        controller['isInShop'] = true;
        
        // ACT
        controller.exitShop();
        
        // ASSERT
        expect(controller.isGameActive()).toBe(false);
        expect(onVictory).toHaveBeenCalled();
      });

      it('should clear saved game on victory', () => {
        // ARRANGE
        const gameState = controller.getGameState()!;
        gameState['levelNumber'] = 25;
        controller['isInShop'] = true;
        
        // ACT
        controller.exitShop();
        
        // ASSERT - New controller should not find save
        const newController = new GameController();
        expect(newController.continueGame()).toBe(false);
      });
    });

    describe('Defeat', () => {
      it('should trigger defeat when game over', () => {
        // ARRANGE - Force game over state
        const gameState = controller.getGameState()!;
        gameState['handsRemaining'] = 0;
        gameState['accumulatedScore'] = 100; // Less than 300 goal
        
        // ACT - Trigger check via playSelectedHand mock
        controller['checkDefeatCondition']();
        if (gameState.isGameOver()) {
          controller['triggerDefeat']();
        }
        
        // ASSERT
        expect(controller.isGameActive()).toBe(false);
        expect(onDefeat).toHaveBeenCalled();
      });
    });
  });

  describe('Callbacks', () => {
    it('should handle null callbacks gracefully', () => {
      // ARRANGE
      const controllerNoCallbacks = new GameController();
      
      // ACT & ASSERT - Should not throw
      expect(() => {
        controllerNoCallbacks.startNewGame();
        const hand = controllerNoCallbacks.getGameState()!.getCurrentHand();
        controllerNoCallbacks.selectCard(hand[0].id);
        controllerNoCallbacks.playSelectedHand();
      }).not.toThrow();
    });

    it('should trigger onStateChange at appropriate times', () => {
      // ARRANGE
      controller.startNewGame();
      onStateChange.mockClear();
      
      // ACT - Perform various actions
      const hand = controller.getGameState()!.getCurrentHand();
      controller.selectCard(hand[0].id);
      controller.clearSelection();
      controller.selectCard(hand[0].id);
      controller.playSelectedHand();
      
      // ASSERT
      expect(onStateChange.mock.calls.length).toBeGreaterThan(3);
    });
  });

  describe('Auto-Save', () => {
    it('should auto-save after significant actions', () => {
      // ARRANGE
      const saveSpy = jest.spyOn(GamePersistence.prototype, 'saveGame');
      
      // ACT
      controller.startNewGame();
      const hand = controller.getGameState()!.getCurrentHand();
      controller.selectCard(hand[0].id);
      controller.playSelectedHand();
      
      // ASSERT
      expect(saveSpy).toHaveBeenCalledTimes(3); // start, select, play
      
      saveSpy.mockRestore();
    });

    it('should handle save errors gracefully', () => {
      // ARRANGE
      const saveSpy = jest.spyOn(GamePersistence.prototype, 'saveGame')
        .mockImplementation(() => {
          throw new Error('Save failed');
        });
      
      // ACT & ASSERT - Should not throw
      expect(() => {
        controller.startNewGame();
      }).not.toThrow();
      
      saveSpy.mockRestore();
    });
  });

  describe('Complete Game Flow Integration', () => {
    it('should complete full level cycle', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Simulate level completion
      gameState['accumulatedScore'] = 300; // Force complete
      const hand = gameState.getCurrentHand();
      controller.selectCard(hand[0].id);
      controller.playSelectedHand();
      
      // ASSERT - Shop should be open
      expect(controller.isInShop()).toBe(true);
      
      // ACT - Exit shop
      controller.exitShop();
      
      // ASSERT - Next level started
      expect(controller.isInShop()).toBe(false);
      expect(gameState.getLevelNumber()).toBe(2);
      expect(gameState.getCurrentHand()).toHaveLength(8);
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for GameController
- All public methods tested
- Complete game flow integration
- Callback mechanism verified
- Auto-save functionality tested
- Victory/defeat paths covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| Constructor | Initialization | 5 | 0 | 0 | 5 |
| startNewGame | Lifecycle | 5 | 0 | 0 | 5 |
| continueGame | Save/Load | 2 | 0 | 0 | 2 |
| endGame | Cleanup | 3 | 0 | 0 | 3 |
| selectCard | Delegation | 3 | 0 | 2 | 5 |
| clearSelection | Delegation | 2 | 0 | 1 | 3 |
| playSelectedHand | Play logic | 4 | 2 | 0 | 6 |
| discardSelected | Discard logic | 3 | 0 | 0 | 3 |
| openShop | Shop flow | 4 | 0 | 0 | 4 |
| exitShop | Shop flow | 6 | 0 | 0 | 6 |
| purchaseShopItem | Purchases | 5 | 2 | 1 | 8 |
| rerollShop | Reroll | 2 | 1 | 0 | 3 |
| useConsumable | Tarot usage | 4 | 0 | 2 | 6 |
| Victory | Conditions | 2 | 0 | 0 | 2 |
| Defeat | Conditions | 1 | 0 | 0 | 1 |
| Callbacks | Triggering | 3 | 0 | 0 | 3 |
| Auto-Save | Persistence | 2 | 0 | 0 | 2 |
| Integration | Full flow | 1 | 0 | 0 | 1 |
| **TOTAL** | | | | | **68** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **92%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios:
  - Some error logging paths
  - Edge cases in callback error handling

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/controllers/game-controller.test.ts

# Run with coverage
npm test -- --coverage tests/unit/controllers/game-controller.test.ts

# Run in watch mode
npm test -- --watch tests/unit/controllers/game-controller.test.ts

# Run specific sections
npm test -- -t "Shop Flow" tests/unit/controllers/game-controller.test.ts
npm test -- -t "Victory/Defeat" tests/unit/controllers/game-controller.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Callback safety:** Null callbacks should not throw errors
- **Auto-save errors:** Should be logged but not crash the game
- **State validation:** All actions validate game is active
- **Shop state:** Game actions blocked in shop, shop actions blocked in game
- **Victory timing:** Checked after exitShop() when level > 24
- **Defeat timing:** Checked after playSelectedHand() when hands exhausted
- **Inventory full:** Joker/Tarot purchase when slots full needs special handling
- **Planet immediate application:** Planets don't go to inventory
- **Death tarot:** Adds duplicate to deck, not hand
- **Save/load cycle:** State fully restored, game continues normally

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to force level completion
function forceLevelComplete(controller: GameController): void {
  const gameState = controller.getGameState()!;
  gameState['accumulatedScore'] = gameState.getCurrentBlind().getScoreGoal();
  
  const hand = gameState.getCurrentHand();
  controller.selectCard(hand[0].id);
  controller.playSelectedHand();
}

// Helper to create mock callbacks
function createMockCallbacks() {
  return {
    onStateChange: jest.fn(),
    onShopOpen: jest.fn(),
    onShopClose: jest.fn(),
    onVictory: jest.fn(),
    onDefeat: jest.fn()
  };
}

// Helper to verify callback was called
function expectCallbackCalled(callback: jest.Mock, times: number = 1): void {
  expect(callback).toHaveBeenCalledTimes(times);
}

// Helper to advance multiple levels
function advanceLevels(controller: GameController, count: number): void {
  for (let i = 0; i < count; i++) {
    forceLevelComplete(controller);
    if (controller.isInShop()) {
      controller.exitShop();
    }
  }
}
```
