# TESTING PROMPT #3.1: `src/types/playback-modes.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** PlaybackModes Type Definitions (RepeatMode enum + PlaybackModes interface)

**File path:** `src/types/playback-modes.ts`

**Test file path:** `tests/types/playback-modes.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% (type definitions should be fully validated)

---

## CODE TO TEST
```typescript
// src/types/playback-modes.ts
/**
 * @module Types/PlaybackModes
 * @description
 * Type definitions for playback modes (repeat, shuffle) and volume control.
 */

/**
 * Repeat mode options for playlist playback
 */
export enum RepeatMode {
  /** No repeat - stop at end of playlist */
  OFF = 'off',

  /** Repeat entire playlist - loop back to start */
  ALL = 'all',

  /** Repeat current song - loop single track */
  ONE = 'one'
}

/**
 * Playback configuration state
 */
export interface PlaybackModes {
  /** Current repeat mode */
  repeat: RepeatMode;

  /** Whether shuffle is enabled */
  shuffle: boolean;

  /** Current volume level (0-100) */
  volume: number;

  /** Whether audio is muted */
  isMuted: boolean;
}
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
};```

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

### From Code Reviews:

**Component Objective:**
Defines playback mode types for the music player. RepeatMode enum provides three repeat options (OFF, ALL, ONE). PlaybackModes interface combines repeat mode, shuffle state, volume level, and mute status into a single configuration object. Used by usePlaylist and useAudioPlayer hooks to manage playback behavior.

**Requirements:**
- **NEW Feature:** Repeat mode with three states
- **NEW Feature:** Shuffle mode for random playback
- **NEW Feature:** Volume control with persistence
- **NEW Feature:** Mute/unmute functionality
- **NFR5:** Static typing for playback configuration
- **NFR17:** Persistent storage of playback preferences

**RepeatMode Enum Structure:**
```typescript
enum RepeatMode {
  OFF = 'off',    // No repeat - stop at playlist boundaries
  ALL = 'all',    // Repeat entire playlist - circular playback
  ONE = 'one'     // Repeat current song - loop single track
}
```

**PlaybackModes Interface Structure:**
```typescript
interface PlaybackModes {
  repeat: RepeatMode;     // Current repeat mode (enum value)
  shuffle: boolean;       // Shuffle enabled/disabled
  volume: number;         // Volume level 0-100
  isMuted: boolean;       // Mute state
}
```

**Validation Rules:**

**RepeatMode Enum:**
- Must be a **string enum** (values are lowercase strings)
- Exactly 3 modes: OFF, ALL, ONE
- Values are lowercase: 'off', 'all', 'one'
- Keys are UPPERCASE: OFF, ALL, ONE
- Must be exported

**PlaybackModes Interface:**
- All 4 properties are **required** (not optional)
- repeat uses **RepeatMode enum** (not plain string)
- shuffle is boolean
- volume is number (0-100 range validated elsewhere)
- isMuted is boolean
- Must be exported

**Usage Context:**
- Used by usePlaylist hook for repeat and shuffle state
- Used by useAudioPlayer hook for volume and mute state
- Used by Controls component to display mode buttons
- Persisted to localStorage for user preferences
- Repeat mode controls playlist navigation behavior
- Shuffle mode affects next/previous song selection

**RepeatMode Behavior:**
- **OFF:** Stop at first/last song, no wrapping
- **ALL:** Wrap to beginning after last song (circular)
- **ONE:** Stay on current song, don't advance

---

## USE CASE DIAGRAM

```
PlaybackModes Type Definitions
├── RepeatMode Enum
│   ├── OFF - No repeat behavior
│   ├── ALL - Loop entire playlist
│   └── ONE - Loop current song
│
└── PlaybackModes Interface
    ├── repeat (RepeatMode) - Controls playlist looping
    ├── shuffle (boolean) - Random playback order
    ├── volume (number) - Audio volume level
    └── isMuted (boolean) - Mute state
```

---

## TASK

Generate a complete unit test suite for the **PlaybackModes type definitions** that validates:

### 1. REPEATMODE ENUM TESTS
- Verify enum exists and is properly exported
- Verify all 3 modes are present (OFF, ALL, ONE)
- Verify enum values are lowercase strings
- Verify enum keys are UPPERCASE
- Verify value-to-key mapping correct
- Verify no additional modes exist
- Verify enum can be used in type annotations

### 2. REPEATMODE VALUE TESTS
For each mode:
- **OFF** equals 'off' (lowercase string)
- **ALL** equals 'all' (lowercase string)
- **ONE** equals 'one' (lowercase string)
- Keys match expected UPPERCASE format
- Values are strings (not numbers)

### 3. REPEATMODE USAGE TESTS
- Works in switch statements
- Supports equality comparisons
- Can be used as object keys
- Can iterate over values
- Works in type guards
- Supports cycling through modes

### 4. PLAYBACKMODES INTERFACE TESTS
- Verify interface exists and is properly exported
- Verify all 4 required properties exist
- Verify repeat uses RepeatMode enum (not string)
- Verify shuffle is boolean
- Verify volume is number
- Verify isMuted is boolean
- Verify no optional properties exist

### 5. TYPE VALIDATION TESTS
Test that TypeScript correctly:
- **Accepts valid PlaybackModes** with all properties
- **Rejects PlaybackModes with string repeat** instead of enum
- **Rejects objects missing any property**
- **Rejects objects with wrong property types**
- **Accepts all three RepeatMode values**

### 6. INTEGRATION TESTS
- PlaybackModes works with RepeatMode enum
- Can create PlaybackModes for each RepeatMode
- JSON serialization/deserialization
- Object spread and updates
- State management patterns

### 7. EDGE CASES
- Volume at boundaries (0, 100)
- Volume outside range (handled by logic, not type)
- All combinations of repeat/shuffle/mute
- Cycling through RepeatMode values
- Toggle patterns for boolean properties

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect } from '@jest/globals';
import { RepeatMode, PlaybackModes } from '@/types/playback-modes';

describe('PlaybackModes Type Definitions', () => {
  describe('RepeatMode Enum', () => {
    it('should export RepeatMode enum', () => {
      expect(RepeatMode).toBeDefined();
      expect(typeof RepeatMode).toBe('object');
    });

    it('should have all 3 repeat modes', () => {
      expect(RepeatMode.OFF).toBeDefined();
      expect(RepeatMode.ALL).toBeDefined();
      expect(RepeatMode.ONE).toBeDefined();
    });

    it('should have lowercase string values', () => {
      expect(typeof RepeatMode.OFF).toBe('string');
      expect(typeof RepeatMode.ALL).toBe('string');
      expect(typeof RepeatMode.ONE).toBe('string');
      
      expect(RepeatMode.OFF).toMatch(/^[a-z]+$/);
      expect(RepeatMode.ALL).toMatch(/^[a-z]+$/);
      expect(RepeatMode.ONE).toMatch(/^[a-z]+$/);
    });

    it('should have correct string values', () => {
      expect(RepeatMode.OFF).toBe('off');
      expect(RepeatMode.ALL).toBe('all');
      expect(RepeatMode.ONE).toBe('one');
    });

    it('should have UPPERCASE keys', () => {
      const keys = Object.keys(RepeatMode).filter(k => isNaN(Number(k)));
      
      keys.forEach(key => {
        expect(key).toMatch(/^[A-Z]+$/);
      });
      
      expect(keys).toContain('OFF');
      expect(keys).toContain('ALL');
      expect(keys).toContain('ONE');
    });

    it('should have exactly 3 modes', () => {
      const values = Object.values(RepeatMode);
      expect(values).toHaveLength(3);
    });

    it('should not have numeric values', () => {
      const values = Object.values(RepeatMode);
      values.forEach(value => {
        expect(typeof value).not.toBe('number');
      });
    });
  });

  describe('RepeatMode Enum Usage', () => {
    it('should work in switch statements', () => {
      const getDescription = (mode: RepeatMode): string => {
        switch (mode) {
          case RepeatMode.OFF:
            return 'No repeat';
          case RepeatMode.ALL:
            return 'Repeat all';
          case RepeatMode.ONE:
            return 'Repeat one';
        }
      };

      expect(getDescription(RepeatMode.OFF)).toBe('No repeat');
      expect(getDescription(RepeatMode.ALL)).toBe('Repeat all');
      expect(getDescription(RepeatMode.ONE)).toBe('Repeat one');
    });

    it('should support equality comparisons', () => {
      const mode: RepeatMode = RepeatMode.ALL;

      expect(mode === RepeatMode.ALL).toBe(true);
      expect(mode === RepeatMode.OFF).toBe(false);
      expect(mode === RepeatMode.ONE).toBe(false);
      expect(mode !== RepeatMode.OFF).toBe(true);
    });

    it('should work as object keys', () => {
      const modeLabels: Record<RepeatMode, string> = {
        [RepeatMode.OFF]: 'Off',
        [RepeatMode.ALL]: 'Repeat All',
        [RepeatMode.ONE]: 'Repeat One'
      };

      expect(modeLabels[RepeatMode.OFF]).toBe('Off');
      expect(modeLabels[RepeatMode.ALL]).toBe('Repeat All');
      expect(modeLabels[RepeatMode.ONE]).toBe('Repeat One');
    });

    it('should support iteration over values', () => {
      const modes = Object.values(RepeatMode);

      expect(modes).toContain('off');
      expect(modes).toContain('all');
      expect(modes).toContain('one');
      expect(modes).toHaveLength(3);
    });

    it('should work in type guards', () => {
      const isRepeatAll = (mode: RepeatMode): boolean => {
        return mode === RepeatMode.ALL;
      };

      expect(isRepeatAll(RepeatMode.ALL)).toBe(true);
      expect(isRepeatAll(RepeatMode.OFF)).toBe(false);
    });

    it('should support cycling through modes', () => {
      const cycleRepeatMode = (current: RepeatMode): RepeatMode => {
        switch (current) {
          case RepeatMode.OFF:
            return RepeatMode.ALL;
          case RepeatMode.ALL:
            return RepeatMode.ONE;
          case RepeatMode.ONE:
            return RepeatMode.OFF;
        }
      };

      expect(cycleRepeatMode(RepeatMode.OFF)).toBe(RepeatMode.ALL);
      expect(cycleRepeatMode(RepeatMode.ALL)).toBe(RepeatMode.ONE);
      expect(cycleRepeatMode(RepeatMode.ONE)).toBe(RepeatMode.OFF);
    });

    it('should support conditional logic', () => {
      const shouldLoop = (mode: RepeatMode): boolean => {
        return mode === RepeatMode.ALL || mode === RepeatMode.ONE;
      };

      expect(shouldLoop(RepeatMode.OFF)).toBe(false);
      expect(shouldLoop(RepeatMode.ALL)).toBe(true);
      expect(shouldLoop(RepeatMode.ONE)).toBe(true);
    });
  });

  describe('PlaybackModes Interface', () => {
    it('should accept valid PlaybackModes object', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(modes).toBeDefined();
      expect(modes).toHaveProperty('repeat');
      expect(modes).toHaveProperty('shuffle');
      expect(modes).toHaveProperty('volume');
      expect(modes).toHaveProperty('isMuted');
    });

    it('should use RepeatMode enum for repeat property', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 75,
        isMuted: false
      };

      expect(Object.values(RepeatMode)).toContain(modes.repeat);
      expect(modes.repeat).toBe(RepeatMode.ALL);
    });

    it('should have shuffle as boolean', () => {
      const modesOn: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: true,
        volume: 50,
        isMuted: false
      };

      const modesOff: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(typeof modesOn.shuffle).toBe('boolean');
      expect(typeof modesOff.shuffle).toBe('boolean');
      expect(modesOn.shuffle).toBe(true);
      expect(modesOff.shuffle).toBe(false);
    });

    it('should have volume as number', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 80,
        isMuted: false
      };

      expect(typeof modes.volume).toBe('number');
      expect(modes.volume).toBe(80);
    });

    it('should have isMuted as boolean', () => {
      const modesMuted: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: true
      };

      const modesUnmuted: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(typeof modesMuted.isMuted).toBe('boolean');
      expect(typeof modesUnmuted.isMuted).toBe('boolean');
      expect(modesMuted.isMuted).toBe(true);
      expect(modesUnmuted.isMuted).toBe(false);
    });

    it('should accept all three RepeatMode values', () => {
      const modesOff: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const modesAll: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const modesOne: PlaybackModes = {
        repeat: RepeatMode.ONE,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(modesOff.repeat).toBe(RepeatMode.OFF);
      expect(modesAll.repeat).toBe(RepeatMode.ALL);
      expect(modesOne.repeat).toBe(RepeatMode.ONE);
    });
  });

  describe('PlaybackModes Operations', () => {
    it('should work with JSON serialization', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 65,
        isMuted: false
      };

      const json = JSON.stringify(modes);
      const parsed: PlaybackModes = JSON.parse(json);

      expect(parsed.repeat).toBe('all'); // Serializes to string
      expect(parsed.shuffle).toBe(true);
      expect(parsed.volume).toBe(65);
      expect(parsed.isMuted).toBe(false);
    });

    it('should work with object spread', () => {
      const baseModes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const updatedModes: PlaybackModes = {
        ...baseModes,
        repeat: RepeatMode.ALL,
        shuffle: true
      };

      expect(updatedModes.repeat).toBe(RepeatMode.ALL);
      expect(updatedModes.shuffle).toBe(true);
      expect(updatedModes.volume).toBe(50); // Unchanged
      expect(baseModes.repeat).toBe(RepeatMode.OFF); // Original unchanged
    });

    it('should support partial updates', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 75,
        isMuted: false
      };

      // Update only volume
      const withNewVolume: PlaybackModes = { ...modes, volume: 100 };
      
      // Toggle mute
      const withMute: PlaybackModes = { ...modes, isMuted: !modes.isMuted };

      expect(withNewVolume.volume).toBe(100);
      expect(withNewVolume.repeat).toBe(RepeatMode.OFF);
      expect(withMute.isMuted).toBe(true);
    });

    it('should support toggle patterns for booleans', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const toggleShuffle: PlaybackModes = {
        ...modes,
        shuffle: !modes.shuffle
      };

      const toggleMute: PlaybackModes = {
        ...modes,
        isMuted: !modes.isMuted
      };

      expect(toggleShuffle.shuffle).toBe(true);
      expect(toggleMute.isMuted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should accept volume at minimum boundary', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 0,
        isMuted: false
      };

      expect(modes.volume).toBe(0);
    });

    it('should accept volume at maximum boundary', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 100,
        isMuted: false
      };

      expect(modes.volume).toBe(100);
    });

    it('should accept volume as decimal', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 66.5,
        isMuted: false
      };

      expect(modes.volume).toBe(66.5);
    });

    it('should handle all combinations of boolean properties', () => {
      const combinations: PlaybackModes[] = [
        { repeat: RepeatMode.OFF, shuffle: false, volume: 50, isMuted: false },
        { repeat: RepeatMode.OFF, shuffle: false, volume: 50, isMuted: true },
        { repeat: RepeatMode.OFF, shuffle: true, volume: 50, isMuted: false },
        { repeat: RepeatMode.OFF, shuffle: true, volume: 50, isMuted: true }
      ];

      combinations.forEach((combo, index) => {
        expect(combo).toBeDefined();
        expect(typeof combo.shuffle).toBe('boolean');
        expect(typeof combo.isMuted).toBe('boolean');
      });
    });

    it('should handle all RepeatMode combinations', () => {
      const repeatModes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];

      repeatModes.forEach(mode => {
        const playbackModes: PlaybackModes = {
          repeat: mode,
          shuffle: false,
          volume: 50,
          isMuted: false
        };

        expect(playbackModes.repeat).toBe(mode);
      });
    });

    it('should support complex state patterns', () => {
      // Shuffle with repeat all
      const shuffleAll: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 80,
        isMuted: false
      };

      // Muted with high volume
      const mutedHighVolume: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 100,
        isMuted: true
      };

      // Repeat one with shuffle (edge case - shuffle ignored)
      const repeatOneShuffle: PlaybackModes = {
        repeat: RepeatMode.ONE,
        shuffle: true,
        volume: 50,
        isMuted: false
      };

      expect(shuffleAll.repeat).toBe(RepeatMode.ALL);
      expect(shuffleAll.shuffle).toBe(true);
      expect(mutedHighVolume.isMuted).toBe(true);
      expect(repeatOneShuffle.repeat).toBe(RepeatMode.ONE);
    });
  });

  describe('Usage Patterns', () => {
    it('should support cycle repeat mode pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const cycleRepeat = (current: PlaybackModes): PlaybackModes => {
        const nextRepeat = 
          current.repeat === RepeatMode.OFF ? RepeatMode.ALL :
          current.repeat === RepeatMode.ALL ? RepeatMode.ONE :
          RepeatMode.OFF;

        return { ...current, repeat: nextRepeat };
      };

      const step1 = cycleRepeat(modes);
      const step2 = cycleRepeat(step1);
      const step3 = cycleRepeat(step2);

      expect(step1.repeat).toBe(RepeatMode.ALL);
      expect(step2.repeat).toBe(RepeatMode.ONE);
      expect(step3.repeat).toBe(RepeatMode.OFF);
    });

    it('should support volume adjustment pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const adjustVolume = (
        current: PlaybackModes,
        delta: number
      ): PlaybackModes => {
        const newVolume = Math.max(0, Math.min(100, current.volume + delta));
        return { ...current, volume: newVolume };
      };

      const increased = adjustVolume(modes, 20);
      const decreased = adjustVolume(modes, -30);

      expect(increased.volume).toBe(70);
      expect(decreased.volume).toBe(20);
    });

    it('should support mute toggle pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 75,
        isMuted: false
      };

      const toggleMute = (current: PlaybackModes): PlaybackModes => {
        return { ...current, isMuted: !current.isMuted };
      };

      const muted = toggleMute(modes);
      const unmuted = toggleMute(muted);

      expect(muted.isMuted).toBe(true);
      expect(unmuted.isMuted).toBe(false);
    });

    it('should support default state pattern', () => {
      const getDefaultModes = (): PlaybackModes => {
        return {
          repeat: RepeatMode.OFF,
          shuffle: false,
          volume: 70,
          isMuted: false
        };
      };

      const defaults = getDefaultModes();

      expect(defaults.repeat).toBe(RepeatMode.OFF);
      expect(defaults.shuffle).toBe(false);
      expect(defaults.volume).toBe(70);
      expect(defaults.isMuted).toBe(false);
    });

    it('should support localStorage serialization pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 85,
        isMuted: false
      };

      // Simulate localStorage save/load
      const saved = JSON.stringify(modes);
      const loaded = JSON.parse(saved);

      // Reconstruct with proper enum type
      const restored: PlaybackModes = {
        repeat: loaded.repeat as RepeatMode,
        shuffle: loaded.shuffle,
        volume: loaded.volume,
        isMuted: loaded.isMuted
      };

      expect(restored.repeat).toBe(RepeatMode.ALL);
      expect(restored.shuffle).toBe(true);
      expect(restored.volume).toBe(85);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety in functions', () => {
      const createModes = (
        repeat: RepeatMode,
        shuffle: boolean,
        volume: number,
        isMuted: boolean
      ): PlaybackModes => {
        return { repeat, shuffle, volume, isMuted };
      };

      const modes = createModes(RepeatMode.ALL, true, 60, false);

      expect(modes.repeat).toBe(RepeatMode.ALL);
      expect(modes.shuffle).toBe(true);
    });

    it('should support type guards', () => {
      const hasRepeat = (modes: PlaybackModes): boolean => {
        return modes.repeat !== RepeatMode.OFF;
      };

      const off: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const all: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(hasRepeat(off)).toBe(false);
      expect(hasRepeat(all)).toBe(true);
    });

    it('should work with readonly pattern', () => {
      const modes: Readonly<PlaybackModes> = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      // Can read
      expect(modes.volume).toBe(50);

      // Would fail at compile time:
      // modes.volume = 100;
    });
  });
});
```

---

## TEST REQUIREMENTS

### RepeatMode Enum Testing:
- [ ] Enum is string enum (lowercase values)
- [ ] All 3 modes present (OFF, ALL, ONE)
- [ ] Keys are UPPERCASE format
- [ ] Values are lowercase strings
- [ ] Exactly 3 modes (no extras)
- [ ] Works in switch statements

### PlaybackModes Interface Testing:
- [ ] All 4 properties required
- [ ] repeat uses RepeatMode enum (not string)
- [ ] shuffle is boolean
- [ ] volume is number
- [ ] isMuted is boolean
- [ ] Type safety maintained

### Integration Testing:
- [ ] RepeatMode and PlaybackModes work together
- [ ] JSON serialization/deserialization
- [ ] Object spread and updates
- [ ] Toggle and cycle patterns

### Edge Cases Testing:
- [ ] Volume boundaries (0, 100)
- [ ] All boolean combinations
- [ ] All RepeatMode combinations
- [ ] Complex state combinations
- [ ] localStorage patterns

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/types/playback-modes.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Test Category | Test Cases | Description |
|--------------|------------|-------------|
| RepeatMode Enum Structure | 7 | Validates enum exists, has 3 modes, string values |
| RepeatMode Enum Usage | 7 | Tests switch, equality, cycling, conditional logic |
| PlaybackModes Interface | 6 | Validates interface structure and property types |
| PlaybackModes Operations | 4 | Tests JSON, spread, updates, toggles |
| Edge Cases | 6 | Tests volume boundaries, combinations |
| Usage Patterns | 5 | Tests cycle, volume adjust, mute, defaults |
| Type Safety | 3 | Tests type safety and type guards |
| **TOTAL** | **38** | **Comprehensive playback modes testing** |

### 3. Expected Coverage Analysis
- **Line coverage:** N/A (type definitions, no runtime code)
- **Type coverage:** 100% (all enum values and properties validated)
- **Usage patterns:** 100% (all common patterns tested)
- **Edge cases:** Comprehensive (boundaries, combinations, state patterns)

### 4. Execution Instructions
```bash
# Run playback modes type tests
npm test tests/types/playback-modes.test.ts

# Run with coverage
npm test -- --coverage tests/types/playback-modes.test.ts

# Run in watch mode
npm test -- --watch tests/types/playback-modes.test.ts

# Run all type tests
npm test tests/types/
```

---

## SPECIAL CASES TO CONSIDER

### 1. RepeatMode String Enum
- Values are **lowercase strings**: 'off', 'all', 'one'
- Keys are **UPPERCASE**: OFF, ALL, ONE
- This is different from PlaybackError (UPPER_SNAKE_CASE)
- Better for UI display (can use value directly)

### 2. RepeatMode Behavior Patterns
- **OFF:** No looping, stop at boundaries
- **ALL:** Circular playlist, loop to beginning
- **ONE:** Loop current song indefinitely
- Cycling: OFF → ALL → ONE → OFF

### 3. Volume Range
- Type system allows any number
- Business logic enforces 0-100 range
- Can be decimal (66.5)
- Persisted to localStorage

### 4. Mute vs Volume
- Mute is independent of volume
- Volume preserved when muted
- Unmute restores previous volume
- Can have high volume + muted (edge case)

### 5. Shuffle + Repeat Combinations
- Shuffle + Repeat OFF: Random until end
- Shuffle + Repeat ALL: Random infinite loop
- Shuffle + Repeat ONE: Shuffle ignored
- All combinations are valid (type allows)

### 6. JSON Serialization
- Enum values serialize to strings
- Boolean/number values serialize correctly
- Can deserialize and type-cast back
- Used for localStorage persistence

---

## ADDITIONAL NOTES

- Focus on RepeatMode enum behavior and PlaybackModes structure
- Test TypeScript type safety at compile time
- Verify runtime behavior with enum values
- Cover all three RepeatMode values in tests
- Test all boolean property combinations
- Test volume boundaries and edge cases
- Verify JSON serialization works (for persistence)
- Test common state management patterns (toggle, cycle)
- No mocking needed (pure data structures)
- Tests should be fast and deterministic
