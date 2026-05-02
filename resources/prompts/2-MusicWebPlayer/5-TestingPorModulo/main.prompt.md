# TESTING PROMPT #18: `src/main.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** main.tsx (Entry Point)

**File path:** `src/main.tsx`

**Test file path:** `tests/main.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module main
 * @description
 * Application entry point for the Music Web Player.
 *
 * This file is the main entry point for the React application. It:
 * 1. Imports the root App component
 * 2. Finds the root DOM element where React will mount
 * 3. Validates that the root element exists
 * 4. Creates a React root using React 18's createRoot API
 * 5. Renders the App component wrapped in React.StrictMode
 *
 * React.StrictMode is enabled in development to:
 * - Identify unsafe lifecycle methods
 * - Warn about legacy APIs
 * - Detect unexpected side effects
 * - Only runs in development mode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

/**
 * Get the root DOM element where React will mount.
 * Throws an error if the element doesn't exist.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find the root element. ' +
    'Make sure there is a <div id="root"></div> in your index.html'
  );
}

/**
 * Create React root and render the application.
 *
 * React.StrictMode:
 * - Identifies unsafe lifecycles
 * - Warns about legacy APIs
 * - Detects unexpected side effects
 * - Only runs in development mode
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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

### From Code Review #18:

**Component Objective:**
Application entry point that mounts React app to DOM. Uses ReactDOM.createRoot() API (React 18+). Renders App component into root element. May include StrictMode wrapper. Imports global styles. Simple bootstrapping file with minimal logic.

**Requirements:**
- **NFR3:** Modular code structure
- **NFR4:** Use of React hooks (via React 18)
- React 18+ API usage

**Expected Structure:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Global styles

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Critical Requirements:**

1. **React 18 API:**
   - Uses ReactDOM.createRoot() (NOT ReactDOM.render())
   - React 18+ concurrent rendering
   - Modern API usage

2. **Root Element:**
   - Gets element by ID ('root')
   - Validates root element exists
   - Throws error if not found (optional)
   - Type: HTMLElement

3. **App Rendering:**
   - Renders App component
   - App wrapped in StrictMode (optional but recommended)
   - Single render call
   - No props passed to App

4. **StrictMode (Optional):**
   - Wraps App in React.StrictMode
   - Development mode checks
   - Helps identify issues
   - Common best practice

5. **Global Styles:**
   - Imports CSS file (index.css or main.css)
   - Global styles applied
   - CSS imported before render

6. **Error Handling:**
   - Checks if root element exists
   - Throws descriptive error if missing
   - Prevents silent failures

7. **Module Imports:**
   - React imported
   - ReactDOM imported
   - App imported
   - CSS imported

8. **Simplicity:**
   - Minimal logic
   - Just bootstrapping
   - No state management
   - No complex operations

**Edge Cases:**
- Root element missing → error thrown
- Multiple calls (shouldn't happen in normal flow)
- Development vs production behavior

**Usage Context:**
- Entry point for entire application
- Executed once on page load
- Referenced in index.html
- Builds into bundle

---

## USE CASE DIAGRAM

```
main.tsx (Entry Point)
├── Get Root Element
│   ├── document.getElementById('root')
│   └── Validate exists
│
├── Create React Root
│   └── ReactDOM.createRoot(rootElement)
│
├── Render App
│   ├── React.StrictMode (optional)
│   └── <App />
│
└── Import Global Styles
    └── './index.css'
```

---

## TASK

Generate a complete unit test suite for **main.tsx** that covers:

### 1. MODULE IMPORTS
Test imports are present:
- React imported
- ReactDOM imported
- App imported
- CSS imported (verify import exists)

### 2. ROOT ELEMENT SELECTION
Test root element logic:
- Gets element by ID 'root'
- document.getElementById called
- Validates element exists

### 3. ERROR HANDLING
Test error cases:
- Throws error if root element not found
- Error message is descriptive
- Prevents rendering without root

### 4. REACT ROOT CREATION
Test createRoot API:
- ReactDOM.createRoot called
- Called with root element
- React 18 API used (not legacy render)

### 5. APP RENDERING
Test render call:
- root.render() called
- App component rendered
- Rendering happens once

### 6. STRICTMODE WRAPPER
Test StrictMode (if present):
- App wrapped in StrictMode
- React.StrictMode used
- Development mode benefits

### 7. GLOBAL STYLES
Test CSS import:
- CSS file imported
- Import statement exists
- Styles applied globally

### 8. EXECUTION FLOW
Test complete flow:
- All steps execute in order
- No errors during execution
- App successfully mounted

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('main.tsx Entry Point', () => {
  let rootElement: HTMLElement;
  let mockCreateRoot: jest.Mock;
  let mockRender: jest.Mock;

  beforeEach(() => {
    // Create mock root element
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Mock ReactDOM.createRoot
    mockRender = jest.fn();
    mockCreateRoot = jest.fn(() => ({
      render: mockRender,
      unmount: jest.fn()
    }));

    // Mock ReactDOM
    jest.mock('react-dom/client', () => ({
      createRoot: mockCreateRoot
    }));
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Module Imports', () => {
    it('should import React', () => {
      // ACT
      const mainModule = require('@/main');

      // React should be available
      expect(mainModule).toBeDefined();
    });

    it('should import ReactDOM', () => {
      const mainModule = require('@/main');

      expect(mainModule).toBeDefined();
    });

    it('should import App component', () => {
      const mainModule = require('@/main');

      expect(mainModule).toBeDefined();
    });

    it('should import global CSS', async () => {
      // Verify CSS import exists by checking if module loads without error
      expect(() => require('@/main')).not.toThrow();
    });
  });

  describe('Root Element Selection', () => {
    it('should get element by ID "root"', () => {
      // ARRANGE
      const getElementByIdSpy = jest.spyOn(document, 'getElementById');

      // ACT
      require('@/main');

      // ASSERT
      expect(getElementByIdSpy).toHaveBeenCalledWith('root');

      getElementByIdSpy.mockRestore();
    });

    it('should select the root element from DOM', () => {
      // ACT
      require('@/main');

      // Root element should still exist
      const root = document.getElementById('root');
      expect(root).toBeInTheDocument();
    });

    it('should use HTMLElement type for root', () => {
      const root = document.getElementById('root');

      expect(root).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Error Handling', () => {
    it('should throw error if root element not found', () => {
      // ARRANGE
      document.body.innerHTML = ''; // Remove root element

      // ACT & ASSERT
      expect(() => {
        jest.isolateModules(() => {
          require('@/main');
        });
      }).toThrow();
    });

    it('should have descriptive error message', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error: any) {
        expect(error.message).toMatch(/root/i);
      }
    });

    it('should prevent rendering without root element', () => {
      // ARRANGE
      document.body.innerHTML = '';
      const mockRender = jest.fn();

      // ACT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error) {
        // Expected
      }

      // ASSERT
      // Render should not have been called if root missing
      expect(mockRender).not.toHaveBeenCalled();
    });
  });

  describe('React Root Creation', () => {
    it('should call ReactDOM.createRoot', () => {
      // This test verifies the React 18 API is used
      // In actual implementation, this would be tested differently
      // For now, verify the file executes
      expect(() => require('@/main')).not.toThrow();
    });

    it('should call createRoot with root element', () => {
      // Verify root element is passed to createRoot
      const root = document.getElementById('root');
      expect(root).toBeInTheDocument();

      require('@/main');
    });

    it('should use React 18 API (not legacy render)', () => {
      // Verify modern API by checking file doesn't use ReactDOM.render
      // This is more of a code review check
      // Test that module loads successfully
      expect(() => require('@/main')).not.toThrow();
    });
  });

  describe('App Rendering', () => {
    it('should render App component', () => {
      // ACT
      require('@/main');

      // App should be mounted (verify by checking for Player elements)
      // In integration, audio element should exist
      // This test verifies the render happens
      expect(rootElement).toBeInTheDocument();
    });

    it('should call render method', () => {
      // Verify render is called as part of execution
      require('@/main');

      // Root should have content after render
      expect(rootElement).toBeInTheDocument();
    });

    it('should render only once', () => {
      // ACT
      require('@/main');

      // Should only render once during initialization
      // This is implicit - module only loads once
      expect(true).toBe(true);
    });
  });

  describe('StrictMode Wrapper', () => {
    it('should wrap App in StrictMode if present', () => {
      // This is more of a code structure check
      // Verify that the file loads without error
      expect(() => require('@/main')).not.toThrow();
    });

    it('should use React.StrictMode', () => {
      // Verify file structure through successful load
      require('@/main');

      expect(rootElement).toBeInTheDocument();
    });
  });

  describe('Global Styles', () => {
    it('should import CSS file', () => {
      // Verify CSS import doesn't cause errors
      expect(() => require('@/main')).not.toThrow();
    });

    it('should load styles before rendering', () => {
      // CSS should be imported at top of file
      // Verify by successful module load
      require('@/main');

      expect(rootElement).toBeInTheDocument();
    });
  });

  describe('Execution Flow', () => {
    it('should execute all steps in order', () => {
      // ARRANGE
      const getElementSpy = jest.spyOn(document, 'getElementById');

      // ACT
      require('@/main');

      // ASSERT
      expect(getElementSpy).toHaveBeenCalled();
      expect(rootElement).toBeInTheDocument();

      getElementSpy.mockRestore();
    });

    it('should complete without errors', () => {
      expect(() => require('@/main')).not.toThrow();
    });

    it('should successfully mount app', () => {
      // ACT
      require('@/main');

      // Root should have content
      expect(rootElement).toBeInTheDocument();
    });

    it('should be idempotent on multiple requires', () => {
      // First require
      require('@/main');
      
      // Second require (module cached)
      expect(() => require('@/main')).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should create fully functional app', () => {
      // ACT
      require('@/main');

      // Verify root exists and is ready
      const root = document.getElementById('root');
      expect(root).toBeInTheDocument();
    });

    it('should work in browser environment', () => {
      // Verify DOM APIs work
      expect(document.getElementById('root')).toBeInTheDocument();
      
      require('@/main');
      
      expect(rootElement).toBeInTheDocument();
    });

    it('should initialize React app correctly', () => {
      // ACT
      require('@/main');

      // Root should be ready for React
      expect(rootElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle root element being null initially then added', () => {
      // This tests the common case where root might not be immediately available
      // For this test, root is already present
      require('@/main');

      expect(document.getElementById('root')).toBeInTheDocument();
    });

    it('should handle multiple script loads gracefully', () => {
      // Module should only execute once even if required multiple times
      require('@/main');
      require('@/main');

      expect(document.getElementById('root')).toBeInTheDocument();
    });

    it('should work with existing DOM content', () => {
      // Add some existing content
      rootElement.innerHTML = '<div>Existing</div>';

      // Should still work
      require('@/main');

      expect(rootElement).toBeInTheDocument();
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error if root missing', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBeTruthy();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });

    it('should mention "root" in error message', () => {
      // ARRANGE
      document.body.innerHTML = '';

      // ACT & ASSERT
      try {
        jest.isolateModules(() => {
          require('@/main');
        });
      } catch (error: any) {
        expect(error.message).toMatch(/root/i);
      }
    });
  });

  describe('Module Structure', () => {
    it('should have no exports (side-effect module)', () => {
      const mainModule = require('@/main');

      // main.tsx typically has no exports
      // It's a side-effect module that just executes
      expect(typeof mainModule).toBe('object');
    });

    it('should execute immediately when required', () => {
      // Module should execute code immediately
      const getElementSpy = jest.spyOn(document, 'getElementById');

      require('@/main');

      expect(getElementSpy).toHaveBeenCalled();

      getElementSpy.mockRestore();
    });

    it('should be self-contained', () => {
      // Should not depend on external initialization
      expect(() => require('@/main')).not.toThrow();
    });
  });

  describe('React 18 Features', () => {
    it('should use createRoot API', () => {
      // Verify modern API usage through successful execution
      expect(() => require('@/main')).not.toThrow();
    });

    it('should support concurrent rendering', () => {
      // React 18 createRoot enables concurrent features
      // Verify by successful module load
      require('@/main');

      expect(rootElement).toBeInTheDocument();
    });

    it('should not use legacy ReactDOM.render', () => {
      // Verify by successful modern API usage
      require('@/main');

      expect(true).toBe(true);
    });
  });
});
```

---

## TEST REQUIREMENTS

### Module Testing:
- [ ] Use `require()` to load module
- [ ] Test side effects (rendering)
- [ ] Mock ReactDOM.createRoot
- [ ] Test error cases

### DOM Setup:
- [ ] Create root element in beforeEach
- [ ] Clean up in afterEach
- [ ] Mock document.getElementById
- [ ] Verify element selection

### Error Testing:
- [ ] Remove root element
- [ ] Use jest.isolateModules
- [ ] Catch and verify errors
- [ ] Check error messages

### Integration:
- [ ] Test complete execution flow
- [ ] Verify no errors
- [ ] Check root element state
- [ ] Test module caching

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/main.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Module Imports | 4 |
| Root Element Selection | 3 |
| Error Handling | 3 |
| React Root Creation | 3 |
| App Rendering | 3 |
| StrictMode Wrapper | 2 |
| Global Styles | 2 |
| Execution Flow | 4 |
| Integration | 3 |
| Edge Cases | 3 |
| Error Messages | 2 |
| Module Structure | 3 |
| React 18 Features | 3 |
| **TOTAL** | **38** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/main.test.tsx
npm test -- --coverage tests/main.test.tsx
```

---

## SPECIAL CASES TO CONSIDER

### 1. Testing Entry Points
Entry point files are tricky to test:
```typescript
// Use jest.isolateModules for fresh execution
jest.isolateModules(() => {
  require('@/main');
});
```

### 2. DOM Setup
```typescript
beforeEach(() => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
});

afterEach(() => {
  document.body.innerHTML = '';
});
```

### 3. Error Testing
```typescript
document.body.innerHTML = ''; // Remove root

expect(() => {
  jest.isolateModules(() => {
    require('@/main');
  });
}).toThrow(/root/i);
```

### 4. Module Caching
```typescript
// First require
require('@/main');

// Module is cached, won't re-execute
require('@/main');

// Use isolateModules for fresh execution
```

### 5. Side Effect Module
```typescript
// main.tsx has no exports typically
const mainModule = require('@/main');

// Module just executes side effects (rendering)
expect(() => require('@/main')).not.toThrow();
```

---

## ADDITIONAL NOTES

- main.tsx is side-effect module (no exports)
- Testing focuses on execution, not return values
- Use jest.isolateModules for error testing
- Mock ReactDOM.createRoot carefully
- Test error handling thoroughly
- Verify React 18 API usage
- Check root element selection
- Ensure proper cleanup between tests
- Test module caching behavior
- Integration test with App component
- Keep tests focused on bootstrapping logic
- Don't over-test framework code
- Focus on error cases and validation
