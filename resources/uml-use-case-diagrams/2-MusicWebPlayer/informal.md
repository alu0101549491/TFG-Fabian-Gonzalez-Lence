# Initial

I've created a comprehensive UML use case diagram for the music player application. Here's what it includes:

**Main Actors:**

- **User**: The person interacting with the music player
- **System**: Automated system processes
- **Local Storage**: Persistent data storage

**Primary Use Cases (User-Initiated):**

1. **Play Song** - Start playback from beginning or current position
2. **Pause Song** - Stop playback temporarily
3. **Resume Playback** - Continue from paused position
4. **Skip to Next Song** - Move to next track in playlist
5. **Go to Previous Song** - Return to previous track
6. **Seek Position in Song** - Jump to specific time via progress bar
7. **View Song Information** - See title, artist, cover art
8. **View Playlist** - Display all available songs
9. **Add Song to Playlist** - Include new track
10. **Remove Song from Playlist** - Delete track from list
11. **Toggle Shuffle Mode** - Enable/disable random playback
12. **Toggle Repeat Mode** - Enable/disable song/playlist repeat

**Included Use Cases (Dependencies):**

- **Update Track Information** - Refresh displayed song data
- **Reset Progress Bar** - Return progress to start
- **Persist Playlist Data** - Save changes to localStorage
- **Load Initial Playlist** - Retrieve stored playlist on startup

**Extended Use Cases (Conditional):**

- **Handle Playback Error** - Manage audio file issues
- **Auto Advance to Next Song** - Automatic track progression

**System Use Cases:**

- **View Progress Bar** - Real-time playback position display

The diagram shows how users interact with the core playback features, playlist management, and how the system automatically handles tasks like track updates and error management. All data persistence flows through Local Storage, ensuring playlist changes are maintained across sessions.

```mermaid
graph TB
    subgraph "Music Player System"
        UC1[Play Song]
        UC2[Pause Song]
        UC3[Resume Playback]
        UC4[Skip to Next Song]
        UC5[Go to Previous Song]
        UC6[Seek Position in Song]
        UC7[View Song Information]
        UC8[View Progress Bar]
        UC9[View Playlist]
        UC10[Add Song to Playlist]
        UC11[Remove Song from Playlist]
        UC12[Update Track Information]
        UC13[Reset Progress Bar]
        UC14[Auto Advance to Next Song]
        UC15[Handle Playback Error]
        UC16[Load Initial Playlist]
        UC17[Persist Playlist Data]
        UC18[Toggle Shuffle Mode]
        UC19[Toggle Repeat Mode]
    end
    
    User((User))
    System((System))
    Storage((Local Storage))
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC18
    User --> UC19
    
    UC1 -.->|include| UC12
    UC1 -.->|include| UC8
    
    UC2 --> System
    UC3 --> System
    
    UC4 -.->|include| UC12
    UC4 -.->|include| UC13
    
    UC5 -.->|include| UC12
    UC5 -.->|include| UC13
    
    UC6 -.->|include| UC8
    
    UC7 -.->|include| UC12
    
    UC10 -.->|include| UC17
    UC10 -.->|include| UC9
    
    UC11 -.->|include| UC17
    UC11 -.->|include| UC9
    
    UC1 -.->|extend| UC15
    UC4 -.->|extend| UC15
    UC5 -.->|extend| UC15
    
    System --> UC14
    System --> UC12
    System --> UC13
    System --> UC15
    System --> UC16
    
    UC14 -.->|include| UC12
    UC14 -.->|include| UC13
    
    UC16 --> Storage
    UC17 --> Storage
    
    UC15 --> User
```