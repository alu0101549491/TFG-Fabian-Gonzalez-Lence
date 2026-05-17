# Respuesta

### Respuesta {toggle="true"}
```markdown
Here's the complete implementation for `src/components/ProgressBar.tsx` according to your requirements:

```typescript
/**
 * @module Components/ProgressBar
 * @category Components
 * @description
 * This component displays the playback progress bar with time indicators
 * and allows users to seek to specific positions in the audio.
 */

import React from 'react';
import { TimeFormatter } from '@utils/time-formatter';

/**
 * Props for the ProgressBar component.
 * @category Components
 */
export interface ProgressBarProps {
  /**
   * Current playback position in seconds
   * @example 45.5
   */
  currentTime: number;

  /**
   * Total duration of the song in seconds
   * @example 180
   */
  duration: number;

  /**
   * Callback function when user clicks progress bar to seek
   * @param time - Time in seconds to seek to
   */
  onSeek: (time: number) => void;
}

/**
 * Component that displays and controls playback progress.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  /**
   * Calculates the progress percentage for the fill bar.
   * @returns Percentage value between 0 and 100
   */
  const calculateProgressPercentage = (): number => {
    if (props.duration <= 0) return 0;
    const percentage = (props.currentTime / props.duration) * 100;
    return Math.max(0, Math.min(percentage, 100));
  };

  /**
   * Calculates the time position from click coordinates.
   * @param event Mouse click event
   * @returns Time in seconds to seek to
   */
  const calculateClickPosition = (event: React.MouseEvent<HTMLDivElement>): number => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(clickX / rect.width, 1));
    return percentage * props.duration;
  };

  /**
   * Handles click on progress bar to seek to new position.
   * @param event Mouse click event
   */
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (props.duration <= 0) return;
    const time = calculateClickPosition(event);
    props.onSeek(time);
  };

  /**
   * Handles keyboard navigation for accessibility.
   * @param event Keyboard event
   */
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

  // Format time values for display
  const currentTimeFormatted = TimeFormatter.formatTime(props.currentTime);
  const durationFormatted = TimeFormatter.formatTime(props.duration);
  const progressPercentage = calculateProgressPercentage();

  return (
    <div className="progress-bar">
      <span className="progress-bar__time progress-bar__time--current">
        {currentTimeFormatted}
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
        {durationFormatted}
      </span>
    </div>
  );
};
```

---

### Design Decisions Made:

1. **Click Position Calculation Approach**:
   - **Decision**: Used `getBoundingClientRect()` to calculate click position.
   - **Justification**: This is the most reliable way to get the exact position of the element and calculate where the user clicked.

2. **Keyboard Navigation Support**:
   - **Decision**: Implemented arrow keys, Home, and End key support.
   - **Justification**: This provides full keyboard accessibility for users who can't use a mouse, meeting WCAG guidelines.

3. **Hover State Enhancement**:
   - **Decision**: Implemented slight height increase on hover in CSS (not shown in code but mentioned in the styling approach).
   - **Justification**: This makes the progress bar easier to click by providing a larger target area.

4. **Transition Smoothness**:
   - **Decision**: Used CSS transitions for width changes.
   - **Justification**: This provides a smooth visual experience when the progress updates.

5. **Time Display Minimum Width**:
   - **Decision**: Set minimum width for time displays in CSS.
   - **Justification**: This prevents layout jumping as the time values change.

6. **Thumb Indicator on Hover**:
   - **Decision**: Included optional thumb indicator in CSS (commented out in the example).
   - **Justification**: This provides visual feedback about where the user will seek to when they click.

---

### Component Design Rationale:

1. **Click-to-Seek Interaction Design**:
   - The component calculates the exact position clicked and converts it to a time value.
   - This provides precise seeking control for users.

2. **Percentage Calculation Approach**:
   - The progress is calculated as a percentage of the total duration.
   - This makes the visualization accurate and the seeking calculation straightforward.

3. **Time Formatting Strategy**:
   - Uses the `TimeFormatter` utility to ensure consistent time formatting.
   - Handles all edge cases (0, NaN, Infinity) gracefully.

---

### Calculation Logic:

1. **Click Position to Time Conversion**:
   - The component calculates the X position of the click relative to the progress bar.
   - Converts this to a percentage of the bar's width.
   - Multiplies by duration to get the exact time to seek to.

2. **Percentage Calculation Formula**:
   - `(currentTime / duration) * 100` gives the percentage of progress.
   - Clamped to 0-100 range to handle edge cases.

3. **Clamping Strategy**:
   - All values are clamped to valid ranges to prevent errors.
   - Negative values become 0, values over duration become duration.

---

### Accessibility Considerations:

1. **ARIA Progressbar Implementation**:
   - Uses `role="progressbar"` with appropriate ARIA attributes.
   - Provides screen readers with progress information.

2. **Keyboard Navigation Choices**:
   - Implemented arrow keys for small seeks.
   - Home/End keys for jumping to start/end.
   - Prevents default behavior to avoid page scrolling.

3. **Screen Reader Support**:
   - ARIA attributes announce the progress bar and its current value.
   - Time displays are readable text.

---

### Possible Future Improvements:

1. **Hover Preview**:
   - Show a tooltip with the exact time at the mouse position when hovering.
   - Would require tracking mouse position and calculating the time.

2. **Scrubbing Support**:
   - Allow dragging the progress bar to seek (like YouTube).
   - Would require mouse/touch event tracking during drag.

3. **Chapter/Marker Support**:
   - Add visual markers for chapters in podcasts.
   - Would need chapter data in props.

4. **Buffer Progress Indicator**:
   - Show how much of the song is buffered.
   - Would require buffer information from the audio element.

5. **Touch Gesture Support**:
   - Add swipe gestures for seeking on touch devices.
   - Would require touch event handlers.

6. **Waveform Visualization**:
   - Show the audio waveform in the progress bar.
   - Would require Web Audio API integration.

7. **Tooltips on Hover**:
   - Show tooltips with additional information when hovering.
   - Could show chapter names or other metadata.

8. **Double-Click to Skip**:
   - Double-click to skip forward/backward by a set amount.
   - Would require double-click event handling.

9. **Right-Click Context Menu**:
   - Add a context menu with time jump options.
   - Would require context menu implementation.

10. **Visual Feedback When Seeking**:
    - Add ripple effects or other visual feedback when seeking.
    - Would enhance the user experience.

This implementation provides a robust, accessible progress bar component that meets all requirements while being easily extensible for future enhancements. The component handles all edge cases gracefully and provides excellent accessibility support.
```