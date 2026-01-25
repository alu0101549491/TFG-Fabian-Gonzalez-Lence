// ============================================
// FILE: src/models/game/game-state.ts
// ============================================

import { Deck } from '../core/deck';
import { Card } from '../core/card';
import { Joker } from '../special-cards/jokers/joker';
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
    if (this.deck.getRemaining() < GameConfig.HAND_SIZE) {
      // If deck is low, reshuffle discard pile
      console.log('Deck low, reshuffling discard pile...');
      // In a real implementation, we would reshuffle the discard pile here
      // For now, we'll just throw an error if we can't deal
      throw new Error('Not enough cards in deck to deal hand');
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
    const scoringJokers = this.jokers.filter(joker => {
      // Filter out economic jokers by checking their description/effect type
      // Economic jokers have effects like "+$X" that trigger on level completion
      return !joker.description.includes('+$');
    });

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
      console.log(`Not enough cards in deck to refill hand (need ${cardsNeeded}, have ${this.deck.getRemaining()})`);
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
    const cardsNeeded = GameConfig.HAND_SIZE - this.currentHand.length;
    if (cardsNeeded > 0 && this.deck.getRemaining() >= cardsNeeded) {
      const replacements = this.deck.drawCards(cardsNeeded);
      this.currentHand.push(...replacements);
      console.log(`Drew ${replacements.length} cards to refill hand to ${GameConfig.HAND_SIZE}`);
    } else if (cardsNeeded > 0) {
      console.log(`Not enough cards in deck to refill hand (need ${cardsNeeded}, have ${this.deck.getRemaining()})`);
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
    const scoringJokers = this.jokers.filter(joker => {
      return !joker.description.includes('+$');
    });

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
