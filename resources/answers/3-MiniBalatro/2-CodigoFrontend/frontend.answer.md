# Respuesta

## 2.2. Respuesta {toggle="true"}
Here are the complete CSS styles for your Mini Balatro web application, organized by file as requested. Each file is self-contained and follows the specified structure, using CSS custom properties, BEM naming, and a mobile-first approach.
```css
/* ============================================
   FILENAME: global.css
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

  /* Special Card Backgrounds */
  --color-joker-start: #6c5ce7;
  --color-joker-end: #f9ca24;
  --color-planet-bg: #0f3460;
  --color-planet-accent: #4ecdc4;
  --color-tarot-bg: #16213e;
  --color-tarot-border: #e94560;

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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family-primary);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* === BASE TYPOGRAPHY === */
h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin: 0 0 var(--spacing-sm) 0;
}

h1 {
  font-size: var(--font-size-h1);
}

h2 {
  font-size: var(--font-size-h2);
}

h3 {
  font-size: var(--font-size-h3);
}

p {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
}

a {
  color: var(--color-accent);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-chips);
}

/* === LAYOUT UTILITIES === */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.flex {
  display: flex;
}

.flex--column {
  flex-direction: column;
}

.flex--center {
  justify-content: center;
  align-items: center;
}

.flex--space-between {
  justify-content: space-between;
}

.flex--wrap {
  flex-wrap: wrap;
}

.grid {
  display: grid;
}

.grid--center {
  place-items: center;
}

/* === SPACING UTILITIES === */
.margin-xs { margin: var(--spacing-xs); }
.margin-sm { margin: var(--spacing-sm); }
.margin-md { margin: var(--spacing-md); }
.margin-lg { margin: var(--spacing-lg); }
.margin-xl { margin: var(--spacing-xl); }

.padding-xs { padding: var(--spacing-xs); }
.padding-sm { padding: var(--spacing-sm); }
.padding-md { padding: var(--spacing-md); }
.padding-lg { padding: var(--spacing-lg); }
.padding-xl { padding: var(--spacing-xl); }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* === TEXT UTILITIES === */
.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-accent { color: var(--color-accent); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }

.font-regular { font-weight: var(--font-weight-regular); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }

.font-mono {
  font-family: var(--font-family-mono);
}

/* === RESPONSIVE BREAKPOINTS === */
@media (min-width: 768px) {
  :root {
    --card-width: 90px;
    --card-height: 126px;
  }
}

@media (min-width: 1024px) {
  :root {
    --card-width: 100px;
    --card-height: 140px;
  }
}

```
```css
/* ============================================
   FILENAME: animations.css
   ============================================ */

/* === CARD ANIMATIONS === */
@keyframes cardDeal {
  0% {
    transform: translateY(-100px) rotate(-10deg);
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
}

@keyframes cardLift {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-20px) scale(1.02);
  }
}

@keyframes cardFlip {
  0% {
    transform: rotateY(0);
  }
  100% {
    transform: rotateY(180deg);
  }
}

/* === SCORE ANIMATIONS === */
@keyframes scoreIncrement {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}

@keyframes floatingNumber {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px) scale(1.5);
    opacity: 0;
  }
}

/* === GLOW/PULSE EFFECTS === */
@keyframes glowPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(233, 69, 96, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(233, 69, 96, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(233, 69, 96, 0);
  }
}

@keyframes borderPulse {
  0% {
    border-color: var(--color-accent);
  }
  50% {
    border-color: var(--color-chips);
  }
  100% {
    border-color: var(--color-accent);
  }
}

/* === TRANSITION ANIMATIONS === */
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* === REDUCED MOTION VARIANTS === */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

```
```css
/* ============================================
   FILENAME: GameBoard.css
   ============================================ */

/* === LAYOUT === */
.game-board {
  display: grid;
  grid-template-rows: auto auto 1fr auto auto;
  gap: var(--spacing-md);
  height: 100vh;
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  overflow: hidden;
}

.game-board__top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.game-board__level-info {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}

.game-board__money,
.game-board__round {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-number);
  color: var(--color-money);
}

.game-board__joker-zone,
.game-board__tarot-zone {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.game-board__main-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow-y: auto;
}

.game-board__hand-area {
  min-height: var(--card-height);
}

.game-board__score-preview {
  padding: var(--spacing-sm);
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.game-board__actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.game-board__counters {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

/* === RESPONSIVE === */
@media (min-width: 768px) {
  .game-board {
    grid-template-rows: auto auto auto 1fr auto;
  }

  .game-board__joker-zone,
  .game-board__tarot-zone {
    flex-direction: row;
  }
}

@media (min-width: 1024px) {
  .game-board {
    padding: var(--spacing-lg);
  }
}

```
```css
/* ============================================
   FILENAME: Hand.css
   ============================================ */

/* === LAYOUT === */
.hand {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  padding: var(--spacing-sm);
  min-height: calc(var(--card-height) + 2 * var(--spacing-sm));
}

.hand__card {
  position: relative;
  width: var(--card-width);
  height: var(--card-height);
  transition: transform var(--transition-default), box-shadow var(--transition-default);
  z-index: var(--z-card);
  cursor: pointer;
}

.hand__card--selected {
  transform: translateY(-20px);
  box-shadow: var(--shadow-card-selected);
  z-index: var(--z-card-selected);
}

.hand__card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hand__selection-indicator {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 12px solid var(--color-accent);
}

/* === RESPONSIVE === */
@media (min-width: 768px) {
  .hand {
    justify-content: flex-start;
  }
}

```
```css
/* ============================================
   FILENAME: CardComponent.css
   ============================================ */

/* === ELEMENTS === */
.card {
  position: relative;
  width: var(--card-width);
  height: var(--card-height);
  background-color: white;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-bold);
  user-select: none;
  will-change: transform;
}

.card__value {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  font-size: var(--font-size-h3);
}

.card__suit {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  font-size: var(--font-size-h2);
}

.card__center-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.card--diamonds .card__value,
.card--diamonds .card__suit,
.card--diamonds .card__center-icon {
  color: var(--color-suit-diamonds);
}

.card--hearts .card__value,
.card--hearts .card__suit,
.card--hearts .card__center-icon {
  color: var(--color-suit-hearts);
}

.card--spades .card__value,
.card--spades .card__suit,
.card--spades .card__center-icon {
  color: var(--color-suit-spades);
}

.card--clubs .card__value,
.card--clubs .card__suit,
.card--clubs .card__center-icon {
  color: var(--color-suit-clubs);
}

/* Special Cards */
.card--joker {
  background: linear-gradient(135deg, var(--color-joker-start), var(--color-joker-end));
  color: white;
  border: 2px solid gold;
}

.card--planet {
  background-color: var(--color-planet-bg);
  border: 2px solid var(--color-planet-accent);
  color: var(--color-planet-accent);
}

.card--tarot {
  background-color: var(--color-tarot-bg);
  border: 2px solid var(--color-tarot-border);
  color: var(--color-tarot-border);
}

/* === STATES === */
.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
  z-index: var(--z-card-hover);
}

.card:active {
  transform: scale(0.98);
}

.card--selected {
  animation: glowPulse 2s infinite;
}

/* === ANIMATIONS === */
.card--dealing {
  animation: cardDeal 0.5s ease-out forwards;
}

.card--flipping {
  animation: cardFlip 0.6s ease-in-out forwards;
}

```
```css
/* ============================================
   FILENAME: JokerZone.css
   ============================================ */

/* === LAYOUT === */
.joker-zone {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.joker-zone__slot {
  position: relative;
  width: calc(var(--card-width) * 0.9);
  height: calc(var(--card-height) * 0.9);
  border: 2px dashed var(--color-border);
  border-radius: var(--card-radius);
  background-color: rgba(0, 0, 0, 0.2);
}

.joker-zone__slot--filled {
  border: none;
  background-color: transparent;
}

.joker-zone__card {
  width: 100%;
  height: 100%;
  animation: cardDeal 0.5s ease-out;
}

.joker-zone__priority {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 20px;
  height: 20px;
  background-color: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
}

/* === RESPONSIVE === */
@media (min-width: 768px) {
  .joker-zone {
    justify-content: flex-start;
  }
}

```
```css
/* ============================================
   FILENAME: TarotZone.css
   ============================================ */

/* === LAYOUT === */
.tarot-zone {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.tarot-zone__slot {
  position: relative;
  width: calc(var(--card-width) * 0.9);
  height: calc(var(--card-height) * 0.9);
  border: 2px dashed var(--color-tarot-border);
  border-radius: var(--card-radius);
  background-color: rgba(233, 69, 96, 0.1);
}

.tarot-zone__slot--filled {
  border: none;
  background-color: transparent;
}

.tarot-zone__card {
  width: 100%;
  height: 100%;
}

.tarot-zone__use-button {
  position: absolute;
  bottom: var(--spacing-xs);
  right: var(--spacing-xs);
  padding: var(--spacing-xs);
  background-color: var(--color-tarot-border);
  color: white;
  border: none;
  border-radius: var(--button-radius);
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: background-color var(--transition-fast);
}

.tarot-zone__use-button:hover {
  background-color: var(--color-accent);
}

/* === RESPONSIVE === */
@media (min-width: 768px) {
  .tarot-zone {
    justify-content: flex-start;
  }
}

```
```css
/* ============================================
   FILENAME: ShopView.css
   ============================================ */

/* === LAYOUT === */
.shop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-md);
}

.shop__container {
  width: 100%;
  max-width: 800px;
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  padding: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease-out;
}

.shop__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.shop__title {
  font-size: var(--font-size-h2);
}

.shop__money {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-number);
  color: var(--color-money);
}

.shop__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.shop__item {
  position: relative;
  background-color: var(--color-bg-primary);
  border-radius: var(--card-radius);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-default);
}

.shop__item:hover {
  transform: translateY(-5px);
}

.shop__item--affordable {
  border: 2px solid var(--color-success);
}

.shop__item--unaffordable {
  opacity: 0.6;
  cursor: not-allowed;
}

.shop__item-card {
  width: 100%;
  height: 180px;
  margin-bottom: var(--spacing-sm);
}

.shop__item-price {
  position: absolute;
  bottom: calc(var(--spacing-sm) + 2px);
  right: var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--color-money);
  padding: var(--spacing-xs);
  border-radius: var(--button-radius);
  font-family: var(--font-family-mono);
}

.shop__actions {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.shop__reroll,
.shop__continue {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--button-radius);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  transition: background-color var(--transition-fast);
}

.shop__reroll {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.shop__continue {
  background-color: var(--color-success);
  color: white;
}

/* === RESPONSIVE === */
@media (min-width: 768px) {
  .shop__items {
    grid-template-columns: repeat(4, 1fr);
  }
}

```
```css
/* ============================================
   FILENAME: ScoreDisplay.css
   ============================================ */

/* === LAYOUT === */
.score-display {
  padding: var(--spacing-sm);
  background-color: var(--color-bg-panel);
  border-radius: var(--panel-radius);
  box-shadow: var(--shadow-panel);
}

.score-display__goal {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.score-display__goal-label {
  color: var(--color-text-secondary);
}

.score-display__goal-value {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-number);
}

.score-display__progress-container {
  height: 8px;
  background-color: var(--color-bg-primary);
  border-radius: 4px;
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
}

.score-display__progress-bar {
  height: 100%;
  background-color: var(--color-success);
  transition: width var(--transition-slow);
}

.score-display__preview {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-family-mono);
}

.score-display__chips {
  color: var(--color-chips);
}

.score-display__mult {
  color: var(--color-mult);
}

.score-display__total {
  font-weight: var(--font-weight-bold);
}

/* === ANIMATIONS === */
.score-display__floating-number {
  position: absolute;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-small);
  animation: floatingNumber 1s ease-out forwards;
}

```
```css
/* ============================================
   FILENAME: MainMenu.css
   ============================================ */

/* === LAYOUT === */
.main-menu {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  text-align: center;
  background-color: var(--color-bg-primary);
}

.main-menu__title {
  font-family: var(--font-family-secondary);
  font-size: var(--font-size-h1);
  margin-bottom: var(--spacing-xxl);
  background: linear-gradient(to right, var(--color-chips), var(--color-mult));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.main-menu__buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 300px;
}

.main-menu__button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-panel);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--button-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.main-menu__button:hover {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.main-menu__button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.main-menu__footer {
  margin-top: auto;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

/* === RESPONSIVE === */
@media (min-width: 768px) {
  .main-menu__buttons {
    max-width: 400px;
  }
}

```
Next Steps:
Import these CSS files into your React components as described in the architecture.<br>Test responsiveness and animations at all breakpoints.<br>Validate accessibility and performance with Lighthouse.<br>Customize or extend styles as needed for additional features or visual polish.