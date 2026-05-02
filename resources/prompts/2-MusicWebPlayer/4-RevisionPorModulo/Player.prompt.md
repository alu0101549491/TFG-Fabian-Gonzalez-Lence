# CODE REVIEW REQUEST #16: `src/components/Player.tsx`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/components/Player.tsx`

**Component objective:** Main orchestrator component that integrates all hooks and child components. Manages the HTML5 Audio element and coordinates playback state, playlist state, and UI updates. Composes TrackInfo, Controls, ProgressBar, AddSongForm, and Playlist components. Acts as the central controller for the entire music player application.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**ALL Functional Requirements (FR1-FR20):**
- **FR1-FR5:** Playback control (play, pause, next, previous, change source)
- **FR6:** Automatic information update (cover, title, artist)
- **FR10-FR13:** Time display and progress bar with seek
- **FR14-FR16:** Playlist management (display, add, remove)
- **FR17:** Persistent storage (localStorage)
- **FR18:** Real-time updates
- **FR19:** Initial dataset (minimum 5 songs)
- **FR20:** Visual state changes

**NEW Features:**
- Repeat mode (OFF, ALL, ONE)
- Shuffle mode (ON/OFF)
- Volume control with persistence
- Mute/unmute functionality

**Component Integration:**
- Uses `useAudioPlayer` hook for playback control
- Uses `usePlaylist` hook for playlist management
- Uses `PlaylistDataProvider` for initial data
- Renders `TrackInfo` with current song
- Renders `Controls` with playback buttons
- Renders `ProgressBar` with seek functionality
- Renders `AddSongForm` for adding songs
- Renders `Playlist` for song list

**NFR3:** Modular code
- Delegates responsibilities to child components
- Uses hooks for state management
- Clean composition of components

**NFR4:** Use of React hooks
- Custom hooks for complex logic
- Proper hook integration
- Effect dependencies managed

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│      <<component>>                      │
│          Player                         │
├─────────────────────────────────────────┤
│ + audioRef: RefObject<HTMLAudioElement>│
│ + audioPlayer: AudioPlayerHook          │
│ + playlist: PlaylistHook                │
│ + currentSong: Song | null              │
├─────────────────────────────────────────┤
│ + render(): JSX.Element                 │
│ - handlePlayPause(): void               │
│ - handleNext(): void                    │
│ - handlePrevious(): void                │
│ - handleSongSelect(index): void         │
│ - handleAddSong(song): void             │
│ - handleRemoveSong(id): void            │
└─────────────────────────────────────────┘
           │
           │ uses
           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   useAudioPlayer        │  │   usePlaylist           │
└─────────────────────────┘  └─────────────────────────┘
           │                           │
           │ renders                   │
           ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   TrackInfo             │  │   Playlist              │
│   Controls              │  │   AddSongForm           │
│   ProgressBar           │  └─────────────────────────┘
└─────────────────────────┘

Root component that coordinates entire application
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
- [ ] Stateful (uses multiple hooks)
- [ ] No props (root component)
- [ ] Orchestrates all child components

**Hooks Usage:**
- [ ] Uses `useRef` for audio element
- [ ] Uses `useAudioPlayer` hook with audioRef
- [ ] Uses `usePlaylist` hook with initial playlist
- [ ] All hooks called at top level
- [ ] Effect dependencies correct

**State Derivation:**
- [ ] Current song derived from playlist and currentIndex
- [ ] No duplicate state
- [ ] Single source of truth

**JSX Structure:**
- [ ] Hidden `<audio>` element with ref
- [ ] TrackInfo component (shows current song)
- [ ] Controls component (playback buttons)
- [ ] ProgressBar component (seek bar)
- [ ] AddSongForm component (add songs)
- [ ] Playlist component (song list)
- [ ] Logical layout order

**Integration Logic:**
- [ ] Loads initial playlist from PlaylistDataProvider
- [ ] Sets audio source when song changes
- [ ] Handles playback control callbacks
- [ ] Handles playlist modification callbacks
- [ ] Syncs audio with playlist changes

**Event Flow:**
- [ ] Play/Pause → useAudioPlayer.play()/pause()
- [ ] Next/Previous → usePlaylist.next()/previous()
- [ ] Seek → useAudioPlayer.seek()
- [ ] Add Song → usePlaylist.addSong()
- [ ] Remove Song → usePlaylist.removeSong()
- [ ] Song Select → update index, set source, play

**Score:** __/10

**Observations:**
- Are all hooks integrated correctly?
- Are all child components rendered?
- Is event flow logical?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **Component main:** High (15-25 cyclomatic complexity)
  - Multiple hooks
  - Effect for audio source
  - Multiple event handlers
  - JSX composition
  - Acceptable for orchestrator component
- [ ] **handlePlayPause:** Low (2-3 cyclomatic complexity)
  - Conditional play/pause
- [ ] **handleNext/Previous:** Low (1-2 cyclomatic complexity)
  - Delegates to playlist hook
- [ ] **handleSongSelect:** Moderate (3-5 cyclomatic complexity)
  - Set source
  - Update index
  - Play
- [ ] **handleAddSong/RemoveSong:** Low (1-2 cyclomatic complexity)
  - Delegates to playlist hook
- [ ] Overall cyclomatic complexity < 30 (acceptable for orchestrator)

**Performance:**
- [ ] useEffect dependencies correct
- [ ] No unnecessary re-renders
- [ ] Handlers use useCallback (optional)
- [ ] Efficient integration

**Coupling:**
- [ ] Depends on all hooks and components
- [ ] Depends on PlaylistDataProvider
- [ ] Expected high coupling for orchestrator
- [ ] Dependencies are explicit

**Cohesion:**
- [ ] High cohesion (all parts coordinate player)
- [ ] Single responsibility (orchestrate music player)
- [ ] All methods support main purpose

**Code Smells:**
- [ ] Check for: Long Method (component may be long, acceptable)
- [ ] Check for: God Object (handles coordination, acceptable for root)
- [ ] Check for: Missing useEffect cleanup
- [ ] Check for: Effect dependency issues
- [ ] Check for: Duplicate logic across handlers

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**Initialization:**
- [ ] **AC1:** Creates audioRef with useRef
- [ ] **AC2:** Loads initial playlist from PlaylistDataProvider
- [ ] **AC3:** Initializes usePlaylist with initial data
- [ ] **AC4:** Initializes useAudioPlayer with audioRef
- [ ] **AC5:** Sets initial audio source to first song

**Playback Control:**
- [ ] **AC6:** Play/Pause toggles correctly
- [ ] **AC7:** Next advances to next song
- [ ] **AC8:** Previous goes to previous song
- [ ] **AC9:** Audio source updates when song changes
- [ ] **AC10:** Playback starts when new song selected

**Audio Element Management:**
- [ ] **AC11:** Audio element rendered (hidden)
- [ ] **AC12:** audioRef passed to useAudioPlayer
- [ ] **AC13:** Audio source set via useEffect
- [ ] **AC14:** Effect runs when currentIndex or playlist changes
- [ ] **AC15:** Audio element controlled by player hook

**Playlist Integration:**
- [ ] **AC16:** Current song derived from playlist[currentIndex]
- [ ] **AC17:** Add song adds to playlist array
- [ ] **AC18:** Remove song removes from playlist array
- [ ] **AC19:** Song select updates currentIndex
- [ ] **AC20:** Playlist persists via usePlaylist hook

**Component Integration - TrackInfo:**
- [ ] **AC21:** Receives current song title, artist, cover
- [ ] **AC22:** Updates when current song changes
- [ ] **AC23:** Shows "No song" when currentSong is null

**Component Integration - Controls:**
- [ ] **AC24:** Receives isPlaying from audio player
- [ ] **AC25:** Receives onPlayPause, onNext, onPrevious callbacks
- [ ] **AC26:** Receives repeatMode and isShuffled from playlist
- [ ] **AC27:** Receives onRepeatToggle and onShuffleToggle
- [ ] **AC28:** Receives disableNext/disablePrevious from playlist.hasNext/hasPrevious

**Component Integration - ProgressBar:**
- [ ] **AC29:** Receives currentTime from audio player
- [ ] **AC30:** Receives duration from audio player
- [ ] **AC31:** Receives onSeek callback to audio player.seek

**Component Integration - AddSongForm:**
- [ ] **AC32:** Receives onAddSong callback
- [ ] **AC33:** Adds songs to playlist via callback

**Component Integration - Playlist:**
- [ ] **AC34:** Receives songs array from playlist hook
- [ ] **AC35:** Receives currentIndex from playlist hook
- [ ] **AC36:** Receives onSongSelect callback
- [ ] **AC37:** Receives onSongRemove callback

**Audio Source Management:**
- [ ] **AC38:** useEffect sets audio.src when song changes
- [ ] **AC39:** Effect has correct dependencies [currentSong, audioRef]
- [ ] **AC40:** Handles null currentSong gracefully

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|-------------------|----------|
| Initial load | First song loaded, not playing | [ ] |
| Empty playlist initially | No crash, empty state shows | [ ] |
| Play with no song | Handled gracefully | [ ] |
| Next at last song (Repeat OFF) | Stays at last | [ ] |
| Next at last song (Repeat ALL) | Wraps to first | [ ] |
| Remove current song | Adjusts index, continues | [ ] |
| Add first song to empty playlist | Sets as current | [ ] |
| Song select while playing | Switches song, keeps playing | [ ] |
| Rapid next/previous clicks | All handled correctly | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Component JSDoc:**
- [ ] Description of Player component purpose
- [ ] Note that it's the root orchestrator
- [ ] Explanation of component integration
- [ ] `@returns` JSX.Element
- [ ] `@example` showing basic structure

**Handler JSDoc:**
- [ ] Key handlers documented (handlePlayPause, handleSongSelect)
- [ ] Complex logic explained

**useEffect JSDoc:**
- [ ] Audio source effect documented
- [ ] Dependencies explained

**Code Clarity:**
- [ ] Clear hook initialization
- [ ] Current song derivation is obvious
- [ ] Handler names are descriptive
- [ ] Component layout is logical

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Orchestrates player (acceptable for root) ✓
- [ ] **Dependency Inversion:** Depends on abstractions (hooks) ✓

**React Best Practices:**
- [ ] Hooks called at top level
- [ ] useEffect dependencies complete
- [ ] No effect cleanup needed (audio controlled by ref)
- [ ] Proper component composition
- [ ] Props passed correctly to children

**Hook Integration Best Practices:**
- [ ] Custom hooks used correctly
- [ ] Hook return values destructured
- [ ] No hook rules violations
- [ ] Effect dependencies managed

**TypeScript Best Practices:**
- [ ] Types imported correctly
- [ ] RefObject typed properly
- [ ] Event handlers typed
- [ ] No `any` types

**Component Composition Best Practices:**
- [ ] Clear component hierarchy
- [ ] Data flows down (props)
- [ ] Events flow up (callbacks)
- [ ] Single source of truth
- [ ] No prop drilling (shallow tree)

**Audio Element Best Practices:**
- [ ] Hidden audio element
- [ ] Ref properly attached
- [ ] Source managed via effect
- [ ] Controlled by player hook

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
- "Complete player orchestrator with all hooks and components integrated. Audio element properly managed via useEffect. All child components receive correct props. Playback control, playlist management, and UI updates all working. Clean component composition with proper data flow. Ready for production."
- "Core integration works but missing some prop passing. Audio source effect has wrong dependencies. Some callbacks not wired correctly. Needs improvements for full functionality."
- "Critical: useAudioPlayer not integrated. No audio element rendered. Components not connected to hooks. Major refactoring needed."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. No audio element rendered - JSX
   - Current: Missing <audio> element
   - Expected: <audio ref={audioRef} /> element
   - Impact: Audio playback won't work at all
   - Proposed solution: Add hidden audio element:
     <audio ref={audioRef} />

2. useAudioPlayer not initialized - Hook usage
   - Current: Hook not called
   - Expected: const player = useAudioPlayer(audioRef);
   - Impact: No playback control, component broken
   - Proposed solution: Add hook initialization

3. Audio source not set on song change - useEffect missing
   - Current: No effect to set audio.src
   - Expected: useEffect(() => { audioRef.current.src = currentSong.url }, [currentSong])
   - Impact: Audio doesn't load, can't play
   - Proposed solution: Add effect:
     useEffect(() => {
       if (currentSong && audioRef.current) {
         audioRef.current.src = currentSong.url;
         audioRef.current.load();
       }
     }, [currentSong]);

4. Controls not receiving all props - Controls component
   - Current: Missing repeatMode, isShuffled props
   - Expected: All props from playlist hook
   - Impact: Shuffle/Repeat buttons don't work
   - Proposed solution: Pass all required props:
     <Controls
       isPlaying={player.isPlaying}
       onPlayPause={handlePlayPause}
       onNext={handleNext}
       onPrevious={handlePrevious}
       repeatMode={playlist.repeatMode}
       isShuffled={playlist.isShuffled}
       onRepeatToggle={playlist.setRepeatMode}
       onShuffleToggle={playlist.toggleShuffle}
       disableNext={!playlist.hasNext()}
       disablePrevious={!playlist.hasPrevious()}
     />

5. Current song not derived correctly - State logic
   - Current: currentSong = playlist.songs[0]
   - Expected: currentSong = playlist.songs[playlist.currentIndex]
   - Impact: Wrong song information displayed
   - Proposed solution: Fix derivation:
     const currentSong = playlist.songs[playlist.currentIndex] || null;
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. Handlers not using useCallback - Event handlers
   - Suggestion: Wrap handlers in useCallback
   - Benefit: Prevents child re-renders, better performance

2. No error handling in handlePlayPause - Play/pause logic
   - Current: Doesn't check if currentSong exists
   - Suggestion: Add check:
     if (!currentSong) return;
     if (player.isPlaying) player.pause();
     else await player.play();
   - Benefit: More defensive, prevents errors

3. Initial playback starts automatically - Initialization
   - Current: May auto-play on load
   - Suggestion: Don't auto-play, wait for user interaction
   - Benefit: Better UX, respects autoplay policies

4. No layout container - Root div
   - Suggestion: Add container with className:
     <div className="player">...</div>
   - Benefit: Better styling control

5. Components not in semantic order - JSX layout
   - Suggestion: Reorder for better flow:
     1. TrackInfo (top)
     2. ProgressBar
     3. Controls
     4. Playlist
     5. AddSongForm (bottom)
   - Benefit: Logical visual hierarchy

6. handleSongSelect doesn't handle already playing - Logic
   - Current: Always plays selected song
   - Suggestion: Toggle if selecting current song:
     if (index === playlist.currentIndex) {
       handlePlayPause();
     } else {
       // Select and play
     }
   - Benefit: Better UX, can pause by clicking current

7. No loading state while audio loads - UX
   - Suggestion: Show loading indicator between songs
   - Benefit: User feedback during audio loading
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All hooks integrated correctly
- ✅ All child components rendered
- ✅ Audio element with ref
- ✅ Audio source managed via useEffect
- ✅ Current song correctly derived
- ✅ All callbacks properly connected
- ✅ Data flows down, events flow up
- ✅ Clean component composition
- ✅ Single source of truth maintained
- ✅ Initial playlist loaded correctly

---

### Recommended Refactorings:

**REFACTORING 1: Complete Player component implementation**

```typescript
import React, { useRef, useEffect, useCallback } from 'react';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { usePlaylist } from '@hooks/usePlaylist';
import { PlaylistDataProvider } from '@data/playlist-data-provider';
import { TrackInfo } from './TrackInfo';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { AddSongForm } from './AddSongForm';
import { Playlist } from './Playlist';
import { Song } from '@types/song';
import './Player.css';

/**
 * Main music player component.
 * 
 * Orchestrates all player functionality by integrating:
 * - useAudioPlayer hook for playback control
 * - usePlaylist hook for playlist management
 * - Child components for UI (TrackInfo, Controls, ProgressBar, etc.)
 * 
 * Manages audio element lifecycle and coordinates state between
 * playback and playlist.
 * 
 * @returns JSX element with complete music player
 * 
 * @example
 * // In App.tsx
 * <Player />
 */
export const Player: React.FC = () => {
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize hooks
  const playlist = usePlaylist(PlaylistDataProvider.loadInitialPlaylist());
  const player = useAudioPlayer(audioRef);

  // Derive current song from playlist
  const currentSong: Song | null = 
    playlist.songs[playlist.currentIndex] || null;

  /**
   * Sets audio source when current song changes.
   * Loads new audio file but doesn't auto-play.
   */
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
    }
  }, [currentSong]);

  /**
   * Toggles play/pause.
   * Only plays if there's a current song.
   */
  const handlePlayPause = useCallback(async (): Promise<void> => {
    if (!currentSong) return;

    if (player.isPlaying) {
      player.pause();
    } else {
      await player.play();
    }
  }, [currentSong, player]);

  /**
   * Advances to next song.
   * Uses playlist hook which handles repeat/shuffle.
   */
  const handleNext = useCallback((): void => {
    const newIndex = playlist.next();
    
    // Auto-play if currently playing
    if (player.isPlaying && playlist.songs[newIndex]) {
      // Effect will load new song, then play
      setTimeout(() => player.play(), 100);
    }
  }, [playlist, player]);

  /**
   * Goes to previous song.
   * Uses playlist hook which handles repeat/shuffle.
   */
  const handlePrevious = useCallback((): void => {
    const newIndex = playlist.previous();
    
    // Auto-play if currently playing
    if (player.isPlaying && playlist.songs[newIndex]) {
      setTimeout(() => player.play(), 100);
    }
  }, [playlist, player]);

  /**
   * Selects and plays a specific song by index.
   */
  const handleSongSelect = useCallback(
    (index: number): void => {
      // If clicking current song, toggle play/pause
      if (index === playlist.currentIndex) {
        handlePlayPause();
        return;
      }

      // Set new index
      playlist.setCurrentIndex(index);
      
      // Auto-play selected song
      setTimeout(() => player.play(), 100);
    },
    [playlist, player, handlePlayPause]
  );

  /**
   * Adds a new song to the playlist.
   */
  const handleAddSong = useCallback(
    (song: Song): void => {
      playlist.addSong(song);
      
      // If this is the first song, set as current
      if (playlist.songs.length === 0) {
        playlist.setCurrentIndex(0);
      }
    },
    [playlist]
  );

  /**
   * Removes a song from the playlist.
   */
  const handleRemoveSong = useCallback(
    (id: string): void => {
      playlist.removeSong(id);
    },
    [playlist]
  );

  return (
    <div className="player">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Current track information */}
      <TrackInfo
        title={currentSong?.title || 'No Song Selected'}
        artist={currentSong?.artist || 'Unknown Artist'}
        cover={currentSong?.cover || '/covers/default-cover.jpg'}
      />

      {/* Progress bar with seek */}
      <ProgressBar
        currentTime={player.currentTime}
        duration={player.duration}
        onSeek={player.seek}
      />

      {/* Playback controls */}
      <Controls
        isPlaying={player.isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        repeatMode={playlist.repeatMode}
        isShuffled={playlist.isShuffled}
        onRepeatToggle={playlist.setRepeatMode}
        onShuffleToggle={playlist.toggleShuffle}
        disableNext={!playlist.hasNext()}
        disablePrevious={!playlist.hasPrevious()}
      />

      {/* Error display */}
      {player.error && (
        <div className="player__error" role="alert">
          {player.error}
        </div>
      )}

      {/* Song list */}
      <Playlist
        songs={playlist.songs}
        currentIndex={playlist.currentIndex}
        onSongSelect={handleSongSelect}
        onSongRemove={handleRemoveSong}
      />

      {/* Add song form */}
      <AddSongForm onAddSong={handleAddSong} />
    </div>
  );
};
```

**Reason:** Complete integration with all hooks and components, proper data flow, all features working.

---

**REFACTORING 2: Companion CSS file**

```css
/* Player.css */

.player {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background-color: var(--color-background);
}

.player__error {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--color-error);
  text-align: center;
}

/* Component spacing */
.player > * + * {
  margin-top: var(--spacing-lg);
}

/* Mobile: Reduce spacing */
@media (max-width: 767px) {
  .player {
    padding: var(--spacing-md);
  }
  
  .player > * + * {
    margin-top: var(--spacing-md);
  }
}

/* Desktop: Two-column layout for playlist and form */
@media (min-width: 1024px) {
  .player {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  /* Track info, progress, controls span full width */
  .player > :nth-child(1),  /* audio */
  .player > :nth-child(2),  /* TrackInfo */
  .player > :nth-child(3),  /* ProgressBar */
  .player > :nth-child(4),  /* Controls */
  .player > :nth-child(5) { /* Error */
    grid-column: 1 / -1;
  }
  
  /* Playlist and form side by side */
  .player {
    grid-template-columns: 2fr 1fr;
  }
}
```

**Reason:** Complete layout with responsive design, proper spacing, error display.

---

**REFACTORING 3: Extract auto-play logic**

```typescript
/**
 * Custom hook to handle auto-play after song changes.
 */
const useAutoPlay = (
  isPlaying: boolean,
  currentSong: Song | null,
  play: () => Promise<void>
) => {
  const wasPlayingRef = useRef(isPlaying);
  
  useEffect(() => {
    wasPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    // If was playing and song changed, auto-play new song
    if (wasPlayingRef.current && currentSong) {
      // Small delay to let audio load
      const timer = setTimeout(() => {
        play();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentSong, play]);
};

// Use in component
useAutoPlay(player.isPlaying, currentSong, player.play);
```

**Reason:** Cleaner separation of concerns, reusable logic, easier to test.

---

**REFACTORING 4: Add volume control UI (optional enhancement)**

```typescript
// In Player component JSX, add after Controls:
<div className="player__volume">
  <button
    onClick={player.toggleMute}
    aria-label={player.isMuted ? 'Unmute' : 'Mute'}
  >
    {player.isMuted ? '🔇' : '🔊'}
  </button>
  
  <input
    type="range"
    min="0"
    max="100"
    value={player.volume}
    onChange={(e) => player.setVolume(Number(e.target.value))}
    aria-label="Volume"
  />
  
  <span>{player.volume}%</span>
</div>
```

**Reason:** Exposes volume control to UI, uses already-implemented player.volume/setVolume/toggleMute.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All hooks integrated correctly
  - All components rendered with proper props
  - Audio element managed correctly
  - Data flow is clean
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: could add error handling, volume UI
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: hooks not integrated, components not connected
  - Must fix before app can work

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This is the most complex component (orchestrator)
- Integrates all hooks and child components
- Manages audio element lifecycle
- Central coordination point for entire app

**Dependencies:**
- Depends on: All hooks, all components, PlaylistDataProvider
- Used by: App component

**What to Look For:**
- **All hooks initialized** (useRef, useAudioPlayer, usePlaylist)
- **Audio element rendered** with ref
- **Audio source effect** sets src when song changes
- **All components rendered** with correct props
- **Current song derivation** from playlist
- **Event handlers** delegate to appropriate hooks
- **Data flow** is unidirectional

**Common Mistakes to Watch For:**
- Missing audio element
- Hooks not initialized
- No audio source effect
- Wrong effect dependencies
- Components missing required props
- Current song not derived correctly
- Callbacks not wired up
- Duplicate state (using state instead of deriving)
- Effect cleanup missing (if needed)

**Testing Checklist:**
```typescript
// Test rendering
render(<Player />);

// Verify all components rendered
expect(screen.getByRole('heading', { name: /no song selected/i })).toBeInTheDocument();
expect(screen.getByLabelText('Play')).toBeInTheDocument();
expect(screen.getByRole('progressbar')).toBeInTheDocument();

// Verify initial playlist loaded
const playlistItems = screen.getAllByRole('listitem');
expect(playlistItems.length).toBeGreaterThanOrEqual(5);

// Test play/pause
const playButton = screen.getByLabelText('Play');
fireEvent.click(playButton);
// Verify audio.play() called

// Test next/previous
fireEvent.click(screen.getByLabelText('Next song'));
// Verify song changed

// Test add song
fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Song' } });
// Fill other fields...
fireEvent.click(screen.getByText(/add song/i));
// Verify song added to playlist

// Test song selection
fireEvent.click(screen.getByText(playlist.songs[2].title));
// Verify song 3 is now current and playing
```

**Integration Checklist:**
- [ ] useAudioPlayer receives audioRef
- [ ] usePlaylist receives initial playlist
- [ ] Audio element has ref attribute
- [ ] TrackInfo receives current song data
- [ ] Controls receives all playback/mode props
- [ ] ProgressBar receives time and seek callback
- [ ] AddSongForm receives add callback
- [ ] Playlist receives songs and callbacks
- [ ] useEffect sets audio.src correctly
- [ ] Current song derived from playlist
