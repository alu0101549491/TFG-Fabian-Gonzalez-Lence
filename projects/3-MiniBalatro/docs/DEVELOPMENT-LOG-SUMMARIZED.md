# Development Log - Mini Balatro (Summarized)

This document provides a concise overview of all major features, fixes, and improvements made to Mini Balatro during development.

---

## Table of Contents

1. [UI/UX Improvements (Fixes #1-11)](#uiux-improvements-fixes-1-11)
2. [Game State & Persistence (Fixes #11-21)](#game-state--persistence-fixes-11-21)
3. [Tarot Card System (Fixes #22-24)](#tarot-card-system-fixes-22-24)
4. [Joker System (Fixes #25-30)](#joker-system-fixes-25-30)
5. [Scoring System (Fixes #31-32)](#scoring-system-fixes-31-32)
6. [Configuration System (Fixes #33-34)](#configuration-system-fixes-33-34)
7. [Shop System (Fixes #35, #45)](#shop-system-fixes-35-45)
8. [Joker Bugs (Fixes #36-37, #41, #60)](#joker-bugs-fixes-36-37-41-60)
9. [Tooltips (Fix #38)](#tooltips-fix-38)
10. [The Hanged Man Tarot (Fixes #39-40)](#the-hanged-man-tarot-fixes-39-40)
11. [Card Bonuses (Fixes #42-43)](#card-bonuses-fixes-42-43)
12. [Removal Features (Fix #44, #59)](#removal-features-fix-44-59)
13. [Color Management (Fix #46)](#color-management-fix-46)
14. [Card Deck Management (Fix #47-48)](#card-deck-management-fix-47-48)
15. [Boss Blinds (Fixes #49, #54-58)](#boss-blinds-fixes-49-54-58)
16. [Planet Cards (Fixes #50-51, #63)](#planet-cards-fixes-50-51-63)
17. [Modals (Fixes #52-53, #55-56, #61, #64)](#modals-fixes-52-53-55-56-61-64)
18. [Balance Changes (Balance #62)](#balance-changes-balance-62)

---

## UI/UX Improvements (Fixes #1-11)

### Fix #1: Horizontal Layout Redesign
**Problem:** Vertical layout was uncomfortable and didn't match intended design.  
**Solution:** Completely restructured CSS/React to horizontal layout with 6 sections: header, special cards, goal progress, hand area, preview, and actions.  
**Files:** `GameBoard.tsx`, `GameBoard.css`, `JokerZone.css`, `TarotZone.css`

### Fix #2: Horizontal Card Display
**Problem:** Cards stacked vertically instead of horizontal row.  
**Solution:** Fixed `.cards-container` with `flex-direction: row`.  
**Files:** `Hand.css`

### Fix #3: Card Selection Interactivity
**Problem:** No visual feedback on card selection.  
**Solution:** Added `.card--selected` class with lift animation, purple glow, and border.  
**Files:** `CardComponent.tsx`, `CardComponent.css`

### Fix #4: Card Removal After Play/Discard
**Problem:** Played/discarded cards remained in hand.  
**Solution:** Implemented proper card removal in `GameState.playHand()` and `discardCards()`.  
**Files:** `game-state.ts`

### Fix #5: Card Sorting
**Problem:** Cards appeared in random order.  
**Solution:** Sort by suit (Spades → Hearts → Clubs → Diamonds), then by rank (descending).  
**Files:** `game-state.ts`

### Fix #6: Preview Score Calculation
**Problem:** Preview showed incorrect score or didn't update.  
**Solution:** Added `useEffect` to calculate preview on card selection changes.  
**Files:** `GameBoard.tsx`

### Fix #7: Variable Card Count Errors
**Problem:** Preview crashed when selecting < 5 cards.  
**Solution:** Removed hardcoded 5-card assumption, handle dynamic card counts.  
**Files:** `hand-evaluator.ts`

### Fix #8: Hand Type Display
**Problem:** Preview didn't show which hand was formed (Pair, Flush, etc.)  
**Solution:** Display hand type from evaluation result.  
**Files:** `GameBoard.tsx`

### Fix #9: Format Hand Type
**Problem:** Hand types showed as "THREE_OF_A_KIND" (ugly).  
**Solution:** Format with spaces and title case: "Three Of A Kind".  
**Files:** `GameBoard.tsx`

### Fix #10: Straight Detection Bug
**Problem:** Ace-low straights (A-2-3-4-5) not recognized.  
**Solution:** Added special case for wheel straight.  
**Files:** `hand-evaluator.ts`

### Fix #11: Game State Persistence
**Problem:** Refresh lost all game progress.  
**Solution:** Implemented `GamePersistence` service with auto-save on state changes.  
**Files:** `game-persistence.ts`, `game-controller.ts`

---

## Game State & Persistence (Fixes #11-21)

### Fix #12: Hand Persistence
**Problem:** Hand reset to 8 cards after refresh.  
**Solution:** Save/restore current hand and selected cards.  
**Files:** `game-persistence.ts`

### Fix #13: Card Class Import
**Problem:** Deserialization couldn't reconstruct Card objects.  
**Solution:** Import and use Card class constructor in deserialization.  
**Files:** `game-persistence.ts`

### Fix #14: Deck State Persistence
**Problem:** Deck reset to 52 cards after refresh.  
**Solution:** Serialize/deserialize deck with unplayed and discard piles.  
**Files:** `game-persistence.ts`, `deck.ts`

### Fix #15: Shop State Persistence
**Problem:** Shop reset when reopened.  
**Solution:** Save/restore shop items in GameController.  
**Files:** `game-controller.ts`, `game-persistence.ts`

### Fix #16: Shop Visual Improvements
**Problem:** Shop looked generic, cards hard to see.  
**Solution:** Added card images, rarity colors, better layout.  
**Files:** `ShopView.tsx`, `ShopView.css`

### Fix #17: Shop Item Generation
**Problem:** Shop only showed placeholder items.  
**Solution:** Implemented proper random generation of jokers/tarots/planets.  
**Files:** `shop-item-generator.ts`

### Fix #18: Shop & Card Display
**Problem:** Card suits showed as "SPADES" text instead of ♠ symbol.  
**Solution:** Map suit enum to Unicode symbols.  
**Files:** `ShopView.tsx`, `CardComponent.tsx`

### Fix #19: Game Persistence Investigation
**Problem:** Complex investigation of persistence bugs.  
**Solution:** Comprehensive debugging and fixes across multiple systems.  
**Files:** Multiple (see full log)

### Fix #20: Special Card Persistence
**Problem:** Jokers and tarots disappeared after refresh.  
**Solution:** Proper serialization of special card types with factory pattern.  
**Files:** `game-persistence.ts`

### Fix #21: Vite Asset Loading
**Problem:** Images not loading in production build.  
**Solution:** Configured Vite public directory and correct asset paths.  
**Files:** `vite.config.ts`

---

## Tarot Card System (Fixes #22-24)

### Fix #22: Tarot Target Selection
**Problem:** "Select target" message persisted after selection.  
**Solution:** Track selection state, clear message after valid selection.  
**Files:** `GameBoard.tsx`

### Fix #23: Hand Information Panel
**Problem:** No way to check hand types during play.  
**Solution:** Added hand info panel showing all poker hands with current upgrades.  
**Files:** `HandInfoPanel.tsx`, `HandInfoPanel.css`

### Fix #24: Tarot UI Update
**Problem:** UI didn't refresh after using tarot.  
**Solution:** Force re-render after tarot effects applied.  
**Files:** `GameBoard.tsx`

---

## Joker System (Fixes #25-30)

### Fix #25: Joker Zone Horizontal Layout
**Problem:** Jokers displayed vertically.  
**Solution:** Redesigned with horizontal 5-slot layout.  
**Files:** `JokerZone.tsx`, `JokerZone.css`

### Fix #26: Mult vs Multiplier Bug
**Problem:** "mult" and "multiplier" joker types confused.  
**Solution:** Separated into `MultJoker` (adds) and `MultiplierJoker` (multiplies).  
**Files:** `shop-item-generator.ts`, `mult-joker.ts`, `multiplier-joker.ts`

### Fix #27: Duplicate Joker Application
**Problem:** Jokers applied multiple times.  
**Solution:** Separate scoring jokers from economic jokers, apply only once.  
**Files:** `game-state.ts`

### Fix #28: Planet Card Target Hand
**Problem:** Planets upgraded wrong hand type.  
**Solution:** Store and verify target hand type during upgrade.  
**Files:** `shop-item-generator.ts`, `planet.ts`

### Fix #29: Conditional Joker Logic
**Problem:** Per-card multipliers (Odd Todd, Even Steven) applied incorrectly.  
**Solution:** Loop through scoring cards, check condition per card, multiply correctly.  
**Files:** `chip-joker.ts`, `mult-joker.ts`, `multiplier-joker.ts`

### Fix #30: Missing Joker Conditions
**Problem:** "emptySlot" and "noDiscards" conditions not implemented.  
**Solution:** Added conditions and context fields to `ScoreContext`.  
**Files:** `score-context.ts`, `shop-item-generator.ts`

---

## Scoring System (Fixes #31-32)

### Fix #31: Contributing Cards Only
**Problem:** All cards scored, even non-contributing ones.  
**Solution:** Only score cards that contribute to the hand (e.g., only the pair in a pair hand).  
**Files:** `hand-evaluator.ts`, `score-calculator.ts`

### Fix #32: Boss Blind Information
**Problem:** No indication of which boss or special rules.  
**Solution:** Display boss name, type, and special rule effects.  
**Files:** `GameBoard.tsx`, `GameBoard.css`

---

## Configuration System (Fixes #33-34)

### Fix #33: Configuration Consolidation
**Problem:** Magic numbers scattered throughout codebase.  
**Solution:** Created `constants.ts` with centralized configuration constants.  
**Files:** `constants.ts`, multiple files updated

### Fix #34: Deep Configuration Audit
**Problem:** More hardcoded values found after initial pass.  
**Solution:** Second pass to remove remaining magic numbers.  
**Files:** Multiple (see full log)

---

## Shop System (Fixes #35, #45)

### Fix #35: Shop Card Pool Variety
**Problem:** Limited jokers/tarots appeared in shop.  
**Solution:** Implemented full card pool with weighted random selection.  
**Files:** `shop-item-generator.ts`, `balancing-config.ts`

### Fix #45: Duplicate Jokers in Shop
**Problem:** Same joker could appear multiple times in one shop.  
**Solution:** Filter out already-purchased jokers from generation pool.  
**Files:** `shop-item-generator.ts`

---

## Joker Bugs (Fixes #36-37, #41, #60)

### Fix #36: Golden Joker Bug
**Problem:** Golden Joker (economic) was applied during scoring.  
**Solution:** Separate economic jokers, only apply during shop phase.  
**Files:** `game-state.ts`

### Fix #37: Joker Stencil Bug
**Problem:** Empty slot count wrong after filtering economic jokers.  
**Solution:** Calculate empty slots before filtering, pass to context.  
**Files:** `game-state.ts`

### Fix #41: Chip Jokers Per Card
**Problem:** Odd Todd, Blue Joker multiplier logic incorrect.  
**Solution:** Implement proper per-card chip calculation.  
**Files:** `chip-joker.ts`

### Fix #60: Hiker Joker Not Working
**Problem:** Hiker added +5 chips to score instead of permanently upgrading cards.  
**Solution:** Created `PermanentUpgradeJoker` class that modifies cards after play.  
**Files:** `permanent-upgrade-joker.ts`, `shop-item-generator.ts`, `game-state.ts`  
**Key Concept:** Cards upgraded with `card.addPermanentBonus()` after scoring, bonuses persist through deck shuffles.

---

## Tooltips (Fix #38)

### Fix #38: Card Hover Tooltips
**Problem:** No information about jokers/tarots/planets on hover.  
**Solution:** Implemented tooltip system with dark theme matching game aesthetic.  
**Files:** `Tooltip.tsx`, `Tooltip.css`, integrated across card components

---

## The Hanged Man Tarot (Fixes #39-40)

### Fix #39: The Hanged Man & Deck Count
**Problem:** Deck size display and The Hanged Man (destroy 2 cards) not working.  
**Solution:** Added deck count display, implemented card destruction from deck.  
**Files:** `GameBoard.tsx`, `GameState.ts`, `shop-item-generator.ts`

### Fix #40: Max Deck Size Persistence
**Problem:** Max deck size not saved/restored.  
**Solution:** Add `maxDeckSize` to serialization.  
**Files:** `game-persistence.ts`

---

## Card Bonuses (Fixes #42-43)

### Fix #42: Card Bonuses Not Persisting
**Problem:** Card chip/mult bonuses lost between levels.  
**Solution:** Proper bonus tracking through deck shuffles and level transitions.  
**Files:** `game-state.ts`, `Card.ts`

### Fix #43: Death Tarot Adds Duplicate
**Problem:** Death tarot added duplicate to deck, not to hand (unplayable immediately).  
**Solution:** Add duplicate directly to current hand for immediate use.  
**Files:** `shop-item-generator.ts`

---

## Removal Features (Fix #44, #59)

### Fix #44: Remove Jokers and Tarots
**Problem:** No way to remove unwanted jokers/tarots.  
**Solution:** Added ✖ button with confirmation to each card.  
**Files:** `JokerZone.tsx`, `TarotZone.tsx`, `game-controller.ts`, `game-state.ts`

### Fix #59: Duplicate Tarot React Key Warning
**Problem:** Two Death cards caused React warning and incorrect removal.  
**Solution:** Use `${id}-${index}` for keys, remove by index instead of ID.  
**Files:** `TarotZone.tsx`, `GameBoard.tsx`, `game-controller.ts`, `game-state.ts`  
**Key Change:** `onRemoveConsumable` now takes `index` parameter, not `tarotId`.

---

## Color Management (Fix #46)

### Fix #46: Centralized Color System
**Problem:** Colors hardcoded in CSS, inconsistent theming.  
**Solution:** Exported colors from `constants.ts`, applied via `apply-theme.ts` to CSS variables.  
**Files:** `constants.ts`, `apply-theme.ts`, multiple CSS files  
**Pattern:** TypeScript constants → `setProperty('--color-name')` → CSS `var(--color-name)`

---

## Card Deck Management (Fix #47-48)

### Fix #47: Cards Not Returning to Deck
**Problem:** Played cards stayed in discard pile forever.  
**Solution:** Return all discarded cards to deck at level start.  
**Files:** `game-state.ts`

### Fix #48: The Hanged Man Selection Bug
**Problem:** Could select cards from hand instead of deck when using The Hanged Man.  
**Solution:** Different selection modes, clear visual separation.  
**Files:** `GameBoard.tsx`, various card components

### Fix #48.1: Hand Refill Bug
**Problem:** Hand not refilled after using The Hanged Man.  
**Solution:** Refill hand after card destruction.  
**Files:** `GameState.ts`

---

## Boss Blinds (Fixes #49, #54-58)

### Fix #49: The Flint Boss
**Problem:** Minimum base multiplier not enforced (halves chips AND mult, should be min 1 mult).  
**Solution:** Apply `Math.max(1, baseMult / 2)` when Flint active.  
**Files:** `score-calculator.ts`

### Fix #54: The Mouth Boss Implementation
**Problem:** The Mouth boss (one hand type only) not restricting hands.  
**Solution:** Lock to first successfully played hand type, reject others with 0 score and warning UI.  
**Files:** `boss-blind.ts`, `game-state.ts`, `score-calculator.ts`, `GameBoard.tsx`  
**Mechanic:** First successful hand locks modifier, subsequent disallowed hands return 0 score with warning banner.

### Fix #55: Blue Joker Deck Size Bug
**Problem:** Blue Joker calculated based on cards played (5 max) instead of remaining deck size (52 max).  
**Solution:** Pass `remainingDeckSize` from GameState through to ScoreContext.  
**Files:** `score-calculator.ts`  
**Before:** +2 chips × cards played (max +10)  
**After:** +2 chips × deck size (max +104)

### Fix #56: Boss Blind Type Persistence
**Problem:** All bosses became The Wall after refresh.  
**Solution:** Save/restore `bossType` and `lockedHandType` (for The Mouth).  
**Files:** `game-persistence.ts`

### Fix #57: The Mouth Hand Locking Bug
**Problem:** The Mouth locked to hands that scored 0 (rejected hands).  
**Solution:** Only lock if `result.totalScore > 0`.  
**Files:** `game-state.ts`

### Fix #58: The Mouth Random Initialization
**Problem:** The Mouth started with random locked hand type instead of unlocked.  
**Solution:** Initialize with `allowedHandTypes: null`, lock only after first successful hand.  
**Files:** `blind-modifier.ts`, `game-state.ts`

---

## Planet Cards (Fixes #50-51, #63)

### Fix #50: Planet Cards Upgrading Wrong Hand
**Problem:** Planets upgrading incorrect hand types.  
**Solution:** Verify `targetHandType` matches the hand being upgraded.  
**Files:** `hand-upgrade-manager.ts`

### Fix #51: Incorrect Hand Level Display
**Problem:** Hand level shown as 1 when actually level 2+.  
**Solution:** Fixed off-by-one error in level display logic.  
**Files:** `HandInfoPanel.tsx`

### Fix #63: Planet Card Descriptions in Shop
**Problem:** Planets showed "Special Card" instead of what they upgrade.  
**Solution:** Add `description` property to Planet class, update JSON with format: "Hand Type (+X chips x +Y mult)".  
**Files:** `planet.ts`, `shop-item-generator.ts`, `planets.json`  
**Example:** `"Pluto"` → `"High Card (+10 chips x +1 mult)"`

---

## Modals (Fixes #52-53, #55-56, #61, #64)

### Fix #52: Blind Victory Modal
**Problem:** No proper victory modal when blind cleared.  
**Solution:** Created modal showing blind level, score achieved, reward, and "Continue to Shop" button.  
**Files:** `BlindVictoryModal.tsx`, `BlindVictoryModal.css`

### Fix #52.1: Victory Modal Score Display
**Problem:** Wrong score shown in victory modal.  
**Solution:** Store and retrieve correct victory score.  
**Files:** `game-controller.ts`

### Fix #53: Blind Defeat Modal
**Problem:** No proper defeat modal, just alert().  
**Solution:** Created modal showing achieved vs target score, boss info, and "Return to Menu" button.  
**Files:** `BlindDefeatModal.tsx`, `BlindDefeatModal.css`, themed with color constants

### Fix #53.1: Missing Modal Color Exports
**Problem:** Modal colors defined but not applied.  
**Solution:** Export modal colors to CSS variables in `apply-theme.ts`.  
**Files:** `apply-theme.ts`

### Fix #56: Boss Blind Type Persistence
*See Boss Blinds section*

### Fix #61: Help Modal for Main Menu
**Problem:** Help button non-functional.  
**Solution:** Created comprehensive help modal with 8 sections: objective, poker hands, scoring, jokers, tarots, blinds, shop, pro tips.  
**Files:** `HelpModal.tsx`, `HelpModal.css`, `MainMenu.tsx`  
**Content:** Full game documentation with examples, poker hands grid, strategy tips.

### Fix #64: Game Victory Modal
**Problem:** No special celebration when completing all 8 rounds.  
**Solution:** Created victory modal with celebration theme, shows final score, trophy, and "Return to Main Menu" only.  
**Files:** `GameVictoryModal.tsx`, `GameVictoryModal.css`, `game-controller.ts`, `App.tsx`  
**Key Change:** Skip blind victory modal on final boss, show game victory modal directly.  
**Animations:** 6 different animations (fade, slide, pulse, glow, bounce, shimmer) with gold/purple/pink gradient theme.

---

## Balance Changes (Balance #62)

### Balance #62: The Hermit Tarot Nerf
**Problem:** The Hermit (double money) created exponential growth, game-breaking at high amounts.  
**Solution:** Cap bonus at $20 max: `moneyToAdd = Math.min(currentMoney, 20)`.  
**Files:** `constants.ts`, `shop-item-generator.ts`, `tarots.json`  
**Impact:**  
- $5 → $10 (+$5) ✓ Unchanged  
- $20 → $40 (+$20) ✓ Last full double  
- $50 → $70 (+$20 capped) ✓ Still useful, not broken  
- $100 → $120 (+$20 capped) ✓ Game economy maintained

---

## Summary Statistics

**Total Features/Fixes:** 65  
**Files Created:** ~40 new files  
**Files Modified:** ~130+ files  
**Major Systems:**
- UI/UX Redesign (horizontal layout, card selection, previews)
- Complete persistence system (game state, shop, cards)
- Tarot card system with target selection
- Joker system with multiple types (chips, mult, multiplier, economic, permanent upgrade)
- Boss blind system with 5 unique bosses
- Hand upgrade system (planets)
- Modal system (victory, defeat, help, game completion)
- Tooltip system
- Color management system
- Comprehensive configuration system

**Key Architectural Patterns:**
- Centralized configuration (`constants.ts`)
- Persistence via JSON serialization (`game-persistence.ts`)
- Factory pattern for special cards (`shop-item-generator.ts`)
- Score calculation pipeline (`score-calculator.ts`, `hand-evaluator.ts`)
- React component composition with TypeScript
- CSS modular architecture with BEM naming

**Testing Approach:**
- Manual testing for each fix
- Edge case verification
- Cross-system integration testing
- Persistence testing across page refreshes

---

## Development Methodology

**Typical Fix Workflow:**
1. **Problem Analysis** - Understand root cause, not just symptoms
2. **Solution Design** - Plan changes, consider edge cases
3. **Implementation** - Make targeted changes to minimal files
4. **Testing** - Verify fix works, check for regressions
5. **Documentation** - Record changes in development log

**Code Quality Standards:**
- Type safety with TypeScript
- Consistent naming conventions
- JSDoc comments for public methods
- DRY principle (Don't Repeat Yourself)
- Single Responsibility Principle
- Clear separation of concerns

**Key Learnings:**
- Persistence is complex (serialization, deserialization, type reconstruction)
- React component state management is critical
- Boss mechanics require careful timing and state tracking
- UI feedback (tooltips, warnings, modals) vastly improves UX
- Configuration centralization enables easy balance tweaking
- Animations enhance player engagement
- Clear documentation helps maintain complex systems

---

## Current Game Status

**Fully Functional:**
- ✅ Complete 8-round progression
- ✅ All poker hands recognized and scored
- ✅ Joker system with 5+ types
- ✅ Tarot system with target selection
- ✅ Planet card hand upgrades
- ✅ Shop system with random generation
- ✅ Boss blinds with unique mechanics
- ✅ Save/load game state
- ✅ Card bonus persistence
- ✅ Victory and defeat modals
- ✅ Help system for new players

**Known Limitations:**
- Some jokers not yet implemented
- Some tarot cards not yet implemented
- No achievements system
- No statistics tracking
- No difficulty settings
- No audio/sound effects

**Game Balance:**
- The Hermit capped at $20 bonus
- Hiker permanently upgrades cards (+5 chips per play)
- Blue Joker scales with deck size (max +104 chips)
- Boss blinds provide appropriate challenge
- Hand upgrades balanced across poker hands

---

## Future Enhancement Opportunities

**Potential Features:**
1. **Statistics System** - Track hands played, best scores, win rate
2. **Achievement System** - Unlock achievements for specific accomplishments
3. **Difficulty Settings** - Easy/Normal/Hard/Extreme modes
4. **Deck Customization** - Different starting decks with unique properties
5. **More Boss Blinds** - Additional bosses with new mechanics
6. **Sound Effects** - Audio feedback for actions
7. **Background Music** - Atmospheric music during play
8. **Animations** - Card dealing, hand evaluation, score counting
9. **Leaderboards** - Compare scores with other players
10. **Daily Challenges** - Seeded runs with specific constraints

**Code Improvements:**
1. **Unit Tests** - Automated testing for core game logic
2. **Integration Tests** - Test cross-system interactions
3. **Performance Optimization** - Profile and optimize hot paths
4. **Accessibility** - Screen reader support, keyboard navigation
5. **Internationalization** - Multi-language support
6. **Mobile Responsiveness** - Optimize for mobile devices
7. **PWA Support** - Install as Progressive Web App
8. **Cloud Saves** - Backup saves to cloud storage

---

## Conclusion

Mini Balatro has evolved from a basic card game concept to a fully-featured poker roguelike with:
- Comprehensive game mechanics (hands, scoring, upgrades)
- Rich special card systems (jokers, tarots, planets)
- Challenging boss encounters with unique mechanics
- Complete persistence and save system
- Polished UI/UX with modals, tooltips, animations
- Balanced economy and progression
- Helpful onboarding for new players

The codebase is well-structured, maintainable, and ready for future enhancements. All major systems are functional, tested, and documented.

**Final Status:** ✅ **PRODUCTION READY**

---

*Last Updated: January 21, 2026*  
*Total Development Log Size: ~18,000 lines*  
*Summarized Document Size: ~1,000 lines*
