# Initial

Perfect! I've created the UML class diagram for the Music Player application.

## 📊 View Music Player UML Diagram

```mermaid
classDiagram
    %% ========================================
    %% MAIN APPLICATION COMPONENT
    %% ========================================
    
    class App {
        -audioRef: RefObject~HTMLAudioElement~
        +render(): JSX.Element
    }
    
    %% ========================================
    %% CONTAINER COMPONENT
    %% ========================================
    
    class Player {
        -audioPlayer: AudioPlayerHook
        -playlistManager: PlaylistHook
        -currentSongIndex: number
        
        +constructor()
        +render(): JSX.Element
        +handlePlayPause(): void
        +handleNext(): void
        +handlePrevious(): void
        +handleSeek(time: number): void
        +handleSongSelect(index: number): void
        -getCurrentSong(): Song | null
    }
    
    %% ========================================
    %% PRESENTATION COMPONENTS
    %% ========================================
    
    class TrackInfo {
        +props: TrackInfoProps
        +render(): JSX.Element
    }
    
    class TrackInfoProps {
        +title: string
        +artist: string
        +cover: string
    }
    
    class Controls {
        +props: ControlsProps
        +render(): JSX.Element
        -handlePlayPauseClick(): void
        -handleNextClick(): void
        -handlePreviousClick(): void
    }
    
    class ControlsProps {
        +isPlaying: boolean
        +onPlayPause: Function
        +onNext: Function
        +onPrevious: Function
        +disableNext: boolean
        +disablePrevious: boolean
    }
    
    class ProgressBar {
        +props: ProgressBarProps
        +render(): JSX.Element
        -handleProgressClick(event: MouseEvent): void
        -calculateClickPosition(event: MouseEvent): number
    }
    
    class ProgressBarProps {
        +currentTime: number
        +duration: number
        +onSeek: Function
    }
    
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
    
    class AddSongForm {
        +props: AddSongFormProps
        +state: AddSongFormState
        +render(): JSX.Element
        +handleSubmit(event: FormEvent): void
        +handleInputChange(field: string, value: string): void
        -validateForm(): boolean
        -resetForm(): void
    }
    
    class AddSongFormProps {
        +onAddSong: Function
    }
    
    class AddSongFormState {
        +title: string
        +artist: string
        +cover: string
        +url: string
    }
    
    %% ========================================
    %% CUSTOM HOOKS (Business Logic)
    %% ========================================
    
    class useAudioPlayer {
        <<hook>>
        -audioRef: RefObject~HTMLAudioElement~
        -isPlaying: boolean
        -currentTime: number
        -duration: number
        -error: string | null
        
        +useAudioPlayer(audioRef: RefObject): AudioPlayerHook
        +play(): Promise~void~
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
    
    class usePlaylist {
        <<hook>>
        -playlist: Song[]
        -currentIndex: number
        -storage: LocalStorageHook
        
        +usePlaylist(initialData: Song[]): PlaylistHook
        +addSong(song: Song): void
        +removeSong(id: string): void
        +getSongAt(index: number): Song | null
        +next(): number
        +previous(): number
        +setCurrentIndex(index: number): void
        -saveToStorage(): void
        -loadFromStorage(): Song[]
    }
    
    class PlaylistHook {
        <<interface>>
        +playlist: Song[]
        +currentIndex: number
        +addSong: Function
        +removeSong: Function
        +getSongAt: Function
        +next: Function
        +previous: Function
        +setCurrentIndex: Function
    }
    
    class useLocalStorage {
        <<hook>>
        -key: string
        -storedValue: T
        
        +useLocalStorage~T~(key: string, initialValue: T): LocalStorageHook~T~
        +setValue(value: T): void
        -readValue(): T
        -handleStorageChange(event: StorageEvent): void
    }
    
    class LocalStorageHook~T~ {
        <<interface>>
        +storedValue: T
        +setValue: Function
    }
    
    %% ========================================
    %% DATA MODELS & TYPES
    %% ========================================
    
    class Song {
        <<interface>>
        +id: string
        +title: string
        +artist: string
        +cover: string
        +url: string
    }
    
    class PlaybackError {
        <<interface>>
        +type: ErrorType
        +message: string
        +songId: string
    }
    
    class ErrorType {
        <<enumeration>>
        LOAD_ERROR
        DECODE_ERROR
        NETWORK_ERROR
        UNSUPPORTED_FORMAT
    }
    
    %% ========================================
    %% UTILITY SERVICES
    %% ========================================
    
    class TimeFormatter {
        <<utility>>
        +formatTime(seconds: number): string
        +parseTime(formatted: string): number
        -padZero(num: number): string
    }
    
    class ErrorHandler {
        <<utility>>
        +handlePlaybackError(error: Error): PlaybackError
        +getErrorMessage(errorType: ErrorType): string
        +logError(error: Error): void
    }
    
    class AudioValidator {
        <<utility>>
        +isValidAudioUrl(url: string): boolean
        +isValidImageUrl(url: string): boolean
        +isSupportedFormat(url: string): boolean
        +validateSong(song: Song): ValidationResult
    }
    
    class ValidationResult {
        <<interface>>
        +isValid: boolean
        +errors: string[]
    }
    
    %% ========================================
    %% DATA PROVIDER
    %% ========================================
    
    class PlaylistDataProvider {
        -initialPlaylist: Song[]
        
        +loadInitialPlaylist(): Song[]
        +getDefaultPlaylist(): Song[]
        -fetchFromJSON(): Promise~Song[]~
    }
    
    %% ========================================
    %% RELATIONSHIPS
    %% ========================================
    
    %% App composition
    App --> Player : renders
    
    %% Player composition and hooks
    Player --> TrackInfo : renders
    Player --> Controls : renders
    Player --> ProgressBar : renders
    Player --> Playlist : renders
    Player ..> useAudioPlayer : uses
    Player ..> usePlaylist : uses
    Player --> Song : manages
    
    %% Component prop dependencies
    TrackInfo --> TrackInfoProps : receives
    Controls --> ControlsProps : receives
    ProgressBar --> ProgressBarProps : receives
    Playlist --> PlaylistProps : receives
    Playlist --> AddSongForm : renders
    AddSongForm --> AddSongFormProps : receives
    AddSongForm --> Song : creates
    
    %% Hook relationships
    useAudioPlayer ..> AudioPlayerHook : returns
    useAudioPlayer --> PlaybackError : throws
    usePlaylist ..> PlaylistHook : returns
    usePlaylist ..> useLocalStorage : uses
    usePlaylist --> Song : manages
    useLocalStorage ..> LocalStorageHook : returns
    
    %% Utility usage
    ProgressBar ..> TimeFormatter : uses
    Player ..> ErrorHandler : uses
    AddSongForm ..> AudioValidator : uses
    useAudioPlayer ..> ErrorHandler : uses
    
    %% Data provider
    Player ..> PlaylistDataProvider : uses
    PlaylistDataProvider --> Song : provides
    
    %% Type relationships
    PlaybackError --> ErrorType : uses
    AudioValidator --> ValidationResult : returns
    
    %% Notes
    note for Player "Container component that orchestrates all UI and manages state"
    note for useAudioPlayer "Encapsulates all audio playback logic and HTML5 Audio API"
    note for usePlaylist "Manages playlist state and localStorage persistence"
    note for TrackInfo "Pure presentation component - displays song metadata"
    note for Controls "Pure presentation component - playback controls UI"
    note for ProgressBar "Interactive component with time formatting and seeking"
```

### Design Overview (18 classes/interfaces):

**React Components (7):**

- `App` - Root component
- `Player` - Container component (orchestrator)
- `TrackInfo`, `Controls`, `ProgressBar`, `Playlist` - Presentation components
- `AddSongForm` - Form component with validation

**Custom Hooks (3):**

- `useAudioPlayer` - Audio playback logic (SRP)
- `usePlaylist` - Playlist management (SRP)
- `useLocalStorage` - Generic persistence hook (reusable)

**Data Models (5):**

- `Song` - Core data interface
- `PlaybackError` - Error handling
- Props interfaces for each component

**Utilities (3):**

- `TimeFormatter` - Time conversion (SRP)
- `ErrorHandler` - Centralized error handling (SRP)
- `AudioValidator` - Input validation (SRP)

**Data Provider (1):**

- `PlaylistDataProvider` - Initial data loading (OCP)

### SOLID Principles Applied:

✅ **SRP**: Each hook has one responsibility (audio, playlist, storage)

✅ **OCP**: Can extend PlaylistDataProvider for API sources

✅ **LSP**: Props interfaces ensure component contracts

✅ **ISP**: Focused prop interfaces per component

✅ **DIP**: Components depend on hook abstractions

Ready for the next application! 🎵

# Fix 1

**Prompt:** It's almost perfect, you only need to create the required relationship between AddSongForm and AddSongFormState.

Perfect! I've added the relationship between `AddSongForm` and `AddSongFormState`.

## 📊 View Updated Music Player UML Diagram

```mermaid
classDiagram
    %% ========================================
    %% MAIN APPLICATION COMPONENT
    %% ========================================
    
    class App {
        -audioRef: RefObject~HTMLAudioElement~
        +render(): JSX.Element
    }
    
    %% ========================================
    %% CONTAINER COMPONENT
    %% ========================================
    
    class Player {
        -audioPlayer: AudioPlayerHook
        -playlistManager: PlaylistHook
        -currentSongIndex: number
        
        +constructor()
        +render(): JSX.Element
        +handlePlayPause(): void
        +handleNext(): void
        +handlePrevious(): void
        +handleSeek(time: number): void
        +handleSongSelect(index: number): void
        -getCurrentSong(): Song | null
    }
    
    %% ========================================
    %% PRESENTATION COMPONENTS
    %% ========================================
    
    class TrackInfo {
        +props: TrackInfoProps
        +render(): JSX.Element
    }
    
    class TrackInfoProps {
        +title: string
        +artist: string
        +cover: string
    }
    
    class Controls {
        +props: ControlsProps
        +render(): JSX.Element
        -handlePlayPauseClick(): void
        -handleNextClick(): void
        -handlePreviousClick(): void
    }
    
    class ControlsProps {
        +isPlaying: boolean
        +onPlayPause: Function
        +onNext: Function
        +onPrevious: Function
        +disableNext: boolean
        +disablePrevious: boolean
    }
    
    class ProgressBar {
        +props: ProgressBarProps
        +render(): JSX.Element
        -handleProgressClick(event: MouseEvent): void
        -calculateClickPosition(event: MouseEvent): number
    }
    
    class ProgressBarProps {
        +currentTime: number
        +duration: number
        +onSeek: Function
    }
    
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
    
    class AddSongForm {
        +props: AddSongFormProps
        +state: AddSongFormState
        +render(): JSX.Element
        +handleSubmit(event: FormEvent): void
        +handleInputChange(field: string, value: string): void
        -validateForm(): boolean
        -resetForm(): void
    }
    
    class AddSongFormProps {
        +onAddSong: Function
    }
    
    class AddSongFormState {
        +title: string
        +artist: string
        +cover: string
        +url: string
    }
    
    %% ========================================
    %% CUSTOM HOOKS (Business Logic)
    %% ========================================
    
    class useAudioPlayer {
        <<hook>>
        -audioRef: RefObject~HTMLAudioElement~
        -isPlaying: boolean
        -currentTime: number
        -duration: number
        -error: string | null
        
        +useAudioPlayer(audioRef: RefObject): AudioPlayerHook
        +play(): Promise~void~
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
    
    class usePlaylist {
        <<hook>>
        -playlist: Song[]
        -currentIndex: number
        -storage: LocalStorageHook
        
        +usePlaylist(initialData: Song[]): PlaylistHook
        +addSong(song: Song): void
        +removeSong(id: string): void
        +getSongAt(index: number): Song | null
        +next(): number
        +previous(): number
        +setCurrentIndex(index: number): void
        -saveToStorage(): void
        -loadFromStorage(): Song[]
    }
    
    class PlaylistHook {
        <<interface>>
        +playlist: Song[]
        +currentIndex: number
        +addSong: Function
        +removeSong: Function
        +getSongAt: Function
        +next: Function
        +previous: Function
        +setCurrentIndex: Function
    }
    
    class useLocalStorage {
        <<hook>>
        -key: string
        -storedValue: T
        
        +useLocalStorage~T~(key: string, initialValue: T): LocalStorageHook~T~
        +setValue(value: T): void
        -readValue(): T
        -handleStorageChange(event: StorageEvent): void
    }
    
    class LocalStorageHook~T~ {
        <<interface>>
        +storedValue: T
        +setValue: Function
    }
    
    %% ========================================
    %% DATA MODELS & TYPES
    %% ========================================
    
    class Song {
        <<interface>>
        +id: string
        +title: string
        +artist: string
        +cover: string
        +url: string
    }
    
    class PlaybackError {
        <<interface>>
        +type: ErrorType
        +message: string
        +songId: string
    }
    
    class ErrorType {
        <<enumeration>>
        LOAD_ERROR
        DECODE_ERROR
        NETWORK_ERROR
        UNSUPPORTED_FORMAT
    }
    
    %% ========================================
    %% UTILITY SERVICES
    %% ========================================
    
    class TimeFormatter {
        <<utility>>
        +formatTime(seconds: number): string
        +parseTime(formatted: string): number
        -padZero(num: number): string
    }
    
    class ErrorHandler {
        <<utility>>
        +handlePlaybackError(error: Error): PlaybackError
        +getErrorMessage(errorType: ErrorType): string
        +logError(error: Error): void
    }
    
    class AudioValidator {
        <<utility>>
        +isValidAudioUrl(url: string): boolean
        +isValidImageUrl(url: string): boolean
        +isSupportedFormat(url: string): boolean
        +validateSong(song: Song): ValidationResult
    }
    
    class ValidationResult {
        <<interface>>
        +isValid: boolean
        +errors: string[]
    }
    
    %% ========================================
    %% DATA PROVIDER
    %% ========================================
    
    class PlaylistDataProvider {
        -initialPlaylist: Song[]
        
        +loadInitialPlaylist(): Song[]
        +getDefaultPlaylist(): Song[]
        -fetchFromJSON(): Promise~Song[]~
    }
    
    %% ========================================
    %% RELATIONSHIPS
    %% ========================================
    
    %% App composition
    App --> Player : renders
    
    %% Player composition and hooks
    Player --> TrackInfo : renders
    Player --> Controls : renders
    Player --> ProgressBar : renders
    Player --> Playlist : renders
    Player ..> useAudioPlayer : uses
    Player ..> usePlaylist : uses
    Player --> Song : manages
    
    %% Component prop dependencies
    TrackInfo --> TrackInfoProps : receives
    Controls --> ControlsProps : receives
    ProgressBar --> ProgressBarProps : receives
    Playlist --> PlaylistProps : receives
    Playlist --> AddSongForm : renders
    AddSongForm --> AddSongFormProps : receives
    AddSongForm --> AddSongFormState : manages
    AddSongForm --> Song : creates
    
    %% Hook relationships
    useAudioPlayer ..> AudioPlayerHook : returns
    useAudioPlayer --> PlaybackError : throws
    usePlaylist ..> PlaylistHook : returns
    usePlaylist ..> useLocalStorage : uses
    usePlaylist --> Song : manages
    useLocalStorage ..> LocalStorageHook : returns
    
    %% Utility usage
    ProgressBar ..> TimeFormatter : uses
    Player ..> ErrorHandler : uses
    AddSongForm ..> AudioValidator : uses
    useAudioPlayer ..> ErrorHandler : uses
    
    %% Data provider
    Player ..> PlaylistDataProvider : uses
    PlaylistDataProvider --> Song : provides
    
    %% Type relationships
    PlaybackError --> ErrorType : uses
    AudioValidator --> ValidationResult : returns
    
    %% Notes
    note for Player "Container component that orchestrates all UI and manages state"
    note for useAudioPlayer "Encapsulates all audio playback logic and HTML5 Audio API"
    note for usePlaylist "Manages playlist state and localStorage persistence"
    note for TrackInfo "Pure presentation component - displays song metadata"
    note for Controls "Pure presentation component - playback controls UI"
    note for ProgressBar "Interactive component with time formatting and seeking"
```

Now `AddSongForm` properly shows it manages its internal state through `AddSongFormState`. Ready for the next application specification! 🎵