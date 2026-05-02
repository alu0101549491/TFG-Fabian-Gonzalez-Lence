# CODE REVIEW REQUEST #13: `src/components/ProgressBar.tsx`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/components/ProgressBar.tsx`

**Component objective:** Presentational component with interaction logic that displays current playback position as a visual progress bar with time labels. Shows elapsed time (left), total duration (right), and a filled progress bar. Handles click-to-seek functionality and keyboard navigation (arrow keys, Home/End). Updates in real-time as audio plays.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR10-FR11:** Display elapsed time and total duration
- Elapsed time shown in MM:SS format (left side)
- Total duration shown in MM:SS format (right side)
- Updates in real-time during playback

**FR12-FR13:** Progress bar with seek functionality
- Visual progress bar shows current position
- User can click anywhere on bar to seek
- Bar fills from left to right based on progress percentage
- Clicking updates playback position instantly

**UI Design Specifications:**
- **Bar height:** 6px normal, 8px on hover (easier to click)
- **Time displays:** MM:SS format via TimeFormatter utility
- **Progress fill:** Visual indicator of completion percentage
- **Click target:** Entire bar is clickable
- **Smooth transitions:** Width changes smoothly
- **Optional thumb:** Draggable handle on hover (optional)

**NFR8:** Immediate response to user interactions
- Seek responds instantly (<100ms)
- Visual feedback on hover/click
- Real-time progress updates

**NFR6:** Intuitive and accessible interface
- ARIA progressbar role
- aria-valuemin, aria-valuemax, aria-valuenow
- Keyboard navigation support
- Focus visible indicator

**Keyboard Navigation:**
- **Arrow Right:** Seek forward +5 seconds
- **Arrow Left:** Seek backward -5 seconds
- **Home:** Jump to start (0 seconds)
- **End:** Jump to end (duration)
- **Tab:** Focus on progress bar

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│      <<component>>                      │
│       ProgressBar                       │
├─────────────────────────────────────────┤
│ + props: ProgressBarProps               │
├─────────────────────────────────────────┤
│ + render(): JSX.Element                 │
│ - handleClick(event): void              │
│ - handleKeyDown(event): void            │
│ - calculateProgress(): number           │
└─────────────────────────────────────────┘
           │
           │ receives
           ▼
┌─────────────────────────────────────────┐
│      ProgressBarProps                   │
├─────────────────────────────────────────┤
│ + currentTime: number                   │
│ + duration: number                      │
│ + onSeek: (time: number) => void        │
└─────────────────────────────────────────┘

Used by:
- Player component (passes time and seek callback)

Uses:
- TimeFormatter utility (formatTime function)
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
- [ ] Presentational with interaction logic (click/keyboard handlers)
- [ ] Receives data and callback via props
- [ ] No complex state (can have hover state if needed)

**Props Interface:**
- [ ] Interface named `ProgressBarProps`
- [ ] Property: `currentTime: number` (seconds)
- [ ] Property: `duration: number` (seconds)
- [ ] Property: `onSeek: (time: number) => void`
- [ ] All properties required (not optional)

**JSX Structure:**
- [ ] Container div with className
- [ ] Elapsed time display (left)
- [ ] Progress bar container (clickable)
- [ ] Progress fill bar (shows percentage)
- [ ] Total duration display (right)
- [ ] Optional: Thumb/handle indicator

**Event Handlers:**
- [ ] `handleClick` or `onClick` for seeking
- [ ] `handleKeyDown` for keyboard navigation
- [ ] Proper calculation of click position to time

**Calculation Logic:**
- [ ] Progress percentage: `(currentTime / duration) * 100`
- [ ] Click position to time: `(clickX / barWidth) * duration`
- [ ] Handles duration = 0 (no division by zero)

**Implementation Approach:**
- [ ] Uses TimeFormatter.formatTime() for time display
- [ ] No useState needed (or minimal hover state)
- [ ] Delegates seek to parent via callback

**Score:** __/10

**Observations:**
- Is the component structure correct?
- Are calculations accurate?
- Is TimeFormatter used?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **Component main:** Low-Moderate (3-6 cyclomatic complexity)
  - Prop destructuring
  - Progress calculation
  - Time formatting
  - Return JSX
- [ ] **handleClick:** Moderate (4-6 cyclomatic complexity)
  - Get click position
  - Calculate percentage
  - Calculate time
  - Clamp to valid range
  - Call onSeek
- [ ] **handleKeyDown:** Moderate (6-8 cyclomatic complexity)
  - Switch/if for different keys
  - Calculate new time
  - Clamp to valid range
  - Call onSeek
- [ ] **calculateProgress:** Low (2-3 cyclomatic complexity)
  - Guard for division by zero
  - Return percentage
- [ ] Overall cyclomatic complexity < 15 (acceptable)

**Performance:**
- [ ] Re-renders only when props change
- [ ] Calculations are simple and fast
- [ ] No expensive operations
- [ ] Could use React.memo (optional)

**Coupling:**
- [ ] Depends on TimeFormatter utility
- [ ] Depends on React
- [ ] No other dependencies
- [ ] Reasonable coupling

**Cohesion:**
- [ ] High cohesion (all parts related to progress)
- [ ] Single responsibility (progress display and seek)
- [ ] All methods support main purpose

**Code Smells:**
- [ ] Check for: Long Method (handleClick/handleKeyDown acceptable length)
- [ ] Check for: Code Duplication (time clamping logic repeated - extract?)
- [ ] Check for: Magic Numbers (5 seconds for arrow keys - could be constant)
- [ ] Check for: Missing null checks (getBoundingClientRect, duration)
- [ ] Check for: Complex calculations (keep readable)

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**Display Requirements:**
- [ ] **AC1:** Displays currentTime on left in MM:SS format
- [ ] **AC2:** Displays duration on right in MM:SS format
- [ ] **AC3:** Uses TimeFormatter.formatTime() for both
- [ ] **AC4:** Progress bar fills based on percentage
- [ ] **AC5:** Progress percentage calculated correctly
- [ ] **AC6:** Updates in real-time as currentTime changes

**Progress Calculation:**
- [ ] **AC7:** Progress = (currentTime / duration) * 100
- [ ] **AC8:** Handles duration = 0 (shows 0%, displays 00:00)
- [ ] **AC9:** Handles currentTime > duration (clamps to 100%)
- [ ] **AC10:** Handles NaN values (defaults to 0)

**Click-to-Seek Functionality:**
- [ ] **AC11:** Clicking bar calls onSeek with calculated time
- [ ] **AC12:** Click position calculated from element bounds
- [ ] **AC13:** Time calculation: (clickX / barWidth) * duration
- [ ] **AC14:** Clamped to valid range (0 to duration)
- [ ] **AC15:** Seeks instantly (no delay)

**Keyboard Navigation:**
- [ ] **AC16:** Arrow Right seeks forward +5 seconds
- [ ] **AC17:** Arrow Left seeks backward -5 seconds
- [ ] **AC18:** Home seeks to 0 seconds
- [ ] **AC19:** End seeks to duration
- [ ] **AC20:** All seeks clamped to valid range
- [ ] **AC21:** preventDefault called to prevent scrolling

**Accessibility:**
- [ ] **AC22:** Container has role="progressbar"
- [ ] **AC23:** aria-valuemin="0" attribute
- [ ] **AC24:** aria-valuemax={duration} attribute
- [ ] **AC25:** aria-valuenow={currentTime} attribute
- [ ] **AC26:** tabIndex="0" for keyboard focus
- [ ] **AC27:** Focus visible indicator (CSS)
- [ ] **AC28:** Optional: aria-label describing purpose

**Visual Feedback:**
- [ ] **AC29:** Bar height increases on hover (via CSS)
- [ ] **AC30:** Smooth width transition on fill (via CSS)
- [ ] **AC31:** Time displays have min-width (prevent jumping)
- [ ] **AC32:** Optional: Thumb indicator on hover

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|-------------------|----------|
| duration = 0 | Show 00:00 / 00:00, 0% progress | [ ] |
| currentTime > duration | Clamp progress to 100% | [ ] |
| Click at position 0 | Seek to 0 seconds | [ ] |
| Click at position 100% | Seek to duration | [ ] |
| Arrow Right at end | Stay at duration (clamped) | [ ] |
| Arrow Left at start | Stay at 0 (clamped) | [ ] |
| NaN currentTime | Display 00:00, 0% | [ ] |
| NaN duration | Display 00:00, 0% | [ ] |
| Rapid clicks | All handled correctly | [ ] |
| Keyboard while playing | Seek works, playback continues | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Component JSDoc:**
- [ ] Description of component purpose
- [ ] Explanation of interaction model (click/keyboard)
- [ ] `@param props` or props interface documentation
- [ ] `@returns` JSX.Element
- [ ] `@example` showing usage with props

**Props Interface JSDoc:**
- [ ] Description of interface
- [ ] Each property documented:
  - currentTime - Current playback position in seconds
  - duration - Total audio duration in seconds
  - onSeek - Callback to change playback position

**Handler JSDoc:**
- [ ] `handleClick` documented with calculation logic
- [ ] `handleKeyDown` documented with supported keys
- [ ] `calculateProgress` documented with formula

**Code Clarity:**
- [ ] Variable names descriptive (clickX, barWidth, percentage)
- [ ] Calculation logic is clear
- [ ] Comments explain complex math
- [ ] Magic numbers extracted to constants

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Only manages progress display and seek ✓
- [ ] **Open/Closed:** Easy to extend with features ✓

**React Best Practices:**
- [ ] Proper event handling
- [ ] Props are immutable
- [ ] Functional component
- [ ] Minimal state
- [ ] useCallback for handlers (optional)

**Component Design Best Practices:**
- [ ] Presentational with interaction
- [ ] Testable (calculate functions can be pure)
- [ ] Reusable
- [ ] Clear separation of concerns

**TypeScript Best Practices:**
- [ ] Props interface defined
- [ ] Event types explicit (MouseEvent, KeyboardEvent)
- [ ] No `any` types
- [ ] Return types explicit

**Accessibility Best Practices:**
- [ ] ARIA progressbar role
- [ ] ARIA value attributes
- [ ] Keyboard accessible (tabIndex)
- [ ] Focus visible
- [ ] Screen reader friendly

**Math/Calculation Best Practices:**
- [ ] No division by zero
- [ ] Values clamped to valid ranges
- [ ] Edge cases handled
- [ ] Math.max/Math.min for clamping

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
- "Complete progress bar with click-to-seek and keyboard navigation. Proper time formatting via TimeFormatter. Accurate progress calculation with edge case handling. Full ARIA support. Smooth visual feedback. Ready for production."
- "Core progress display works but click-to-seek calculation incorrect. Missing keyboard navigation. ARIA attributes incomplete. Needs improvements for full functionality."
- "Critical: No seek functionality implemented. Progress calculation divides by zero. TimeFormatter not used. Missing ARIA attributes. Major refactoring needed."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. Division by zero in progress calculation - Line 15
   - Current: const progress = (currentTime / duration) * 100;
   - Impact: Returns Infinity or NaN when duration is 0, breaks UI
   - Proposed solution: Add guard:
     const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

2. Click-to-seek not implemented - Missing handleClick
   - Impact: User can't click to seek, core feature missing
   - Proposed solution: Add onClick handler:
     const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
       const rect = e.currentTarget.getBoundingClientRect();
       const clickX = e.clientX - rect.left;
       const percentage = clickX / rect.width;
       const time = Math.max(0, Math.min(percentage * duration, duration));
       onSeek(time);
     };

3. TimeFormatter not used - Lines 20, 22
   - Current: Displays raw seconds: {currentTime}
   - Expected: MM:SS format: {TimeFormatter.formatTime(currentTime)}
   - Impact: Wrong time display format, doesn't match requirements
   - Proposed solution: Import and use TimeFormatter

4. Missing ARIA attributes - Progress bar element
   - Impact: Not accessible to screen readers
   - Proposed solution: Add:
     role="progressbar"
     aria-valuemin={0}
     aria-valuemax={duration}
     aria-valuenow={currentTime}
     tabIndex={0}

5. No keyboard navigation - Missing handleKeyDown
   - Impact: Keyboard users can't seek, accessibility issue
   - Proposed solution: Implement handleKeyDown with arrow keys, Home, End
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. Magic number for arrow key seek amount - handleKeyDown
   - Current: const newTime = currentTime + 5;
   - Suggestion: Extract constant:
     const SEEK_STEP_SECONDS = 5;
   - Benefit: Easier to adjust, self-documenting

2. Time clamping logic duplicated - handleClick and handleKeyDown
   - Suggestion: Extract to helper function:
     const clampTime = (time: number): number => {
       return Math.max(0, Math.min(time, duration));
     };
   - Benefit: DRY principle, consistent clamping

3. No React.memo optimization - Component definition
   - Suggestion: Wrap in React.memo
   - Benefit: Prevents re-renders when props unchanged

4. Progress bar ref not used for calculations - handleClick
   - Current: Uses e.currentTarget
   - Suggestion: Also works, but could use useRef for consistency
   - Benefit: More explicit about what's being measured

5. Time displays have no min-width - CSS
   - Issue: Text jumping as numbers change (1:59 → 10:00)
   - Suggestion: Add min-width: 45px; to time displays
   - Benefit: Prevents layout shift

6. No visual feedback on click - CSS
   - Suggestion: Add :active state for click feedback
   - Benefit: Better UX, confirms interaction

7. Missing aria-label - Progress bar
   - Suggestion: Add descriptive label:
     aria-label="Playback progress"
   - Benefit: Clearer for screen readers
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ Accurate progress calculation with zero-division guard
- ✅ Click-to-seek correctly calculates position
- ✅ Keyboard navigation with all required keys
- ✅ TimeFormatter used for both time displays
- ✅ Full ARIA support (role, value attributes)
- ✅ Time clamping prevents out-of-bounds seeks
- ✅ Clean calculation logic
- ✅ Type-safe props and event handlers
- ✅ Real-time updates as currentTime changes
- ✅ Smooth visual feedback via CSS

---

### Recommended Refactorings:

**REFACTORING 1: Complete implementation with all features**

```typescript
import React from 'react';
import { TimeFormatter } from '@utils/time-formatter';
import './ProgressBar.css';

/**
 * Progress bar component with seek functionality.
 * 
 * Displays current playback position with elapsed time, duration,
 * and visual progress bar. Supports click-to-seek and keyboard
 * navigation (arrow keys, Home/End).
 * 
 * @param props - Current time, duration, and seek callback
 * @returns JSX element with progress bar
 * 
 * @example
 * <ProgressBar
 *   currentTime={125}
 *   duration={300}
 *   onSeek={(time) => audio.currentTime = time}
 * />
 */
interface ProgressBarProps {
  /** Current playback position in seconds */
  currentTime: number;
  /** Total audio duration in seconds */
  duration: number;
  /** Callback to seek to new position */
  onSeek: (time: number) => void;
}

const SEEK_STEP_SECONDS = 5;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek
}) => {
  /**
   * Calculates progress percentage (0-100).
   * Guards against division by zero.
   */
  const calculateProgress = (): number => {
    if (duration <= 0) return 0;
    const progress = (currentTime / duration) * 100;
    return Math.min(progress, 100); // Clamp to 100%
  };

  /**
   * Clamps time value to valid range [0, duration].
   */
  const clampTime = (time: number): number => {
    return Math.max(0, Math.min(time, duration || 0));
  };

  /**
   * Handles clicking on progress bar to seek.
   * Calculates time based on click position.
   */
  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * duration;
    
    onSeek(clampTime(time));
  };

  /**
   * Handles keyboard navigation for seeking.
   * - Arrow Right: +5 seconds
   * - Arrow Left: -5 seconds
   * - Home: Jump to start
   * - End: Jump to end
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    let newTime: number;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newTime = currentTime + SEEK_STEP_SECONDS;
        onSeek(clampTime(newTime));
        break;

      case 'ArrowLeft':
        event.preventDefault();
        newTime = currentTime - SEEK_STEP_SECONDS;
        onSeek(clampTime(newTime));
        break;

      case 'Home':
        event.preventDefault();
        onSeek(0);
        break;

      case 'End':
        event.preventDefault();
        onSeek(duration);
        break;

      default:
        // Ignore other keys
        break;
    }
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="progress-bar">
      {/* Elapsed time */}
      <span className="progress-bar__time progress-bar__time--elapsed">
        {TimeFormatter.formatTime(currentTime)}
      </span>

      {/* Progress bar */}
      <div
        className="progress-bar__track"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="progressbar"
        aria-label="Playback progress"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
      >
        <div
          className="progress-bar__fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Total duration */}
      <span className="progress-bar__time progress-bar__time--duration">
        {TimeFormatter.formatTime(duration)}
      </span>
    </div>
  );
};
```

**Reason:** Complete implementation with all features, proper calculations, full accessibility.

---

**REFACTORING 2: Companion CSS file**

```css
/* ProgressBar.css */

.progress-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  width: 100%;
}

.progress-bar__time {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums; /* Monospace numbers */
  min-width: 45px; /* Prevent jumping */
}

.progress-bar__time--elapsed {
  text-align: right;
}

.progress-bar__time--duration {
  text-align: left;
}

.progress-bar__track {
  flex: 1;
  height: 6px;
  background-color: var(--color-border);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  transition: height var(--transition-fast);
}

.progress-bar__track:hover {
  height: 8px; /* Easier to click when hovering */
}

.progress-bar__track:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.progress-bar__fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 3px;
  transition: width 0.1s linear;
  pointer-events: none; /* Click goes to track */
}

/* Optional: Thumb indicator on hover */
.progress-bar__track:hover .progress-bar__fill::after {
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

/* Mobile: slightly larger touch target */
@media (max-width: 767px) {
  .progress-bar__track {
    height: 8px;
  }
  
  .progress-bar__track:hover {
    height: 10px;
  }
}
```

**Reason:** Complete responsive styles, hover feedback, accessibility, smooth transitions.

---

**REFACTORING 3: Extract helper functions for testability**

```typescript
// Helper functions (can be exported for testing)
export const calculateProgressPercentage = (
  currentTime: number,
  duration: number
): number => {
  if (duration <= 0) return 0;
  const progress = (currentTime / duration) * 100;
  return Math.min(progress, 100);
};

export const clampTime = (
  time: number,
  duration: number
): number => {
  return Math.max(0, Math.min(time, duration || 0));
};

export const calculateTimeFromClick = (
  clickX: number,
  barWidth: number,
  duration: number
): number => {
  const percentage = clickX / barWidth;
  return clampTime(percentage * duration, duration);
};

// Use in component
const progressPercentage = calculateProgressPercentage(currentTime, duration);

const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const time = calculateTimeFromClick(clickX, rect.width, duration);
  onSeek(time);
};
```

**Reason:** Easier to test calculations independently, clearer logic, reusable functions.

---

**REFACTORING 4: Add React.memo and useCallback optimization**

```typescript
export const ProgressBar = React.memo<ProgressBarProps>(
  ({ currentTime, duration, onSeek }) => {
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>): void => {
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const time = Math.max(0, Math.min(percentage * duration, duration));
        onSeek(time);
      },
      [duration, onSeek]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // ... implementation
      },
      [currentTime, duration, onSeek]
    );

    // ... rest of component
  }
);
```

**Reason:** Performance optimization, prevents unnecessary re-renders and handler recreations.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - Progress calculation correct
  - Click-to-seek works
  - Keyboard navigation implemented
  - TimeFormatter used
  - Full ARIA support
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: could extract constants, add React.memo
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: division by zero, no seek functionality
  - Missing keyboard navigation or ARIA
  - Must fix before Player can use this

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This component combines display and interaction
- Not purely presentational (has click/keyboard handlers)
- Critical for seek functionality
- Math calculations must be accurate

**Dependencies:**
- Depends on: TimeFormatter utility, React
- Used by: Player component

**What to Look For:**
- **Zero-division guard** in progress calculation
- **Click-to-seek calculation** correct (uses getBoundingClientRect)
- **Keyboard navigation** all four keys (Left, Right, Home, End)
- **TimeFormatter usage** for both time displays
- **ARIA attributes** complete (role, value attributes, tabIndex)
- **Time clamping** prevents out-of-bounds seeks

**Common Mistakes to Watch For:**
- Division by zero (duration = 0)
- Click position calculated incorrectly
- Missing keyboard navigation
- Raw seconds displayed (not MM:SS format)
- Missing ARIA attributes
- No time clamping (allows negative or > duration)
- Click handler on fill instead of track
- Missing preventDefault on keyboard events
- Magic numbers not extracted

**Testing Checklist:**
```typescript
// Test rendering
render(
  <ProgressBar
    currentTime={60}
    duration={180}
    onSeek={mockSeek}
  />
);

// Verify time displays
expect(screen.getByText('01:00')).toBeInTheDocument();
expect(screen.getByText('03:00')).toBeInTheDocument();

// Test progress calculation
// 60/180 = 33.33%
const fill = document.querySelector('.progress-bar__fill');
expect(fill).toHaveStyle({ width: '33.33%' });

// Test click-to-seek
const track = screen.getByRole('progressbar');
fireEvent.click(track, { clientX: 50 });
// Verify mockSeek called with calculated time

// Test keyboard navigation
fireEvent.keyDown(track, { key: 'ArrowRight' });
expect(mockSeek).toHaveBeenCalledWith(65); // 60 + 5

fireEvent.keyDown(track, { key: 'Home' });
expect(mockSeek).toHaveBeenCalledWith(0);

// Test edge case: duration = 0
rerender(<ProgressBar currentTime={0} duration={0} onSeek={mockSeek} />);
expect(screen.getByText('00:00')).toBeInTheDocument();
// Should not crash
```

**Calculation Verification:**
```typescript
// Progress percentage
currentTime = 75, duration = 300
progress = (75 / 300) * 100 = 25%

// Click position to time
clickX = 150, barWidth = 600, duration = 300
percentage = 150 / 600 = 0.25
time = 0.25 * 300 = 75 seconds

// Arrow Right
currentTime = 115, SEEK_STEP = 5
newTime = 115 + 5 = 120 seconds

// Clamping
time = -10, clamp(time, 0, duration) = 0
time = 350, duration = 300, clamp(time, 0, 300) = 300
```

**Accessibility Checklist:**
- [ ] role="progressbar" attribute
- [ ] aria-valuemin="0" attribute
- [ ] aria-valuemax={duration} attribute
- [ ] aria-valuenow={currentTime} attribute
- [ ] tabIndex="0" for keyboard focus
- [ ] Focus visible indicator (CSS)
- [ ] Keyboard navigation works
- [ ] Screen reader announces value changes
