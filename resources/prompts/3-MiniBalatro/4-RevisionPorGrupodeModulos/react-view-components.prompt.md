# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** React View Components Layer - User Interface

**Components under review:**

### Main Application:
- `App` (component) - `src/views/App.tsx`
- `App.css` - Styling

### Menu Components:
- `MainMenu` (component) - `src/views/components/menu/MainMenu.tsx`
- `MainMenu.css` - Styling

### Game Board Components:
- `GameBoard` (component) - `src/views/components/game-board/GameBoard.tsx`
- `GameBoard.css` - Styling

### Hand Components:
- `Hand` (component) - `src/views/components/hand/Hand.tsx`
- `Hand.css` - Styling
- `HandInfoPanel` (component) - `src/views/components/hand-info-panel/HandInfoPanel.tsx` **(NEW)**
- `HandInfoPanel.css` - Styling

### Card Component:
- `CardComponent` (component) - `src/views/components/card/CardComponent.tsx`
- `CardComponent.css` - Styling

### Special Card Zones:
- `JokerZone` (component) - `src/views/components/joker-zone/JokerZone.tsx`
- `JokerZone.css` - Styling
- `TarotZone` (component) - `src/views/components/tarot-zone/TarotZone.tsx`
- `TarotZone.css` - Styling

### Score Display:
- `ScoreDisplay` (component) - `src/views/components/score-display/ScoreDisplay.tsx`
- `ScoreDisplay.css` - Styling

### Shop:
- `ShopView` (component) - `src/views/components/shop/ShopView.tsx`
- `ShopView.css` - Styling

### Modals **(NEW)**:
- `BlindDefeatModal` - `src/views/components/modals/BlindDefeatModal.tsx`
- `BlindVictoryModal` - `src/views/components/modals/BlindVictoryModal.tsx`
- `GameVictoryModal` - `src/views/components/modals/GameVictoryModal.tsx`
- `HelpModal` - `src/views/components/modals/HelpModal.tsx`

### Tooltips **(NEW)**:
- `Tooltip` - `src/views/components/tooltip/Tooltip.tsx`
- `CardTooltipContent` - `src/views/components/tooltip/CardTooltipContent.tsx`
- `JokerTooltipContent` - `src/views/components/tooltip/JokerTooltipContent.tsx`
- `TarotTooltipContent` - `src/views/components/tooltip/TarotTooltipContent.tsx`

**Component objective:** 
Implement the complete React user interface that displays game state, captures player input, and provides visual feedback. Components must be responsive, accessible, follow React best practices, use proper state management, and integrate seamlessly with GameController callbacks.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR30:** Score preview (showing chips, mult, total before playing hand)
- Acceptance: Preview updates in real-time as cards selected
- Acceptance: Formula displayed (chips × mult = total)

**FR31:** Visual hand representation
- Acceptance: 8-card hand displayed clearly
- Acceptance: Selected cards visually distinct

**FR32:** Joker display zone
- Acceptance: Max 5 jokers visible
- Acceptance: Shows name, description, effect

**FR33:** Tarot display zone
- Acceptance: Max 2 tarots visible
- Acceptance: Shows name, description
- Acceptance: Use button available

**FR34:** Boss introduction screen
- Acceptance: Shows boss name and effect
- Acceptance: Dismissible to continue

**FR35:** Victory screen
- Acceptance: Shown after 24 levels complete
- Acceptance: Shows stats and congratulations

**FR36:** Defeat screen
- Acceptance: Shown when game over
- Acceptance: Option to restart

**Section 12: User Interface**

**Color Palette:**
```
Theme Colors:
- BG_PRIMARY: #1a1a2e (dark navy)
- BG_PANEL: #16213e (slightly lighter navy)
- BORDER: #0f3460 (blue border)
- ACCENT: #e94560 (red accent)
- TEXT_PRIMARY: #f1f1f1 (off-white)
- TEXT_SECONDARY: #a8a8a8 (gray)

Suit Colors:
- DIAMONDS: #ff6b6b (red)
- HEARTS: #ee5a6f (pink-red)
- SPADES: #4ecdc4 (teal)
- CLUBS: #95e1d3 (light teal)

Indicator Colors:
- CHIPS: #f9ca24 (yellow)
- MULT: #6c5ce7 (purple)
- MONEY: #00d2d3 (cyan)
```

**Layout Requirements:**
- Top bar: Level info, money display, round number
- Center: Joker zone, Tarot zone, Score display
- Main area: 8-card hand
- Bottom: Action buttons (Play Hand, Discard)
- Counters: Hands remaining, Discards remaining

## Key Acceptance Criteria:

### App Component:
- [ ] Manages routing between screens (menu/game/shop)
- [ ] Instantiates GameController with callbacks
- [ ] Holds game state in React state
- [ ] Updates UI on state changes
- [ ] Handles screen transitions
- [ ] No prop drilling (proper state management)

### MainMenu Component:
- [ ] Shows game title
- [ ] "New Game" button
- [ ] "Continue" button (disabled if no save)
- [ ] "Help" button (opens help modal)
- [ ] Responsive layout
- [ ] Proper button states

### GameBoard Component:
- [ ] Displays all game elements
- [ ] Top bar with level/money/round info
- [ ] JokerZone in visible position
- [ ] TarotZone in visible position
- [ ] ScoreDisplay prominent
- [ ] Hand component centered
- [ ] Action buttons accessible
- [ ] Counters visible
- [ ] Responsive to window size

### Hand Component:
- [ ] Displays 8 cards in row/grid
- [ ] Shows selection indicator (X/5 selected)
- [ ] Cards are clickable
- [ ] Selection state visually clear
- [ ] Handles card selection via callback
- [ ] Responsive card sizing

### HandInfoPanel Component **(NEW)**:
- [ ] Shows current poker hand type detected
- [ ] Shows base chips and mult for hand
- [ ] Updates in real-time with selection
- [ ] Clear visual hierarchy
- [ ] Positioned near hand or score area

### CardComponent:
- [ ] Displays card value and suit
- [ ] Shows suit symbol (♦♥♠♣)
- [ ] Uses correct suit color
- [ ] Shows permanent bonuses if present (+chips, +mult)
- [ ] Visual feedback on hover
- [ ] Visual state when selected (border, highlight)
- [ ] Accessible (keyboard navigation)

### JokerZone Component:
- [ ] Shows up to 5 joker slots
- [ ] Filled slots show joker card
- [ ] Empty slots show placeholder
- [ ] Each joker displays: name, description
- [ ] Visual indication of joker order (priority)
- [ ] Tooltip on hover with full details **(NEW)**
- [ ] Responsive grid layout

### TarotZone Component:
- [ ] Shows up to 2 tarot slots
- [ ] Filled slots show tarot card
- [ ] Empty slots show placeholder
- [ ] Each tarot displays: name, description
- [ ] "Use" button on each tarot
- [ ] Handles targeted vs instant tarots
- [ ] Tooltip on hover with full details **(NEW)**
- [ ] Disabled state when not usable

### ScoreDisplay Component:
- [ ] Shows current accumulated score
- [ ] Shows goal score
- [ ] Progress bar (score/goal)
- [ ] Shows preview calculation when cards selected
- [ ] Formula display: chips × mult = total
- [ ] Color-coded values (chips yellow, mult purple)
- [ ] Clear visual hierarchy

### ShopView Component:
- [ ] Shows shop header with money
- [ ] Displays 4 shop items
- [ ] Each item shows: type, name, description, cost
- [ ] Purchase button on each item
- [ ] Reroll button with cost display
- [ ] "Continue" button to exit shop
- [ ] Disables purchase if unaffordable
- [ ] Shows error messages
- [ ] Color-codes item types

### BlindDefeatModal **(NEW)**:
- [ ] Shows defeat message
- [ ] Shows final score vs goal
- [ ] Shows level reached
- [ ] "Try Again" button
- [ ] "Return to Menu" button
- [ ] Modal backdrop dims background
- [ ] Dismissible with ESC key

### BlindVictoryModal **(NEW)**:
- [ ] Shows victory message for level
- [ ] Shows score achieved
- [ ] Shows money reward
- [ ] "Continue to Shop" button
- [ ] Celebratory styling

### GameVictoryModal **(NEW)**:
- [ ] Shows game complete message
- [ ] Shows total rounds completed (8)
- [ ] Shows statistics (optional)
- [ ] "Play Again" button
- [ ] "Return to Menu" button
- [ ] Celebratory styling

### HelpModal **(NEW)**:
- [ ] Shows game rules and mechanics
- [ ] Explains poker hands
- [ ] Explains jokers, planets, tarots
- [ ] Explains boss blinds
- [ ] Scrollable content
- [ ] "Close" button
- [ ] Dismissible with ESC key

### Tooltip Component **(NEW)**:
- [ ] Generic tooltip wrapper
- [ ] Shows on hover with delay
- [ ] Positions intelligently (avoid screen edges)
- [ ] Dismisses on mouse leave
- [ ] Supports custom content
- [ ] Accessible (ARIA attributes)

### CardTooltipContent **(NEW)**:
- [ ] Shows card details
- [ ] Shows base chip value
- [ ] Shows permanent bonuses
- [ ] Shows suit information
- [ ] Formatted clearly

### JokerTooltipContent **(NEW)**:
- [ ] Shows joker name and full description
- [ ] Shows joker type (Chips/Mult/Multiplier)
- [ ] Shows activation condition
- [ ] Shows effect value
- [ ] Color-coded by type

### TarotTooltipContent **(NEW)**:
- [ ] Shows tarot name and full description
- [ ] Shows if instant or targeted
- [ ] Shows effect details
- [ ] Usage instructions

## Edge Cases to Handle:

**UI States:**
- Loading state (initial game load)
- No game active (menu)
- Game in progress (game board)
- Shop open (shop view)
- Game over (defeat modal)
- Game won (victory modal)

**Component States:**
- Empty hand (shouldn't happen)
- No jokers (empty slots)
- No tarots (empty slots)
- 0 money (can't buy anything)
- No hands remaining (game over)
- No discards remaining (discard disabled)

**Responsive Design:**
- Minimum screen width: 1024px
- Maximum screen width: responsive
- Card sizing adapts to screen
- Layout adjusts to viewport
- Text remains readable

**Accessibility:**
- Keyboard navigation works
- Screen reader support
- Focus indicators visible
- Color contrast adequate (WCAG AA)
- ARIA labels present

**Performance:**
- Re-renders optimized (React.memo where appropriate)
- Large lists optimized
- No unnecessary state updates
- Animations performant

---

# CLASS/COMPONENT DIAGRAM

```
App
├── state: currentScreen, gameState, controller
├── callbacks: handleStateChange, handleShopOpen, etc.
├── renders: MainMenu | GameBoard | ShopView based on currentScreen
│
MainMenu
├── props: onStartNewGame, onContinueGame, hasSavedGame, onOpenHelp
├── renders: Title, buttons
│
GameBoard
├── props: controller, gameState
├── renders: TopBar, JokerZone, TarotZone, ScoreDisplay, Hand, HandInfoPanel, ActionButtons
│
Hand
├── props: cards, selectedCards, onSelectCard
├── renders: Selection indicator, CardComponents
│
HandInfoPanel (NEW)
├── props: cards, selectedCards, upgradeManager
├── renders: Current hand type, base values
│
CardComponent
├── props: card, isSelected, onClick
├── renders: Card face with suit, value, bonuses
├── Tooltip: CardTooltipContent
│
JokerZone
├── props: jokers
├── renders: Joker slots (5 max)
├── Tooltip: JokerTooltipContent per joker
│
TarotZone
├── props: consumables, onUseConsumable
├── renders: Tarot slots (2 max)
├── Tooltip: TarotTooltipContent per tarot
│
ScoreDisplay
├── props: currentScore, goalScore, previewScore
├── renders: Progress bar, scores, preview formula
│
ShopView
├── props: controller, shop, playerMoney
├── state: selectedItem, purchaseError
├── renders: Shop items, reroll button, continue button
│
Modals (NEW):
├── BlindDefeatModal: props (onRetry, onMenu), renders defeat UI
├── BlindVictoryModal: props (onContinue, score, reward), renders victory UI
├── GameVictoryModal: props (onPlayAgain, onMenu, stats), renders game complete UI
├── HelpModal: props (onClose), renders help content
│
Tooltips (NEW):
├── Tooltip: Generic wrapper with positioning
├── CardTooltipContent: props (card), renders card details
├── JokerTooltipContent: props (joker), renders joker details
├── TarotTooltipContent: props (tarot), renders tarot details
```

---

# CODE TO REVIEW

- `App.tsx` - Main application component
- `MainMenu.tsx` - Main menu component
- `GameBoard.tsx` - Main game board container
- `Hand.tsx` - Player hand display
- `HandInfoPanel.tsx` - Hand information panel
- `CardComponent.tsx` - Individual card component
- `JokerZone.tsx` - Joker display area
- `TarotZone.tsx` - Tarot display area
- `ScoreDisplay.tsx` - Score information panel
- `ShopView.tsx` - Shop interface
- `BlindDefeatModal.tsx` - Blind defeat modal
- `BlindVictoryModal.tsx` - Blind victory modal
- `GameVictoryModal.tsx` - Game victory modal
- `HelpModal.tsx` - Help/tutorial modal
- `Tooltip.tsx` - Base tooltip component
- `CardTooltipContent.tsx` - Card tooltip content
- `JokerTooltipContent.tsx` - Joker tooltip content
- `TarotTooltipContent.tsx` - Tarot tooltip content

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation follow React best practices?
- [ ] Component hierarchy matches diagram
- [ ] Props properly typed with TypeScript
- [ ] State management appropriate (local vs lifted)
- [ ] No prop drilling (excessive prop passing)
- [ ] Component composition used effectively

**Specific checks for this module:**

**App Component:**
- [ ] Manages global state (currentScreen, gameState)
- [ ] Instantiates GameController
- [ ] Registers all callbacks
- [ ] Routes between menu/game/shop screens
- [ ] Updates on controller callbacks

**Component Structure:**
- [ ] Each component in own file with CSS module
- [ ] Proper TypeScript interfaces for props
- [ ] Functional components with hooks
- [ ] No class components (unless specific need)
- [ ] Index files for clean imports

**State Management:**
- [ ] Local state for UI-only concerns (hover, selected item)
- [ ] Lifted state for shared data (gameState)
- [ ] No Redux (not needed for this scale)
- [ ] Callbacks for child-to-parent communication

**Component Responsibilities:**
- [ ] Presentational components receive data via props
- [ ] Container components manage state and logic
- [ ] No business logic in UI components
- [ ] Clean separation of concerns

**Score:** __/10

**Observations:**
[Document any architectural concerns or deviations]

---

## 2. CODE QUALITY (Weight: 25%)

### React Best Practices:

**Component Design:**
- [ ] Single responsibility per component
- [ ] Reusable components extracted (Card, Tooltip, Modal)
- [ ] Conditional rendering clear and readable
- [ ] Event handlers named consistently (handleX)

**Hooks Usage:**
- [ ] useState for local state
- [ ] useEffect for side effects (proper dependency arrays)
- [ ] useCallback for memoized callbacks
- [ ] useMemo for expensive calculations
- [ ] Custom hooks if repeated logic

**Performance:**
- [ ] React.memo on frequently re-rendered components
- [ ] Avoid inline function definitions in render
- [ ] Key props on list items
- [ ] Lazy loading for heavy components (optional)

**TypeScript Integration:**
- [ ] All props typed with interfaces
- [ ] Event handlers typed correctly
- [ ] State typed explicitly
- [ ] No `any` types (use `unknown` or proper types)

### CSS Quality:

**Organization:**
- [ ] Consistent naming (BEM or similar)
- [ ] No inline styles (except dynamic values)
- [ ] CSS modules or scoped styles
- [ ] Variables for colors/spacing

**Color Palette Compliance:**
- [ ] Uses specified theme colors
- [ ] Suit colors correct (♦♥♠♣)
- [ ] Indicator colors used appropriately
- [ ] Consistent throughout

**Layout:**
- [ ] Flexbox/Grid for layouts
- [ ] Responsive design (min 1024px)
- [ ] Proper spacing and alignment
- [ ] No magic numbers in CSS

**Accessibility:**
- [ ] Color contrast WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] ARIA labels where needed

### Code Smells Detection:

**Component Smells:**
- [ ] God components (>300 lines) - should be split
- [ ] Prop drilling (passing props 3+ levels)
- [ ] Duplicate JSX patterns
- [ ] Inline styles everywhere

**Hook Smells:**
- [ ] Missing dependencies in useEffect
- [ ] Too many useState (combine related state)
- [ ] useEffect without cleanup (for subscriptions)

**CSS Smells:**
- [ ] !important overuse
- [ ] Deep nesting (>3 levels)
- [ ] Duplicate styles
- [ ] Magic numbers

**Score:** __/10

**Detected code smells:**
[List specific issues with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**App Component:**
- [ ] Manages screen routing (menu/game/shop)
- [ ] Instantiates GameController with callbacks
- [ ] onStateChange callback updates React state
- [ ] onShopOpen callback switches to shop screen
- [ ] onShopClose callback returns to game screen
- [ ] onVictory callback shows victory modal
- [ ] onDefeat callback shows defeat modal
- [ ] Renders appropriate screen based on state

**MainMenu Component:**
- [ ] Displays game title/logo
- [ ] "New Game" button calls onStartNewGame
- [ ] "Continue" button calls onContinueGame
- [ ] Continue button disabled if no saved game
- [ ] "Help" button opens help modal
- [ ] Proper styling matches theme
- [ ] Buttons have hover states

**GameBoard Component:**
- [ ] Top bar shows: level number, money, round number
- [ ] JokerZone rendered in appropriate position
- [ ] TarotZone rendered in appropriate position
- [ ] ScoreDisplay rendered prominently
- [ ] Hand component rendered centrally
- [ ] HandInfoPanel rendered near hand **(NEW)**
- [ ] Action buttons: "Play Hand", "Discard"
- [ ] Counters show hands remaining / discards remaining
- [ ] Play button disabled if 0 cards selected or 0 hands
- [ ] Discard button disabled if 0 cards selected or 0 discards
- [ ] Responsive layout

**Hand Component:**
- [ ] Displays all cards in currentHand
- [ ] Shows selection indicator "X/5 selected"
- [ ] Each card clickable
- [ ] Calls onSelectCard(cardId) on click
- [ ] Visual feedback for selected state
- [ ] Cards arranged in row or grid
- [ ] Responsive card sizing

**HandInfoPanel Component **(NEW)**:**
- [ ] Shows detected poker hand type ("Pair", "Flush", etc.)
- [ ] Shows base chips for hand type
- [ ] Shows base mult for hand type
- [ ] Updates in real-time with selection
- [ ] Clear typography and hierarchy
- [ ] Positioned logically (near hand or score)

**CardComponent:**
- [ ] Displays card value (A, K, Q, J, 10-2)
- [ ] Displays suit symbol (♦♥♠♣)
- [ ] Uses correct suit color (red/pink-red/teal/light-teal)
- [ ] Shows value in corners
- [ ] Shows large suit symbol in center
- [ ] Shows permanent bonuses if present (+20 chips, +4 mult)
- [ ] Bonus display distinct from base card
- [ ] Hover effect (lift, glow)
- [ ] Selected state (border, highlight)
- [ ] Smooth transitions
- [ ] Tooltip shows full card details **(NEW)**

**JokerZone Component:**
- [ ] Shows 5 slots total
- [ ] Filled slots show joker cards
- [ ] Empty slots show placeholder
- [ ] Each joker shows: name, description
- [ ] Visual order indicator (1-5 or similar)
- [ ] Grid layout (responsive)
- [ ] Tooltip shows full joker details **(NEW)**
- [ ] Distinguishes joker types (Chips/Mult/Multiplier) via color

**TarotZone Component:**
- [ ] Shows 2 slots total
- [ ] Filled slots show tarot cards
- [ ] Empty slots show placeholder
- [ ] Each tarot shows: name, description
- [ ] "Use" button on each tarot
- [ ] Button calls onUseConsumable(tarotId)
- [ ] For targeted tarots: prompts for card selection
- [ ] Button disabled if can't use
- [ ] Tooltip shows full tarot details **(NEW)**

**ScoreDisplay Component:**
- [ ] Shows current accumulated score
- [ ] Shows goal score
- [ ] Progress bar visualizes score/goal ratio
- [ ] Bar color changes based on progress (red → yellow → green)
- [ ] When cards selected: shows preview
- [ ] Preview shows: chips × mult = total
- [ ] Chips in yellow color
- [ ] Mult in purple color
- [ ] Clear hierarchy (goal most prominent)

**ShopView Component:**
- [ ] Header shows "Shop" title
- [ ] Header shows player money
- [ ] Displays 4 shop items in grid/row
- [ ] Each item shows: type badge, name, description, cost
- [ ] Item type color-coded (Joker/Planet/Tarot)
- [ ] Purchase button on each item
- [ ] Purchase button calls controller.purchaseShopItem(itemId)
- [ ] Purchase button disabled if can't afford
- [ ] Shows error message if purchase fails
- [ ] Reroll button with cost ($3)
- [ ] Reroll button calls controller.rerollShop()
- [ ] Reroll disabled if can't afford
- [ ] "Continue" button exits shop
- [ ] Continue button calls controller.exitShop()

**BlindDefeatModal **(NEW)**:**
- [ ] Shows "Defeated" or similar message
- [ ] Shows final score vs goal
- [ ] Shows level reached
- [ ] "Try Again" button calls onRetry
- [ ] "Return to Menu" button calls onMenu
- [ ] Modal overlay darkens background
- [ ] Dismissible with ESC key
- [ ] Centered on screen

**BlindVictoryModal **(NEW)**:**
- [ ] Shows "Level Complete!" or similar
- [ ] Shows score achieved
- [ ] Shows money reward earned
- [ ] "Continue to Shop" button calls onContinue
- [ ] Celebratory styling (colors, animation)
- [ ] Auto-dismisses or requires click

**GameVictoryModal **(NEW)**:**
- [ ] Shows "Victory!" or "Game Complete!" message
- [ ] Shows rounds completed (8 rounds / 24 levels)
- [ ] Optional: shows statistics (total score, money earned)
- [ ] "Play Again" button calls onPlayAgain
- [ ] "Return to Menu" button calls onMenu
- [ ] Celebratory styling
- [ ] Confetti or celebration animation (optional)

**HelpModal **(NEW)**:**
- [ ] Shows game rules overview
- [ ] Explains poker hand hierarchy
- [ ] Explains jokers (with examples)
- [ ] Explains planets (permanent upgrades)
- [ ] Explains tarots (single-use effects)
- [ ] Explains boss blinds
- [ ] Scrollable content
- [ ] "Close" button calls onClose
- [ ] Dismissible with ESC key
- [ ] Well-organized sections

**Tooltip Component **(NEW)**:**
- [ ] Wraps children with hover trigger
- [ ] Shows content after hover delay (300-500ms)
- [ ] Positions intelligently (avoids screen edges)
- [ ] Arrow points to trigger element
- [ ] Dismisses on mouse leave
- [ ] Supports custom content via children or render prop
- [ ] ARIA attributes (aria-describedby, role="tooltip")
- [ ] z-index above other elements

**CardTooltipContent **(NEW)**:**
- [ ] Shows card value and suit name
- [ ] Shows base chip value
- [ ] Shows permanent bonuses if present
- [ ] Formatted clearly with labels
- [ ] Color-coded values

**JokerTooltipContent **(NEW)**:**
- [ ] Shows joker name (header)
- [ ] Shows full description
- [ ] Shows joker type (Chips/Mult/Multiplier)
- [ ] Shows activation condition
- [ ] Shows effect value/formula
- [ ] Color-coded by type

**TarotTooltipContent **(NEW)**:**
- [ ] Shows tarot name (header)
- [ ] Shows full description
- [ ] Shows if instant or targeted
- [ ] Shows effect details
- [ ] Usage instructions ("Click Use button")

### Edge Cases Handling:

**UI States:**
- [ ] Loading state before game initializes
- [ ] Empty joker zone (5 empty slots)
- [ ] Empty tarot zone (2 empty slots)
- [ ] 0 money displayed correctly
- [ ] 0 hands remaining (Play disabled, game over check)
- [ ] 0 discards remaining (Discard disabled)
- [ ] Score exactly equals goal (level complete)
- [ ] Score exceeds goal (level complete)

**Responsive Design:**
- [ ] Works at 1024px width (minimum)
- [ ] Works at 1920px width
- [ ] Cards scale appropriately
- [ ] Text remains readable
- [ ] Buttons remain clickable
- [ ] No horizontal scroll

**Accessibility:**
- [ ] Tab navigation through interactive elements
- [ ] Enter/Space activate buttons
- [ ] Focus visible (outline or highlight)
- [ ] Screen reader can navigate
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on images (if any)

**Performance:**
- [ ] No lag when selecting cards
- [ ] Smooth animations
- [ ] React DevTools shows no excessive re-renders
- [ ] useCallback prevents function recreation
- [ ] useMemo prevents expensive recalculations

**Score:** __/10

**Unmet requirements:**
[List any UI features not properly implemented]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Component Organization:

**File Structure:**
- [ ] Logical grouping (menu, game-board, modals, tooltip)
- [ ] Co-located CSS with components
- [ ] Index files for clean imports
- [ ] Consistent naming conventions

**Component Naming:**
- [ ] PascalCase for components
- [ ] Descriptive names (CardComponent, JokerZone)
- [ ] Event handlers named handleX
- [ ] Props interfaces named XProps

**Code Documentation:**
- [ ] JSDoc comments on complex components
- [ ] Prop interfaces documented
- [ ] Complex logic explained
- [ ] No obvious/redundant comments

**Reusability:**
- [ ] Generic components extracted (Tooltip, Modal)
- [ ] Shared styles in CSS variables
- [ ] Utility functions extracted
- [ ] No duplicate JSX patterns

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### React Patterns:

**Component Patterns:**
- [ ] Composition over inheritance
- [ ] Controlled components for forms
- [ ] Lifting state when needed
- [ ] Props drilling avoided (max 2 levels)

**Hook Patterns:**
- [ ] Custom hooks for repeated logic
- [ ] Correct dependency arrays
- [ ] Cleanup functions in useEffect
- [ ] Memoization where beneficial

**Event Handling:**
- [ ] Event handlers bound correctly
- [ ] preventDefault/stopPropagation used appropriately
- [ ] No inline arrow functions in render (performance)

**Conditional Rendering:**
- [ ] Ternary for simple conditions
- [ ] && for existence checks
- [ ] Early returns in complex cases
- [ ] No nested ternaries

### CSS Patterns:

**Styling Approach:**
- [ ] CSS modules or scoped styles
- [ ] BEM or consistent naming
- [ ] Variables for theme values
- [ ] Media queries for responsiveness

**Layout:**
- [ ] Flexbox for 1D layouts
- [ ] Grid for 2D layouts
- [ ] rem/em for scalable sizing
- [ ] No fixed pixel values for content

### Accessibility:

**Semantic HTML:**
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Button for actions (not div with onClick)
- [ ] Links for navigation
- [ ] Form labels associated

**ARIA:**
- [ ] aria-label for icon buttons
- [ ] aria-describedby for tooltips
- [ ] role attributes where needed
- [ ] aria-live for dynamic content

**Keyboard:**
- [ ] Tab order logical
- [ ] Enter/Space work on buttons
- [ ] ESC closes modals
- [ ] Focus trap in modals

**Score:** __/10

---

# DELIVERABLES

## Review Report:

**Total Score:** __/10 (weighted average)

**Calculation:**
- Design Adherence (30%): [score] × 0.30 = __
- Code Quality (25%): [score] × 0.25 = __
- Requirements Compliance (25%): [score] × 0.25 = __
- Maintainability (10%): [score] × 0.10 = __
- Best Practices (10%): [score] × 0.10 = __
- **TOTAL: __/10**

---

## Executive Summary:

[Provide 2-3 lines about the general state of React components. Example: "The React UI successfully implements all game screens with proper state management and callbacks. Components follow React best practices with appropriate use of hooks. New modal and tooltip components enhance UX. Minor improvements needed in accessibility and performance optimization."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "GameBoard Doesn't Update on State Change"]
- **Location:** Lines [X-Y] in App.tsx
- **Impact:** UI doesn't reflect game state changes, game unplayable
- **Proposed solution:** Ensure onStateChange callback triggers React setState

### Issue 2: [Title - e.g., "Cards Not Selectable"]
- **Location:** Lines [X-Y] in Hand.tsx or CardComponent.tsx
- **Impact:** Players cannot select cards to play
- **Proposed solution:** Wire up onClick handler to call controller.selectCard

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Missing HandInfoPanel Component"]
- **Location:** GameBoard.tsx
- **Suggestion:** Add HandInfoPanel to show current poker hand type detected

### Issue 2: [Title - e.g., "Tooltips Not Implemented"]
- **Location:** CardComponent, JokerZone, TarotZone
- **Suggestion:** Add Tooltip wrapper with appropriate content components

### Issue 3: [Title - e.g., "Color Palette Not Followed"]
- **Location:** Multiple CSS files
- **Suggestion:** Replace hard-coded colors with CSS variables from theme palette

---

## Positive Aspects:

- [e.g., "Clean component hierarchy with good separation of concerns"]
- [e.g., "Proper use of React hooks throughout"]
- [e.g., "TypeScript interfaces well-defined for props"]
- [e.g., "Responsive layout adapts to screen sizes"]
- [e.g., "Modal components provide good UX for game events"]
- [e.g., "Tooltip system enhances information accessibility"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Theme Constants to CSS Variables

**BEFORE:**
```css
/* Repeated throughout CSS files */
.card {
  background-color: #16213e;
  border: 2px solid #0f3460;
  color: #f1f1f1;
}

.button {
  background-color: #e94560;
  color: #f1f1f1;
}
```

**AFTER (proposal):**
```css
/* In App.css or global.css */
:root {
  --color-bg-primary: #1a1a2e;
  --color-bg-panel: #16213e;
  --color-border: #0f3460;
  --color-accent: #e94560;
  --color-text-primary: #f1f1f1;
  --color-text-secondary: #a8a8a8;
  
  --color-diamonds: #ff6b6b;
  --color-hearts: #ee5a6f;
  --color-spades: #4ecdc4;
  --color-clubs: #95e1d3;
  
  --color-chips: #f9ca24;
  --color-mult: #6c5ce7;
  --color-money: #00d2d3;
}

/* In components */
.card {
  background-color: var(--color-bg-panel);
  border: 2px solid var(--color-border);
  color: var(--color-text-primary);
}

.button {
  background-color: var(--color-accent);
  color: var(--color-text-primary);
}
```

**Rationale:** Centralized theme makes it easy to adjust colors globally

---

### Refactoring 2: Extract Modal Backdrop Component

**BEFORE:**
```tsx
// Repeated in multiple modals
<div className="modal-backdrop" onClick={onClose}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    {/* Modal content */}
  </div>
</div>
```

**AFTER (proposal):**
```tsx
// Create ModalBackdrop component
interface ModalBackdropProps {
  onClose: () => void;
  children: React.ReactNode;
}

const ModalBackdrop: React.FC<ModalBackdropProps> = ({ onClose, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

// Usage in modals
<ModalBackdrop onClose={onClose}>
  <h2>Defeat</h2>
  {/* Modal content */}
</ModalBackdrop>
```

**Rationale:** Reduces duplication, adds ESC key handling consistently

---

### Refactoring 3: Extract Custom Hook for Controller Actions

**BEFORE:**
```tsx
// Repeated error handling in GameBoard
const handlePlayHand = () => {
  try {
    const result = controller.playSelectedHand();
    // Handle result
  } catch (error) {
    console.error('Play hand failed:', error);
    setError(error.message);
  }
};

const handleDiscard = () => {
  try {
    controller.discardSelected();
  } catch (error) {
    console.error('Discard failed:', error);
    setError(error.message);
  }
};
```

**AFTER (proposal):**
```tsx
// Custom hook
const useControllerAction = () => {
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback((action: () => void) => {
    try {
      setError(null);
      action();
    } catch (error) {
      console.error('Action failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  return { error, executeAction };
};

// Usage in GameBoard
const { error, executeAction } = useControllerAction();

const handlePlayHand = () => {
  executeAction(() => {
    const result = controller.playSelectedHand();
    // Handle result
  });
};

const handleDiscard = () => {
  executeAction(() => controller.discardSelected());
};
```

**Rationale:** DRY principle, consistent error handling

---

## Decision:

Select one:

- [ ] ✅ **APPROVED** - Ready for integration
  - All UI components functional
  - Proper React patterns used
  - State management correct
  - Callbacks working
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core UI works
  - Minor components missing (tooltips, modals)
  - Accessibility improvements needed
  - Performance optimizations recommended
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical UI components broken
  - State updates not working
  - Callbacks not wired correctly
  - Must fix before testing
