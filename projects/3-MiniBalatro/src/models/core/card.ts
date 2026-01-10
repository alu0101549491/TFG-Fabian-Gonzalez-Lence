import {CardValue} from './card-value.enum';
import {Suit} from './suit.enum';

/**
 * Represents a single playing card with value, suit, and bonus modifiers.
 * Cards can be enhanced with permanent chip and multiplier bonuses.
 */
export class Card {
  private value: CardValue;
  private suit: Suit;
  private chipBonus: number;
  private multBonus: number;
  private id: string;

  /**
   * Creates a new Card instance.
   * @param {CardValue} value - The card's value
   * @param {Suit} suit - The card's suit
   */
  constructor(value: CardValue, suit: Suit) {
    // TODO: Initialize card properties
  }

  /**
   * Gets the base chip value of the card based on its value.
   * @return {number} Base chip value
   */
  public getBaseChips(): number {
    // TODO: Implement base chips calculation
    return 0;
  }

  /**
   * Adds permanent chip and mult bonuses to the card.
   * @param {number} chips - Chip bonus to add
   * @param {number} mult - Multiplier bonus to add
   */
  public addPermanentBonus(chips: number, mult: number): void {
    // TODO: Implement permanent bonus addition
  }

  /**
   * Changes the card's suit.
   * @param {Suit} newSuit - The new suit for the card
   */
  public changeSuit(newSuit: Suit): void {
    // TODO: Implement suit change
  }

  /**
   * Upgrades the card's value to the next higher value.
   */
  public upgradeValue(): void {
    // TODO: Implement value upgrade
  }

  /**
   * Creates a deep copy of the card.
   * @return {Card} Cloned card instance
   */
  public clone(): Card {
    // TODO: Implement card cloning
    return new Card(this.value, this.suit);
  }

  // Getters
  public getValue(): CardValue {
    return this.value;
  }

  public getSuit(): Suit {
    return this.suit;
  }

  public getChipBonus(): number {
    return this.chipBonus;
  }

  public getMultBonus(): number {
    return this.multBonus;
  }

  public getId(): string {
    return this.id;
  }
}