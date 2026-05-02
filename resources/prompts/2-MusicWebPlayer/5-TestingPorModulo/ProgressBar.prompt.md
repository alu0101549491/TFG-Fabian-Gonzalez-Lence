# TESTING PROMPT #13: `src/components/ProgressBar.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** ProgressBar Component

**File path:** `src/components/ProgressBar.tsx`

**Test file path:** `tests/components/ProgressBar.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Components/ProgressBar
 * @category Components
 * @description
 * This component displays the playback progress bar with time indicators
 * and allows users to seek to specific positions in the audio.
 */

import React, { useCallback } from 'react';
import { TimeFormatter } from '@utils/time-formatter';
import styles from '@styles/ProgressBar.module.css';

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
  const SEEK_STEP_SECONDS = 5;

  /**
   * Clamps the time value between 0 and the duration.
   * @param t Time value to clamp
   * @param dur Duration value
   * @returns Clamped time value
   */
  const clampTime = (t: number, dur: number) => Math.max(0, Math.min(t, dur || 0));

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
  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (props.duration <= 0) return;
    const time = calculateClickPosition(event);
    props.onSeek(clampTime(time, props.duration));
  }, [props.duration, props.onSeek]);

  /**
   * Handles keyboard navigation for accessibility.
   * @param event Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        props.onSeek(clampTime(props.currentTime + SEEK_STEP_SECONDS, props.duration));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        props.onSeek(clampTime(props.currentTime - SEEK_STEP_SECONDS, props.duration));
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
    <div className={styles['progress-bar']}>
      <span className={`${styles['progress-bar__time']} ${styles['progress-bar__time--current']}`}>
        {currentTimeFormatted}
      </span>

      <div
        className={styles['progress-bar__container']}
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={props.duration}
        aria-valuenow={props.currentTime}
        aria-valuetext={TimeFormatter.formatTime(props.currentTime)}
        aria-label="Playback progress"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className={styles['progress-bar__fill']}
          style={{ width: `${progressPercentage.toFixed(2)}%` }}
        />
      </div>

      <span className={`${styles['progress-bar__time']} ${styles['progress-bar__time--total']}`}>
        {durationFormatted}
      </span>
    </div>
  );
};

```

---

## JEST CONFIGURATION
```json
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg|mp3|wav)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  silent: true,
};
```

---

## JEST SETUP
```typescript
// Setup file for Jest with React Testing Library
require('@testing-library/jest-dom');

// Mock HTMLMediaElement (Audio API)
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.addEventListener = jest.fn();
window.HTMLMediaElement.prototype.removeEventListener = jest.fn();

Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
  get: jest.fn(() => 0),
  set: jest.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  get: jest.fn(() => 0),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch API for Node.js test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({}),
  })
);
```

---

## TYPESCRIPT CONFIGURATION
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@data/*": ["src/data/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## REQUIREMENTS SPECIFICATION

### From Code Review #13:

**Component Objective:**
Interactive progress bar showing playback progress with seek functionality. Displays elapsed time (left), total duration (right), and clickable progress bar. Supports keyboard navigation (Arrow keys, Home, End). Uses TimeFormatter for time display.

**Requirements:**
- **FR5-FR9:** Progress bar with seek functionality
- **FR10-FR11:** Display elapsed time and total duration
- **NFR6:** Accessibility (ARIA progressbar, keyboard navigation)
- **NFR8:** Immediate response to interactions

**Component Signature:**
```typescript
interface ProgressBarProps {
  currentTime: number;    // Elapsed time in seconds
  duration: number;       // Total duration in seconds
  onSeek: (time: number) => void;  // Callback for seeking
}

function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps): JSX.Element
```

**Critical Requirements:**

1. **Time Display:**
   - Left: Current time formatted as MM:SS
   - Right: Total duration formatted as MM:SS
   - Uses TimeFormatter.formatTime()
   - Updates as currentTime changes

2. **Progress Bar:**
   - Visual bar showing progress
   - Progress percentage: (currentTime / duration) * 100
   - Zero-division guard when duration = 0
   - Clickable to seek
   - ARIA progressbar role

3. **Click-to-Seek:**
   - Click anywhere on bar to seek
   - Calculate position: (clickX - barLeft) / barWidth
   - Convert to time: position * duration
   - Call onSeek(calculatedTime)
   - Uses getBoundingClientRect()

4. **Keyboard Navigation:**
   - Arrow Right: +5 seconds
   - Arrow Left: -5 seconds
   - Home: Jump to start (0s)
   - End: Jump to end (duration)
   - Clamps time to [0, duration]
   - Calls onSeek with new time

5. **Time Clamping:**
   - Calculated time never < 0
   - Calculated time never > duration
   - Uses Math.max(0, Math.min(duration, time))

6. **Accessibility:**
   - role="progressbar"
   - aria-valuemin="0"
   - aria-valuemax={duration}
   - aria-valuenow={currentTime}
   - aria-label or aria-labelledby
   - tabIndex="0" (keyboard focusable)
   - preventDefault on keyboard events

7. **Edge Cases:**
   - duration = 0 → no division by zero
   - currentTime > duration → clamp
   - currentTime < 0 → clamp
   - Click outside bar bounds → handle gracefully
   - NaN values → handle gracefully

**Calculations:**
```typescript
// Progress percentage
const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

// Click position to time
const rect = barElement.getBoundingClientRect();
const clickPosition = (event.clientX - rect.left) / rect.width;
const targetTime = clickPosition * duration;
const clampedTime = Math.max(0, Math.min(duration, targetTime));

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    onSeek(Math.min(currentTime + 5, duration));
  }
  // ... other keys
};
```

**Usage Context:**
- Used by Player component
- Updates 60fps during playback (currentTime changes)
- Must be performant
- Frequently clicked/keyboard navigated

---

## USE CASE DIAGRAM

```
ProgressBar Component
├── Display Times
│   ├── Left: formatTime(currentTime)
│   └── Right: formatTime(duration)
│
├── Visual Progress
│   ├── Calculate: (currentTime/duration)*100
│   └── Zero-division guard
│
├── Click-to-Seek
│   ├── getBoundingClientRect()
│   ├── Calculate click position
│   ├── Convert to time
│   ├── Clamp to valid range
│   └── Call onSeek()
│
└── Keyboard Navigation
    ├── Arrow Right → +5s
    ├── Arrow Left → -5s
    ├── Home → 0s
    ├── End → duration
    └── preventDefault
```

---

## TASK

Generate a complete unit test suite for the **ProgressBar component** that covers:

### 1. RENDERING - BASIC
Test basic rendering:
- Component renders without crashing
- Progress bar element exists
- Time displays exist (current and duration)
- Component accepts all required props

### 2. TIME DISPLAY
Test time formatting:
- Current time displayed in MM:SS format
- Duration displayed in MM:SS format
- Uses TimeFormatter.formatTime()
- Updates when currentTime changes
- Updates when duration changes

### 3. PROGRESS CALCULATION
Test progress percentage:
- Progress = (currentTime / duration) * 100
- Zero duration handled (no division by zero)
- Progress updates as currentTime changes
- Progress is 0% when currentTime = 0
- Progress is 100% when currentTime = duration
- Progress clamped to [0, 100]

### 4. CLICK-TO-SEEK
Test click functionality:
- Click on bar calls onSeek
- Click position calculated correctly
- Time calculated from click position
- onSeek called with correct time value
- Time clamped to [0, duration]
- Multiple clicks work

### 5. KEYBOARD NAVIGATION - ARROW KEYS
Test arrow key navigation:
- Arrow Right increases time by 5s
- Arrow Left decreases time by 5s
- Time clamped at boundaries
- preventDefault called on arrow keys
- onSeek called with correct values

### 6. KEYBOARD NAVIGATION - HOME/END
Test home/end keys:
- Home key seeks to 0
- End key seeks to duration
- preventDefault called
- onSeek called with correct values

### 7. TIME CLAMPING
Test boundary handling:
- Seek beyond duration clamps to duration
- Seek below 0 clamps to 0
- Arrow Right at end doesn't exceed duration
- Arrow Left at start doesn't go negative
- Click outside bar bounds handled

### 8. ACCESSIBILITY
Test ARIA attributes:
- role="progressbar" present
- aria-valuemin="0"
- aria-valuemax set to duration
- aria-valuenow set to currentTime
- aria-label or aria-labelledby present
- tabIndex="0" (keyboard focusable)

### 9. ZERO-DIVISION GUARD
Test edge case handling:
- duration = 0 doesn't cause division by zero
- progress = 0 when duration = 0
- No errors when duration = 0
- Click still works when duration = 0

### 10. EDGE CASES - TIME VALUES
Test unusual time values:
- currentTime > duration
- currentTime < 0
- duration = 0
- currentTime = NaN (if possible)
- duration = NaN (if possible)
- Very large durations (hours)

### 11. EDGE CASES - INTERACTIONS
Test interaction edge cases:
- Rapid clicks on progress bar
- Rapid keyboard presses
- Click while keyboard focused
- Keyboard navigation with duration = 0
- Seek to same position multiple times

### 12. INTEGRATION
Test with realistic scenarios:
- Song at 0:00 / 3:45
- Song at 1:30 / 3:45
- Song at 3:45 / 3:45
- Seek to middle of song
- Keyboard navigation through song
- Complete playback simulation

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressBar from '@/components/ProgressBar';
import * as TimeFormatter from '@/utils/time-formatter';

describe('ProgressBar Component', () => {
  const defaultProps = {
    currentTime: 0,
    duration: 180, // 3 minutes
    onSeek: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock TimeFormatter
    jest.spyOn(TimeFormatter, 'formatTime').mockImplementation((seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<ProgressBar {...defaultProps} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render progress bar element', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toBeInTheDocument();
    });

    it('should display current time', () => {
      render(<ProgressBar {...defaultProps} currentTime={90} />);

      expect(screen.getByText('01:30')).toBeInTheDocument();
    });

    it('should display duration', () => {
      render(<ProgressBar {...defaultProps} duration={180} />);

      expect(screen.getByText('03:00')).toBeInTheDocument();
    });

    it('should accept all required props', () => {
      expect(() => render(<ProgressBar {...defaultProps} />)).not.toThrow();
    });
  });

  describe('Time Display', () => {
    it('should format current time in MM:SS', () => {
      render(<ProgressBar {...defaultProps} currentTime={125} />);

      expect(screen.getByText('02:05')).toBeInTheDocument();
    });

    it('should format duration in MM:SS', () => {
      render(<ProgressBar {...defaultProps} duration={245} />);

      expect(screen.getByText('04:05')).toBeInTheDocument();
    });

    it('should use TimeFormatter.formatTime()', () => {
      render(<ProgressBar {...defaultProps} currentTime={60} duration={180} />);

      expect(TimeFormatter.formatTime).toHaveBeenCalledWith(60);
      expect(TimeFormatter.formatTime).toHaveBeenCalledWith(180);
    });

    it('should update current time display when prop changes', () => {
      const { rerender } = render(<ProgressBar {...defaultProps} currentTime={30} />);

      expect(screen.getByText('00:30')).toBeInTheDocument();

      rerender(<ProgressBar {...defaultProps} currentTime={60} />);

      expect(screen.getByText('01:00')).toBeInTheDocument();
      expect(screen.queryByText('00:30')).not.toBeInTheDocument();
    });

    it('should update duration display when prop changes', () => {
      const { rerender } = render(<ProgressBar {...defaultProps} duration={180} />);

      expect(screen.getByText('03:00')).toBeInTheDocument();

      rerender(<ProgressBar {...defaultProps} duration={240} />);

      expect(screen.getByText('04:00')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress as (currentTime/duration)*100', () => {
      render(<ProgressBar {...defaultProps} currentTime={90} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      // Progress should be 50%
      expect(progressBar).toHaveAttribute('aria-valuenow', '90');
      expect(progressBar).toHaveAttribute('aria-valuemax', '180');
    });

    it('should handle zero duration without division by zero', () => {
      expect(() => 
        render(<ProgressBar {...defaultProps} duration={0} />)
      ).not.toThrow();
    });

    it('should show 0% progress when currentTime is 0', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should show 100% progress when currentTime equals duration', () => {
      render(<ProgressBar {...defaultProps} currentTime={180} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '180');
      expect(progressBar).toHaveAttribute('aria-valuemax', '180');
    });

    it('should update progress as currentTime changes', () => {
      const { rerender } = render(
        <ProgressBar {...defaultProps} currentTime={0} duration={100} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      rerender(<ProgressBar {...defaultProps} currentTime={50} duration={100} />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should handle progress when currentTime > duration', () => {
      render(<ProgressBar {...defaultProps} currentTime={200} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      // Should still render without errors
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Click-to-Seek', () => {
    it('should call onSeek when bar is clicked', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      // Mock getBoundingClientRect
      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 50 });

      expect(onSeek).toHaveBeenCalled();
    });

    it('should calculate correct time from click position', () => {
      const onSeek = jest.fn();
      const duration = 180;

      render(<ProgressBar {...defaultProps} duration={duration} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click at 50% position
      fireEvent.click(progressBar, { clientX: 50 });

      // Should seek to 90 seconds (50% of 180)
      expect(onSeek).toHaveBeenCalledWith(90);
    });

    it('should clamp seek time to valid range [0, duration]', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={100} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click beyond right edge
      fireEvent.click(progressBar, { clientX: 150 });

      // Should clamp to duration
      const callArg = onSeek.mock.calls[0][0];
      expect(callArg).toBeLessThanOrEqual(100);
    });

    it('should handle multiple clicks', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 25 });
      fireEvent.click(progressBar, { clientX: 50 });
      fireEvent.click(progressBar, { clientX: 75 });

      expect(onSeek).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Navigation - Arrow Keys', () => {
    it('should increase time by 5s on Arrow Right', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={30} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledWith(35);
    });

    it('should decrease time by 5s on Arrow Left', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={30} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' });

      expect(onSeek).toHaveBeenCalledWith(25);
    });

    it('should not exceed duration on Arrow Right', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={178} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledWith(180);
    });

    it('should not go below 0 on Arrow Left', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={3} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' });

      expect(onSeek).toHaveBeenCalledWith(0);
    });

    it('should call preventDefault on arrow keys', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(progressBar, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation - Home/End', () => {
    it('should seek to 0 on Home key', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={90} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'Home' });

      expect(onSeek).toHaveBeenCalledWith(0);
    });

    it('should seek to duration on End key', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={90} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'End' });

      expect(onSeek).toHaveBeenCalledWith(180);
    });

    it('should call preventDefault on Home key', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      const event = new KeyboardEvent('keydown', { key: 'Home' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(progressBar, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call preventDefault on End key', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      const event = new KeyboardEvent('keydown', { key: 'End' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(progressBar, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Time Clamping', () => {
    it('should clamp calculated time to duration when seeking beyond end', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={100} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click way past the end
      fireEvent.click(progressBar, { clientX: 200 });

      const seekTime = onSeek.mock.calls[0][0];
      expect(seekTime).toBeLessThanOrEqual(100);
    });

    it('should clamp calculated time to 0 when seeking before start', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click before the start
      fireEvent.click(progressBar, { clientX: -50 });

      const seekTime = onSeek.mock.calls[0][0];
      expect(seekTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle Arrow Right at end of track', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={180} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledWith(180);
    });

    it('should handle Arrow Left at start of track', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={0} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' });

      expect(onSeek).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility', () => {
    it('should have role="progressbar"', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });

    it('should have aria-valuemin="0"', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have aria-valuemax set to duration', () => {
      render(<ProgressBar {...defaultProps} duration={240} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuemax', '240');
    });

    it('should have aria-valuenow set to currentTime', () => {
      render(<ProgressBar {...defaultProps} currentTime={75} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should have aria-label or aria-labelledby', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      const hasAriaLabel = progressBar.hasAttribute('aria-label') || 
                           progressBar.hasAttribute('aria-labelledby');

      expect(hasAriaLabel).toBe(true);
    });

    it('should be keyboard focusable (tabIndex="0")', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('tabIndex', '0');
    });

    it('should update aria-valuenow when currentTime changes', () => {
      const { rerender } = render(
        <ProgressBar {...defaultProps} currentTime={30} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');

      rerender(<ProgressBar {...defaultProps} currentTime={60} />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });
  });

  describe('Zero-Division Guard', () => {
    it('should not crash when duration is 0', () => {
      expect(() => 
        render(<ProgressBar {...defaultProps} duration={0} />)
      ).not.toThrow();
    });

    it('should show progress 0 when duration is 0', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={0} />);

      const progressBar = screen.getByRole('progressbar');

      // Should handle gracefully
      expect(progressBar).toBeInTheDocument();
    });

    it('should not throw error during calculation with duration 0', () => {
      const { container } = render(
        <ProgressBar {...defaultProps} currentTime={10} duration={0} />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle click when duration is 0', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={0} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      expect(() => fireEvent.click(progressBar, { clientX: 50 })).not.toThrow();
    });
  });

  describe('Edge Cases - Time Values', () => {
    it('should handle currentTime > duration', () => {
      expect(() => 
        render(<ProgressBar {...defaultProps} currentTime={200} duration={180} />)
      ).not.toThrow();
    });

    it('should handle negative currentTime', () => {
      expect(() => 
        render(<ProgressBar {...defaultProps} currentTime={-10} />)
      ).not.toThrow();
    });

    it('should handle very large durations (hours)', () => {
      render(<ProgressBar {...defaultProps} duration={7200} />);

      expect(screen.getByText('120:00')).toBeInTheDocument();
    });

    it('should handle zero values for both time and duration', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={0} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge Cases - Interactions', () => {
    it('should handle rapid clicks', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 10 });
      fireEvent.click(progressBar, { clientX: 20 });
      fireEvent.click(progressBar, { clientX: 30 });
      fireEvent.click(progressBar, { clientX: 40 });
      fireEvent.click(progressBar, { clientX: 50 });

      expect(onSeek).toHaveBeenCalledTimes(5);
    });

    it('should handle rapid keyboard presses', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={50} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard navigation with duration = 0', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={0} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      expect(() => {
        fireEvent.keyDown(progressBar, { key: 'ArrowRight' });
        fireEvent.keyDown(progressBar, { key: 'End' });
      }).not.toThrow();
    });

    it('should handle seeking to same position multiple times', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 50 });
      fireEvent.click(progressBar, { clientX: 50 });
      fireEvent.click(progressBar, { clientX: 50 });

      expect(onSeek).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration', () => {
    it('should work at song start (0:00 / 3:45)', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={225} />);

      expect(screen.getByText('00:00')).toBeInTheDocument();
      expect(screen.getByText('03:45')).toBeInTheDocument();
    });

    it('should work at song middle (1:30 / 3:45)', () => {
      render(<ProgressBar {...defaultProps} currentTime={90} duration={225} />);

      expect(screen.getByText('01:30')).toBeInTheDocument();
      expect(screen.getByText('03:45')).toBeInTheDocument();
    });

    it('should work at song end (3:45 / 3:45)', () => {
      render(<ProgressBar {...defaultProps} currentTime={225} duration={225} />);

      expect(screen.getByText('03:45')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '225');
      expect(progressBar).toHaveAttribute('aria-valuemax', '225');
    });

    it('should support complete playback simulation', () => {
      const { rerender } = render(
        <ProgressBar {...defaultProps} currentTime={0} duration={100} />
      );

      // Simulate playback
      for (let time = 0; time <= 100; time += 10) {
        rerender(<ProgressBar {...defaultProps} currentTime={time} duration={100} />);
      }

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle keyboard navigation through entire song', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={0} duration={100} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      // Navigate forward
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' }); // 5s
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' }); // 10s
      
      // Navigate backward
      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' }); // 5s
      
      // Jump to end
      fireEvent.keyDown(progressBar, { key: 'End' }); // 100s
      
      // Jump to start
      fireEvent.keyDown(progressBar, { key: 'Home' }); // 0s

      expect(onSeek).toHaveBeenCalledTimes(5);
    });
  });
});
```

---

## TEST REQUIREMENTS

### Mock Setup:
- [ ] Mock TimeFormatter.formatTime()
- [ ] Mock getBoundingClientRect() for click testing
- [ ] Clear mocks between tests

### Click Testing:
- [ ] Use fireEvent.click with clientX
- [ ] Mock getBoundingClientRect
- [ ] Verify onSeek called with correct time

### Keyboard Testing:
- [ ] Test all 4 keys (ArrowRight, ArrowLeft, Home, End)
- [ ] Verify preventDefault called
- [ ] Test boundary clamping

### Accessibility:
- [ ] Test all ARIA attributes
- [ ] Verify progressbar role
- [ ] Check tabIndex

### Edge Cases:
- [ ] Test division by zero guard
- [ ] Test time clamping
- [ ] Test unusual values

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/components/ProgressBar.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Rendering - Basic | 5 |
| Time Display | 5 |
| Progress Calculation | 6 |
| Click-to-Seek | 4 |
| Keyboard - Arrow Keys | 5 |
| Keyboard - Home/End | 4 |
| Time Clamping | 4 |
| Accessibility | 7 |
| Zero-Division Guard | 4 |
| Edge Cases - Time | 4 |
| Edge Cases - Interactions | 4 |
| Integration | 5 |
| **TOTAL** | **57** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/components/ProgressBar.test.tsx
npm test -- --coverage tests/components/ProgressBar.test.tsx
```
