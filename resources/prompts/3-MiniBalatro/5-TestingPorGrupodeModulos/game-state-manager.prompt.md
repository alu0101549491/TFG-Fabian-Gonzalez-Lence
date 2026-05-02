# TESTING CONTEXT
Project: Mini Balatro
Components under test: GameState (central game coordinator)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/game/game-state.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/game/game-state.ts
 * @desc Central game state manager coordinating all game subsystems.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Deck } from '../core/deck';
import { Card } from '../core/card';
import { Joker } from '../special-cards/jokers/joker';
import { EconomicJoker } from '../special-cards/jokers/economic-joker';
import { PermanentUpgradeJoker } from '../special-cards/jokers/permanent-upgrade-joker';
import { Tarot } from '../special-cards/tarots/tarot';
import { TargetedTarot } from '../special-cards/tarots/targeted-tarot';
import { TarotEffect } from '../special-cards/tarots/tarot-effect.enum';
import { Blind } from '../blinds/blind';
import { BlindGenerator } from '../blinds/blind-generator';
import { HandUpgradeManager } from '../poker/hand-upgrade-manager';
import { ScoreCalculator } from '../scoring/score-calculator';
import { ScoreResult } from '../scoring/score-result';
import { HandEvaluator } from '../poker/hand-evaluator';
import { BossBlind } from '../blinds/boss-blind';
import { GameConfig } from '../../services/config/game-config';

/**
 * Central game state manager.
 * Coordinates all game subsystems and maintains complete game state.
 * Enforces game rules and manages progression.
 */
export class GameState {
  private deck: Deck;
  private currentHand: Card[];
  private selectedCards: Card[];
  private jokers: Joker[];
  private consumables: Tarot[];
  private currentBlind: Blind;
  private money: number;
  private accumulatedScore: number;
  private handsRemaining: number;
  private discardsRemaining: number;
  private levelNumber: number;
  private roundNumber: number;
  private upgradeManager: HandUpgradeManager;
  private blindGenerator: BlindGenerator;
  private scoreCalculator: ScoreCalculator;

  /**
   * Initializes a new game with starting conditions.
   */
  constructor() {
    this.deck = new Deck();
    this.currentHand = [];
    this.selectedCards = [];
    this.jokers = [];
    this.consumables = [];
    this.money = GameConfig.INITIAL_MONEY; // Starting money
    this.accumulatedScore = 0;
    this.levelNumber = 1;
    this.roundNumber = 1;
    this.handsRemaining = GameConfig.MAX_HANDS_PER_BLIND;
    this.discardsRemaining = GameConfig.MAX_DISCARDS_PER_BLIND;
    this.upgradeManager = new HandUpgradeManager();
    this.blindGenerator = new BlindGenerator();
    this.scoreCalculator = new ScoreCalculator(
      new HandEvaluator(),
      this.upgradeManager
    );

    // Generate first blind
    this.currentBlind = this.blindGenerator.generateBlind(this.levelNumber);
    console.log(`Game initialized. Starting at level ${this.levelNumber} (${this.currentBlind.constructor.name})`);
  }

  /**
   * Returns the HandUpgradeManager instance.
   * @returns HandUpgradeManager
   */
  public getUpgradeManager(): HandUpgradeManager {
    return this.upgradeManager;
  }

  /**
   * Deals 8 cards from deck to current hand (called at level start).
   * @throws Error if deck has < 8 cards remaining
   */
  public dealHand(): void {
    const remaining = this.deck.getRemaining();
    if (remaining < GameConfig.HAND_SIZE) {
      // If deck is low, log and throw with context (game rules: empty deck -> loss)
      console.log(`Deck low: have ${remaining}, need ${GameConfig.HAND_SIZE}`);
      throw new Error(`Not enough cards in deck to deal hand (have ${remaining}, need ${GameConfig.HAND_SIZE})`);
    }

    this.currentHand = this.deck.drawCards(GameConfig.HAND_SIZE);
    this.selectedCards = [];
    console.log(`Dealt new hand of ${this.currentHand.length} cards`);
  }

  /**
   * Toggles card selection status (select/deselect).
   * @param cardId - ID of card to toggle
   * @throws Error if cardId not in currentHand
   */
  public selectCard(cardId: string): void {
    const cardIndex = this.currentHand.findIndex(card => card.getId() === cardId);
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${cardId} not found in current hand`);
    }

    const card = this.currentHand[cardIndex];
    const selectedIndex = this.selectedCards.findIndex(c => c.getId() === cardId);

    if (selectedIndex === -1) {
      // Card not selected, add it if we have room
      if (this.selectedCards.length < GameConfig.MAX_CARDS_TO_PLAY) {
        this.selectedCards.push(card);
        console.log(`Selected card ${card.getDisplayString()}`);
      }
    } else {
      // Card already selected, remove it
      this.selectedCards.splice(selectedIndex, 1);
      console.log(`Deselected card ${card.getDisplayString()}`);
    }
  }

  /**
   * Clears all selected cards.
   */
  public clearSelection(): void {
    this.selectedCards = [];
    console.log('Cleared all selected cards');
  }

  /**
   * Plays selected cards, calculates score, checks level completion.
   * @returns ScoreResult with details of calculation
   * @throws Error if no cards selected, > 5 cards selected, or handsRemaining = 0
   */
  public playHand(): ScoreResult {
    if (this.selectedCards.length === 0) {
      throw new Error('No cards selected to play');
    }
    if (this.selectedCards.length > GameConfig.MAX_CARDS_TO_PLAY) {
      throw new Error(`Cannot play more than ${GameConfig.MAX_CARDS_TO_PLAY} cards at once`);
    }
    if (this.handsRemaining <= 0) {
      throw new Error('No hands remaining');
    }

    // Calculate score - only include scoring jokers (chips, mult, multiplier)
    // Economic jokers like Golden Joker should not affect hand scoring
    // Filter out economic jokers (they don't affect hand scoring)
    const scoringJokers = this.jokers.filter(joker => !(joker instanceof EconomicJoker));

    // Pass total joker count (including economic ones) for proper empty slot calculation
    const result = this.scoreCalculator.calculateScore(
      this.selectedCards,
      scoringJokers,
      this.deck.getRemaining(),
      this.currentBlind.getModifier(),
      this.discardsRemaining,
      this.jokers.length  // Total jokers including economic ones
    );

    // For The Mouth boss: Lock in the hand type after the first hand is played
    // BUT only if the hand actually scored points (wasn't rejected)
    if (this.currentBlind instanceof BossBlind) {
      const bossBlind = this.currentBlind as BossBlind;
      if (bossBlind.getBossType() === 'THE_MOUTH') {
        const modifier = bossBlind.getModifier();
        // If allowedHandTypes is not yet set (null or empty), lock it to the played hand
        if (!modifier.allowedHandTypes || modifier.allowedHandTypes.length === 0) {
          // Only lock if this hand actually scored (wasn't rejected due to being wrong type)
          if (result.handType && result.totalScore > 0) {
            bossBlind.setAllowedHandType(result.handType);
            console.log(`The Mouth: First hand played was ${result.handType}, locking this as the only allowed hand type`);
          } else if (result.totalScore === 0) {
            console.log(`The Mouth: Hand ${result.handType} was rejected (0 score), not locking yet. Player can try again.`);
          }
        }
      }
    }

    // Add to accumulated score
    this.accumulatedScore += result.totalScore;
    console.log(`Played hand for ${result.totalScore} points. Total: ${this.accumulatedScore}/${this.currentBlind.getScoreGoal()}`);

    // Apply permanent upgrades from jokers (e.g., Hiker) to played cards
    // This happens AFTER scoring so the upgrades take effect on next play
    const permanentUpgradeJokers = this.jokers.filter(joker => joker instanceof PermanentUpgradeJoker) as PermanentUpgradeJoker[];
    if (permanentUpgradeJokers.length > 0) {
      console.log(`Applying permanent upgrades to ${this.selectedCards.length} played cards...`);
      for (const upgradeJoker of permanentUpgradeJokers) {
        upgradeJoker.upgradeCards(this.selectedCards);
      }
    }

    // Remove played cards from hand and add to discard pile
    const playedCards = [...this.selectedCards]; // Copy before clearing selection
    this.currentHand = this.currentHand.filter(card =>
      !this.selectedCards.some(selected => selected.getId() === card.getId())
    );
    
    // Add played cards to deck's discard pile
    this.deck.addToDiscardPile(playedCards);

    // Draw cards to refill hand to HAND_SIZE (8 cards by default)
    // This ensures hand is always refilled to full size, even if cards were destroyed
    const cardsNeeded = GameConfig.HAND_SIZE - this.currentHand.length;
    if (cardsNeeded > 0 && this.deck.getRemaining() >= cardsNeeded) {
      const replacements = this.deck.drawCards(cardsNeeded);
      this.currentHand.push(...replacements);
      console.log(`Drew ${replacements.length} cards to refill hand to ${GameConfig.HAND_SIZE}`);
    } else if (cardsNeeded > 0) {
      console.log(`Not enough cards in deck to refill hand (need ${cardsNeeded}, have ${this.deck.getRemaining()}) - game rules may cause loss`);
    }

    // Decrement hands remaining
    this.handsRemaining--;

    // Clear selection
    this.clearSelection();

    return result;
  }

  /**
   * Discards selected cards and draws replacements.
   * @throws Error if no cards selected, discardsRemaining = 0, or deck cannot provide replacements
   */
  public discardCards(): void {
    if (this.selectedCards.length === 0) {
      throw new Error('No cards selected to discard');
    }
    if (this.discardsRemaining <= 0) {
      throw new Error('No discards remaining');
    }

    // Remove discarded cards from hand
    const discardedCards = [...this.selectedCards]; // Copy before clearing
    this.currentHand = this.currentHand.filter(card =>
      !this.selectedCards.some(selected => selected.getId() === card.getId())
    );

    // Add discarded cards to deck's discard pile
    this.deck.addToDiscardPile(discardedCards);

    // Draw cards to refill hand to HAND_SIZE (8 cards by default)
    // This ensures hand is always refilled to full size, even if cards were destroyed
    const cardsNeededDiscard = GameConfig.HAND_SIZE - this.currentHand.length;
    if (cardsNeededDiscard > 0 && this.deck.getRemaining() >= cardsNeededDiscard) {
      const replacements = this.deck.drawCards(cardsNeededDiscard);
      this.currentHand.push(...replacements);
      console.log(`Drew ${replacements.length} cards to refill hand to ${GameConfig.HAND_SIZE}`);
    } else if (cardsNeededDiscard > 0) {
      console.log(`Not enough cards in deck to refill hand (need ${cardsNeededDiscard}, have ${this.deck.getRemaining()}) - game rules may cause loss`);
    }

    // Decrement discards remaining
    this.discardsRemaining--;

    // Clear selection
    this.clearSelection();

    console.log(`Discarded ${discardedCards.length} cards, hand refilled to ${this.currentHand.length}. ${this.discardsRemaining} discards remaining`);
  }

  /**
   * Adds joker to active set (max 5).
   * @param joker - Joker to add
   * @returns true if added, false if inventory full (must replace)
   * @throws Error if joker null
   */
  public addJoker(joker: Joker): boolean {
    if (!joker) {
      throw new Error('Joker cannot be null');
    }

    if (this.jokers.length < GameConfig.MAX_JOKERS) {
      this.jokers.push(joker);
      console.log(`Added joker: ${joker.name}`);
      return true;
    }

    return false;
  }

  /**
   * Replaces an existing joker with a new one.
   * @param oldJokerId - ID of joker to replace
   * @param newJoker - New joker to add
   * @throws Error if oldJokerId not found
   */
  public replaceJoker(oldJokerId: string, newJoker: Joker): void {
    if (!newJoker) {
      throw new Error('New joker cannot be null');
    }

    const index = this.jokers.findIndex(j => j.id === oldJokerId);
    if (index === -1) {
      throw new Error(`Joker with ID ${oldJokerId} not found`);
    }

    this.jokers[index] = newJoker;
    console.log(`Replaced joker ${oldJokerId} with ${newJoker.name}`);
  }

  /**
   * Removes joker from active set.
   * @param jokerId - ID of joker to remove
   * @throws Error if jokerId not found
   */
  public removeJoker(jokerId: string): void {
    const index = this.jokers.findIndex(j => j.id === jokerId);
    if (index === -1) {
      throw new Error(`Joker with ID ${jokerId} not found`);
    }

    this.jokers.splice(index, 1);
    console.log(`Removed joker ${jokerId}`);
  }

  /**
   * Adds tarot to consumables inventory (max 2).
   * @param tarot - Tarot to add
   * @returns true if added, false if inventory full (must replace)
   * @throws Error if tarot null
   */
  public addConsumable(tarot: Tarot): boolean {
    if (!tarot) {
      throw new Error('Tarot cannot be null');
    }

    if (this.consumables.length < GameConfig.MAX_CONSUMABLES) {
      this.consumables.push(tarot);
      console.log(`Added tarot: ${tarot.name}`);
      return true;
    }

    return false;
  }

  /**
   * Replaces an existing tarot with a new one.
   * @param oldTarotId - ID of tarot to replace
   * @param newTarot - New tarot to add
   * @throws Error if oldTarotId not found
   */
  public replaceConsumable(oldTarotId: string, newTarot: Tarot): void {
    if (!newTarot) {
      throw new Error('New tarot cannot be null');
    }

    const index = this.consumables.findIndex(t => t.id === oldTarotId);
    if (index === -1) {
      throw new Error(`Tarot with ID ${oldTarotId} not found`);
    }

    this.consumables[index] = newTarot;
    console.log(`Replaced tarot ${oldTarotId} with ${newTarot.name}`);
  }

  /**
   * Removes a tarot/consumable from inventory.
   * @param tarotId - ID of tarot to remove
   * @throws Error if tarotId not found
   */
  public removeConsumable(tarotId: string): void {
    const index = this.consumables.findIndex(t => t.id === tarotId);
    if (index === -1) {
      throw new Error(`Tarot with ID ${tarotId} not found`);
    }

    this.consumables.splice(index, 1);
    console.log(`Removed consumable ${tarotId}`);
  }

  /**
   * Removes a tarot/consumable from inventory by index.
   * This is useful when there are multiple consumables with the same ID.
   * @param index - Index of tarot to remove in the consumables array
   * @throws Error if index is out of bounds
   */
  public removeConsumableByIndex(index: number): void {
    if (index < 0 || index >= this.consumables.length) {
      throw new Error(`Invalid index ${index} for consumables array of length ${this.consumables.length}`);
    }

    const tarot = this.consumables[index];
    this.consumables.splice(index, 1);
    console.log(`Removed consumable at index ${index}: ${tarot.name} (${tarot.id})`);
  }

  /**
   * Uses a tarot card and removes it from inventory.
   * @param tarotId - ID of tarot to use
   * @param target - Optional target card if required
   * @throws Error if tarotId not found, target required but not provided, or target invalid
   */
  public useConsumable(tarotId: string, target?: Card): void {
    const tarotIndex = this.consumables.findIndex(t => t.id === tarotId);
    if (tarotIndex === -1) {
      throw new Error(`Tarot with ID ${tarotId} not found`);
    }

    const tarot = this.consumables[tarotIndex];

    if (tarot.requiresTarget() && !target) {
      throw new Error('This tarot requires a target card');
    }

    // Apply the tarot effect
    tarot.use(target || this);

    // Handle special effects that modify deck/hand
    if (tarot instanceof TargetedTarot && target) {
      if (tarot.effectType === TarotEffect.DESTROY) {
        // Remove card from hand
        this.currentHand = this.currentHand.filter(c => c.getId() !== target.getId());
        
        // Also remove from selectedCards if it was selected
        // This prevents the bug where destroyed card stays in selection
        this.selectedCards = this.selectedCards.filter(c => c.getId() !== target.getId());
        
        // Decrease max deck size (card is already out of deck, in hand)
        this.deck.decreaseMaxDeckSize();
        console.log(`[The Hanged Man] Permanently destroyed ${target.getDisplayString()}`);
      } else if (tarot.effectType === TarotEffect.DUPLICATE) {
        // Clone the card and add to hand (so it can be played immediately)
        const duplicatedCard = target.clone();
        this.currentHand.push(duplicatedCard);
        // Also increase max deck size to track the new card exists
        this.deck.increaseMaxDeckSize();
        console.log(`[Death] Duplicated ${target.getDisplayString()} - added to hand`);
      }
    }

    // Remove the tarot from inventory
    this.consumables.splice(tarotIndex, 1);
    console.log(`Used tarot: ${tarot.name}`);
  }

  /**
   * Adds money to player's balance.
   * @param amount - Amount to add
   * @throws Error if amount negative
   */
  public addMoney(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    this.money += amount;
    console.log(`Added $${amount}. New balance: $${this.money}`);
  }

  /**
   * Attempts to spend money if sufficient balance.
   * @param amount - Amount to spend
   * @returns true if successful, false if insufficient funds
   * @throws Error if amount <= 0
   */
  public spendMoney(amount: number): boolean {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (this.money >= amount) {
      this.money -= amount;
      console.log(`Spent $${amount}. New balance: $${this.money}`);
      return true;
    }

    return false;
  }

  /**
   * Returns current money balance.
   * @returns Non-negative number
   */
  public getMoney(): number {
    return this.money;
  }

  /**
   * Checks if current blind's goal has been reached.
   * @returns true if accumulatedScore >= currentBlind.getScoreGoal()
   */
  public isLevelComplete(): boolean {
    const goal = this.currentBlind.getScoreGoal();
    const complete = this.accumulatedScore >= goal;
    console.log(`Level completion check: ${this.accumulatedScore}/${goal} = ${complete}`);
    return complete;
  }

  /**
   * Checks if game is lost (hands exhausted without reaching goal).
   * @returns true if handsRemaining = 0 AND accumulatedScore < goal
   */
  public isGameOver(): boolean {
    const goal = this.currentBlind.getScoreGoal();
    const gameOver = this.handsRemaining <= 0 && this.accumulatedScore < goal;
    console.log(`Game over check: ${gameOver}`);
    return gameOver;
  }

  /**
   * Progresses to next level after completing current blind.
   * NOTE: Reward is given in completeBlind(), NOT here, to avoid duplication.
   * @throws Error if level not complete
   */
  public advanceToNextBlind(): void {
    if (!this.isLevelComplete()) {
      throw new Error('Cannot advance to next blind: current level not complete');
    }

    // Reward is already given in GameController.completeBlind()
    // DO NOT add money here to avoid double-rewarding

    // Increment level
    this.levelNumber++;

    // Update round number if needed (every 3 levels)
    this.roundNumber = BlindGenerator.calculateRoundNumber(this.levelNumber);

    // Generate next blind
    this.currentBlind = this.blindGenerator.generateBlind(this.levelNumber);

    // Reset hands and discards
    this.handsRemaining = GameConfig.MAX_HANDS_PER_BLIND;
    this.discardsRemaining = GameConfig.MAX_DISCARDS_PER_BLIND;

    // Apply boss blind modifiers if needed
    if (this.currentBlind instanceof BossBlind) {
      this.applyBlindModifiers();
    }

    // Return current hand cards to discard pile before recombining
    // This ensures all cards are available for the next level
    if (this.currentHand.length > 0) {
      this.deck.addToDiscardPile(this.currentHand);
      console.log(`Returned ${this.currentHand.length} cards from hand to discard pile`);
    }

    // Recombine deck and discard pile, shuffle (preserves card bonuses)
    this.deck.recombineAndShuffle();

    // Reset score and clear hand
    this.accumulatedScore = 0;
    this.currentHand = [];
    this.selectedCards = [];

    console.log(`Advanced to level ${this.levelNumber} (${this.currentBlind.constructor.name})`);
  }

  /**
   * Applies boss blind modifiers to game state.
   */
  private applyBlindModifiers(): void {
    if (!(this.currentBlind instanceof BossBlind)) {
      return;
    }

    const modifier = this.currentBlind.getModifier();

    // Apply hands/discards overrides
    if (modifier.maxHands !== null && modifier.maxHands !== undefined) {
      this.handsRemaining = modifier.maxHands;
    }

    if (modifier.maxDiscards !== null && modifier.maxDiscards !== undefined) {
      this.discardsRemaining = modifier.maxDiscards;
    }

    console.log(`Applied boss modifiers: hands=${this.handsRemaining}, discards=${this.discardsRemaining}`);
  }

  /**
   * Applies level completion rewards: blind reward + any economic jokers.
   * Returns the total amount of money granted.
   */
  public applyLevelRewards(): number {
    let totalGranted = 0;

    // Blind base reward
    const blindReward = this.currentBlind.getReward ? this.currentBlind.getReward() : 0;
    if (blindReward > 0) {
      this.addMoney(blindReward);
      totalGranted += blindReward;
      console.log(`Applied blind reward: $${blindReward}`);
    }

    // Economic jokers provide additional money (e.g., Golden Joker)
    const economicJokers = this.jokers.filter(j => j instanceof EconomicJoker) as EconomicJoker[];
    const econTotal = economicJokers.reduce((sum, j) => sum + (j.getValue ? j.getValue() : 0), 0);
    if (econTotal > 0) {
      this.addMoney(econTotal);
      totalGranted += econTotal;
      console.log(`Applied economic joker bonus: $${econTotal}`);
    }

    return totalGranted;
  }

  // Getter methods
  public getCurrentHand(): Card[] {
    return this.sortCards([...this.currentHand]); // Return sorted copy
  }

  public getSelectedCards(): Card[] {
    return [...this.selectedCards]; // Return copy
  }

  /**
   * Sorts cards by value from highest to lowest (ACE to TWO).
   * @param cards - Array of cards to sort
   * @returns Sorted array of cards
   */
  private sortCards(cards: Card[]): Card[] {
    // Define the order of card values from highest to lowest
    const valueOrder: Record<string, number> = {
      'A': 14,   // ACE
      'K': 13,   // KING
      'Q': 12,   // QUEEN
      'J': 11,   // JACK
      '10': 10,  // TEN
      '9': 9,    // NINE
      '8': 8,    // EIGHT
      '7': 7,    // SEVEN
      '6': 6,    // SIX
      '5': 5,    // FIVE
      '4': 4,    // FOUR
      '3': 3,    // THREE
      '2': 2     // TWO
    };

    return cards.sort((a, b) => {
      const valueA = valueOrder[a.value] || 0;
      const valueB = valueOrder[b.value] || 0;
      return valueB - valueA; // Sort descending (highest to lowest)
    });
  }

  public getJokers(): Joker[] {
    return [...this.jokers]; // Return copy
  }

  public getConsumables(): Tarot[] {
    return [...this.consumables]; // Return copy
  }

  public getCurrentBlind(): Blind {
    return this.currentBlind;
  }

  public getHandsRemaining(): number {
    return this.handsRemaining;
  }

  public getDiscardsRemaining(): number {
    return this.discardsRemaining;
  }

  public getAccumulatedScore(): number {
    return this.accumulatedScore;
  }

  public getLevelNumber(): number {
    return this.levelNumber;
  }

  public getRoundNumber(): number {
    return this.roundNumber;
  }

  public getDeckRemaining(): number {
    return this.deck.getRemaining();
  }

  /**
   * Returns the Deck instance for serialization purposes.
   * @returns The deck instance
   */
  public getDeck(): Deck {
    return this.deck;
  }

  /**
   * Calculates a preview score for the currently selected cards.
   * Does not modify game state.
   * @returns ScoreResult with preview calculations, or null if no cards selected
   */
  public getPreviewScore(): ScoreResult | null {
    if (this.selectedCards.length === 0) {
      return null;
    }

    // Calculate score using the same logic as playing a hand
    // Only include scoring jokers (chips, mult, multiplier)
    const scoringJokers = this.jokers.filter(joker => !(joker instanceof EconomicJoker));

    // Pass total joker count (including economic ones) for proper empty slot calculation
    const result = this.scoreCalculator.calculateScore(
      this.selectedCards,
      scoringJokers,
      this.deck.getRemaining(),
      this.currentBlind.getModifier(),
      this.discardsRemaining,
      this.jokers.length  // Total jokers including economic ones
    );

    return result;
  }

  /**
   * Resets game to initial state for new game.
   */
  public reset(): void {
    this.deck = new Deck();
    this.currentHand = [];
    this.selectedCards = [];
    this.jokers = [];
    this.consumables = [];
    this.money = GameConfig.INITIAL_MONEY;
    this.accumulatedScore = 0;
    this.levelNumber = 1;
    this.roundNumber = 1;
    this.handsRemaining = GameConfig.MAX_HANDS_PER_BLIND;
    this.discardsRemaining = GameConfig.MAX_DISCARDS_PER_BLIND;
    this.upgradeManager = new HandUpgradeManager();
    this.currentBlind = this.blindGenerator.generateBlind(this.levelNumber);

    console.log('Game reset to initial state');
  }

  /**
   * DEBUG: Forces the current blind to be a specific boss type.
   * Useful for testing boss mechanics.
   * @param bossType - The boss type to force (e.g., 'THE_MOUTH', 'THE_WALL', etc.)
   */
  public debugForceBoss(bossType: string): void {
    const validBossTypes = ['THE_WALL', 'THE_WHEEL', 'THE_WATER', 'THE_NEEDLE', 'THE_FLINT', 'THE_MOUTH'];
    
    if (!validBossTypes.includes(bossType)) {
      console.error(`Invalid boss type: ${bossType}. Valid types: ${validBossTypes.join(', ')}`);
      return;
    }

    const newBoss = new BossBlind(this.levelNumber, this.roundNumber, bossType as any);
    this.currentBlind = newBoss;
    this.accumulatedScore = 0;
    this.handsRemaining = GameConfig.MAX_HANDS_PER_BLIND;
    this.discardsRemaining = GameConfig.MAX_DISCARDS_PER_BLIND;
    
    console.log(`🐛 DEBUG: Forced boss to ${bossType}`);
    console.log(`   Goal: ${newBoss.getScoreGoal()}`);
    console.log(`   Modifier: ${JSON.stringify(newBoss.getModifier())}`);
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

## GameState Class Requirements:

### Properties:
- **deck**: Deck instance
- **currentHand**: Card[] (8 cards after deal)
- **selectedCards**: Card[] (max 5 cards)
- **jokers**: Joker[] (max 5)
- **consumables**: Tarot[] (max 2)
- **currentBlind**: Blind instance
- **money**: number (starts at $5)
- **accumulatedScore**: number (current score toward blind goal)
- **handsRemaining**: number (0-3, starts at 3)
- **discardsRemaining**: number (0-3, starts at 3)
- **levelNumber**: number (1-24)
- **roundNumber**: number (calculated from level)
- **upgradeManager**: HandUpgradeManager instance
- **blindGenerator**: BlindGenerator instance
- **scoreCalculator**: ScoreCalculator instance

### Constructor:
- Initializes all subsystems (Deck, HandEvaluator, HandUpgradeManager, BlindGenerator, ScoreCalculator)
- Sets initial money = $5
- Sets levelNumber = 1
- Generates first blind (level 1 = SmallBlind)
- Sets handsRemaining = 3, discardsRemaining = 3 (or boss modifier values)
- Does NOT deal initial hand (must call dealHand() separately)

### Core Game Flow Methods:

**dealHand(): void**
- Draws 8 cards from deck
- Sets currentHand to drawn cards
- Clears selectedCards
- Called after: (1) constructor, (2) playHand() completion, (3) discardCards()
- Temporal coupling: Must be called after advanceToNextBlind() for proper state

**selectCard(cardId: string): void**
- Toggles card selection (add if not selected, remove if selected)
- Max 5 cards can be selected
- Throws error if cardId not found in currentHand
- Throws error if attempting to select 6th card

**clearSelection(): void**
- Clears all selected cards
- Sets selectedCards to empty array

**playHand(): ScoreResult**
- Validates: selectedCards not empty, handsRemaining > 0
- Calculates score using ScoreCalculator
- Adds score to accumulatedScore
- Decrements handsRemaining
- Checks level completion (accumulatedScore >= blind.getScoreGoal())
- Checks game over (handsRemaining = 0 AND score < goal)
- Returns ScoreResult
- Clears selection after play
- **NOTE:** Does NOT automatically deal next hand (controller responsibility)

**discardCards(): void**
- Validates: selectedCards not empty, discardsRemaining > 0
- Removes selected cards from currentHand
- Adds selected cards to deck.discardPile
- Decrements discardsRemaining
- Draws replacement cards to maintain 8-card hand
- Clears selection
- **NOTE:** Deals replacement cards immediately

### Inventory Management:

**addJoker(joker: Joker): void**
- Validates jokers.length < 5
- Adds joker to array
- Throws error if inventory full

**replaceJoker(index: number, newJoker: Joker): void**
- Validates index in range [0, jokers.length)
- Replaces joker at index
- Throws error on invalid index

**removeJoker(index: number): void**
- Validates index in range
- Removes joker from array
- Throws error on invalid index

**addConsumable(tarot: Tarot): void**
- Validates consumables.length < 2
- Adds tarot to array
- Throws error if inventory full

**replaceConsumable(index: number, newTarot: Tarot): void**
- Validates index in range
- Replaces tarot at index

**removeConsumable(index: number): void**
- Validates index in range
- Removes tarot from array

### Economy:

**addMoney(amount: number): void**
- Validates amount > 0
- Adds to money
- Throws error on negative amount

**spendMoney(amount: number): boolean**
- Validates amount > 0
- If money >= amount: deducts and returns true
- If money < amount: returns false (no change)
- Throws error on negative amount

**getMoney(): number**
- Returns current money

### Level Progression:

**advanceToNextBlind(): void**
- Awards blind completion reward (addMoney)
- Increments levelNumber
- Generates next blind via BlindGenerator
- Resets handsRemaining and discardsRemaining
- Applies boss blind modifiers if applicable
- Resets accumulatedScore to 0
- Awards Golden Joker bonus if present (+$2)
- **NOTE:** Does NOT deal hand (controller calls dealHand after this)

**applyBlindModifiers() [PRIVATE]:**
- The Water: sets discardsRemaining = 0
- The Needle: sets handsRemaining = 1
- Other modifiers handled by ScoreCalculator (The Flint) or UI (The Mouth)

### Win/Loss Conditions:

**isLevelComplete(): boolean**
- Returns true if accumulatedScore >= currentBlind.getScoreGoal()

**isGameOver(): boolean**
- Returns true if handsRemaining = 0 AND accumulatedScore < goal
- Called after playHand() when hands run out

### Getters (all return COPIES, not references):

- getCurrentHand(): Card[]
- getSelectedCards(): Card[]
- getJokers(): Joker[]
- getConsumables(): Tarot[]
- getCurrentBlind(): Blind
- getAccumulatedScore(): number
- getHandsRemaining(): number
- getDiscardsRemaining(): number
- getLevelNumber(): number
- getRoundNumber(): number
- getDeck(): Deck (returns reference for controller access)

### Planet Card Integration:

**applyPlanetCard(planet: Planet): void**
- Calls planet.applyUpgrade(upgradeManager)
- Permanent cumulative upgrade to hand type

### Tarot Card Integration:

**applyTargetedTarot(tarot: TargetedTarot, targetCardId: string): void**
- Finds target card in currentHand
- Calls tarot.use(card)
- Handles special effects (Death = duplicate, Hanged Man = destroy)
- Throws error if card not found

**applyInstantTarot(tarot: InstantTarot): void**
- Calls tarot.use(this)
- Handles effects like The Hermit (double money)

## Victory Condition:
- Game is won when levelNumber > 24 (completed 8 rounds × 3 levels)
- Checked by controller after advanceToNextBlind()

## Edge Cases:
- Selecting card not in hand (throw error)
- Selecting 6th card (throw error)
- Playing with 0 hands remaining (throw error)
- Discarding with 0 discards remaining (throw error)
- Adding 6th joker (throw error)
- Adding 3rd consumable (throw error)
- Negative money operations (throw error)
- Boss blind with modifier (The Water = 0 discards, The Needle = 1 hand)
- Death tarot creating duplicate card (add to deck)
- Hanged Man tarot destroying card (remove from hand/deck)
- Golden Joker economic effect (+$2 per level)
- Empty selection on play/discard (throw error)
- Deck running out of cards (should not happen in 8-card hand game)

# TASK

Generate a complete unit test suite for GameState that covers:

## 1. Constructor Tests

- [ ] Initializes deck correctly
- [ ] Initializes upgradeManager
- [ ] Initializes blindGenerator
- [ ] Initializes scoreCalculator
- [ ] Sets money to $5
- [ ] Sets levelNumber to 1
- [ ] Generates first blind (SmallBlind, round 1)
- [ ] Sets handsRemaining to 3
- [ ] Sets discardsRemaining to 3
- [ ] Sets accumulatedScore to 0
- [ ] currentHand is empty (no auto-deal)
- [ ] selectedCards is empty
- [ ] jokers array is empty
- [ ] consumables array is empty

## 2. dealHand() Tests

- [ ] Draws 8 cards from deck
- [ ] Sets currentHand to 8 cards
- [ ] Clears selectedCards
- [ ] Deck has 44 cards remaining after deal
- [ ] All cards in hand are unique
- [ ] Can be called multiple times (draws new cards)
- [ ] Throws error if deck has < 8 cards (edge case)

## 3. Card Selection Tests

### selectCard():
- [ ] Selects card from currentHand
- [ ] Adds card to selectedCards
- [ ] Deselects card if already selected (toggle)
- [ ] Removes card from selectedCards on deselect
- [ ] Allows selecting up to 5 cards
- [ ] Throws error when selecting 6th card
- [ ] Throws error if cardId not in currentHand
- [ ] Maintains selection order

### clearSelection():
- [ ] Clears all selected cards
- [ ] selectedCards becomes empty array
- [ ] Can be called when no cards selected (no-op)

## 4. playHand() Tests

### Basic Play:
- [ ] Returns ScoreResult
- [ ] Decrements handsRemaining
- [ ] Adds score to accumulatedScore
- [ ] Clears selection after play
- [ ] Validates selectedCards not empty
- [ ] Validates handsRemaining > 0

### Score Calculation:
- [ ] Calculates score correctly for selected cards
- [ ] Example: Pair of Kings = (10+10+10) × 2 = 60
- [ ] Joker effects applied in calculation
- [ ] Planet upgrades reflected in base values

### Level Completion:
- [ ] isLevelComplete() returns true when score >= goal
- [ ] isLevelComplete() returns false when score < goal
- [ ] Multiple hands can be played until goal met or hands exhausted

### Game Over:
- [ ] isGameOver() returns true when hands = 0 AND score < goal
- [ ] isGameOver() returns false when hands > 0
- [ ] isGameOver() returns false when score >= goal (level complete)

### Edge Cases:
- [ ] Throws error when selectedCards is empty
- [ ] Throws error when handsRemaining = 0
- [ ] Last hand with insufficient score triggers game over
- [ ] Score exactly equals goal (level complete)

## 5. discardCards() Tests

### Basic Discard:
- [ ] Decrements discardsRemaining
- [ ] Removes selected cards from currentHand
- [ ] Adds cards to deck.discardPile
- [ ] Draws replacement cards
- [ ] Maintains 8-card hand after discard
- [ ] Clears selection after discard

### Validation:
- [ ] Throws error when selectedCards is empty
- [ ] Throws error when discardsRemaining = 0
- [ ] Validates discardsRemaining before operation

### Replacement Cards:
- [ ] Drawn cards are different from discarded
- [ ] Hand size remains 8
- [ ] Replacement cards come from deck

## 6. Inventory Management Tests

### Jokers:
- [ ] addJoker adds joker to array
- [ ] addJoker throws error when 5 jokers already present
- [ ] replaceJoker replaces at correct index
- [ ] replaceJoker throws error on invalid index
- [ ] removeJoker removes at correct index
- [ ] removeJoker throws error on invalid index
- [ ] Can have 0-5 jokers

### Consumables:
- [ ] addConsumable adds tarot to array
- [ ] addConsumable throws error when 2 tarots already present
- [ ] replaceConsumable replaces at correct index
- [ ] removeConsumable removes at correct index
- [ ] Can have 0-2 consumables

## 7. Economy Tests

### addMoney():
- [ ] Adds money to total
- [ ] Accumulates multiple additions
- [ ] Throws error on negative amount
- [ ] Throws error on zero amount

### spendMoney():
- [ ] Returns true and deducts when sufficient funds
- [ ] Returns false and no change when insufficient funds
- [ ] Throws error on negative amount
- [ ] Handles exact amount (money becomes 0)
- [ ] Example: $10 total, spend $5 = true, $5 remaining
- [ ] Example: $3 total, spend $5 = false, $3 remaining

### getMoney():
- [ ] Returns current money value
- [ ] Reflects additions and deductions

## 8. Level Progression Tests

### advanceToNextBlind():
- [ ] Awards blind completion reward
- [ ] Small blind: +$2
- [ ] Big blind: +$5
- [ ] Boss blind: +$10
- [ ] Increments levelNumber
- [ ] Generates next blind via BlindGenerator
- [ ] Resets handsRemaining to 3 (or boss modifier)
- [ ] Resets discardsRemaining to 3 (or boss modifier)
- [ ] Resets accumulatedScore to 0
- [ ] Golden Joker: adds +$2 bonus

### Boss Blind Modifiers:
- [ ] The Water: sets discardsRemaining = 0
- [ ] The Needle: sets handsRemaining = 1
- [ ] Other values remain at defaults

### Round Calculation:
- [ ] Levels 1-3: round 1
- [ ] Levels 4-6: round 2
- [ ] getRoundNumber() returns correct value

## 9. Win/Loss Condition Tests

### isLevelComplete():
- [ ] Returns false initially
- [ ] Returns true when accumulatedScore >= goal
- [ ] Returns true when score exactly equals goal
- [ ] Returns true when score exceeds goal
- [ ] Checked after playHand()

### isGameOver():
- [ ] Returns false initially
- [ ] Returns false when hands > 0
- [ ] Returns false when level complete
- [ ] Returns true when hands = 0 AND score < goal
- [ ] Accurate after final hand played

## 10. Planet Card Integration Tests

### applyPlanetCard():
- [ ] Calls planet.applyUpgrade()
- [ ] Upgrade reflected in next hand calculation
- [ ] Example: Pluto upgrades HIGH_CARD from (5,1) to (15,2)
- [ ] Multiple planets accumulate
- [ ] Example: 2 Pluto = HIGH_CARD (25,3)

## 11. Tarot Card Integration Tests

### applyTargetedTarot():
- [ ] The Emperor: adds +20 chips to card
- [ ] The Empress: adds +4 mult to card
- [ ] Strength: upgrades card value
- [ ] The Star/Moon/Sun/World: changes card suit
- [ ] Death: duplicates card (adds to deck)
- [ ] Hanged Man: destroys card (removes from hand)
- [ ] Throws error if target card not in hand

### applyInstantTarot():
- [ ] The Hermit: doubles money
- [ ] Example: $10 → $20
- [ ] Passes GameState to tarot

## 12. Complete Game Flow Integration Tests

### Full Level Cycle:
- [ ] Start level 1
- [ ] Deal hand
- [ ] Select 2 cards (Pair)
- [ ] Play hand
- [ ] Score calculated and accumulated
- [ ] If score < goal: play another hand
- [ ] If score >= goal: level complete
- [ ] Advance to next blind
- [ ] Money awarded
- [ ] Deal new hand for next level

### Victory Path:
- [ ] Complete 24 levels
- [ ] levelNumber reaches 25
- [ ] Controller checks victory condition

### Defeat Path:
- [ ] Play all 3 hands
- [ ] Accumulated score < goal
- [ ] handsRemaining = 0
- [ ] isGameOver() returns true

### With Jokers:
- [ ] Add Joker (+4 mult)
- [ ] Play hand
- [ ] Score reflects joker bonus
- [ ] Joker persists across hands

### With Planets:
- [ ] Purchase Pluto in shop
- [ ] Apply to GameState
- [ ] Next HIGH_CARD hand uses upgraded values
- [ ] Upgrade persists for entire game

### With Boss Blind:
- [ ] Reach level 3 (first boss)
- [ ] The Water: 0 discards
- [ ] Attempt discard throws error
- [ ] The Needle: 1 hand
- [ ] handsRemaining = 1 after reset

## 13. Edge Cases

### Deck Management:
- [ ] Deck never runs out (discard pile reshuffled)
- [ ] 8-card hand sustainable for entire game

### Temporal Coupling:
- [ ] dealHand() after advanceToNextBlind() gives correct state
- [ ] Boss modifiers applied before dealHand()

### Inventory Limits:
- [ ] Exactly 5 jokers allowed
- [ ] 6th joker throws error
- [ ] Exactly 2 consumables allowed
- [ ] 3rd consumable throws error

### Money Edge Cases:
- [ ] Money can be $0
- [ ] Spending when broke returns false
- [ ] Negative amount throws error

### Selection Edge Cases:
- [ ] Select all 8 cards → only first 5 selected
- [ ] Deselect in different order than selected
- [ ] Clear selection multiple times (idempotent)

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GameState } from '@/models/game';
import { Card, CardValue, Suit } from '@/models/core';
import { HandType } from '@/models/poker';
import { MultJoker } from '@/models/special-cards/jokers';
import { Planet } from '@/models/special-cards/planets';
import { TargetedTarot, InstantTarot, TarotEffect } from '@/models/special-cards/tarots';
import { BossType } from '@/models/blinds';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('Constructor', () => {
    it('should initialize with $5 money', () => {
      // ASSERT
      expect(gameState.getMoney()).toBe(5);
    });

    it('should start at level 1', () => {
      // ASSERT
      expect(gameState.getLevelNumber()).toBe(1);
    });

    it('should generate first blind (SmallBlind, round 1)', () => {
      // ACT
      const blind = gameState.getCurrentBlind();
      
      // ASSERT
      expect(blind.getName()).toBe('Small Blind');
      expect(blind.getRoundNumber()).toBe(1);
      expect(blind.getScoreGoal()).toBe(300);
    });

    it('should start with 3 hands remaining', () => {
      // ASSERT
      expect(gameState.getHandsRemaining()).toBe(3);
    });

    it('should start with 3 discards remaining', () => {
      // ASSERT
      expect(gameState.getDiscardsRemaining()).toBe(3);
    });

    it('should start with 0 accumulated score', () => {
      // ASSERT
      expect(gameState.getAccumulatedScore()).toBe(0);
    });

    it('should have empty current hand (no auto-deal)', () => {
      // ASSERT
      expect(gameState.getCurrentHand()).toHaveLength(0);
    });

    it('should have empty selected cards', () => {
      // ASSERT
      expect(gameState.getSelectedCards()).toHaveLength(0);
    });

    it('should have empty jokers array', () => {
      // ASSERT
      expect(gameState.getJokers()).toHaveLength(0);
    });

    it('should have empty consumables array', () => {
      // ASSERT
      expect(gameState.getConsumables()).toHaveLength(0);
    });

    it('should initialize deck', () => {
      // ACT
      const deck = gameState.getDeck();
      
      // ASSERT
      expect(deck).toBeDefined();
      expect(deck.getRemaining()).toBe(52);
    });
  });

  describe('dealHand', () => {
    it('should draw 8 cards from deck', () => {
      // ACT
      gameState.dealHand();
      
      // ASSERT
      expect(gameState.getCurrentHand()).toHaveLength(8);
      expect(gameState.getDeck().getRemaining()).toBe(44);
    });

    it('should clear selected cards', () => {
      // ARRANGE
      gameState.dealHand();
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      
      // ACT
      gameState.dealHand(); // Deal new hand
      
      // ASSERT
      expect(gameState.getSelectedCards()).toHaveLength(0);
    });

    it('should draw unique cards', () => {
      // ACT
      gameState.dealHand();
      const hand = gameState.getCurrentHand();
      
      // ASSERT
      const ids = hand.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(8);
    });

    it('should allow multiple deals', () => {
      // ACT
      gameState.dealHand();
      const firstHand = gameState.getCurrentHand().map(c => c.id);
      
      gameState.dealHand();
      const secondHand = gameState.getCurrentHand().map(c => c.id);
      
      // ASSERT
      expect(firstHand).not.toEqual(secondHand);
    });
  });

  describe('Card Selection', () => {
    beforeEach(() => {
      gameState.dealHand();
    });

    describe('selectCard', () => {
      it('should select card from current hand', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        const cardToSelect = hand[0];
        
        // ACT
        gameState.selectCard(cardToSelect.id);
        
        // ASSERT
        expect(gameState.getSelectedCards()).toHaveLength(1);
        expect(gameState.getSelectedCards()[0].id).toBe(cardToSelect.id);
      });

      it('should deselect card if already selected (toggle)', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        const cardId = hand[0].id;
        gameState.selectCard(cardId);
        
        // ACT
        gameState.selectCard(cardId); // Toggle off
        
        // ASSERT
        expect(gameState.getSelectedCards()).toHaveLength(0);
      });

      it('should allow selecting up to 5 cards', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        
        // ACT
        for (let i = 0; i < 5; i++) {
          gameState.selectCard(hand[i].id);
        }
        
        // ASSERT
        expect(gameState.getSelectedCards()).toHaveLength(5);
      });

      it('should throw error when selecting 6th card', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        for (let i = 0; i < 5; i++) {
          gameState.selectCard(hand[i].id);
        }
        
        // ACT & ASSERT
        expect(() => gameState.selectCard(hand[5].id))
          .toThrow('Cannot select more than 5 cards');
      });

      it('should throw error if cardId not in current hand', () => {
        // ACT & ASSERT
        expect(() => gameState.selectCard('invalid-id'))
          .toThrow('Card not found in current hand');
      });
    });

    describe('clearSelection', () => {
      it('should clear all selected cards', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        gameState.selectCard(hand[0].id);
        gameState.selectCard(hand[1].id);
        
        // ACT
        gameState.clearSelection();
        
        // ASSERT
        expect(gameState.getSelectedCards()).toHaveLength(0);
      });

      it('should work when no cards selected (no-op)', () => {
        // ACT
        gameState.clearSelection();
        
        // ASSERT
        expect(gameState.getSelectedCards()).toHaveLength(0);
      });
    });
  });

  describe('playHand', () => {
    beforeEach(() => {
      gameState.dealHand();
    });

    it('should return ScoreResult', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      gameState.selectCard(hand[1].id);
      
      // ACT
      const result = gameState.playHand();
      
      // ASSERT
      expect(result).toBeDefined();
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.chips).toBeGreaterThan(0);
      expect(result.mult).toBeGreaterThan(0);
    });

    it('should decrement hands remaining', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      const initialHands = gameState.getHandsRemaining();
      
      // ACT
      gameState.playHand();
      
      // ASSERT
      expect(gameState.getHandsRemaining()).toBe(initialHands - 1);
    });

    it('should add score to accumulated score', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      
      // ACT
      const result = gameState.playHand();
      
      // ASSERT
      expect(gameState.getAccumulatedScore()).toBe(result.totalScore);
    });

    it('should clear selection after play', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      
      // ACT
      gameState.playHand();
      
      // ASSERT
      expect(gameState.getSelectedCards()).toHaveLength(0);
    });

    it('should throw error when selected cards is empty', () => {
      // ACT & ASSERT
      expect(() => gameState.playHand())
        .toThrow('No cards selected');
    });

    it('should throw error when hands remaining = 0', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      
      // Play 3 hands
      for (let i = 0; i < 3; i++) {
        gameState.selectCard(hand[0].id);
        gameState.playHand();
        gameState.clearSelection();
      }
      
      // ACT & ASSERT
      gameState.selectCard(hand[0].id);
      expect(() => gameState.playHand())
        .toThrow('No hands remaining');
    });

    it('should calculate score correctly for Pair', () => {
      // ARRANGE - Find two cards of same value
      const hand = gameState.getCurrentHand();
      const kingCards = hand.filter(c => c.value === CardValue.KING);
      
      if (kingCards.length >= 2) {
        gameState.selectCard(kingCards[0].id);
        gameState.selectCard(kingCards[1].id);
        
        // ACT
        const result = gameState.playHand();
        
        // ASSERT
        // Base: Pair = 10 chips × 2 mult
        // Cards: K (10) + K (10) = 20 chips
        // Total: (10 + 20) × 2 = 60
        expect(result.totalScore).toBe(60);
      }
    });
  });

  describe('discardCards', () => {
    beforeEach(() => {
      gameState.dealHand();
    });

    it('should decrement discards remaining', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      const initialDiscards = gameState.getDiscardsRemaining();
      
      // ACT
      gameState.discardCards();
      
      // ASSERT
      expect(gameState.getDiscardsRemaining()).toBe(initialDiscards - 1);
    });

    it('should remove selected cards from current hand', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      const cardToDiscard = hand[0];
      gameState.selectCard(cardToDiscard.id);
      
      // ACT
      gameState.discardCards();
      
      // ASSERT
      const newHand = gameState.getCurrentHand();
      expect(newHand.find(c => c.id === cardToDiscard.id)).toBeUndefined();
    });

    it('should draw replacement cards to maintain 8-card hand', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      gameState.selectCard(hand[1].id);
      
      // ACT
      gameState.discardCards();
      
      // ASSERT
      expect(gameState.getCurrentHand()).toHaveLength(8);
    });

    it('should clear selection after discard', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      
      // ACT
      gameState.discardCards();
      
      // ASSERT
      expect(gameState.getSelectedCards()).toHaveLength(0);
    });

    it('should throw error when selected cards is empty', () => {
      // ACT & ASSERT
      expect(() => gameState.discardCards())
        .toThrow('No cards selected');
    });

    it('should throw error when discards remaining = 0', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      
      // Use all 3 discards
      for (let i = 0; i < 3; i++) {
        gameState.selectCard(hand[0].id);
        gameState.discardCards();
      }
      
      // ACT & ASSERT
      gameState.selectCard(gameState.getCurrentHand()[0].id);
      expect(() => gameState.discardCards())
        .toThrow('No discards remaining');
    });
  });

  describe('Inventory Management', () => {
    describe('Jokers', () => {
      it('should add joker to array', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        
        // ACT
        gameState.addJoker(joker);
        
        // ASSERT
        expect(gameState.getJokers()).toHaveLength(1);
        expect(gameState.getJokers()[0]).toBe(joker);
      });

      it('should throw error when adding 6th joker', () => {
        // ARRANGE
        for (let i = 0; i < 5; i++) {
          const joker = new MultJoker(`joker${i}`, 'Joker', '+4 mult', 4);
          gameState.addJoker(joker);
        }
        
        const sixthJoker = new MultJoker('joker6', 'Joker', '+4 mult', 4);
        
        // ACT & ASSERT
        expect(() => gameState.addJoker(sixthJoker))
          .toThrow('Joker inventory full');
      });

      it('should replace joker at index', () => {
        // ARRANGE
        const joker1 = new MultJoker('joker1', 'Joker 1', '+4 mult', 4);
        const joker2 = new MultJoker('joker2', 'Joker 2', '+5 mult', 5);
        gameState.addJoker(joker1);
        
        // ACT
        gameState.replaceJoker(0, joker2);
        
        // ASSERT
        expect(gameState.getJokers()[0]).toBe(joker2);
      });

      it('should remove joker at index', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        gameState.addJoker(joker);
        
        // ACT
        gameState.removeJoker(0);
        
        // ASSERT
        expect(gameState.getJokers()).toHaveLength(0);
      });
    });

    describe('Consumables', () => {
      it('should add consumable to array', () => {
        // ARRANGE
        const tarot = new TargetedTarot(
          'empress',
          'Empress',
          'Add mult',
          TarotEffect.ADD_MULT,
          (card) => card.addPermanentBonus(0, 4)
        );
        
        // ACT
        gameState.addConsumable(tarot);
        
        // ASSERT
        expect(gameState.getConsumables()).toHaveLength(1);
      });

      it('should throw error when adding 3rd consumable', () => {
        // ARRANGE
        const tarot1 = new TargetedTarot('t1', 'T1', 'Desc', TarotEffect.ADD_MULT, () => {});
        const tarot2 = new TargetedTarot('t2', 'T2', 'Desc', TarotEffect.ADD_MULT, () => {});
        const tarot3 = new TargetedTarot('t3', 'T3', 'Desc', TarotEffect.ADD_MULT, () => {});
        
        gameState.addConsumable(tarot1);
        gameState.addConsumable(tarot2);
        
        // ACT & ASSERT
        expect(() => gameState.addConsumable(tarot3))
          .toThrow('Consumable inventory full');
      });
    });
  });

  describe('Economy', () => {
    describe('addMoney', () => {
      it('should add money to total', () => {
        // ARRANGE
        const initialMoney = gameState.getMoney();
        
        // ACT
        gameState.addMoney(10);
        
        // ASSERT
        expect(gameState.getMoney()).toBe(initialMoney + 10);
      });

      it('should throw error on negative amount', () => {
        // ACT & ASSERT
        expect(() => gameState.addMoney(-5))
          .toThrow('Amount must be positive');
      });
    });

    describe('spendMoney', () => {
      it('should return true and deduct when sufficient funds', () => {
        // ARRANGE
        gameState.addMoney(5); // Total $10
        
        // ACT
        const result = gameState.spendMoney(5);
        
        // ASSERT
        expect(result).toBe(true);
        expect(gameState.getMoney()).toBe(5);
      });

      it('should return false and no change when insufficient funds', () => {
        // ARRANGE - Initial $5
        
        // ACT
        const result = gameState.spendMoney(10);
        
        // ASSERT
        expect(result).toBe(false);
        expect(gameState.getMoney()).toBe(5);
      });

      it('should handle exact amount', () => {
        // ARRANGE - Initial $5
        
        // ACT
        const result = gameState.spendMoney(5);
        
        // ASSERT
        expect(result).toBe(true);
        expect(gameState.getMoney()).toBe(0);
      });
    });
  });

  describe('Level Progression', () => {
    describe('advanceToNextBlind', () => {
      it('should award blind completion reward', () => {
        // ARRANGE
        const initialMoney = gameState.getMoney();
        const reward = gameState.getCurrentBlind().getReward();
        
        // ACT
        gameState.advanceToNextBlind();
        
        // ASSERT
        expect(gameState.getMoney()).toBe(initialMoney + reward);
      });

      it('should increment level number', () => {
        // ACT
        gameState.advanceToNextBlind();
        
        // ASSERT
        expect(gameState.getLevelNumber()).toBe(2);
      });

      it('should generate next blind', () => {
        // ACT
        gameState.advanceToNextBlind();
        
        // ASSERT
        const blind = gameState.getCurrentBlind();
        expect(blind.getName()).toBe('Big Blind'); // Level 2
      });

      it('should reset hands remaining to 3', () => {
        // ARRANGE
        gameState.dealHand();
        const hand = gameState.getCurrentHand();
        gameState.selectCard(hand[0].id);
        gameState.playHand(); // Decrement hands
        
        // ACT
        gameState.advanceToNextBlind();
        
        // ASSERT
        expect(gameState.getHandsRemaining()).toBe(3);
      });

      it('should reset discards remaining to 3', () => {
        // ARRANGE
        gameState.dealHand();
        const hand = gameState.getCurrentHand();
        gameState.selectCard(hand[0].id);
        gameState.discardCards(); // Decrement discards
        
        // ACT
        gameState.advanceToNextBlind();
        
        // ASSERT
        expect(gameState.getDiscardsRemaining()).toBe(3);
      });

      it('should reset accumulated score to 0', () => {
        // ARRANGE
        gameState.dealHand();
        const hand = gameState.getCurrentHand();
        gameState.selectCard(hand[0].id);
        gameState.playHand(); // Accumulate some score
        
        // ACT
        gameState.advanceToNextBlind();
        
        // ASSERT
        expect(gameState.getAccumulatedScore()).toBe(0);
      });
    });

    describe('Boss Blind Modifiers', () => {
      it('should set discards to 0 for The Water', () => {
        // ARRANGE - Mock to get The Water boss
        // Advance to level 3 and check for The Water
        // This is statistical, so we'll test the mechanism directly
        
        // Create a boss blind with The Water
        const waterBlind = gameState['blindGenerator'].generateBlindForLevel(3);
        if (waterBlind.getName() === 'The Water') {
          gameState['currentBlind'] = waterBlind;
          
          // ACT
          gameState['applyBlindModifiers']();
          
          // ASSERT
          expect(gameState.getDiscardsRemaining()).toBe(0);
        }
      });

      it('should set hands to 1 for The Needle', () => {
        // ARRANGE
        const needleBlind = gameState['blindGenerator'].generateBlindForLevel(3);
        if (needleBlind.getName() === 'The Needle') {
          gameState['currentBlind'] = needleBlind;
          
          // ACT
          gameState['applyBlindModifiers']();
          
          // ASSERT
          expect(gameState.getHandsRemaining()).toBe(1);
        }
      });
    });
  });

  describe('Win/Loss Conditions', () => {
    describe('isLevelComplete', () => {
      it('should return false initially', () => {
        // ASSERT
        expect(gameState.isLevelComplete()).toBe(false);
      });

      it('should return true when accumulated score >= goal', () => {
        // ARRANGE - Manually set accumulated score to goal
        gameState['accumulatedScore'] = 300; // Small blind goal
        
        // ACT
        const result = gameState.isLevelComplete();
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return true when score exceeds goal', () => {
        // ARRANGE
        gameState['accumulatedScore'] = 500; // Exceeds 300 goal
        
        // ACT
        const result = gameState.isLevelComplete();
        
        // ASSERT
        expect(result).toBe(true);
      });
    });

    describe('isGameOver', () => {
      it('should return false initially', () => {
        // ASSERT
        expect(gameState.isGameOver()).toBe(false);
      });

      it('should return false when hands > 0', () => {
        // ARRANGE
        gameState['handsRemaining'] = 2;
        gameState['accumulatedScore'] = 100; // Less than goal
        
        // ACT
        const result = gameState.isGameOver();
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should return false when level complete', () => {
        // ARRANGE
        gameState['handsRemaining'] = 0;
        gameState['accumulatedScore'] = 300; // Meets goal
        
        // ACT
        const result = gameState.isGameOver();
        
        // ASSERT
        expect(result).toBe(false); // Level complete, not game over
      });

      it('should return true when hands = 0 AND score < goal', () => {
        // ARRANGE
        gameState['handsRemaining'] = 0;
        gameState['accumulatedScore'] = 200; // Less than 300 goal
        
        // ACT
        const result = gameState.isGameOver();
        
        // ASSERT
        expect(result).toBe(true);
      });
    });
  });

  describe('Planet Card Integration', () => {
    it('should apply planet upgrade to hand type', () => {
      // ARRANGE
      const pluto = new Planet(
        'pluto',
        'Pluto',
        'Upgrade High Card',
        HandType.HIGH_CARD,
        10,
        1
      );
      
      // ACT
      gameState.applyPlanetCard(pluto);
      
      // Deal hand and check if upgrade applied
      gameState.dealHand();
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id); // Single card = HIGH_CARD
      
      const result = gameState.playHand();
      
      // ASSERT
      // Base HIGH_CARD: (5, 1)
      // After Pluto: (5+10, 1+1) = (15, 2)
      // With one card (e.g., K = 10 chips): (15 + 10) × 2 = 50
      expect(result.totalScore).toBeGreaterThan(20); // Should reflect upgrade
    });
  });

  describe('Tarot Card Integration', () => {
    beforeEach(() => {
      gameState.dealHand();
    });

    it('should apply The Emperor tarot (add chips)', () => {
      // ARRANGE
      const hand = gameState.getCurrentHand();
      const targetCard = hand[0];
      
      const emperor = new TargetedTarot(
        'emperor',
        'Emperor',
        'Add chips',
        TarotEffect.ADD_CHIPS,
        (card) => card.addPermanentBonus(20, 0)
      );
      
      // ACT
      gameState.applyTargetedTarot(emperor, targetCard.id);
      
      // ASSERT
      expect(targetCard.chipBonus).toBe(20);
    });

    it('should apply The Hermit tarot (double money)', () => {
      // ARRANGE
      const initialMoney = gameState.getMoney(); // $5
      
      const hermit = new InstantTarot(
        'hermit',
        'Hermit',
        'Double money',
        TarotEffect.ADD_CHIPS,
        (state: any) => {
          state.money = state.money * 2;
        }
      );
      
      // ACT
      gameState.applyInstantTarot(hermit);
      
      // ASSERT
      expect(gameState.getMoney()).toBe(initialMoney * 2);
    });
  });

  describe('Complete Game Flow Integration', () => {
    it('should complete full level cycle', () => {
      // ARRANGE - Start level 1
      expect(gameState.getLevelNumber()).toBe(1);
      expect(gameState.getCurrentBlind().getScoreGoal()).toBe(300);
      
      // ACT - Play enough hands to complete level
      gameState.dealHand();
      
      // Play until level complete (may need multiple hands)
      while (!gameState.isLevelComplete() && gameState.getHandsRemaining() > 0) {
        const hand = gameState.getCurrentHand();
        // Select 5 cards for best chance
        for (let i = 0; i < Math.min(5, hand.length); i++) {
          gameState.selectCard(hand[i].id);
        }
        gameState.playHand();
        
        if (!gameState.isLevelComplete()) {
          gameState.dealHand();
        }
      }
      
      // ASSERT
      expect(gameState.isLevelComplete()).toBe(true);
      
      // ACT - Advance to next level
      const moneyBefore = gameState.getMoney();
      gameState.advanceToNextBlind();
      
      // ASSERT
      expect(gameState.getLevelNumber()).toBe(2);
      expect(gameState.getMoney()).toBeGreaterThan(moneyBefore);
      expect(gameState.getAccumulatedScore()).toBe(0);
      expect(gameState.getHandsRemaining()).toBe(3);
    });

    it('should trigger game over when out of hands', () => {
      // ARRANGE
      gameState.dealHand();
      const hand = gameState.getCurrentHand();
      
      // ACT - Play 3 hands with minimal score
      for (let i = 0; i < 3; i++) {
        gameState.selectCard(hand[0].id); // Single card (minimal score)
        gameState.playHand();
        
        if (i < 2) {
          gameState.dealHand();
        }
      }
      
      // ASSERT
      expect(gameState.getHandsRemaining()).toBe(0);
      
      // If score didn't reach goal, should be game over
      if (gameState.getAccumulatedScore() < 300) {
        expect(gameState.isGameOver()).toBe(true);
      }
    });
  });

  describe('Getters Return Copies', () => {
    it('should return copy of current hand, not reference', () => {
      // ARRANGE
      gameState.dealHand();
      const hand1 = gameState.getCurrentHand();
      const hand2 = gameState.getCurrentHand();
      
      // ACT - Modify one copy
      hand1.push(new Card(CardValue.ACE, Suit.SPADES));
      
      // ASSERT
      expect(hand1.length).not.toBe(hand2.length);
    });

    it('should return copy of selected cards', () => {
      // ARRANGE
      gameState.dealHand();
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      
      const selected1 = gameState.getSelectedCards();
      const selected2 = gameState.getSelectedCards();
      
      // ACT
      selected1.push(new Card(CardValue.KING, Suit.HEARTS));
      
      // ASSERT
      expect(selected1.length).not.toBe(selected2.length);
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for GameState
- All public methods tested
- Complete game flow integration
- Win/loss conditions verified
- Boss modifiers tested
- Edge cases covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| Constructor | Initialization | 10 | 0 | 0 | 10 |
| dealHand | Basic functionality | 4 | 0 | 1 | 5 |
| selectCard | Selection | 5 | 0 | 2 | 7 |
| clearSelection | Clearing | 2 | 0 | 0 | 2 |
| playHand | Basic play | 6 | 0 | 2 | 8 |
| playHand | Score calculation | 2 | 0 | 0 | 2 |
| discardCards | Discard mechanics | 5 | 0 | 2 | 7 |
| Joker inventory | Management | 4 | 0 | 0 | 4 |
| Consumable inventory | Management | 2 | 0 | 1 | 3 |
| Economy | Money operations | 5 | 0 | 0 | 5 |
| advanceToNextBlind | Progression | 6 | 0 | 0 | 6 |
| Boss modifiers | Application | 2 | 0 | 0 | 2 |
| isLevelComplete | Condition check | 4 | 0 | 0 | 4 |
| isGameOver | Condition check | 4 | 0 | 0 | 4 |
| Planet integration | Apply upgrades | 1 | 0 | 0 | 1 |
| Tarot integration | Apply effects | 2 | 0 | 0 | 2 |
| Complete flow | Full game cycle | 2 | 0 | 0 | 2 |
| Getters | Immutability | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **76** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **92%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios:
  - Some private helper methods (tested indirectly)
  - Boss type randomization (statistical)
  - Deck reshuffle edge cases (unlikely in 24-level game)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/game-state.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/game-state.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/game-state.test.ts

# Run specific sections
npm test -- -t "playHand" tests/unit/models/game-state.test.ts
npm test -- -t "Complete Game Flow" tests/unit/models/game-state.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Temporal coupling:** dealHand() must be called after advanceToNextBlind()
- **Boss modifiers:** Applied during advanceToNextBlind(), affect next level
- **Getter immutability:** All getters return copies to prevent external mutation
- **Inventory limits:** Strictly enforced (5 jokers, 2 consumables)
- **Victory condition:** Checked by controller after advanceToNextBlind() when level > 24
- **Golden Joker:** Economic joker adds +$2 per level completion
- **The Hermit:** Instant tarot that doubles money
- **Death tarot:** Duplicate card added to deck, not hand
- **Hanged Man:** Destroy card removes from hand/deck
- **Score accumulation:** Persists across hands within same level

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to complete a level
function completeLevel(gameState: GameState): void {
  gameState.dealHand();
  
  while (!gameState.isLevelComplete() && !gameState.isGameOver()) {
    const hand = gameState.getCurrentHand();
    
    // Select all 8 cards (will only select 5)
    for (let i = 0; i < Math.min(5, hand.length); i++) {
      gameState.selectCard(hand[i].id);
    }
    
    gameState.playHand();
    
    if (!gameState.isLevelComplete() && gameState.getHandsRemaining() > 0) {
      gameState.dealHand();
    }
  }
}

// Helper to find specific card values in hand
function findCardsWithValue(hand: Card[], value: CardValue, count: number): Card[] {
  return hand.filter(c => c.value === value).slice(0, count);
}

// Helper to simulate boss blind
function simulateBossBlind(gameState: GameState, bossType: BossType): void {
  // Advance to level 3 (first boss)
  gameState.advanceToNextBlind(); // Level 2
  gameState.advanceToNextBlind(); // Level 3
  
  // Mock the boss type if needed for deterministic testing
  // This would require accessing private fields or using a test-specific constructor
}
```
