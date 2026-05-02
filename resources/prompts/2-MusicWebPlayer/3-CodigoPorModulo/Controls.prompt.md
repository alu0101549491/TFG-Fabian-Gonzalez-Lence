Perfect! Let's move to **Module #12: `src/components/Controls.tsx`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Components Layer - Presentational Components (Playback Controls)

---

# PROJECT FILE STRUCTURE REMINDER

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← COMPLETED
│   │   ├── playback-error.ts          ← COMPLETED
│   │   └── validation.ts              ← COMPLETED
│   ├── components/
│   │   ├── Player.tsx
│   │   ├── TrackInfo.tsx              ← COMPLETED
│   │   ├── Controls.tsx               ← CURRENT MODULE
│   │   ├── ProgressBar.tsx
│   │   ├── Playlist.tsx
│   │   └── AddSongForm.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts          ← COMPLETED
│   │   ├── usePlaylist.ts             ← COMPLETED
│   │   └── useLocalStorage.ts         ← COMPLETED
│   ├── utils/
│   │   ├── time-formatter.ts          ← COMPLETED
│   │   ├── error-handler.ts           ← COMPLETED
│   │   └── audio-validator.ts         ← COMPLETED
│   ├── data/
│   │   └── playlist-data-provider.ts  ← COMPLETED
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# CODE STRUCTURE REMINDER

```typescript
import React from 'react';

/**
 * Props for the Controls component.
 * @category Components
 */
export interface ControlsProps {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Callback for play/pause button */
  onPlayPause: () => void;
  
  /** Callback for next button */
  onNext: () => void;
  
  /** Callback for previous button */
  onPrevious: () => void;
  
  /** Whether next button should be disabled */
  disableNext: boolean;
  
  /** Whether previous button should be disabled */
  disablePrevious: boolean;
}

/**
 * Component that renders playback control buttons.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Controls: React.FC<ControlsProps> = (props) => {
  const handlePlayPauseClick = (): void => {
    // TODO: Implementation
  };

  const handleNextClick = (): void => {
    // TODO: Implementation
  };

  const handlePreviousClick = (): void => {
    // TODO: Implementation
  };

  // TODO: Implementation
  return (
    <div className="controls">
      {/* TODO: Render control buttons */}
    </div>
  );
};
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR1:** Play selected song from beginning or current position
- **FR2:** Pause playback maintaining current position
- **FR3:** Resume playback from paused position
- **FR4:** Advance to next song in playlist - when clicking Next, current song stops, progress bar resets, and playback of next song begins
- **FR5:** Go back to previous song in playlist - when clicking Previous, current song stops, progress bar resets, and playback of previous song begins
- **FR20:** Visual state change in Play/Pause button - the Play button changes to Pause when playback is active and vice versa, with different icons

**Relevant Non-Functional Requirements:**
- **NFR3:** Modular code with separate React components
- **NFR5:** Static typing with TypeScript in all components
- **NFR6:** Intuitive and accessible interface - UI is easy to use, with clear labels, keyboard-accessible controls
- **NFR8:** Immediate response to user interactions - user actions (play, pause, next, previous) respond in less than 100ms

**UI Design Specifications (from Section 12):**
- **Layout:** Previous [◄], Play/Pause [▶/❚❚], Next [►] buttons in horizontal row
- **Play/Pause button:** Larger (56x56px), circular, primary color background
- **Other buttons:** Standard size (44x44px minimum for touch), transparent background
- **Icons:** Unicode symbols or icon library
- **Hover effects:** Scale 1.05-1.1, color change to secondary color
- **Disabled state:** Opacity 0.3, cursor not-allowed
- **Touch-friendly:** Minimum 44x44px tap targets for accessibility

## 2. Class Diagram (Relevant Section)

```typescript
class Controls {
    +props: ControlsProps
    +render(): JSX.Element
    -handlePlayPauseClick(): void
    -handleNextClick(): void
    -handlePreviousClick(): void
}

class ControlsProps {
    +isPlaying: boolean
    +onPlayPause: Function
    +onNext: Function
    +onPrevious: Function
    +disableNext: boolean
    +disablePrevious: boolean
}
```

**Relationships:**
- Used by: `Player` component (renders Controls with callback handlers)
- Presentational component: No state, delegates actions to parent via callbacks
- Pure component: Same props → same output

## 3. Use Case Diagram (Relevant Use Cases)

- **Play Song:** User clicks play button → Callback triggers play action
- **Pause Playback:** User clicks pause button → Callback triggers pause action
- **Skip to Next Song:** User clicks next button → Callback advances playlist
- **Return to Previous Song:** User clicks previous button → Callback goes back
- **Keyboard Control:** User presses Space/Arrows → Triggers respective actions (handled by parent)

---

# SPECIFIC TASK

Implement the React component: **`src/components/Controls.tsx`**

## Responsibilities:

1. **Render playback control buttons** (Previous, Play/Pause, Next)
2. **Toggle Play/Pause icon** based on playback state
3. **Handle button clicks** and delegate to parent callbacks
4. **Disable buttons when appropriate** (beginning/end of playlist)
5. **Provide accessible controls** with ARIA labels and keyboard support
6. **Visual feedback** for hover, active, and disabled states
7. **Pure presentational component** with no internal state

## Component Structure:

### **Controls Component**

A pure presentational component that renders playback control buttons.

- **Description:** Displays Previous, Play/Pause, and Next buttons for controlling audio playback
- **Type:** Functional Component (React.FC)
- **Props:** ControlsProps interface
- **State:** None (stateless)
- **Returns:** JSX.Element

---

## Props Interface:

### **ControlsProps**

```typescript
/**
 * Props for the Controls component
 */
interface ControlsProps {
  /**
   * Whether audio is currently playing
   * Determines if Play or Pause icon is shown
   * @example true (shows Pause icon), false (shows Play icon)
   */
  isPlaying: boolean;
  
  /**
   * Callback function when Play/Pause button is clicked
   * Parent component handles the actual play/pause logic
   */
  onPlayPause: () => void;
  
  /**
   * Callback function when Next button is clicked
   * Parent component handles advancing to next song
   */
  onNext: () => void;
  
  /**
   * Callback function when Previous button is clicked
   * Parent component handles going to previous song
   */
  onPrevious: () => void;
  
  /**
   * Whether the Next button should be disabled
   * True when at the last song and not in repeat mode
   * @default false
   */
  disableNext?: boolean;
  
  /**
   * Whether the Previous button should be disabled
   * True when at the first song and not in repeat mode
   * @default false
   */
  disablePrevious?: boolean;
}
```

---

## Component Implementation Details:

### **JSX Structure:**

```jsx
<div className="controls">
  <button
    type="button"
    className="controls__button controls__button--previous"
    onClick={handlePreviousClick}
    disabled={props.disablePrevious}
    aria-label="Previous song"
  >
    ◄ {/* or use icon component */}
  </button>
  
  <button
    type="button"
    className="controls__button controls__button--play-pause"
    onClick={handlePlayPauseClick}
    aria-label={props.isPlaying ? "Pause" : "Play"}
  >
    {props.isPlaying ? '❚❚' : '▶'} {/* or use icon component */}
  </button>
  
  <button
    type="button"
    className="controls__button controls__button--next"
    onClick={handleNextClick}
    disabled={props.disableNext}
    aria-label="Next song"
  >
    ► {/* or use icon component */}
  </button>
</div>
```

### **Key Elements:**

1. **Container div (`controls`):**
   - Groups all control buttons
   - Uses flexbox for horizontal layout
   - Centers buttons with appropriate gap
   - Responsive spacing

2. **Previous button:**
   - Icon: ◄ (Unicode U+25C4) or left arrow icon
   - Callback: `onPrevious`
   - Can be disabled: `disablePrevious` prop
   - ARIA label: "Previous song"
   - Type: "button" (prevents form submission)

3. **Play/Pause button:**
   - Dynamic icon based on `isPlaying`:
     - Play: ▶ (Unicode U+25B6) when paused
     - Pause: ❚❚ (Unicode U+275A x2) or ⏸ (U+23F8) when playing
   - Callback: `onPlayPause`
   - Never disabled (always available)
   - ARIA label: Dynamic ("Play" or "Pause")
   - Larger size (56x56px) and distinct styling
   - Type: "button"

4. **Next button:**
   - Icon: ► (Unicode U+25BA) or right arrow icon
   - Callback: `onNext`
   - Can be disabled: `disableNext` prop
   - ARIA label: "Next song"
   - Type: "button"

---

## Event Handlers (Internal):

### 1. **handlePlayPauseClick(): void**

Handles Play/Pause button click.

```typescript
const handlePlayPauseClick = (): void => {
  props.onPlayPause();
};
```

- **Description:** Wrapper that calls parent's onPlayPause callback
- **Purpose:** Can add additional logic if needed (analytics, haptic feedback)
- **Simple delegation:** Just calls the prop function

### 2. **handleNextClick(): void**

Handles Next button click.

```typescript
const handleNextClick = (): void => {
  props.onNext();
};
```

- **Description:** Wrapper that calls parent's onNext callback
- **Note:** Button may be disabled, but handler won't be called when disabled

### 3. **handlePreviousClick(): void**

Handles Previous button click.

```typescript
const handlePreviousClick = (): void => {
  props.onPrevious();
};
```

- **Description:** Wrapper that calls parent's onPrevious callback
- **Note:** Button may be disabled, but handler won't be called when disabled

**Note:** These handlers can be inline in JSX for simplicity, or extracted if additional logic is needed (logging, validation, etc.)

---

## Styling Approach:

**Note:** This component will have a separate CSS Module file (`Controls.module.css`).

### **CSS Classes:**

```css
.controls {
  /* Container styles */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
}

.controls__button {
  /* Base button styles */
  background-color: transparent;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 1.5rem;
  padding: var(--spacing-sm);
  border-radius: 50%;
  transition: all var(--transition-fast);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls__button:hover:not(:disabled) {
  color: var(--color-secondary);
  transform: scale(1.1);
}

.controls__button:active:not(:disabled) {
  transform: scale(0.95);
}

.controls__button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.controls__button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.controls__button--play-pause {
  /* Play/Pause button specific styles */
  background-color: var(--color-primary);
  color: var(--color-background);
  width: 56px;
  height: 56px;
  font-size: 1.5rem;
  box-shadow: var(--shadow-md);
}

.controls__button--play-pause:hover:not(:disabled) {
  background-color: var(--color-secondary);
  transform: scale(1.05);
}

/* Optional: separate classes for previous/next if needed */
.controls__button--previous,
.controls__button--next {
  /* Specific styles if different from base */
}
```

---

## Accessibility Features:

### 1. **ARIA Labels**
- Each button has descriptive `aria-label`
- Play/Pause label changes dynamically based on state
- Labels are concise and clear

### 2. **Keyboard Navigation**
- All buttons are focusable via Tab key
- Enter/Space triggers button click
- Focus visible with outline
- Logical tab order (Previous → Play/Pause → Next)

### 3. **Disabled State**
- Disabled buttons have `disabled` attribute
- Visual indication (reduced opacity)
- Not focusable when disabled
- Cursor changes to not-allowed

### 4. **Touch-Friendly**
- Minimum 44x44px tap targets (WCAG guideline)
- Play/Pause button even larger (56x56px)
- Adequate spacing between buttons
- No accidental touches

### 5. **Screen Reader Support**
- Button text/icons announced correctly
- Dynamic ARIA label for Play/Pause
- State changes announced (though handled by parent)

---

## Icon Options:

### **Option 1: Unicode Symbols (No Dependencies)**
```typescript
// In component
const PlayIcon = '▶';    // U+25B6
const PauseIcon = '❚❚';  // U+275A x2 or '⏸' U+23F8
const PreviousIcon = '◄'; // U+25C4
const NextIcon = '►';     // U+25BA
```

**Pros:** No dependencies, simple, lightweight
**Cons:** Limited styling options, may render differently across browsers

### **Option 2: React Icons Library (Recommended)**
```typescript
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa';
```

**Pros:** Professional icons, consistent rendering, easily styled
**Cons:** Additional dependency

### **Option 3: SVG Icons (Inline or Imported)**
```typescript
<svg viewBox="0 0 24 24" width="24" height="24">
  <path d="M8 5v14l11-7z"/> {/* Play icon path */}
</svg>
```

**Pros:** Full control, scalable, no dependencies
**Cons:** More verbose, need to create/import all icons

**Recommendation:** Start with Unicode for simplicity, upgrade to React Icons if needed.

---

## Edge Cases to Handle:

1. **Missing callback props:**
   - Provide no-op defaults or handle with optional chaining
   - Should be prevented by TypeScript, but defensive coding is good

2. **Rapid button clicks:**
   - Parent should handle debouncing if needed
   - Component just delegates clicks

3. **Disabled state with undefined props:**
   - Use default prop values (`false` for disable flags)
   - Handle `undefined` gracefully

4. **Icon rendering issues:**
   - Fallback text if icons don't load
   - Ensure Unicode symbols display correctly

5. **Focus management:**
   - Buttons maintain focus correctly after click
   - Focus visible with proper outline

6. **Both disable flags true:**
   - Visual feedback that navigation is limited
   - Still allow play/pause

---

## Dependencies:

- **React imports:**
  ```typescript
  import React from 'react';
  ```
- **Optional icon library:**
  ```typescript
  // If using React Icons
  import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa';
  ```
- **Type imports:** None (props defined inline or exported)
- **No hooks:** Pure presentational component
- **No utilities:** No logic to extract

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+ with React 18
- **Code style:** Google TypeScript Style Guide
- **Component type:** Functional component (React.FC)
- **Maximum complexity:** Very low (no logic, just callbacks)
- **Maximum length:** ~80 lines (simple component with handlers)

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Only renders control buttons and delegates actions
  - **Open/Closed:** Easy to extend with more buttons (shuffle, repeat)
- **Input parameter validation:**
  - Use default props for optional disable flags
  - TypeScript ensures callback props exist
- **Robust exception handling:**
  - Defensive coding with optional chaining
  - Never throw from component
- **No logging needed:** Simple presentational component
- **Comments for complex logic:**
  - Document icon choices
  - Note accessibility features

## React Best Practices:

- **Pure component:** Same props → same output
- **Prop types:** TypeScript interface for type safety
- **Default props:** Use default parameter values for optional props
- **Accessibility:** ARIA labels, keyboard support, focus management
- **Performance:** Very lightweight, React.memo() not needed
- **Button type:** Always specify `type="button"` to prevent form submission

## Documentation:

- **JSDoc on component:**
  - Description of component purpose
  - `@param` for props
  - `@returns` JSX.Element
  - `@example` showing usage
- **JSDoc on props interface:**
  - Document each prop with purpose and examples
- **Inline comments:**
  - Explain icon choices
  - Note accessibility considerations

## Accessibility:

- **ARIA labels:** Clear and descriptive on all buttons
- **Keyboard support:** Full keyboard navigation
- **Focus visible:** Clear focus indicators (outline)
- **Touch targets:** Minimum 44x44px
- **Disabled state:** Proper visual and functional indication
- **Dynamic labels:** Play/Pause label changes with state

## Styling:

- **CSS Modules:** Scoped styles
- **BEM convention:** Clear class naming
- **Responsive:** Touch-friendly on mobile
- **CSS variables:** Use design tokens
- **Transitions:** Smooth hover/active effects

---

# DELIVERABLES

## 1. Complete source code of `src/components/Controls.tsx` with:

- Organized imports
- ControlsProps interface definition
- Component function definition
- Event handlers (inline or extracted)
- JSX structure with all three buttons
- Proper ARIA labels and accessibility attributes
- Complete JSDoc documentation
- Inline comments where needed

## 2. Component documentation:

- Purpose and responsibilities
- Props documentation with examples
- Usage examples showing how Player uses it
- Notes on accessibility features
- Icon options and recommendations

## 3. Type safety:

- TypeScript interface for props
- Proper typing of callbacks
- Default values for optional props
- No `any` types

## 4. Edge cases handled:

- Disabled state for navigation buttons
- Dynamic icon for Play/Pause
- Missing callback props (defensive)
- Rapid clicks (delegated to parent)
- Focus management

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Icon approach (Unicode vs React Icons vs SVG)]
- [Decision 2: Event handler extraction vs inline]
- [Decision 3: Default props strategy for optional disable flags]
- [Decision 4: Button sizing (exact pixels vs relative)]
- [Decision 5: Whether to use React.memo for optimization]
- [Decision 6: ARIA label strategy (static vs dynamic)]

**Component design rationale:**
- [Explain pure presentational component approach]
- [Document callback delegation pattern]
- [Justify button structure and ordering]

**Accessibility considerations:**
- [Document ARIA label strategy]
- [Explain keyboard navigation support]
- [Note touch-friendly sizing decisions]
- [Describe disabled state handling]

**Possible future improvements:**
- [Improvement 1: Additional controls (shuffle, repeat buttons)]
- [Improvement 2: Volume control slider]
- [Improvement 3: Playback speed control]
- [Improvement 4: Keyboard shortcut hints on hover]
- [Improvement 5: Haptic feedback on mobile devices]
- [Improvement 6: Loading state on buttons during async operations]
- [Improvement 7: Button tooltips showing keyboard shortcuts]
- [Improvement 8: Animated transitions between Play/Pause icons]
- [Improvement 9: Visual feedback for successful actions]
- [Improvement 10: Customizable button order/visibility]

---

**REMINDER:** This is a **pure presentational component** - no state, no side effects, just render buttons and delegate clicks to parent. Focus on clean JSX, excellent accessibility, intuitive UX, and responsive touch-friendly design. Keep it simple, reusable, and well-documented.
