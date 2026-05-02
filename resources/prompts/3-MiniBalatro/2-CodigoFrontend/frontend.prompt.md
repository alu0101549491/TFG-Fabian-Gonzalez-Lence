# GLOBAL CONTEXT
**Project:** Mini Balatro

**Type:** Interactive Web Card Game Application

**Purpose:** A web-based card game inspired by Balatro that combines poker mechanics with roguelike elements. Players must overcome progressive scoring levels by playing strategic poker hands with a French deck of 52 cards, enhanced by special cards (planets, tarot, and jokers). The game features a strict score calculation system, shop mechanics, level progression with boss encounters, and persistent game state.

**Target audience:** Card game enthusiasts, poker players, and roguelike fans who enjoy strategic gameplay with progressive difficulty and card synergies.

---

# INPUT ARTIFACTS

## 1. Content Specification

The application consists of multiple interconnected views/screens:

### Required sections per screen:

**Main Menu Screen:**
1. **Header**: Game title and branding
2. **Menu Options**: New Game, Continue Game (if save exists), Help/Tutorial, Settings
3. **Footer**: Credits and version information

**Game Board Screen (Primary gameplay):**
1. **Top Bar**: Current level information (Small/Big/Boss Blind), round number, money display
2. **Joker Zone**: Display area for up to 5 active joker cards with their effects
3. **Tarot Zone**: Display area for up to 2 consumable tarot cards
4. **Level Information Panel**: Score goal, accumulated points, progress bar, hands remaining, discards remaining
5. **Main Hand Area**: 8 cards from player's hand with selection indicators
6. **Score Preview Panel**: Real-time preview of chips, mult, and total score for selected cards
7. **Action Buttons**: Play Hand, Discard buttons with enabled/disabled states
8. **Boss Blind Indicator**: Special visual treatment when in boss level with effect description

**Shop Screen:**
1. **Header**: Shop title and current money balance
2. **Shop Items Grid**: 4 purchasable cards (Jokers, Planets, Tarot) with prices
3. **Item Details**: Card name, type, effect description, cost
4. **Shop Actions**: Reroll button (with cost), Continue to next level button
5. **Purchase Feedback**: Visual indication of affordable vs. too expensive items

**Victory/Defeat Screens:**
1. **Result Message**: Victory or Game Over announcement
2. **Statistics Summary**: Levels passed, total score, money remaining, rounds completed
3. **Action Buttons**: New Game, Return to Main Menu, (Victory only) View Statistics

**Help/Tutorial Screen:**
1. **Poker Hands Reference**: Table of all poker hands with base chips and mult values
2. **Special Cards Catalog**: Complete list of Jokers, Planets, and Tarot cards with effects
3. **Boss Blinds Guide**: Description of all 5 boss types and their mechanics
4. **Scoring System Explanation**: Step-by-step breakdown of score calculation order
5. **Navigation**: Back to menu button

## 2. Visual Design

### Mockup/Wireframe Description:

**Game Board Layout (Desktop 1024px+):**
```
┌────────────────────────────────────────────────────────────┐
│  [Level: Big Blind #2]  [Money: $12]  [Round: 1]           │ <- Top bar
├────────────────────────────────────────────────────────────┤
│  Jokers:  [Card1] [Card2] [Empty] [Empty] [Empty]          │ <- Joker zone
│  Tarot:   [Card1] [Empty]                                  │ <- Tarot zone
├────────────────────────────────────────────────────────────┤
│  Goal: 450 pts                                             │
│  Score: 285 pts  ▓▓▓▓▓▓▓▓░░░░░░░░ (63%)                    │ <- Progress
│                                                            │
│  [A♠] [A♥] [K♦] [Q♣] [J♠] [10♦] [9♥] [2♣]                  │ <- Main hand
│   ▲    ▲    ▲    ▲    ▲                                    │ <- Selection
│                                                            │
│  Preview: 65 chips × 10 mult = 650 pts                     │ <- Score preview
│                                                            │
│  [Play Hand]  [Discard]                                    │ <- Actions
│  Hands: 2/3    Discards: 1/3                               │ <- Counters
└────────────────────────────────────────────────────────────┘
```

**Shop Layout:**
```
┌────────────────────────────────────────────────────────────┐
│                  SHOP - Money: $12                         │
├────────────────────────────────────────────────────────────┤
│  [Joker Card]    [Planet Card]   [Tarot Card]   [Joker]   │
│   Effect...       Effect...       Effect...      Effect... │
│    $5              $3              $3             $5        │
│  [Purchase]      [Purchase]      [Purchase]    [Purchase]  │
├────────────────────────────────────────────────────────────┤
│  [Reroll - $2]                      [Continue to Level 3]  │
└────────────────────────────────────────────────────────────┘
```

### Inspiration references:
- Balatro (original game) - Card-focused UI with clean information hierarchy
- Slay the Spire - Roguelike progression and card selection mechanics
- Poker Night at the Inventory - Poker hand visualization
- Modern card game UIs with focus on readability and clear state indication

### General style: 
**Modern Gaming UI** with dark theme, vibrant accent colors for suits and effects, clear typography for numbers and card information, smooth animations for card interactions, and professional visual hierarchy for complex game state information.

## 3. Design Specifications

### Colors:

**From Requirements Specification Section 18.1:**

**Theme Colors:**
- Primary Background: `#1a1a2e` (deep dark blue)
- Panel Background: `#16213e` (navy blue)
- Border Color: `#0f3460` (medium blue)
- Accent/Active: `#e94560` (bright red)
- Primary Text: `#f1f1f1` (soft white)
- Secondary Text: `#a8a8a8` (light gray)

**Suit Colors:**
- Diamonds: `#ff6b6b` (red)
- Hearts: `#ee5a6f` (pink-red)
- Spades: `#4ecdc4` (turquoise)
- Clubs: `#95e1d3` (aqua green)

**Indicator Colors:**
- Chips: `#f9ca24` (golden yellow)
- Mult: `#6c5ce7` (purple)
- Money: `#00d2d3` (cyan)
- Success/Progress: `#2ecc71` (green)
- Warning/Disabled: `#95a5a6` (gray)
- Error/Danger: `#e74c3c` (red)

**Special Card Backgrounds:**
- Jokers: Purple-gold gradient (`#6c5ce7` to `#f9ca24`)
- Planets: Dark blue with stars (`#0f3460` with `#4ecdc4` accents)
- Tarot: Mystical background (`#16213e` with `#e94560` borders)

### Typography:

**Main font:** 'Inter' or 'Roboto' (system fallback: sans-serif)
- H1 (Game Title): 48px, weight 700
- H2 (Section Headers): 32px, weight 600
- H3 (Card Names, Labels): 24px, weight 600
- Body Text: 16px, weight 400
- Small Text (Descriptions): 14px, weight 400
- Numbers (Scores, Chips, Mult): 20px, weight 700, monospace variant

**Secondary font:** 'Playfair Display' or 'Merriweather' for special card names (Jokers, Planets, Tarot)
- Card titles: 18px, weight 600
- Special emphasis: 16px, weight 400, italic

**Line height:** 
- Headers: 1.2
- Body text: 1.5
- Compact UI elements: 1.3

**Font weights to use:** 400 (regular), 600 (semi-bold), 700 (bold)

### Spacing:

**Spacing system:** Multiples of 8px (8px, 16px, 24px, 32px, 40px, 48px)

**Container padding:**
- Main container: 24px (mobile), 32px (tablet), 40px (desktop)
- Panel padding: 16px (all sides)
- Card padding: 12px

**Margin between sections:**
- Between major sections: 32px (mobile), 48px (desktop)
- Between cards in hand: 8px (mobile), 12px (desktop)
- Between UI elements: 16px

**Component spacing:**
- Button padding: 12px 24px
- Input padding: 10px 16px
- Card gap in grid: 16px

### Effects:

**Shadows:**
- Card default: `0 4px 8px rgba(0, 0, 0, 0.3)`
- Card hover: `0 8px 16px rgba(0, 0, 0, 0.4)`
- Card selected: `0 8px 24px rgba(233, 69, 96, 0.6)`
- Panel shadow: `0 2px 8px rgba(0, 0, 0, 0.2)`
- Button shadow: `0 2px 4px rgba(0, 0, 0, 0.2)`

**Transitions:**
- Default duration: 200ms
- Easing: ease-in-out
- Hover transitions: 150ms ease-out
- Card flip/deal: 300ms ease-in-out
- Score increment: 400ms ease-out

**Hover effects:**
- Cards: Lift up 8px (translateY), increase shadow, scale 1.02
- Buttons: Brighten background 10%, increase shadow
- Joker/Tarot cards on activation: Glow pulse effect with suit color
- Shop items: Border highlight with accent color

**Active/Selected states:**
- Selected cards: Lift 20px up, bright border (3px solid `#e94560`)
- Active buttons: Scale 0.98, darken background
- Disabled elements: Opacity 0.5, grayscale filter, cursor not-allowed

## 4. Interactive Behaviors

**Navigation:**
- Fixed top bar with level/money information (always visible during gameplay)
- Smooth scroll between sections when transitioning screens
- Back buttons with slide-left transition

**Animations:**
- **On load:** 
  - Cards deal from deck with staggered fade-in (50ms delay between cards)
  - UI panels slide in from edges
  - Progress bar animates from 0 to current value
- **On scroll:** Parallax effect on background (subtle, <5px shift)
- **On hover:** 
  - Card lift and shadow increase
  - Button brightness increase
  - Tooltip fade-in for card effects
- **On play hand:**
  - Selected cards move to center
  - Score calculation shows incremental counter
  - Floating numbers show chip/mult additions
  - Cards return to hand or move to discard pile
- **On discard:**
  - Cards fade out with rotation
  - New cards slide in from deck
- **On purchase:**
  - Purchased card flies to target zone (joker/tarot area)
  - Money counter decrements with animation
  - Shop slot refreshes with fade transition

**Forms:**
- No traditional forms; all interactions are button-based
- Button states: default, hover, active, disabled with visual feedback
- Click feedback: scale down 2% on click, return on release

**Modal/Overlays:**
- Boss Blind introduction: Full-screen overlay with fade-in, boss name and effect display, continue button
- Victory/Defeat screens: Overlay with backdrop blur, slide-down animation
- Help screen: Slide-in from right side panel
- Confirmation dialogs: Center modal with backdrop darkening

**Responsive Behaviors:**
- Touch targets minimum 44px × 44px on mobile
- Card selection: Click on desktop, tap on mobile
- Long-press on cards to view detailed information (mobile)
- Swipe gestures for discarding cards (optional mobile enhancement)

---

# SPECIFIC TASK

Generate the complete CSS styling for the Mini Balatro web application following the established architecture structure.

## File Structure to Modify:

According to the architecture document **"3. Mini Balatro - Architecture Structure.md"**, you will be working with the following CSS files:

```
3-MiniBalatro/
├── public/
│   └── assets/
│       └── styles/
│           ├── global.css          # ← CREATE: Global styles, CSS variables, resets
│           └── animations.css      # ← CREATE: Reusable animation keyframes
└── src/
    └── views/
        └── components/
            ├── game-board/
            │   └── GameBoard.css   # ← CREATE: Main game board layout and styling
            ├── hand/
            │   └── Hand.css        # ← CREATE: Player hand display and card layout
            ├── card/
            │   └── CardComponent.css # ← CREATE: Individual card styling (base, suits, states)
            ├── joker-zone/
            │   └── JokerZone.css   # ← CREATE: Joker display area styling
            ├── tarot-zone/
            │   └── TarotZone.css   # ← CREATE: Tarot/consumables area styling
            ├── shop/
            │   └── ShopView.css    # ← CREATE: Shop interface styling
            ├── score-display/
            │   └── ScoreDisplay.css # ← CREATE: Score information panel styling
            └── menu/
                └── MainMenu.css    # ← CREATE: Main menu and navigation styling
```

**Note:** The HTML structure will be generated by React components (`.tsx` files). Your CSS should use class-based selectors that will be applied by those components.

## Specific Elements to Include in CSS Files:

### global.css:
- [ ] CSS custom properties (variables) for all colors, spacing, typography
- [ ] CSS reset/normalization
- [ ] Base typography styles
- [ ] Utility classes (flex helpers, spacing, text alignment)
- [ ] Responsive breakpoint variables
- [ ] Z-index layering system

### animations.css:
- [ ] Card deal animation (@keyframes)
- [ ] Card selection lift animation
- [ ] Score increment counter animation
- [ ] Glow/pulse effect for active jokers
- [ ] Slide-in transitions for panels
- [ ] Fade transitions for modals
- [ ] Floating number animations (chips/mult indicators)

### GameBoard.css:
- [ ] Main game container layout (flexbox/grid)
- [ ] Top bar styling (level info, money, round)
- [ ] Progress bar with percentage fill
- [ ] Action button area layout
- [ ] Counter displays (hands/discards remaining)
- [ ] Responsive layout adjustments (mobile/tablet/desktop)

### Hand.css:
- [ ] Hand container with card grid layout
- [ ] Card spacing and alignment (8 cards horizontally)
- [ ] Selection indicator positioning (arrows/highlights below cards)
- [ ] Empty hand state styling
- [ ] Responsive hand layout (stack on mobile, horizontal on desktop)

### CardComponent.css:
- [ ] Base card structure (100px × 140px, rounded corners)
- [ ] Card face styling (value, suit symbols, centered icon)
- [ ] Suit color classes (.diamonds, .hearts, .spades, .clubs)
- [ ] Card states (.selected, .disabled, .highlighted)
- [ ] Card hover effects (lift, shadow)
- [ ] Card back styling (for deck visualization)
- [ ] Special card variants (.joker-card, .planet-card, .tarot-card)
- [ ] Gradient backgrounds for special cards

### JokerZone.css:
- [ ] Joker zone container (5 slots horizontal)
- [ ] Individual joker card slot styling
- [ ] Empty slot placeholders with dotted borders
- [ ] Joker activation glow effect
- [ ] Joker effect tooltip styling
- [ ] Priority order visual indicators (numbers or arrows)

### TarotZone.css:
- [ ] Tarot zone container (2 slots horizontal)
- [ ] Tarot card slot styling with mystical theme
- [ ] Empty slot placeholders
- [ ] "Use" button styling per tarot card
- [ ] Tarot activation flash effect

### ShopView.css:
- [ ] Shop modal/overlay background (backdrop blur)
- [ ] Shop container centered layout
- [ ] Shop header with money display
- [ ] 4-item grid layout for purchasable cards
- [ ] Shop item card styling (larger than game cards, ~120px × 180px)
- [ ] Price tag styling below each item
- [ ] Purchase button states (enabled/disabled based on money)
- [ ] Reroll button styling with cost indicator
- [ ] Continue button prominent styling
- [ ] Affordable vs. too-expensive visual states (green border vs. red/grayed)

### ScoreDisplay.css:
- [ ] Score panel container styling
- [ ] Goal display with large numbers
- [ ] Current score with progress percentage
- [ ] Progress bar container and fill animation
- [ ] Score preview panel (chips × mult = total)
- [ ] Chip/mult color-coded numbers (yellow/purple)
- [ ] Breakdown list styling (when showing detailed calculation)

### MainMenu.css:
- [ ] Menu screen full-page layout
- [ ] Game title/logo styling (large, centered)
- [ ] Menu button list (vertical stack, centered)
- [ ] Button hover/active states
- [ ] Disabled state for "Continue" when no save exists
- [ ] Footer styling with credits
- [ ] Victory/Defeat screen overlay styling
- [ ] Statistics summary table styling
- [ ] Help/Tutorial panel slide-in styling
- [ ] Reference table styling for poker hands and special cards

---

# CONSTRAINTS AND STANDARDS

## CSS:

**Framework:** None (Pure CSS/CSS3)

**Preprocessor:** None (vanilla CSS with CSS custom properties)

**Requirements:**
- [ ] **Mobile-first approach** - Start with mobile styles, use min-width media queries
- [ ] **CSS custom properties (variables)** for all colors, spacing, typography values
- [ ] **Flexbox/Grid** for all layouts - no floats or positioning hacks
- [ ] **Avoid `!important`** - use proper specificity and cascade
- [ ] **BEM naming convention** for component classes (e.g., `.card__value--selected`)
- [ ] **Comments** for all major sections and complex selectors
- [ ] **Modular structure** - each CSS file should only contain styles for its component
- [ ] **No inline styles** - all styling in external CSS files
- [ ] **Consistent units** - use `rem` for typography, `px` for borders/shadows, `%` for widths

**Organization within each CSS file:**
```css
/* === COMPONENT VARIABLES === */
/* Component-specific overrides of global variables */

/* === LAYOUT === */
/* Container, grid, flexbox structures */

/* === ELEMENTS === */
/* Individual element styling */

/* === STATES === */
/* Hover, active, disabled, selected states */

/* === ANIMATIONS === */
/* Component-specific animations (reference global keyframes) */

/* === RESPONSIVE === */
/* Media queries for breakpoints */
```

## Responsiveness:

**Mandatory breakpoints:**
- Mobile: 320px - 767px (default, mobile-first)
- Tablet: 768px - 1023px
- Desktop: 1024px and above

**Behaviors per device:**

**Mobile (320px - 767px):**
- Cards stack vertically or in 2-column grid
- Hand displays 4 cards per row (2 rows for 8 cards)
- Joker/Tarot zones stack vertically
- Shop items display 2 per row
- Reduced padding (16px instead of 32px)
- Touch-friendly button sizes (minimum 44px height)
- Simplified animations (reduce motion for performance)

**Tablet (768px - 1023px):**
- Hand displays 8 cards in single row with smaller size
- Joker/Tarot zones horizontal with smaller cards
- Shop items display 4 across
- Medium padding (24px)
- Full animations enabled

**Desktop (1024px+):**
- Full card sizes (100px × 140px for game cards)
- All zones horizontal layout
- Maximum padding (32-40px)
- Enhanced hover effects and transitions
- Parallax and advanced animations

## Performance:

- [ ] **Optimized animations** - use `transform` and `opacity` only (GPU accelerated)
- [ ] **Avoid layout thrashing** - minimize reflows/repaints
- [ ] **will-change** property for frequently animated elements
- [ ] **Contain property** for isolated components
- [ ] **Efficient selectors** - avoid deep nesting (max 3 levels)
- [ ] **Minimize repaints** - use CSS containment where applicable

## Accessibility:

- [ ] **Minimum WCAG AA contrast** (4.5:1 for normal text, 3:1 for large text)
- [ ] **Visible focus styles** for keyboard navigation (2px solid outline)
- [ ] **Reduced motion media query** - respect prefers-reduced-motion
- [ ] **High contrast mode support** - test with Windows High Contrast
- [ ] **Color is not the only indicator** - use icons/text with color
- [ ] **Transparent overlays readable** - ensure text contrast on modals

## Browser Compatibility:

- [ ] **Modern browsers** - Chrome, Firefox, Safari, Edge (last 2 versions)
- [ ] **CSS Grid support** required (no IE11 support)
- [ ] **CSS Custom Properties** - all modern browsers support
- [ ] **Flexbox** - full support in target browsers
- [ ] **Vendor prefixes** - add only if needed for critical features

---

# DELIVERABLES

## 1. File Structure

Create the following CSS files in the architecture structure:

```
3-MiniBalatro/
├── public/
│   └── assets/
│       └── styles/
│           ├── global.css          # Global variables, reset, utilities
│           └── animations.css      # Shared animation keyframes
└── src/
    └── views/
        └── components/
            ├── game-board/
            │   └── GameBoard.css
            ├── hand/
            │   └── Hand.css
            ├── card/
            │   └── CardComponent.css
            ├── joker-zone/
            │   └── JokerZone.css
            ├── tarot-zone/
            │   └── TarotZone.css
            ├── shop/
            │   └── ShopView.css
            ├── score-display/
            │   └── ScoreDisplay.css
            └── menu/
                └── MainMenu.css
```

## 2. global.css Content Structure

```css
/* ============================================
   MINI BALATRO - GLOBAL STYLES
   ============================================ */

/* === CSS CUSTOM PROPERTIES === */
:root {
  /* Color Palette - Background & Panels */
  --color-bg-primary: #1a1a2e;
  --color-bg-panel: #16213e;
  --color-border: #0f3460;
  --color-accent: #e94560;
  
  /* Color Palette - Text */
  --color-text-primary: #f1f1f1;
  --color-text-secondary: #a8a8a8;
  
  /* Color Palette - Suits */
  --color-suit-diamonds: #ff6b6b;
  --color-suit-hearts: #ee5a6f;
  --color-suit-spades: #4ecdc4;
  --color-suit-clubs: #95e1d3;
  
  /* Color Palette - Indicators */
  --color-chips: #f9ca24;
  --color-mult: #6c5ce7;
  --color-money: #00d2d3;
  --color-success: #2ecc71;
  --color-warning: #95a5a6;
  --color-error: #e74c3c;
  
  /* Typography */
  --font-family-primary: 'Inter', 'Roboto', sans-serif;
  --font-family-secondary: 'Playfair Display', 'Merriweather', serif;
  --font-family-mono: 'Courier New', monospace;
  
  /* Font Sizes */
  --font-size-h1: 3rem;        /* 48px */
  --font-size-h2: 2rem;        /* 32px */
  --font-size-h3: 1.5rem;      /* 24px */
  --font-size-body: 1rem;      /* 16px */
  --font-size-small: 0.875rem; /* 14px */
  --font-size-number: 1.25rem; /* 20px */
  
  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing System (8px base) */
  --spacing-xs: 0.5rem;   /* 8px */
  --spacing-sm: 1rem;     /* 16px */
  --spacing-md: 1.5rem;   /* 24px */
  --spacing-lg: 2rem;     /* 32px */
  --spacing-xl: 2.5rem;   /* 40px */
  --spacing-xxl: 3rem;    /* 48px */
  
  /* Component Sizes */
  --card-width: 100px;
  --card-height: 140px;
  --card-radius: 8px;
  --button-radius: 4px;
  --panel-radius: 8px;
  
  /* Shadows */
  --shadow-card: 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 8px 16px rgba(0, 0, 0, 0.4);
  --shadow-card-selected: 0 8px 24px rgba(233, 69, 96, 0.6);
  --shadow-panel: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-button: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-default: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  --transition-score: 400ms ease-out;
  
  /* Z-Index Layers */
  --z-base: 1;
  --z-card: 10;
  --z-card-hover: 20;
  --z-card-selected: 30;
  --z-panel: 50;
  --z-modal: 100;
  --z-tooltip: 200;
}

/* === CSS RESET / NORMALIZATION === */
/* Reset rules */

/* === BASE TYPOGRAPHY === */
/* Body, headings, paragraphs */

/* === LAYOUT UTILITIES === */
/* Flexbox helpers, grid helpers */

/* === SPACING UTILITIES === */
/* Margin/padding utility classes */

/* === TEXT UTILITIES === */
/* Text alignment, colors, weights */

/* === RESPONSIVE BREAKPOINTS === */
/* Media query mixins/helpers */
```

## 3. animations.css Content Structure

```css
/* ============================================
   MINI BALATRO - ANIMATIONS
   ============================================ */

/* === CARD ANIMATIONS === */
@keyframes cardDeal {
  /* Card dealing from deck animation */
}

@keyframes cardLift {
  /* Card lift on selection */
}

@keyframes cardFlip {
  /* Card flip animation */
}

/* === SCORE ANIMATIONS === */
@keyframes scoreIncrement {
  /* Counter increment animation */
}

@keyframes floatingNumber {
  /* Floating chip/mult indicators */
}

/* === GLOW/PULSE EFFECTS === */
@keyframes glowPulse {
  /* Glow effect for active jokers */
}

@keyframes borderPulse {
  /* Border pulse for special states */
}

/* === TRANSITION ANIMATIONS === */
@keyframes slideIn {
  /* Slide in from edge */
}

@keyframes fadeIn {
  /* Fade in for modals */
}

@keyframes slideUp {
  /* Slide up for panels */
}

/* === REDUCED MOTION VARIANTS === */
@media (prefers-reduced-motion: reduce) {
  /* Simplified animations for accessibility */
}
```

## 4. Component CSS Files Structure

Each component CSS file should follow this template:

```css
/* ============================================
   [COMPONENT NAME] - STYLES
   ============================================ */

/* === IMPORTS === */
/* Reference to global.css and animations.css via @import if needed */

/* === COMPONENT VARIABLES === */
/* Component-specific CSS custom properties */

/* === LAYOUT === */
/* Container structure, grid/flexbox */

/* === ELEMENTS === */
/* Individual element styling */

/* === STATES === */
/* .hover, .active, .disabled, .selected */

/* === ANIMATIONS === */
/* Component-specific animation usage */

/* === RESPONSIVE === */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

## 5. Documentation

### Implementation Notes:

**IMPORTANT: React Integration**
- These CSS files will be imported by corresponding `.tsx` React components
- Class names should follow BEM convention for React className props
- State-based classes (e.g., `.card--selected`) will be conditionally applied by React components
- No direct HTML modification - focus solely on styling existing class structure

**CSS Variable Usage:**
- All components should reference global CSS variables from `global.css`
- Use `var(--variable-name)` throughout component styles
- Override variables locally in component scope when needed

**Animation Performance:**
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Apply `will-change` property sparingly to frequently animated elements
- Consider `prefers-reduced-motion` for accessibility

**Responsive Design:**
- Start with mobile styles (default)
- Use `min-width` media queries for progressive enhancement
- Test at all three breakpoints: 320px, 768px, 1024px

**Browser Testing:**
- Verify in Chrome, Firefox, Safari, Edge (last 2 versions)
- Test CSS Grid and Flexbox layouts
- Validate CSS Custom Properties support

### Required Assets (for reference):

**Images:**
- Card suit symbols (SVG recommended): ♠ ♥ ♦ ♣
- Card face values: A, K, Q, J, 10-2
- Joker card backgrounds (gradient textures)
- Planet card backgrounds (starry patterns)
- Tarot card backgrounds (mystical designs)
- Boss blind artwork (5 unique boss visuals)

**Dimensions:**
- Playing cards: 100px × 140px (desktop), 80px × 112px (tablet), 60px × 84px (mobile)
- Shop cards: 120px × 180px
- Joker/Tarot cards: 90px × 126px
- Card suit symbols: 48px × 48px (centered on card)

**Icons:**
- Chips icon (golden coin)
- Mult icon (purple star/multiplier)
- Money icon (cyan dollar sign)
- Hand counter icon
- Discard counter icon
- Reroll icon (circular arrows)
- Source: Use icon library like Font Awesome or custom SVG icons

**Fonts:**
- Primary: 'Inter' from Google Fonts (`https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap`)
- Secondary: 'Playfair Display' from Google Fonts (`https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap`)

### Deployment Instructions:

**CSS Linking in React:**
1. Global styles (`global.css`, `animations.css`) imported in `main.tsx` or `App.tsx`
2. Component styles imported at the top of each `.tsx` file:
   ```typescript
   import './CardComponent.css';
   ```
3. Vite will handle CSS bundling and optimization for production

**Production Build:**
- Vite automatically minifies CSS in production build
- Source maps generated for debugging
- CSS files bundled and optimized with code splitting

**Testing CSS:**
1. Run `npm run dev` to start Vite dev server with hot reload
2. Verify styles apply correctly to React components
3. Test responsive breakpoints using browser dev tools
4. Validate with Lighthouse for performance and accessibility

## 6. Validation Checklist

### CSS Quality:
- [ ] All CSS files follow BEM naming convention
- [ ] CSS custom properties used throughout (no hardcoded values)
- [ ] Mobile-first media queries with `min-width`
- [ ] No `!important` declarations (except accessibility overrides)
- [ ] Proper specificity (avoid deep nesting >3 levels)
- [ ] Comments explain complex selectors and layouts

### Responsiveness:
- [ ] Styles work at 320px (mobile)
- [ ] Styles work at 768px (tablet)
- [ ] Styles work at 1024px+ (desktop)
- [ ] Touch targets minimum 44px on mobile
- [ ] Text remains readable at all viewport sizes

### Performance:
- [ ] Animations use `transform` and `opacity` only
- [ ] `will-change` applied to frequently animated elements
- [ ] No layout thrashing (minimize reflows)
- [ ] Efficient selectors (no universal selectors in hot paths)
- [ ] Lighthouse performance score target: >90

### Accessibility:
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- [ ] Focus styles visible on all interactive elements (2px outline)
- [ ] `prefers-reduced-motion` respected for animations
- [ ] Color not sole indicator (icons/text accompany color coding)
- [ ] Lighthouse accessibility score target: >90

### Browser Compatibility:
- [ ] CSS Grid layouts tested in modern browsers
- [ ] Flexbox layouts work correctly
- [ ] CSS Custom Properties render properly
- [ ] No vendor prefixes needed (targeting modern browsers only)

---

# OUTPUT FORMAT

Provide CSS code in clearly delimited code blocks organized by file:

```css
/* ============================================
   FILENAME: global.css
   ============================================ */

[CSS code here]
```

```css
/* ============================================
   FILENAME: animations.css
   ============================================ */

[CSS code here]
```

```css
/* ============================================
   FILENAME: GameBoard.css
   ============================================ */

[CSS code here]
```

[Continue for all CSS files...]

---

**Implementation Notes:**
- Import `global.css` and `animations.css` in `src/main.tsx` before any component imports
- Each component CSS file will be imported in its corresponding `.tsx` file
- Vite will handle CSS module bundling and optimization
- CSS custom properties enable easy theming and adjustments
- BEM naming ensures no class name conflicts between components

**Libraries/CDNs Used:**
- Google Fonts: Inter (`https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap`)
- Google Fonts: Playfair Display (`https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap`)
- No CSS frameworks - pure CSS with modern features
- No preprocessors - vanilla CSS with CSS Custom Properties

**Additional Customizations Suggested:**
- Consider adding dark/light theme toggle (CSS custom properties make this easy)
- Add custom scrollbar styling for immersive UI
- Implement subtle parallax background effect for depth
- Create custom tooltip component styling for card effect explanations
- Add win/loss screen with confetti animation (CSS-only particles)
- Implement card shuffle animation for deck visualization
- Add smooth number counter animation for score increments
- Consider adding accessibility mode with high contrast theme
- Implement boss blind special visual effects (screen tints, borders)
- Add loading spinner/skeleton screens for async operations
