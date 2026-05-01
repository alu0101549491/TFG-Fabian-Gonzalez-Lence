## 1. **Introduction**

The objective of this project is to develop an **interactive music player web application** using **React**, **TypeScript**, and **Vite**. The application will allow users to play songs, manage local playlists, control playback through an intuitive interface, and view complete information for each track (title, artist, cover).

Best development practices will be integrated with **modular React components**, **custom hooks**, **unit testing with Jest**, efficient state management, and responsive design for an optimal user experience across multiple devices.

---

## 2. **Scope**

The application will allow:

- Playing, pausing, and resuming songs while maintaining the current position.
- Navigating between songs using Next and Previous controls.
- Viewing complete information for each song: title, artist, and cover.
- Displaying visual progress bar with elapsed time and total duration.
- Interacting with the progress bar to skip to specific positions.
- Managing local playlist: adding and removing songs.
- Storing playlist persistently using localStorage or JSON.
- Automatically updating the interface when changing songs or modifying the playlist.
- Functioning responsively in modern browsers (Chrome, Firefox, Edge) on desktop and mobile.

Does not include:

- Integration with online streaming services (Spotify, Apple Music, etc.).
- Song search functionality in external services.
- User system or personalized profiles.
- Real-time multi-device synchronization.
- Equalizer or advanced audio effects.

---

## 3. **Definitions and Abbreviations**

- **React:** JavaScript library for building component-based user interfaces.
- **TypeScript:** JavaScript superset that adds static typing.
- **Vite:** Fast build tool for modern web applications.
- **Playlist:** List of songs available for playback.
- **Cover:** Cover image associated with a song.
- **Shuffle:** Random playback mode without repetition until completing the list.
- **Repeat:** Playback mode that repeats a song or the entire playlist.
- **localStorage:** Browser API for persistent client-side data storage.
- **Hook:** Special React function that allows using state and other features without classes.
- **Jest:** Testing framework for JavaScript/TypeScript.

---

## 4. **Functional Requirements (FR)**

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR1 | Play selected song from beginning or current position. | When clicking Play, the current song begins playing from the beginning or from the position where it was previously paused. |
| FR2 | Pause playback maintaining current position. | When clicking Pause, playback stops and the position is maintained for later resumption. |
| FR3 | Resume playback from paused position. | When clicking Play after pausing, the song continues from the exact position where it stopped. |
| FR4 | Advance to next song in playlist. | When clicking Next, the current song stops, the progress bar resets, and playback of the next song in the list begins. |
| FR5 | Go back to previous song in playlist. | When clicking Previous, the current song stops, the progress bar resets, and playback of the previous song in the list begins. |
| FR6 | Automatic information update when changing songs. | When changing songs (via Next/Previous), the following are automatically updated: title, artist, cover, and total duration. |
| FR7 | Display current song title. | The title of the playing song is clearly displayed in the interface and updates when changing tracks. |
| FR8 | Display current song artist. | The artist name of the playing song is clearly displayed and updates when changing tracks. |
| FR9 | Display current song cover. | The cover image of the playing song is prominently displayed and updates when changing tracks. |
| FR10 | Display elapsed playback time. | The elapsed time since the start of the current song is shown in MM:SS format, updating in real-time. |
| FR11 | Display total song duration. | The total duration of the current song is shown in MM:SS format. |
| FR12 | Visual progress bar updated in real-time. | A progress bar visually reflects the percentage of playback completed, updating continuously during playback. |
| FR13 | Progress bar interaction for manual seeking. | When clicking any point on the progress bar, playback jumps to that specific position. |
| FR14 | Display complete list of songs in playlist. | The interface shows all available songs in the playlist with their titles and artists. |
| FR15 | Add songs to local playlist. | The user can add new songs by providing title, artist, cover URL, and audio URL. |
| FR16 | Remove songs from playlist. | The user can delete existing songs from the playlist through a specific button or action. |
| FR17 | Persistent playlist storage. | The playlist is saved in localStorage or JSON file to persist between browser sessions. |
| FR18 | Real-time playlist update. | When adding or removing songs, the list displayed in the interface updates immediately without reloading. |
| FR19 | Initial dataset with minimum 5 example songs. | The application includes at least 5 pre-loaded songs when starting for the first time. |
| FR20 | Visual state change in Play/Pause button. | The Play button changes to Pause when playback is active and vice versa, with different icons. |

---

## 5. **Non-Functional Requirements (NFR)**

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR1 | Responsive web application functional in modern browsers. | Verified correctly in Chrome, Firefox, and Edge, both on desktop and mobile devices (minimum viewport of 320px). |
| NFR2 | Load time under 2 seconds. | The application loads completely in less than 2 seconds on standard connections (3G or higher). |
| NFR3 | Modular code with separate React components. | Code is organized into reusable components: Player, ProgressBar, Playlist, Controls, etc., each in its own file. |
| NFR4 | Use of React hooks and reusable functions. | Custom hooks are implemented for common logic (useAudioPlayer, usePlaylist) and reused throughout the application. |
| NFR5 | Static typing with TypeScript in all components. | All components, functions, and variables have explicit TypeScript types without using `any` except in justified cases. |
| NFR6 | Intuitive and accessible interface. | The UI is easy to use, with clear labels, keyboard-accessible controls, and basic screen reader compatibility. |
| NFR7 | Legible typography and contrasting colors. | Texts have a minimum size of 14px, sufficient contrast (minimum WCAG AA ratio), and clearly distinguishable colors. |
| NFR8 | Immediate response to user interactions. | User actions (play, pause, next, previous, bar click) respond in less than 100ms. |
| NFR9 | Proper error handling without application blocking. | When an audio file is unavailable or there's a loading error, a clear message is displayed and the application continues functioning. |
| NFR10 | Unit tests with Jest with minimum 80% coverage. | Tests are implemented for: play/pause, next/previous navigation, progress bar control, playlist management, and error handling. Coverage ≥80% in critical functions. |
| NFR11 | Standardized song data structure. | Each song must contain: `title` (string), `artist` (string), `cover` (string URL), `url` (string URL). |
| NFR12 | Clear user feedback about playback issues. | Understandable notifications or error messages are displayed when there are playback failures. |
| NFR13 | Prevention of blocks from missing or corrupt files. | The application detects invalid audio files and handles the error without completely interrupting the experience. |

---

## 6. **Optional Considerations**

- **Shuffle mode:** Random song playback without repeating until completing the entire playlist.
- **Repeat mode:** Option to repeat the current song or the entire playlist continuously.
- **Visual animations:** Smooth transitions in covers, progress bar animations, and hover effects on buttons.
- **Playback history:** Record of recently listened songs with timestamp.
- **Light and dark themes:** Implementation of dark/light mode with preference saved in localStorage.
- **Volume control:** Slider to adjust playback volume level.
- **Audio visualizer:** Graphical representation of waveform or frequencies in real-time.
- **Search and filtering:** Functionality to search songs within the playlist by title or artist.
- **Keyboard shortcuts:** Controls via keys (space for play/pause, arrows for next/previous).
- **Share songs:** Functionality to generate shareable links for specific songs.
- **Future integration with external APIs:** Extension to connect with online streaming services.

---

## 7. **Actor Summary**

- **User:** Interacts with the application to play music, control playback (play, pause, next, previous), navigate through the progress bar, manage the playlist (add and remove songs), and view track information.
- **System:** Manages audio playback, updates the interface in real-time, controls navigation between songs, stores the playlist persistently, handles audio file errors, and keeps all visual components synchronized with the playback state.

---

## 8. **Detailed Technical Architecture**

### 8.1 Main React Components

**Player (main container component)**

- Orchestrates all child components
- Maintains global playback state
- Manages underlying HTML `<audio>` element
- Coordinates communication between components

**Controls**

- Play/Pause buttons with icon change
- Next and Previous buttons
- Optional Shuffle and Repeat buttons
- Handles click events and propagates them to parent component

**ProgressBar**

- Progress bar visualization
- Elapsed time and total duration indicators
- Interactivity to jump to specific positions
- Real-time update during playback

**TrackInfo**

- Displays current song cover
- Displays title and artist
- Automatic update when changing tracks

**Playlist**

- List of all available songs
- Buttons to add new songs
- Buttons to delete existing songs
- Visual indicator of currently playing song
- Direct song selection functionality

### 8.2 Custom Hooks

**useAudioPlayer**

- Encapsulates audio playback logic
- Handles play, pause, next, previous
- Controls current time and duration
- Returns state and control functions

**usePlaylist**

- Manages song array
- Functions to add and remove songs
- Synchronization with localStorage
- Returns playlist and management functions

**useLocalStorage**

- Generic hook for data persistence
- Automatic synchronization between components
- localStorage error handling

### 8.3 Suggested File Structure

```
src/
├── components/
│   ├── Player/
│   │   ├── Player.tsx
│   │   └── Player.module.css
│   ├── Controls/
│   │   ├── Controls.tsx
│   │   └── Controls.module.css
│   ├── ProgressBar/
│   │   ├── ProgressBar.tsx
│   │   └── ProgressBar.module.css
│   ├── TrackInfo/
│   │   ├── TrackInfo.tsx
│   │   └── TrackInfo.module.css
│   └── Playlist/
│       ├── Playlist.tsx
│       └── Playlist.module.css
├── hooks/
│   ├── useAudioPlayer.ts
│   ├── usePlaylist.ts
│   └── useLocalStorage.ts
├── types/
│   └── index.ts
├── data/
│   └── initialPlaylist.json
├── utils/
│   ├── formatTime.ts
│   └── errorHandlers.ts
├── tests/
│   ├── useAudioPlayer.test.ts
│   ├── usePlaylist.test.ts
│   ├── Controls.test.tsx
│   └── ProgressBar.test.tsx
├── App.tsx
└── main.tsx

```

---

## 9. **Data Structure**

### 9.1 TypeScript Song Interface

```tsx
interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;  // Image URL
  url: string;    // MP3 file URL
}

```

### 9.2 Example Initial Data (JSON)

```json
[
  {
    "id": "1",
    "title": "Song Name 1",
    "artist": "Artist Name 1",
    "cover": "https://example.com/covers/cover1.jpg",
    "url": "https://example.com/audio/song1.mp3"
  },
  {
    "id": "2",
    "title": "Song Name 2",
    "artist": "Artist Name 2",
    "cover": "https://example.com/covers/cover2.jpg",
    "url": "https://example.com/audio/song2.mp3"
  }
]

```

### 9.3 Application State

```tsx
interface PlayerState {
  currentSongIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playlist: Song[];
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
}

```

---

## 10. **Typical User Flow**

1. **Initial load:**
    - User opens the application
    - System loads playlist from localStorage or initial data
    - First song in playlist is displayed with its information
2. **Start playback:**
    - User clicks Play button
    - System begins playback of current song
    - Progress bar starts real-time updating
    - Button visually changes from Play to Pause
3. **Playback control:**
    - User can pause/resume at any time
    - User can skip to next/previous song
    - User can click on progress bar to jump to specific position
4. **Information display:**
    - System automatically updates cover, title, artist when changing songs
    - System displays elapsed time and duration in MM:SS format
    - Progress bar visually reflects completed percentage
5. **Playlist management:**
    - User views complete list of songs
    - User can add new songs by providing required data
    - User can delete existing songs
    - Changes are immediately reflected in interface and saved to localStorage
6. **Error handling:**
    - If an audio file fails, system displays error message
    - Application continues functioning, user can select another song
    - Error does not block general functionality

---

## 11. **Testing Specifications**

### 11.1 Required Unit Tests (Jest)

**useAudioPlayer.test.ts:**

- Correct hook initialization with default values
- Play function starts playback correctly
- Pause function stops playback maintaining position
- Next function advances to next song and resets progress
- Previous function goes back to previous song and resets progress
- Correct currentTime update during playback
- End of song handling (auto-next or stop according to configuration)

**usePlaylist.test.ts:**

- Initial playlist load from localStorage
- Add song updates array and localStorage
- Remove song updates array and localStorage
- Does not allow adding songs with incomplete data
- Maintains synchronization with localStorage in multiple changes

**Controls.test.tsx:**

- Correct rendering of all buttons
- Click on Play/Pause executes corresponding callback
- Click on Next executes next song callback
- Click on Previous executes previous song callback
- Visual change of Play/Pause icon according to state

**ProgressBar.test.tsx:**

- Correct rendering with time values
- Correct calculation of progress percentage
- Click on bar calculates correct position
- Correct time formatting (MM:SS)

**Playlist.test.tsx:**

- Correct rendering of song list
- Click on song executes selection callback
- Delete button executes correct callback
- Add form validates data before adding

### 11.2 Minimum Coverage

- Line coverage: ≥80%
- Critical function coverage: 100% (play, pause, next, previous, add/remove songs)
- Error handling coverage: ≥90%

---

## 12. **User Interface Design**

### 12.1 Suggested Layout

**Desktop Distribution:**

```
┌────────────────────────────────────┐
│         Music Player App           │
├────────────────┬───────────────────┤
│                │                   │
│   Cover Image  │   Playlist        │
│   (Square)     │   - Song 1        │
│                │   - Song 2        │
│   Title        │   - Song 3        │
│   Artist       │   [+ Add Song]    │
│                │                   │
├────────────────┴───────────────────┤
│  [Prev] [Play/Pause] [Next]        │
│  ████████░░░░░░░░ 2:45 / 4:20      │
│        [Shuffle] [Repeat]          │
└────────────────────────────────────┘

```

**Mobile Distribution:**

```
┌──────────────────┐
│  Music Player    │
├──────────────────┤
│                  │
│  Cover Image     │
│  (Square)        │
│                  │
│  Title           │
│  Artist          │
│                  │
├──────────────────┤
│ ████████░░░░░░   │
│ 2:45 / 4:20      │
├──────────────────┤
│ [◄] [▶] [►]     │
│ [🔀] [🔁]       │
├──────────────────┤
│ Playlist:        │
│ - Song 1 [×]     │
│ - Song 2 [×]     │
│ [+ Add]          │
└──────────────────┘

```

### 12.2 Suggested Color Palette

- **Main background:** `#1a1a1a` (dark) or `#f5f5f5` (light)
- **Control elements:** `#3b82f6` (primary blue)
- **Primary text:** `#ffffff` (dark) or `#1a1a1a` (light)
- **Secondary text:** `#a0a0a0` (dark) or `#666666` (light)
- **Active progress bar:** `#3b82f6`
- **Inactive progress bar:** `#333333` (dark) or `#e0e0e0` (light)
- **Control hover:** `#60a5fa`

### 12.3 Typography

- **Font family:** Inter, Roboto or system-ui
- **Song title:** 20-24px, weight 600
- **Artist:** 16-18px, weight 400
- **Playback times:** 14px, weight 500
- **Playlist list:** 14-16px, weight 400

---

## 13. **Error Handling**

### 13.1 Types of Errors to Handle

| Error Type | Handling |
| --- | --- |
| Audio file unavailable (404) | Display message "Error loading song", allow automatic or manual skip to next song |
| Corrupt audio file | Detect decoding error, display message, allow continuing with another song |
| localStorage full | Display warning, offer to clear old data or limit playlist size |
| Invalid cover URL | Display placeholder image or generic music icon |
| Unsupported audio format | Validate format before adding, display error message with allowed formats |

### 13.2 User Feedback

- Clear and non-technical error messages
- Alternative action options always available
- Do not block interface for recoverable errors
- Error logging in console for debugging (development mode)

---

## 14. **Deliverables**

1. **Complete source code** in repository with React + TypeScript + Vite
2. **Functional application** deployed (Vercel, Netlify or GitHub Pages)
3. **Initial dataset** with minimum 5 functional example songs
4. **Documentation** in README.md with:
    - Project description
    - Installation instructions (`npm install`)
    - Execution instructions (`npm run dev`)
    - Link to live demo
    - Explained component structure
    - Testing guide (`npm run test`)
5. **Test suite** with minimum 80% coverage
6. **TypeScript configuration** strict and error-free
7. **Modular components** well-organized and reusable

---

**Final Notes:** This document establishes the foundation for developing a modern and professional web music player, following React and TypeScript best practices. The specification is detailed enough to guide the complete project development, enable generation of use case and component diagrams, and serve as a reference throughout the entire development lifecycle.