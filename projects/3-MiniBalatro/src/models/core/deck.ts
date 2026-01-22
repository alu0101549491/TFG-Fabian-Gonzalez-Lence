// ============================================
// FILE: src/models/core/deck.ts
// ============================================

import { Card } from './card';
import { CardValue } from './card-value.enum';
import { Suit } from './suit.enum';

/**
 * Custom error for deck-related operations.
 */
export class DeckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeckError';
  }
}

/**
 * Represents a deck of 52 French playing cards.
 * Manages drawing, shuffling, and card manipulation.
 */
export class Deck {
  private cards: Card[];
  private discardPile: Card[];
  private maxDeckSize: number;  // Track maximum possible deck size

  /**
   * Creates a new deck with 52 standard cards (13 values × 4 suits), shuffled.
   */
  constructor() {
    this.cards = [];
    this.discardPile = [];
    this.maxDeckSize = 52;  // Initial size
    this.initializeStandardDeck();
    this.shuffle();
    console.log('Deck initialized and shuffled');
  }

  /**
   * Randomizes the order of cards in the deck using Fisher-Yates algorithm.
   * This algorithm works by iterating through the array from the last element to the first,
   * and swapping each element with a randomly selected element that hasn't been shuffled yet.
   */
  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    console.log('Deck shuffled');
  }

  /**
   * Removes and returns specified number of cards from top of deck.
   * @param count The number of cards to draw
   * @returns Array of drawn cards
   * @throws DeckError if count is invalid or exceeds remaining cards
   */
  public drawCards(count: number): Card[] {
    if (count <= 0) {
      throw new DeckError('Draw count must be positive');
    }
    if (count > this.cards.length) {
      throw new DeckError(`Cannot draw ${count} cards: only ${this.cards.length} remaining`);
    }

    const drawnCards = this.cards.splice(0, count);
    console.log(`Drew ${count} cards from deck. ${this.cards.length} cards remaining.`);
    return drawnCards;
  }

  /**
   * Adds a card to the bottom of the deck (used by Death tarot for duplication).
   * @param card The card to add
   * @throws DeckError if card is null or undefined
   */
  public addCard(card: Card): void {
    if (!card) {
      throw new DeckError('Cannot add null or undefined card to deck');
    }
    this.cards.push(card);
    this.maxDeckSize++;  // Increase maximum deck size when duplicating
    console.log(`Card ${card.getId()} added to deck. Total cards: ${this.cards.length}, Max: ${this.maxDeckSize}`);
  }

  /**
   * Permanently removes a card from deck by ID (used by The Hanged Man tarot).
   * This reduces the maximum deck size permanently.
   * @param cardId The ID of the card to remove
   * @throws DeckError if cardId not found in deck
   */
  public removeCard(cardId: string): void {
    const index = this.cards.findIndex(card => card.getId() === cardId);
    if (index === -1) {
      throw new DeckError(`Card with ID ${cardId} not found in deck`);
    }

    this.cards.splice(index, 1);
    this.maxDeckSize--;  // Permanently decrease maximum deck size
    console.log(`Card ${cardId} permanently destroyed. Max deck size now: ${this.maxDeckSize}, Current: ${this.cards.length}`);
    // Note: We don't add to discard pile - card is permanently gone
  }

  /**
   * Decreases the maximum deck size (used when destroying a card that's already in hand).
   * Call this when a card is permanently destroyed but not currently in the deck.
   */
  public decreaseMaxDeckSize(): void {
    this.maxDeckSize--;
    console.log(`Max deck size decreased to: ${this.maxDeckSize}`);
  }

  /**
   * Increases the maximum deck size (used when duplicating a card).
   * Call this when a new card is created via duplication.
   */
  public increaseMaxDeckSize(): void {
    this.maxDeckSize++;
    console.log(`Max deck size increased to: ${this.maxDeckSize}`);
  }

  /**
   * Returns count of cards remaining in deck.
   * @returns The number of cards remaining
   */
  public getRemaining(): number {
    return this.cards.length;
  }

  /**
   * Returns the maximum possible deck size (decreases when cards are permanently destroyed).
   * @returns The maximum deck size
   */
  public getMaxDeckSize(): number {
    return this.maxDeckSize;
  }

  /**
   * Adds cards to the discard pile (used when playing/discarding cards).
   * @param cards - Cards to add to discard pile
   */
  public addToDiscardPile(cards: Card[]): void {
    this.discardPile.push(...cards);
    console.log(`Added ${cards.length} cards to discard pile. Discard pile now has ${this.discardPile.length} cards.`);
  }

  /**
   * Returns the current cards in the deck (for serialization).
   * @returns Array of cards currently in the deck
   */
  public getCards(): Card[] {
    return [...this.cards];
  }

  /**
   * Returns the current discard pile (for serialization).
   * @returns Array of cards in the discard pile
   */
  public getDiscardPile(): Card[] {
    return [...this.discardPile];
  }

  /**
   * Sets the deck and discard pile state (for deserialization).
   * @param cards - Cards to set as the deck
   * @param discardPile - Cards to set as the discard pile
   * @param maxDeckSize - Optional max deck size (defaults to cards.length + discardPile.length)
   */
  public setState(cards: Card[], discardPile: Card[], maxDeckSize?: number): void {
    this.cards = [...cards];
    this.discardPile = [...discardPile];
    this.maxDeckSize = maxDeckSize ?? (cards.length + discardPile.length);
    console.log(`Deck state set: ${this.cards.length} cards in deck, ${this.discardPile.length} in discard pile, max: ${this.maxDeckSize}`);
  }

  /**
   * Resets deck to full 52 standard cards, shuffled, clears discard pile.
   */
  public reset(): void {
    this.initializeStandardDeck();
    this.shuffle();
    this.discardPile = [];
    this.maxDeckSize = 52;  // Reset to initial size
    console.log('Deck reset to 52 cards and shuffled');
  }

  /**
   * Recombines all cards (deck + discard pile) and shuffles, preserving card bonuses.
   * Use this between rounds to maintain permanent upgrades from tarots.
   */
  public recombineAndShuffle(): void {
    // Combine all cards from deck and discard pile
    this.cards.push(...this.discardPile);
    this.discardPile = [];
    
    // Shuffle the combined deck
    this.shuffle();
    
    console.log(`Deck recombined and shuffled: ${this.cards.length} cards, max: ${this.maxDeckSize}`);
  }

  /**
   * Helper method to create 52 standard cards (13 values × 4 suits).
   */
  private initializeStandardDeck(): void {
    this.cards = [];
    // Create all 52 cards (13 values × 4 suits)
    Object.values(CardValue).forEach(value => {
      Object.values(Suit).forEach(suit => {
        this.cards.push(new Card(value, suit));
      });
    });
    console.log('Standard deck initialized with 52 cards');
  }
}
