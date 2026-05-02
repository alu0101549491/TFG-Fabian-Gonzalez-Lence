Perfect! Let's move to **Module #15: `src/components/Playlist.tsx`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Components Layer - Presentational Components (Playlist Display and Management)

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
│   │   ├── ProgressBar.tsx            ← COMPLETED
│   │   ├── Playlist.tsx               ← CURRENT MODULE
│   │   └── AddSongForm.tsx            ← COMPLETED
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
import {Song} from '@types/song';
import {AddSongForm} from './AddSongForm';

/**
 * Props for the Playlist component.
 * @category Components
 */
export interface PlaylistProps {
  /** Array of songs in the playlist */
  songs: Song[];
  
  /** Index of the currently playing song */
  currentSongIndex: number;
  
  /** Callback when a song is selected */
  onSongSelect: (index: number) => void;
  
  /** Callback when a new song is added */
  onAddSong: (song: Song) => void;
  
  /** Callback when a song is removed */
  onRemoveSong: (id: string) => void;
}

/**
 * Component that displays the playlist and allows song management.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Playlist: React.FC<PlaylistProps> = (props) => {
  const handleSongClick = (index: number): void => {
    // TODO: Implementation
  };

  const handleDeleteClick = (id: string): void => {
    // TODO: Implementation
  };

  const handleAddSong = (song: Song): void => {
    // TODO: Implementation
  };

  // TODO: Implementation
  return (
    <div className="playlist">
      {/* TODO: Render playlist items and add song form */}
    </div>
  );
};
```
---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR14:** Display complete list of songs in playlist - the interface shows all available songs in the playlist with their titles and artists
- **FR15:** Add songs to local playlist - user can add new songs (via AddSongForm)
- **FR16:** Remove songs from playlist - user can delete existing songs through a specific button or action
- **FR18:** Real-time playlist update - when adding or removing songs, the list updates immediately without reloading

**Relevant Non-Functional Requirements:**
- **NFR3:** Modular code with separate React components
- **NFR5:** Static typing with TypeScript in all components
- **NFR6:** Intuitive and accessible interface - UI is easy to use with clear labels
- **NFR8:** Immediate response to user interactions - UI updates respond in less than 100ms

**UI Design Specifications (from Section 12):**
- **Playlist items:** Display thumbnail (48x48px), title, artist, delete button
- **Currently playing:** Highlighted with background color or border
- **Scrollable:** Max height with overflow for long playlists
- **Delete button:** Red hover color, clear icon (× or trash)
- **Click to play:** Clicking a song selects and plays it
- **AddSongForm:** Integrated at bottom of playlist

## 2. Class Diagram (Relevant Section)

```typescript
class Playlist {
    +props: PlaylistProps
    +render(): JSX.Element
    -handleSongClick(index: number): void
    -handleDeleteClick(id: string): void
    -handleAddSong(song: Song): void
}

class PlaylistProps {
    +songs: Song[]
    +currentSongIndex: number
    +onSongSelect: Function
    +onAddSong: Function
    +onRemoveSong: Function
}

class Song {
    <<interface>>
    +id: string
    +title: string
    +artist: string
    +cover: string
    +url: string
}

class AddSongForm {
    +props: AddSongFormProps
    +render(): JSX.Element
}
```

**Relationships:**
- Used by: `Player` component (renders Playlist with song data and callbacks)
- Uses: `AddSongForm` component (renders form at bottom)
- Uses: `Song` interface (displays song information)
- Presentational component: Minimal internal state, delegates actions to parent

## 3. Use Case Diagram (Relevant Use Cases)

- **View Playlist:** User sees complete list of songs
- **Select Song:** User clicks song → System plays that song
- **Remove Song:** User clicks delete → System removes song from playlist
- **Add Song:** User submits AddSongForm → System adds song to playlist
- **View Currently Playing:** User sees which song is currently active

---

# SPECIFIC TASK

Implement the React component: **`src/components/Playlist.tsx`**

## Responsibilities:

1. **Display list of all songs** with title, artist, and thumbnail
2. **Highlight currently playing song** with visual indicator
3. **Handle song selection** (click to play)
4. **Handle song deletion** with confirmation UX
5. **Render AddSongForm** at bottom of playlist
6. **Delegate actions** to parent callbacks
7. **Provide scrollable container** for long playlists
8. **Show empty state** when no songs in playlist
9. **Provide accessible list** with proper ARIA attributes

## Component Structure:

### **Playlist Component**

A presentational component that renders the song list and manages user interactions.

- **Description:** Displays all songs in the playlist with options to select and delete, plus form to add new songs
- **Type:** Functional Component (React.FC)
- **Props:** PlaylistProps interface
- **State:** Optional state for delete confirmation
- **Returns:** JSX.Element

---

## Props Interface:

### **PlaylistProps**

```typescript
/**
 * Props for the Playlist component
 */
interface PlaylistProps {
  /**
   * Array of all songs in the playlist
   * @example [{id: "1", title: "Song", artist: "Artist", cover: "...", url: "..."}]
   */
  songs: Song[];
  
  /**
   * Index of the currently playing song
   * Used to highlight the active song
   * @example 0 (first song), 2 (third song)
   */
  currentSongIndex: number;
  
  /**
   * Callback when user clicks a song to play it
   * Receives the index of the selected song
   * @param index - Index of the song to play
   */
  onSongSelect: (index: number) => void;
  
  /**
   * Callback when user adds a new song via the form
   * Receives the complete Song object
   * @param song - The new song to add
   */
  onAddSong: (song: Song) => void;
  
  /**
   * Callback when user deletes a song
   * Receives the song ID to remove
   * @param id - ID of the song to remove
   */
  onRemoveSong: (id: string) => void;
}
```

---

## Component Implementation Details:

### **JSX Structure:**

```jsx
<div className="playlist">
  <h3 className="playlist__header">Playlist ({props.songs.length} songs)</h3>
  
  {/* Empty state */}
  {props.songs.length === 0 ? (
    <div className="playlist__empty">
      <p>No songs in playlist.</p>
      <p>Add your first song below!</p>
    </div>
  ) : (
    /* Song list */
    <ul className="playlist__items" role="list">
      {props.songs.map((song, index) => (
        <li
          key={song.id}
          className={`playlist__item ${
            index === props.currentSongIndex ? 'playlist__item--active' : ''
          }`}
          onClick={() => handleSongClick(index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, index)}
          aria-label={`${song.title} by ${song.artist}${
            index === props.currentSongIndex ? ' (currently playing)' : ''
          }`}
        >
          {/* Thumbnail */}
          <img
            src={song.cover}
            alt={`${song.title} cover`}
            className="playlist__item-thumbnail"
            onError={handleImageError}
          />
          
          {/* Song info */}
          <div className="playlist__item-info">
            <p className="playlist__item-title">{song.title}</p>
            <p className="playlist__item-artist">{song.artist}</p>
          </div>
          
          {/* Currently playing indicator */}
          {index === props.currentSongIndex && (
            <span className="playlist__item-indicator" aria-hidden="true">
              ♫
            </span>
          )}
          
          {/* Delete button */}
          <button
            type="button"
            className="playlist__item-delete"
            onClick={(e) => handleDeleteClick(e, song.id)}
            aria-label={`Remove ${song.title} from playlist`}
            title="Remove song"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )}
  
  {/* Add song form */}
  <AddSongForm onAddSong={handleAddSong} />
</div>
```

### **Key Elements:**

1. **Container div (`playlist`):**
   - Wraps entire component
   - Provides layout structure
   - May have max-height with scroll

2. **Header:**
   - Shows "Playlist" title
   - Displays song count
   - Provides context

3. **Empty state:**
   - Shown when playlist is empty
   - Friendly message
   - Encourages adding songs

4. **Song list (`<ul>`):**
   - Semantic list element
   - Scrollable with max-height
   - ARIA role="list"

5. **Playlist item (`<li>`):**
   - Displays single song
   - Clickable (selects song)
   - Keyboard accessible
   - Highlights if currently playing
   - Contains: thumbnail, info, indicator, delete button

6. **Thumbnail image:**
   - 48x48px square
   - Cover art preview
   - Error handling for broken images

7. **Song info container:**
   - Title (primary text)
   - Artist (secondary text)
   - Takes up most horizontal space

8. **Currently playing indicator:**
   - Visual indicator (♫ or icon)
   - Only shown for active song
   - `aria-hidden` (info in aria-label)

9. **Delete button:**
   - Small button with × or trash icon
   - Red on hover
   - Click handler prevents song selection
   - Accessible with ARIA label

10. **AddSongForm:**
    - Rendered at bottom
    - Delegates to handleAddSong

---

## Event Handlers:

### 1. **handleSongClick(index: number): void**

Handles clicking on a song to play it.

- **Description:** Delegates song selection to parent
- **Parameters:**
  - `index` (number): Index of clicked song
- **Implementation:**
  ```typescript
  const handleSongClick = (index: number): void => {
    props.onSongSelect(index);
  };
  ```

### 2. **handleDeleteClick(event: React.MouseEvent, id: string): void**

Handles clicking the delete button.

- **Description:** Stops event propagation (prevent song selection) and delegates deletion
- **Parameters:**
  - `event` (React.MouseEvent): Click event
  - `id` (string): Song ID to delete
- **Implementation:**
  ```typescript
  const handleDeleteClick = (event: React.MouseEvent, id: string): void => {
    event.stopPropagation(); // Prevent song selection
    
    // Optional: Confirm deletion
    if (window.confirm('Remove this song from playlist?')) {
      props.onRemoveSong(id);
    }
  };
  ```

**Alternative with state-based confirmation:**
```typescript
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

const handleDeleteClick = (event: React.MouseEvent, id: string): void => {
  event.stopPropagation();
  
  if (deleteConfirmId === id) {
    // Second click confirms
    props.onRemoveSong(id);
    setDeleteConfirmId(null);
  } else {
    // First click asks for confirmation
    setDeleteConfirmId(id);
    
    // Reset after 3 seconds
    setTimeout(() => setDeleteConfirmId(null), 3000);
  }
};
```

### 3. **handleAddSong(song: Song): void**

Handles new song from AddSongForm.

- **Description:** Delegates to parent's onAddSong callback
- **Parameters:**
  - `song` (Song): New song to add
- **Implementation:**
  ```typescript
  const handleAddSong = (song: Song): void => {
    props.onAddSong(song);
  };
  ```

### 4. **handleKeyDown(event: React.KeyboardEvent, index: number): void**

Handles keyboard interaction for song selection.

- **Description:** Allows selecting songs with Enter or Space keys
- **Parameters:**
  - `event` (React.KeyboardEvent): Keyboard event
  - `index` (number): Song index
- **Implementation:**
  ```typescript
  const handleKeyDown = (event: React.KeyboardEvent, index: number): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSongClick(index);
    }
  };
  ```

### 5. **handleImageError(event: React.SyntheticEvent\<HTMLImageElement\>): void**

Handles broken thumbnail images.

- **Description:** Sets fallback image when thumbnail fails to load
- **Implementation:**
  ```typescript
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = '/covers/default-cover.jpg';
    event.currentTarget.alt = 'Default album cover';
  };
  ```

---

## Styling Approach:

**Note:** This component will have a separate CSS Module file (`Playlist.module.css`).

### **CSS Classes:**

```css
.playlist {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.playlist__header {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.playlist__empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.playlist__items {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: var(--spacing-lg);
}

.playlist__item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  gap: var(--spacing-sm);
  position: relative;
}

.playlist__item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.playlist__item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.playlist__item--active {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 3px solid var(--color-primary);
}

.playlist__item-thumbnail {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.playlist__item-info {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.playlist__item-title {
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist__item-artist {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist__item-indicator {
  color: var(--color-primary);
  font-size: 1.25rem;
  margin-right: var(--spacing-xs);
}

.playlist__item-delete {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: 4px;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.playlist__item-delete:hover {
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
}

.playlist__item-delete:focus-visible {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}

/* Scrollbar styling (optional) */
.playlist__items::-webkit-scrollbar {
  width: 8px;
}

.playlist__items::-webkit-scrollbar-track {
  background: var(--color-background);
}

.playlist__items::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.playlist__items::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
```

---

## Accessibility Features:

### 1. **Semantic HTML**
- `<ul>` for list
- `<li>` for items
- `role="list"` explicit (some CSS resets remove)
- `role="button"` on clickable items

### 2. **ARIA Attributes**
- `aria-label` on each item describing song and status
- `aria-label` on delete button
- `aria-hidden` on decorative indicator
- `tabIndex={0}` makes items keyboard focusable

### 3. **Keyboard Navigation**
- Tab through all songs and delete buttons
- Enter/Space selects song
- Focus visible with outline
- Logical tab order

### 4. **Screen Reader Support**
- List structure announced
- Song count in header
- Currently playing status announced
- Delete action clearly labeled

### 5. **Visual Feedback**
- Hover states on items and buttons
- Active song highlighted
- Focus indicators
- Delete button color change

---

## Edge Cases to Handle:

1. **Empty playlist:**
   - Show empty state message
   - Encourage adding songs
   - AddSongForm still visible

2. **Single song:**
   - List works normally
   - Can delete (playlist becomes empty)
   - Can add more

3. **Very long playlist:**
   - Scrollable container
   - Performance acceptable (virtual scrolling not needed for <1000 songs)

4. **Long song titles:**
   - Text truncation with ellipsis
   - Full text in title attribute (tooltip)

5. **Broken thumbnails:**
   - Fallback to placeholder image
   - No broken image icons

6. **Deleting currently playing song:**
   - Delete works
   - Parent handles playback transition
   - Highlight moves to new current song

7. **Rapid clicks:**
   - Each click handled
   - Event propagation controlled
   - No race conditions

8. **Delete confirmation:**
   - Prevent accidental deletion
   - Clear UX (confirm dialog or two-click)

9. **Keyboard and mouse interaction:**
   - Both work seamlessly
   - No conflicts

10. **currentSongIndex out of bounds:**
    - No item highlighted
    - No errors thrown

---

## Dependencies:

- **React imports:**
  ```typescript
  import React, { useState } from 'react'; // useState optional
  ```
- **Component imports:**
  ```typescript
  import { AddSongForm } from './AddSongForm';
  ```
- **Type imports:**
  ```typescript
  import { Song } from '@types/song';
  ```

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+ with React 18
- **Code style:** Google TypeScript Style Guide
- **Component type:** Functional component
- **Maximum complexity:** Moderate (list rendering + event handling)
- **Maximum length:** ~200 lines (with JSX)

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Only displays playlist and delegates actions
  - **Open/Closed:** Easy to extend with sorting, filtering
- **Input parameter validation:**
  - Handle empty songs array
  - Validate currentSongIndex bounds
  - Check for undefined callbacks
- **Robust exception handling:**
  - Handle image load errors
  - Stop event propagation correctly
  - Never throw from handlers
- **No logging needed:** Simple component
- **Comments for complex logic:**
  - Document event propagation
  - Explain highlight logic
  - Note delete confirmation UX

## React Best Practices:

- **List rendering:** Proper `key` prop (song.id)
- **Event handling:** Stop propagation where needed
- **Conditional rendering:** Empty state, active highlight
- **Performance:** React handles list updates efficiently
- **Accessibility:** Full keyboard and screen reader support

## Documentation:

- **JSDoc on component:** Purpose, props, examples
- **JSDoc on props interface:** Document each prop
- **JSDoc on handlers:** Document event handling
- **Inline comments:** Explain complex interactions

## Accessibility:

- **Semantic HTML:** Proper list structure
- **ARIA:** Labels, roles, states
- **Keyboard:** Full keyboard navigation
- **Screen reader:** List and item announcements
- **Focus management:** Logical tab order

## Styling:

- **CSS Modules:** Scoped styles
- **BEM convention:** Clear naming
- **Scrollable:** Max height with overflow
- **Hover states:** Visual feedback
- **Active state:** Clear highlight
- **CSS variables:** Use design tokens

---

# DELIVERABLES

## 1. Complete source code with:
- Organized imports
- Props interface
- Optional state (delete confirmation)
- Event handlers
- JSX with list rendering
- Empty state handling
- AddSongForm integration
- JSDoc documentation

## 2. Component documentation:
- Purpose and responsibilities
- Props documentation
- Event handling strategy
- Delete confirmation UX
- Accessibility features

## 3. Type safety:
- TypeScript interfaces
- Proper event typing
- Type-safe callbacks
- No `any` types

## 4. Edge cases handled:
- Empty playlist
- Long titles/artist names
- Broken images
- Delete currently playing
- Keyboard interaction
- All list scenarios

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Delete confirmation approach (dialog vs two-click vs inline)]
- [Decision 2: Currently playing indicator (icon, color, border)]
- [Decision 3: List item structure (flex layout, element order)]
- [Decision 4: Scrolling behavior (max height, scrollbar styling)]
- [Decision 5: Empty state messaging and design]
- [Decision 6: Whether to show song duration in list]

**Component design rationale:**
- [Explain list rendering approach]
- [Document event delegation strategy]
- [Justify active item highlighting]

**Interaction design:**
- [Document click-to-play UX]
- [Explain delete confirmation flow]
- [Describe keyboard navigation]

**Possible future improvements:**
- [Improvement 1: Drag-and-drop reordering]
- [Improvement 2: Multi-select for batch operations]
- [Improvement 3: Sort by title, artist, date added]
- [Improvement 4: Filter/search songs]
- [Improvement 5: Context menu (right-click options)]
- [Improvement 6: Show song duration in list]
- [Improvement 7: Edit song metadata inline]
- [Improvement 8: Virtual scrolling for very large playlists]
- [Improvement 9: Playlist export/import]
- [Improvement 10: Recently played indicator]

---

**REMINDER:** This is a **list component with interactions** - renders songs, handles selection and deletion, integrates AddSongForm, provides excellent accessibility. Focus on clear UX, proper event handling, keyboard navigation, and seamless integration with parent state management.
