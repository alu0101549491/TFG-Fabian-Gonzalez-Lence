Perfect! Let's move to **Module #10: `src/hooks/useAudioPlayer.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Hooks Layer - Audio Playback Management Hook

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
│   │   ├── TrackInfo.tsx
│   │   ├── Controls.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Playlist.tsx
│   │   └── AddSongForm.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts          ← CURRENT MODULE
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
import {useState, useEffect, RefObject} from 'react';
import {PlaybackError} from '@types/playback-error';

/**
 * Interface for the useAudioPlayer hook return value.
 * @category Hooks
 */
export interface AudioPlayerHook {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Current playback time in seconds */
  currentTime: number;
  
  /** Total duration of the audio in seconds */
  duration: number;
  
  /** Current playback error, if any */
  error: string | null;
  
  /** Function to start playback */
  play: () => Promise<void>;
  
  /** Function to pause playback */
  pause: () => void;
  
  /** Function to seek to a specific time */
  seek: (time: number) => void;
  
  /** Function to set the audio source */
  setSource: (url: string) => void;
}

/**
 * Custom hook for managing HTML5 Audio element state and controls.
 * @param audioRef Reference to the audio HTML element
 * @returns Hook interface with playback state and controls
 * @category Hooks
 */
export function useAudioPlayer(
    audioRef: RefObject<HTMLAudioElement>,
): AudioPlayerHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const play = async (): Promise<void> => {
    // TODO: Implementation
  };

  const pause = (): void => {
    // TODO: Implementation
  };

  const seek = (time: number): void => {
    // TODO: Implementation
  };

  const setSource = (url: string): void => {
    // TODO: Implementation
  };

  const handleTimeUpdate = (): void => {
    // TODO: Implementation
  };

  const handleLoadedMetadata = (): void => {
    // TODO: Implementation
  };

  const handleEnded = (): void => {
    // TODO: Implementation
  };

  const handleError = (err: Error): void => {
    // TODO: Implementation
  };

  useEffect(() => {
    // TODO: Set up audio element event listeners
    return () => {
      // TODO: Cleanup
    };
  }, [audioRef]);

  return {
    isPlaying,
    currentTime,
    duration,
    error,
    play,
    pause,
    seek,
    setSource,
  };
}
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR1:** Play selected song from beginning or current position - when clicking Play, the current song begins playing from the beginning or from the position where it was previously paused
- **FR2:** Pause playback maintaining current position - when clicking Pause, playback stops and the position is maintained for later resumption
- **FR3:** Resume playback from paused position - when clicking Play after pausing, the song continues from the exact position where it stopped
- **FR10:** Display elapsed playback time - the elapsed time since the start of the current song is shown in MM:SS format, updating in real-time
- **FR11:** Display total song duration - the total duration of the current song is shown in MM:SS format
- **FR12:** Visual progress bar updated in real-time - a progress bar visually reflects the percentage of playback completed, updating continuously during playback
- **FR13:** Progress bar interaction for manual seeking - when clicking any point on the progress bar, playback jumps to that specific position

**Relevant Non-Functional Requirements:**
- **NFR4:** Use of React hooks and reusable functions - custom hooks (useAudioPlayer) encapsulate playback logic and are reused throughout the application
- **NFR5:** Static typing with TypeScript in all components
- **NFR8:** Immediate response to user interactions - playback controls respond in less than 100ms
- **NFR9:** Proper error handling without application blocking - audio errors are handled gracefully
- **NFR12:** Clear user feedback about playback issues - error messages displayed for playback failures
- **NFR13:** Prevention of blocks from missing or corrupt files - invalid audio files handled without interrupting experience

## 2. Class Diagram (Relevant Section)

```typescript
class useAudioPlayer {
    <<hook>>
    -audioRef: RefObject<HTMLAudioElement>
    -isPlaying: boolean
    -currentTime: number
    -duration: number
    -error: string | null
    
    +useAudioPlayer(audioRef: RefObject): AudioPlayerHook
    +play(): Promise<void>
    +pause(): void
    +seek(time: number): void
    +setSource(url: string): void
    -handleTimeUpdate(): void
    -handleLoadedMetadata(): void
    -handleEnded(): void
    -handleError(error: Error): void
}

class AudioPlayerHook {
    <<interface>>
    +isPlaying: boolean
    +currentTime: number
    +duration: number
    +error: string | null
    +play: Function
    +pause: Function
    +seek: Function
    +setSource: Function
}

class PlaybackError {
    <<interface>>
    +type: ErrorType
    +message: string
    +songId: string
}
```

**Relationships:**
- Used by: `Player` component (controls audio playback)
- Uses: `ErrorHandler` utility (converts errors to PlaybackError)
- Uses: `PlaybackError` type (from types/playback-error.ts)
- Interacts with: HTML5 Audio API (via audioRef)

## 3. Use Case Diagram (Relevant Use Cases)

- **Play Song:** User clicks play → System starts audio playback → Updates UI state
- **Pause Playback:** User clicks pause → System pauses audio → Maintains position
- **Seek to Position:** User clicks progress bar → System jumps to time → Continues playback
- **Handle Playback Error:** Audio fails → System catches error → Displays message → Continues functioning
- **Update Progress:** Audio plays → System updates currentTime → UI reflects progress

---

# SPECIFIC TASK

Implement the custom React hook: **`src/hooks/useAudioPlayer.ts`**

## Responsibilities:

1. **Control audio playback** (play, pause, seek) via HTML5 Audio API
2. **Track playback state** (isPlaying, currentTime, duration)
3. **Handle audio events** (timeupdate, loadedmetadata, ended, error)
4. **Manage audio source** (load new songs)
5. **Handle errors gracefully** (network failures, decode errors, unsupported formats)
6. **Provide real-time updates** for progress bar and time display
7. **Ensure type safety** with TypeScript

## Hook Signature and Return Type:

### **useAudioPlayer(audioRef: RefObject\<HTMLAudioElement\>): AudioPlayerHook**

A custom React hook that manages HTML5 audio playback.

- **Description:** Encapsulates all audio playback logic, event handling, and state management for the music player
- **Parameters:**
  - `audioRef` (RefObject<HTMLAudioElement>): React ref to the HTML audio element
- **Returns:** 
  - `AudioPlayerHook`: Object containing playback state and control methods
    ```typescript
    {
      isPlaying: boolean,
      currentTime: number,
      duration: number,
      error: string | null,
      play: () => Promise<void>,
      pause: () => void,
      seek: (time: number) => void,
      setSource: (url: string) => void
    }
    ```
- **Examples:**
  ```typescript
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioPlayer = useAudioPlayer(audioRef);
  
  // Play audio
  await audioPlayer.play();
  
  // Pause
  audioPlayer.pause();
  
  // Seek to 30 seconds
  audioPlayer.seek(30);
  
  // Load new song
  audioPlayer.setSource('/songs/new-song.mp3');
  
  // Check state
  if (audioPlayer.isPlaying) {
    console.log(`Playing at ${audioPlayer.currentTime}s of ${audioPlayer.duration}s`);
  }
  ```

---

## State Variables to Manage:

### 1. **isPlaying: boolean**
- Current playback state
- `true` when audio is playing
- `false` when paused or stopped
- Default: `false`

### 2. **currentTime: number**
- Current playback position in seconds
- Updates in real-time during playback
- Range: 0 to duration
- Default: `0`

### 3. **duration: number**
- Total duration of current song in seconds
- Set when audio metadata loads
- Default: `0`

### 4. **error: string | null**
- User-friendly error message if playback fails
- `null` when no error
- Set by error handler
- Default: `null`

---

## Methods to Implement:

### 1. **play(): Promise\<void\>** (async)

Starts or resumes audio playback.

- **Description:** Calls the HTML5 Audio play() method and updates state
- **Returns:** 
  - `Promise<void>`: Resolves when playback starts, rejects on error
- **Side effects:**
  - Calls `audioRef.current?.play()`
  - Sets `isPlaying` to `true`
  - Clears any previous error
- **Preconditions:**
  - audioRef.current must exist
  - Audio source must be set
- **Postconditions:** 
  - Audio is playing
  - isPlaying is true
  - error is null (unless play fails)
- **Error handling:**
  - Catch play() rejection (user interaction required, autoplay policy)
  - Set error message
  - Keep isPlaying false
- **Implementation considerations:**
  ```typescript
  const play = async (): Promise<void> => {
    if (!audioRef.current) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      console.error('Play failed:', err);
      setIsPlaying(false);
      setError('Unable to play audio. Please try again.');
    }
  };
  ```

### 2. **pause(): void**

Pauses audio playback.

- **Description:** Calls the HTML5 Audio pause() method and updates state
- **Returns:** void
- **Side effects:**
  - Calls `audioRef.current?.pause()`
  - Sets `isPlaying` to `false`
  - Maintains current position (currentTime unchanged)
- **Preconditions:**
  - audioRef.current must exist
- **Postconditions:** 
  - Audio is paused
  - isPlaying is false
  - currentTime preserved for resumption
- **Error handling:**
  - pause() doesn't throw, but wrap in try-catch for safety
- **Implementation considerations:**
  ```typescript
  const pause = (): void => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
  };
  ```

### 3. **seek(time: number): void**

Jumps to specific position in audio.

- **Description:** Sets the currentTime property of the audio element to seek to a specific position
- **Parameters:**
  - `time` (number): Time in seconds to seek to
- **Returns:** void
- **Side effects:**
  - Sets `audioRef.current.currentTime` to time
  - Triggers timeupdate event
  - Updates currentTime state via event handler
- **Preconditions:**
  - audioRef.current must exist
  - time should be between 0 and duration
- **Postconditions:** 
  - Audio position changed to specified time
  - currentTime state updated
  - Playback continues if was playing
- **Edge cases:**
  - time < 0 → clamp to 0
  - time > duration → clamp to duration
  - NaN or invalid → ignore
- **Implementation considerations:**
  ```typescript
  const seek = (time: number): void => {
    if (!audioRef.current) return;
    
    const clampedTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
    audioRef.current.currentTime = clampedTime;
  };
  ```

### 4. **setSource(url: string): void**

Loads a new audio file.

- **Description:** Sets the src attribute of the audio element to load a new song
- **Parameters:**
  - `url` (string): URL or path to audio file
- **Returns:** void
- **Side effects:**
  - Sets `audioRef.current.src` to url
  - Resets currentTime to 0
  - Resets duration to 0
  - Sets isPlaying to false
  - Clears error
  - Triggers loadstart, loadedmetadata events
- **Preconditions:**
  - audioRef.current must exist
  - url should be valid (validated elsewhere)
- **Postconditions:** 
  - New audio source loaded
  - Playback state reset
  - Ready to play new song
- **Error handling:**
  - Invalid URL will trigger error event (handled by handleError)
- **Implementation considerations:**
  ```typescript
  const setSource = (url: string): void => {
    if (!audioRef.current) return;
    
    audioRef.current.src = url;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
  };
  ```

---

## Event Handlers (Internal):

### 5. **handleTimeUpdate(): void**

Updates currentTime state as audio plays.

- **Description:** Event handler for 'timeupdate' event, updates currentTime state for real-time progress
- **Triggered by:** Audio element fires 'timeupdate' every ~250ms during playback
- **Side effects:**
  - Reads `audioRef.current.currentTime`
  - Updates currentTime state
- **Implementation:**
  ```typescript
  const handleTimeUpdate = (): void => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };
  ```

### 6. **handleLoadedMetadata(): void**

Sets duration when audio metadata loads.

- **Description:** Event handler for 'loadedmetadata' event, extracts and stores song duration
- **Triggered by:** After audio source loads and metadata is available
- **Side effects:**
  - Reads `audioRef.current.duration`
  - Updates duration state
- **Implementation:**
  ```typescript
  const handleLoadedMetadata = (): void => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };
  ```

### 7. **handleEnded(): void**

Handles when song finishes playing.

- **Description:** Event handler for 'ended' event, resets playback state when song completes
- **Triggered by:** When audio reaches the end
- **Side effects:**
  - Sets isPlaying to false
  - Can trigger auto-next (caller's responsibility)
- **Implementation:**
  ```typescript
  const handleEnded = (): void => {
    setIsPlaying(false);
    // Note: Auto-play next song is handled by Player component
  };
  ```

### 8. **handleError(event: Event): void**

Handles audio playback errors.

- **Description:** Event handler for 'error' event, converts audio errors to user-friendly messages
- **Triggered by:** Audio loading or playback failures
- **Parameters:**
  - `event` (Event): Error event from audio element
- **Side effects:**
  - Extracts error from audio element
  - Uses ErrorHandler utility to create PlaybackError
  - Sets error state with user message
  - Sets isPlaying to false
- **Error types to handle:**
  - MEDIA_ERR_ABORTED (1): Load aborted
  - MEDIA_ERR_NETWORK (2): Network error
  - MEDIA_ERR_DECODE (3): Decode error
  - MEDIA_ERR_SRC_NOT_SUPPORTED (4): Unsupported format
- **Implementation:**
  ```typescript
  const handleError = (): void => {
    if (!audioRef.current?.error) return;
    
    const mediaError = audioRef.current.error;
    const playbackError = ErrorHandler.handlePlaybackError(
      new Error(mediaError.message),
      'current-song-id' // Should be passed from caller
    );
    
    setError(playbackError.message);
    setIsPlaying(false);
  };
  ```

---

## Effect Hooks Setup:

### **useEffect for Event Listeners**

Set up and clean up audio event listeners.

```typescript
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  
  // Add event listeners
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('ended', handleEnded);
  audio.addEventListener('error', handleError);
  
  // Cleanup function
  return () => {
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);
  };
}, [audioRef]); // Re-run if audioRef changes (shouldn't happen but safe)
```

---

## Dependencies:

- **React imports:**
  ```typescript
  import {useState, useEffect, RefObject} from 'react';
  ```
- **Type imports:**
  ```typescript
  import {PlaybackError} from '@types/playback-error';
  ```
- **Utility imports:**
  ```typescript
  import {ErrorHandler} from '@utils/error-handler';
  ```
- **Browser APIs:** HTML5 Audio API (via audioRef)

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 8 per function
- **Maximum method length:** 40 lines per function
- **React version:** React 18+ (uses modern hooks)
- **Async handling:** play() must return Promise for proper async control

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Hook only manages audio playback
  - **Dependency Inversion:** Depends on audioRef abstraction
- **Input parameter validation:**
  - Check audioRef.current exists before operations
  - Validate seek time is within bounds
  - Handle null/undefined gracefully
- **Robust exception handling:**
  - Catch play() promise rejection
  - Handle audio errors without crashing
  - Provide user-friendly error messages
  - Never throw from hook
- **Logging at critical points:**
  - Log errors in development mode
  - Log playback state changes for debugging
- **Comments for complex logic:**
  - Explain event listener setup/cleanup
  - Document error handling strategy
  - Clarify async play() behavior

## React Hook Rules:

- **Rules of Hooks:**
  - Must be called at top level
  - Only call from React components or custom hooks
- **Effect cleanup:**
  - Always remove event listeners in cleanup function
  - Prevent memory leaks
- **State updates:**
  - Use functional updates if depending on previous state
  - Batch updates when possible
- **Performance:**
  - Minimize re-renders
  - Consider useCallback for event handlers if passed as dependencies

## Audio API Considerations:

- **Autoplay policy:** Modern browsers restrict autoplay, handle play() rejection
- **CORS:** Audio files must be served with proper CORS headers for cross-origin
- **Browser support:** HTML5 Audio API supported in all modern browsers
- **Format support:** MP3 universally supported, others vary by browser

## Documentation:

- **JSDoc on hook function:**
  - `@param` for audioRef
  - `@returns` with AudioPlayerHook structure
  - `@example` showing complete usage
- **JSDoc on returned methods:**
  - Document each method with params, returns, examples
  - Note async behavior of play()
- **Inline comments:**
  - Explain event listener lifecycle
  - Document error handling approach
  - Note browser compatibility considerations

## Security:

- **XSS protection:** Audio URLs should be validated before use
- **Resource loading:** Only load trusted audio sources
- **Error information:** Don't expose sensitive info in error messages

---

# DELIVERABLES

## 1. Complete source code of `src/hooks/useAudioPlayer.ts` with:

- Organized imports
- TypeScript interface for AudioPlayerHook return type
- Hook function implementation
- State management (isPlaying, currentTime, duration, error)
- All control methods (play, pause, seek, setSource)
- All event handlers (handleTimeUpdate, handleLoadedMetadata, handleEnded, handleError)
- useEffect for event listener setup/cleanup
- Complete JSDoc documentation
- Inline comments for complex logic

## 2. Inline documentation:

- Explanation of HTML5 Audio API interaction
- Notes on event listener lifecycle
- Documentation of error handling strategy
- Browser autoplay policy considerations
- State synchronization approach

## 3. Type definitions:

```typescript
/**
 * Return type of useAudioPlayer hook
 */
interface AudioPlayerHook {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setSource: (url: string) => void;
}
```

## 4. Edge cases considered:

- **audioRef.current is null:**
  - All methods check existence before operation
  - Fail gracefully without errors
- **play() rejection:**
  - Catch promise rejection
  - Set error message
  - Keep isPlaying false
- **Invalid seek time:**
  - Clamp to valid range (0 to duration)
  - Ignore NaN or invalid values
- **Audio file not found (404):**
  - Trigger error event
  - Display user-friendly message
  - Allow continuing with other songs
- **Corrupt audio file:**
  - Decode error triggers error handler
  - User notified
  - App continues functioning
- **Network failure during playback:**
  - Network error caught
  - User notified
  - Can retry or skip
- **Duration is Infinity or NaN:**
  - Handle as 0 or skip song
- **Rapid play/pause clicks:**
  - State updates correctly
  - No race conditions
- **Seek while loading:**
  - Wait for metadata before seeking
  - Queue seek operation if needed

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Error handling strategy - where to handle errors]
- [Decision 2: Auto-play next song - in hook or component]
- [Decision 3: How to handle play() promise rejection]
- [Decision 4: Event listener cleanup approach]
- [Decision 5: State update batching strategy]
- [Decision 6: Whether to use useCallback for handlers]
- [Decision 7: How to pass songId to error handler]

**Audio API interaction strategy:**
- [Explain approach to HTML5 Audio API]
- [Document event handling lifecycle]
- [Describe state synchronization with audio element]

**Error handling approach:**
- [Document how errors are detected and converted]
- [Explain user notification strategy]
- [Describe recovery mechanisms]

**Possible future improvements:**
- [Improvement 1: Preloading next song for gapless playback]
- [Improvement 2: Playback rate control (speed adjustment)]
- [Improvement 3: Volume control with fade in/out]
- [Improvement 4: Audio equalization support]
- [Improvement 5: Crossfade between songs]
- [Improvement 6: Buffer progress indication]
- [Improvement 7: Audio visualization data (Web Audio API)]
- [Improvement 8: Retry logic for network errors]
- [Improvement 9: Offline playback with service worker]
- [Improvement 10: Media session API integration (OS controls)]

---

**REMINDER:** This is a **React custom hook** that interfaces with the HTML5 Audio API. Focus on robust error handling, clean event management, proper cleanup, and providing a simple, reliable API for audio playback control. The hook is critical for the app's core functionality.
