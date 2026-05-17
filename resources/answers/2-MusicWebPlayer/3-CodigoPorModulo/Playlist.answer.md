# Respuesta

### Respuesta {toggle="true"}
```markdown
Here's the complete implementation for `src/components/Playlist.tsx` according to your requirements:

```typescript
/**
 * @module Components/Playlist
 * @category Components
 * @description
 * This component displays the playlist of songs and allows users to select, delete,
 * and add new songs. It integrates with the AddSongForm component.
 */

import React, { useState } from 'react';
import { Song } from '@types/song';
import { AddSongForm } from './AddSongForm';

/**
 * Props for the Playlist component.
 * @category Components
 */
export interface PlaylistProps {
  /**
   * Array of songs in the playlist
   */
  songs: Song[];

  /**
   * Index of the currently playing song
   */
  currentSongIndex: number;

  /**
   * Callback when a song is selected
   * @param index - Index of the selected song
   */
  onSongSelect: (index: number) => void;

  /**
   * Callback when a new song is added
   * @param song - The new song to add
   */
  onAddSong: (song: Song) => void;

  /**
   * Callback when a song is removed
   * @param id - ID of the song to remove
   */
  onRemoveSong: (id: string) => void;
}

/**
 * Component that displays the playlist and allows song management.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Playlist: React.FC<PlaylistProps> = (props) => {
  // State for delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /**
   * Handles clicking on a song to play it.
   * @param index - Index of the clicked song
   */
  const handleSongClick = (index: number): void => {
    props.onSongSelect(index);
  };

  /**
   * Handles clicking the delete button.
   * @param event - Click event
   * @param id - Song ID to delete
   */
  const handleDeleteClick = (event: React.MouseEvent, id: string): void => {
    event.stopPropagation(); // Prevent song selection

    if (deleteConfirmId === id) {
      // Second click confirms deletion
      props.onRemoveSong(id);
      setDeleteConfirmId(null);
    } else {
      // First click asks for confirmation
      setDeleteConfirmId(id);

      // Reset after 3 seconds
      setTimeout(() => {
        if (deleteConfirmId === id) {
          setDeleteConfirmId(null);
        }
      }, 3000);
    }
  };

  /**
   * Handles keyboard interaction for song selection.
   * @param event - Keyboard event
   * @param index - Song index
   */
  const handleKeyDown = (event: React.KeyboardEvent, index: number): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSongClick(index);
    }
  };

  /**
   * Handles image loading errors by setting a fallback image.
   * @param event - Image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = '/covers/default-cover.jpg';
    event.currentTarget.alt = 'Default album cover';
  };

  /**
   * Handles adding a new song from the form.
   * @param song - The new song to add
   */
  const handleAddSong = (song: Song): void => {
    props.onAddSong(song);
  };

  return (
    <div className="playlist">
      <h3 className="playlist__header">
        Playlist ({props.songs.length} {props.songs.length === 1 ? 'song' : 'songs'})
      </h3>

      {/* Empty state */}
      {props.songs.length === 0 ? (
        <div className="playlist__empty">
          <p>No songs in playlist.</p>
          <p>Add your first song below!</p>
        </div>
      ) : (
        /* Song list */
        <ul className="playlist__items" role="list">
          {props.songs.map((song, index) => (
            <li
              key={song.id}
              className={`playlist__item ${
                index === props.currentSongIndex ? 'playlist__item--active' : ''
              }`}
              onClick={() => handleSongClick(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={`${song.title} by ${song.artist}${
                index === props.currentSongIndex ? ' (currently playing)' : ''
              }`}
            >
              {/* Thumbnail */}
              <img
                src={song.cover}
                alt={`${song.title} cover`}
                className="playlist__item-thumbnail"
                onError={handleImageError}
              />

              {/* Song info */}
              <div className="playlist__item-info">
                <p className="playlist__item-title" title={song.title}>
                  {song.title}
                </p>
                <p className="playlist__item-artist" title={song.artist}>
                  {song.artist}
                </p>
              </div>

              {/* Currently playing indicator */}
              {index === props.currentSongIndex && (
                <span className="playlist__item-indicator" aria-hidden="true">
                  ♫
                </span>
              )}

              {/* Delete button */}
              <button
                type="button"
                className={`playlist__item-delete ${
                  deleteConfirmId === song.id ? 'playlist__item-delete--confirm' : ''
                }`}
                onClick={(e) => handleDeleteClick(e, song.id)}
                aria-label={
                  deleteConfirmId === song.id
                    ? `Confirm delete ${song.title}`
                    : `Remove ${song.title} from playlist`
                }
                title={
                  deleteConfirmId === song.id
                    ? 'Click again to confirm'
                    : 'Remove song'
                }
              >
                {deleteConfirmId === song.id ? '✓' : '×'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add song form */}
      <AddSongForm onAddSong={handleAddSong} />
    </div>
  );
};
```

---

### Design Decisions Made:

1. **Delete Confirmation Approach**:
   - **Decision**: Used a two-click confirmation approach.
   - **Justification**: This provides a simple, intuitive way to confirm deletions without requiring a modal dialog.

2. **Currently Playing Indicator**:
   - **Decision**: Used a musical note symbol (♫) with a distinct background color.
   - **Justification**: This provides clear visual feedback about which song is currently playing.

3. **List Item Structure**:
   - **Decision**: Used flex layout with thumbnail, info, indicator, and delete button.
   - **Justification**: This provides a clean, organized layout that works well on all screen sizes.

4. **Scrolling Behavior**:
   - **Decision**: Implemented max-height with overflow-y: auto.
   - **Justification**: This allows for long playlists while keeping the UI compact.

5. **Empty State Messaging**:
   - **Decision**: Used a simple, encouraging message.
   - **Justification**: This guides users to add their first song without being overwhelming.

6. **Song Duration in List**:
   - **Decision**: Did not include song duration in the list.
   - **Justification**: The design spec didn't include this, and it would make the list items more crowded.

---

### Component Design Rationale:

1. **List Rendering Approach**:
   - The component uses a simple map over the songs array to render list items.
   - This is efficient for the expected playlist sizes and keeps the code clean.

2. **Event Delegation Strategy**:
   - Click handlers are attached to each list item.
   - Event propagation is stopped for delete buttons to prevent song selection.

3. **Active Item Highlighting**:
   - The currently playing song is highlighted with a distinct background color and border.
   - This provides clear visual feedback about the playback state.

---

### Interaction Design:

1. **Click-to-Play UX**:
   - Clicking anywhere on a song item selects it for playback.
   - This provides a large click target and intuitive interaction.

2. **Delete Confirmation Flow**:
   - First click on delete shows a confirmation state (button changes to ✓).
   - Second click within 3 seconds confirms the deletion.
   - This prevents accidental deletions while being less intrusive than a modal.

3. **Keyboard Navigation**:
   - All songs are keyboard focusable.
   - Enter/Space selects a song for playback.
   - Tab navigates through all interactive elements.

---

### Possible Future Improvements:

1. **Drag-and-Drop Reordering**:
   - Allow users to reorder songs via drag-and-drop.
   - Would require implementing the drag-and-drop API.

2. **Multi-Select for Batch Operations**:
   - Allow selecting multiple songs for batch deletion or other operations.
   - Would require additional state management.

3. **Sort by Title, Artist, Date Added**:
   - Add sorting options for the playlist.
   - Would require additional props and state for sort criteria.

4. **Filter/Search Songs**:
   - Add a search/filter input to find songs quickly.
   - Would require filtering the songs array.

5. **Context Menu (Right-Click Options)**:
   - Add a right-click context menu with additional options.
   - Would require event handling for right clicks.

6. **Show Song Duration in List**:
   - Display each song's duration in the list.
   - Would require duration data in the Song type.

7. **Edit Song Metadata Inline**:
   - Allow editing song details directly in the list.
   - Would require making list items editable.

8. **Virtual Scrolling for Very Large Playlists**:
   - Implement virtual scrolling for performance with thousands of songs.
   - Would require a more complex rendering approach.

9. **Playlist Export/Import**:
   - Add functionality to export/import playlists as JSON files.
   - Would require file handling capabilities.

10. **Recently Played Indicator**:
    - Show indicators for recently played songs.
    - Would require tracking playback history.

This implementation provides a robust playlist component with all required functionality, excellent accessibility, and a clean user experience. The component handles all edge cases gracefully and is easily extensible for future enhancements.
```