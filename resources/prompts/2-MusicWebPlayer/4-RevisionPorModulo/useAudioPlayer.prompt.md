# CODE REVIEW REQUEST #10: `src/hooks/useAudioPlayer.ts`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/hooks/useAudioPlayer.ts`

**Component objective:** Manage HTML5 Audio element state and operations. Provides playback control (play/pause/seek), time tracking (currentTime/duration), volume management, error handling, and audio element lifecycle. Integrates with useLocalStorage for volume persistence. Critical interface between React and browser Audio API.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR1-FR5:** Playback control
- Play current song
- Pause playback
- Resume from paused position
- Change audio source

**FR6:** Automatic information update
- Real-time currentTime updates
- Duration loaded from metadata

**FR10-FR11:** Time display
- Track elapsed time (currentTime)
- Display total duration

**FR12-FR13:** Progress bar with seek
- Visual progress bar
- User can click to seek position

**FR20:** Visual state change
- Play/Pause button reflects current state

**NEW: Volume Control Requirements:**
- Volume slider (0-100%)
- Mute/unmute toggle
- Volume persisted to localStorage
- Mute state persisted
- Audio element volume property controlled

**NFR8:** Immediate response
- Play/pause responds in <100ms
- Seek is instant

**NFR9:** Proper error handling
- Audio errors don't crash app
- Clear error messages displayed
- Playback continues after recoverable errors

**Error Handling (from ErrorHandler):**
- Convert MediaError to PlaybackError
- Handle load errors, decode errors, network errors
- Display user-friendly messages
- Log errors for debugging

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│         <<hook>>                        │
│      useAudioPlayer                     │
├─────────────────────────────────────────┤
│ - audioRef: RefObject<HTMLAudioElement>│
│ - isPlaying: boolean                    │
│ - currentTime: number                   │
│ - duration: number                      │
│ - volume: number                        │
│ - isMuted: boolean                      │
│ - error: string | null                  │
├─────────────────────────────────────────┤
│ + useAudioPlayer(                       │
│     audioRef: RefObject<HTMLAudioElement>│
│   ): AudioPlayerHook                    │
│ + play(): Promise<void>                 │
│ + pause(): void                         │
│ + seek(time: number): void              │
│ + setSource(url: string): void          │
│ + setVolume(volume: number): void       │
│ + toggleMute(): void                    │
│ - handleTimeUpdate(): void              │
│ - handleLoadedMetadata(): void          │
│ - handleError(event): void              │
│ - handleEnded(): void                   │
└─────────────────────────────────────────┘
           │
           │ uses
           ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   useLocalStorage       │    │   ErrorHandler          │
│                         │    │   - handlePlaybackError │
└─────────────────────────┘    └─────────────────────────┘

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
- [ ] Function named `useAudioPlayer` (exact match)
- [ ] Parameter: `audioRef: RefObject<HTMLAudioElement>`
- [ ] Returns: `AudioPlayerHook` interface
- [ ] Hook is exported

**AudioPlayerHook Interface:**
- [ ] `isPlaying: boolean` - Current playback state
- [ ] `currentTime: number` - Current position in seconds
- [ ] `duration: number` - Total duration in seconds
- [ ] `volume: number` - Volume level (0-100)
- [ ] `isMuted: boolean` - Mute state
- [ ] `error: string | null` - Error message if any
- [ ] `play: () => Promise<void>` - Start playback
- [ ] `pause: () => void` - Pause playback
- [ ] `seek: (time: number) => void` - Jump to position
- [ ] `setSource: (url: string) => void` - Load new audio
- [ ] `setVolume: (volume: number) => void` - Adjust volume
- [ ] `toggleMute: () => void` - Toggle mute state

**State Management:**
- [ ] Uses `useState` for isPlaying
- [ ] Uses `useState` for currentTime
- [ ] Uses `useState` for duration
- [ ] Uses `useLocalStorage` for volume (persisted)
- [ ] Uses `useLocalStorage` for isMuted (persisted)
- [ ] Uses `useState` for volumeBeforeMute
- [ ] Uses `useState` for error

**Event Listeners:**
- [ ] 'timeupdate' event listener
- [ ] 'loadedmetadata' event listener
- [ ] 'error' event listener
- [ ] 'ended' event listener (optional)
- [ ] All listeners added in useEffect
- [ ] All listeners removed in cleanup

**Implementation Approach:**
- [ ] All methods properly control audio element
- [ ] Error handling via ErrorHandler utility
- [ ] Volume synced with audio element
- [ ] Mute preserves last volume level

**Score:** __/10

**Observations:**
- Does the interface match exactly?
- Are all required methods present?
- Are event listeners properly managed?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **useAudioPlayer main:** High (12-18 cyclomatic complexity)
  - Multiple state declarations
  - Multiple useEffects
  - Event listener setup
  - Method definitions
  - Acceptable for audio control hook
- [ ] **play():** Low-Moderate (3-5 cyclomatic complexity)
  - Try-catch
  - Promise handling
  - State update
- [ ] **pause():** Low (2 cyclomatic complexity)
  - Audio pause
  - State update
- [ ] **seek():** Low (3-4 cyclomatic complexity)
  - Bounds check
  - Audio currentTime assignment
- [ ] **setSource():** Low (3-4 cyclomatic complexity)
  - Reset state
  - Set audio src
  - Error handling
- [ ] **setVolume():** Moderate (4-6 cyclomatic complexity)
  - Clamp value
  - Update state
  - Sync audio element
  - Unmute logic
- [ ] **toggleMute():** Moderate (4-5 cyclomatic complexity)
  - Toggle state
  - Save/restore volume
  - Sync audio element
- [ ] **Event handlers:** Low (2-4 cyclomatic complexity each)
  - Simple state updates
  - Error conversion

**Performance:**
- [ ] timeupdate fires ~250ms (acceptable overhead)
- [ ] No unnecessary re-renders
- [ ] useCallback used for methods (optional but good)
- [ ] Effect dependencies correct

**Coupling:**
- [ ] Depends on useLocalStorage hook
- [ ] Depends on ErrorHandler utility
- [ ] Depends on React (useState, useEffect, RefObject)
- [ ] Reasonable coupling

**Cohesion:**
- [ ] High cohesion (all methods control audio)
- [ ] Single responsibility (audio playback management)
- [ ] Event handlers support main functionality

**Code Smells:**
- [ ] Check for: Long Method (main hook may be long but acceptable)
- [ ] Check for: Missing error handling (play() must catch)
- [ ] Check for: Memory leaks (event listeners must be removed)
- [ ] Check for: Stale closures (effect dependencies must be correct)
- [ ] Check for: Missing audioRef null checks

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**Playback Control:**
- [ ] **AC1:** play() calls audio.play() and updates isPlaying
- [ ] **AC2:** play() returns Promise (handles autoplay restrictions)
- [ ] **AC3:** play() catches and handles errors
- [ ] **AC4:** pause() calls audio.pause() and updates isPlaying
- [ ] **AC5:** seek() sets audio.currentTime to specified value
- [ ] **AC6:** seek() clamps time to valid range (0 to duration)
- [ ] **AC7:** setSource() loads new audio URL

**Time Tracking:**
- [ ] **AC8:** currentTime updated via 'timeupdate' event
- [ ] **AC9:** currentTime updates ~4 times per second
- [ ] **AC10:** duration loaded from 'loadedmetadata' event
- [ ] **AC11:** duration defaults to 0 if not loaded

**Volume Control:**
- [ ] **AC12:** volume stored in localStorage (0-100 range)
- [ ] **AC13:** volume default is 70%
- [ ] **AC14:** setVolume clamps to 0-100 range
- [ ] **AC15:** setVolume syncs audio.volume (converts to 0-1)
- [ ] **AC16:** setVolume unmutes if volume > 0
- [ ] **AC17:** isMuted stored in localStorage
- [ ] **AC18:** toggleMute saves volumeBeforeMute
- [ ] **AC19:** toggleMute restores volume on unmute
- [ ] **AC20:** toggleMute sets audio.volume to 0 when muted
- [ ] **AC21:** Mute state persists across sessions

**Error Handling:**
- [ ] **AC22:** 'error' event listener attached
- [ ] **AC23:** Errors converted via ErrorHandler.handlePlaybackError
- [ ] **AC24:** error state contains user-friendly message
- [ ] **AC25:** play() catches autoplay rejection
- [ ] **AC26:** Errors don't crash the app
- [ ] **AC27:** Errors logged for debugging

**Lifecycle Management:**
- [ ] **AC28:** Event listeners added in useEffect
- [ ] **AC29:** Event listeners removed in cleanup
- [ ] **AC30:** Effect dependencies are correct
- [ ] **AC31:** No memory leaks
- [ ] **AC32:** audioRef null check before accessing

**State Initialization:**
- [ ] **AC33:** Volume loaded from localStorage on mount
- [ ] **AC34:** Mute state loaded from localStorage on mount
- [ ] **AC35:** audio.volume synced on mount
- [ ] **AC36:** All state initialized with safe defaults

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|-------------------|----------|
| audioRef is null | Methods don't throw errors | [ ] |
| play() before audio loaded | Handles gracefully | [ ] |
| seek() to negative time | Clamped to 0 | [ ] |
| seek() beyond duration | Clamped to duration | [ ] |
| setVolume(-10) | Clamped to 0 | [ ] |
| setVolume(150) | Clamped to 100 | [ ] |
| Audio load error | Error message displayed | [ ] |
| Audio decode error | Error message displayed | [ ] |
| Network error during playback | Error message displayed | [ ] |
| Rapid play/pause calls | Handled correctly | [ ] |
| Volume change while muted | Volume saved but not applied | [ ] |
| Unmute with volume 0 | Restores previous volume | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Hook JSDoc:**
- [ ] Description of hook purpose and functionality
- [ ] `@param audioRef` with RefObject description
- [ ] `@returns` AudioPlayerHook interface description
- [ ] Multiple `@example` tags showing:
  - Basic usage (play/pause)
  - Seeking
  - Volume control
  - Error handling
  - Full integration example

**AudioPlayerHook Interface JSDoc:**
- [ ] Description of interface
- [ ] All properties documented with types
- [ ] All methods documented with params, returns, throws

**Method JSDoc:**
- [ ] play() documented with Promise return and error handling
- [ ] pause() documented
- [ ] seek() documented with bounds behavior
- [ ] setSource() documented with reset behavior
- [ ] setVolume() documented with clamping and unmute
- [ ] toggleMute() documented with volume preservation

**Event Handler JSDoc:**
- [ ] handleTimeUpdate() documented
- [ ] handleLoadedMetadata() documented
- [ ] handleError() documented with ErrorHandler usage

**Code Clarity:**
- [ ] Variable names descriptive
- [ ] Logic clearly organized
- [ ] Comments explain audio API quirks
- [ ] Event listener setup is clear

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Only manages audio playback ✓
- [ ] **Open/Closed:** Easy to extend with new features ✓

**React Hook Best Practices:**
- [ ] Follows Rules of Hooks
- [ ] Multiple useEffects for different concerns
- [ ] All effects have cleanup functions
- [ ] Dependencies correct and complete
- [ ] Methods use useCallback (optional but good)

**Audio API Best Practices:**
- [ ] Handles autoplay restrictions (play() returns Promise)
- [ ] Cleans up event listeners
- [ ] Checks audioRef.current before access
- [ ] Syncs React state with Audio element state
- [ ] Handles all audio events properly

**Error Handling Best Practices:**
- [ ] All async operations wrapped in try-catch
- [ ] Uses ErrorHandler for consistent error messages
- [ ] Errors logged for debugging
- [ ] Never throws from hook methods
- [ ] Graceful degradation

**Volume Management Best Practices:**
- [ ] Volume persisted to localStorage
- [ ] Mute preserves last volume (doesn't lose setting)
- [ ] Volume clamped to valid range
- [ ] Audio element volume synced (0-1 scale conversion)

**TypeScript Best Practices:**
- [ ] Explicit return types on all methods
- [ ] AudioPlayerHook interface properly defined
- [ ] Type-safe throughout
- [ ] No `any` types
- [ ] Proper RefObject typing

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
- "Comprehensive audio player hook with full HTML5 Audio API integration. All playback controls work correctly. Volume management with persistence. Proper error handling via ErrorHandler. Event listeners properly managed. Ready for production."
- "Core playback works but volume control incomplete. Event listener cleanup missing. Error handling basic but functional. Needs improvements for production."
- "Critical: No event listener cleanup (memory leaks). play() doesn't catch errors (crashes on autoplay block). Volume not persisted. Missing required volume methods. Major refactoring needed."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. Event listeners not removed in cleanup - Lines 35-50
   - Current: Event listeners added but no cleanup function
   - Impact: Memory leaks, multiple listeners accumulate on re-renders
   - Proposed solution: Add cleanup to each useEffect:
     return () => {
       audio.removeEventListener('timeupdate', handleTimeUpdate);
       audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
       audio.removeEventListener('error', handleError);
     };

2. play() doesn't catch Promise rejection - Line 45
   - Current: audio.play() called without try-catch
   - Impact: Throws unhandled Promise rejection when autoplay blocked
   - Proposed solution: Wrap in try-catch:
     try {
       await audio.play();
       setIsPlaying(true);
     } catch (error) {
       console.error('Play failed:', error);
       setError('Unable to play. Please interact with the page first.');
     }

3. No audioRef null check - Multiple lines
   - Current: Accesses audioRef.current without checking
   - Impact: Throws TypeError if ref not set, crashes app
   - Proposed solution: Add guard at start of methods:
     if (!audioRef.current) return;

4. Volume not persisted to localStorage - Line 15
   - Current: Uses useState instead of useLocalStorage
   - Impact: Volume resets on page reload, bad UX
   - Proposed solution: Change to:
     const [volume, setVolumeState] = useLocalStorage('player-volume', 70);

5. Missing toggleMute and setVolume methods - Hook return
   - Impact: Volume control UI can't function
   - Proposed solution: Implement both methods per requirements
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. Methods not using useCallback - Lines 40-80
   - Suggestion: Wrap play, pause, seek, etc. in useCallback
   - Benefit: Prevents recreating functions, better performance

2. No volume sync effect on mount - Missing useEffect
   - Suggestion: Add effect to sync audio.volume with stored volume:
     useEffect(() => {
       if (audioRef.current) {
         audioRef.current.volume = isMuted ? 0 : (volume / 100);
       }
     }, []); // Run once on mount
   - Benefit: Ensures audio element matches stored settings

3. seek() doesn't validate duration - Line 60
   - Current: May seek beyond duration if duration not loaded
   - Suggestion: Add check:
     const clampedTime = Math.max(0, Math.min(time, duration || 0));
   - Benefit: More defensive, prevents edge case bugs

4. Error state not cleared on success - Line 70
   - Suggestion: Clear error when setSource or play succeeds:
     setError(null);
   - Benefit: Old errors don't persist incorrectly

5. handleError doesn't get songId - Line 85
   - Suggestion: Track current songId in state and pass to ErrorHandler:
     const playbackError = ErrorHandler.handlePlaybackError(error, currentSongId);
   - Benefit: Better error tracking and logging

6. No volume validation in setVolume - Line 90
   - Suggestion: Add input validation:
     if (typeof volume !== 'number' || isNaN(volume)) return;
   - Benefit: Defensive programming
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All required playback methods implemented
- ✅ Event listeners for time tracking set up
- ✅ Error handling via ErrorHandler utility
- ✅ Volume persisted to localStorage
- ✅ Mute preserves volume setting
- ✅ play() returns Promise (handles autoplay)
- ✅ seek() clamps time to valid range
- ✅ Type-safe throughout
- ✅ Clean integration with HTML5 Audio API
- ✅ All AudioPlayerHook interface methods present

---

### Recommended Refactorings:

**REFACTORING 1: Add event listener cleanup**

```typescript
// BEFORE (missing cleanup)
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('error', handleError);
}, []);

// AFTER (with cleanup)
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  
  // Add event listeners
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('error', handleError);
  
  // Cleanup function
  return () => {
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('error', handleError);
  };
}, []); // Empty deps - set up once on mount
```

**Reason:** Prevents memory leaks, essential for proper hook lifecycle management.

---

**REFACTORING 2: Implement comprehensive volume control**

```typescript
// State with persistence
const [volume, setVolumeState] = useLocalStorage<number>(
  'music-player-volume',
  70 // Default 70%
);

const [isMuted, setIsMuted] = useLocalStorage<boolean>(
  'music-player-muted',
  false
);

const [volumeBeforeMute, setVolumeBeforeMute] = useState<number>(70);

// Sync volume on mount and when volume/mute changes
useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = isMuted ? 0 : (volume / 100);
  }
}, [volume, isMuted]);

// setVolume method
const setVolume = useCallback((newVolume: number): void => {
  // Validate and clamp
  const clampedVolume = Math.max(0, Math.min(100, newVolume));
  
  // Update state
  setVolumeState(clampedVolume);
  
  // Sync audio element
  if (audioRef.current) {
    audioRef.current.volume = clampedVolume / 100;
  }
  
  // Unmute if setting volume > 0
  if (clampedVolume > 0 && isMuted) {
    setIsMuted(false);
  }
}, [isMuted, setVolumeState, setIsMuted]);

// toggleMute method
const toggleMute = useCallback((): void => {
  if (isMuted) {
    // Unmute: restore previous volume
    setIsMuted(false);
    setVolume(volumeBeforeMute);
  } else {
    // Mute: save current volume and set to 0
    setVolumeBeforeMute(volume);
    setIsMuted(true);
    
    if (audioRef.current) {
      audioRef.current.volume = 0;
    }
  }
}, [isMuted, volume, volumeBeforeMute, setIsMuted, setVolume]);
```

**Reason:** Complete volume control with persistence, mute preservation, audio sync.

---

**REFACTORING 3: Improve play() with error handling**

```typescript
// BEFORE (basic)
const play = (): void => {
  audioRef.current?.play();
  setIsPlaying(true);
};

// AFTER (comprehensive error handling)
const play = useCallback(async (): Promise<void> => {
  if (!audioRef.current) {
    return;
  }
  
  try {
    // Clear any previous errors
    setError(null);
    
    // Attempt to play
    await audioRef.current.play();
    
    // Update state only if play succeeded
    setIsPlaying(true);
  } catch (error) {
    // Handle autoplay restrictions and other errors
    console.error('Playback failed:', error);
    
    // Set user-friendly error message
    if ((error as Error).name === 'NotAllowedError') {
      setError('Unable to play. Please interact with the page first.');
    } else {
      setError('Playback failed. Please try again.');
    }
    
    // Don't update isPlaying state on error
    setIsPlaying(false);
  }
}, []);
```

**Reason:** Handles autoplay restrictions, provides user feedback, prevents crashes.

---

**REFACTORING 4: Improve error handling**

```typescript
// State to track current song for error reporting
const [currentSongId, setCurrentSongId] = useState<string>('unknown');

// handleError with ErrorHandler integration
const handleError = useCallback((event: Event): void => {
  const audio = audioRef.current;
  if (!audio) return;
  
  // Get MediaError from audio element
  const mediaError = audio.error;
  if (!mediaError) return;
  
  // Convert to PlaybackError using ErrorHandler
  const playbackError = ErrorHandler.handlePlaybackError(
    mediaError as any,
    currentSongId
  );
  
  // Set error state with user-friendly message
  setError(playbackError.message);
  
  // Pause playback on error
  setIsPlaying(false);
}, [currentSongId]);

// Update setSource to track songId
const setSource = useCallback((url: string, songId: string = 'unknown'): void => {
  if (!audioRef.current) return;
  
  try {
    // Clear previous error
    setError(null);
    
    // Reset playback state
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    // Track song ID for error reporting
    setCurrentSongId(songId);
    
    // Set new source
    audioRef.current.src = url;
    audioRef.current.load();
  } catch (error) {
    console.error('Error setting audio source:', error);
    setError('Failed to load audio file.');
  }
}, []);
```

**Reason:** Better error tracking, uses ErrorHandler utility, provides songId for debugging.

---

**REFACTORING 5: Improve seek with validation**

```typescript
// BEFORE (basic)
const seek = (time: number): void => {
  if (audioRef.current) {
    audioRef.current.currentTime = time;
  }
};

// AFTER (validated and safe)
const seek = useCallback((time: number): void => {
  if (!audioRef.current) return;
  
  // Validate input
  if (typeof time !== 'number' || isNaN(time)) {
    console.error('Invalid seek time:', time);
    return;
  }
  
  // Clamp to valid range
  const clampedTime = Math.max(0, Math.min(time, duration || 0));
  
  try {
    audioRef.current.currentTime = clampedTime;
    setError(null); // Clear any errors
  } catch (error) {
    console.error('Seek failed:', error);
    // Don't set error state for seek failures (minor issue)
  }
}, [duration]);
```

**Reason:** Defensive programming, handles edge cases, validates inputs.

---

**REFACTORING 6: Optimize with useCallback**

```typescript
// Wrap all methods in useCallback
const play = useCallback(async (): Promise<void> => {
  // ... implementation
}, []);

const pause = useCallback((): void => {
  // ... implementation
}, []);

const seek = useCallback((time: number): void => {
  // ... implementation
}, [duration]);

const setSource = useCallback((url: string): void => {
  // ... implementation
}, []);

const setVolume = useCallback((volume: number): void => {
  // ... implementation
}, [isMuted]);

const toggleMute = useCallback((): void => {
  // ... implementation
}, [isMuted, volume, volumeBeforeMute]);

// Event handlers also use useCallback
const handleTimeUpdate = useCallback((): void => {
  if (audioRef.current) {
    setCurrentTime(audioRef.current.currentTime);
  }
}, []);

const handleLoadedMetadata = useCallback((): void => {
  if (audioRef.current) {
    setDuration(audioRef.current.duration || 0);
  }
}, []);

const handleError = useCallback((event: Event): void => {
  // ... implementation
}, [currentSongId]);
```

**Reason:** Performance optimization, stable function references, prevents unnecessary re-renders.

---

**REFACTORING 7: Add comprehensive JSDoc**

```typescript
/**
 * Custom React hook for managing HTML5 Audio playback.
 * 
 * Provides a complete interface for audio control including play/pause,
 * seeking, volume management, time tracking, and error handling.
 * Integrates with ErrorHandler for user-friendly error messages.
 * 
 * **Features:**
 * - Play/pause control with autoplay handling
 * - Real-time time tracking (currentTime, duration)
 * - Volume control with persistence
 * - Mute/unmute with volume preservation
 * - Seek functionality with bounds checking
 * - Error handling and user feedback
 * - Proper event listener lifecycle management
 * 
 * @param audioRef - React ref to HTML audio element
 * @returns AudioPlayerHook interface with state and controls
 * 
 * @example
 * // Basic usage
 * const audioRef = useRef<HTMLAudioElement>(null);
 * const player = useAudioPlayer(audioRef);
 * 
 * // Play/pause
 * <button onClick={player.play}>Play</button>
 * <button onClick={player.pause}>Pause</button>
 * 
 * @example
 * // Volume control
 * <input 
 *   type="range" 
 *   value={player.volume}
 *   onChange={(e) => player.setVolume(Number(e.target.value))}
 * />
 * <button onClick={player.toggleMute}>Mute</button>
 * 
 * @example
 * // Seeking
 * <input
 *   type="range"
 *   value={player.currentTime}
 *   max={player.duration}
 *   onChange={(e) => player.seek(Number(e.target.value))}
 * />
 * 
 * @example
 * // Error handling
 * {player.error && (
 *   <div className="error">{player.error}</div>
 * )}
 */
export function useAudioPlayer(
  audioRef: RefObject<HTMLAudioElement>
): AudioPlayerHook {
  // Implementation...
}
```

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All playback methods work
  - Volume control complete with persistence
  - Error handling comprehensive
  - Event listeners properly managed
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: could use useCallback, better validation
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: memory leaks, no error handling, missing methods
  - Volume control incomplete
  - Must fix before Player can use this

---

**Specific actions for developer:**
[Provide clear, actionable steps. Examples:]
- "Add cleanup functions to all useEffect hooks to remove event listeners"
- "Wrap play() in try-catch to handle autoplay restrictions"
- "Add audioRef.current null checks in all methods"
- "Change volume state to useLocalStorage for persistence"
- "Implement setVolume() and toggleMute() methods"
- "Add useEffect to sync audio.volume with state on mount"
- "Wrap all methods in useCallback for optimization"
- "Integrate ErrorHandler in handleError for consistent messaging"
- "Add comprehensive JSDoc with all examples"

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This is the audio control interface for the entire app
- Player component depends heavily on this hook
- Must handle HTML5 Audio API quirks (autoplay restrictions, etc.)
- Error handling is critical (prevents crashes)

**Dependencies:**
- Depends on: useLocalStorage, ErrorHandler, React hooks
- Used by: Player component (primary user)

**What to Look For:**
- **Event listener cleanup** in all useEffects (memory leak prevention)
- **play() error handling** (autoplay restrictions must be caught)
- **audioRef null checks** (prevents TypeErrors)
- **Volume persistence** via useLocalStorage (not regular useState)
- **Mute volume preservation** (toggleMute shouldn't lose volume setting)
- **Error conversion** via ErrorHandler utility

**Common Mistakes to Watch For:**
- No event listener cleanup (memory leaks)
- play() not catching Promise rejection (crashes on autoplay block)
- Missing audioRef.current checks (TypeErrors)
- Volume not persisted (resets on reload)
- toggleMute loses volume setting
- Error event not handled (no error display)
- Wrong volume scale (should be 0-100 for state, 0-1 for audio element)
- Effect dependencies missing or incorrect

**Testing Checklist:**
```typescript
const audioRef = useRef<HTMLAudioElement>(null);
const player = useAudioPlayer(audioRef);

// Test playback
await player.play();
console.assert(player.isPlaying === true, "Playing state");

player.pause();
console.assert(player.isPlaying === false, "Paused state");

// Test seeking
player.seek(30);
// Verify audio.currentTime === 30

player.seek(-10); // Should clamp to 0
player.seek(9999); // Should clamp to duration

// Test volume
player.setVolume(50);
console.assert(player.volume === 50, "Volume set");
console.assert(audioRef.current.volume === 0.5, "Audio element synced");

player.setVolume(150); // Should clamp to 100
player.setVolume(-10); // Should clamp to 0

// Test mute
const volumeBefore = player.volume;
player.toggleMute();
console.assert(player.isMuted === true, "Muted");
console.assert(audioRef.current.volume === 0, "Audio muted");

player.toggleMute();
console.assert(player.isMuted === false, "Unmuted");
console.assert(player.volume === volumeBefore, "Volume restored");

// Test error handling
// Trigger audio error
// Verify player.error is set

// Test persistence
// Reload page
// Verify volume and mute state restored

// Test cleanup
// Unmount component
// Verify no memory leaks (listeners removed)
```

**HTML5 Audio API Notes:**
- `play()` returns Promise (can be rejected by autoplay policy)
- `timeupdate` event fires ~250ms (4 times per second)
- `loadedmetadata` event fires when duration available
- `error` event provides MediaError object
- `volume` property is 0-1 scale (not 0-100)
