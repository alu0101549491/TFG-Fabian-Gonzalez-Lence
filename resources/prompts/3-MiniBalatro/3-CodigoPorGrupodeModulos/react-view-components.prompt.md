# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** View Layer - React Components

**Project File Structure:**
```
3-MiniBalatro/
├── src/
│   ├── models/
│   │   ├── core/
│   │   ├── poker/
│   │   ├── special-cards/
│   │   ├── scoring/
│   │   ├── blinds/
│   │   └── game/
│   ├── controllers/
│   │   └── game-controller.ts
│   ├── services/
│   │   ├── shop/
│   │   ├── persistence/
│   │   └── config/
│   ├── views/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── game-board/
│   │   │   │   ├── index.ts
│   │   │   │   ├── GameBoard.tsx           ← IMPLEMENT
│   │   │   │   └── GameBoard.css
│   │   │   ├── hand/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Hand.tsx                ← IMPLEMENT
│   │   │   │   └── Hand.css
│   │   │   ├── card/
│   │   │   │   ├── index.ts
│   │   │   │   ├── CardComponent.tsx       ← IMPLEMENT
│   │   │   │   └── CardComponent.css
│   │   │   ├── joker-zone/
│   │   │   │   ├── index.ts
│   │   │   │   ├── JokerZone.tsx           ← IMPLEMENT
│   │   │   │   └── JokerZone.css
│   │   │   ├── tarot-zone/
│   │   │   │   ├── index.ts
│   │   │   │   ├── TarotZone.tsx           ← IMPLEMENT
│   │   │   │   └── TarotZone.css
│   │   │   ├── shop/
│   │   │   │   ├── index.ts
│   │   │   │   ├── ShopView.tsx            ← IMPLEMENT
│   │   │   │   └── ShopView.css
│   │   │   ├── score-display/
│   │   │   │   ├── index.ts
│   │   │   │   ├── ScoreDisplay.tsx        ← IMPLEMENT
│   │   │   │   └── ScoreDisplay.css
│   │   │   └── menu/
│   │   │       ├── index.ts
│   │   │       ├── MainMenu.tsx            ← IMPLEMENT
│   │   │       └── MainMenu.css
│   │   └── App.tsx                         ← IMPLEMENT
│   ├── utils/
│   └── types/
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant sections:**

### Section 5: Non-Functional Requirements
- **NFR2:** Clear interface with differentiated zones
- **NFR3:** Immediate response to user actions (< 1 second)
- **NFR7:** Simple animations or 2D pixel art style
- **NFR8:** Clear visual feedback
- **NFR12:** Basic responsive design (minimum 1024px width recommended)

### Section 10: Detailed User Interface

**Main Game Area:**
- Current hand: 8 cards arranged horizontally, selectable by click
- Selection indicator: Highlighted border or vertical displacement
- Visual limit: "5/5" indicator when max selected
- Action buttons: "Play Hand", "Discard" (enabled/disabled states)
- Top counters: "Hands: X/3", "Discards: X/3"
- Level information: Blind type, accumulated/goal points, progress bar
- Preview panel: Shows chips, mult, total for selected cards

**Active Jokers Area:**
- 5 horizontal spaces for jokers
- Visible joker cards with names and effects
- Activation order indicator
- Empty slots clearly differentiated

**Consumables Area:**
- 2 spaces for tarot cards
- Visible cards with names
- "Use" button below each tarot
- Empty spaces when no tarot available

**Shop Between Levels:**
- Shop header with current money
- 4 available cards with type, name, price
- Purchase buttons (disabled if insufficient money)
- Reroll button with cost
- "Continue" button to exit shop

**Main Menu:**
- New Game
- Continue (disabled if no saved game)
- Help / Tutorial
- Exit

**Victory/Defeat Screens:**
- Result message
- Statistics summary
- Action buttons: New Game / Main Menu

### Section 18.1: Color Palette

**Theme Colors:**
- Primary Background: `#1a1a2e`
- Panel Background: `#16213e`
- Border Color: `#0f3460`
- Accent/Active: `#e94560`
- Primary Text: `#f1f1f1`
- Secondary Text: `#a8a8a8`

**Suit Colors:**
- Diamonds: `#ff6b6b`
- Hearts: `#ee5a6f`
- Spades: `#4ecdc4`
- Clubs: `#95e1d3`

**Indicator Colors:**
- Chips: `#f9ca24`
- Mult: `#6c5ce7`
- Money: `#00d2d3`

---

## 2. Class Diagram

**Note:** React components don't appear in the domain class diagram, but they interact with:
- **GameController** (main orchestrator)
- **GameState** (for reading state)
- **Shop** (when in shop mode)
- **Card**, **Joker**, **Tarot** (for display)

---

## 3. Use Case Diagram

**Player interactions through UI:**
- View Game Screen
- View Main Menu
- Select Cards from Hand
- Play Hand (via button click)
- Discard Cards (via button click)
- View Score Preview
- Enter Shop
- View Shop Items
- Purchase Card (via button click)
- Reroll Shop (via button click)
- Exit Shop (via button click)
- Use Tarot Card (via button click)
- Return to Menu

---

# SPECIFIC TASK

Implement the **React View Components** module consisting of 9 React components:

1. **App** (main app component) - `src/views/App.tsx`
2. **MainMenu** (menu component) - `src/views/components/menu/MainMenu.tsx`
3. **GameBoard** (main game container) - `src/views/components/game-board/GameBoard.tsx`
4. **Hand** (player hand display) - `src/views/components/hand/Hand.tsx`
5. **CardComponent** (individual card) - `src/views/components/card/CardComponent.tsx`
6. **JokerZone** (joker display area) - `src/views/components/joker-zone/JokerZone.tsx`
7. **TarotZone** (tarot display area) - `src/views/components/tarot-zone/TarotZone.tsx`
8. **ScoreDisplay** (score information panel) - `src/views/components/score-display/ScoreDisplay.tsx`
9. **ShopView** (shop interface) - `src/views/components/shop/ShopView.tsx`

---

## MODULE 1: App (React Component)

### Responsibilities:
- Main application entry point
- Initialize GameController
- Manage global app state (current screen)
- Route between MainMenu and GameBoard
- Handle controller callbacks
- Provide context for child components

### State:
- `controller: GameController` - The game controller instance
- `currentScreen: 'menu' | 'game' | 'shop'` - Current active screen
- `gameState: GameState | null` - Current game state (from controller)
- `isInShop: boolean` - Whether shop is open

### Props: None (root component)

### Methods/Handlers:

#### 1. **useEffect** (initialization)
- Initialize GameController with callbacks
- Set up state change listener
- Clean up on unmount

#### 2. **handleStartNewGame**()
- Call controller.startNewGame()
- Set currentScreen to 'game'

#### 3. **handleContinueGame**()
- Call controller.continueGame()
- If successful: set currentScreen to 'game'
- If failed: show error message

#### 4. **handleReturnToMenu**()
- Set currentScreen to 'menu'

#### 5. **handleStateChange**(state: GameState)
- Update gameState in component state
- Force re-render of child components

#### 6. **handleShopOpen**()
- Set isInShop to true
- Update UI to show shop

#### 7. **handleShopClose**()
- Set isInShop to false
- Update UI to show game board

#### 8. **handleVictory**()
- Show victory modal/screen
- Display statistics

#### 9. **handleDefeat**()
- Show defeat modal/screen
- Display failure information

### Render Logic:
```tsx
return (
  <div className="app">
    {currentScreen === 'menu' && (
      <MainMenu
        onStartNewGame={handleStartNewGame}
        onContinueGame={handleContinueGame}
        hasSavedGame={controller.gamePersistence.hasSavedGame()}
      />
    )}
    {currentScreen === 'game' && gameState && !isInShop && (
      <GameBoard
        controller={controller}
        gameState={gameState}
      />
    )}
    {currentScreen === 'game' && gameState && isInShop && (
      <ShopView
        controller={controller}
        shop={controller.getShop()}
        playerMoney={gameState.getMoney()}
      />
    )}
  </div>
);
```

---

## MODULE 2: MainMenu (React Component)

### Responsibilities:
- Display main menu options
- Enable/disable Continue based on saved game
- Trigger game start actions
- Show help/tutorial (optional)

### Props:
- `onStartNewGame: () => void` - Callback to start new game
- `onContinueGame: () => void` - Callback to continue saved game
- `hasSavedGame: boolean` - Whether saved game exists

### State: None (stateless functional component)

### Render Logic:
```tsx
return (
  <div className="main-menu">
    <h1 className="game-title">Mini Balatro</h1>
    <div className="menu-buttons">
      <button
        className="menu-button"
        onClick={onStartNewGame}
      >
        New Game
      </button>
      <button
        className="menu-button"
        onClick={onContinueGame}
        disabled={!hasSavedGame}
      >
        Continue
      </button>
      <button className="menu-button">
        Help
      </button>
    </div>
  </div>
);
```

---

## MODULE 3: GameBoard (React Component)

### Responsibilities:
- Main game screen container
- Display all game zones (hand, jokers, tarot, score)
- Show action buttons (Play Hand, Discard)
- Display level information and counters
- Coordinate child components

### Props:
- `controller: GameController` - The game controller
- `gameState: GameState` - Current game state

### State: None (uses props)

### Methods/Handlers:

#### 1. **handlePlayHand**()
- Call controller.playSelectedHand()
- Handle errors (show message if no cards selected)

#### 2. **handleDiscard**()
- Call controller.discardSelected()
- Handle errors (show message if no discards remaining)

### Render Logic:
```tsx
return (
  <div className="game-board">
    {/* Top Bar */}
    <div className="top-bar">
      <div className="level-info">
        Level: {gameState.getLevelNumber()} - {currentBlind.getType()}
      </div>
      <div className="money">Money: ${gameState.getMoney()}</div>
      <div className="round-info">Round: {gameState.getRoundNumber()}</div>
    </div>

    {/* Joker Zone */}
    <JokerZone
      jokers={gameState.getJokers()}
    />

    {/* Tarot Zone */}
    <TarotZone
      consumables={gameState.getConsumables()}
      onUseConsumable={(tarotId, targetId) => controller.useConsumable(tarotId, targetId)}
    />

    {/* Score Display */}
    <ScoreDisplay
      currentScore={gameState.getAccumulatedScore()}
      goalScore={gameState.getCurrentBlind().getScoreGoal()}
      previewScore={calculatePreviewScore()}
    />

    {/* Hand Display */}
    <Hand
      cards={gameState.getCurrentHand()}
      selectedCards={gameState.getSelectedCards()}
      onSelectCard={(cardId) => controller.selectCard(cardId)}
    />

    {/* Action Buttons */}
    <div className="action-buttons">
      <button
        className="action-button"
        onClick={handlePlayHand}
        disabled={selectedCards.length === 0 || handsRemaining === 0}
      >
        Play Hand
      </button>
      <button
        className="action-button"
        onClick={handleDiscard}
        disabled={selectedCards.length === 0 || discardsRemaining === 0}
      >
        Discard
      </button>
    </div>

    {/* Counters */}
    <div className="counters">
      <div className="counter">Hands: {handsRemaining}/3</div>
      <div className="counter">Discards: {discardsRemaining}/3</div>
    </div>
  </div>
);
```

---

## MODULE 4: Hand (React Component)

### Responsibilities:
- Display player's current hand (8 cards)
- Show selected cards with visual indicator
- Handle card selection clicks
- Display selection limit (5/5)

### Props:
- `cards: Card[]` - Cards in player's hand
- `selectedCards: Card[]` - Currently selected cards
- `onSelectCard: (cardId: string) => void` - Callback when card clicked

### State: None (stateless)

### Render Logic:
```tsx
return (
  <div className="hand">
    <div className="selection-indicator">
      Selected: {selectedCards.length}/5
    </div>
    <div className="cards-container">
      {cards.map((card) => (
        <CardComponent
          key={card.id}
          card={card}
          isSelected={selectedCards.some(c => c.id === card.id)}
          onClick={() => onSelectCard(card.id)}
        />
      ))}
    </div>
  </div>
);
```

---

## MODULE 5: CardComponent (React Component)

### Responsibilities:
- Display a single playing card
- Show card value and suit with proper colors
- Indicate selected state visually
- Display permanent bonuses (if any)
- Handle click events

### Props:
- `card: Card` - The card to display
- `isSelected: boolean` - Whether card is selected
- `onClick: () => void` - Click handler

### State: None (stateless)

### Helper Functions:

#### 1. **getSuitSymbol**(suit: Suit): string
- Returns suit symbol (♦, ♥, ♠, ♣)

#### 2. **getSuitColor**(suit: Suit): string
- Returns CSS color for suit

#### 3. **getValueDisplay**(value: CardValue): string
- Returns display string (A, K, Q, J, 10, ...)

### Render Logic:
```tsx
const suitSymbol = getSuitSymbol(card.suit);
const suitColor = getSuitColor(card.suit);
const valueDisplay = getValueDisplay(card.value);

return (
  <div
    className={`card ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
  >
    <div className="card-corner top-left" style={{ color: suitColor }}>
      <div className="card-value">{valueDisplay}</div>
      <div className="card-suit">{suitSymbol}</div>
    </div>
    <div className="card-center" style={{ color: suitColor }}>
      <span className="suit-symbol-large">{suitSymbol}</span>
    </div>
    <div className="card-corner bottom-right" style={{ color: suitColor }}>
      <div className="card-value">{valueDisplay}</div>
      <div className="card-suit">{suitSymbol}</div>
    </div>
    {(card.chipBonus > 0 || card.multBonus > 0) && (
      <div className="card-bonuses">
        {card.chipBonus > 0 && <span className="bonus-chips">+{card.chipBonus}</span>}
        {card.multBonus > 0 && <span className="bonus-mult">+{card.multBonus}</span>}
      </div>
    )}
  </div>
);
```

---

## MODULE 6: JokerZone (React Component)

### Responsibilities:
- Display active jokers (max 5)
- Show empty slots for unfilled positions
- Display joker names and effects
- Show activation order

### Props:
- `jokers: Joker[]` - Active joker cards

### State: None (stateless)

### Render Logic:
```tsx
const emptySlots = 5 - jokers.length;

return (
  <div className="joker-zone">
    <h3 className="zone-title">Jokers</h3>
    <div className="joker-slots">
      {jokers.map((joker, index) => (
        <div key={joker.id} className="joker-card">
          <div className="joker-order">{index + 1}</div>
          <div className="joker-name">{joker.name}</div>
          <div className="joker-description">{joker.description}</div>
        </div>
      ))}
      {[...Array(emptySlots)].map((_, index) => (
        <div key={`empty-${index}`} className="joker-slot-empty">
          Empty
        </div>
      ))}
    </div>
  </div>
);
```

---

## MODULE 7: TarotZone (React Component)

### Responsibilities:
- Display active tarot cards (max 2)
- Show empty slots for unfilled positions
- Display tarot names and effects
- Provide "Use" button for each tarot

### Props:
- `consumables: Tarot[]` - Active tarot cards
- `onUseConsumable: (tarotId: string, targetCardId?: string) => void` - Use handler

### State:
- `selectedTarot: string | null` - Currently selected tarot for use
- `awaitingTarget: boolean` - Whether waiting for target card selection

### Methods/Handlers:

#### 1. **handleUseTarot**(tarotId: string)
- If tarot requires target: enter target selection mode
- If instant tarot: call onUseConsumable immediately

### Render Logic:
```tsx
const emptySlots = 2 - consumables.length;

return (
  <div className="tarot-zone">
    <h3 className="zone-title">Tarot Cards</h3>
    <div className="tarot-slots">
      {consumables.map((tarot) => (
        <div key={tarot.name} className="tarot-card">
          <div className="tarot-name">{tarot.name}</div>
          <div className="tarot-description">{tarot.description}</div>
          <button
            className="use-button"
            onClick={() => handleUseTarot(tarot.name)}
          >
            Use
          </button>
        </div>
      ))}
      {[...Array(emptySlots)].map((_, index) => (
        <div key={`empty-${index}`} className="tarot-slot-empty">
          Empty
        </div>
      ))}
    </div>
  </div>
);
```

---

## MODULE 8: ScoreDisplay (React Component)

### Responsibilities:
- Display current accumulated score
- Display goal score
- Show progress bar (percentage to goal)
- Display score preview for selected cards
- Show chips and mult breakdown

### Props:
- `currentScore: number` - Accumulated score this blind
- `goalScore: number` - Score needed to pass blind
- `previewScore: { chips: number, mult: number, total: number } | null` - Preview for selected cards

### State: None (stateless)

### Helper Functions:

#### 1. **calculateProgress**(): number
- Returns percentage (currentScore / goalScore × 100)

### Render Logic:
```tsx
const progress = calculateProgress();

return (
  <div className="score-display">
    <div className="goal-section">
      <h3>Goal: {goalScore} pts</h3>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="score-text">
        Score: {currentScore} pts ({progress.toFixed(1)}%)
      </div>
    </div>

    {previewScore && (
      <div className="preview-section">
        <h4>Preview:</h4>
        <div className="preview-breakdown">
          <span className="chips">{previewScore.chips} chips</span>
          <span className="multiply">×</span>
          <span className="mult">{previewScore.mult} mult</span>
          <span className="equals">=</span>
          <span className="total">{previewScore.total} pts</span>
        </div>
      </div>
    )}
  </div>
);
```

---

## MODULE 9: ShopView (React Component)

### Responsibilities:
- Display shop interface
- Show 4 available items with details
- Display player's current money
- Handle item purchases
- Handle shop reroll
- Provide exit button to advance to next level

### Props:
- `controller: GameController` - The game controller
- `shop: Shop` - Current shop instance
- `playerMoney: number` - Player's current money

### State:
- `selectedItem: string | null` - Currently hovered/selected item for details
- `purchaseError: string | null` - Error message if purchase fails

### Methods/Handlers:

#### 1. **handlePurchase**(itemId: string)
- Call controller.purchaseShopItem(itemId)
- If false: show error (insufficient money or inventory full)
- If true: clear error

#### 2. **handleReroll**()
- Call controller.rerollShop()
- If false: show error (insufficient money)
- If true: clear error

#### 3. **handleExit**()
- Call controller.exitShop()
- Shop closes, advances to next level

### Helper Functions:

#### 1. **canAfford**(cost: number): boolean
- Returns playerMoney >= cost

#### 2. **getItemTypeColor**(type: ShopItemType): string
- Returns CSS color based on item type

### Render Logic:
```tsx
const availableItems = shop.getAvailableItems();
const rerollCost = shop.getRerollCost();

return (
  <div className="shop-view">
    <div className="shop-header">
      <h2>Shop</h2>
      <div className="shop-money">Money: ${playerMoney}</div>
    </div>

    <div className="shop-items">
      {availableItems.map((shopItem) => (
        <div
          key={shopItem.getId()}
          className={`shop-item ${!canAfford(shopItem.getCost()) ? 'unaffordable' : ''}`}
        >
          <div className="item-type" style={{ color: getItemTypeColor(shopItem.getType()) }}>
            {shopItem.getType()}
          </div>
          <div className="item-name">{shopItem.getItem().name}</div>
          <div className="item-description">{shopItem.getItem().description}</div>
          <div className="item-cost">${shopItem.getCost()}</div>
          <button
            className="purchase-button"
            onClick={() => handlePurchase(shopItem.getId())}
            disabled={!canAfford(shopItem.getCost())}
          >
            Purchase
          </button>
        </div>
      ))}
    </div>

    {purchaseError && (
      <div className="error-message">{purchaseError}</div>
    )}

    <div className="shop-actions">
      <button
        className="reroll-button"
        onClick={handleReroll}
        disabled={!canAfford(rerollCost)}
      >
        Reroll (${rerollCost})
      </button>
      <button
        className="continue-button"
        onClick={handleExit}
      >
        Continue to Next Level
      </button>
    </div>
  </div>
);
```

---

## Dependencies:

### Modules each component uses:
- **App** uses all child components and **GameController**
- **MainMenu** uses no external dependencies (presentational)
- **GameBoard** uses **Hand**, **JokerZone**, **TarotZone**, **ScoreDisplay**, **GameController**
- **Hand** uses **CardComponent**
- **CardComponent** uses **Card**, **CardValue**, **Suit**
- **JokerZone** uses **Joker**
- **TarotZone** uses **Tarot**
- **ScoreDisplay** is presentational (receives data via props)
- **ShopView** uses **GameController**, **Shop**, **ShopItem**

### React Hooks used:
- `useState` - For local component state
- `useEffect` - For initialization and cleanup
- `useCallback` - For memoized event handlers (optional optimization)
- `useMemo` - For expensive calculations (optional optimization)

### External libraries:
- **React** (v18.x)
- **React DOM** (v18.x)

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x + JSX/TSX
- **Code style:** Google TypeScript Style Guide + React best practices
  - Use functional components with hooks
  - Use PascalCase for component names
  - Use camelCase for props and variables
  - 2-space indentation
  - Single quotes for strings
  - Semicolons required
- **Maximum component length:** 200 lines
- **Component complexity:** Keep components focused (single responsibility)

## Mandatory best practices:
- **React best practices:**
  - Functional components with hooks (no class components)
  - Props validation via TypeScript interfaces
  - Proper key props for lists
  - Event handler naming: handleXxx
  - Avoid inline function definitions in render (use useCallback when needed)
  - Lift state up when shared between components
- **Performance considerations:**
  - Use React.memo for expensive components
  - Use useMemo/useCallback for optimization
  - Avoid unnecessary re-renders
- **Accessibility:**
  - Semantic HTML elements
  - ARIA attributes where needed
  - Keyboard navigation support
  - Focus management
- **Error handling:**
  - Handle null/undefined props gracefully
  - Display error messages for failed actions
  - Don't crash on invalid data

## Component Structure:
Each component file should follow this structure:
```tsx
// Imports
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

// Type definitions
interface ComponentNameProps {
  // Props interface
}

// Helper functions (outside component)

// Component definition
export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2,
}) => {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};
```

---

# DELIVERABLES

## 1. Complete source code of all 9 components:

### File: `src/views/App.tsx`
```tsx
/**
 * Main application component.
 * Manages global state and routing between screens.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/menu/MainMenu.tsx`
```tsx
/**
 * Main menu screen component.
 * Displays game start options.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/game-board/GameBoard.tsx`
```tsx
/**
 * Main game board container component.
 * Coordinates all game UI elements.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/hand/Hand.tsx`
```tsx
/**
 * Player hand display component.
 * Shows 8 cards with selection handling.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/card/CardComponent.tsx`
```tsx
/**
 * Individual playing card component.
 * Displays card value, suit, and bonuses.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/joker-zone/JokerZone.tsx`
```tsx
/**
 * Joker display area component.
 * Shows active jokers with effects.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/tarot-zone/TarotZone.tsx`
```tsx
/**
 * Tarot/consumables display component.
 * Shows active tarot cards with use buttons.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/score-display/ScoreDisplay.tsx`
```tsx
/**
 * Score information panel component.
 * Shows current score, goal, and preview.
 */
import React from 'react';
// ... implementation
```

### File: `src/views/components/shop/ShopView.tsx`
```tsx
/**
 * Shop interface component.
 * Displays purchasable items and shop actions.
 */
import React from 'react';
// ... implementation
```

### Barrel exports for each component directory:
```tsx
// src/views/components/menu/index.ts
export * from './MainMenu';

// ... similar for all component directories
```

### Main views barrel export:
```tsx
// src/views/index.ts
export * from './App';
export * from './components';
```

## 2. Inline documentation:
- JSDoc comments on all component interfaces
- Prop descriptions with types
- Complex logic explanations
- Event handler documentation

## 3. New dependencies:
- **React** (v18.x): `npm install react react-dom`
- **@types/react** (v18.x): `npm install --save-dev @types/react @types/react-dom`

## 4. Component-specific notes:

**App Component:**
- Central state management
- Controller initialization
- Screen routing logic

**GameBoard Component:**
- Main game orchestration
- Child component coordination
- Action button management

**CardComponent:**
- Reusable card display
- Suit color mapping
- Bonus display logic

**ShopView Component:**
- Purchase validation
- Error messaging
- Affordability checking

## 5. Edge cases considered:
- No saved game (Continue button disabled)
- Empty joker/tarot slots (show placeholders)
- No cards selected (Play/Discard disabled)
- 0 hands/discards remaining (buttons disabled)
- Insufficient money in shop (purchase buttons disabled)
- Shop item purchase with full inventory (error message)
- Tarot requiring target (enter selection mode)
- Card bonuses displayed when present
- Progress bar capped at 100%
- Score preview only shown when cards selected

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```tsx
// ============================================
// FILE: src/views/App.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/menu/MainMenu.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/game-board/GameBoard.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/hand/Hand.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/card/CardComponent.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/joker-zone/JokerZone.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/tarot-zone/TarotZone.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/score-display/ScoreDisplay.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

```tsx
// ============================================
// FILE: src/views/components/shop/ShopView.tsx
// ============================================

[Complete implementation with JSDoc comments]
```

---

**Design decisions made:**
- [Decision 1 and its justification]
- [Decision 2 and its justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
