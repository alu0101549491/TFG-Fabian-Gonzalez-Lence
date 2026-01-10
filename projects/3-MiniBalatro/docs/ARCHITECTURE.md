# Mini Balatro - Architecture Documentation

## Overview

Mini Balatro follows a **Layered Architecture** pattern with clear separation of concerns across Model, View, Controller, and Services layers.

## Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│                  View Layer (React)                 │
│  Components for rendering game state and UI         │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│              Controller Layer                       │
│  Game flow orchestration and user interaction       │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                  Model Layer                        │
│  Core entities, game logic, and state management    │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                Services Layer                       │
│  Shop, Persistence, Configuration                   │
└─────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Factory Pattern
**Used in:** `ShopItemGenerator`
- Creates Jokers, Planets, and Tarot cards
- Encapsulates object creation logic
- Allows easy addition of new card types

### 2. Strategy Pattern
**Used in:** Joker effects, Boss modifiers
- Different effect implementations for each joker type
- Boss-specific modifiers encapsulated in BlindModifier
- Enables runtime selection of algorithms

### 3. Observer Pattern
**Used in:** UI updates
- React components observe GameState changes
- Automatic UI re-rendering on state updates
- Decouples game logic from presentation

### 4. Singleton Pattern
**Used in:** `GameConfig`, `BalancingConfig`
- Single source of truth for configuration
- Global access to game constants
- Prevents multiple configuration instances

### 5. Repository Pattern
**Used in:** `GamePersistence`
- Abstracts data storage mechanism
- Separates persistence logic from business logic
- Easy to swap storage implementations

## Layer Responsibilities

### Model Layer
- **Core Entities:** Card, Deck, Hand evaluation
- **Special Cards:** Jokers, Planets, Tarots
- **Scoring:** Score calculation with strict ordering
- **Blinds:** Level progression and boss mechanics
- **Game State:** Central state management

### View Layer (React)
- **Components:** Render game elements
- **UI State:** Manage component-local state
- **User Input:** Handle clicks and interactions
- **Presentation:** Visual feedback and animations

### Controller Layer
- **GameController:** Main orchestrator
- **User Actions:** Process player input
- **Game Flow:** Manage level progression
- **Victory/Defeat:** Check win/loss conditions

### Services Layer
- **Shop:** Item generation and purchases
- **Persistence:** Save/load game state
- **Configuration:** Game constants and balancing

## Key Design Decisions

### Strict Score Calculation Order
Score calculation follows a rigid order:
1. Base values (hand type + upgrades)
2. Card bonuses
3. Chip jokers
4. Mult jokers
5. Multiplier jokers
6. Final calculation (chips × mult)

This is enforced in `ScoreCalculator` to match Balatro mechanics.

### Immutable Cards
Cards are cloned when modified to prevent unintended side effects.

### Centralized State
`GameState` is the single source of truth for all game data.

### Configuration Separation
Game balancing values are externalized to JSON for easy tweaking.

## Testing Strategy

- **Unit Tests:** Each class tested in isolation
- **Integration Tests:** Game flow end-to-end
- **Coverage Goal:** ≥75% across all layers
- **Mocking:** Dependencies mocked for unit tests

## Performance Considerations

- Vite for fast development builds
- Code splitting for React components
- Efficient card rendering (virtualization if needed)
- localStorage for persistence (< 5MB limit)

## Extensibility

The architecture supports easy addition of:
- New Joker types (extend `Joker` base class)
- New Boss types (add to `BossType` enum)
- New Tarot effects (extend `Tarot` base class)
- New hand types (add to `HandType` enum)