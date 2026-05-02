# CODE REVIEW REQUEST #15: `src/components/Playlist.tsx`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/components/Playlist.tsx`

**Component objective:** Displays the list of all songs in the playlist with track numbers, titles, and artists. Shows which song is currently playing with visual indicator. Provides delete button for each song. Allows clicking on a song to play it. Handles empty playlist state. Purely presentational component that delegates all actions to parent callbacks.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR14:** Display complete list of songs
- Shows all songs in the playlist
- Each song displays: track number, title, artist
- List updates in real-time when songs added/removed

**FR16:** Remove songs from playlist
- Each song has a delete/remove button
- Clicking delete removes the song from playlist
- List updates immediately after removal

**FR18:** Real-time playlist update
- Changes reflect immediately without page reload
- Smooth updates when songs added/removed

**FR20:** Visual state change
- Current playing song is highlighted/indicated
- Clear visual distinction from other songs
- Updates when different song plays

**UI Design Specifications:**
- **Track number:** Auto-incremented (1, 2, 3...)
- **Current indicator:** Highlight, icon, or special styling
- **Delete button:** × icon, appears on hover
- **Click to play:** Entire song row is clickable
- **Empty state:** Message when no songs ("No songs in playlist. Add some above!")
- **Hover state:** Row highlights on hover
- **Spacing:** Comfortable spacing between rows

**NFR3:** Modular code
- Pure presentational component
- Receives all data via props
- Delegates all actions to callbacks

**NFR5:** Static typing with TypeScript
- Props interface defined
- Song array typed
- Index types explicit

**NFR6:** Intuitive and accessible interface
- Semantic HTML (ul/li structure)
- ARIA labels on delete buttons
- Keyboard accessible
- Screen reader friendly

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│      <<component>>                      │
│         Playlist                        │
├─────────────────────────────────────────┤
│ + props: PlaylistProps                  │
├─────────────────────────────────────────┤
│ + render(): JSX.Element                 │
│ - renderEmptyState(): JSX.Element       │
│ - renderSongRow(song, index): JSX       │
└─────────────────────────────────────────┘
           │
           │ receives
           ▼
┌─────────────────────────────────────────┐
│        PlaylistProps                    │
├─────────────────────────────────────────┤
│ + songs: Song[]                         │
│ + currentIndex: number                  │
│ + onSongSelect: (index: number) => void │
│ + onSongRemove: (id: string) => void    │
└─────────────────────────────────────────┘

Used by:
- Player component (passes playlist and callbacks)
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
- [ ] Pure presentational (no state, no hooks)
- [ ] Receives all data via props
- [ ] No side effects

**Props Interface:**
- [ ] Interface named `PlaylistProps`
- [ ] Property: `songs: Song[]`
- [ ] Property: `currentIndex: number`
- [ ] Property: `onSongSelect: (index: number) => void`
- [ ] Property: `onSongRemove: (id: string) => void`
- [ ] All properties required (not optional)

**JSX Structure:**
- [ ] Container div with className
- [ ] Conditional rendering for empty state
- [ ] List element (ul or ol) for songs
- [ ] List items (li) for each song
- [ ] Each song shows: number, title, artist
- [ ] Delete button on each song
- [ ] Visual indicator for current song

**Event Handlers:**
- [ ] Click on song row calls onSongSelect with index
- [ ] Click on delete button calls onSongRemove with song ID
- [ ] Event propagation handled (delete doesn't trigger song select)

**Implementation Approach:**
- [ ] Uses map() to render song list
- [ ] Key prop set to song.id
- [ ] Track number calculated from index (index + 1)
- [ ] Current song identified by currentIndex === index

**Score:** __/10

**Observations:**
- Are all required elements present?
- Is empty state handled?
- Are callbacks correctly delegated?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **Component main:** Low-Moderate (3-5 cyclomatic complexity)
  - Prop destructuring
  - Empty check
  - Map over songs
  - Return JSX
- [ ] **renderSongRow (if extracted):** Low (2-3 cyclomatic complexity)
  - Current check
  - Return row JSX
- [ ] **renderEmptyState (if extracted):** Very low (1 cyclomatic complexity)
  - Return empty message
- [ ] Overall cyclomatic complexity < 8 (simple component)

**Performance:**
- [ ] No unnecessary re-renders
- [ ] map() is standard and efficient
- [ ] Could use React.memo (optional)
- [ ] Key prop prevents reconciliation issues

**Coupling:**
- [ ] Depends on Song type only
- [ ] Depends on React
- [ ] No other dependencies
- [ ] Self-contained presentation

**Cohesion:**
- [ ] High cohesion (all parts display playlist)
- [ ] Single responsibility (playlist display)
- [ ] All elements work together

**Code Smells:**
- [ ] Check for: Long Method (should be <100 lines)
- [ ] Check for: Code Duplication (song row structure repeated - acceptable with map)
- [ ] Check for: Magic Strings (track number logic)
- [ ] Check for: Missing key prop (must be present on li)
- [ ] Check for: Inline styles (should use CSS)

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**Display Requirements:**
- [ ] **AC1:** Displays all songs from songs prop
- [ ] **AC2:** Each song shows track number (1-based index)
- [ ] **AC3:** Each song shows title
- [ ] **AC4:** Each song shows artist
- [ ] **AC5:** Songs displayed in order (array index)
- [ ] **AC6:** Updates immediately when songs prop changes

**Current Song Indicator:**
- [ ] **AC7:** Current song identified by currentIndex
- [ ] **AC8:** Current song has visual indicator (highlight/icon/class)
- [ ] **AC9:** Only one song highlighted at a time
- [ ] **AC10:** Indicator updates when currentIndex changes
- [ ] **AC11:** Visual distinction is clear and obvious

**Song Selection:**
- [ ] **AC12:** Clicking song row calls onSongSelect(index)
- [ ] **AC13:** Index passed is array index (0-based)
- [ ] **AC14:** Entire row is clickable (good UX)
- [ ] **AC15:** Visual feedback on hover (CSS)
- [ ] **AC16:** Cursor changes to pointer on hover

**Song Removal:**
- [ ] **AC17:** Each song has delete button
- [ ] **AC18:** Delete button calls onSongRemove(song.id)
- [ ] **AC19:** Delete button doesn't trigger song select (stopPropagation)
- [ ] **AC20:** Delete button has × or trash icon
- [ ] **AC21:** Delete button has aria-label

**Empty State:**
- [ ] **AC22:** Shows message when songs.length === 0
- [ ] **AC23:** Message is helpful ("No songs in playlist. Add some!")
- [ ] **AC24:** Empty state replaces list (not shown alongside)
- [ ] **AC25:** Empty state has appropriate styling

**Accessibility:**
- [ ] **AC26:** Uses semantic list (ul or ol)
- [ ] **AC27:** Each song is list item (li)
- [ ] **AC28:** Delete buttons have aria-label
- [ ] **AC29:** Current song has aria-current="true"
- [ ] **AC30:** Keyboard accessible (Tab to buttons, Enter to activate)
- [ ] **AC31:** Screen reader announces song info

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|-------------------|----------|
| Empty playlist | Show empty state message | [ ] |
| Single song | Display normally with number 1 | [ ] |
| Current song removed | Doesn't crash, updates correctly | [ ] |
| Click on current song | Handled (replay or no-op) | [ ] |
| Delete while playing | Handled by parent, list updates | [ ] |
| Very long title (100+ chars) | Truncated or wrapped (CSS) | [ ] |
| Very long artist name | Truncated or wrapped (CSS) | [ ] |
| 100+ songs | Renders all, scrollable (CSS) | [ ] |
| currentIndex out of bounds | No song highlighted | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Component JSDoc:**
- [ ] Description of component purpose
- [ ] Note about pure presentational nature
- [ ] `@param props` or props interface documentation
- [ ] `@returns` JSX.Element
- [ ] `@example` showing usage with props

**Props Interface JSDoc:**
- [ ] Description of interface
- [ ] Each property documented:
  - songs - Array of songs to display
  - currentIndex - Index of currently playing song
  - onSongSelect - Callback when song clicked
  - onSongRemove - Callback when delete clicked

**Code Clarity:**
- [ ] Prop destructuring makes code readable
- [ ] Map function is clear
- [ ] Track number calculation is obvious (index + 1)
- [ ] Current check is clear (currentIndex === index)
- [ ] CSS class names are descriptive

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Only displays playlist ✓
- [ ] **Open/Closed:** Easy to add more song info ✓

**React Best Practices:**
- [ ] Pure component (no side effects)
- [ ] Props are immutable
- [ ] Functional component
- [ ] No unnecessary state
- [ ] Key prop on list items
- [ ] Proper event delegation

**Component Design Best Practices:**
- [ ] Presentational component pattern
- [ ] No business logic
- [ ] Testable (pure function of props)
- [ ] Reusable
- [ ] Clear separation of concerns

**TypeScript Best Practices:**
- [ ] Props interface defined
- [ ] Song[] type explicit
- [ ] Callback types correct
- [ ] No `any` types
- [ ] Proper imports

**Accessibility Best Practices:**
- [ ] Semantic HTML (ul/ol, li)
- [ ] ARIA labels on buttons
- [ ] aria-current on current song
- [ ] Keyboard accessible
- [ ] Screen reader friendly

**List Rendering Best Practices:**
- [ ] Key prop uses unique ID (song.id)
- [ ] Key prop is stable (doesn't use index)
- [ ] Map function returns JSX
- [ ] No mutations during map

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
- "Complete playlist component with all required features. Displays songs with track numbers, titles, artists. Current song highlighted clearly. Delete buttons with proper event handling. Empty state handled. Good accessibility with semantic HTML and ARIA. Ready for production."
- "Core list rendering works but missing current song indicator. No empty state handling. Delete buttons don't stop event propagation. Missing accessibility attributes."
- "Critical: No song list rendered. Empty state not handled. Missing delete buttons. No key prop on list items. Major refactoring needed."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. Missing key prop on list items - map() function
   - Current: <li>{song.title}</li>
   - Expected: <li key={song.id}>{song.title}</li>
   - Impact: React reconciliation errors, poor performance, bugs
   - Proposed solution: Add key prop:
     {songs.map((song, index) => (
       <li key={song.id}>...</li>
     ))}

2. No current song indicator - Song row rendering
   - Current: All songs look the same
   - Expected: currentIndex === index has special class/icon
   - Impact: User can't tell which song is playing
   - Proposed solution: Add conditional class:
     <li className={`playlist__item ${currentIndex === index ? 'playlist__item--current' : ''}`}>

3. Delete button triggers song select - onClick handling
   - Current: Clicking delete also selects song
   - Expected: Delete only removes, doesn't select
   - Impact: Wrong behavior, plays song then deletes it
   - Proposed solution: Add stopPropagation:
     <button onClick={(e) => {
       e.stopPropagation();
       onSongRemove(song.id);
     }}>

4. No empty state handling - Component logic
   - Current: Shows empty list when no songs
   - Expected: Show message "No songs in playlist"
   - Impact: Confusing UX, looks broken
   - Proposed solution: Add conditional:
     {songs.length === 0 ? (
       <div className="playlist__empty">No songs in playlist. Add some above!</div>
     ) : (
       <ul>...</ul>
     )}

5. Track numbers missing - Song row
   - Current: Only shows title and artist
   - Expected: Shows track number (index + 1)
   - Impact: Can't see song position/order
   - Proposed solution: Add track number:
     <span className="playlist__number">{index + 1}</span>
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. No React.memo optimization - Component definition
   - Suggestion: Wrap in React.memo
   - Benefit: Prevents re-renders when props unchanged

2. Delete button has no aria-label - Button element
   - Suggestion: Add descriptive label:
     <button aria-label={`Remove ${song.title} by ${song.artist}`}>
   - Benefit: Better accessibility for screen readers

3. No hover state on song rows - CSS
   - Suggestion: Add hover class with background change
   - Benefit: Clear visual feedback that row is clickable

4. Current song has no aria-current - List item
   - Suggestion: Add aria-current attribute:
     <li aria-current={currentIndex === index ? 'true' : undefined}>
   - Benefit: Screen readers announce current song

5. Long titles not truncated - CSS
   - Suggestion: Add CSS:
     .playlist__title {
       overflow: hidden;
       text-overflow: ellipsis;
       white-space: nowrap;
     }
   - Benefit: Handles very long song titles gracefully

6. No visual icon for current song - Current indicator
   - Suggestion: Add playing icon (♫ or ▶):
     {currentIndex === index && <span className="playlist__icon">♫</span>}
   - Benefit: Even clearer visual indicator

7. Delete button always visible - UX
   - Suggestion: Show delete only on hover:
     .playlist__item:hover .playlist__delete { opacity: 1; }
   - Benefit: Cleaner UI, less cluttered

8. Using ul instead of ol - Semantic HTML
   - Current: <ul> (unordered list)
   - Suggestion: <ol> (ordered list) since songs are numbered
   - Benefit: More semantic HTML
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All songs rendered with map()
- ✅ Track numbers displayed (index + 1)
- ✅ Delete buttons on each song
- ✅ Song selection on click
- ✅ Current song highlighted
- ✅ Empty state handled
- ✅ Key prop uses song.id (stable)
- ✅ Event propagation handled correctly
- ✅ Type-safe props interface
- ✅ Semantic HTML (list structure)

---

### Recommended Refactorings:

**REFACTORING 1: Complete implementation with all features**

```typescript
import React from 'react';
import { Song } from '@types/song';
import './Playlist.css';

/**
 * Displays the playlist with all songs.
 * 
 * Shows song number, title, and artist for each song.
 * Highlights currently playing song. Provides delete button
 * for each song. Allows clicking on song to play it.
 * 
 * @param props - Songs, current index, and callbacks
 * @returns JSX element with playlist
 * 
 * @example
 * <Playlist
 *   songs={playlist}
 *   currentIndex={2}
 *   onSongSelect={(index) => player.playSongAtIndex(index)}
 *   onSongRemove={(id) => playlist.removeSong(id)}
 * />
 */
interface PlaylistProps {
  /** Array of songs to display */
  songs: Song[];
  /** Index of currently playing song (0-based) */
  currentIndex: number;
  /** Callback when song is clicked to play */
  onSongSelect: (index: number) => void;
  /** Callback when delete button is clicked */
  onSongRemove: (id: string) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({
  songs,
  currentIndex,
  onSongSelect,
  onSongRemove
}) => {
  /**
   * Renders empty state when no songs in playlist.
   */
  const renderEmptyState = (): JSX.Element => (
    <div className="playlist__empty">
      <p className="playlist__empty-message">
        No songs in playlist. Add some above!
      </p>
    </div>
  );

  /**
   * Handles delete button click.
   * Stops propagation to prevent triggering song selection.
   */
  const handleDeleteClick = (
    event: React.MouseEvent,
    songId: string
  ): void => {
    event.stopPropagation();
    onSongRemove(songId);
  };

  // Show empty state if no songs
  if (songs.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="playlist">
      <h2 className="playlist__title">Playlist</h2>
      
      <ol className="playlist__list">
        {songs.map((song, index) => {
          const isCurrent = currentIndex === index;
          
          return (
            <li
              key={song.id}
              className={`playlist__item ${
                isCurrent ? 'playlist__item--current' : ''
              }`}
              onClick={() => onSongSelect(index)}
              aria-current={isCurrent ? 'true' : undefined}
            >
              {/* Track number */}
              <span className="playlist__number">{index + 1}</span>

              {/* Current song indicator */}
              {isCurrent && (
                <span className="playlist__icon" aria-label="Currently playing">
                  ♫
                </span>
              )}

              {/* Song info */}
              <div className="playlist__info">
                <div className="playlist__song-title">{song.title}</div>
                <div className="playlist__artist">{song.artist}</div>
              </div>

              {/* Delete button */}
              <button
                type="button"
                className="playlist__delete"
                onClick={(e) => handleDeleteClick(e, song.id)}
                aria-label={`Remove ${song.title} by ${song.artist}`}
                title="Remove song"
              >
                ×
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
```

**Reason:** Complete implementation with all features, proper event handling, accessibility, empty state.

---

**REFACTORING 2: Companion CSS file**

```css
/* Playlist.css */

.playlist {
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.playlist__title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Empty state */
.playlist__empty {
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
}

.playlist__empty-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

/* Playlist list */
.playlist__list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

/* Song item */
.playlist__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  position: relative;
}

.playlist__item:hover {
  background-color: var(--color-surface-hover);
}

.playlist__item--current {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 3px solid var(--color-primary);
}

/* Track number */
.playlist__number {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  min-width: 24px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Current song icon */
.playlist__icon {
  color: var(--color-primary);
  font-size: 1.125rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Song info */
.playlist__info {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.playlist__song-title {
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist__artist {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Delete button */
.playlist__delete {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  opacity: 0; /* Hidden by default */
}

.playlist__item:hover .playlist__delete {
  opacity: 1; /* Show on row hover */
}

.playlist__delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  transform: scale(1.1);
}

.playlist__delete:focus-visible {
  opacity: 1; /* Always show when focused */
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Mobile: Delete always visible */
@media (max-width: 767px) {
  .playlist__delete {
    opacity: 1;
  }
  
  .playlist__list {
    max-height: 300px;
  }
}

/* Scrollbar styling */
.playlist__list::-webkit-scrollbar {
  width: 8px;
}

.playlist__list::-webkit-scrollbar-track {
  background: var(--color-border);
  border-radius: 4px;
}

.playlist__list::-webkit-scrollbar-thumb {
  background: var(--color-text-secondary);
  border-radius: 4px;
}

.playlist__list::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-primary);
}
```

**Reason:** Complete styling with current indicator, hover states, delete button, scrollable list, responsive.

---

**REFACTORING 3: Extract PlaylistItem component (optional)**

```typescript
// Separate component for better organization
interface PlaylistItemProps {
  song: Song;
  index: number;
  isCurrent: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({
  song,
  index,
  isCurrent,
  onSelect,
  onDelete
}) => {
  const handleDeleteClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    onDelete(song.id);
  };

  return (
    <li
      className={`playlist__item ${isCurrent ? 'playlist__item--current' : ''}`}
      onClick={onSelect}
      aria-current={isCurrent ? 'true' : undefined}
    >
      <span className="playlist__number">{index + 1}</span>
      
      {isCurrent && (
        <span className="playlist__icon" aria-label="Currently playing">♫</span>
      )}
      
      <div className="playlist__info">
        <div className="playlist__song-title">{song.title}</div>
        <div className="playlist__artist">{song.artist}</div>
      </div>
      
      <button
        type="button"
        className="playlist__delete"
        onClick={handleDeleteClick}
        aria-label={`Remove ${song.title} by ${song.artist}`}
        title="Remove song"
      >
        ×
      </button>
    </li>
  );
};

// Use in main component
export const Playlist: React.FC<PlaylistProps> = ({ ... }) => {
  // ...
  
  return (
    <ol className="playlist__list">
      {songs.map((song, index) => (
        <PlaylistItem
          key={song.id}
          song={song}
          index={index}
          isCurrent={currentIndex === index}
          onSelect={() => onSongSelect(index)}
          onDelete={onSongRemove}
        />
      ))}
    </ol>
  );
};
```

**Reason:** Better separation of concerns, easier to test, clearer code organization.

---

**REFACTORING 4: Add React.memo optimization**

```typescript
export const Playlist = React.memo<PlaylistProps>(
  ({ songs, currentIndex, onSongSelect, onSongRemove }) => {
    // ... implementation
  }
);

// Or with custom comparison if needed
export const Playlist = React.memo<PlaylistProps>(
  ({ songs, currentIndex, onSongSelect, onSongRemove }) => {
    // ... implementation
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return (
      prevProps.songs === nextProps.songs &&
      prevProps.currentIndex === nextProps.currentIndex
    );
  }
);
```

**Reason:** Performance optimization, prevents unnecessary re-renders.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All songs displayed correctly
  - Current song highlighted
  - Delete buttons work
  - Empty state handled
  - Good accessibility
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: could add React.memo, improve accessibility
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: missing key prop, no current indicator, event propagation
  - Must fix before Player can use this

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This is a list display component
- Pure presentational (no state)
- Must show which song is currently playing
- Delete functionality critical for UX

**Dependencies:**
- Depends on: Song type, React
- Used by: Player component

**What to Look For:**
- **Key prop** on list items (uses song.id, not index)
- **Current song indicator** (visual highlight when currentIndex === index)
- **Empty state** (message when songs.length === 0)
- **Track numbers** (index + 1 displayed)
- **Delete button** with stopPropagation
- **Event delegation** (song select on row, delete on button)

**Common Mistakes to Watch For:**
- Missing key prop (or using index as key)
- No current song indicator
- No empty state handling
- Delete triggers song select (missing stopPropagation)
- No track numbers displayed
- Missing ARIA labels on delete buttons
- No aria-current on current song
- Using div instead of list elements

**Testing Checklist:**
```typescript
const mockSongs: Song[] = [
  { id: '1', title: 'Song 1', artist: 'Artist 1', cover: '/1.jpg', url: '/1.mp3' },
  { id: '2', title: 'Song 2', artist: 'Artist 2', cover: '/2.jpg', url: '/2.mp3' }
];

// Test rendering
render(
  <Playlist
    songs={mockSongs}
    currentIndex={0}
    onSongSelect={mockSelect}
    onSongRemove={mockRemove}
  />
);

// Verify songs displayed
expect(screen.getByText('Song 1')).toBeInTheDocument();
expect(screen.getByText('Artist 1')).toBeInTheDocument();

// Verify track numbers
expect(screen.getByText('1')).toBeInTheDocument();
expect(screen.getByText('2')).toBeInTheDocument();

// Test current indicator
const item1 = screen.getByText('Song 1').closest('li');
expect(item1).toHaveClass('playlist__item--current');

// Test song selection
fireEvent.click(screen.getByText('Song 2'));
expect(mockSelect).toHaveBeenCalledWith(1);

// Test delete
const deleteButton = screen.getAllByLabelText(/Remove/)[0];
fireEvent.click(deleteButton);
expect(mockRemove).toHaveBeenCalledWith('1');
expect(mockSelect).not.toHaveBeenCalled(); // Ensure no selection

// Test empty state
rerender(<Playlist songs={[]} currentIndex={-1} ... />);
expect(screen.getByText(/no songs/i)).toBeInTheDocument();
```

**Accessibility Checklist:**
- [ ] Uses semantic list (ol or ul)
- [ ] List items are li elements
- [ ] Delete buttons have aria-label
- [ ] Current song has aria-current="true"
- [ ] Keyboard accessible
- [ ] Screen reader friendly
