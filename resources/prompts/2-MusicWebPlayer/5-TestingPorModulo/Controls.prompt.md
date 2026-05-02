# TESTING PROMPT #12: `src/components/Controls.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** Controls Component

**File path:** `src/components/Controls.tsx`

**Test file path:** `tests/components/Controls.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
// src/components/Controls.tsx
import React from 'react';
import { RepeatMode } from '@types/playback-modes';
import styles from '@styles/Controls.module.css';

/**
 * Props for the Controls component.
 * @category Components
 */
export interface ControlsProps {
  /**
   * Whether audio is currently playing
   * Determines if Play or Pause icon is shown
   */
  isPlaying: boolean;

  /**
   * Callback function when Play/Pause button is clicked
   */
  onPlayPause: () => void;

  /**
   * Callback function when Next button is clicked
   */
  onNext: () => void;

  /**
   * Callback function when Previous button is clicked
   */
  onPrevious: () => void;

  /**
   * Whether the Next button should be disabled
   * @default false
   */
  disableNext?: boolean;

  /**
   * Whether the Previous button should be disabled
   * @default false
   */
  disablePrevious?: boolean;

  /**
   * Current repeat mode
   */
  repeatMode: RepeatMode;

  /**
   * Whether shuffle is enabled
   */
  isShuffled: boolean;

  /**
   * Callback function when repeat mode is toggled
   */
  onRepeatToggle: () => void;

  /**
   * Callback function when shuffle is toggled
   */
  onShuffleToggle: () => void;
}

/**
 * Component that renders playback control buttons.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Controls: React.FC<ControlsProps> = (props) => {
  // Default values for optional props
  const {
    disableNext = false,
    disablePrevious = false,
  } = props;

  // Unicode symbols for icons
  const PlayIcon = '▶';    // U+25B6
  const PauseIcon = '❚❚';  // U+275A x2
  const PreviousIcon = '◄'; // U+25C4
  const NextIcon = '►';     // U+25BA
  const ShuffleIcon = '🔀';  // U+1F500
  const RepeatIcon = '🔁';  // U+1F501
  const RepeatOneIcon = '🔂'; // U+1F502

  return (
    <div className={styles.controls}>
      {/* Previous button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--previous']}`}
        onClick={props.onPrevious}
        disabled={disablePrevious}
        aria-label="Previous song"
      >
        {PreviousIcon}
      </button>

      {/* Play/Pause button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--play-pause']}`}
        onClick={props.onPlayPause}
        aria-label={props.isPlaying ? "Pause" : "Play"}
      >
        {props.isPlaying ? PauseIcon : PlayIcon}
      </button>

      {/* Next button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--next']}`}
        onClick={props.onNext}
        disabled={disableNext}
        aria-label="Next song"
      >
        {NextIcon}
      </button>

      {/* Shuffle button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--shuffle']} ${
          props.isShuffled ? styles['controls__button--active'] : ''
        }`}
        onClick={props.onShuffleToggle}
        aria-label={props.isShuffled ? "Disable shuffle" : "Enable shuffle"}
        aria-pressed={props.isShuffled}
        title="Shuffle"
      >
        {ShuffleIcon}
      </button>

      {/* Repeat button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--repeat']} ${
          props.repeatMode !== RepeatMode.OFF ? styles['controls__button--active'] : ''
        }`}
        onClick={props.onRepeatToggle}
        aria-label={`Repeat: ${props.repeatMode}`}
        aria-pressed={props.repeatMode !== RepeatMode.OFF}
        title={`Repeat: ${props.repeatMode}`}
      >
        {props.repeatMode === RepeatMode.ONE ? RepeatOneIcon : RepeatIcon}
      </button>
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

### From Code Review #12:

**Component Objective:**
Pure presentational component with 5 playback control buttons: Previous, Play/Pause, Next, Shuffle, Repeat. Delegates all logic to parent via callbacks. Shows dynamic icons and active states. Handles disabled states for boundary conditions.

**Requirements:**
- **FR3-FR4:** Previous/Next navigation buttons
- **FR1-FR2:** Play/Pause button
- **NEW:** Shuffle toggle button
- **NEW:** Repeat mode cycle button
- **NFR1:** Semantic HTML (buttons)
- **NFR6:** Accessibility (ARIA labels, touch targets)

**Component Signature:**
```typescript
interface ControlsProps {
  // Playback state
  isPlaying: boolean;
  
  // Playback callbacks
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  
  // Optional disabled states
  disableNext?: boolean;
  disablePrevious?: boolean;
  
  // Mode state
  repeatMode: RepeatMode;  // 'OFF' | 'ALL' | 'ONE'
  isShuffled: boolean;
  
  // Mode callbacks
  onRepeatToggle: () => void;
  onShuffleToggle: () => void;
}

function Controls(props: ControlsProps): JSX.Element
```

**Critical Requirements:**

1. **Five Buttons Required:**
   - Previous button
   - Play/Pause button
   - Next button
   - Shuffle toggle button
   - Repeat mode cycle button

2. **Play/Pause Button:**
   - Shows Play icon when isPlaying = false
   - Shows Pause icon when isPlaying = true
   - Calls onPlayPause when clicked
   - ARIA label changes: "Play" / "Pause"

3. **Previous Button:**
   - Calls onPrevious when clicked
   - Disabled when disablePrevious = true
   - ARIA label: "Previous track" or "Previous"
   - Touch target ≥44x44px

4. **Next Button:**
   - Calls onNext when clicked
   - Disabled when disableNext = true
   - ARIA label: "Next track" or "Next"
   - Touch target ≥44x44px

5. **Shuffle Button:**
   - Toggles shuffle mode
   - Calls onShuffleToggle when clicked
   - Shows active state when isShuffled = true
   - ARIA label: "Shuffle" or "Toggle shuffle"
   - aria-pressed attribute: true/false

6. **Repeat Button:**
   - Cycles through repeat modes (OFF → ALL → ONE → OFF)
   - Calls onRepeatToggle when clicked
   - Dynamic icon based on repeatMode:
     - OFF: repeat icon (no indicator)
     - ALL: repeat icon (active/highlighted)
     - ONE: repeat-one icon (shows "1")
   - ARIA label changes with mode
   - aria-pressed or aria-label indicates current mode

7. **Disabled States:**
   - Buttons with disabled prop should have disabled attribute
   - Disabled buttons not clickable
   - Visual styling for disabled state (CSS)

8. **Accessibility:**
   - All buttons have aria-label
   - Play/Pause has dynamic aria-label
   - Shuffle/Repeat have aria-pressed
   - Disabled buttons have disabled attribute
   - Touch targets ≥44x44px
   - Keyboard accessible (native button behavior)

9. **Pure Component:**
   - No internal state
   - No side effects
   - Props in → JSX out
   - Can use React.memo

**Event Handling:**
- All buttons call their respective callbacks
- No stopPropagation needed (buttons don't nest)
- No preventDefault needed (default button behavior ok)

**Usage Context:**
- Used by Player component
- Receives state and callbacks from parent
- No business logic - pure presentation
- Frequently clicked during playback

---

## USE CASE DIAGRAM

```
Controls Component
├── Previous Button
│   ├── onClick → onPrevious()
│   └── disabled={disablePrevious}
│
├── Play/Pause Button
│   ├── onClick → onPlayPause()
│   ├── Icon: Play or Pause
│   └── ARIA label: "Play" or "Pause"
│
├── Next Button
│   ├── onClick → onNext()
│   └── disabled={disableNext}
│
├── Shuffle Button
│   ├── onClick → onShuffleToggle()
│   ├── Active state: isShuffled
│   └── aria-pressed={isShuffled}
│
└── Repeat Button
    ├── onClick → onRepeatToggle()
    ├── Icon: Repeat/Repeat-One
    ├── Active state: repeatMode
    └── ARIA label: current mode
```

---

## TASK

Generate a complete unit test suite for the **Controls component** that covers:

### 1. RENDERING - BASIC
Test basic rendering:
- Component renders without crashing
- All 5 buttons render
- Buttons are in correct order (Previous, Play/Pause, Next, Shuffle, Repeat)
- All buttons are button elements

### 2. PLAY/PAUSE BUTTON
Test play/pause functionality:
- Button renders
- Shows Play icon when isPlaying = false
- Shows Pause icon when isPlaying = true
- Calls onPlayPause when clicked
- ARIA label is "Play" when not playing
- ARIA label is "Pause" when playing
- Icon changes when isPlaying changes

### 3. PREVIOUS BUTTON
Test previous button:
- Button renders
- Calls onPrevious when clicked
- Not disabled by default
- Disabled when disablePrevious = true
- Has ARIA label
- Cannot be clicked when disabled

### 4. NEXT BUTTON
Test next button:
- Button renders
- Calls onNext when clicked
- Not disabled by default
- Disabled when disableNext = true
- Has ARIA label
- Cannot be clicked when disabled

### 5. SHUFFLE BUTTON
Test shuffle toggle:
- Button renders
- Calls onShuffleToggle when clicked
- Has aria-pressed attribute
- aria-pressed = false when isShuffled = false
- aria-pressed = true when isShuffled = true
- Shows active state when shuffled
- Has ARIA label

### 6. REPEAT BUTTON
Test repeat mode:
- Button renders
- Calls onRepeatToggle when clicked
- Shows Repeat icon when mode = OFF
- Shows Repeat icon (active) when mode = ALL
- Shows Repeat-One icon when mode = ONE
- ARIA label changes with mode
- Has aria-pressed or aria-label

### 7. CALLBACK TESTING
Test all callbacks:
- onPlayPause called on play/pause click
- onPrevious called on previous click
- onNext called on next click
- onShuffleToggle called on shuffle click
- onRepeatToggle called on repeat click
- Callbacks called exactly once per click
- No callbacks called when disabled

### 8. DISABLED STATES
Test disabled buttons:
- Previous disabled when disablePrevious = true
- Next disabled when disableNext = true
- Disabled buttons have disabled attribute
- Disabled buttons not clickable
- Enabled buttons are clickable
- Play/Pause never disabled

### 9. ACCESSIBILITY
Test accessibility features:
- All buttons have aria-label or aria-labelledby
- Play/Pause has dynamic aria-label
- Shuffle has aria-pressed
- Repeat has appropriate ARIA
- Disabled buttons have disabled attribute
- All buttons are button elements (semantic)
- Touch targets adequate (test via CSS or manual)

### 10. DYNAMIC STATES
Test state changes:
- Play button changes to Pause
- Pause button changes to Play
- Shuffle button shows active state
- Repeat button shows correct mode
- Disabled states update correctly

### 11. EDGE CASES
Test edge cases:
- Both previous and next disabled
- Rapid button clicks
- Callback throws error (should not crash)
- Missing optional props (disableNext, disablePrevious)
- All repeat modes cycle correctly

### 12. INTEGRATION
Test with realistic scenarios:
- Playback at first song (previous disabled)
- Playback at last song (next disabled)
- Shuffle enabled with repeat ALL
- Repeat ONE active
- All buttons functional simultaneously

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Controls from '@/components/Controls';
import { RepeatMode } from '@/types/playback-modes';

describe('Controls Component', () => {
  // Default props
  const defaultProps = {
    isPlaying: false,
    onPlayPause: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    repeatMode: RepeatMode.OFF,
    isShuffled: false,
    onRepeatToggle: jest.fn(),
    onShuffleToggle: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<Controls {...defaultProps} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render all 5 buttons', () => {
      render(<Controls {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      expect(buttons).toHaveLength(5);
    });

    it('should render buttons as button elements', () => {
      render(<Controls {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should have all required buttons', () => {
      render(<Controls {...defaultProps} />);

      // Check for buttons by accessible name or other queries
      expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/play|pause/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shuffle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();
    });
  });

  describe('Play/Pause Button', () => {
    it('should render play/pause button', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/play|pause/i);

      expect(button).toBeInTheDocument();
    });

    it('should show Play icon when not playing', () => {
      render(<Controls {...defaultProps} isPlaying={false} />);

      const button = screen.getByLabelText(/play/i);

      expect(button).toBeInTheDocument();
    });

    it('should show Pause icon when playing', () => {
      render(<Controls {...defaultProps} isPlaying={true} />);

      const button = screen.getByLabelText(/pause/i);

      expect(button).toBeInTheDocument();
    });

    it('should call onPlayPause when clicked', async () => {
      const user = userEvent.setup();
      const onPlayPause = jest.fn();

      render(<Controls {...defaultProps} onPlayPause={onPlayPause} />);

      const button = screen.getByLabelText(/play/i);

      await user.click(button);

      expect(onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('should have aria-label "Play" when not playing', () => {
      render(<Controls {...defaultProps} isPlaying={false} />);

      const button = screen.getByLabelText(/play/i);

      expect(button).toHaveAttribute('aria-label');
    });

    it('should have aria-label "Pause" when playing', () => {
      render(<Controls {...defaultProps} isPlaying={true} />);

      const button = screen.getByLabelText(/pause/i);

      expect(button).toHaveAttribute('aria-label');
    });

    it('should change icon when isPlaying changes', () => {
      const { rerender } = render(<Controls {...defaultProps} isPlaying={false} />);

      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();

      rerender(<Controls {...defaultProps} isPlaying={true} />);

      expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/play/i)).not.toBeInTheDocument();
    });
  });

  describe('Previous Button', () => {
    it('should render previous button', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/previous/i);

      expect(button).toBeInTheDocument();
    });

    it('should call onPrevious when clicked', async () => {
      const user = userEvent.setup();
      const onPrevious = jest.fn();

      render(<Controls {...defaultProps} onPrevious={onPrevious} />);

      const button = screen.getByLabelText(/previous/i);

      await user.click(button);

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should not be disabled by default', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/previous/i);

      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disablePrevious is true', () => {
      render(<Controls {...defaultProps} disablePrevious={true} />);

      const button = screen.getByLabelText(/previous/i);

      expect(button).toBeDisabled();
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/previous/i);

      expect(button).toHaveAttribute('aria-label');
    });

    it('should not call onPrevious when disabled', async () => {
      const user = userEvent.setup();
      const onPrevious = jest.fn();

      render(
        <Controls 
          {...defaultProps} 
          onPrevious={onPrevious}
          disablePrevious={true}
        />
      );

      const button = screen.getByLabelText(/previous/i);

      await user.click(button);

      expect(onPrevious).not.toHaveBeenCalled();
    });
  });

  describe('Next Button', () => {
    it('should render next button', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/next/i);

      expect(button).toBeInTheDocument();
    });

    it('should call onNext when clicked', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();

      render(<Controls {...defaultProps} onNext={onNext} />);

      const button = screen.getByLabelText(/next/i);

      await user.click(button);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should not be disabled by default', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/next/i);

      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disableNext is true', () => {
      render(<Controls {...defaultProps} disableNext={true} />);

      const button = screen.getByLabelText(/next/i);

      expect(button).toBeDisabled();
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/next/i);

      expect(button).toHaveAttribute('aria-label');
    });

    it('should not call onNext when disabled', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();

      render(
        <Controls 
          {...defaultProps} 
          onNext={onNext}
          disableNext={true}
        />
      );

      const button = screen.getByLabelText(/next/i);

      await user.click(button);

      expect(onNext).not.toHaveBeenCalled();
    });
  });

  describe('Shuffle Button', () => {
    it('should render shuffle button', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/shuffle/i);

      expect(button).toBeInTheDocument();
    });

    it('should call onShuffleToggle when clicked', async () => {
      const user = userEvent.setup();
      const onShuffleToggle = jest.fn();

      render(<Controls {...defaultProps} onShuffleToggle={onShuffleToggle} />);

      const button = screen.getByLabelText(/shuffle/i);

      await user.click(button);

      expect(onShuffleToggle).toHaveBeenCalledTimes(1);
    });

    it('should have aria-pressed attribute', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/shuffle/i);

      expect(button).toHaveAttribute('aria-pressed');
    });

    it('should have aria-pressed="false" when not shuffled', () => {
      render(<Controls {...defaultProps} isShuffled={false} />);

      const button = screen.getByLabelText(/shuffle/i);

      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have aria-pressed="true" when shuffled', () => {
      render(<Controls {...defaultProps} isShuffled={true} />);

      const button = screen.getByLabelText(/shuffle/i);

      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/shuffle/i);

      expect(button).toHaveAttribute('aria-label');
    });

    it('should update aria-pressed when isShuffled changes', () => {
      const { rerender } = render(<Controls {...defaultProps} isShuffled={false} />);

      let button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<Controls {...defaultProps} isShuffled={true} />);

      button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Repeat Button', () => {
    it('should render repeat button', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/repeat/i);

      expect(button).toBeInTheDocument();
    });

    it('should call onRepeatToggle when clicked', async () => {
      const user = userEvent.setup();
      const onRepeatToggle = jest.fn();

      render(<Controls {...defaultProps} onRepeatToggle={onRepeatToggle} />);

      const button = screen.getByLabelText(/repeat/i);

      await user.click(button);

      expect(onRepeatToggle).toHaveBeenCalledTimes(1);
    });

    it('should show different states for different repeat modes', () => {
      const { rerender } = render(
        <Controls {...defaultProps} repeatMode={RepeatMode.OFF} />
      );

      let button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();

      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ALL} />);
      button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();

      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ONE} />);
      button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/repeat/i);

      expect(button).toHaveAttribute('aria-label');
    });

    it('should indicate current repeat mode in ARIA', () => {
      const { rerender } = render(
        <Controls {...defaultProps} repeatMode={RepeatMode.OFF} />
      );

      let button = screen.getByLabelText(/repeat/i);
      const ariaLabel = button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      // Should indicate different modes
      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ALL} />);
      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ONE} />);
      
      // Verify button still accessible
      button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });
  });

  describe('Callback Testing', () => {
    it('should call onPlayPause exactly once per click', async () => {
      const user = userEvent.setup();
      const onPlayPause = jest.fn();

      render(<Controls {...defaultProps} onPlayPause={onPlayPause} />);

      const button = screen.getByLabelText(/play/i);

      await user.click(button);

      expect(onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevious exactly once per click', async () => {
      const user = userEvent.setup();
      const onPrevious = jest.fn();

      render(<Controls {...defaultProps} onPrevious={onPrevious} />);

      const button = screen.getByLabelText(/previous/i);

      await user.click(button);

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should call onNext exactly once per click', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();

      render(<Controls {...defaultProps} onNext={onNext} />);

      const button = screen.getByLabelText(/next/i);

      await user.click(button);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should call onShuffleToggle exactly once per click', async () => {
      const user = userEvent.setup();
      const onShuffleToggle = jest.fn();

      render(<Controls {...defaultProps} onShuffleToggle={onShuffleToggle} />);

      const button = screen.getByLabelText(/shuffle/i);

      await user.click(button);

      expect(onShuffleToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onRepeatToggle exactly once per click', async () => {
      const user = userEvent.setup();
      const onRepeatToggle = jest.fn();

      render(<Controls {...defaultProps} onRepeatToggle={onRepeatToggle} />);

      const button = screen.getByLabelText(/repeat/i);

      await user.click(button);

      expect(onRepeatToggle).toHaveBeenCalledTimes(1);
    });

    it('should not call callbacks when buttons are disabled', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();
      const onPrevious = jest.fn();

      render(
        <Controls 
          {...defaultProps}
          onNext={onNext}
          onPrevious={onPrevious}
          disableNext={true}
          disablePrevious={true}
        />
      );

      const nextButton = screen.getByLabelText(/next/i);
      const prevButton = screen.getByLabelText(/previous/i);

      await user.click(nextButton);
      await user.click(prevButton);

      expect(onNext).not.toHaveBeenCalled();
      expect(onPrevious).not.toHaveBeenCalled();
    });

    it('should call multiple different callbacks independently', async () => {
      const user = userEvent.setup();
      const callbacks = {
        onPlayPause: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        onShuffleToggle: jest.fn(),
        onRepeatToggle: jest.fn()
      };

      render(<Controls {...defaultProps} {...callbacks} />);

      await user.click(screen.getByLabelText(/play/i));
      await user.click(screen.getByLabelText(/next/i));
      await user.click(screen.getByLabelText(/shuffle/i));

      expect(callbacks.onPlayPause).toHaveBeenCalledTimes(1);
      expect(callbacks.onNext).toHaveBeenCalledTimes(1);
      expect(callbacks.onShuffleToggle).toHaveBeenCalledTimes(1);
      expect(callbacks.onPrevious).not.toHaveBeenCalled();
      expect(callbacks.onRepeatToggle).not.toHaveBeenCalled();
    });
  });

  describe('Disabled States', () => {
    it('should disable previous button when disablePrevious is true', () => {
      render(<Controls {...defaultProps} disablePrevious={true} />);

      const button = screen.getByLabelText(/previous/i);

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('should disable next button when disableNext is true', () => {
      render(<Controls {...defaultProps} disableNext={true} />);

      const button = screen.getByLabelText(/next/i);

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('should have both previous and next disabled simultaneously', () => {
      render(
        <Controls 
          {...defaultProps}
          disablePrevious={true}
          disableNext={true}
        />
      );

      const prevButton = screen.getByLabelText(/previous/i);
      const nextButton = screen.getByLabelText(/next/i);

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should enable buttons when disabled props are false', () => {
      render(
        <Controls 
          {...defaultProps}
          disablePrevious={false}
          disableNext={false}
        />
      );

      const prevButton = screen.getByLabelText(/previous/i);
      const nextButton = screen.getByLabelText(/next/i);

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it('should never disable play/pause button', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/play/i);

      expect(button).not.toBeDisabled();
    });

    it('should update disabled state when props change', () => {
      const { rerender } = render(
        <Controls {...defaultProps} disableNext={false} />
      );

      let button = screen.getByLabelText(/next/i);
      expect(button).not.toBeDisabled();

      rerender(<Controls {...defaultProps} disableNext={true} />);

      button = screen.getByLabelText(/next/i);
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on all buttons', () => {
      render(<Controls {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have dynamic aria-label on play/pause button', () => {
      const { rerender } = render(<Controls {...defaultProps} isPlaying={false} />);

      let button = screen.getByLabelText(/play/i);
      expect(button.getAttribute('aria-label')).toMatch(/play/i);

      rerender(<Controls {...defaultProps} isPlaying={true} />);

      button = screen.getByLabelText(/pause/i);
      expect(button.getAttribute('aria-label')).toMatch(/pause/i);
    });

    it('should have aria-pressed on shuffle button', () => {
      render(<Controls {...defaultProps} />);

      const button = screen.getByLabelText(/shuffle/i);

      expect(button).toHaveAttribute('aria-pressed');
    });

    it('should have disabled attribute on disabled buttons', () => {
      render(
        <Controls 
          {...defaultProps}
          disablePrevious={true}
          disableNext={true}
        />
      );

      const prevButton = screen.getByLabelText(/previous/i);
      const nextButton = screen.getByLabelText(/next/i);

      expect(prevButton).toHaveAttribute('disabled');
      expect(nextButton).toHaveAttribute('disabled');
    });

    it('should use semantic button elements', () => {
      render(<Controls {...defaultProps} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Dynamic States', () => {
    it('should change from play to pause icon', () => {
      const { rerender } = render(<Controls {...defaultProps} isPlaying={false} />);

      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();

      rerender(<Controls {...defaultProps} isPlaying={true} />);

      expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
    });

    it('should show shuffle active state', () => {
      const { rerender } = render(<Controls {...defaultProps} isShuffled={false} />);

      let button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<Controls {...defaultProps} isShuffled={true} />);

      button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should cycle through repeat modes', () => {
      const { rerender } = render(
        <Controls {...defaultProps} repeatMode={RepeatMode.OFF} />
      );

      expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();

      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ALL} />);
      expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();

      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ONE} />);
      expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();
    });

    it('should update disabled states dynamically', () => {
      const { rerender } = render(
        <Controls {...defaultProps} disableNext={false} />
      );

      let button = screen.getByLabelText(/next/i);
      expect(button).not.toBeDisabled();

      rerender(<Controls {...defaultProps} disableNext={true} />);

      button = screen.getByLabelText(/next/i);
      expect(button).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle both navigation buttons disabled', () => {
      render(
        <Controls 
          {...defaultProps}
          disablePrevious={true}
          disableNext={true}
        />
      );

      expect(screen.getByLabelText(/previous/i)).toBeDisabled();
      expect(screen.getByLabelText(/next/i)).toBeDisabled();
      expect(screen.getByLabelText(/play/i)).not.toBeDisabled();
    });

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();

      render(<Controls {...defaultProps} onNext={onNext} />);

      const button = screen.getByLabelText(/next/i);

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onNext).toHaveBeenCalledTimes(3);
    });

    it('should handle missing optional props', () => {
      const propsWithoutOptional = {
        isPlaying: false,
        onPlayPause: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        repeatMode: RepeatMode.OFF,
        isShuffled: false,
        onRepeatToggle: jest.fn(),
        onShuffleToggle: jest.fn()
        // disableNext and disablePrevious omitted
      };

      expect(() => render(<Controls {...propsWithoutOptional} />)).not.toThrow();
    });

    it('should not crash if callback throws error', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn(() => {
        throw new Error('Callback error');
      });

      render(<Controls {...defaultProps} onNext={onNext} />);

      const button = screen.getByLabelText(/next/i);

      // Should throw but component should have rendered
      await expect(user.click(button)).rejects.toThrow();
      expect(onNext).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should work at first song (previous disabled)', () => {
      render(
        <Controls 
          {...defaultProps}
          disablePrevious={true}
          disableNext={false}
        />
      );

      expect(screen.getByLabelText(/previous/i)).toBeDisabled();
      expect(screen.getByLabelText(/next/i)).not.toBeDisabled();
    });

    it('should work at last song (next disabled)', () => {
      render(
        <Controls 
          {...defaultProps}
          disablePrevious={false}
          disableNext={true}
        />
      );

      expect(screen.getByLabelText(/previous/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/next/i)).toBeDisabled();
    });

    it('should work with shuffle enabled and repeat ALL', () => {
      render(
        <Controls 
          {...defaultProps}
          isShuffled={true}
          repeatMode={RepeatMode.ALL}
        />
      );

      const shuffleButton = screen.getByLabelText(/shuffle/i);
      const repeatButton = screen.getByLabelText(/repeat/i);

      expect(shuffleButton).toHaveAttribute('aria-pressed', 'true');
      expect(repeatButton).toBeInTheDocument();
    });

    it('should work with repeat ONE active', () => {
      render(
        <Controls 
          {...defaultProps}
          repeatMode={RepeatMode.ONE}
        />
      );

      const repeatButton = screen.getByLabelText(/repeat/i);

      expect(repeatButton).toBeInTheDocument();
    });

    it('should have all buttons functional simultaneously', async () => {
      const user = userEvent.setup();
      const callbacks = {
        onPlayPause: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        onShuffleToggle: jest.fn(),
        onRepeatToggle: jest.fn()
      };

      render(<Controls {...defaultProps} {...callbacks} />);

      await user.click(screen.getByLabelText(/previous/i));
      await user.click(screen.getByLabelText(/play/i));
      await user.click(screen.getByLabelText(/next/i));
      await user.click(screen.getByLabelText(/shuffle/i));
      await user.click(screen.getByLabelText(/repeat/i));

      expect(callbacks.onPrevious).toHaveBeenCalledTimes(1);
      expect(callbacks.onPlayPause).toHaveBeenCalledTimes(1);
      expect(callbacks.onNext).toHaveBeenCalledTimes(1);
      expect(callbacks.onShuffleToggle).toHaveBeenCalledTimes(1);
      expect(callbacks.onRepeatToggle).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## TEST REQUIREMENTS

### User Interaction Testing:
- [ ] Use `userEvent` from @testing-library/user-event
- [ ] Test all button clicks
- [ ] Verify callbacks called
- [ ] Test disabled button behavior

### Accessibility Testing:
- [ ] Test aria-label on all buttons
- [ ] Test aria-pressed on toggles
- [ ] Test disabled attribute
- [ ] Verify semantic HTML

### Dynamic State Testing:
- [ ] Test icon changes (play/pause)
- [ ] Test aria-pressed changes (shuffle)
- [ ] Test repeat mode changes
- [ ] Test disabled state updates

### Callback Testing:
- [ ] Mock all callbacks with jest.fn()
- [ ] Verify exact call counts
- [ ] Test no calls when disabled
- [ ] Test independent callbacks

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/components/Controls.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Rendering - Basic | 4 |
| Play/Pause Button | 7 |
| Previous Button | 6 |
| Next Button | 6 |
| Shuffle Button | 7 |
| Repeat Button | 5 |
| Callback Testing | 7 |
| Disabled States | 6 |
| Accessibility | 5 |
| Dynamic States | 4 |
| Edge Cases | 4 |
| Integration | 5 |
| **TOTAL** | **66** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/components/Controls.test.tsx
npm test -- --coverage tests/components/Controls.test.tsx
```

---

## SPECIAL CASES TO CONSIDER

### 1. User Event vs FireEvent
Prefer userEvent for realistic interactions:
```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button);
```

### 2. Testing Disabled Buttons
```typescript
const button = screen.getByLabelText(/next/i);
expect(button).toBeDisabled();

await user.click(button);
expect(callback).not.toHaveBeenCalled();
```

### 3. Testing aria-pressed
```typescript
const button = screen.getByLabelText(/shuffle/i);
expect(button).toHaveAttribute('aria-pressed', 'true');
```

### 4. Testing Dynamic Icons
```typescript
const { rerender } = render(<Controls {...props} isPlaying={false} />);
expect(screen.getByLabelText(/play/i)).toBeInTheDocument();

rerender(<Controls {...props} isPlaying={true} />);
expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
```

### 5. Mock Callbacks
```typescript
const mockCallback = jest.fn();
// Use in tests
expect(mockCallback).toHaveBeenCalledTimes(1);
```

---

## ADDITIONAL NOTES

- Use userEvent for all interactions (more realistic)
- Test all 5 buttons thoroughly
- Verify ARIA attributes for accessibility
- Test dynamic state changes (icons, aria-pressed)
- Mock all callbacks with jest.fn()
- Test disabled states prevent clicks
- Verify semantic HTML (button elements)
- Test all RepeatMode values
- No need to test CSS (visual tests separate)
- Component is pure presentational (no complex logic)
