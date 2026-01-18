# Balancing Data Configuration

This directory contains JSON configuration files for the Mini Balatro game balancing system.

## Files

### hand-values.json
Defines the base chip and multiplier values for each poker hand type.

**Structure:**
```json
{
  "handType": {
    "chips": number,
    "mult": number
  }
}
```

### jokers.json
Contains all joker card definitions with their effects and conditions.

**Structure:**
```json
{
  "jokers": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "type": "mult" | "chips" | "multiplier" | "permanentUpgrade" | "economic",
      "value": number,
      "maxValue": number (optional),
      "condition": "string"
    }
  ]
}
```

**Joker Types:**
- `mult`: Adds to the multiplier
- `chips`: Adds to chip count
- `multiplier`: Multiplies the final score
- `permanentUpgrade`: Permanently modifies cards
- `economic`: Affects money/economy

**Conditions:**
- `always`: Always active
- `perDiamond`, `perHeart`, `perSpade`, `perClub`: Per suit card played
- `handSizeLessThanOrEqual3`: When hand has ≤3 cards
- `perEmptyJokerSlot`: Per empty joker slot
- `noDiscardsRemaining`: When no discards left
- `perFibonacciCard`: Per A, 2, 3, 5, or 8 played
- `perEvenCard`: Per 2, 4, 6, 8, 10 played
- `perOddCard`: Per A, 3, 5, 7, 9 played
- `perRemainingCard`: Per card remaining in deck
- `onCardPlayed`: When any card is played
- `onLevelComplete`: When a level is completed
- `perKingOrQueen`: Per K or Q played

### planets.json
Defines planet cards that permanently upgrade poker hand types.

**Structure:**
```json
{
  "planets": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "targetHandType": "highCard" | "pair" | "twoPair" | etc.,
      "chipsBonus": number,
      "multBonus": number
    }
  ]
}
```

### tarots.json
Contains tarot card definitions with tactical effects.

**Structure:**
```json
{
  "tarots": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "effectType": "instant" | "addMult" | "addChips" | "changeSuit" | "upgradeValue" | "duplicate" | "destroy",
      "effectValue": any (optional),
      "targetRequired": boolean
    }
  ]
}
```

**Effect Types:**
- `instant`: Immediate effect (e.g., double money)
- `addMult`: Add permanent mult bonus to a card
- `addChips`: Add permanent chip bonus to a card
- `changeSuit`: Change a card's suit
- `upgradeValue`: Increment card value (A→2, 2→3, etc.)
- `duplicate`: Create a copy of a card
- `destroy`: Remove a card from the deck

## Usage

The `BalancingConfig` class automatically loads these JSON files when `initializeAsync()` is called. If loading fails, fallback data is used.

```typescript
const config = new BalancingConfig();
await config.initializeAsync();
```

## Adding New Content

1. Add new entries to the appropriate JSON file
2. Ensure all required fields are present
3. Use unique IDs for each item
4. Test in-game to verify balance

## Balance Notes

- Hand values follow standard poker hierarchy
- Planet bonuses are cumulative with base hand values
- Joker effects stack and apply in priority order
- Tarot effects are one-time use but can have permanent results
