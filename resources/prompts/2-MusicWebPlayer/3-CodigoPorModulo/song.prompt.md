# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Type Definitions Layer - Core Data Models

---

# PROJECT FILE STRUCTURE REMINDER

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← CURRENT MODULE
│   │   ├── playback-error.ts
│   │   └── validation.ts
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
│   │   ├── time-formatter.ts
│   │   ├── error-handler.ts
│   │   └── audio-validator.ts
│   ├── data/
│   │   └── playlist-data-provider.ts
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR7:** Display current song title
- **FR8:** Display current song artist
- **FR9:** Display current song cover
- **FR14:** Display complete list of songs in playlist
- **FR15:** Add songs to local playlist (requires: title, artist, cover URL, audio URL)
- **FR16:** Remove songs from playlist
- **FR19:** Initial dataset with minimum 5 example songs

**Relevant Non-Functional Requirements:**
- **NFR5:** Static typing with TypeScript in all components - all variables have explicit TypeScript types without using `any`
- **NFR11:** Standardized song data structure - each song must contain: `title` (string), `artist` (string), `cover` (string URL), `url` (string URL)

## 2. Class Diagram (Relevant Section)

```typescript
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
- Used by: `usePlaylist` hook
- Used by: `PlaylistDataProvider` class
- Used by: `Player` component
- Used by: `TrackInfo` component
- Used by: `Playlist` component
- Used by: `AddSongForm` component
- Used by: `AudioValidator` utility

## 3. Use Case Diagram (Relevant Use Cases)

- **View Song Information:** Display title, artist, cover art
- **Add Song to Playlist:** User provides song data (title, artist, cover URL, audio URL)
- **Remove Song from Playlist:** Identify song by unique ID
- **View Playlist:** Display list of all songs with their information

---

# SPECIFIC TASK

Implement the TypeScript type definition file: **`src/types/song.ts`**

## Responsibilities:

1. **Define the Song interface** with all required properties according to NFR11
2. **Ensure type safety** for all song-related data throughout the application
3. **Provide clear documentation** for each property using JSDoc comments
4. **Export the Song type** for use across the application
5. **Ensure immutability** by using readonly properties where appropriate (optional but recommended)

## Properties to define:

### 1. **id: string**
   - Description: Unique identifier for the song (UUID v4 format recommended)
   - Purpose: Used for React keys, playlist management, deletion operations
   - Constraints: Must be unique across all songs in the playlist
   - Format: String (e.g., "550e8400-e29b-41d4-a716-446655440000" or simple "1", "2", "3")
   
### 2. **title: string**
   - Description: The name/title of the song
   - Purpose: Displayed in UI (TrackInfo, Playlist)
   - Constraints: Non-empty string, max length 200 characters (recommended)
   - Example: "Bohemian Rhapsody", "Hotel California"

### 3. **artist: string**
   - Description: The artist or band name who performed the song
   - Purpose: Displayed in UI alongside title
   - Constraints: Non-empty string, max length 100 characters (recommended)
   - Example: "Queen", "The Eagles"

### 4. **cover: string**
   - Description: URL to the album/song cover art image
   - Purpose: Displayed as album artwork in TrackInfo component
   - Constraints: Valid URL (HTTP/HTTPS), should point to image file (JPG, PNG, WebP)
   - Format: Absolute URL or relative path
   - Example: "https://example.com/covers/song-cover.jpg" or "/covers/default-cover.jpg"
   - Fallback: Application should handle broken/missing images with placeholder

### 5. **url: string**
   - Description: URL to the audio file (MP3, WAV, OGG, M4A)
   - Purpose: Source for HTML5 Audio element playback
   - Constraints: Valid URL (HTTP/HTTPS or relative path), must point to supported audio format
   - Format: Absolute URL or relative path
   - Example: "https://example.com/audio/song.mp3" or "/songs/sample-song-1.mp3"
   - Note: Must be accessible and not blocked by CORS

## Additional considerations:

- **Optional properties:** Consider if any additional optional metadata should be included:
  - `duration?: number` - Song duration in seconds (can be extracted from audio metadata)
  - `album?: string` - Album name
  - `year?: number` - Release year
  - `genre?: string` - Music genre
  - (For now, keep it minimal per requirements - only include if explicitly beneficial)

- **Type vs Interface:** Choose between `type` and `interface` based on TypeScript best practices
  - Recommendation: Use `interface` for object shapes that might be extended in the future

- **Readonly properties:** Consider making properties readonly to prevent accidental mutations
  - Example: `readonly id: string`

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **File location:** `src/types/song.ts`
- **Naming convention:** PascalCase for interface name (`Song`), camelCase for properties
- **No runtime code:** This file should contain only type definitions, no implementations or logic
- **Strict typing:** No `any` types allowed (per NFR5)

## Mandatory best practices:

- **Complete JSDoc documentation** on the interface and each property
- **Use appropriate TypeScript keywords:** `interface`, `type`, `readonly` as needed
- **Export properly:** Use named export for the Song interface
- **Consider extensibility:** Design interface to be easily extended if future requirements change
- **Semantic naming:** Property names should be self-explanatory

## Documentation requirements:

- **Interface-level JSDoc:** Describe what a Song represents and its purpose
- **Property-level JSDoc:** Document each property with:
  - `@property` tag
  - Description of what it represents
  - Example value (using `@example` tag)
  - Any constraints or format requirements

## TypeScript-specific:

- Enable strict null checks compatibility
- Ensure compatibility with TypeScript strict mode
- Use string literal types if specific values are allowed (not applicable here, but keep in mind)

---

# DELIVERABLES

## 1. Complete source code of `src/types/song.ts` with:

- Proper file header comment with module description
- Import statements (if any - likely none for this file)
- Complete JSDoc documentation for the interface
- JSDoc documentation for each property
- Properly exported Song interface
- Clean, readable code following Google TypeScript Style Guide

## 2. Inline documentation:

- JSDoc comments explaining the purpose of the Song interface
- Examples of valid Song objects in documentation
- Notes about any design decisions (e.g., why certain optional properties were excluded)

## 3. Type considerations documented:

- Explain choice of `interface` vs `type`
- Justify inclusion/exclusion of optional properties
- Note any future extensibility considerations

## 4. Usage examples (in comments):

- Example of creating a Song object
- Example of using Song type in function parameters
- Example of Song array (playlist)

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here with:
// - File header comment
// - JSDoc documentation
// - Interface definition
// - Export statement
```

**Design decisions made:**
- [Decision 1: Choice between interface vs type alias and justification]
- [Decision 2: Readonly properties or mutable - and why]
- [Decision 3: Inclusion/exclusion of optional metadata properties]
- [Decision 4: String types vs string literal unions for certain fields]
- [Any other relevant design decisions]

**Type safety considerations:**
- [How this type ensures type safety across the application]
- [What compile-time errors it prevents]
- [How it integrates with other types in the system]

**Possible future improvements:**
- [Improvement 1: Additional optional metadata properties if needed]
- [Improvement 2: Union types for different song sources (local/streaming)]
- [Improvement 3: Discriminated unions if different song types emerge]
- [Improvement 4: Utility types derived from Song (e.g., SongPreview with subset of properties)]

---

**REMINDER:** This is a **type definition file only** - no runtime code, no implementations, only TypeScript type definitions with excellent and simple documentation.
