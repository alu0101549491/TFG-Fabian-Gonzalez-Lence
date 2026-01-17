// ============================================
// FILE: src/models/core/card.ts
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { CardValue, getBaseChipsForValue, getNextValue } from './card-value.enum';
import { Suit, getSuitSymbol } from './suit.enum';

/**
 * Represents a single playing card in the game.
 * Cards can have permanent bonuses applied via tarot cards.
 */
export class Card {
  private readonly id: string;
  private chipBonus: number;
  private multBonus: number;

  /**
   * Creates a new card with specified value and suit.
   * @param value The card's rank (A, K, Q, etc.)
   * @param suit The card's suit (Diamonds, Hearts, Spades, Clubs)
   */
  constructor(
    public value: CardValue,
    public suit: Suit
  ) {
    this.id = uuidv4();
    this.chipBonus = 0;
    this.multBonus = 0;
    console.log(`Card created: ${getValueDisplay(value)}${getSuitSymbol(suit)}`);
  }

  /**
   * Returns total chips this card contributes (base value + permanent bonus).
   * @returns The total chip value
   */
  public getBaseChips(): number {
    return getBaseChipsForValue(this.value) + this.chipBonus;
  }

  /**
   * Adds permanent bonuses to card (used by The Empress/Emperor tarot).
   * @param chips The chip bonus to add
   * @param mult The mult bonus to add
   * @throws Error if negative values are provided
   */
  public addPermanentBonus(chips: number, mult: number): void {
    if (chips < 0 || mult < 0) {
      throw new Error('Bonus values cannot be negative');
    }
    this.chipBonus += chips;
    this.multBonus += mult;
    console.log(`Bonuses added to card ${this.id}: +${chips} chips, +${mult} mult`);
  }

  /**
   * Changes the card's suit (used by The Star/Moon/Sun/World tarot).
   * @param newSuit The new suit to assign
   */
  public changeSuit(newSuit: Suit): void {
    console.log(`Changing suit of card ${this.id} from ${this.suit} to ${newSuit}`);
    this.suit = newSuit;
  }

  /**
   * Increments card value in sequence: A→2, 2→3, ..., K→A (used by Strength tarot).
   */
  public upgradeValue(): void {
    const oldValue = this.value;
    this.value = getNextValue(this.value);
    console.log(`Card ${this.id} upgraded from ${oldValue} to ${this.value}`);
  }

  /**
   * Creates deep copy of card with new unique ID (used by Death tarot).
   * @returns A new Card object with same value, suit, and bonuses but different ID
   */
  public clone(): Card {
    const clonedCard = new Card(this.value, this.suit);
    clonedCard.chipBonus = this.chipBonus;
    clonedCard.multBonus = this.multBonus;
    console.log(`Card ${this.id} cloned to new card ${clonedCard.id}`);
    return clonedCard;
  }

  /**
   * Returns the card's unique identifier.
   * @returns The card's ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the card's mult bonus.
   * @returns The mult bonus value
   */
  public getMultBonus(): number {
    return this.multBonus;
  }

  /**
   * Returns a string representation of the card (e.g., "A♠", "10♥").
   * @returns The display string for the card
   */
  public getDisplayString(): string {
    return `${getValueDisplay(this.value)}${getSuitSymbol(this.suit)}`;
  }
}

// Helper function to get display string for a card value
function getValueDisplay(value: CardValue): string {
  return value;
}