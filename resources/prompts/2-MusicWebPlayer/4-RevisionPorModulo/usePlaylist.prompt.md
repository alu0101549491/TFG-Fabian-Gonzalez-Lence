# CODE REVIEW REQUEST #9: `src/hooks/usePlaylist.ts`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/hooks/usePlaylist.ts`

**Component objective:** Manage playlist state including songs array, current index, repeat mode, and shuffle functionality. Provides methods for navigation (next/previous), song management (add/remove), and mode control (repeat/shuffle). Integrates with useLocalStorage for persistence. Central state management hook for all playlist operations.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR14-FR16:** Playlist management
- Display complete list of songs in playlist
- Add songs to local playlist
- Remove songs from playlist

**FR17:** Persistent playlist storage
- Playlist saved in localStorage
- Persists between sessions

**FR18:** Real-time playlist update
- When adding or removing songs, list updates immediately

**FR1-FR5:** Playback control
- Next/Previous navigation
- Circular navigation (last song → first song)
- Current song tracking

**NEW: Repeat Mode Requirements:**
- Three modes: OFF, ALL, ONE
- OFF: Stop at end of playlist
- ALL: Loop to start (circular)
- ONE: Repeat current song
- Mode persisted to localStorage

**NEW: Shuffle Mode Requirements:**
- Toggle on/off
- Randomized play order
- No repeats until all songs played
- Current song stays when toggling
- Mode persisted to localStorage

**NFR4:** Use of React hooks
- Custom hook for playlist logic
- Reusable across components

**NFR5:** Static typing with TypeScript
- Explicit types for all state and methods
- Type-safe operations

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│         <<hook>>                        │
│       usePlaylist                       │
├─────────────────────────────────────────┤
│ - playlist: Song[]                      │
│ - currentIndex: number                  │
│ - repeatMode: RepeatMode                │
│ - isShuffled: boolean                   │
│ - shuffleQueue: number[]                │
│ - shuffleIndex: number                  │
├─────────────────────────────────────────┤
│ + usePlaylist(                          │
│     initialPlaylist: Song[]             │
│   ): PlaylistHook                       │
│ + next(): number                        │
│ + previous(): number                    │
│ + addSong(song: Song): void             │
│ + removeSong(id: string): void          │
│ + getSongAt(index: number): Song | null│
│ + setCurrentIndex(index: number): void │
│ + setRepeatMode(mode: RepeatMode): void│
│ + toggleShuffle(): void                 │
│ + hasNext(): boolean                    │
│ + hasPrevious(): boolean                │
│ - generateShuffleQueue(): void          │
└─────────────────────────────────────────┘
           │
           │ uses
           ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   useLocalStorage       │    │   RepeatMode (enum)     │
│                         │    │   - OFF                 │
│                         │    │   - ALL                 │
└─────────────────────────┘    │   - ONE                 │
                               └─────────────────────────┘

Used by:
- Player component (main user)
```

---

## CODE TO REVIEW

```typescript

(Referenced code)

```

---

## EVALUATION CRITERIA

### 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**

**Hook Signature:**
- [ ] Function named `usePlaylist` (exact match)
- [ ] Parameter: `initialPlaylist: Song[]`
- [ ] Returns: `PlaylistHook` interface
- [ ] Hook is exported

**PlaylistHook Interface:**
- [ ] `playlist: Song[]` - Current playlist
- [ ] `currentIndex: number` - Current song position
- [ ] `repeatMode: RepeatMode` - Current repeat mode
- [ ] `isShuffled: boolean` - Shuffle state
- [ ] `next: () => number` - Advance to next song
- [ ] `previous: () => number` - Go to previous song
- [ ] `addSong: (song: Song) => void` - Add song
- [ ] `removeSong: (id: string) => void` - Remove song
- [ ] `getSongAt: (index: number) => Song | null` - Get song by index
- [ ] `setCurrentIndex: (index: number) => void` - Set position
- [ ] `setRepeatMode: (mode: RepeatMode) => void` - Change repeat mode
- [ ] `toggleShuffle: () => void` - Toggle shuffle
- [ ] `hasNext: () => boolean` - Check if next available
- [ ] `hasPrevious: () => boolean` - Check if previous available

**State Management:**
- [ ] Uses `useLocalStorage` for playlist persistence
- [ ] Uses `useLocalStorage` for currentIndex persistence
- [ ] Uses `useLocalStorage` for repeatMode persistence
- [ ] Uses `useLocalStorage` for isShuffled persistence
- [ ] Uses `useState` for shuffleQueue (not persisted)
- [ ] Uses `useState` for shuffleIndex (not persisted)

**Implementation Approach:**
- [ ] All methods properly implement logic
- [ ] Shuffle queue generation implemented
- [ ] Repeat mode logic in next/previous
- [ ] Boundary checks (hasNext/hasPrevious)

**Score:** __/10

**Observations:**
- Does the interface match exactly?
- Are all required methods present?
- Is state properly managed with hooks?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **usePlaylist main:** Moderate-High (10-15 cyclomatic complexity)
  - Multiple state declarations
  - Multiple method definitions
  - Effect for shuffle queue generation
  - Return hook object
- [ ] **next():** High (8-12 cyclomatic complexity)
  - Repeat mode checks
  - Shuffle vs normal logic
  - Boundary handling
  - Queue exhaustion logic
- [ ] **previous():** High (8-12 cyclomatic complexity)
  - Similar to next()
  - Reverse navigation
- [ ] **addSong():** Low (2-3 cyclomatic complexity)
  - Array append
  - State update
- [ ] **removeSong():** Moderate (4-6 cyclomatic complexity)
  - Array filter
  - Index adjustment
  - State update
- [ ] **getSongAt():** Low (2-3 cyclomatic complexity)
  - Bounds check
  - Array access
- [ ] **toggleShuffle():** Moderate (4-6 cyclomatic complexity)
  - Toggle state
  - Generate/clear queue
- [ ] **generateShuffleQueue():** Moderate (5-7 cyclomatic complexity)
  - Fisher-Yates shuffle
  - Current song handling
- [ ] **hasNext/hasPrevious():** Low (3-5 cyclomatic complexity)
  - Mode checks
  - Boundary checks

**Performance:**
- [ ] Shuffle algorithm is O(n) (Fisher-Yates)
- [ ] Song operations are efficient
- [ ] No unnecessary re-computations
- [ ] useCallback used for methods (optional but good)

**Coupling:**
- [ ] Depends on useLocalStorage hook
- [ ] Depends on Song type
- [ ] Depends on RepeatMode enum
- [ ] Reasonable coupling for functionality

**Cohesion:**
- [ ] High cohesion (all methods related to playlist)
- [ ] Single responsibility (playlist management)
- [ ] Helper functions support main logic

**Code Smells:**
- [ ] Check for: Long Method (next/previous may be long but acceptable)
- [ ] Check for: Code Duplication (next/previous may share logic)
- [ ] Check for: Complex Conditionals (nested ifs in navigation)
- [ ] Check for: Magic Numbers (acceptable in this context)
- [ ] Check for: Feature Envy (methods should work on own state)

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**Core Playlist Management:**
- [ ] **AC1:** playlist array stored and retrieved from localStorage
- [ ] **AC2:** currentIndex stored and retrieved from localStorage
- [ ] **AC3:** addSong appends to playlist and persists
- [ ] **AC4:** removeSong filters by id and persists
- [ ] **AC5:** getSongAt returns song at index or null
- [ ] **AC6:** setCurrentIndex updates current position

**Navigation (Sequential Mode):**
- [ ] **AC7:** next() increments index by 1 in normal mode
- [ ] **AC8:** previous() decrements index by 1 in normal mode
- [ ] **AC9:** Boundary checks prevent out-of-bounds access

**Repeat Mode - OFF:**
- [ ] **AC10:** next() at last song stays at last song
- [ ] **AC11:** previous() at first song stays at first song
- [ ] **AC12:** hasNext() returns false at last song
- [ ] **AC13:** hasPrevious() returns false at first song

**Repeat Mode - ALL:**
- [ ] **AC14:** next() at last song wraps to first song (index 0)
- [ ] **AC15:** previous() at first song wraps to last song
- [ ] **AC16:** hasNext() always returns true (circular)
- [ ] **AC17:** hasPrevious() always returns true (circular)

**Repeat Mode - ONE:**
- [ ] **AC18:** next() returns current index (stays on same song)
- [ ] **AC19:** previous() returns current index (stays on same song)
- [ ] **AC20:** hasNext() returns true (can manually navigate)
- [ ] **AC21:** hasPrevious() returns true (can manually navigate)

**Shuffle Mode - OFF:**
- [ ] **AC22:** next() follows sequential order (0, 1, 2, 3...)
- [ ] **AC23:** previous() follows reverse sequential order
- [ ] **AC24:** toggleShuffle(on) generates shuffle queue

**Shuffle Mode - ON:**
- [ ] **AC25:** next() follows shuffle queue order
- [ ] **AC26:** previous() follows reverse shuffle queue order
- [ ] **AC27:** No song repeats until all played (proper shuffle)
- [ ] **AC28:** Queue exhaustion handled (reshuffle if Repeat ALL, stop if Repeat OFF)
- [ ] **AC29:** toggleShuffle(off) clears queue, resumes sequential

**Shuffle + Repeat Interactions:**
- [ ] **AC30:** Shuffle ON + Repeat OFF: Play queue once, then stop
- [ ] **AC31:** Shuffle ON + Repeat ALL: Reshuffle when queue exhausted
- [ ] **AC32:** Shuffle ON + Repeat ONE: Current song loops (queue paused)

**Shuffle Generation:**
- [ ] **AC33:** Current song stays first in shuffle queue
- [ ] **AC34:** Uses Fisher-Yates or similar randomization
- [ ] **AC35:** All songs included in shuffle queue
- [ ] **AC36:** Regenerated when playlist changes (optional)

**State Persistence:**
- [ ] **AC37:** Playlist persists across browser sessions
- [ ] **AC38:** Current index persists
- [ ] **AC39:** Repeat mode persists
- [ ] **AC40:** Shuffle state persists
- [ ] **AC41:** Shuffle queue NOT persisted (regenerated)

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|-------------------|----------|
| Empty playlist | All methods handle gracefully | [ ] |
| Single song | Next/Previous work correctly | [ ] |
| Remove current song | Index adjusted appropriately | [ ] |
| Remove song before current | Index decrements | [ ] |
| Remove song after current | Index unchanged | [ ] |
| Shuffle toggle mid-playback | Current song stays playing | [ ] |
| Add song during shuffle | Queue regenerated (optional) | [ ] |
| Next at last song (Repeat OFF) | Stays at last | [ ] |
| Next at last song (Repeat ALL) | Wraps to first | [ ] |
| Shuffle queue exhausted (Repeat ALL) | Reshuffle and continue | [ ] |
| Shuffle queue exhausted (Repeat OFF) | Stay at last | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Hook JSDoc:**
- [ ] Description of hook purpose and functionality
- [ ] `@param initialPlaylist` with description
- [ ] `@returns` PlaylistHook interface description
- [ ] Multiple `@example` tags showing:
  - Basic usage (initialization)
  - Adding/removing songs
  - Navigation (next/previous)
  - Repeat mode usage
  - Shuffle usage
  - Combined scenarios

**PlaylistHook Interface JSDoc:**
- [ ] Description of interface
- [ ] All properties documented
- [ ] All methods documented with params and returns

**Method JSDoc:**
- [ ] next() documented with behavior in different modes
- [ ] previous() documented with behavior
- [ ] addSong() documented
- [ ] removeSong() documented with index handling
- [ ] setRepeatMode() documented with mode descriptions
- [ ] toggleShuffle() documented with queue generation

**Internal Function JSDoc:**
- [ ] generateShuffleQueue() documented with algorithm explanation

**Code Clarity:**
- [ ] Variable names descriptive (shuffleQueue, shuffleIndex)
- [ ] Logic clearly organized
- [ ] Comments explain complex shuffle logic
- [ ] Repeat mode logic is clear

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Only manages playlist state ✓
- [ ] **Open/Closed:** Easy to add new modes ✓

**React Hook Best Practices:**
- [ ] Follows Rules of Hooks
- [ ] useEffect used for shuffle queue regeneration (if needed)
- [ ] Methods use useCallback for optimization (optional)
- [ ] State updates properly managed

**State Management Best Practices:**
- [ ] Uses useLocalStorage for persistent state
- [ ] Uses useState for transient state (shuffle queue)
- [ ] State updates are immutable (new arrays)
- [ ] No direct mutations

**Shuffle Algorithm Best Practices:**
- [ ] Fisher-Yates shuffle (O(n) time, proper randomization)
- [ ] No bias in shuffle
- [ ] Current song handling correct

**TypeScript Best Practices:**
- [ ] Explicit return types on all methods
- [ ] PlaylistHook interface properly defined
- [ ] Type-safe throughout
- [ ] No `any` types

**Code Style:**
- [ ] Follows Google TypeScript Style Guide
- [ ] Consistent formatting
- [ ] Named export

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
- "Comprehensive playlist management hook with full repeat/shuffle support. All navigation modes implemented correctly. Proper Fisher-Yates shuffle algorithm. State persistence works. Clean integration with useLocalStorage. Ready for production."
- "Core functionality works but shuffle logic is incomplete. Repeat mode missing ONE option. Navigation works in sequential mode but boundaries not checked correctly."
- "Critical: next/previous don't handle repeat modes. Shuffle not implemented. removeSong doesn't adjust currentIndex. Missing required methods (hasNext, hasPrevious). Major refactoring needed."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. Repeat mode ONE not handled in next/previous - Lines 45-60
   - Current: Only handles OFF and ALL
   - Expected: When RepeatMode.ONE, return currentIndex unchanged
   - Impact: Repeat ONE mode doesn't work, user can't loop single song
   - Proposed solution: Add check:
     if (repeatMode === RepeatMode.ONE) {
       return currentIndex;
     }

2. Shuffle navigation not implemented - next() function
   - Current: Only sequential navigation
   - Expected: When isShuffled, follow shuffleQueue
   - Impact: Shuffle mode doesn't work at all
   - Proposed solution: Add shuffle logic:
     if (isShuffled) {
       const nextShuffleIndex = shuffleIndex + 1;
       if (nextShuffleIndex >= shuffleQueue.length) {
         // Handle queue exhaustion based on repeat mode
       }
       setShuffleIndex(nextShuffleIndex);
       return shuffleQueue[nextShuffleIndex];
     }

3. removeSong doesn't adjust currentIndex - Lines 75-80
   - Current: Only filters playlist
   - Expected: If removing song before current, decrement currentIndex
   - Impact: Wrong song plays after removal, playlist state corrupted
   - Proposed solution:
     const songIndex = playlist.findIndex(s => s.id === id);
     if (songIndex < currentIndex) {
       setCurrentIndex(currentIndex - 1);
     } else if (songIndex === currentIndex) {
       // Handle removing current song
     }

4. Missing hasNext and hasPrevious methods - Hook return
   - Impact: Controls component can't disable buttons correctly
   - Proposed solution: Implement both methods:
     const hasNext = (): boolean => {
       if (repeatMode !== RepeatMode.OFF) return true;
       return isShuffled ? shuffleIndex < shuffleQueue.length - 1 : currentIndex < playlist.length - 1;
     };
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. generateShuffleQueue not memoized - Line 100
   - Suggestion: Use useCallback to avoid recreating:
     const generateShuffleQueue = useCallback(() => { ... }, [playlist, currentIndex]);
   - Benefit: More stable, better performance

2. Methods not using useCallback - Lines 40-90
   - Suggestion: Wrap next, previous, addSong, etc. in useCallback
   - Benefit: Prevents recreating functions on every render, better performance

3. No validation in addSong - Line 65
   - Suggestion: Validate song before adding:
     if (!song || !song.id || !song.title) {
       console.error('Invalid song');
       return;
     }
   - Benefit: Defensive programming, prevents bad data

4. Shuffle queue not regenerated when playlist changes - Effect missing
   - Suggestion: Add useEffect:
     useEffect(() => {
       if (isShuffled) {
         generateShuffleQueue();
       }
     }, [playlist.length, isShuffled]);
   - Benefit: Shuffle updates when songs added/removed

5. Complex next/previous logic could be extracted - Lines 45-90
   - Suggestion: Extract navigation logic:
     function calculateNextIndex(current, mode, shuffled, queue) { ... }
   - Benefit: Easier to test, clearer separation
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All required methods present in interface
- ✅ Uses useLocalStorage for persistence correctly
- ✅ Repeat mode logic correctly implemented
- ✅ Shuffle algorithm uses Fisher-Yates (proper randomization)
- ✅ Current song stays first in shuffle queue
- ✅ Clean integration with useLocalStorage
- ✅ Type-safe throughout
- ✅ Immutable state updates
- ✅ Edge cases handled (empty playlist, single song)
- ✅ All three repeat modes work correctly

---

### Recommended Refactorings:

**REFACTORING 1: Complete next() implementation with all modes**

```typescript
// BEFORE (incomplete - only handles sequential)
const next = (): number => {
  if (currentIndex >= playlist.length - 1) {
    return 0; // Wrap to start
  }
  const newIndex = currentIndex + 1;
  setCurrentIndex(newIndex);
  return newIndex;
};

// AFTER (comprehensive - all modes)
const next = (): number => {
  // Repeat ONE: Stay on current song
  if (repeatMode === RepeatMode.ONE) {
    return currentIndex;
  }
  
  // Shuffle mode
  if (isShuffled) {
    const nextShuffleIndex = shuffleIndex + 1;
    
    // Check if reached end of shuffle queue
    if (nextShuffleIndex >= shuffleQueue.length) {
      if (repeatMode === RepeatMode.ALL) {
        // Reshuffle and start over
        generateShuffleQueue();
        setShuffleIndex(0);
        const newIndex = shuffleQueue[0];
        setCurrentIndex(newIndex);
        return newIndex;
      } else {
        // Repeat OFF: Stay at last song
        return currentIndex;
      }
    }
    
    // Continue in shuffle queue
    setShuffleIndex(nextShuffleIndex);
    const newIndex = shuffleQueue[nextShuffleIndex];
    setCurrentIndex(newIndex);
    return newIndex;
  }
  
  // Sequential mode
  if (currentIndex >= playlist.length - 1) {
    if (repeatMode === RepeatMode.ALL) {
      // Wrap to first song
      setCurrentIndex(0);
      return 0;
    } else {
      // Repeat OFF: Stay at last song
      return currentIndex;
    }
  }
  
  // Normal increment
  const newIndex = currentIndex + 1;
  setCurrentIndex(newIndex);
  return newIndex;
};
```

**Reason:** Handles all repeat modes, shuffle logic, queue exhaustion, boundary conditions.

---

**REFACTORING 2: Implement removeSong with index adjustment**

```typescript
// BEFORE (incomplete - doesn't adjust index)
const removeSong = (id: string): void => {
  const newPlaylist = playlist.filter(song => song.id !== id);
  setPlaylist(newPlaylist);
};

// AFTER (complete with index handling)
const removeSong = (id: string): void => {
  // Find song index before removal
  const songIndex = playlist.findIndex(song => song.id === id);
  
  // Song not found
  if (songIndex === -1) {
    return;
  }
  
  // Remove song from playlist
  const newPlaylist = playlist.filter(song => song.id !== id);
  setPlaylist(newPlaylist);
  
  // Adjust currentIndex based on removed position
  if (songIndex < currentIndex) {
    // Removed song before current: decrement index
    setCurrentIndex(currentIndex - 1);
  } else if (songIndex === currentIndex) {
    // Removed current song: stay at same index (next song takes its place)
    // Or move to previous if at end
    if (currentIndex >= newPlaylist.length && newPlaylist.length > 0) {
      setCurrentIndex(newPlaylist.length - 1);
    }
  }
  // If songIndex > currentIndex, no adjustment needed
  
  // Regenerate shuffle queue if shuffled
  if (isShuffled) {
    generateShuffleQueue();
  }
};
```

**Reason:** Prevents wrong song playing after removal, maintains playlist state integrity.

---

**REFACTORING 3: Implement generateShuffleQueue with proper algorithm**

```typescript
// BEFORE (missing or basic)
const generateShuffleQueue = (): void => {
  const shuffled = [...Array(playlist.length).keys()];
  // ... incomplete
  setShuffleQueue(shuffled);
};

// AFTER (Fisher-Yates with current song handling)
const generateShuffleQueue = useCallback((): void => {
  if (playlist.length === 0) {
    setShuffleQueue([]);
    setShuffleIndex(0);
    return;
  }
  
  // Create array of indices
  const indices = Array.from({ length: playlist.length }, (_, i) => i);
  
  // Put current song first (stays playing when shuffle enabled)
  if (currentIndex >= 0 && currentIndex < indices.length) {
    const currentIdx = indices.indexOf(currentIndex);
    if (currentIdx > 0) {
      [indices[0], indices[currentIdx]] = [indices[currentIdx], indices[0]];
    }
  }
  
  // Fisher-Yates shuffle (starting from index 1 to keep current song first)
  for (let i = indices.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i - 1)) + 1; // Don't shuffle index 0
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  setShuffleQueue(indices);
  setShuffleIndex(0); // Start at beginning of queue (current song)
}, [playlist.length, currentIndex]);
```

**Reason:** Proper randomization, current song handling, efficient O(n) algorithm.

---

**REFACTORING 4: Implement hasNext and hasPrevious**

```typescript
// AFTER (new methods)
const hasNext = (): boolean => {
  // Repeat modes other than OFF always allow next
  if (repeatMode !== RepeatMode.OFF) {
    return true;
  }
  
  // Repeat OFF: check boundaries
  if (isShuffled) {
    return shuffleIndex < shuffleQueue.length - 1;
  }
  
  return currentIndex < playlist.length - 1;
};

const hasPrevious = (): boolean => {
  // Repeat modes other than OFF always allow previous
  if (repeatMode !== RepeatMode.OFF) {
    return true;
  }
  
  // Repeat OFF: check boundaries
  if (isShuffled) {
    return shuffleIndex > 0;
  }
  
  return currentIndex > 0;
};
```

**Reason:** Enables proper UI button disabling in Controls component.

---

**REFACTORING 5: Add useEffect for shuffle queue regeneration**

```typescript
// Add to hook body
useEffect(() => {
  // Regenerate shuffle queue when playlist changes (if shuffled)
  if (isShuffled && playlist.length > 0) {
    generateShuffleQueue();
  }
}, [playlist.length, isShuffled, generateShuffleQueue]);
```

**Reason:** Keeps shuffle queue in sync when songs added/removed.

---

**REFACTORING 6: Optimize with useCallback**

```typescript
const addSong = useCallback((song: Song): void => {
  setPlaylist(prev => [...prev, song]);
}, []);

const removeSong = useCallback((id: string): void => {
  // ... implementation
}, [playlist, currentIndex, isShuffled]);

const next = useCallback((): number => {
  // ... implementation
}, [currentIndex, playlist.length, repeatMode, isShuffled, shuffleIndex, shuffleQueue]);

// ... other methods
```

**Reason:** Prevents recreating functions on every render, better performance.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All repeat modes work
  - Shuffle fully implemented
  - Navigation handles all cases
  - Index adjustment on removal
  - hasNext/hasPrevious implemented
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: missing useCallback, could add validation
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: repeat modes incomplete, shuffle not working
  - Missing required methods
  - Index adjustment broken
  - Must fix before Player can use this

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This is the central state management hook for playlist
- Player component depends heavily on this
- Most complex hook in the application
- Repeat and shuffle features are new additions

**Dependencies:**
- Depends on: useLocalStorage, Song type, RepeatMode enum
- Used by: Player component (primary user)

**What to Look For:**
- **All three repeat modes** work correctly (OFF, ALL, ONE)
- **Shuffle navigation** follows queue (not sequential)
- **Index adjustment** when removing songs
- **hasNext/hasPrevious** methods exist and work correctly
- **Fisher-Yates shuffle** or equivalent proper algorithm
- **Queue exhaustion** handled (reshuffle or stop based on repeat mode)

**Common Mistakes to Watch For:**
- Repeat ONE not handled (next/previous should return currentIndex)
- Shuffle navigation not implemented (always sequential)
- removeSong doesn't adjust currentIndex (wrong song plays)
- Missing hasNext/hasPrevious methods (Controls can't disable buttons)
- Shuffle algorithm has bias (not true random)
- Current song not preserved when enabling shuffle
- Queue not regenerated when playlist changes
- Shuffle queue persisted to localStorage (should be regenerated)

**Testing Checklist:**
```typescript
const hook = usePlaylist(initialPlaylist);

// Test sequential navigation
hook.setRepeatMode(RepeatMode.ALL);
let index = hook.next(); // Should increment
index = hook.previous(); // Should decrement

// Test Repeat OFF boundaries
hook.setRepeatMode(RepeatMode.OFF);
hook.setCurrentIndex(0);
index = hook.previous(); // Should stay at 0
console.assert(index === 0, "Previous at start");

hook.setCurrentIndex(playlist.length - 1);
index = hook.next(); // Should stay at last
console.assert(index === playlist.length - 1, "Next at end");

// Test Repeat ONE
hook.setRepeatMode(RepeatMode.ONE);
const current = hook.currentIndex;
index = hook.next();
console.assert(index === current, "Repeat ONE - next stays");

// Test shuffle
hook.toggleShuffle(); // Enable
// Verify shuffleQueue generated and currentIndex at position 0
const queue1 = hook.shuffleQueue[0];
console.assert(queue1 === hook.currentIndex, "Current song first in shuffle");

// Test removal
const songToRemove = playlist[1];
hook.removeSong(songToRemove.id);
// Verify currentIndex adjusted if needed

// Test hasNext/hasPrevious
hook.setRepeatMode(RepeatMode.OFF);
hook.setCurrentIndex(0);
console.assert(!hook.hasPrevious(), "No previous at start");
hook.setCurrentIndex(playlist.length - 1);
console.assert(!hook.hasNext(), "No next at end");

hook.setRepeatMode(RepeatMode.ALL);
console.assert(hook.hasNext(), "Always has next in Repeat ALL");
```
