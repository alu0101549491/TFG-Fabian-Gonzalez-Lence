# TESTING PROMPT #15: `src/components/Playlist.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** Playlist Component

**File path:** `src/components/Playlist.tsx`

**Test file path:** `tests/components/Playlist.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Components/Playlist
 * @category Components
 * @description
 * This component displays the playlist of songs and allows users to select, delete,
 * and add new songs. It integrates with the AddSongForm component.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Song } from '@types/song';
import { AddSongForm } from './AddSongForm';
import styles from '@styles/Playlist.module.css';

/**
 * Props for the Playlist component.
 * @category Components
 */
export interface PlaylistProps {
  /**
   * Array of songs in the playlist
   */
  songs: Song[];

  /**
   * Index of the currently playing song
   */
  currentSongIndex: number;

  /**
   * Callback when a song is selected
   * @param index - Index of the selected song
   */
  onSongSelect: (index: number) => void;

  /**
   * Callback when a new song is added
   * @param song - The new song to add
   */
  onAddSong: (song: Song) => void;

  /**
   * Callback when a song is removed
   * @param id - ID of the song to remove
   */
  onRemoveSong: (id: string) => void;
}

/**
 * Component that displays the playlist and allows song management.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Playlist: React.FC<PlaylistProps> = (props) => {
  // State for delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  // Ensure songs is always an array
  const songs = Array.isArray(props.songs) ? props.songs : [];

  /**
   * Handles clicking on a song to play it.
   * @param index - Index of the clicked song
   */
  const handleSongClick = (index: number): void => {
    props.onSongSelect(index);
  };

  /**
   * Handles clicking the delete button.
   * @param event - Click event
   * @param id - Song ID to delete
   */
  const handleDeleteClick = (event: React.MouseEvent, id: string): void => {
    event.stopPropagation(); // Prevent song selection

    if (deleteConfirmId === id) {
      // Second click confirms deletion
      props.onRemoveSong(id);
      setDeleteConfirmId(null);
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    } else {
      // First click asks for confirmation
      setDeleteConfirmId(id);

      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
      deleteTimerRef.current = window.setTimeout(() => {
        setDeleteConfirmId((current) => (current === id ? null : current));
        deleteTimerRef.current = null;
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  /**
   * Handles keyboard interaction for song selection.
   * @param event - Keyboard event
   * @param index - Song index
   */
  const handleKeyDown = (event: React.KeyboardEvent, index: number): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSongClick(index);
    }
  };

  const DEFAULT_COVER = '/covers/default-cover.jpg';

  /**
   * Handles image loading errors by setting a fallback image.
   * @param event - Image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = DEFAULT_COVER;
    event.currentTarget.alt = 'Default album cover';
  };

  /**
   * Handles adding a new song from the form.
   * @param song - The new song to add
   */
  const handleAddSong = (song: Song): void => {
    props.onAddSong(song);
  };

  return (
    <div className={styles.playlist}>
      <h3 className={styles.playlist__header}>
        Playlist ({songs.length} {songs.length === 1 ? 'song' : 'songs'})
      </h3>

      {/* Empty state */}
      {songs.length === 0 ? (
        <div className={styles.playlist__empty}>
          <p>No songs in playlist.</p>
          <p>Add your first song below!</p>
        </div>
      ) : (
        /* Song list */
        <ol className={styles.playlist__items}>
          {songs.map((song, index) => {
            const isActive = index === props.currentSongIndex;
            return (
              <li
                key={song.id}
                className={`${styles.playlist__item} ${isActive ? styles['playlist__item--active'] : ''}`}
                onClick={() => handleSongClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${song.title} by ${song.artist}${isActive ? ' (currently playing)' : ''}`}
              >
                {/* Thumbnail */}
                <img
                  src={song.cover}
                  alt={`${song.title} cover`}
                  className={styles['playlist__item-thumbnail']}
                  onError={handleImageError}
                />

                {/* Song info */}
                <div className={styles['playlist__item-info']}>
                  <p className={styles['playlist__item-title']} title={song.title}>
                    {song.title}
                  </p>
                  <p className={styles['playlist__item-artist']} title={song.artist}>
                    {song.artist}
                  </p>
                </div>

                {/* Currently playing indicator */}
                {index === props.currentSongIndex && (
                  <span className={styles['playlist__item-indicator']} aria-hidden="true">
                    ♫
                  </span>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  className={`${styles['playlist__item-delete']} ${
                    deleteConfirmId === song.id ? styles['playlist__item-delete--confirm'] : ''
                  }`}
                  onClick={(e) => handleDeleteClick(e, song.id)}
                  aria-label={
                    deleteConfirmId === song.id
                      ? `Confirm delete ${song.title}`
                      : `Remove ${song.title} from playlist`
                  }
                  title={
                    deleteConfirmId === song.id
                      ? 'Click again to confirm'
                      : 'Remove song'
                  }
                >
                  {deleteConfirmId === song.id ? '✓' : '×'}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {/* Add song form */}
      <AddSongForm onAddSong={handleAddSong} />
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

### From Code Review #15:

**Component Objective:**
Displays list of songs with track numbers, titles, artists, current song indicator, and delete buttons. Pure presentational component with click handlers delegated to parent. Shows empty state when no songs. Uses semantic list elements with proper accessibility.

**Requirements:**
- **FR14:** Display complete list of songs
- **FR16:** Remove songs from playlist
- **NFR1:** Semantic HTML (ol or ul)
- **NFR6:** Accessibility (ARIA, semantic markup)

**Component Signature:**
```typescript
interface PlaylistProps {
  songs: Song[];
  currentIndex: number;
  onSongSelect: (index: number) => void;
  onSongRemove: (id: string) => void;
}

function Playlist({ songs, currentIndex, onSongSelect, onSongRemove }: PlaylistProps): JSX.Element
```

**Critical Requirements:**

1. **Song List Display:**
   - Renders all songs from songs array
   - Uses map() to iterate over songs
   - Each song gets unique key prop (song.id)
   - Track numbers displayed (index + 1)
   - Song title and artist displayed

2. **Current Song Indicator:**
   - Highlights current song (currentIndex === index)
   - Visual distinction (CSS class or styling)
   - aria-current="true" on current song
   - Clear visual feedback

3. **Song Selection:**
   - Clicking song calls onSongSelect(index)
   - Entire song item clickable (not just text)
   - onSongSelect receives array index (0-based)
   - Selection works for all songs

4. **Delete Button:**
   - Each song has delete/remove button
   - Button calls onSongRemove(song.id)
   - stopPropagation prevents song selection when deleting
   - aria-label on delete button
   - Delete button receives song ID (not index)

5. **Empty State:**
   - Shows message when songs.length === 0
   - Message: "No songs in playlist" or similar
   - No errors when songs array is empty
   - Clear, helpful message

6. **Key Props:**
   - Each mapped song has key={song.id}
   - Keys are unique (song IDs)
   - NOT using index as key
   - Proper React list rendering

7. **Track Numbers:**
   - Displayed as index + 1 (1-based, not 0-based)
   - Track 1, Track 2, etc.
   - Sequential numbering
   - Displayed for all songs

8. **Semantic HTML:**
   - Uses <ol> (ordered list) or <ul> (unordered list)
   - Each song is <li> (list item)
   - Proper list structure
   - Accessible markup

9. **Accessibility:**
   - aria-current="true" on current song
   - aria-label on delete buttons
   - Semantic list elements
   - Keyboard accessible (native button behavior)

10. **Event Handling:**
    - onSongSelect receives index (number)
    - onSongRemove receives id (string)
    - Delete button uses stopPropagation
    - No event bubbling issues

**Usage Context:**
- Used by Player component
- Displays all songs in playlist
- Updates when songs added/removed
- Current indicator follows playback

---

## USE CASE DIAGRAM

```
Playlist Component
├── Song List
│   ├── map() over songs array
│   ├── key={song.id}
│   ├── Track numbers (index + 1)
│   └── Title and Artist display
│
├── Current Indicator
│   ├── Highlight when currentIndex === index
│   └── aria-current="true"
│
├── Song Selection
│   ├── onClick → onSongSelect(index)
│   └── Entire item clickable
│
├── Delete Button
│   ├── onClick → onSongRemove(id)
│   ├── stopPropagation
│   └── aria-label
│
└── Empty State
    └── Show message when songs.length === 0
```

---

## TASK

Generate a complete unit test suite for the **Playlist component** that covers:

### 1. RENDERING - BASIC
Test basic rendering:
- Component renders without crashing
- Renders list element (ol or ul)
- Renders all songs from array
- Empty array doesn't crash

### 2. SONG DISPLAY
Test song information display:
- All songs rendered
- Song titles displayed
- Song artists displayed
- Track numbers displayed (1-based)
- Correct number of songs rendered

### 3. KEY PROPS
Test React key props:
- Each song has unique key
- Keys use song.id (not index)
- No duplicate keys
- Proper list rendering

### 4. CURRENT SONG INDICATOR
Test current song highlighting:
- Current song is highlighted
- aria-current="true" on current song
- Only current song has indicator
- Indicator updates when currentIndex changes
- Visual distinction present

### 5. SONG SELECTION
Test clicking songs:
- Clicking song calls onSongSelect
- onSongSelect receives correct index
- Selection works for all songs
- First song (index 0) selectable
- Last song selectable
- Middle songs selectable

### 6. DELETE BUTTON
Test delete functionality:
- Each song has delete button
- Delete button calls onSongRemove
- onSongRemove receives song ID
- Delete uses stopPropagation
- Clicking delete doesn't trigger onSongSelect
- All songs have delete buttons

### 7. EMPTY STATE
Test empty playlist:
- Shows message when songs.length === 0
- No errors with empty array
- Empty message is visible
- No song elements rendered

### 8. TRACK NUMBERS
Test track numbering:
- Track numbers are 1-based (not 0)
- First song is Track 1
- Sequential numbering
- Numbers update with array changes

### 9. ACCESSIBILITY
Test accessibility features:
- Uses semantic list element (ol/ul)
- Each song is list item (li)
- aria-current on current song
- aria-label on delete buttons
- Keyboard accessible

### 10. EVENT HANDLING
Test event propagation:
- stopPropagation on delete button
- Delete doesn't trigger song select
- Song select works independently
- Both events can be tested

### 11. PROPS UPDATES
Test re-rendering:
- Updates when songs array changes
- Updates when currentIndex changes
- Adding songs re-renders correctly
- Removing songs re-renders correctly

### 12. EDGE CASES
Test edge cases:
- Single song playlist
- Very large playlist (100+ songs)
- Current song at index 0
- Current song at last index
- currentIndex out of bounds
- Empty strings in song data

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Playlist from '@/components/Playlist';
import { Song } from '@/types/song';

describe('Playlist Component', () => {
  // Mock songs
  const mockSongs: Song[] = [
    { id: '1', title: 'Song One', artist: 'Artist One', cover: '/1.jpg', url: '/1.mp3' },
    { id: '2', title: 'Song Two', artist: 'Artist Two', cover: '/2.jpg', url: '/2.mp3' },
    { id: '3', title: 'Song Three', artist: 'Artist Three', cover: '/3.jpg', url: '/3.mp3' },
    { id: '4', title: 'Song Four', artist: 'Artist Four', cover: '/4.jpg', url: '/4.mp3' },
    { id: '5', title: 'Song Five', artist: 'Artist Five', cover: '/5.jpg', url: '/5.mp3' }
  ];

  const defaultProps = {
    songs: mockSongs,
    currentIndex: 0,
    onSongSelect: jest.fn(),
    onSongRemove: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<Playlist {...defaultProps} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render list element', () => {
      render(<Playlist {...defaultProps} />);

      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
    });

    it('should render all songs from array', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = screen.getAllByRole('listitem');

      expect(listItems).toHaveLength(mockSongs.length);
    });

    it('should not crash with empty songs array', () => {
      expect(() => 
        render(<Playlist {...defaultProps} songs={[]} />)
      ).not.toThrow();
    });
  });

  describe('Song Display', () => {
    it('should display all song titles', () => {
      render(<Playlist {...defaultProps} />);

      mockSongs.forEach(song => {
        expect(screen.getByText(song.title)).toBeInTheDocument();
      });
    });

    it('should display all song artists', () => {
      render(<Playlist {...defaultProps} />);

      mockSongs.forEach(song => {
        expect(screen.getByText(song.artist)).toBeInTheDocument();
      });
    });

    it('should display track numbers (1-based)', () => {
      render(<Playlist {...defaultProps} />);

      // Track numbers should be 1, 2, 3, 4, 5
      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/4/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should render correct number of songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 2)} />);

      let listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(5);
    });
  });

  describe('Key Props', () => {
    it('should use song.id as key prop', () => {
      const { container } = render(<Playlist {...defaultProps} />);

      const listItems = container.querySelectorAll('li');

      // React adds keys internally, check that we have unique items
      expect(listItems.length).toBe(mockSongs.length);
    });

    it('should not use index as key', () => {
      // This is more of a code review check, but we can verify 
      // that songs are rendered in correct order
      render(<Playlist {...defaultProps} />);

      const titles = screen.getAllByText(/Song/);
      
      expect(titles[0]).toHaveTextContent('Song One');
      expect(titles[1]).toHaveTextContent('Song Two');
      expect(titles[2]).toHaveTextContent('Song Three');
    });

    it('should handle songs with unique IDs correctly', () => {
      const uniqueSongs = mockSongs.map((song, i) => ({
        ...song,
        id: `unique-${i}-${Date.now()}`
      }));

      expect(() => 
        render(<Playlist {...defaultProps} songs={uniqueSongs} />)
      ).not.toThrow();
    });
  });

  describe('Current Song Indicator', () => {
    it('should highlight current song', () => {
      render(<Playlist {...defaultProps} currentIndex={2} />);

      const listItems = screen.getAllByRole('listitem');
      const currentItem = listItems[2];

      // Current item should have aria-current
      expect(currentItem).toHaveAttribute('aria-current', 'true');
    });

    it('should have aria-current="true" on current song only', () => {
      render(<Playlist {...defaultProps} currentIndex={1} />);

      const listItems = screen.getAllByRole('listitem');

      listItems.forEach((item, index) => {
        if (index === 1) {
          expect(item).toHaveAttribute('aria-current', 'true');
        } else {
          expect(item).not.toHaveAttribute('aria-current', 'true');
        }
      });
    });

    it('should update indicator when currentIndex changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} currentIndex={0} />);

      let listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).toHaveAttribute('aria-current', 'true');

      rerender(<Playlist {...defaultProps} currentIndex={2} />);

      listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).not.toHaveAttribute('aria-current', 'true');
      expect(listItems[2]).toHaveAttribute('aria-current', 'true');
    });

    it('should highlight first song when currentIndex is 0', () => {
      render(<Playlist {...defaultProps} currentIndex={0} />);

      const listItems = screen.getAllByRole('listitem');

      expect(listItems[0]).toHaveAttribute('aria-current', 'true');
    });

    it('should highlight last song when currentIndex is last', () => {
      render(<Playlist {...defaultProps} currentIndex={4} />);

      const listItems = screen.getAllByRole('listitem');

      expect(listItems[4]).toHaveAttribute('aria-current', 'true');
    });
  });

  describe('Song Selection', () => {
    it('should call onSongSelect when song is clicked', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = screen.getAllByRole('listitem');

      await user.click(listItems[2]);

      expect(onSongSelect).toHaveBeenCalledWith(2);
    });

    it('should pass correct index to onSongSelect', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = screen.getAllByRole('listitem');

      await user.click(listItems[0]);
      expect(onSongSelect).toHaveBeenCalledWith(0);

      await user.click(listItems[3]);
      expect(onSongSelect).toHaveBeenCalledWith(3);
    });

    it('should make first song selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const firstSong = screen.getByText('Song One').closest('li')!;

      await user.click(firstSong);

      expect(onSongSelect).toHaveBeenCalledWith(0);
    });

    it('should make last song selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const lastSong = screen.getByText('Song Five').closest('li')!;

      await user.click(lastSong);

      expect(onSongSelect).toHaveBeenCalledWith(4);
    });

    it('should make all songs selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = screen.getAllByRole('listitem');

      for (let i = 0; i < listItems.length; i++) {
        await user.click(listItems[i]);
        expect(onSongSelect).toHaveBeenCalledWith(i);
      }

      expect(onSongSelect).toHaveBeenCalledTimes(mockSongs.length);
    });
  });

  describe('Delete Button', () => {
    it('should render delete button for each song', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);

      expect(deleteButtons).toHaveLength(mockSongs.length);
    });

    it('should call onSongRemove when delete is clicked', async () => {
      const user = userEvent.setup();
      const onSongRemove = jest.fn();

      render(<Playlist {...defaultProps} onSongRemove={onSongRemove} />);

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);

      await user.click(deleteButtons[2]);

      expect(onSongRemove).toHaveBeenCalledWith('3');
    });

    it('should pass song ID to onSongRemove', async () => {
      const user = userEvent.setup();
      const onSongRemove = jest.fn();

      render(<Playlist {...defaultProps} onSongRemove={onSongRemove} />);

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);

      await user.click(deleteButtons[0]);
      expect(onSongRemove).toHaveBeenCalledWith('1');

      await user.click(deleteButtons[4]);
      expect(onSongRemove).toHaveBeenCalledWith('5');
    });

    it('should not trigger onSongSelect when delete is clicked', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onSongRemove = jest.fn();

      render(
        <Playlist 
          {...defaultProps}
          onSongSelect={onSongSelect}
          onSongRemove={onSongRemove}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);

      await user.click(deleteButtons[2]);

      expect(onSongRemove).toHaveBeenCalled();
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should have aria-label on delete buttons', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);

      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have delete button for all songs', () => {
      render(<Playlist {...defaultProps} />);

      const songs = screen.getAllByRole('listitem');
      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);

      expect(deleteButtons.length).toBe(songs.length);
    });
  });

  describe('Empty State', () => {
    it('should show message when songs array is empty', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      expect(screen.getByText(/no songs/i)).toBeInTheDocument();
    });

    it('should not crash with empty array', () => {
      const { container } = render(<Playlist {...defaultProps} songs={[]} />);

      expect(container).toBeInTheDocument();
    });

    it('should make empty message visible', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      const message = screen.getByText(/no songs/i);

      expect(message).toBeVisible();
    });

    it('should not render song elements when empty', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      const listItems = screen.queryAllByRole('listitem');

      expect(listItems).toHaveLength(0);
    });

    it('should transition from empty to populated', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={[]} />);

      expect(screen.getByText(/no songs/i)).toBeInTheDocument();

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(screen.queryByText(/no songs/i)).not.toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(mockSongs.length);
    });
  });

  describe('Track Numbers', () => {
    it('should display 1-based track numbers', () => {
      render(<Playlist {...defaultProps} />);

      // First song should show "1", not "0"
      const listItems = screen.getAllByRole('listitem');
      
      expect(within(listItems[0]).getByText(/1/)).toBeInTheDocument();
      expect(within(listItems[1]).getByText(/2/)).toBeInTheDocument();
      expect(within(listItems[2]).getByText(/3/)).toBeInTheDocument();
    });

    it('should start numbering at 1 not 0', () => {
      render(<Playlist {...defaultProps} />);

      const firstItem = screen.getAllByRole('listitem')[0];

      expect(within(firstItem).getByText(/1/)).toBeInTheDocument();
      expect(within(firstItem).queryByText(/0/)).not.toBeInTheDocument();
    });

    it('should have sequential numbering', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = screen.getAllByRole('listitem');

      listItems.forEach((item, index) => {
        const trackNumber = index + 1;
        expect(within(item).getByText(new RegExp(trackNumber.toString()))).toBeInTheDocument();
      });
    });

    it('should update numbers when array changes', () => {
      const { rerender } = render(
        <Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />
      );

      let listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(5);
      expect(within(listItems[4]).getByText(/5/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic list element', () => {
      render(<Playlist {...defaultProps} />);

      const list = screen.getByRole('list');

      expect(list.tagName).toMatch(/^(OL|UL)$/);
    });

    it('should render each song as list item', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = screen.getAllByRole('listitem');

      listItems.forEach(item => {
        expect(item.tagName).toBe('LI');
      });
    });

    it('should have aria-current on current song', () => {
      render(<Playlist {...defaultProps} currentIndex={1} />);

      const listItems = screen.getAllByRole('listitem');

      expect(listItems[1]).toHaveAttribute('aria-current', 'true');
    });

    it('should have aria-label on delete buttons', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button');

      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard accessible', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button');

      // Buttons are natively keyboard accessible
      deleteButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Event Handling', () => {
    it('should use stopPropagation on delete button', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onSongRemove = jest.fn();

      render(
        <Playlist 
          {...defaultProps}
          onSongSelect={onSongSelect}
          onSongRemove={onSongRemove}
        />
      );

      const deleteButton = screen.getAllByLabelText(/delete|remove/i)[1];

      await user.click(deleteButton);

      expect(onSongRemove).toHaveBeenCalledWith('2');
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should handle song select independently from delete', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onSongRemove = jest.fn();

      render(
        <Playlist 
          {...defaultProps}
          onSongSelect={onSongSelect}
          onSongRemove={onSongRemove}
        />
      );

      const listItem = screen.getAllByRole('listitem')[2];
      const deleteButton = within(listItem).getByLabelText(/delete|remove/i);

      // Click song
      await user.click(listItem);
      expect(onSongSelect).toHaveBeenCalledWith(2);

      onSongSelect.mockClear();

      // Click delete
      await user.click(deleteButton);
      expect(onSongRemove).toHaveBeenCalledWith('3');
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should call callbacks with correct parameters', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onSongRemove = jest.fn();

      render(
        <Playlist 
          {...defaultProps}
          onSongSelect={onSongSelect}
          onSongRemove={onSongRemove}
        />
      );

      const listItem = screen.getAllByRole('listitem')[3];
      const deleteButton = within(listItem).getByLabelText(/delete|remove/i);

      await user.click(listItem);
      expect(onSongSelect).toHaveBeenCalledWith(3); // index

      await user.click(deleteButton);
      expect(onSongRemove).toHaveBeenCalledWith('4'); // id
    });
  });

  describe('Props Updates', () => {
    it('should re-render when songs array changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 2)} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(2);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });

    it('should update when currentIndex changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} currentIndex={0} />);

      let listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).toHaveAttribute('aria-current', 'true');

      rerender(<Playlist {...defaultProps} currentIndex={3} />);

      listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).not.toHaveAttribute('aria-current', 'true');
      expect(listItems[3]).toHaveAttribute('aria-current', 'true');
    });

    it('should handle adding songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(3);

      const newSong: Song = {
        id: '6',
        title: 'New Song',
        artist: 'New Artist',
        cover: '/6.jpg',
        url: '/6.mp3'
      };

      rerender(<Playlist {...defaultProps} songs={[...mockSongs.slice(0, 3), newSong]} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(4);
      expect(screen.getByText('New Song')).toBeInTheDocument();
    });

    it('should handle removing songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(5);

      rerender(<Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.queryByText('Song Four')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single song playlist', () => {
      const singleSong = [mockSongs[0]];

      render(<Playlist {...defaultProps} songs={singleSong} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('Song One')).toBeInTheDocument();
    });

    it('should handle very large playlist', () => {
      const largeSongs = Array.from({ length: 100 }, (_, i) => ({
        id: `song-${i}`,
        title: `Song ${i}`,
        artist: `Artist ${i}`,
        cover: `/cover${i}.jpg`,
        url: `/song${i}.mp3`
      }));

      render(<Playlist {...defaultProps} songs={largeSongs} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(100);
    });

    it('should handle current song at index 0', () => {
      render(<Playlist {...defaultProps} currentIndex={0} />);

      const firstItem = screen.getAllByRole('listitem')[0];

      expect(firstItem).toHaveAttribute('aria-current', 'true');
    });

    it('should handle current song at last index', () => {
      render(<Playlist {...defaultProps} currentIndex={4} />);

      const lastItem = screen.getAllByRole('listitem')[4];

      expect(lastItem).toHaveAttribute('aria-current', 'true');
    });

    it('should handle currentIndex out of bounds gracefully', () => {
      expect(() => 
        render(<Playlist {...defaultProps} currentIndex={10} />)
      ).not.toThrow();
    });

    it('should handle empty strings in song data', () => {
      const songsWithEmpty: Song[] = [
        { id: '1', title: '', artist: '', cover: '', url: '' }
      ];

      expect(() => 
        render(<Playlist {...defaultProps} songs={songsWithEmpty} />)
      ).not.toThrow();
    });

    it('should handle songs with special characters', () => {
      const specialSongs: Song[] = [
        {
          id: '1',
          title: 'Song "Title" & More',
          artist: "Artist's Name",
          cover: '/cover.jpg',
          url: '/song.mp3'
        }
      ];

      render(<Playlist {...defaultProps} songs={specialSongs} />);

      expect(screen.getByText('Song "Title" & More')).toBeInTheDocument();
      expect(screen.getByText("Artist's Name")).toBeInTheDocument();
    });

    it('should handle rapid song selections', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = screen.getAllByRole('listitem');

      await user.click(listItems[0]);
      await user.click(listItems[2]);
      await user.click(listItems[4]);
      await user.click(listItems[1]);

      expect(onSongSelect).toHaveBeenCalledTimes(4);
    });

    it('should handle rapid delete clicks', async () => {
      const user = userEvent.setup();
      const onSongRemove = jest.fn();

      render(<Playlist {...defaultProps} onSongRemove={onSongRemove} />);

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);

      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[1]);
      await user.click(deleteButtons[2]);

      expect(onSongRemove).toHaveBeenCalledTimes(3);
    });
  });
});
```

---

## TEST REQUIREMENTS

### List Rendering:
- [ ] Test semantic list (ol/ul)
- [ ] Test list items (li)
- [ ] Test map() over songs
- [ ] Test unique keys (song.id)

### User Interaction:
- [ ] Use userEvent for clicks
- [ ] Test song selection
- [ ] Test delete buttons
- [ ] Test event propagation

### Accessibility:
- [ ] Test aria-current
- [ ] Test aria-label on buttons
- [ ] Test semantic HTML
- [ ] Test keyboard accessibility

### State Updates:
- [ ] Test currentIndex changes
- [ ] Test songs array changes
- [ ] Test re-rendering

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/components/Playlist.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Rendering - Basic | 4 |
| Song Display | 4 |
| Key Props | 3 |
| Current Indicator | 5 |
| Song Selection | 5 |
| Delete Button | 5 |
| Empty State | 5 |
| Track Numbers | 4 |
| Accessibility | 5 |
| Event Handling | 3 |
| Props Updates | 4 |
| Edge Cases | 10 |
| **TOTAL** | **57** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/components/Playlist.test.tsx
npm test -- --coverage tests/components/Playlist.test.tsx
```
