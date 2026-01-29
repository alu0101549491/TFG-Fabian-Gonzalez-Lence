# Debug Commands for Mini Balatro

This document lists useful debug commands for testing the game during development.

## Prerequisites

These commands only work in **development mode** (when running with `npm run dev`).

## Available Commands

### 1. Force a Specific Boss Blind

You can force the current blind to be any boss you want for testing purposes.

**Usage:**
```javascript
// In the browser console:
gameState.debugForceBoss('THE_MOUTH')
```

**Available Boss Types:**
- `'THE_WALL'` - No hand upgrades allowed
- `'THE_WHEEL'` - 1/4 chance of 0 score per hand
- `'THE_WATER'` - Starts with 1 discard
- `'THE_NEEDLE'` - Play only 1 hand
- `'THE_FLINT'` - Chips and mult are halved
- `'THE_MOUTH'` - Only one hand type allowed

**Example:**
```javascript
// Force The Mouth boss to test hand locking mechanics
gameState.debugForceBoss('THE_MOUTH')

// Force The Wall to test without upgrades
gameState.debugForceBoss('THE_WALL')
```

**Notes:**
- This resets the current blind to the specified boss type
- Score is reset to 0
- Hands and discards are reset to maximum
- The blind goal is recalculated based on current level

### 2. Access Game Controller

The game controller is exposed globally for debugging:

```javascript
// Access the controller
gameController

// Example: Check controller methods
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(gameController)))
```

### 3. Access Game State

The game state is exposed globally:

```javascript
// View current game state
gameState

// Check current blind info
gameState.getCurrentBlind()

// Check boss type (if it's a boss blind)
gameState.getCurrentBlind().getBossType()
```

## Tips for Testing The Mouth Boss

To specifically test The Mouth's hand locking mechanics:

1. Start or continue a game
2. Open browser console (F12)
3. Force The Mouth: `gameState.debugForceBoss('THE_MOUTH')`
4. Test scenarios:
   - Try playing a hand that doesn't score (should not lock)
   - Play a successful hand (should lock to that type)
   - Try playing a different hand type (should show warning and score 0)

## Refreshing After Debug Commands

After using debug commands, you may need to:
- Click on a button in the UI to trigger a re-render
- Or make any game action to see the changes reflected

---

**Remember:** These commands are only for development and will not work in production builds.
