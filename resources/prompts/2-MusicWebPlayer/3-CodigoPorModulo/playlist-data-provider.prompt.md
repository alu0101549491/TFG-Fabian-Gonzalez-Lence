Perfect! Let's move to **Module #7: `src/data/playlist-data-provider.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Data Layer - Playlist Data Provider

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
│   │   ├── useAudioPlayer.ts
│   │   ├── usePlaylist.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── time-formatter.ts          ← COMPLETED
│   │   ├── error-handler.ts           ← COMPLETED
│   │   └── audio-validator.ts         ← COMPLETED
│   ├── data/
│   │   └── playlist-data-provider.ts  ← CURRENT MODULE
│   └── styles/
│       └── main.css
├── public/
│   └── songs/
│       ├── sample-song-1.mp3
│       ├── sample-song-2.mp3
│       └── sample-song-3.mp3
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR14:** Display complete list of songs in playlist
- **FR17:** Persistent playlist storage - the playlist is saved in localStorage or JSON file to persist between browser sessions
- **FR19:** Initial dataset with minimum 5 example songs - the application includes at least 5 pre-loaded songs when starting for the first time

**Relevant Non-Functional Requirements:**
- **NFR5:** Static typing with TypeScript in all components
- **NFR11:** Standardized song data structure - each song must contain: `title` (string), `artist` (string), `cover` (string URL), `url` (string URL)

**Data Requirements (from Section 9):**

### Example Initial Data Structure:
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

**Initial Playlist Requirements:**
- Minimum 5 songs pre-loaded
- Songs should use sample audio files from `/public/songs/` directory
- Cover images can be placeholders or public domain images
- Songs should be diverse (different titles/artists)
- Data should be valid and complete (all required fields)

## 2. Class Diagram (Relevant Section)

```typescript
class PlaylistDataProvider {
    -initialPlaylist: Song[]
    
    +loadInitialPlaylist(): Song[]
    +getDefaultPlaylist(): Song[]
    -fetchFromJSON(): Promise<Song[]>
}

class Song {
    <<interface>>
    +id: string
    +title: string
    +artist: string
    +cover: string
    +url: string
}
```

**Relationships:**
- Used by: `usePlaylist` hook (loads initial data on first app launch)
- Used by: `Player` component (initializes playlist)
- Uses: `Song` interface (from types/song.ts)

## 3. Use Case Diagram (Relevant Use Cases)

- **Load Playlist:** System loads initial playlist data on app start
- **View Playlist:** User sees pre-loaded songs when opening app for first time
- **Manage Playlist:** User can modify playlist after initial load

---

# SPECIFIC TASK

Implement the data provider class: **`src/data/playlist-data-provider.ts`**

## Responsibilities:

1. **Provide initial playlist data** with minimum 5 example songs
2. **Load default songs** for first-time users
3. **Support future JSON-based data loading** (optional async method)
4. **Ensure data integrity** - all songs have complete, valid data
5. **Provide easy data access** through static methods

## Methods to implement:

### 1. **loadInitialPlaylist(): Song[]** (static/public)

Returns the initial playlist data for the application.

- **Description:** Loads and returns the default playlist that should be used when the app starts for the first time (before user has saved any playlist to localStorage)
- **Parameters:** None
- **Returns:** 
  - `Song[]`: Array of at least 5 Song objects with complete data
- **Examples:**
  ```typescript
  const playlist = PlaylistDataProvider.loadInitialPlaylist();
  // Returns: [song1, song2, song3, song4, song5, ...]
  ```
- **Preconditions:** None
- **Postconditions:** 
  - Returns valid array of Song objects
  - Array contains at least 5 songs
  - All songs have complete required fields
  - Never returns null or empty array
  - All audio URLs point to existing files in `/public/songs/`
- **Implementation considerations:**
  - Currently returns result from `getDefaultPlaylist()`
  - In future, could attempt to load from JSON file and fallback to default
  - Could implement caching if needed
  - Method should be synchronous for initial implementation

### 2. **getDefaultPlaylist(): Song[]** (static/public)

Returns a hardcoded default playlist with example songs.

- **Description:** Provides a fallback playlist with at least 5 example songs that use audio files from the public directory
- **Parameters:** None
- **Returns:** 
  - `Song[]`: Array of Song objects with hardcoded example data
- **Song Data Requirements:**
  - **Song 1:**
    - id: "1"
    - title: Creative song title (e.g., "Sunset Dreams")
    - artist: Artist name (e.g., "The Wanderers")
    - cover: "/covers/default-cover.jpg" or placeholder URL
    - url: "/songs/sample-song-1.mp3"
  - **Song 2:**
    - id: "2"
    - title: Different creative title
    - artist: Different artist name
    - cover: Cover image URL
    - url: "/songs/sample-song-2.mp3"
  - **Songs 3-5 (minimum):**
    - Follow same pattern
    - Use `/songs/sample-song-3.mp3`, etc.
    - Ensure variety in titles and artists
- **Examples:**
  ```typescript
  const defaultSongs = PlaylistDataProvider.getDefaultPlaylist();
  // Returns: Array of 5+ songs with complete data
  ```
- **Preconditions:** None
- **Postconditions:** 
  - Always returns same array (deterministic)
  - All songs have unique IDs
  - All required fields are non-empty
  - Audio URLs use relative paths to `/public/songs/`
  - Never returns null or undefined
- **Data quality requirements:**
  - Unique IDs (sequential: "1", "2", "3", "4", "5" or UUIDs)
  - Realistic titles and artist names
  - Valid URL formats
  - Consistent data structure

**Implementation considerations:**
- Hardcode array of Song objects
- Use descriptive, creative song/artist names (not "Song 1", "Artist 1")
- Consider using music genre diversity (rock, jazz, electronic, classical, pop)
- All URLs should be relative paths starting with `/`
- Cover images can all use same placeholder initially
- Could expand to 7-10 songs for better initial experience

### 3. **fetchFromJSON(): Promise<Song[]>** (static/private)

Fetches playlist data from a JSON file (future enhancement, optional for now).

- **Description:** Asynchronously loads playlist data from a JSON file, useful for loading external playlists or configuration-based data
- **Parameters:** None (could accept file path in future)
- **Returns:** 
  - `Promise<Song[]>`: Promise resolving to array of Song objects
- **Examples:**
  ```typescript
  const playlist = await PlaylistDataProvider.fetchFromJSON();
  // Returns: Songs loaded from JSON file
  ```
- **Preconditions:** 
  - JSON file should exist (handle 404)
  - JSON should have valid structure
- **Postconditions:** 
  - Returns array of Song objects on success
  - Returns empty array on failure
  - Never throws unhandled exceptions
- **Error handling:**
  - Network errors → return empty array or log error
  - Invalid JSON → return empty array
  - Missing file → return empty array
  - Validation failures → filter out invalid songs
- **Implementation considerations:**
  - Mark as `private` since not currently used
  - Could use `fetch()` API to load JSON
  - Should validate loaded data against Song interface
  - Could use AudioValidator to validate songs
  - For now, can be a stub that returns empty array or throws "Not implemented"

**Note:** For initial implementation, this method can be a simple stub or return empty array, as it's not required by current requirements but provides extensibility.

---

## Class Structure Considerations:

**Option 1: Static Class (Recommended)**
```typescript
export class PlaylistDataProvider {
  public static loadInitialPlaylist(): Song[] { ... }
  public static getDefaultPlaylist(): Song[] { ... }
  private static async fetchFromJSON(): Promise<Song[]> { ... }
}
```

**Option 2: Exported Functions (Alternative)**
```typescript
export function loadInitialPlaylist(): Song[] { ... }
export function getDefaultPlaylist(): Song[] { ... }
```

**Recommendation:** Use static class approach to match class diagram and allow for future state if needed.

---

## Dependencies:

- **Type imports:** 
  - `Song` from `@types/song`
- **Optional imports:**
  - `AudioValidator` from `@utils/audio-validator` (if validating loaded data)
- **Classes it must use:** None required
- **Interfaces it implements:** None
- **External services it consumes:** None currently (fetch API in future for JSON loading)

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 5 per method (methods should be simple)
- **Maximum method length:** 40 lines per method
- **Static methods:** Use static class methods (no instance needed)
- **Data quality:** All hardcoded data must be complete and valid

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Class only provides data, doesn't manage state
  - **Open/Closed:** Easy to extend with new data sources
  - **Dependency Inversion:** Returns abstract Song interface, not concrete implementation
- **Input parameter validation:** Not applicable (no parameters in current methods)
- **Robust exception handling:**
  - Never return null or undefined
  - Always return valid array (empty if necessary)
  - Handle async errors gracefully in fetchFromJSON
- **No logging needed:** Simple data provider
- **Comments for data:**
  - Document song data structure
  - Explain why certain songs were chosen
  - Note requirements for audio files

## Documentation:

- **JSDoc on all public methods:**
  - `@returns` with type and description
  - `@example` showing usage
  - `@static` tag for static methods
- **Class-level JSDoc:**
  - Describe purpose of PlaylistDataProvider
  - Document data source strategy
  - Note extensibility points
- **Inline comments:**
  - Document song data requirements
  - Note audio file locations
  - Explain future enhancement plans

## Security:

- **Data validation:** Ensure all hardcoded data is safe
- **No user input:** This class doesn't process user input
- **URL safety:** Use relative paths for local resources

---

# DELIVERABLES

## 1. Complete source code of `src/data/playlist-data-provider.ts` with:

- Organized imports:
  ```typescript
  import {Song} from '@types/song';
  ```
- Class definition with static methods
- Complete default playlist data (minimum 5 songs):
  - Creative, realistic song titles
  - Diverse artist names
  - Valid cover URLs (can be placeholders)
  - Valid audio URLs pointing to `/public/songs/`
- Fully implemented methods:
  - `loadInitialPlaylist(): Song[]`
  - `getDefaultPlaylist(): Song[]`
  - `fetchFromJSON(): Promise<Song[]>` (stub or basic implementation)
- Complete JSDoc documentation on class and all methods
- Inline comments for data structure

## 2. Inline documentation:

- Explanation of data structure
- Notes on why minimum 5 songs required
- Documentation of audio file locations
- TODOs for JSON loading implementation
- Comments on potential data sources

## 3. New dependencies:

- **Type imports:**
  - `Song` from `src/types/song.ts`
- **No external libraries needed** for basic implementation

## 4. Example data provided:

Minimum 5 songs with:
- Unique IDs
- Creative titles (not generic "Song 1")
- Realistic artist names
- Valid URLs for covers and audio
- Diverse genres/styles (optional but nice)

**Example data quality:**
```typescript
{
  id: "1",
  title: "Midnight Serenade",
  artist: "Luna Eclipse",
  cover: "/covers/default-cover.jpg",
  url: "/songs/sample-song-1.mp3"
}
```

Not:
```typescript
{
  id: "1",
  title: "Song 1",
  artist: "Artist 1",
  cover: "/cover1.jpg",
  url: "/song1.mp3"
}
```

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Static class vs exported functions - which and why]
- [Decision 2: Hardcoded data vs JSON file for initial load]
- [Decision 3: Number of initial songs (5 minimum, actual number chosen)]
- [Decision 4: Song title/artist naming strategy (creative vs generic)]
- [Decision 5: Cover image strategy (placeholders vs real images)]
- [Decision 6: Audio file naming and location]
- [Decision 7: fetchFromJSON implementation level (stub vs full)]

**Data strategy:**
- [Explain approach to providing initial data]
- [Document why hardcoded data is used initially]
- [Describe plan for future data sources (JSON, API, etc.)]
- [Note data validation strategy]

**Possible future improvements:**
- [Improvement 1: Load playlist from external JSON file in public directory]
- [Improvement 2: Fetch playlists from remote API]
- [Improvement 3: Support multiple preset playlists (rock, jazz, classical)]
- [Improvement 4: Load playlist from URL parameter]
- [Improvement 5: Import playlists from external services (Spotify, etc.)]
- [Improvement 6: Validate loaded data using AudioValidator]
- [Improvement 7: Cache loaded playlists in memory]
- [Improvement 8: Support for playlist metadata (name, description, genre)]
- [Improvement 9: Randomize initial playlist order]
- [Improvement 10: Support for user-created playlist templates]

---

**REMINDER:** This is a **data provider class** - focus on providing clean, valid, well-structured data. The hardcoded playlist should have realistic, creative song/artist names and should demonstrate the full capability of the application with diverse content.
