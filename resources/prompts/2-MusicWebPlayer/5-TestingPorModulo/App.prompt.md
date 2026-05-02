# TESTING PROMPT #17: `src/App.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** App Component

**File path:** `src/App.tsx`

**Test file path:** `tests/App.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module App
 * @category Components
 * @description
 * Root application component that serves as the entry point for the Music Web Player.
 * This component provides the overall layout structure and renders the main Player component.
 */

import React from 'react';
import { Player } from './components/Player';
import './styles/main.css';

/**
 * Root application component.
 * @returns React component
 * @category Components
 */
const App: React.FC = () => {
  return (
    <div className="app">
      {/* Skip to content link for accessibility */}
      {/*
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      */}

      {/* Application header */}
      <header className="app-header">
        <div className="app-header__content">
          {/*<span className="app-header__icon" aria-hidden="true">🎵</span>*/}
          <h1 className="app-header__title">Music Web Player</h1>
        </div>
      </header>

      {/* Main content area */}
      <main id="main-content" className="app-main">
        <Player />
      </main>

      {/* Optional footer - can be uncommented when needed */}
      {/* <footer className="app-footer">
        <p>
          Built with React + TypeScript | &copy; 2025 Music Web Player
        </p>
      </footer> */}
    </div>
  );
};

export default App;
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

### From Code Review #17:

**Component Objective:**
Root application component that wraps Player in application layout. Provides semantic HTML structure, optional header/footer, and global styles. Simple wrapper component with minimal logic. May include app title, branding, or version info.

**Requirements:**
- **NFR1:** Semantic HTML structure
- **NFR2:** Responsive design
- **NFR3:** Modular code structure
- **NFR7:** Responsive across devices

**Component Structure:**
```tsx
function App(): JSX.Element {
  return (
    <div className="app">
      <header>
        <h1>Music Web Player</h1>
      </header>
      
      <main>
        <Player />
      </main>
      
      <footer>
        {/* Optional footer content */}
      </footer>
    </div>
  );
}
```

**Critical Requirements:**

1. **Component Rendering:**
   - Returns JSX.Element
   - Renders without crashing
   - Pure presentational component
   - No internal state (or minimal state)

2. **Player Integration:**
   - Renders Player component
   - Player receives no props (self-contained)
   - Single Player instance
   - Player is main content

3. **Semantic HTML:**
   - Uses semantic elements (header, main, footer)
   - Proper document structure
   - Heading hierarchy (h1 for title)
   - ARIA landmarks (implicit from semantic HTML)

4. **App Container:**
   - Root div with className
   - Contains all app content
   - May have id="app" or similar

5. **Header (Optional):**
   - App title/branding
   - May include logo
   - h1 with app name
   - Navigation (if applicable)

6. **Footer (Optional):**
   - Copyright info
   - Links (GitHub, docs, etc.)
   - Version info
   - Credits

7. **Styling:**
   - CSS imported
   - Responsive layout
   - Global styles applied
   - Theme/design system

8. **Simplicity:**
   - Minimal logic
   - No complex state
   - No side effects
   - Just structure + Player

**Edge Cases:**
- Player fails to render → should still show structure
- No special error boundaries (handled by Player)
- Simple, straightforward wrapper

**Usage Context:**
- Rendered by main.tsx
- Top-level component
- Provides app structure
- Houses Player component

---

## USE CASE DIAGRAM

```
App Component
├── Root Container
│   └── <div className="app">
│
├── Header (Optional)
│   ├── <header>
│   ├── App title (h1)
│   └── Branding
│
├── Main Content
│   ├── <main>
│   └── <Player />
│
└── Footer (Optional)
    ├── <footer>
    ├── Copyright
    └── Links
```

---

## TASK

Generate a complete unit test suite for the **App component** that covers:

### 1. RENDERING - BASIC
Test basic rendering:
- Component renders without crashing
- Returns valid JSX
- No errors on mount
- App container exists

### 2. PLAYER INTEGRATION
Test Player component:
- Player component renders
- Single Player instance
- Player in correct location (main)
- Player receives no props

### 3. SEMANTIC HTML
Test HTML structure:
- Uses semantic elements (header, main, footer)
- Proper element hierarchy
- Header contains h1 (if present)
- Main contains Player

### 4. APP CONTAINER
Test root container:
- Root div exists
- Has className
- Contains all content
- Proper structure

### 5. HEADER (IF PRESENT)
Test header element:
- Header exists
- Contains app title
- Title is h1
- Proper heading hierarchy

### 6. FOOTER (IF PRESENT)
Test footer element:
- Footer exists
- Contains expected content
- Links work (if present)
- Copyright info (if present)

### 7. CONTENT STRUCTURE
Test layout:
- Logical content order
- Player is main content
- Header → Main → Footer order
- Accessibility structure

### 8. STYLING
Test CSS:
- Styles imported
- Classes applied
- Responsive design classes (if applicable)
- Theme applied

### 9. ACCESSIBILITY
Test accessibility:
- Semantic landmarks
- Heading hierarchy
- ARIA (if used)
- Keyboard navigation

### 10. EDGE CASES
Test edge cases:
- Renders with minimal structure
- Handles missing optional elements
- No unnecessary complexity

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import App from '@/App';

describe('App Component', () => {
  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<App />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should return valid JSX', () => {
      const { container } = render(<App />);

      expect(container.firstChild).not.toBeNull();
    });

    it('should not throw errors on mount', () => {
      expect(() => render(<App />)).not.toThrow();
    });

    it('should have root app container', () => {
      const { container } = render(<App />);

      const appDiv = container.querySelector('.app, #app, [class*="app"]');

      expect(appDiv || container.firstChild).toBeInTheDocument();
    });
  });

  describe('Player Integration', () => {
    it('should render Player component', () => {
      render(<App />);

      // Player should have audio element
      const audio = document.querySelector('audio');
      expect(audio).toBeInTheDocument();

      // Player should have controls
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
    });

    it('should render single Player instance', () => {
      render(<App />);

      const audioElements = document.querySelectorAll('audio');

      expect(audioElements).toHaveLength(1);
    });

    it('should render Player in main content area', () => {
      const { container } = render(<App />);

      const main = container.querySelector('main');
      
      if (main) {
        // Player should be inside main
        const audio = main.querySelector('audio');
        expect(audio).toBeInTheDocument();
      } else {
        // If no main tag, Player should still render
        const audio = document.querySelector('audio');
        expect(audio).toBeInTheDocument();
      }
    });

    it('should render Player without props', () => {
      // Player is self-contained, just verify it renders
      render(<App />);

      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic elements', () => {
      const { container } = render(<App />);

      // Check for semantic elements
      const header = container.querySelector('header');
      const main = container.querySelector('main');
      const footer = container.querySelector('footer');

      // At least some semantic structure should exist
      const hasSemantic = header || main || footer;
      expect(hasSemantic).toBeTruthy();
    });

    it('should have main element containing Player', () => {
      const { container } = render(<App />);

      const main = container.querySelector('main');

      if (main) {
        // Main should contain the player (audio element)
        const audio = main.querySelector('audio') || document.querySelector('audio');
        expect(audio).toBeInTheDocument();
      }
    });

    it('should have proper element hierarchy', () => {
      const { container } = render(<App />);

      // Root should have structured content
      expect(container.firstChild).toBeInTheDocument();
      
      // Should have some structure (div, header, main, etc.)
      const elements = container.querySelectorAll('*');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should have header with h1 if header exists', () => {
      const { container } = render(<App />);

      const header = container.querySelector('header');

      if (header) {
        const h1 = header.querySelector('h1');
        expect(h1).toBeInTheDocument();
      }
    });
  });

  describe('App Container', () => {
    it('should have root container', () => {
      const { container } = render(<App />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have className on root element', () => {
      const { container } = render(<App />);

      const rootElement = container.firstChild as HTMLElement;

      // Should have some class or id
      const hasIdentifier = rootElement.className || rootElement.id;
      expect(hasIdentifier).toBeTruthy();
    });

    it('should contain all app content', () => {
      const { container } = render(<App />);

      // Should have player content
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
      
      // Everything should be inside container
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have proper structure', () => {
      const { container } = render(<App />);

      const rootElement = container.firstChild;

      expect(rootElement).toBeInTheDocument();
      expect(rootElement?.childNodes.length).toBeGreaterThan(0);
    });
  });

  describe('Header', () => {
    it('should render header element if present', () => {
      const { container } = render(<App />);

      const header = container.querySelector('header');

      // If header exists, test it
      if (header) {
        expect(header).toBeInTheDocument();
      }
    });

    it('should have app title if header exists', () => {
      const { container } = render(<App />);

      const header = container.querySelector('header');

      if (header) {
        const heading = header.querySelector('h1, h2');
        expect(heading).toBeInTheDocument();
        
        // Should have some text content
        expect(heading?.textContent).toBeTruthy();
      }
    });

    it('should use h1 for app title', () => {
      const { container } = render(<App />);

      const h1 = container.querySelector('h1');

      if (h1) {
        expect(h1).toBeInTheDocument();
        expect(h1.textContent).toMatch(/music|player|app/i);
      }
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<App />);

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');

      if (headings.length > 0) {
        // First heading should be h1
        expect(headings[0].tagName).toBe('H1');
      }
    });
  });

  describe('Footer', () => {
    it('should render footer element if present', () => {
      const { container } = render(<App />);

      const footer = container.querySelector('footer');

      // If footer exists, test it
      if (footer) {
        expect(footer).toBeInTheDocument();
      }
    });

    it('should have content in footer if it exists', () => {
      const { container } = render(<App />);

      const footer = container.querySelector('footer');

      if (footer) {
        // Footer should have some content
        expect(footer.textContent?.trim()).toBeTruthy();
      }
    });

    it('should have links in footer if present', () => {
      const { container } = render(<App />);

      const footer = container.querySelector('footer');

      if (footer) {
        const links = footer.querySelectorAll('a');
        
        // If links exist, they should be valid
        links.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      }
    });
  });

  describe('Content Structure', () => {
    it('should have logical content order', () => {
      const { container } = render(<App />);

      const elements = Array.from(container.firstChild?.childNodes || []);

      // Should have some structured content
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should have Player as main content', () => {
      render(<App />);

      // Player controls should be present
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should follow header → main → footer order if present', () => {
      const { container } = render(<App />);

      const header = container.querySelector('header');
      const main = container.querySelector('main');
      const footer = container.querySelector('footer');

      if (header && main) {
        // Header should come before main
        const headerIndex = Array.from(container.firstChild?.childNodes || []).indexOf(header);
        const mainIndex = Array.from(container.firstChild?.childNodes || []).indexOf(main);
        expect(headerIndex).toBeLessThan(mainIndex);
      }

      if (main && footer) {
        // Main should come before footer
        const mainIndex = Array.from(container.firstChild?.childNodes || []).indexOf(main);
        const footerIndex = Array.from(container.firstChild?.childNodes || []).indexOf(footer);
        expect(mainIndex).toBeLessThan(footerIndex);
      }
    });

    it('should have accessible structure', () => {
      const { container } = render(<App />);

      // Should use semantic HTML or ARIA landmarks
      const landmarks = container.querySelectorAll('header, main, footer, nav, [role="banner"], [role="main"], [role="contentinfo"]');

      // Some accessibility structure should exist
      expect(landmarks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Styling', () => {
    it('should apply CSS classes', () => {
      const { container } = render(<App />);

      const rootElement = container.firstChild as HTMLElement;

      // Should have some class applied
      expect(rootElement.className.length).toBeGreaterThan(0);
    });

    it('should have structured layout', () => {
      const { container } = render(<App />);

      // Container should have structure
      const rootElement = container.firstChild;
      expect(rootElement?.childNodes.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic landmarks', () => {
      const { container } = render(<App />);

      const header = container.querySelector('header');
      const main = container.querySelector('main');
      const footer = container.querySelector('footer');

      // At least one landmark should exist
      const hasLandmarks = header || main || footer;
      expect(hasLandmarks).toBeTruthy();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<App />);

      const h1Elements = container.querySelectorAll('h1');

      // Should have at most one h1
      expect(h1Elements.length).toBeLessThanOrEqual(1);
    });

    it('should be keyboard navigable', () => {
      render(<App />);

      // Player controls should be keyboard accessible (buttons)
      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should have accessible content', () => {
      render(<App />);

      // All interactive elements should have accessible names
      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should render with minimal structure', () => {
      const { container } = render(<App />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
    });

    it('should handle missing optional elements', () => {
      const { container } = render(<App />);

      // Component should render even without header or footer
      expect(container).toBeInTheDocument();
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
    });

    it('should not have unnecessary complexity', () => {
      const { container } = render(<App />);

      // Should be relatively simple structure
      const depth = (node: Node, level = 0): number => {
        if (!node.childNodes.length) return level;
        return Math.max(...Array.from(node.childNodes).map(child => depth(child, level + 1)));
      };

      const maxDepth = depth(container);

      // Should not be overly nested (reasonable depth)
      expect(maxDepth).toBeLessThan(20);
    });

    it('should render consistently on multiple mounts', () => {
      const { container: container1, unmount } = render(<App />);
      const html1 = container1.innerHTML;

      unmount();

      const { container: container2 } = render(<App />);
      const html2 = container2.innerHTML;

      // Should render the same structure
      expect(html1).toBe(html2);
    });
  });

  describe('Integration', () => {
    it('should integrate Player seamlessly', () => {
      render(<App />);

      // All Player functionality should work
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('should provide proper context for Player', () => {
      const { container } = render(<App />);

      // Player should be in a proper container
      const audio = document.querySelector('audio');
      expect(audio?.parentElement).toBeInTheDocument();
    });

    it('should render complete application', () => {
      render(<App />);

      // All major features should be present
      expect(document.querySelector('audio')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });
});
```

---

## TEST REQUIREMENTS

### Component Testing:
- [ ] Test basic rendering
- [ ] Test Player integration
- [ ] Test semantic HTML
- [ ] Test structure

### Conditional Testing:
- [ ] Test header if present
- [ ] Test footer if present
- [ ] Handle optional elements gracefully
- [ ] Don't fail on missing optional parts

### Accessibility:
- [ ] Test semantic landmarks
- [ ] Test heading hierarchy
- [ ] Test keyboard navigation
- [ ] Test ARIA (if used)

### Simplicity:
- [ ] Keep tests simple
- [ ] Focus on structure
- [ ] Test Player renders
- [ ] Minimal mocking needed

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/App.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Rendering - Basic | 4 |
| Player Integration | 4 |
| Semantic HTML | 4 |
| App Container | 4 |
| Header | 4 |
| Footer | 3 |
| Content Structure | 4 |
| Styling | 2 |
| Accessibility | 4 |
| Edge Cases | 4 |
| Integration | 3 |
| **TOTAL** | **40** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/App.test.tsx
npm test -- --coverage tests/App.test.tsx
```

---

## SPECIAL CASES TO CONSIDER

### 1. Conditional Testing
App may have optional elements:
```typescript
const header = container.querySelector('header');
if (header) {
  // Test header
  expect(header).toBeInTheDocument();
}
```

### 2. Semantic HTML Testing
```typescript
const main = container.querySelector('main');
const hasPlayer = main?.querySelector('audio') || document.querySelector('audio');
expect(hasPlayer).toBeInTheDocument();
```

### 3. Player Verification
```typescript
// Verify Player rendered by checking its elements
expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
expect(screen.getByRole('progressbar')).toBeInTheDocument();
```

### 4. Minimal Mocking
App is simple wrapper - minimal mocking needed:
- No need to mock Player component
- No need to mock hooks
- Just test that structure exists

### 5. Flexibility
App structure may vary:
```typescript
// Test flexibly
const appDiv = container.querySelector('.app, #app, [class*="app"]');
expect(appDiv || container.firstChild).toBeInTheDocument();
```

---

## ADDITIONAL NOTES

- App is simple wrapper component - keep tests simple
- Focus on structure and Player integration
- Test optional elements conditionally
- Don't over-test styling (visual regression separate)
- Verify semantic HTML where present
- Test accessibility features
- Ensure Player renders and works
- No complex mocking needed
- Test should be straightforward
- Handle variations in structure gracefully
