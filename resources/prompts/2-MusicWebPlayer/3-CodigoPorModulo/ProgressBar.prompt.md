Perfect! Let's move to **Module #13: `src/components/ProgressBar.tsx`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Components Layer - Presentational Components (Progress Bar with Time Display)

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
│   │   ├── Controls.tsx               ← COMPLETED
│   │   ├── ProgressBar.tsx            ← CURRENT MODULE
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
import {TimeFormatter} from '@utils/time-formatter';

/**
 * Props for the ProgressBar component.
 * @category Components
 */
export interface ProgressBarProps {
  /** Current playback time in seconds */
  currentTime: number;
  
  /** Total duration in seconds */
  duration: number;
  
  /** Callback when user seeks to a new position */
  onSeek: (time: number) => void;
}

/**
 * Component that displays and controls playback progress.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const handleProgressClick = (event: React.MouseEvent): void => {
    // TODO: Implementation
  };

  const calculateClickPosition = (event: React.MouseEvent): number => {
    // TODO: Implementation
    return 0;
  };

  // TODO: Implementation
  return (
    <div className="progress-bar">
      {/* TODO: Render progress bar with time displays */}
    </div>
  );
};
```
---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR10:** Display elapsed playback time - the elapsed time since the start of the current song is shown in MM:SS format, updating in real-time
- **FR11:** Display total song duration - the total duration of the current song is shown in MM:SS format
- **FR12:** Visual progress bar updated in real-time - a progress bar visually reflects the percentage of playback completed, updating continuously during playback
- **FR13:** Progress bar interaction for manual seeking - when clicking any point on the progress bar, playback jumps to that specific position

**Relevant Non-Functional Requirements:**
- **NFR3:** Modular code with separate React components
- **NFR5:** Static typing with TypeScript in all components
- **NFR6:** Intuitive and accessible interface - keyboard-accessible controls
- **NFR8:** Immediate response to user interactions - progress bar interaction responds in less than 100ms

**UI Design Specifications (from Section 12):**
- **Progress bar height:** 6px
- **Progress bar filled:** Primary color (#3b82f6)
- **Progress bar background:** Dark: #333333, Light: #e0e0e0
- **Time display:** 14px, weight 500, secondary text color
- **Time format:** MM:SS (e.g., "02:45" / "04:20")
- **Layout:** Time left, progress bar center, time right (flexbox)
- **Interaction:** Cursor changes to pointer, click to seek
- **Hover:** Subtle visual feedback (optional: preview time on hover)

## 2. Class Diagram (Relevant Section)

```typescript
class ProgressBar {
    +props: ProgressBarProps
    +render(): JSX.Element
    -handleProgressClick(event: MouseEvent): void
    -calculateClickPosition(event: MouseEvent): number
}

class ProgressBarProps {
    +currentTime: number
    +duration: number
    +onSeek: Function
}

// Used by ProgressBar
class TimeFormatter {
    <<utility>>
    +formatTime(seconds: number): string
}
```

**Relationships:**
- Used by: `Player` component (renders ProgressBar with time data and seek callback)
- Uses: `TimeFormatter` utility (formats time values to MM:SS)
- Presentational component: Minimal state, delegates seek action to parent

## 3. Use Case Diagram (Relevant Use Cases)

- **View Playback Progress:** User sees visual progress bar filling as song plays
- **View Elapsed Time:** User sees current position in MM:SS format
- **View Total Duration:** User sees song length in MM:SS format
- **Seek to Position:** User clicks progress bar → Callback triggers seek to that time

---

# SPECIFIC TASK

Implement the React component: **`src/components/ProgressBar.tsx`**

## Responsibilities:

1. **Display elapsed time** in MM:SS format (left side)
2. **Display total duration** in MM:SS format (right side)
3. **Render visual progress bar** showing playback completion percentage
4. **Handle click events** on progress bar to calculate seek position
5. **Calculate click position** as percentage/time value
6. **Delegate seek action** to parent via callback
7. **Update in real-time** as currentTime changes (reactive to props)
8. **Provide accessible interaction** with keyboard support and ARIA attributes

## Component Structure:

### **ProgressBar Component**

A presentational component with minimal state for interaction.

- **Description:** Displays playback progress with time indicators and allows seeking via click
- **Type:** Functional Component (React.FC)
- **Props:** ProgressBarProps interface
- **State:** Optional hover state for preview (future enhancement)
- **Returns:** JSX.Element

---

## Props Interface:

### **ProgressBarProps**

```typescript
/**
 * Props for the ProgressBar component
 */
interface ProgressBarProps {
  /**
   * Current playback position in seconds
   * Updates in real-time during playback
   * @example 45.5 (45.5 seconds elapsed)
   */
  currentTime: number;
  
  /**
   * Total duration of the song in seconds
   * Set when audio metadata loads
   * @example 180 (3 minutes)
   */
  duration: number;
  
  /**
   * Callback function when user clicks progress bar to seek
   * Receives the target time in seconds
   * @param time - Time in seconds to seek to
   */
  onSeek: (time: number) => void;
}
```

---

## Component Implementation Details:

### **JSX Structure:**

```jsx
<div className="progress-bar">
  <span className="progress-bar__time progress-bar__time--current">
    {formatTime(props.currentTime)}
  </span>
  
  <div 
    className="progress-bar__container"
    onClick={handleProgressClick}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={props.duration}
    aria-valuenow={props.currentTime}
    aria-label="Playback progress"
    tabIndex={0}
    onKeyDown={handleKeyDown}
  >
    <div 
      className="progress-bar__fill"
      style={{ width: `${progressPercentage}%` }}
    />
  </div>
  
  <span className="progress-bar__time progress-bar__time--total">
    {formatTime(props.duration)}
  </span>
</div>
```

### **Key Elements:**

1. **Outer container (`progress-bar`):**
   - Flexbox layout: time left, bar center, time right
   - Aligns items center
   - Provides spacing

2. **Current time display:**
   - Formatted using TimeFormatter
   - Updates in real-time via props
   - Left-aligned
   - Minimum width to prevent jumping

3. **Progress bar container (`progress-bar__container`):**
   - Clickable area for seeking
   - Full width with height (6px)
   - Background color (unfilled portion)
   - Cursor pointer on hover
   - ARIA progressbar role
   - Keyboard accessible (tabIndex={0})

4. **Progress bar fill (`progress-bar__fill`):**
   - Visual indicator of progress
   - Width calculated as percentage
   - Primary color
   - Smooth transition (optional)

5. **Total duration display:**
   - Formatted using TimeFormatter
   - Static (doesn't change during playback)
   - Right-aligned
   - Minimum width to prevent jumping

---

## Calculated Values:

### **progressPercentage: number**

Calculate the fill width as percentage.

```typescript
const progressPercentage = props.duration > 0 
  ? (props.currentTime / props.duration) * 100 
  : 0;
```

- **Formula:** `(currentTime / duration) * 100`
- **Range:** 0 to 100
- **Edge cases:**
  - duration is 0 → return 0%
  - currentTime > duration → clamp to 100%
  - NaN values → return 0%

---

## Event Handlers:

### 1. **handleProgressClick(event: React.MouseEvent\<HTMLDivElement\>): void**

Handles click on progress bar to seek.

- **Description:** Calculates the clicked position as a time value and calls onSeek callback
- **Parameters:**
  - `event` (React.MouseEvent): Mouse click event
- **Process:**
  1. Get click position relative to progress bar
  2. Calculate percentage of bar clicked
  3. Convert percentage to time value
  4. Call `onSeek(time)` callback
- **Implementation:**
  ```typescript
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    const time = calculateClickPosition(event);
    props.onSeek(time);
  };
  ```

### 2. **calculateClickPosition(event: React.MouseEvent\<HTMLDivElement\>): number**

Calculates the time position from click coordinates.

- **Description:** Converts mouse click X position to time value in seconds
- **Parameters:**
  - `event` (React.MouseEvent): Mouse click event
- **Returns:** 
  - `number`: Time in seconds to seek to
- **Algorithm:**
  ```typescript
  const calculateClickPosition = (event: React.MouseEvent<HTMLDivElement>): number => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * props.duration;
    
    // Clamp to valid range
    return Math.max(0, Math.min(time, props.duration));
  };
  ```
- **Edge cases:**
  - Click outside bar bounds → clamp to 0 or duration
  - duration is 0 → return 0
  - Negative values → clamp to 0

### 3. **handleKeyDown(event: React.KeyboardEvent\<HTMLDivElement\>): void** (Optional)

Handles keyboard interaction for accessibility.

- **Description:** Allows seeking with arrow keys when progress bar is focused
- **Keys:**
  - Arrow Right: Skip forward 5 seconds
  - Arrow Left: Skip backward 5 seconds
  - Home: Jump to beginning (0)
  - End: Jump to end (duration)
- **Implementation:**
  ```typescript
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const skipAmount = 5; // seconds
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        props.onSeek(Math.min(props.currentTime + skipAmount, props.duration));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        props.onSeek(Math.max(props.currentTime - skipAmount, 0));
        break;
      case 'Home':
        event.preventDefault();
        props.onSeek(0);
        break;
      case 'End':
        event.preventDefault();
        props.onSeek(props.duration);
        break;
    }
  };
  ```

---

## Time Formatting:

### **Using TimeFormatter Utility**

```typescript
import { formatTime } from '@utils/time-formatter';

// In component
const currentTimeFormatted = formatTime(props.currentTime);
const durationFormatted = formatTime(props.duration);
```

- Import `formatTime` from utility
- Call with seconds value
- Returns MM:SS string
- Handles edge cases (0, NaN, Infinity)

---

## Styling Approach:

**Note:** This component will have a separate CSS Module file (`ProgressBar.module.css`).

### **CSS Classes:**

```css
.progress-bar {
  /* Container layout */
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  margin: var(--spacing-lg) 0;
}

.progress-bar__time {
  /* Time display base styles */
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 45px; /* Prevent jumping when time changes */
  user-select: none;
}

.progress-bar__time--current {
  text-align: right;
}

.progress-bar__time--total {
  text-align: left;
}

.progress-bar__container {
  /* Progress bar track */
  flex: 1;
  height: 6px;
  background-color: var(--color-progress-inactive);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: height var(--transition-fast);
}

.progress-bar__container:hover {
  height: 8px; /* Slightly taller on hover for easier clicking */
}

.progress-bar__container:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.progress-bar__fill {
  /* Progress bar filled portion */
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 3px;
  transition: width var(--transition-fast);
  pointer-events: none; /* Allow clicks to pass through to container */
}

/* Optional: thumb indicator on hover */
.progress-bar__container:hover .progress-bar__fill::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background-color: var(--color-primary);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}
```

---

## Accessibility Features:

### 1. **ARIA Attributes**
- `role="progressbar"`: Identifies as progress indicator
- `aria-valuemin="0"`: Minimum value
- `aria-valuemax={duration}`: Maximum value
- `aria-valuenow={currentTime}`: Current value
- `aria-label="Playback progress"`: Descriptive label

### 2. **Keyboard Navigation**
- `tabIndex={0}`: Makes progress bar focusable
- Arrow keys: Skip forward/backward
- Home/End keys: Jump to beginning/end
- Focus visible with outline

### 3. **Screen Reader Support**
- ARIA progressbar announces current progress
- Time displays are readable
- State changes announced (handled by ARIA)

### 4. **Visual Feedback**
- Cursor changes to pointer on hover
- Bar height increases slightly on hover (easier to click)
- Optional thumb indicator on hover
- Focus outline visible

---

## Edge Cases to Handle:

1. **duration is 0:**
   - Show 00:00 for both times
   - Progress bar at 0%
   - Clicks do nothing (can't seek in 0-duration song)

2. **currentTime > duration:**
   - Clamp progress to 100%
   - Display duration as max time
   - Shouldn't happen but handle gracefully

3. **NaN or undefined values:**
   - Treat as 0
   - Use TimeFormatter's edge case handling
   - Don't break UI

4. **Rapid clicks:**
   - Each click triggers seek
   - Parent handles debouncing if needed
   - Component just delegates

5. **Click during load:**
   - If duration not loaded yet (0), ignore seek
   - Or allow seek and let parent handle

6. **Very long durations (>99:59):**
   - TimeFormatter handles (may show hours or max value)
   - Ensure time displays don't break layout

7. **Negative values:**
   - Clamp to 0
   - Shouldn't happen but defensive coding

8. **Mobile touch events:**
   - onClick works for touch
   - Consider adding touch event handlers for better UX (optional)

---

## Dependencies:

- **React imports:**
  ```typescript
  import React from 'react';
  ```
- **Utility imports:**
  ```typescript
  import { formatTime } from '@utils/time-formatter';
  ```
- **Type imports:** None (props defined inline or exported)
- **No hooks:** Simple component, no complex state

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+ with React 18
- **Code style:** Google TypeScript Style Guide
- **Component type:** Functional component (React.FC)
- **Maximum complexity:** Low (calculation logic only)
- **Maximum length:** ~120 lines (with event handlers)

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Only displays progress and delegates seek
  - **Open/Closed:** Easy to extend with hover preview, scrubbing
- **Input parameter validation:**
  - Validate duration > 0 before calculations
  - Clamp values to valid ranges
  - Handle NaN, undefined gracefully
- **Robust exception handling:**
  - Never throw from event handlers
  - Handle edge cases defensively
  - Provide fallback values
- **No logging needed:** Simple component
- **Comments for complex logic:**
  - Document click position calculation
  - Explain percentage to time conversion
  - Note edge case handling

## React Best Practices:

- **Pure component:** Deterministic rendering
- **Prop types:** TypeScript interface for type safety
- **Performance:** Minimal re-renders (progress updates frequently)
- **Accessibility:** Full ARIA support, keyboard accessible
- **Event delegation:** onClick on container, not fill

## Documentation:

- **JSDoc on component:**
  - Description of component purpose
  - `@param` for props
  - `@returns` JSX.Element
  - `@example` showing usage
- **JSDoc on props interface:**
  - Document each prop with examples
- **JSDoc on event handlers:**
  - Document calculation logic
  - Note edge cases
- **Inline comments:**
  - Explain click position math
  - Note accessibility features

## Accessibility:

- **ARIA progressbar:** Full ARIA attributes
- **Keyboard support:** Arrow keys, Home, End
- **Focus visible:** Clear outline
- **Screen reader:** Progress announced
- **Visual feedback:** Hover state, cursor pointer

## Styling:

- **CSS Modules:** Scoped styles
- **BEM convention:** Clear class naming
- **Smooth transitions:** Width changes animated
- **Hover feedback:** Enhanced clickability
- **CSS variables:** Use design tokens

---

# DELIVERABLES

## 1. Complete source code of `src/components/ProgressBar.tsx` with:

- Organized imports (React, TimeFormatter)
- ProgressBarProps interface definition
- Component function definition
- Percentage calculation
- Event handlers (handleProgressClick, calculateClickPosition, handleKeyDown)
- JSX structure with ARIA attributes
- Complete JSDoc documentation
- Inline comments for calculations

## 2. Component documentation:

- Purpose and responsibilities
- Props documentation with examples
- Usage examples showing how Player uses it
- Notes on click position calculation
- Accessibility features documentation
- Keyboard shortcuts documentation

## 3. Type safety:

- TypeScript interface for props
- Proper typing of event handlers
- Type-safe calculations
- No `any` types

## 4. Edge cases handled:

- duration is 0
- currentTime > duration
- NaN or undefined values
- Click outside bounds
- Rapid clicks
- Keyboard navigation edge cases

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Click position calculation approach (getBoundingClientRect)]
- [Decision 2: Keyboard navigation support (arrow keys, home/end)]
- [Decision 3: Hover state enhancement (bar height increase)]
- [Decision 4: Transition smoothness (width animation)]
- [Decision 5: Time display minimum width (prevent jumping)]
- [Decision 6: Whether to show thumb indicator on hover]

**Component design rationale:**
- [Explain click-to-seek interaction design]
- [Document percentage calculation approach]
- [Justify time formatting strategy]

**Calculation logic:**
- [Document click position to time conversion]
- [Explain percentage calculation formula]
- [Describe clamping strategy]

**Accessibility considerations:**
- [Document ARIA progressbar implementation]
- [Explain keyboard navigation choices]
- [Note screen reader support]

**Possible future improvements:**
- [Improvement 1: Hover preview showing time at mouse position]
- [Improvement 2: Scrubbing support (drag to seek)]
- [Improvement 3: Chapter/marker support for podcasts]
- [Improvement 4: Buffer progress indicator (how much is loaded)]
- [Improvement 5: Touch gesture support (swipe to seek)]
- [Improvement 6: Waveform visualization in progress bar]
- [Improvement 7: Tooltips showing time on hover]
- [Improvement 8: Double-click to skip forward/backward]
- [Improvement 9: Right-click context menu with time jump options]
- [Improvement 10: Visual feedback when seeking (ripple effect)]

---

**REMINDER:** This is a **presentational component with interaction logic** - displays progress, handles clicks, calculates positions, and delegates actions. Focus on accurate calculations, smooth interactions, excellent accessibility, and real-time updates. The component is critical for user control and feedback.
