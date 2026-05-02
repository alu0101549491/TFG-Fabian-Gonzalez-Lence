# TESTING PROMPT #11: `src/components/TrackInfo.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** TrackInfo Component

**File path:** `src/components/TrackInfo.tsx`

**Test file path:** `tests/components/TrackInfo.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Components/TrackInfo
 * @category Components
 * @description
 * This component displays the current track information including cover art,
 * title, and artist. It's a pure presentational component with no internal state.
 */

import React from 'react';
import styles from '@styles/TrackInfo.module.css';

/**
 * Props for the TrackInfo component.
 * @category Components
 */
export interface TrackInfoProps {
  /**
   * Song title to display
   * @example "Bohemian Rhapsody"
   */
  title: string;

  /**
   * Artist name to display
   * @example "Queen"
   */
  artist: string;

  /**
   * URL to the cover art image
   * Should be square (1:1 aspect ratio)
   * @example "/covers/queen-bohemian.jpg"
   */
  cover: string;
}

const DEFAULT_COVER = '/covers/default-cover.jpg';

/**
 * Component that displays current track information including cover art,
 * title, and artist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const TrackInfo: React.FC<TrackInfoProps> = React.memo(
  ({ title, artist, cover }) => {
    /**
     * Handles image loading errors by setting a fallback image.
     * @param e The image error event
     */
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = DEFAULT_COVER;
      e.currentTarget.alt = 'Default album cover';
    };

    // Handle empty or missing props with fallback values
    const displayTitle = title || 'Unknown Title';
    const displayArtist = artist || 'Unknown Artist';
    const displayCover = cover || DEFAULT_COVER;

    return (
      <div className={styles['track-info']}>
        <img
          src={displayCover}
          alt={`${displayTitle} by ${displayArtist} album cover`}
          className={styles['track-info__cover']}
          onError={handleImageError}
          loading="lazy"
        />
        <div className={styles['track-info__details']}>
          <h2
            className={styles['track-info__title']}
            title={displayTitle} // Tooltip shows full text on hover
          >
            {displayTitle}
          </h2>
          <p
            className={styles['track-info__artist']}
            title={displayArtist} // Tooltip shows full text on hover
          >
            {displayArtist}
          </p>
        </div>
      </div>
    );
  },
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

### From Code Review #11:

**Component Objective:**
Pure presentational component that displays current song information (cover image, title, artist). No state, no business logic. Props-driven rendering with proper accessibility. Shows placeholder when no song playing.

**Requirements:**
- **FR10:** Display current song information
- **NFR1:** Semantic HTML structure
- **NFR2:** Responsive design
- **NFR6:** Accessibility (ARIA labels, alt text)

**Component Signature:**
```typescript
interface TrackInfoProps {
  title: string;
  artist: string;
  cover: string;
}

function TrackInfo({ title, artist, cover }: TrackInfoProps): JSX.Element
```

**Critical Requirements:**

1. **Cover Image:**
   - `<img>` element with src={cover}
   - Alt text: `"${title} by ${artist}"`
   - Should render even if cover URL invalid
   - Error handling for missing images (optional)

2. **Title Display:**
   - Displayed prominently
   - Semantic heading (h2 or h3)
   - Shows complete title text
   - Non-empty string

3. **Artist Display:**
   - Displayed below/near title
   - Semantic paragraph or span
   - Shows complete artist name
   - Non-empty string

4. **No Song State:**
   - Shows placeholder when title is empty
   - Shows placeholder when artist is empty
   - Placeholder text: "No song playing" or similar
   - OR shows default cover image

5. **Accessibility:**
   - Alt text on image
   - Semantic HTML (heading for title)
   - Proper ARIA labels (optional)
   - Keyboard accessible (no special handling needed)

6. **Pure Component:**
   - No internal state
   - No side effects
   - Props in → JSX out
   - Can use React.memo (optional)

**Expected Structure:**
```tsx
<div className="track-info">
  <img src={cover} alt={`${title} by ${artist}`} />
  <h2>{title}</h2>
  <p>{artist}</p>
</div>
```

**Edge Cases:**
- Empty strings for title/artist → show placeholder
- Very long title/artist → should display (CSS handles truncation)
- Invalid cover URL → img still renders (browser handles 404)
- Special characters in title/artist → render correctly
- Unicode in title/artist → render correctly

**Usage Context:**
- Used by Player component
- Re-renders when song changes
- Should be optimized (React.memo if beneficial)
- No user interactions (pure display)

---

## USE CASE DIAGRAM

```
TrackInfo Component
├── Display Cover Image
│   ├── src from props
│   └── alt text from title/artist
│
├── Display Title
│   └── Semantic heading
│
├── Display Artist
│   └── Semantic text
│
└── Handle No Song
    └── Show placeholder
```

---

## TASK

Generate a complete unit test suite for the **TrackInfo component** that covers:

### 1. RENDERING - BASIC
Test basic rendering:
- Component renders without crashing
- Component accepts all required props
- Component returns valid JSX
- Component renders with typical props

### 2. COVER IMAGE RENDERING
Test cover image:
- img element is rendered
- img src attribute is set to cover prop
- img has alt text
- Alt text format: "{title} by {artist}"
- Image renders with different URLs (http, https, relative)

### 3. TITLE RENDERING
Test title display:
- Title text is displayed
- Title uses semantic heading (h2 or h3)
- Title shows complete text from props
- Title handles very long strings
- Title handles special characters

### 4. ARTIST RENDERING
Test artist display:
- Artist text is displayed
- Artist uses semantic element (p or span)
- Artist shows complete text from props
- Artist handles very long strings
- Artist handles special characters

### 5. NO SONG STATE
Test placeholder when no song:
- Shows placeholder when title is empty
- Shows placeholder when artist is empty
- Shows placeholder when both empty
- Placeholder text is visible
- No error when empty props

### 6. ACCESSIBILITY
Test accessibility features:
- Image has alt attribute
- Alt text is descriptive
- Semantic HTML used (heading, paragraph)
- No missing ARIA labels (if used)
- Component structure is accessible

### 7. PROPS VALIDATION
Test prop handling:
- Component requires all three props (title, artist, cover)
- TypeScript enforces prop types
- Component handles prop updates
- Re-renders when props change

### 8. SPECIAL CHARACTERS
Test special character handling:
- Title with quotes ("Song")
- Title with apostrophes ('Song)
- Title with HTML entities (&amp;)
- Unicode characters (émojis, 日本語)
- Special symbols (@#$%^&*)

### 9. EDGE CASES
Test edge cases:
- Very long title (1000+ chars)
- Very long artist (1000+ chars)
- Empty strings for all props
- Whitespace-only strings
- Invalid cover URL (404)
- Cover URL with query parameters
- Cover URL with fragments

### 10. COMPONENT STRUCTURE
Test DOM structure:
- Container element exists
- Correct number of child elements
- Elements in correct order (image, title, artist)
- Proper CSS classes (if used)
- Semantic HTML structure

### 11. RE-RENDERING
Test re-rendering behavior:
- Component updates when props change
- Title update reflects in DOM
- Artist update reflects in DOM
- Cover update reflects in DOM
- No unnecessary re-renders (if using React.memo)

### 12. INTEGRATION
Test with realistic data:
- Component works with Song object props
- Component works with TimeFormatter (if used)
- Component displays typical song metadata
- Component handles all supported audio formats

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import TrackInfo from '@/components/TrackInfo';

describe('TrackInfo Component', () => {
  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(
        <TrackInfo 
          title="Test Song"
          artist="Test Artist"
          cover="/cover.jpg"
        />
      );

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should accept all required props', () => {
      const props = {
        title: 'Song Title',
        artist: 'Artist Name',
        cover: 'https://example.com/cover.jpg'
      };

      expect(() => render(<TrackInfo {...props} />)).not.toThrow();
    });

    it('should render with typical props', () => {
      const { container } = render(
        <TrackInfo 
          title="Midnight Dreams"
          artist="Luna Eclipse"
          cover="/covers/midnight-dreams.jpg"
        />
      );

      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('Cover Image Rendering', () => {
    it('should render img element', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('should set img src to cover prop', () => {
      const coverUrl = 'https://example.com/album-cover.jpg';

      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover={coverUrl}
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain(coverUrl);
    });

    it('should have alt text on image', () => {
      render(
        <TrackInfo 
          title="Test Song"
          artist="Test Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
    });

    it('should have alt text format "{title} by {artist}"', () => {
      render(
        <TrackInfo 
          title="Amazing Song"
          artist="Great Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByAltText('Amazing Song by Great Artist');
      expect(img).toBeInTheDocument();
    });

    it('should render with HTTP URL', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="http://example.com/cover.jpg"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('http://');
    });

    it('should render with HTTPS URL', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="https://example.com/cover.jpg"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('https://');
    });

    it('should render with relative URL', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/covers/album.jpg"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('/covers/album.jpg');
    });
  });

  describe('Title Rendering', () => {
    it('should display title text', () => {
      render(
        <TrackInfo 
          title="Electric Pulse"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Electric Pulse')).toBeInTheDocument();
    });

    it('should use semantic heading for title', () => {
      render(
        <TrackInfo 
          title="Song Title"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      const heading = screen.getByRole('heading', { name: 'Song Title' });
      expect(heading).toBeInTheDocument();
    });

    it('should show complete title text', () => {
      const longTitle = 'This is a very long song title that should display completely';

      render(
        <TrackInfo 
          title={longTitle}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long title strings', () => {
      const veryLongTitle = 'A'.repeat(1000);

      render(
        <TrackInfo 
          title={veryLongTitle}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(veryLongTitle)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const titleWithSpecialChars = 'Song "Title" with \'quotes\' & symbols!';

      render(
        <TrackInfo 
          title={titleWithSpecialChars}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(titleWithSpecialChars)).toBeInTheDocument();
    });
  });

  describe('Artist Rendering', () => {
    it('should display artist text', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="The Neon Knights"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('The Neon Knights')).toBeInTheDocument();
    });

    it('should show complete artist text', () => {
      const longArtist = 'This is a very long artist name that should display completely';

      render(
        <TrackInfo 
          title="Song"
          artist={longArtist}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(longArtist)).toBeInTheDocument();
    });

    it('should handle very long artist strings', () => {
      const veryLongArtist = 'B'.repeat(1000);

      render(
        <TrackInfo 
          title="Song"
          artist={veryLongArtist}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(veryLongArtist)).toBeInTheDocument();
    });

    it('should handle special characters in artist', () => {
      const artistWithSpecialChars = 'Artist "Name" with \'symbols\' @#$';

      render(
        <TrackInfo 
          title="Song"
          artist={artistWithSpecialChars}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(artistWithSpecialChars)).toBeInTheDocument();
    });
  });

  describe('No Song State', () => {
    it('should handle empty title gracefully', () => {
      expect(() => 
        render(
          <TrackInfo 
            title=""
            artist="Artist"
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should handle empty artist gracefully', () => {
      expect(() => 
        render(
          <TrackInfo 
            title="Song"
            artist=""
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should handle empty title and artist', () => {
      expect(() => 
        render(
          <TrackInfo 
            title=""
            artist=""
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should show placeholder when no song playing', () => {
      const { container } = render(
        <TrackInfo 
          title=""
          artist=""
          cover=""
        />
      );

      // Should either show placeholder text or render without error
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have alt attribute on image', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
    });

    it('should have descriptive alt text', () => {
      render(
        <TrackInfo 
          title="Accessible Song"
          artist="Accessible Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      const altText = img.getAttribute('alt');
      
      expect(altText).toContain('Accessible Song');
      expect(altText).toContain('Accessible Artist');
    });

    it('should use semantic HTML for title', () => {
      render(
        <TrackInfo 
          title="Semantic Title"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      // Should be a heading element
      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('Semantic Title');
    });

    it('should have accessible component structure', () => {
      const { container } = render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      // Should have proper structure
      expect(container.querySelector('img')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should accept title prop', () => {
      const title = 'Test Title';

      render(
        <TrackInfo 
          title={title}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('should accept artist prop', () => {
      const artist = 'Test Artist';

      render(
        <TrackInfo 
          title="Song"
          artist={artist}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(artist)).toBeInTheDocument();
    });

    it('should accept cover prop', () => {
      const cover = 'https://example.com/test-cover.jpg';

      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover={cover}
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain(cover);
    });

    it('should update when props change', () => {
      const { rerender } = render(
        <TrackInfo 
          title="Original Song"
          artist="Original Artist"
          cover="/original.jpg"
        />
      );

      expect(screen.getByText('Original Song')).toBeInTheDocument();

      rerender(
        <TrackInfo 
          title="Updated Song"
          artist="Updated Artist"
          cover="/updated.jpg"
        />
      );

      expect(screen.getByText('Updated Song')).toBeInTheDocument();
      expect(screen.queryByText('Original Song')).not.toBeInTheDocument();
    });
  });

  describe('Special Characters', () => {
    it('should handle title with quotes', () => {
      render(
        <TrackInfo 
          title='Song "Title" Here'
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Song "Title" Here')).toBeInTheDocument();
    });

    it('should handle title with apostrophes', () => {
      render(
        <TrackInfo 
          title="Don't Stop Me Now"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText("Don't Stop Me Now")).toBeInTheDocument();
    });

    it('should handle Unicode characters', () => {
      render(
        <TrackInfo 
          title="日本語のタイトル"
          artist="Артист"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('日本語のタイトル')).toBeInTheDocument();
      expect(screen.getByText('Артист')).toBeInTheDocument();
    });

    it('should handle emojis', () => {
      render(
        <TrackInfo 
          title="Song Title 🎵🎶"
          artist="Artist Name 🎤"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Song Title 🎵🎶')).toBeInTheDocument();
      expect(screen.getByText('Artist Name 🎤')).toBeInTheDocument();
    });

    it('should handle special symbols', () => {
      render(
        <TrackInfo 
          title="Song @#$%^&*()"
          artist="Artist !<>?"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Song @#$%^&*()')).toBeInTheDocument();
      expect(screen.getByText('Artist !<>?')).toBeInTheDocument();
    });

    it('should handle HTML entities', () => {
      render(
        <TrackInfo 
          title="Song & Title < > &quot;"
          artist="Artist & Name"
          cover="/cover.jpg"
        />
      );

      // React automatically escapes, should display correctly
      expect(screen.getByText(/Song & Title/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);

      const { container } = render(
        <TrackInfo 
          title={longTitle}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle very long artist', () => {
      const longArtist = 'B'.repeat(1000);

      const { container } = render(
        <TrackInfo 
          title="Song"
          artist={longArtist}
          cover="/cover.jpg"
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle empty strings for all props', () => {
      expect(() => 
        render(
          <TrackInfo 
            title=""
            artist=""
            cover=""
          />
        )
      ).not.toThrow();
    });

    it('should handle whitespace-only strings', () => {
      expect(() => 
        render(
          <TrackInfo 
            title="   "
            artist="   "
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should handle invalid cover URL gracefully', () => {
      const { container } = render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="https://invalid-url-404.example.com/missing.jpg"
        />
      );

      // Image should still render, browser handles 404
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
    });

    it('should handle cover URL with query parameters', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="https://example.com/cover.jpg?w=300&h=300&token=abc123"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('?w=300');
    });

    it('should handle cover URL with fragment', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="https://example.com/cover.jpg#section"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toBeDefined();
    });
  });

  describe('Component Structure', () => {
    it('should have container element', () => {
      const { container } = render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(container.firstChild).not.toBeNull();
    });

    it('should have image element', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should have title heading', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should have artist text', () => {
      render(
        <TrackInfo 
          title="Song"
          artist="Artist Name"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Artist Name')).toBeInTheDocument();
    });

    it('should render elements in logical order', () => {
      const { container } = render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      // Get all elements
      const elements = container.querySelectorAll('*');
      
      // Should have img, heading, and text element
      expect(elements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Re-rendering', () => {
    it('should update title when prop changes', () => {
      const { rerender } = render(
        <TrackInfo 
          title="First Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('First Song')).toBeInTheDocument();

      rerender(
        <TrackInfo 
          title="Second Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Second Song')).toBeInTheDocument();
      expect(screen.queryByText('First Song')).not.toBeInTheDocument();
    });

    it('should update artist when prop changes', () => {
      const { rerender } = render(
        <TrackInfo 
          title="Song"
          artist="First Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('First Artist')).toBeInTheDocument();

      rerender(
        <TrackInfo 
          title="Song"
          artist="Second Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Second Artist')).toBeInTheDocument();
      expect(screen.queryByText('First Artist')).not.toBeInTheDocument();
    });

    it('should update cover when prop changes', () => {
      const { rerender } = render(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover1.jpg"
        />
      );

      let img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('cover1.jpg');

      rerender(
        <TrackInfo 
          title="Song"
          artist="Artist"
          cover="/cover2.jpg"
        />
      );

      img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('cover2.jpg');
    });

    it('should update alt text when title or artist changes', () => {
      const { rerender } = render(
        <TrackInfo 
          title="Original"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByAltText('Original by Artist')).toBeInTheDocument();

      rerender(
        <TrackInfo 
          title="Updated"
          artist="New Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByAltText('Updated by New Artist')).toBeInTheDocument();
      expect(screen.queryByAltText('Original by Artist')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with realistic song data', () => {
      render(
        <TrackInfo 
          title="Midnight Dreams"
          artist="Luna Eclipse"
          cover="/covers/midnight-dreams.jpg"
        />
      );

      expect(screen.getByText('Midnight Dreams')).toBeInTheDocument();
      expect(screen.getByText('Luna Eclipse')).toBeInTheDocument();
      expect(screen.getByAltText('Midnight Dreams by Luna Eclipse')).toBeInTheDocument();
    });

    it('should display multiple different songs correctly', () => {
      const songs = [
        { title: 'Song 1', artist: 'Artist 1', cover: '/1.jpg' },
        { title: 'Song 2', artist: 'Artist 2', cover: '/2.jpg' },
        { title: 'Song 3', artist: 'Artist 3', cover: '/3.jpg' }
      ];

      const { rerender } = render(
        <TrackInfo {...songs[0]} />
      );

      songs.forEach(song => {
        rerender(<TrackInfo {...song} />);
        expect(screen.getByText(song.title)).toBeInTheDocument();
        expect(screen.getByText(song.artist)).toBeInTheDocument();
      });
    });

    it('should handle all supported audio formats metadata', () => {
      const formats = [
        { title: 'MP3 Song', artist: 'Artist 1', cover: '/mp3.jpg' },
        { title: 'WAV Song', artist: 'Artist 2', cover: '/wav.jpg' },
        { title: 'OGG Song', artist: 'Artist 3', cover: '/ogg.jpg' },
        { title: 'M4A Song', artist: 'Artist 4', cover: '/m4a.jpg' }
      ];

      formats.forEach(song => {
        const { unmount } = render(<TrackInfo {...song} />);
        expect(screen.getByText(song.title)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
```

---

## TEST REQUIREMENTS

### React Testing Library:
- [ ] Use `render` from @testing-library/react
- [ ] Use `screen` for queries
- [ ] Use semantic queries (getByRole, getByText, getByAltText)
- [ ] Test user-visible behavior, not implementation

### Accessibility Testing:
- [ ] Test alt text on images
- [ ] Test semantic HTML (headings)
- [ ] Verify ARIA attributes (if used)
- [ ] Check keyboard accessibility

### Component Testing:
- [ ] Test all props
- [ ] Test prop updates (rerender)
- [ ] Test edge cases (empty, long strings)
- [ ] Test special characters

### DOM Testing:
- [ ] Verify elements exist
- [ ] Check element attributes
- [ ] Test text content
- [ ] Validate structure

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/components/TrackInfo.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Rendering - Basic | 3 |
| Cover Image | 7 |
| Title | 5 |
| Artist | 4 |
| No Song State | 4 |
| Accessibility | 4 |
| Props Validation | 4 |
| Special Characters | 6 |
| Edge Cases | 7 |
| Component Structure | 5 |
| Re-rendering | 4 |
| Integration | 3 |
| **TOTAL** | **56** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/components/TrackInfo.test.tsx
npm test -- --coverage tests/components/TrackInfo.test.tsx
```

---

## SPECIAL CASES TO CONSIDER

### 1. React Testing Library Queries
Prefer semantic queries:
```typescript
// Good
screen.getByRole('img')
screen.getByRole('heading')
screen.getByText('Song Title')
screen.getByAltText('Song by Artist')

// Avoid
container.querySelector('.title')
```

### 2. Image Alt Text Testing
```typescript
const img = screen.getByAltText('Song Title by Artist Name');
expect(img).toBeInTheDocument();
```

### 3. Prop Updates Testing
```typescript
const { rerender } = render(<TrackInfo {...props1} />);
rerender(<TrackInfo {...props2} />);
// Verify new content displayed
```

### 4. Empty State Testing
Component should handle empty props gracefully:
```typescript
<TrackInfo title="" artist="" cover="" />
// Should not crash, may show placeholder
```

### 5. No Mocking Needed
TrackInfo is pure presentational - no mocks needed:
- No API calls
- No localStorage
- No hooks
- Just props → JSX

---

## ADDITIONAL NOTES

- Use React Testing Library (not Enzyme)
- Test user-visible behavior, not implementation details
- Focus on accessibility (alt text, semantic HTML)
- Test all prop combinations
- Verify re-rendering works correctly
- Test edge cases (empty, long, special characters)
- No need to test CSS (visual regression tests separate)
- Component should be pure (no side effects to test)
- Use semantic queries for accessibility
- Test with realistic data from Song objects
