// ============================================
// FILE: src/models/game/game-state.ts
// ============================================

import { Deck } from '../core/deck';
import { Card } from '../core/card';
import { Joker } from '../special-cards/jokers/joker';
import { Tarot } from '../special-cards/tarots/tarot';
import { Blind } from '../blinds/blind';
import { BlindGenerator } from '../blinds/blind-generator';
import { HandUpgradeManager } from '../poker/hand-upgrade-manager';
import { ScoreCalculator } from '../scoring/score-calculator';
import { ScoreResult } from '../scoring/score-result';
import { HandEvaluator } from '../poker/hand-evaluator';
import { BossBlind } from '../blinds/boss-blind';

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
    this.money = 5; // Starting money
    this.accumulatedScore = 0;
    this.levelNumber = 1;
    this.roundNumber = 1;
    this.handsRemaining = 3;
    this.discardsRemaining = 3;
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
    if (this.deck.getRemaining() < 8) {
      // If deck is low, reshuffle discard pile
      console.log('Deck low, reshuffling discard pile...');
      // In a real implementation, we would reshuffle the discard pile here
      // For now, we'll just throw an error if we can't deal
      throw new Error('Not enough cards in deck to deal hand');
    }

    this.currentHand = this.deck.drawCards(8);
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
      if (this.selectedCards.length < 5) {
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
    if (this.selectedCards.length > 5) {
      throw new Error('Cannot play more than 5 cards at once');
    }
    if (this.handsRemaining <= 0) {
      throw new Error('No hands remaining');
    }

    // Calculate score
    const result = this.scoreCalculator.calculateScore(
      this.selectedCards,
      this.jokers,
      this.deck.getRemaining(),
      this.currentBlind.getModifier()
    );

    // Add to accumulated score
    this.accumulatedScore += result.totalScore;
    console.log(`Played hand for ${result.totalScore} points. Total: ${this.accumulatedScore}/${this.currentBlind.getScoreGoal()}`);

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

    const discardCount = this.selectedCards.length;

    // Remove selected cards from hand
    this.currentHand = this.currentHand.filter(card =>
      !this.selectedCards.some(selected => selected.getId() === card.getId())
    );

    // Draw replacement cards
    if (this.deck.getRemaining() < discardCount) {
      // In a real implementation, we would reshuffle the discard pile here
      throw new Error('Not enough cards in deck to replace discarded cards');
    }

    const replacements = this.deck.drawCards(discardCount);
    this.currentHand.push(...replacements);

    // Decrement discards remaining
    this.discardsRemaining--;

    // Clear selection
    this.clearSelection();

    console.log(`Discarded ${discardCount} cards, drew ${replacements.length} replacements. ${this.discardsRemaining} discards remaining`);
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

    if (this.jokers.length < 5) {
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

    if (this.consumables.length < 2) {
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
   * @throws Error if level not complete
   */
  public advanceToNextBlind(): void {
    if (!this.isLevelComplete()) {
      throw new Error('Cannot advance to next blind: current level not complete');
    }

    // Add money reward
    const reward = this.currentBlind.getReward();
    this.addMoney(reward);

    // Check for Golden Joker bonus
    const hasGoldenJoker = this.jokers.some(j => j.name === 'Golden Joker');
    if (hasGoldenJoker) {
      this.addMoney(2);
      console.log('Golden Joker bonus: +$2');
    }

    // Increment level
    this.levelNumber++;

    // Update round number if needed (every 3 levels)
    this.roundNumber = BlindGenerator.calculateRoundNumber(this.levelNumber);

    // Generate next blind
    this.currentBlind = this.blindGenerator.generateBlind(this.levelNumber);

    // Reset hands and discards
    this.handsRemaining = 3;
    this.discardsRemaining = 3;

    // Apply boss blind modifiers if needed
    if (this.currentBlind instanceof BossBlind) {
      this.applyBlindModifiers();
    }

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
    return [...this.currentHand]; // Return copy
  }

  public getSelectedCards(): Card[] {
    return [...this.selectedCards]; // Return copy
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

  /**
   * Resets game to initial state for new game.
   */
  public reset(): void {
    this.deck = new Deck();
    this.currentHand = [];
    this.selectedCards = [];
    this.jokers = [];
    this.consumables = [];
    this.money = 5;
    this.accumulatedScore = 0;
    this.levelNumber = 1;
    this.roundNumber = 1;
    this.handsRemaining = 3;
    this.discardsRemaining = 3;
    this.upgradeManager = new HandUpgradeManager();
    this.currentBlind = this.blindGenerator.generateBlind(this.levelNumber);

    console.log('Game reset to initial state');
  }
}