# Color Management System

## Overview

The MiniBalatro project now uses a **centralized color management system** where all colors are defined in TypeScript and automatically applied to CSS custom properties.

## Single Source of Truth

**All colors are defined in:** `src/utils/constants.ts`

```typescript
export const COLORS = {
  // Theme Colors
  BG_PRIMARY: '#1a1a2e',
  BG_PANEL: '#16213e',
  BORDER: '#0f3460',
  ACCENT: '#e94560',
  
  // Text Colors
  TEXT_PRIMARY: '#f1f1f1',
  TEXT_SECONDARY: '#a8a8a8',
  
  // Suit Colors
  SUIT_DIAMONDS: '#e89230',
  SUIT_HEARTS: '#d62d46',
  SUIT_SPADES: '#061413',
  SUIT_CLUBS: '#3cc264',
  
  // Indicator Colors
  CHIPS: '#f9ca24',
  MULT: '#6c5ce7',
  MONEY: '#00d2d3',
  SUCCESS: '#2ecc71',
  WARNING: '#95a5a6',
  ERROR: '#e74c3c',
};
```

## How to Change Colors

### ✅ CORRECT Way (Edit One File)

1. Open `src/utils/constants.ts`
2. Find the color you want to change
3. Update the hex value
4. Save the file
5. Refresh the page

**Example:**
```typescript
// Change the accent color from red to blue
export const COLORS = {
  ACCENT: '#3498db',  // Changed from '#e94560'
  // ...
};
```

**Result:** All buttons, borders, highlights, etc. that use the accent color will now be blue!

### ❌ WRONG Way (Don't Do This)

Don't edit colors directly in CSS files:

```css
/* DON'T DO THIS! */
.button {
  background: #e94560;  /* ❌ Hardcoded */
}
```

Instead, use CSS variables:

```css
/* DO THIS! */
.button {
  background: var(--color-accent);  /* ✅ Uses centralized color */
}
```

## Using Colors in CSS

All colors are available as CSS custom properties with the `--color-*` prefix:

```css
.my-component {
  /* Background colors */
  background-color: var(--color-bg-primary);
  background: linear-gradient(var(--color-bg-primary), var(--color-bg-panel));
  
  /* Text colors */
  color: var(--color-text-primary);
  
  /* Border colors */
  border: 2px solid var(--color-border);
  
  /* Suit colors */
  color: var(--color-suit-hearts);
  
  /* Indicator colors */
  color: var(--color-chips);
  box-shadow: 0 0 10px var(--color-mult);
}
```

### Available CSS Variables

| TypeScript Constant | CSS Variable | Purpose |
|---------------------|--------------|---------|
| `COLORS.BG_PRIMARY` | `--color-bg-primary` | Main background |
| `COLORS.BG_PANEL` | `--color-bg-panel` | Panel backgrounds |
| `COLORS.BORDER` | `--color-border` | Border color |
| `COLORS.ACCENT` | `--color-accent` | Primary accent |
| `COLORS.TEXT_PRIMARY` | `--color-text-primary` | Main text color |
| `COLORS.TEXT_SECONDARY` | `--color-text-secondary` | Secondary text |
| `COLORS.SUIT_DIAMONDS` | `--color-suit-diamonds` | Diamond suit (♦) |
| `COLORS.SUIT_HEARTS` | `--color-suit-hearts` | Heart suit (♥) |
| `COLORS.SUIT_SPADES` | `--color-suit-spades` | Spade suit (♠) |
| `COLORS.SUIT_CLUBS` | `--color-suit-clubs` | Club suit (♣) |
| `COLORS.CHIPS` | `--color-chips` | Chip count display |
| `COLORS.MULT` | `--color-mult` | Multiplier display |
| `COLORS.MONEY` | `--color-money` | Money display |
| `COLORS.SUCCESS` | `--color-success` | Success states |
| `COLORS.WARNING` | `--color-warning` | Warning states |
| `COLORS.ERROR` | `--color-error` | Error states |

## Using Colors in TypeScript/React

For inline styles or programmatic color access:

```typescript
import { getColor } from '../utils/apply-theme';

// Inline styles
const MyComponent = () => {
  const style = {
    backgroundColor: getColor('BG_PANEL'),
    color: getColor('TEXT_PRIMARY'),
    borderColor: getColor('ACCENT'),
  };
  
  return <div style={style}>Content</div>;
};

// Canvas rendering
const drawCard = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = getColor('SUIT_HEARTS');
  ctx.fill();
};

// Conditional styling
const getScoreColor = (score: number, goal: number) => {
  return score >= goal ? getColor('SUCCESS') : getColor('WARNING');
};
```

### Reading CSS Variables

You can also read the current CSS variable values:

```typescript
import { getCSSVariable } from '../utils/apply-theme';

const currentAccent = getCSSVariable('color-accent');
console.log(currentAccent); // '#e94560'
```

## How It Works

### Architecture Flow

```
1. App starts (main.tsx)
         ↓
2. applyThemeColors() called
         ↓
3. Reads COLORS from constants.ts
         ↓
4. Injects into CSS variables (:root)
         ↓
5. CSS files use var(--color-*)
         ↓
6. All components styled consistently
```

### Code Flow

**main.tsx:**
```typescript
import { applyThemeColors } from './utils/apply-theme';

const initializeApp = () => {
  applyThemeColors();  // Inject colors BEFORE React renders
  // ... rest of initialization
};
```

**apply-theme.ts:**
```typescript
export function applyThemeColors(): void {
  const root = document.documentElement;
  
  root.style.setProperty('--color-bg-primary', COLORS.BG_PRIMARY);
  root.style.setProperty('--color-accent', COLORS.ACCENT);
  // ... etc for all colors
}
```

**Component CSS:**
```css
.component {
  background: var(--color-bg-primary);  /* Uses injected value */
  color: var(--color-text-primary);     /* Uses injected value */
}
```

## Benefits

### ✅ Advantages

1. **Single Source of Truth**
   - All colors in one place (`constants.ts`)
   - No duplication or inconsistency

2. **Easy Maintenance**
   - Change one value, updates entire app
   - No need to search through files

3. **Type Safety**
   - TypeScript knows available colors
   - Autocomplete in IDE

4. **Programmatic Access**
   - Can use colors in JavaScript logic
   - Can generate derived colors

5. **Consistency Guaranteed**
   - All components use same color scheme
   - Impossible to have mismatched colors

6. **Future Proof**
   - Easy to add theme switching
   - Can support user customization

### 📊 Before vs After

**Before (Disconnected):**
```
constants.ts: ACCENT: '#e94560'
global.css:   --color-accent: #ff0000  ❌ Different!
App.css:      background: #e94560      ❌ Hardcoded!
Button.css:   color: #e94560           ❌ Hardcoded!
```
*Problem: 4 different places to update, easy to miss one*

**After (Centralized):**
```
constants.ts:     ACCENT: '#e94560'    ← Single source of truth
↓ (automatically injected)
CSS everywhere:   var(--color-accent)  ← Uses centralized value
```
*Solution: 1 place to update, changes everywhere instantly*

## Migration Guide

### For New Components

Always use CSS variables:

```css
/* ✅ GOOD */
.new-component {
  background: var(--color-bg-panel);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* ❌ BAD */
.new-component {
  background: #16213e;
  color: #f1f1f1;
  border: 1px solid #0f3460;
}
```

### For Existing Components

Replace hardcoded colors with CSS variables:

**Before:**
```css
.old-component {
  background: #1a1a2e;
  color: #f1f1f1;
  border: 2px solid #0f3460;
}

.old-component__accent {
  color: #e94560;
}
```

**After:**
```css
.old-component {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
}

.old-component__accent {
  color: var(--color-accent);
}
```

## Common Patterns

### Gradient Backgrounds

```css
.card {
  background: linear-gradient(
    135deg,
    var(--color-bg-primary) 0%,
    var(--color-bg-panel) 100%
  );
}
```

### Semi-Transparent Colors

```css
.overlay {
  /* Use rgba() with hardcoded alpha, or use color-mix() in modern browsers */
  background: rgba(26, 26, 46, 0.8);  /* BG_PRIMARY with 80% opacity */
}

/* Modern approach (if supported) */
.overlay-modern {
  background: color-mix(in srgb, var(--color-bg-primary) 80%, transparent);
}
```

### Hover Effects

```css
.button {
  background: var(--color-accent);
  transition: opacity 0.2s;
}

.button:hover {
  opacity: 0.8;  /* Lighten by reducing opacity */
}
```

### Box Shadows with Theme Colors

```css
.card {
  box-shadow: 0 4px 8px rgba(108, 92, 231, 0.3);  /* MULT color with alpha */
}

.card--success {
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);  /* SUCCESS color with glow */
}
```

## Troubleshooting

### Colors Not Updating

1. Check if `applyThemeColors()` is called in `main.tsx`
2. Verify colors are defined in `constants.ts`
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check browser console for errors

### Wrong Colors Displayed

1. Check if CSS file uses `var(--color-*)` not hardcoded values
2. Inspect element in DevTools and check computed styles
3. Verify CSS variable name matches TypeScript constant

### TypeScript Errors

```typescript
// ❌ Wrong
const color = getColor('WRONG_NAME');  // Type error!

// ✅ Correct
const color = getColor('ACCENT');  // Autocomplete works!
```

## Best Practices

### ✅ DO

- Use CSS variables for all colors
- Edit colors only in `constants.ts`
- Use descriptive variable names
- Document color purpose in comments
- Test color changes across all screens

### ❌ DON'T

- Don't hardcode color hex values in CSS
- Don't edit colors in multiple files
- Don't use inline styles with hardcoded colors
- Don't forget to update constants.ts when adding new colors

## Examples

### Example 1: Themed Button Component

```css
.themed-button {
  background: var(--color-accent);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.2s;
}

.themed-button:hover {
  background: var(--color-border);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.themed-button--success {
  background: var(--color-success);
}

.themed-button--error {
  background: var(--color-error);
}
```

### Example 2: Card with Suit Colors

```typescript
import { getColor } from '../utils/apply-theme';

interface CardProps {
  suit: 'DIAMONDS' | 'HEARTS' | 'SPADES' | 'CLUBS';
}

const Card: React.FC<CardProps> = ({ suit }) => {
  const suitColor = getColor(`SUIT_${suit}` as keyof typeof COLORS);
  
  return (
    <div 
      className="card"
      style={{ color: suitColor }}
    >
      {/* Card content */}
    </div>
  );
};
```

### Example 3: Dynamic Theme (Future Enhancement)

```typescript
// Future: Theme switching capability
export const THEMES = {
  DARK: {
    BG_PRIMARY: '#1a1a2e',
    BG_PANEL: '#16213e',
    TEXT_PRIMARY: '#f1f1f1',
    // ... etc
  },
  LIGHT: {
    BG_PRIMARY: '#f5f5f5',
    BG_PANEL: '#ffffff',
    TEXT_PRIMARY: '#212121',
    // ... etc
  },
};

// Switch themes
function switchTheme(themeName: keyof typeof THEMES) {
  const theme = THEMES[themeName];
  applyTheme(theme);
}
```

## Summary

- **Edit colors:** Only in `src/utils/constants.ts`
- **Use in CSS:** `var(--color-name)`
- **Use in TypeScript:** `getColor('COLOR_NAME')`
- **Result:** Consistent, maintainable color scheme across the entire application!

For more information, see the implementation in:
- `src/utils/constants.ts` (color definitions)
- `src/utils/apply-theme.ts` (injection logic)
- `src/main.tsx` (initialization)
- `public/assets/styles/global.css` (CSS variable declarations)
