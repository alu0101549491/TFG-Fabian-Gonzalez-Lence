# TESTING CONTEXT

- Project: Mini Balatro
- Components under test: Card, Deck, CardValue (enum), Suit (enum)
- Testing framework: Jest 29.x, ts-jest
- Target coverage: 90% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/core/card-value.enum.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/core/card-value.enum.ts
 * @desc Card value enumeration and utility functions for rank management (A-2).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum representing the 13 values in a French deck.
 * Values ordered from highest (ACE) to lowest (TWO) for poker hand comparison.
 */
export enum CardValue {
  ACE = 'A',
  KING = 'K',
  QUEEN = 'Q',
  JACK = 'J',
  TEN = '10',
  NINE = '9',
  EIGHT = '8',
  SEVEN = '7',
  SIX = '6',
  FIVE = '5',
  FOUR = '4',
  THREE = '3',
  TWO = '2'
}

/**
 * Returns the base chip value for a given card value.
 * @param value The card value to get the base chips for
 * @returns The base chip value
 */
export function getBaseChipsForValue(value: CardValue): number {
  const chipValues: Record<CardValue, number> = {
    [CardValue.ACE]: 11,
    [CardValue.KING]: 10,
    [CardValue.QUEEN]: 10,
    [CardValue.JACK]: 10,
    [CardValue.TEN]: 10,
    [CardValue.NINE]: 9,
    [CardValue.EIGHT]: 8,
    [CardValue.SEVEN]: 7,
    [CardValue.SIX]: 6,
    [CardValue.FIVE]: 5,
    [CardValue.FOUR]: 4,
    [CardValue.THREE]: 3,
    [CardValue.TWO]: 2
  };
  return chipValues[value];
}

/**
 * Returns the next card value in sequence (A→2, 2→3, ..., K→A).
 * @param value The current card value
 * @returns The next card value in sequence
 */
export function getNextValue(value: CardValue): CardValue {
  switch (value) {
    case CardValue.ACE: return CardValue.TWO;
    case CardValue.TWO: return CardValue.THREE;
    case CardValue.THREE: return CardValue.FOUR;
    case CardValue.FOUR: return CardValue.FIVE;
    case CardValue.FIVE: return CardValue.SIX;
    case CardValue.SIX: return CardValue.SEVEN;
    case CardValue.SEVEN: return CardValue.EIGHT;
    case CardValue.EIGHT: return CardValue.NINE;
    case CardValue.NINE: return CardValue.TEN;
    case CardValue.TEN: return CardValue.JACK;
    case CardValue.JACK: return CardValue.QUEEN;
    case CardValue.QUEEN: return CardValue.KING;
    case CardValue.KING: return CardValue.ACE;
    default:
      // This should never happen as we're using a complete enum
      throw new Error(`Unknown card value: ${value}`);
  }
}

/**
 * Returns the display string for a card value.
 * @param value The card value to display
 * @returns The display string
 */
export function getValueDisplay(value: CardValue): string {
  return value;
}
```

## File 2: src/models/core/suit.enum.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/core/suit.enum.ts
 * @desc Suit enumeration for French playing cards (Diamonds, Hearts, Spades, Clubs).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum representing the 4 suits in a French deck.
 */
export enum Suit {
  DIAMONDS = 'DIAMONDS',
  HEARTS = 'HEARTS',
  SPADES = 'SPADES',
  CLUBS = 'CLUBS'
}
```

## File 3: src/models/core/card.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/core/card.ts
 * @desc Playing card model with value, suit, and bonus management for tarot effects.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { v4 as uuidv4 } from 'uuid';
import { CardValue, getBaseChipsForValue, getNextValue, getValueDisplay } from './card-value.enum';
import { Suit } from './suit.enum';
import { getSuitSymbol } from '../../utils/constants';

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
```

## File 4: src/models/core/deck.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/core/deck.ts
 * @desc Deck model managing 52 playing cards with drawing, shuffling, and persistence.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

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
      useESM: true,
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
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
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
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
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

## CardValue Enum Requirements:
- Must define all 13 card values (ACE, KING, QUEEN, JACK, TEN, NINE, EIGHT, SEVEN, SIX, FIVE, FOUR, THREE, TWO)
- Must provide getChipValue() method returning: ACE=11, K/Q/J=10, numeric=face value
- Must provide getNextValue() for Strength tarot (K→A wrap)
- Must provide getDisplayString() returning: A, K, Q, J, 10-2

## Suit Enum Requirements:
- Must define all 4 suits (DIAMONDS, HEARTS, SPADES, CLUBS)
- Must provide getSymbol() returning: ♦, ♥, ♠, ♣
- Must provide getColor() returning hex colors from specification

## Card Class Requirements:
- Properties: value (CardValue), suit (Suit), chipBonus (number), multBonus (number), id (string UUID)
- Constructor validates inputs and generates unique ID
- getBaseChips() returns value chips + chipBonus
- addPermanentBonus(chips, mult) adds bonuses, validates non-negative
- changeSuit(newSuit) changes suit
- upgradeValue() increments value with K→A wrap
- clone() creates new card with same properties but new ID

## Deck Class Requirements:
- Constructor creates 52 unique cards (13 values × 4 suits) and shuffles
- shuffle() uses Fisher-Yates algorithm
- drawCards(count) returns array of cards, removes from deck
- addCard(card) adds card to deck
- removeCard(cardId) removes specific card by ID
- getRemaining() returns number of cards left
- reset() creates new 52-card deck and shuffles
- Properties: cards (Card[]), discardPile (Card[])

## Edge Cases:
- Drawing more cards than available (throw error)
- Removing non-existent card ID (throw error)
- Upgrading King value (wraps to Ace)
- Adding negative bonuses (throw error)
- Cloning preserves bonuses but generates new ID
- Empty deck shuffle (no-op)

# TASK

Generate a complete unit test suite for Core Models that covers:

## 1. CardValue Enum Tests
- [ ] All 13 values defined correctly
- [ ] getChipValue() returns correct values (A=11, K/Q/J=10, numeric=face)
- [ ] getNextValue() sequences correctly (2→3, 3→4, ..., K→A)
- [ ] getDisplayString() returns correct strings (A, K, Q, J, 10-2)
- [ ] Edge case: King wraps to Ace

## 2. Suit Enum Tests
- [ ] All 4 suits defined correctly
- [ ] getSymbol() returns correct Unicode symbols
- [ ] getColor() returns correct hex colors from spec
- [ ] All suits have unique symbols and colors

## 3. Card Class Tests

### Constructor & Properties:
- [ ] Creates card with valid value and suit
- [ ] Generates unique UUID for id
- [ ] Initializes chipBonus = 0
- [ ] Initializes multBonus = 0
- [ ] Throws error on null/undefined value
- [ ] Throws error on null/undefined suit

### getBaseChips():
- [ ] Returns correct base chips for each card value
- [ ] Includes chipBonus in calculation
- [ ] Ace returns 11 chips
- [ ] Face cards return 10 chips
- [ ] Numeric cards return face value

### addPermanentBonus():
- [ ] Adds positive chips bonus correctly
- [ ] Adds positive mult bonus correctly
- [ ] Adds both bonuses simultaneously
- [ ] Accumulates multiple bonus additions
- [ ] Throws error on negative chips
- [ ] Throws error on negative mult
- [ ] Accepts zero as valid bonus

### changeSuit():
- [ ] Changes suit to new value
- [ ] Accepts all 4 suit types
- [ ] Preserves value and bonuses
- [ ] Throws error on null/undefined suit

### upgradeValue():
- [ ] Upgrades TWO to THREE
- [ ] Upgrades numeric cards sequentially
- [ ] Upgrades JACK to QUEEN
- [ ] Upgrades QUEEN to KING
- [ ] Upgrades KING to ACE (wrap)
- [ ] Upgrades ACE to TWO (wrap)
- [ ] Preserves suit and bonuses

### clone():
- [ ] Creates new card with same value
- [ ] Creates new card with same suit
- [ ] Preserves chipBonus
- [ ] Preserves multBonus
- [ ] Generates NEW unique ID (not same as original)
- [ ] Original and clone have different IDs

## 4. Deck Class Tests

### Constructor:
- [ ] Creates exactly 52 cards
- [ ] Contains all 13 values
- [ ] Contains all 4 suits
- [ ] Each card is unique (13×4 combinations)
- [ ] Cards are shuffled (not in sorted order)
- [ ] Initializes empty discardPile
- [ ] All cards have unique IDs

### shuffle():
- [ ] Shuffles existing cards
- [ ] Maintains card count (no loss)
- [ ] Shuffles empty deck without error
- [ ] Cards are in different order after shuffle
- [ ] Does not create duplicate cards

### drawCards():
- [ ] Draws 1 card successfully
- [ ] Draws 8 cards successfully (hand size)
- [ ] Draws all 52 cards without error
- [ ] Removes drawn cards from deck
- [ ] Returns cards in array
- [ ] Decrements remaining count
- [ ] Throws error when drawing more than available
- [ ] Throws error when count is negative
- [ ] Throws error when count is zero

### addCard():
- [ ] Adds card to deck successfully
- [ ] Increases card count
- [ ] Accepts cards with bonuses
- [ ] Throws error on null card
- [ ] Can add previously drawn card back

### removeCard():
- [ ] Removes card by ID successfully
- [ ] Decreases card count
- [ ] Throws error on non-existent ID
- [ ] Throws error on null/empty ID
- [ ] Can remove specific card from middle of deck

### getRemaining():
- [ ] Returns 52 for new deck
- [ ] Returns 0 for empty deck
- [ ] Returns correct count after draws
- [ ] Returns correct count after adds/removes

### reset():
- [ ] Creates new 52-card deck
- [ ] Shuffles new deck
- [ ] Clears discard pile
- [ ] All cards have unique IDs
- [ ] Can reset multiple times

## 5. Integration Tests (within Core)

### Card-Deck Integration:
- [ ] Deck contains valid Card instances
- [ ] Cards drawn from deck are playable
- [ ] Modified cards (with bonuses) work in deck
- [ ] Cloned cards can be added to deck

### Tarot Effects Simulation:
- [ ] Simulate Emperor tarot (+20 chips to card)
- [ ] Simulate Empress tarot (+4 mult to card)
- [ ] Simulate Strength tarot (upgrade value)
- [ ] Simulate suit change tarots
- [ ] Simulate Death tarot (clone card)
- [ ] Simulate Hanged Man tarot (remove card)

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Card, Deck, CardValue, Suit } from '@/models/core';

describe('Core Models', () => {
  describe('CardValue Enum', () => {
    describe('getChipValue', () => {
      it('should return 11 for ACE', () => {
        // ARRANGE
        const value = CardValue.ACE;
        
        // ACT
        const chips = value.getChipValue();
        
        // ASSERT
        expect(chips).toBe(11);
      });

      it('should return 10 for face cards', () => {
        // ARRANGE & ACT & ASSERT
        expect(CardValue.KING.getChipValue()).toBe(10);
        expect(CardValue.QUEEN.getChipValue()).toBe(10);
        expect(CardValue.JACK.getChipValue()).toBe(10);
      });

      it('should return face value for numeric cards', () => {
        // ARRANGE & ACT & ASSERT
        expect(CardValue.TEN.getChipValue()).toBe(10);
        expect(CardValue.NINE.getChipValue()).toBe(9);
        expect(CardValue.FIVE.getChipValue()).toBe(5);
        expect(CardValue.TWO.getChipValue()).toBe(2);
      });
    });

    describe('getNextValue', () => {
      it('should wrap KING to ACE', () => {
        // ARRANGE
        const king = CardValue.KING;
        
        // ACT
        const next = king.getNextValue();
        
        // ASSERT
        expect(next).toBe(CardValue.ACE);
      });
    });
  });

  describe('Card', () => {
    describe('constructor', () => {
      it('should create card with valid value and suit', () => {
        // ARRANGE & ACT
        const card = new Card(CardValue.ACE, Suit.SPADES);
        
        // ASSERT
        expect(card.value).toBe(CardValue.ACE);
        expect(card.suit).toBe(Suit.SPADES);
        expect(card.chipBonus).toBe(0);
        expect(card.multBonus).toBe(0);
        expect(card.id).toBeDefined();
        expect(card.id).toMatch(/^[0-9a-f-]{36}$/i); // UUID format
      });

      it('should throw error on null value', () => {
        // ARRANGE & ACT & ASSERT
        expect(() => new Card(null as any, Suit.HEARTS))
          .toThrow();
      });
    });

    describe('addPermanentBonus', () => {
      it('should add chips bonus correctly', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.DIAMONDS);
        
        // ACT
        card.addPermanentBonus(20, 0);
        
        // ASSERT
        expect(card.getBaseChips()).toBe(30); // 10 + 20
      });

      it('should throw error on negative chips', () => {
        // ARRANGE
        const card = new Card(CardValue.ACE, Suit.CLUBS);
        
        // ACT & ASSERT
        expect(() => card.addPermanentBonus(-10, 0))
          .toThrow('Bonus values cannot be negative');
      });
    });

    describe('upgradeValue', () => {
      it('should wrap KING to ACE', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.SPADES);
        
        // ACT
        card.upgradeValue();
        
        // ASSERT
        expect(card.value).toBe(CardValue.ACE);
      });
    });

    describe('clone', () => {
      it('should create new card with different ID', () => {
        // ARRANGE
        const original = new Card(CardValue.QUEEN, Suit.HEARTS);
        original.addPermanentBonus(10, 5);
        
        // ACT
        const cloned = original.clone();
        
        // ASSERT
        expect(cloned.value).toBe(original.value);
        expect(cloned.suit).toBe(original.suit);
        expect(cloned.chipBonus).toBe(original.chipBonus);
        expect(cloned.multBonus).toBe(original.multBonus);
        expect(cloned.id).not.toBe(original.id);
      });
    });
  });

  describe('Deck', () => {
    let deck: Deck;

    beforeEach(() => {
      deck = new Deck();
    });

    describe('constructor', () => {
      it('should create 52 unique cards', () => {
        // ASSERT
        expect(deck.getRemaining()).toBe(52);
      });

      it('should contain all card combinations', () => {
        // ARRANGE
        const allCards = deck['cards']; // Access private for testing
        
        // ACT - Count unique combinations
        const combinations = new Set(
          allCards.map(c => `${c.value}-${c.suit}`)
        );
        
        // ASSERT
        expect(combinations.size).toBe(52);
      });
    });

    describe('drawCards', () => {
      it('should draw 8 cards successfully', () => {
        // ACT
        const hand = deck.drawCards(8);
        
        // ASSERT
        expect(hand).toHaveLength(8);
        expect(deck.getRemaining()).toBe(44);
      });

      it('should throw error when drawing more than available', () => {
        // ACT & ASSERT
        expect(() => deck.drawCards(53))
          .toThrow('Not enough cards');
      });
    });

    describe('removeCard', () => {
      it('should remove card by ID', () => {
        // ARRANGE
        const cards = deck.drawCards(1);
        const cardId = cards[0].id;
        deck['cards'].push(cards[0]); // Add back for test
        
        // ACT
        deck.removeCard(cardId);
        
        // ASSERT
        expect(deck.getRemaining()).toBe(51);
      });

      it('should throw error on non-existent ID', () => {
        // ACT & ASSERT
        expect(() => deck.removeCard('invalid-id'))
          .toThrow('Card not found');
      });
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for all 4 components
- Proper TypeScript types throughout
- AAA pattern for all tests
- Proper mocking where needed

## 2. Coverage Matrix

| Component | Method | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|--------|--------------|------------|------------|-------|
| CardValue | getChipValue | 3 | 0 | 0 | 3 |
| CardValue | getNextValue | 12 | 1 | 0 | 13 |
| CardValue | getDisplayString | 13 | 0 | 0 | 13 |
| Suit | getSymbol | 4 | 0 | 0 | 4 |
| Suit | getColor | 4 | 0 | 0 | 4 |
| Card | constructor | 1 | 0 | 2 | 3 |
| Card | getBaseChips | 5 | 1 | 0 | 6 |
| Card | addPermanentBonus | 4 | 1 | 2 | 7 |
| Card | changeSuit | 4 | 0 | 1 | 5 |
| Card | upgradeValue | 6 | 2 | 0 | 8 |
| Card | clone | 1 | 0 | 0 | 1 |
| Deck | constructor | 2 | 0 | 0 | 2 |
| Deck | shuffle | 3 | 1 | 0 | 4 |
| Deck | drawCards | 3 | 2 | 3 | 8 |
| Deck | addCard | 3 | 0 | 1 | 4 |
| Deck | removeCard | 2 | 0 | 2 | 4 |
| Deck | getRemaining | 4 | 0 | 0 | 4 |
| Deck | reset | 4 | 0 | 0 | 4 |
| **Integration** | - | 6 | 0 | 0 | 6 |
| **TOTAL** | | | | | **103** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **90%**
- Methods covered: **17/17** (100%)
- Uncovered scenarios: None critical (UUID generation internals)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/core.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/core.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/core.test.ts
```

# SPECIAL CASES TO CONSIDER
- UUID uniqueness testing (check collision probability)
- Fisher-Yates shuffle randomness (check distribution)
- Card value wraparound (K→A→2 cycling)
- Bonus accumulation (multiple adds)
- Deck state after multiple operations
