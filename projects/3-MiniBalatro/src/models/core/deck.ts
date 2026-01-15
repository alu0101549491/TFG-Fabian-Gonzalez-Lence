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

  /**
   * Creates a new deck with 52 standard cards (13 values × 4 suits), shuffled.
   */
  constructor() {
    this.cards = [];
    this.discardPile = [];
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
    console.log(`Card ${card.getId()} added to deck. Total cards: ${this.cards.length}`);
  }

  /**
   * Permanently removes a card from deck by ID (used by The Hanged Man tarot).
   * @param cardId The ID of the card to remove
   * @throws DeckError if cardId not found in deck
   */
  public removeCard(cardId: string): void {
    const index = this.cards.findIndex(card => card.getId() === cardId);
    if (index === -1) {
      throw new DeckError(`Card with ID ${cardId} not found in deck`);
    }

    const [removedCard] = this.cards.splice(index, 1);
    this.discardPile.push(removedCard);
    console.log(`Card ${cardId} removed from deck. ${this.cards.length} cards remaining.`);
  }

  /**
   * Returns count of cards remaining in deck.
   * @returns The number of cards remaining
   */
  public getRemaining(): number {
    return this.cards.length;
  }

  /**
   * Resets deck to full 52 standard cards, shuffled, clears discard pile.
   */
  public reset(): void {
    this.initializeStandardDeck();
    this.shuffle();
    this.discardPile = [];
    console.log('Deck reset to 52 cards and shuffled');
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
