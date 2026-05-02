# CODE REVIEW REQUEST #12: `src/components/Controls.tsx`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/components/Controls.tsx`

**Component objective:** Pure presentational component that displays playback control buttons (Previous, Play/Pause, Next) and mode toggle buttons (Shuffle, Repeat). Handles user interactions by delegating to parent callbacks. Shows dynamic icons based on state (playing vs paused, repeat modes). Provides accessible buttons with proper ARIA labels and keyboard support.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR1-FR5:** Playback control
- Play button starts playback
- Pause button pauses playback
- Next button advances to next song
- Previous button goes to previous song
- Visual state reflects current playback (play/pause icon)

**FR20:** Visual state change in Play/Pause button
- Play icon (▶) when paused
- Pause icon (❚❚) when playing
- Icon changes instantly when state changes

**NEW: Repeat Mode Requirements:**
- Repeat button with three states (OFF, ALL, ONE)
- OFF: No highlight, 🔁 icon
- ALL: Highlighted, 🔁 icon
- ONE: Highlighted, 🔂 icon (or 🔁¹)
- Click cycles through modes

**NEW: Shuffle Mode Requirements:**
- Shuffle button with two states (OFF, ON)
- OFF: No highlight, 🔀 icon
- ON: Highlighted/blue, 🔀 icon
- Click toggles state

**UI Design Specifications:**
- **Previous button:** ◄ icon, 44x44px minimum
- **Play/Pause button:** Larger (56x56px), primary color background
- **Next button:** ► icon, 44x44px minimum
- **Shuffle/Repeat:** 44x44px minimum, highlight when active
- **Hover states:** Scale 1.1, color change
- **Disabled states:** Opacity 0.3, not-allowed cursor
- **Touch-friendly:** All buttons 44x44px minimum (accessibility)

**NFR3:** Modular code
- Pure presentational component
- No business logic
- All actions delegated to parent

**NFR6:** Intuitive and accessible interface
- ARIA labels for all buttons
- Keyboard support (Enter/Space)
- Focus visible indicators
- Touch-friendly sizes

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│      <<component>>                      │
│         Controls                        │
├─────────────────────────────────────────┤
│ + props: ControlsProps                  │
├─────────────────────────────────────────┤
│ + render(): JSX.Element                 │
└─────────────────────────────────────────┘
           │
           │ receives
           ▼
┌─────────────────────────────────────────┐
│        ControlsProps                    │
├─────────────────────────────────────────┤
│ + isPlaying: boolean                    │
│ + onPlayPause: () => void               │
│ + onNext: () => void                    │
│ + onPrevious: () => void                │
│ + disableNext?: boolean                 │
│ + disablePrevious?: boolean             │
│ + repeatMode: RepeatMode                │
│ + isShuffled: boolean                   │
│ + onRepeatToggle: () => void            │
│ + onShuffleToggle: () => void           │
└─────────────────────────────────────────┘

Used by:
- Player component (passes state and callbacks)
```

---

## CODE TO REVIEW

```typescript
(Referenced Code)
```

---

## EVALUATION CRITERIA

### 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**

**Component Type:**
- [ ] Functional component (React.FC or function)
- [ ] Pure presentational (no state, no hooks)
- [ ] Receives all data and callbacks via props
- [ ] No side effects

**Props Interface:**
- [ ] Interface named `ControlsProps`
- [ ] Property: `isPlaying: boolean`
- [ ] Property: `onPlayPause: () => void`
- [ ] Property: `onNext: () => void`
- [ ] Property: `onPrevious: () => void`
- [ ] Property: `disableNext?: boolean` (optional)
- [ ] Property: `disablePrevious?: boolean` (optional)
- [ ] Property: `repeatMode: RepeatMode`
- [ ] Property: `isShuffled: boolean`
- [ ] Property: `onRepeatToggle: () => void`
- [ ] Property: `onShuffleToggle: () => void`
- [ ] All required props present

**JSX Structure:**
- [ ] Container div with className
- [ ] Five buttons in logical order:
  1. Previous button (◄)
  2. Play/Pause button (▶/❚❚)
  3. Next button (►)
  4. Shuffle button (🔀)
  5. Repeat button (🔁/🔂)
- [ ] Buttons use semantic button elements
- [ ] Icons shown via Unicode or icon library

**Button Specifications:**
- [ ] All buttons have type="button"
- [ ] All buttons have onClick handlers
- [ ] All buttons have aria-label
- [ ] Disabled buttons have disabled attribute
- [ ] Play/Pause button visually larger/emphasized

**Implementation Approach:**
- [ ] No useState (stateless)
- [ ] No useEffect (no side effects)
- [ ] Simple callback delegation
- [ ] Returns JSX directly

**Score:** __/10

**Observations:**
- Are all 5 buttons present?
- Are props correctly typed?
- Is component truly pure?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **Component main:** Very low (1-3 cyclomatic complexity)
  - Prop destructuring
  - Conditional icon rendering (isPlaying ? pause : play)
  - Conditional repeat icon (repeatMode === ONE ? icon2 : icon1)
  - Return JSX
- [ ] Overall cyclomatic complexity < 5 (simple component)

**Performance:**
- [ ] No unnecessary re-renders
- [ ] No expensive computations
- [ ] Pure component behavior
- [ ] Could use React.memo (optional)

**Coupling:**
- [ ] Depends on React only
- [ ] Imports RepeatMode enum
- [ ] No other dependencies
- [ ] Self-contained presentation

**Cohesion:**
- [ ] High cohesion (all buttons control playback)
- [ ] Single responsibility (playback controls UI)
- [ ] All parts work together

**Code Smells:**
- [ ] Check for: Unnecessary complexity (should be very simple)
- [ ] Check for: Code Duplication (button structure repeated - acceptable)
- [ ] Check for: Long Method (should be <80 lines)
- [ ] Check for: Magic Strings (icon characters could be constants)
- [ ] Check for: Inline event handlers (simple cases are fine)

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**Core Playback Buttons:**
- [ ] **AC1:** Previous button calls onPrevious when clicked
- [ ] **AC2:** Play/Pause button calls onPlayPause when clicked
- [ ] **AC3:** Next button calls onNext when clicked
- [ ] **AC4:** Play/Pause shows ▶ icon when isPlaying is false
- [ ] **AC5:** Play/Pause shows ❚❚ icon when isPlaying is true
- [ ] **AC6:** Icon changes instantly when isPlaying prop changes

**Button Disabled States:**
- [ ] **AC7:** Previous button disabled when disablePrevious is true
- [ ] **AC8:** Next button disabled when disableNext is true
- [ ] **AC9:** Disabled buttons have disabled attribute
- [ ] **AC10:** Disabled buttons have visual disabled state (CSS)

**Shuffle Button:**
- [ ] **AC11:** Shuffle button shows 🔀 icon
- [ ] **AC12:** Shuffle button calls onShuffleToggle when clicked
- [ ] **AC13:** Shuffle button highlighted when isShuffled is true
- [ ] **AC14:** Shuffle button normal when isShuffled is false
- [ ] **AC15:** Visual indicator clear (color/background change)

**Repeat Button:**
- [ ] **AC16:** Repeat button calls onRepeatToggle when clicked
- [ ] **AC17:** Repeat button shows 🔁 icon when repeatMode is OFF or ALL
- [ ] **AC18:** Repeat button shows 🔂 icon when repeatMode is ONE
- [ ] **AC19:** Repeat button highlighted when repeatMode is ALL or ONE
- [ ] **AC20:** Repeat button normal when repeatMode is OFF
- [ ] **AC21:** Visual indicator clear for all three states

**Accessibility:**
- [ ] **AC22:** All buttons have descriptive aria-label
- [ ] **AC23:** Play/Pause aria-label is dynamic ("Play" or "Pause")
- [ ] **AC24:** Shuffle aria-label dynamic ("Enable shuffle" or "Disable shuffle")
- [ ] **AC25:** Repeat aria-label dynamic (describes current mode)
- [ ] **AC26:** All buttons keyboard accessible (Tab navigation)
- [ ] **AC27:** Enter/Space triggers button click (browser default)
- [ ] **AC28:** Focus visible on all buttons
- [ ] **AC29:** Touch target size ≥ 44x44px for all buttons

**Layout and Styling (via CSS):**
- [ ] **AC30:** Buttons arranged horizontally
- [ ] **AC31:** Play/Pause button larger/emphasized
- [ ] **AC32:** Consistent spacing between buttons
- [ ] **AC33:** Hover states on all enabled buttons
- [ ] **AC34:** Active state visual feedback

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|-------------------|----------|
| Callback undefined | TypeScript prevents, or no-op | [ ] |
| isPlaying undefined | Defaults to false (show play) | [ ] |
| repeatMode undefined | Component doesn't crash | [ ] |
| Rapid button clicks | All clicks handled | [ ] |
| Disabled + clicked | onClick not fired (browser default) | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Component JSDoc:**
- [ ] Description of component purpose
- [ ] Note about pure presentational nature
- [ ] List of all buttons
- [ ] `@param props` or props interface documentation
- [ ] `@returns` JSX.Element
- [ ] `@example` showing usage with all props

**Props Interface JSDoc:**
- [ ] Description of interface
- [ ] Each property documented:
  - isPlaying - Current playback state
  - onPlayPause - Play/pause callback
  - onNext/onPrevious - Navigation callbacks
  - repeatMode - Current repeat mode
  - isShuffled - Shuffle state
  - onRepeatToggle/onShuffleToggle - Mode callbacks

**Code Clarity:**
- [ ] Prop destructuring makes code readable
- [ ] JSX structure is clear
- [ ] Icon selection logic is clear
- [ ] CSS class names are descriptive
- [ ] Button order makes sense

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Only displays control buttons ✓
- [ ] **Open/Closed:** Easy to add more buttons ✓

**React Best Practices:**
- [ ] Pure component (no side effects)
- [ ] Props are immutable
- [ ] Functional component (modern React)
- [ ] No unnecessary state
- [ ] Simple callback delegation

**Component Design Best Practices:**
- [ ] Presentational component pattern
- [ ] No business logic
- [ ] Testable (pure function of props)
- [ ] Reusable
- [ ] Single source of truth (props)

**TypeScript Best Practices:**
- [ ] Props interface defined
- [ ] RepeatMode enum imported correctly
- [ ] Explicit component typing
- [ ] No `any` types
- [ ] Proper callback types

**Accessibility Best Practices:**
- [ ] Semantic HTML (button elements)
- [ ] ARIA labels on all buttons
- [ ] Dynamic ARIA labels (play vs pause)
- [ ] Keyboard accessible
- [ ] Touch-friendly sizes
- [ ] Focus indicators

**Icon Strategy:**
- [ ] Unicode characters (simple, no dependencies) OR
- [ ] Icon library (React Icons, FontAwesome) OR
- [ ] SVG icons (scalable, customizable)
- [ ] Consistent approach throughout

**Code Style:**
- [ ] Follows Google TypeScript Style Guide
- [ ] Consistent formatting
- [ ] Named exports

**Score:** __/10

**Issues found:**

---

## DELIVERABLES

### Review Report:

**Total Score:** __/10 (weighted average)

**Calculation:**
```
Total = (Design × 0.30) + (Quality × 0.25) + (Requirements × 0.25) + (Maintainability × 0.10) + (Best Practices × 0.10)
```

---

### Executive Summary:

[Provide 2-3 lines about the general state of the code. Examples:]
- "Complete control panel with all 5 required buttons. Dynamic icons based on state. Proper ARIA labels and accessibility. Shuffle and Repeat buttons correctly highlight active states. Clean, pure presentational component. Ready for production."
- "Core playback buttons work but Shuffle and Repeat buttons missing. Play/Pause icon changes correctly. Missing some accessibility attributes. Needs shuffle/repeat implementation."
- "Critical: Missing ControlsProps interface. No Shuffle or Repeat buttons. ARIA labels missing. Buttons not disabled correctly. Major refactoring needed."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. Missing Shuffle and Repeat buttons - Component JSX
   - Current: Only Previous, Play/Pause, Next buttons
   - Expected: All 5 buttons including Shuffle and Repeat
   - Impact: New feature requirements not met, incomplete UI
   - Proposed solution: Add buttons after Next:
     <button onClick={onShuffleToggle} className={...}>🔀</button>
     <button onClick={onRepeatToggle} className={...}>
       {repeatMode === RepeatMode.ONE ? '🔂' : '🔁'}
     </button>

2. Missing props for new features - ControlsProps interface
   - Current: Only playback props
   - Expected: repeatMode, isShuffled, onRepeatToggle, onShuffleToggle
   - Impact: Can't display or control shuffle/repeat
   - Proposed solution: Add to interface:
     repeatMode: RepeatMode;
     isShuffled: boolean;
     onRepeatToggle: () => void;
     onShuffleToggle: () => void;

3. No ARIA labels on buttons - All button elements
   - Impact: Screen readers can't describe button purpose
   - Proposed solution: Add aria-label to each button:
     <button aria-label="Previous song" onClick={onPrevious}>◄</button>
     <button aria-label={isPlaying ? "Pause" : "Play"} onClick={onPlayPause}>
       {isPlaying ? '❚❚' : '▶'}
     </button>

4. Disabled state not applied - Previous/Next buttons
   - Current: disableNext/disablePrevious props ignored
   - Impact: Buttons clickable when they shouldn't be
   - Proposed solution: Add disabled attribute:
     <button disabled={disablePrevious} onClick={onPrevious}>◄</button>
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. Icon characters hardcoded inline - JSX
   - Suggestion: Extract to constants:
     const ICONS = {
       PREVIOUS: '◄',
       PLAY: '▶',
       PAUSE: '❚❚',
       NEXT: '►',
       SHUFFLE: '🔀',
       REPEAT_ALL: '🔁',
       REPEAT_ONE: '🔂'
     };
   - Benefit: Easier to change icons, centralized

2. No React.memo optimization - Component definition
   - Suggestion: Wrap in React.memo to prevent re-renders
   - Benefit: Performance optimization

3. Repeat mode logic could be extracted - JSX
   - Current: Inline ternary for icon
   - Suggestion: Extract to function:
     const getRepeatIcon = () => {
       return repeatMode === RepeatMode.ONE ? '🔂' : '🔁';
     };
   - Benefit: Clearer, easier to test

4. Active state CSS class could be more semantic - Shuffle/Repeat buttons
   - Current: controls__button--active
   - Suggestion: Use more specific classes:
     controls__button--shuffle-active
     controls__button--repeat-active
   - Benefit: More specific styling control

5. Missing title attributes for tooltips - All buttons
   - Suggestion: Add title for hover tooltips:
     <button title="Previous song" aria-label="Previous song">
   - Benefit: Visual feedback on hover

6. Button types not explicit - Some buttons
   - Suggestion: Ensure all buttons have type="button":
     <button type="button" onClick={...}>
   - Benefit: Prevents form submission if ever in a form
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All 5 required buttons present (Previous, Play/Pause, Next, Shuffle, Repeat)
- ✅ Dynamic icons based on state (play/pause, repeat modes)
- ✅ Proper callback delegation to parent
- ✅ Type-safe props interface
- ✅ ARIA labels on all buttons
- ✅ Disabled state handling for navigation buttons
- ✅ Active state highlighting for mode buttons
- ✅ Clean, pure presentational component
- ✅ Touch-friendly button sizes
- ✅ Keyboard accessible

---

### Recommended Refactorings:

**REFACTORING 1: Complete component with all 5 buttons**

```typescript
// COMPLETE IMPLEMENTATION
import React from 'react';
import { RepeatMode } from '@types/playback-modes';
import './Controls.css';

/**
 * Playback control buttons with mode toggles.
 * 
 * Displays five buttons:
 * - Previous: Navigate to previous song
 * - Play/Pause: Toggle playback
 * - Next: Navigate to next song
 * - Shuffle: Toggle shuffle mode
 * - Repeat: Cycle through repeat modes
 * 
 * Pure presentational component that delegates all actions to parent.
 * 
 * @param props - Control state and callbacks
 * @returns JSX element with control buttons
 * 
 * @example
 * <Controls
 *   isPlaying={true}
 *   onPlayPause={() => player.togglePlay()}
 *   onNext={() => playlist.next()}
 *   onPrevious={() => playlist.previous()}
 *   repeatMode={RepeatMode.ALL}
 *   isShuffled={false}
 *   onRepeatToggle={() => playlist.cycleRepeat()}
 *   onShuffleToggle={() => playlist.toggleShuffle()}
 *   disableNext={false}
 *   disablePrevious={false}
 * />
 */
interface ControlsProps {
  /** Current playback state (true = playing) */
  isPlaying: boolean;
  /** Callback to toggle play/pause */
  onPlayPause: () => void;
  /** Callback to go to next song */
  onNext: () => void;
  /** Callback to go to previous song */
  onPrevious: () => void;
  /** Disable next button (at end with Repeat OFF) */
  disableNext?: boolean;
  /** Disable previous button (at start with Repeat OFF) */
  disablePrevious?: boolean;
  /** Current repeat mode */
  repeatMode: RepeatMode;
  /** Whether shuffle is enabled */
  isShuffled: boolean;
  /** Callback to cycle repeat modes */
  onRepeatToggle: () => void;
  /** Callback to toggle shuffle */
  onShuffleToggle: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  disableNext = false,
  disablePrevious = false,
  repeatMode,
  isShuffled,
  onRepeatToggle,
  onShuffleToggle
}) => {
  return (
    <div className="controls">
      {/* Previous button */}
      <button
        type="button"
        className="controls__button controls__button--previous"
        onClick={onPrevious}
        disabled={disablePrevious}
        aria-label="Previous song"
        title="Previous"
      >
        ◄
      </button>

      {/* Play/Pause button */}
      <button
        type="button"
        className="controls__button controls__button--play-pause"
        onClick={onPlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>

      {/* Next button */}
      <button
        type="button"
        className="controls__button controls__button--next"
        onClick={onNext}
        disabled={disableNext}
        aria-label="Next song"
        title="Next"
      >
        ►
      </button>

      {/* Shuffle button */}
      <button
        type="button"
        className={`controls__button controls__button--shuffle ${
          isShuffled ? 'controls__button--active' : ''
        }`}
        onClick={onShuffleToggle}
        aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
        aria-pressed={isShuffled}
        title="Shuffle"
      >
        🔀
      </button>

      {/* Repeat button */}
      <button
        type="button"
        className={`controls__button controls__button--repeat ${
          repeatMode !== RepeatMode.OFF ? 'controls__button--active' : ''
        }`}
        onClick={onRepeatToggle}
        aria-label={`Repeat: ${repeatMode}`}
        aria-pressed={repeatMode !== RepeatMode.OFF}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === RepeatMode.ONE ? '🔂' : '🔁'}
      </button>
    </div>
  );
};
```

**Reason:** Complete implementation with all buttons, proper accessibility, dynamic states.

---

**REFACTORING 2: Companion CSS file**

```css
/* Controls.css */

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) 0;
}

.controls__button {
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  min-width: 44px; /* Touch target */
  min-height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  user-select: none;
}

.controls__button:hover:not(:disabled) {
  transform: scale(1.1);
  color: var(--color-primary);
}

.controls__button:active:not(:disabled) {
  transform: scale(0.95);
}

.controls__button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.controls__button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Play/Pause button - larger and emphasized */
.controls__button--play-pause {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  background-color: var(--color-primary);
  color: white;
  font-size: 1.75rem;
  box-shadow: var(--shadow-md);
}

.controls__button--play-pause:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: scale(1.15);
  box-shadow: var(--shadow-lg);
}

/* Active state for Shuffle and Repeat */
.controls__button--active {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

.controls__button--shuffle,
.controls__button--repeat {
  font-size: 1.25rem;
}

/* Mobile: smaller buttons, tighter spacing */
@media (max-width: 767px) {
  .controls {
    gap: var(--spacing-sm);
  }
  
  .controls__button {
    width: 40px;
    height: 40px;
    min-width: 44px; /* Keep minimum touch target */
    min-height: 44px;
    font-size: 1.25rem;
  }
  
  .controls__button--play-pause {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    font-size: 1.5rem;
  }
}
```

**Reason:** Complete responsive styles, proper sizing, hover states, accessibility focus.

---

**REFACTORING 3: Extract icon constants (optional)**

```typescript
// At top of file
const ICONS = {
  PREVIOUS: '◄',
  PLAY: '▶',
  PAUSE: '❚❚',
  NEXT: '►',
  SHUFFLE: '🔀',
  REPEAT_ALL: '🔁',
  REPEAT_ONE: '🔂'
} as const;

// In component
<button ...>
  {isPlaying ? ICONS.PAUSE : ICONS.PLAY}
</button>

<button ...>
  {repeatMode === RepeatMode.ONE ? ICONS.REPEAT_ONE : ICONS.REPEAT_ALL}
</button>
```

**Reason:** Centralized icons, easier to swap for icon library later, DRY principle.

---

**REFACTORING 4: Add React.memo optimization**

```typescript
export const Controls = React.memo<ControlsProps>(
  ({
    isPlaying,
    onPlayPause,
    onNext,
    onPrevious,
    disableNext = false,
    disablePrevious = false,
    repeatMode,
    isShuffled,
    onRepeatToggle,
    onShuffleToggle
  }) => {
    // ... implementation
  }
);
```

**Reason:** Performance optimization, prevents re-renders when props unchanged.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All 5 buttons present and working
  - Dynamic icons based on state
  - Proper accessibility
  - Shuffle and Repeat modes integrated
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: could extract icons, missing React.memo
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: missing Shuffle/Repeat buttons, no ARIA labels
  - Accessibility issues
  - Must fix before Player can use this

---

**Specific actions for developer:**
[Provide clear, actionable steps. Examples:]
- "Add Shuffle and Repeat buttons to JSX after Next button"
- "Add repeatMode, isShuffled, onRepeatToggle, onShuffleToggle to props interface"
- "Add aria-label to all buttons with dynamic labels for Play/Pause"
- "Add disabled attribute to Previous/Next buttons based on props"
- "Add aria-pressed to Shuffle and Repeat buttons"
- "Implement conditional CSS class for active state on mode buttons"
- "Create companion CSS file with all button styles"
- "Add comprehensive JSDoc with examples"
- "Extract icon constants for maintainability"

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This component was updated to include new features (Shuffle, Repeat)
- Original had 3 buttons, now has 5 buttons
- Pure presentational, all logic in parent (Player)
- Accessibility is critical (keyboard users, screen readers)

**Dependencies:**
- Depends on: React, RepeatMode enum
- Used by: Player component

**What to Look For:**
- **All 5 buttons present** (Previous, Play/Pause, Next, Shuffle, Repeat)
- **Dynamic icons** (play/pause change, repeat ONE vs ALL)
- **Active state highlighting** (Shuffle ON, Repeat ALL/ONE)
- **ARIA labels** on all buttons (especially dynamic ones)
- **Disabled state** properly applied
- **Callback delegation** (no logic in component)

**Common Mistakes to Watch For:**
- Only 3 buttons (missing Shuffle/Repeat)
- Static Play/Pause icon (doesn't change with isPlaying)
- No ARIA labels or poor accessibility
- Disabled props ignored
- Active state not highlighted visually
- Repeat ONE doesn't show different icon
- Callbacks not typed correctly
- Missing aria-pressed on toggle buttons

**Testing Checklist:**
```typescript
// Test rendering
render(
  <Controls
    isPlaying={false}
    onPlayPause={jest.fn()}
    onNext={jest.fn()}
    onPrevious={jest.fn()}
    repeatMode={RepeatMode.OFF}
    isShuffled={false}
    onRepeatToggle={jest.fn()}
    onShuffleToggle={jest.fn()}
  />
);

// Verify 5 buttons present
expect(screen.getAllByRole('button')).toHaveLength(5);

// Test Play/Pause icon
expect(screen.getByLabelText('Play')).toHaveTextContent('▶');

// Test disabled state
const { rerender } = render(<Controls ... disablePrevious={true} />);
expect(screen.getByLabelText('Previous song')).toBeDisabled();

// Test callback firing
fireEvent.click(screen.getByLabelText('Play'));
expect(onPlayPause).toHaveBeenCalled();

// Test dynamic states
rerender(<Controls ... isPlaying={true} />);
expect(screen.getByLabelText('Pause')).toHaveTextContent('❚❚');

rerender(<Controls ... repeatMode={RepeatMode.ONE} />);
expect(screen.getByLabelText(/Repeat/)).toHaveTextContent('🔂');

rerender(<Controls ... isShuffled={true} />);
expect(screen.getByLabelText(/shuffle/)).toHaveClass('controls__button--active');
```

**Accessibility Checklist:**
- [ ] All buttons have aria-label
- [ ] Play/Pause aria-label is dynamic
- [ ] Shuffle/Repeat have aria-pressed
- [ ] All buttons keyboard accessible
- [ ] Focus visible on all buttons
- [ ] Touch targets ≥ 44x44px
- [ ] Disabled state announced
