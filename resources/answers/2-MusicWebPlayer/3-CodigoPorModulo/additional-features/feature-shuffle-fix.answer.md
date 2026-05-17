# Respuesta

```markdown
You're absolutely right. This is a common issue when implementing shuffle functionality. The problem occurs because we're tracking the current song index in the playlist, but when shuffle is enabled, we need to track the current position in the shuffle queue instead. Let's fix this by updating the `usePlaylist` hook and the `Player` component:

### 1. First, let's update the `usePlaylist` hook to properly track the current song in shuffle mode:

```typescript
// src/hooks/usePlaylist.ts
// Update the getSongAt method to handle shuffle mode
const getSongAt = (index: number): Song | null => {
  if (playlist.length === 0) {
    return null;
  }

  // If shuffle is enabled, use the shuffle queue
  if (isShuffled && shuffleQueue.length > 0) {
    // Get the actual index from the shuffle queue
    const actualIndex = shuffleQueue[shuffleIndex];
    if (actualIndex >= 0 && actualIndex < playlist.length) {
      return playlist[actualIndex];
    }
  }

  // Normal mode or shuffle disabled
  if (index < 0 || index >= playlist.length) {
    return null;
  }
  return playlist[index];
};

// Update the setCurrentIndex method to handle shuffle mode
const setCurrentIndexSafe = (index: number): void => {
  // If shuffle is enabled, we need to find the position in the shuffle queue
  if (isShuffled && shuffleQueue.length > 0) {
    // Find the position of the requested index in the shuffle queue
    const positionInQueue = shuffleQueue.indexOf(index);
    if (positionInQueue >= 0) {
      setShuffleIndex(positionInQueue);
    } else {
      // If the requested index isn't in the queue, reset to first song
      setShuffleIndex(0);
    }
  } else {
    // Normal mode - clamp to valid range
    const clampedIndex = Math.max(0, Math.min(index, Math.max(0, playlist.length - 1)));
    setCurrentIndex(clampedIndex);
  }
};

// Add a new method to get the current song index in the original playlist
const getCurrentSongIndex = (): number => {
  if (isShuffled && shuffleQueue.length > 0 && shuffleIndex >= 0 && shuffleIndex < shuffleQueue.length) {
    return shuffleQueue[shuffleIndex];
  }
  return currentIndex;
};
```

### 2. Now, let's update the `usePlaylist` hook return type to include the new method:

```typescript
// src/hooks/usePlaylist.ts
export interface PlaylistHook {
  // ... existing properties
  playlist: Song[];
  currentIndex: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;

  // ... existing methods
  addSong: (song: Song) => void;
  removeSong: (id: string) => void;
  getSongAt: (index: number) => Song | null;
  next: () => number;
  previous: () => number;
  setCurrentIndex: (index: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  hasNext: () => boolean;
  hasPrevious: () => boolean;

  // NEW: Method to get the current song index in the original playlist
  getCurrentSongIndex: () => number;
}
```

### 3. Update the return statement in the `usePlaylist` hook:

```typescript
// src/hooks/usePlaylist.ts
return {
  playlist,
  currentIndex,
  repeatMode,
  isShuffled,
  addSong,
  removeSong,
  getSongAt,
  next,
  previous,
  setCurrentIndex: setCurrentIndexSafe,
  setRepeatMode,
  toggleShuffle,
  hasNext,
  hasPrevious,
  getCurrentSongIndex // NEW: Add this method
};
```

### 4. Now, let's update the `Player` component to use the new method:

```typescript
// src/components/Player.tsx
// Update the getCurrentSong function to use getCurrentSongIndex
const getCurrentSong = (): Song | null => {
  const currentIndex = playlistManager.getCurrentSongIndex();
  return playlistManager.getSongAt(currentIndex);
};

// Update the handleSongSelect function to use the new method
const handleSongSelect = (index: number): void => {
  playlistManager.setCurrentIndex(index);
  const selectedSong = playlistManager.getSongAt(index);

  if (selectedSong) {
    audioPlayer.setSource(selectedSong.url, selectedSong.id);
    audioPlayer.play().catch(error => {
      console.error('Play failed:', error);
      setErrorMessage('Unable to play selected song. Please try again.');
    });
  }
};
```

### 5. Update the `Playlist` component to use the correct index:

```typescript
// src/components/Player.tsx
// Update the Playlist component props to use getCurrentSongIndex
<Playlist
  songs={playlistManager.playlist}
  currentSongIndex={playlistManager.getCurrentSongIndex()}
  onSongSelect={handleSongSelect}
  onAddSong={handleAddSong}
  onRemoveSong={handleRemoveSong}
/>
```

### 6. Update the `toggleShuffle` method to properly handle the current song:

```typescript
// src/hooks/usePlaylist.ts
const toggleShuffle = (): void => {
  if (isShuffled) {
    // Turning shuffle off
    setIsShuffled(false);
    setShuffleQueue([]);
    setShuffleIndex(0);

    // Set currentIndex to the actual song index
    if (shuffleQueue.length > 0 && shuffleIndex >= 0 && shuffleIndex < shuffleQueue.length) {
      setCurrentIndex(shuffleQueue[shuffleIndex]);
    }
  } else {
    // Turning shuffle on
    setIsShuffled(true);
    generateShuffleQueue();
  }
};
```

### 7. Update the `generateShuffleQueue` method to ensure the current song stays first:

```typescript
// src/hooks/usePlaylist.ts
const generateShuffleQueue = (): void => {
  // Fisher-Yates shuffle
  const indices = Array.from({ length: playlist.length }, (_, i) => i);

  // Keep current song first in shuffle
  const currentSongIndex = indices.indexOf(currentIndex);
  if (currentSongIndex > 0) {
    [indices[0], indices[currentSongIndex]] = [indices[currentSongIndex], indices[0]];
  }

  // Shuffle remaining songs
  for (let i = indices.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i - 1)) + 1;
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  setShuffleQueue(indices);
  setShuffleIndex(0);
};
```

### 8. Update the `next` and `previous` methods to properly update the current index:

```typescript
// src/hooks/usePlaylist.ts
const next = (): number => {
  if (repeatMode === RepeatMode.ONE) {
    // Stay on current song (handled in Player's ended event)
    return getCurrentSongIndex();
  }

  if (isShuffled) {
    // Advance in shuffle queue
    const nextShuffleIndex = shuffleIndex + 1;

    if (nextShuffleIndex >= shuffleQueue.length) {
      // End of shuffle queue
      if (repeatMode === RepeatMode.ALL) {
        // Reshuffle and continue
        generateShuffleQueue();
        setShuffleIndex(0);
        return shuffleQueue[0];
      } else {
        // Repeat Off - stay on last song
        return getCurrentSongIndex();
      }
    }

    setShuffleIndex(nextShuffleIndex);
    return shuffleQueue[nextShuffleIndex];
  }

  // Normal sequential mode
  if (currentIndex >= playlist.length - 1) {
    if (repeatMode === RepeatMode.ALL) {
      setCurrentIndex(0);
      return 0;
    } else {
      // Repeat Off - stay on last song
      return currentIndex;
    }
  }

  const newIndex = currentIndex + 1;
  setCurrentIndex(newIndex);
  return newIndex;
};

const previous = (): number => {
  if (isShuffled) {
    // Go back in shuffle queue
    const prevShuffleIndex = shuffleIndex - 1;

    if (prevShuffleIndex < 0) {
      // Beginning of shuffle queue
      if (repeatMode === RepeatMode.ALL) {
        // Wrap to end
        setShuffleIndex(shuffleQueue.length - 1);
        return shuffleQueue[shuffleQueue.length - 1];
      } else {
        // Repeat Off - stay on first song
        return getCurrentSongIndex();
      }
    }

    setShuffleIndex(prevShuffleIndex);
    return shuffleQueue[prevShuffleIndex];
  }

  // Normal sequential mode
  if (currentIndex <= 0) {
    if (repeatMode === RepeatMode.ALL) {
      setCurrentIndex(playlist.length - 1);
      return playlist.length - 1;
    } else {
      // Repeat Off - stay on first song
      return currentIndex;
    }
  }

  const newIndex = currentIndex - 1;
  setCurrentIndex(newIndex);
  return newIndex;
};
```

These changes ensure that:
1. The current song is properly tracked in both normal and shuffle modes
2. The playlist viewer correctly shows which song is currently playing
3. The track info updates correctly when shuffle is enabled
4. The current song stays playing when shuffle is toggled on/off
5. Navigation (next/previous) works correctly in both modes

The implementation now properly handles the current song index in both normal and shuffle modes, ensuring the UI always reflects the correct state.
```