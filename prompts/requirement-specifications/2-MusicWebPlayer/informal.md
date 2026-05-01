## General Description

Interactive music player web application built with React, TypeScript and Vite. Allows intuitive song playback, local playlist management, and displays complete information for each track including title, artist, and cover art. The system includes standard playback controls and extended functionalities such as shuffle and repeat.

## Main Playback Features

- Play song selected by user from the beginning or current position
- Pause and resume playback maintaining position
- Skip to next song in the playlist
- Go back to previous song in the playlist
- Automatic song change and progress bar reset when using Next/Previous controls
- Automatic track information update when changing songs

## Display Features

- Display current song title
- Display current song artist
- Display current song cover art
- Display elapsed playback time
- Display total song duration
- Visual progress bar reflecting current position in the song
- Complete list of available songs in the playlist
- Immediate update of all information when changing tracks

## Playlist Management

- Add songs to local playlist
- Remove songs from playlist
- Display of complete playlist in the interface
- Persistent storage using JSON or localStorage
- Real-time playlist update when adding or removing songs
- Data structure with fields: title, artist, cover URL and audio URL
- Minimum of 5 example songs included in initial dataset

## Interactive Playback Controls

- Play/Pause buttons with visual state change
- Functional Next and Previous buttons
- Interactive progress bar that allows manual advancement by clicking
- Clearly labeled and accessible controls
- Immediate response to user interactions

## Application Features

- Responsive web application functional in modern browsers (Chrome, Firefox, Edge)
- Compatible with desktop and mobile devices
- Intuitive and accessible interface with readable typography
- Contrasting colors for better usability
- Loading time under 2 seconds on standard connections
- Modular code with separated components
- Reusable hooks and functions
- Unit tests with Jest (minimum 80% coverage on critical functions)
- Proper error handling without application blocking

## Error Handling

- Display error message when an audio file is not available
- Continue application functionality after error in specific file
- Clear feedback to user about playback issues
- Prevention of crashes due to missing or corrupted files

## Optional Extended Features

- Shuffle mode for random playback without repeating until completing the list
- Repeat mode to repeat current song or complete playlist
- Animations for cover art, progress bar or buttons
- Playback history saving
- Recording of last listened songs
- Implementation of light and dark themes
- Future extension to online playlists or synchronization with external services

## Testing and Quality

- Unit tests with Jest covering:
    - Play and pause function
    - Next and previous navigation
    - Progress bar control
    - Playlist management (add/remove)
    - Playback error handling
- Minimum 80% coverage on critical functions
- Independently tested components

## Song Data Structure

Each song must contain:

- `title`: song name
- `artist`: artist name
- `cover`: cover image URL
- `url`: MP3 audio file URL

Example JSON structure:

```json
{
  "title": "Song Name",
  "artist": "Artist Name",
  "cover": "<https://example.com/covers/image.jpg>",
  "url": "<https://example.com/audio/song.mp3>"
}

```

## Typical User Flow

1. User opens the application and the list of available songs loads automatically
2. User clicks Play button to start playback of the first song
3. Progress bar begins updating in real time
4. User views complete information of current song (cover, title, artist)
5. User uses Next button to change to next song
6. All information updates automatically with the new track
7. User interacts with progress bar to advance to specific position
8. User manages playlist by adding or removing songs according to preference
9. Changes in playlist are immediately reflected in the interface

## Suggested User Interface

- Main panel with playback controls (Play/Pause, Next, Previous)
- Highlighted display area for current song cover art
- Clearly visible text information for title and artist
- Horizontal progress bar with time indicators
- Side or bottom panel with complete list of playlist songs
- Optional Shuffle and Repeat buttons with visual indicator of active state
- Clean and minimalist design focused on user experience