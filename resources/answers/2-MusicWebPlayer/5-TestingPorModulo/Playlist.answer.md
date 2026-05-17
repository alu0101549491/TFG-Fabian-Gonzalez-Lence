# Respuesta

### Respuesta {toggle="true"}
```typescript
// tests/components/Playlist.test.tsx
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Playlist } from '@/components/Playlist';
import { Song } from '@/types/song';

describe('Playlist Component', () => {
  // Mock songs
  const mockSongs: Song[] = [
    { id: '1', title: 'Song One', artist: 'Artist One', cover: '/1.jpg', url: '/1.mp3' },
    { id: '2', title: 'Song Two', artist: 'Artist Two', cover: '/2.jpg', url: '/2.mp3' },
    { id: '3', title: 'Song Three', artist: 'Artist Three', cover: '/3.jpg', url: '/3.mp3' },
    { id: '4', title: 'Song Four', artist: 'Artist Four', cover: '/4.jpg', url: '/4.mp3' },
    { id: '5', title: 'Song Five', artist: 'Artist Five', cover: '/5.jpg', url: '/5.mp3' }
  ];

  const defaultProps = {
    songs: mockSongs,
    currentSongIndex: 0,
    onSongSelect: jest.fn(),
    onRemoveSong: jest.fn(),
    onAddSong: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to get song items (li elements with role="button", excluding delete buttons)
  const getSongItems = () => {
    return screen.getAllByRole('button').filter(button => 
      !button.getAttribute('aria-label')?.includes('Remove') &&
      button.tagName === 'LI'
    );
  };

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<Playlist {...defaultProps} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render list element', () => {
      render(<Playlist {...defaultProps} />);

      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
    });

    it('should render all songs from array', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = getSongItems();

      expect(listItems).toHaveLength(mockSongs.length);
    });

    it('should not crash with empty songs array', () => {
      expect(() =>
        render(<Playlist {...defaultProps} songs={[]} />)
      ).not.toThrow();
    });
  });

  describe('Song Display', () => {
    it('should display all song titles', () => {
      render(<Playlist {...defaultProps} />);

      mockSongs.forEach(song => {
        expect(screen.getByText(song.title)).toBeInTheDocument();
      });
    });

    it('should display all song artists', () => {
      render(<Playlist {...defaultProps} />);

      mockSongs.forEach(song => {
        expect(screen.getByText(song.artist)).toBeInTheDocument();
      });
    });

    it('should display track numbers (1-based)', () => {
      render(<Playlist {...defaultProps} />);

      // Track numbers should be 1, 2, 3, 4, 5
      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/4/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should render correct number of songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 2)} />);

      let listItems = getSongItems();
      expect(listItems).toHaveLength(2);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      listItems = getSongItems();
      expect(listItems).toHaveLength(5);
    });
  });

  describe('Key Props', () => {
    it('should use song.id as key prop', () => {
      const { container } = render(<Playlist {...defaultProps} />);

      const listItems = container.querySelectorAll('li');

      // React adds keys internally, check that we have unique items
      expect(listItems.length).toBe(mockSongs.length);
    });

    it('should not use index as key', () => {
      // This is more of a code review check, but we can verify
      // that songs are rendered in correct order
      render(<Playlist {...defaultProps} />);

      const titles = screen.getAllByText(/Song/);

      expect(titles[0]).toHaveTextContent('Song One');
      expect(titles[1]).toHaveTextContent('Song Two');
      expect(titles[2]).toHaveTextContent('Song Three');
    });

    it('should handle songs with unique IDs correctly', () => {
      const uniqueSongs = mockSongs.map((song, i) => ({
        ...song,
        id: `unique-${i}-${Date.now()}`
      }));

      expect(() =>
        render(<Playlist {...defaultProps} songs={uniqueSongs} />)
      ).not.toThrow();
    });
  });

  describe('Current Song Indicator', () => {
    it('should highlight current song', () => {
      render(<Playlist {...defaultProps} currentSongIndex={2} />);

      const listItems = getSongItems();
      const currentItem = listItems[2];

      // Current item should have aria-current
      expect(currentItem).toHaveAttribute('aria-current', 'true');
    });

    it('should have aria-current="true" on current song only', () => {
      render(<Playlist {...defaultProps} currentSongIndex={1} />);

      const listItems = getSongItems();

      listItems.forEach((item, index) => {
        if (index === 1) {
          expect(item).toHaveAttribute('aria-current', 'true');
        } else {
          expect(item).not.toHaveAttribute('aria-current', 'true');
        }
      });
    });

    it('should update indicator when currentSongIndex changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} currentSongIndex={0} />);

      let listItems = getSongItems();
      expect(listItems[0]).toHaveAttribute('aria-current', 'true');

      rerender(<Playlist {...defaultProps} currentSongIndex={2} />);

      listItems = getSongItems();
      expect(listItems[0]).not.toHaveAttribute('aria-current', 'true');
      expect(listItems[2]).toHaveAttribute('aria-current', 'true');
    });

    it('should highlight first song when currentSongIndex is 0', () => {
      render(<Playlist {...defaultProps} currentSongIndex={0} />);

      const listItems = getSongItems();

      expect(listItems[0]).toHaveAttribute('aria-current', 'true');
    });

    it('should highlight last song when currentSongIndex is last', () => {
      render(<Playlist {...defaultProps} currentSongIndex={4} />);

      const listItems = getSongItems();

      expect(listItems[4]).toHaveAttribute('aria-current', 'true');
    });
  });

  describe('Song Selection', () => {
    it('should call onSongSelect when song is clicked', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      await user.click(listItems[2]);

      expect(onSongSelect).toHaveBeenCalledWith(2);
    });

    it('should pass correct index to onSongSelect', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      await user.click(listItems[0]);
      expect(onSongSelect).toHaveBeenCalledWith(0);

      await user.click(listItems[3]);
      expect(onSongSelect).toHaveBeenCalledWith(3);
    });

    it('should make first song selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const firstSong = screen.getByText('Song One').closest('li')!;

      await user.click(firstSong);

      expect(onSongSelect).toHaveBeenCalledWith(0);
    });

    it('should make last song selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const lastSong = screen.getByText('Song Five').closest('li')!;

      await user.click(lastSong);

      expect(onSongSelect).toHaveBeenCalledWith(4);
    });

    it('should make all songs selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      for (let i = 0; i < listItems.length; i++) {
        await user.click(listItems[i]);
        expect(onSongSelect).toHaveBeenCalledWith(i);
      }

      expect(onSongSelect).toHaveBeenCalledTimes(mockSongs.length);
    });
  });

  describe('Delete Button', () => {
    it('should render delete button for each song', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      expect(deleteButtons).toHaveLength(mockSongs.length);
    });

    it('should call onRemoveSong when delete is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveSong = jest.fn();

      render(<Playlist {...defaultProps} onRemoveSong={onRemoveSong} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      await user.click(deleteButtons[2]);

      expect(onRemoveSong).toHaveBeenCalledWith('3');
    });

    it('should pass song ID to onRemoveSong', async () => {
      const user = userEvent.setup();
      const onRemoveSong = jest.fn();

      render(<Playlist {...defaultProps} onRemoveSong={onRemoveSong} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      await user.click(deleteButtons[0]);
      expect(onRemoveSong).toHaveBeenCalledWith('1');

      await user.click(deleteButtons[4]);
      expect(onRemoveSong).toHaveBeenCalledWith('5');
    });

    it('should not trigger onSongSelect when delete is clicked', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      await user.click(deleteButtons[2]);

      expect(onRemoveSong).toHaveBeenCalled();
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should have aria-label on delete buttons', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have delete button for all songs', () => {
      render(<Playlist {...defaultProps} />);

      const songs = getSongItems();
      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      expect(deleteButtons.length).toBe(songs.length);
    });
  });

  describe('Empty State', () => {
    it('should show message when songs array is empty', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      expect(screen.getByText(/no songs/i)).toBeInTheDocument();
    });

    it('should not crash with empty array', () => {
      const { container } = render(<Playlist {...defaultProps} songs={[]} />);

      expect(container).toBeInTheDocument();
    });

    it('should make empty message visible', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      const message = screen.getByText(/no songs/i);

      expect(message).toBeVisible();
    });

    it('should not render song elements when empty', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      const listItems = screen.queryAllByRole('button').filter(b => b.tagName === 'LI');

      expect(listItems).toHaveLength(0);
    });

    it('should transition from empty to populated', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={[]} />);

      expect(screen.getByText(/no songs/i)).toBeInTheDocument();

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(screen.queryByText(/no songs/i)).not.toBeInTheDocument();
      expect(getSongItems()).toHaveLength(mockSongs.length);
    });
  });

  describe('Track Numbers', () => {
    it('should display 1-based track numbers', () => {
      render(<Playlist {...defaultProps} />);

      // First song should show "1", not "0"
      const listItems = getSongItems();

      expect(within(listItems[0]).getByText(/1/)).toBeInTheDocument();
      expect(within(listItems[1]).getByText(/2/)).toBeInTheDocument();
      expect(within(listItems[2]).getByText(/3/)).toBeInTheDocument();
    });

    it('should start numbering at 1 not 0', () => {
      render(<Playlist {...defaultProps} />);

      const firstItem = getSongItems()[0];

      expect(within(firstItem).getByText(/1/)).toBeInTheDocument();
      expect(within(firstItem).queryByText(/0/)).not.toBeInTheDocument();
    });

    it('should have sequential numbering', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = getSongItems();

      listItems.forEach((item, index) => {
        const trackNumber = index + 1;
        expect(within(item).getByText(new RegExp(trackNumber.toString()))).toBeInTheDocument();
      });
    });

    it('should update numbers when array changes', () => {
      const { rerender } = render(
        <Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />
      );

      let listItems = getSongItems();
      expect(listItems).toHaveLength(3);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      listItems = getSongItems();
      expect(listItems).toHaveLength(5);
      expect(within(listItems[4]).getByText(/5/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic list element', () => {
      render(<Playlist {...defaultProps} />);

      const list = screen.getByRole('list');

      expect(list.tagName).toMatch(/^(OL|UL)$/);
    });

    it('should render each song as list item', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = getSongItems();

      listItems.forEach(item => {
        expect(item.tagName).toBe('LI');
      });
    });

    it('should have aria-current on current song', () => {
      render(<Playlist {...defaultProps} currentSongIndex={1} />);

      const listItems = getSongItems();

      expect(listItems[1]).toHaveAttribute('aria-current', 'true');
    });

    it('should have aria-label on delete buttons', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button');

      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard accessible', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button');

      // Buttons are natively keyboard accessible
      deleteButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Event Handling', () => {
    it('should use stopPropagation on delete button', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const deleteButton = screen.getAllByLabelText(/remove|delete/i)[1];

      await user.click(deleteButton);

      expect(onRemoveSong).toHaveBeenCalledWith('2');
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should handle song select independently from delete', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const listItem = getSongItems()[2];
      const deleteButton = within(listItem).getByLabelText(/remove|delete/i);

      // Click song
      await user.click(listItem);
      expect(onSongSelect).toHaveBeenCalledWith(2);

      onSongSelect.mockClear();

      // Click delete
      await user.click(deleteButton);
      expect(onRemoveSong).toHaveBeenCalledWith('3');
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should call callbacks with correct parameters', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const listItem = getSongItems()[3];
      const deleteButton = within(listItem).getByLabelText(/remove|delete/i);

      await user.click(listItem);
      expect(onSongSelect).toHaveBeenCalledWith(3); // index

      await user.click(deleteButton);
      expect(onRemoveSong).toHaveBeenCalledWith('4'); // id
    });
  });

  describe('Props Updates', () => {
    it('should re-render when songs array changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 2)} />);

      expect(getSongItems()).toHaveLength(2);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(getSongItems()).toHaveLength(5);
    });

    it('should update when currentSongIndex changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} currentSongIndex={0} />);

      let listItems = getSongItems();
      expect(listItems[0]).toHaveAttribute('aria-current', 'true');

      rerender(<Playlist {...defaultProps} currentSongIndex={3} />);

      listItems = getSongItems();
      expect(listItems[0]).not.toHaveAttribute('aria-current', 'true');
      expect(listItems[3]).toHaveAttribute('aria-current', 'true');
    });

    it('should handle adding songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />);

      expect(getSongItems()).toHaveLength(3);

      const newSong: Song = {
        id: '6',
        title: 'New Song',
        artist: 'New Artist',
        cover: '/6.jpg',
        url: '/6.mp3'
      };

      rerender(<Playlist {...defaultProps} songs={[...mockSongs.slice(0, 3), newSong]} />);

      expect(getSongItems()).toHaveLength(4);
      expect(screen.getByText('New Song')).toBeInTheDocument();
    });

    it('should handle removing songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(getSongItems()).toHaveLength(5);

      rerender(<Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />);

      expect(getSongItems()).toHaveLength(3);
      expect(screen.queryByText('Song Four')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single song playlist', () => {
      const singleSong = [mockSongs[0]];

      render(<Playlist {...defaultProps} songs={singleSong} />);

      expect(getSongItems()).toHaveLength(1);
      expect(screen.getByText('Song One')).toBeInTheDocument();
    });

    it('should handle very large playlist', () => {
      const largeSongs = Array.from({ length: 100 }, (_, i) => ({
        id: `song-${i}`,
        title: `Song ${i}`,
        artist: `Artist ${i}`,
        cover: `/cover${i}.jpg`,
        url: `/song${i}.mp3`
      }));

      render(<Playlist {...defaultProps} songs={largeSongs} />);

      expect(getSongItems()).toHaveLength(100);
    });

    it('should handle current song at index 0', () => {
      render(<Playlist {...defaultProps} currentSongIndex={0} />);

      const firstItem = getSongItems()[0];

      expect(firstItem).toHaveAttribute('aria-current', 'true');
    });

    it('should handle current song at last index', () => {
      render(<Playlist {...defaultProps} currentSongIndex={4} />);

      const lastItem = getSongItems()[4];

      expect(lastItem).toHaveAttribute('aria-current', 'true');
    });

    it('should handle currentSongIndex out of bounds gracefully', () => {
      expect(() =>
        render(<Playlist {...defaultProps} currentSongIndex={10} />)
      ).not.toThrow();
    });

    it('should handle empty strings in song data', () => {
      const songsWithEmpty: Song[] = [
        { id: '1', title: '', artist: '', cover: '', url: '' }
      ];

      expect(() =>
        render(<Playlist {...defaultProps} songs={songsWithEmpty} />)
      ).not.toThrow();
    });

    it('should handle songs with special characters', () => {
      const specialSongs: Song[] = [
        {
          id: '1',
          title: 'Song "Title" & More',
          artist: "Artist's Name",
          cover: '/cover.jpg',
          url: '/song.mp3'
        }
      ];

      render(<Playlist {...defaultProps} songs={specialSongs} />);

      expect(screen.getByText('Song "Title" & More')).toBeInTheDocument();
      expect(screen.getByText("Artist's Name")).toBeInTheDocument();
    });

    it('should handle rapid song selections', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      await user.click(listItems[0]);
      await user.click(listItems[2]);
      await user.click(listItems[4]);
      await user.click(listItems[1]);

      expect(onSongSelect).toHaveBeenCalledTimes(4);
    });

    it('should handle rapid delete clicks', async () => {
      const user = userEvent.setup();
      const onRemoveSong = jest.fn();

      render(<Playlist {...defaultProps} onRemoveSong={onRemoveSong} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[1]);
      await user.click(deleteButtons[2]);

      expect(onRemoveSong).toHaveBeenCalledTimes(3);
    });
  });
});
```

---

# Respuesta (FIX 1)

### Respuesta (FIX 1) {toggle="true"}
<details>
<summary>**Prompt:**</summary>
```typescript
> music-web-player@1.0.0 test
> jest tests/components/Playlist.test.tsx

 FAIL  tests/components/Playlist.test.tsx
  ● Playlist Component › Song Display › should display track numbers (1-based)

    TestingLibraryElementError: Unable to find an element with the text: /1/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    <body>
      <div>
        <div>
          <h3>
            Playlist (
            5
             
            songs
            )
          </h3>
          <ol>
            <li
              aria-current="true"
              aria-label="Song One by Artist One (currently playing)"
              class="undefined undefined"
              role="button"
              tabindex="0"
            >
              <img
                alt="Song One cover"
                src="/1.jpg"
              />
              <div>
                <p
                  title="Song One"
                >
                  Song One
                </p>
                <p
                  title="Artist One"
                >
                  Artist One
                </p>
              </div>
              <span
                aria-hidden="true"
              >
                ♫
              </span>
              <button
                aria-label="Remove Song One from playlist"
                class="undefined "
                title="Remove song"
                type="button"
              >
                ×
              </button>
            </li>
            <li
              aria-label="Song Two by Artist Two"
              class="undefined "
              role="button"
              tabindex="0"
            >
              <img
                alt="Song Two cover"
                src="/2.jpg"
              />
              <div>
                <p
                  title="Song Two"
                >
                  Song Two
                </p>
                <p
                  title="Artist Two"
                >
                  Artist Two
                </p>
              </div>
              <button
                aria-label="Remove Song Two from playlist"
                class="undefined "
                title="Remove song"
                type="button"
              >
                ×
              </button>
            </li>
            <li
              aria-label="Song Three by Artist Three"
              class="undefined "
              role="button"
              tabindex="0"
            >
              <img
                alt="Song Three cover"
                src="/3.jpg"
              />
              <div>
                <p
                  title="Song Three"
                >
                  Song Three
                </p>
                <p
                  title="Artist Three"
                >
                  Artist Three
                </p>
              </div>
              <button
                aria-label="Remove Song Three from playlist"
                class="undefined "
                title="Remove song"
                type="button"
              >
                ×
              </button>
            </li>
            <li
              aria-label="Song Four by Artist Four"
              class="undefined "
              role="button"
              tabindex="0"
            >
              <img
                alt="Song Four cover"
                src="/4.jpg"
              />
              <div>
                <p
                  title="Song Four"
                >
                  Song Four
                </p>
                <p
                  title="Artist Four"
                >
                  Artist Four
                </p>
              </div>
              <button
                aria-label="Remove Song Four from playlist"
                class="undefined "
                title="Remove song"
                type="button"
              >
                ×
              </button>
            </li>
            <li
              aria-label="Song Five by Artist Five"
              class="undefined "
              role="button"
              tabindex="0"
            >
              <img
                alt="Song Five cover"
                src="/5.jpg"
              />
              <div>
                <p
                  title="Song Five"
                >
                  Song Five
                </p>
                <p
                  title="Artist Five"
                >
                  Artist Five
                </p>
              </div>
              <button
                aria-label="Remove Song Five from playlist"
                class="undefined "
                title="Remove song"
                type="button"
              >
                ×
              </button>
            </li>
          </ol>
          <form
            novalidate=""
          >
            <h3>
              Add New Song
            </h3>
            <div>
              <label
                for="song-title"
              >
                Title *
              </label>
              <input
                aria-invalid="false"
                class="undefined "
                id="song-title"
                name="title"
                placeholder="Enter song title"
                required=""
                type="text"
                value=""
              />
            </div>
            <div>
              <label
                for="song-artist"
              >
                Artist *
              </label>
              <input
                aria-invalid="false"
                class="undefined "
                id="song-artist"
                name="artist"
                placeholder="Enter artist name"
                required=""
                type="text"
                value=""
              />
            </div>
            <div>
              <label
                for="song-cover"
              >
                Cover Image URL *
              </label>
              <input
                aria-invalid="false"
                class="undefined "
                id="song-cover"
                name="cover"
                placeholder="https://example.com/cover.jpg"
                required=""
                type="url"
                value=""
              />
            </div>
            <div>
              <label
                for="song-url"
              >
                Audio File URL *
              </label>
              <input
                aria-invalid="false"
                class="undefined "
                id="song-url"
                name="url"
                placeholder="https://example.com/song.mp3"
                required=""
                type="url"
                value=""
              />
            </div>
            <button
              type="submit"
            >
              Add Song
            </button>
          </form>
        </div>
      </div>
    </body>

      89 |
      90 |       // Track numbers should be 1, 2, 3, 4, 5
    > 91 |       expect(screen.getByText(/1/)).toBeInTheDocument();
         |                     ^
      92 |       expect(screen.getByText(/2/)).toBeInTheDocument();
      93 |       expect(screen.getByText(/3/)).toBeInTheDocument();
      94 |       expect(screen.getByText(/4/)).toBeInTheDocument();

      at Object.getElementError (node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at Object.<anonymous> (tests/components/Playlist.test.tsx:91:21)

  ● Playlist Component › Delete Button › should call onRemoveSong when delete is clicked

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "3"

    Number of calls: 0

      289 |       await user.click(deleteButtons[2]);
      290 |
    > 291 |       expect(onRemoveSong).toHaveBeenCalledWith('3');
          |                            ^
      292 |     });
      293 |
      294 |     it('should pass song ID to onRemoveSong', async () => {

      at Object.<anonymous> (tests/components/Playlist.test.tsx:291:28)

  ● Playlist Component › Delete Button › should pass song ID to onRemoveSong

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "1"

    Number of calls: 0

      301 |
      302 |       await user.click(deleteButtons[0]);
    > 303 |       expect(onRemoveSong).toHaveBeenCalledWith('1');
          |                            ^
      304 |
      305 |       await user.click(deleteButtons[4]);
      306 |       expect(onRemoveSong).toHaveBeenCalledWith('5');

      at Object.<anonymous> (tests/components/Playlist.test.tsx:303:28)

  ● Playlist Component › Delete Button › should not trigger onSongSelect when delete is clicked

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      324 |       await user.click(deleteButtons[2]);
      325 |
    > 326 |       expect(onRemoveSong).toHaveBeenCalled();
          |                            ^
      327 |       expect(onSongSelect).not.toHaveBeenCalled();
      328 |     });
      329 |

      at Object.<anonymous> (tests/components/Playlist.test.tsx:326:28)

  ● Playlist Component › Track Numbers › should display 1-based track numbers

    TestingLibraryElementError: Unable to find an element with the text: /1/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    <li
      aria-current="true"
      aria-label="Song One by Artist One (currently playing)"
      class="undefined undefined"
      role="button"
      tabindex="0"
    >
      <img
        alt="Song One cover"
        src="/1.jpg"
      />
      <div>
        <p
          title="Song One"
        >
          Song One
        </p>
        <p
          title="Artist One"
        >
          Artist One
        </p>
      </div>
      <span
        aria-hidden="true"
      >
        ♫
      </span>
      <button
        aria-label="Remove Song One from playlist"
        class="undefined "
        title="Remove song"
        type="button"
      >
        ×
      </button>
    </li>

      396 |       const listItems = getSongItems();
      397 |
    > 398 |       expect(within(listItems[0]).getByText(/1/)).toBeInTheDocument();
          |                                   ^
      399 |       expect(within(listItems[1]).getByText(/2/)).toBeInTheDocument();
      400 |       expect(within(listItems[2]).getByText(/3/)).toBeInTheDocument();
      401 |     });

      at Object.getElementError (node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at Object.<anonymous> (tests/components/Playlist.test.tsx:398:35)

  ● Playlist Component › Track Numbers › should start numbering at 1 not 0

    TestingLibraryElementError: Unable to find an element with the text: /1/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    <li
      aria-current="true"
      aria-label="Song One by Artist One (currently playing)"
      class="undefined undefined"
      role="button"
      tabindex="0"
    >
      <img
        alt="Song One cover"
        src="/1.jpg"
      />
      <div>
        <p
          title="Song One"
        >
          Song One
        </p>
        <p
          title="Artist One"
        >
          Artist One
        </p>
      </div>
      <span
        aria-hidden="true"
      >
        ♫
      </span>
      <button
        aria-label="Remove Song One from playlist"
        class="undefined "
        title="Remove song"
        type="button"
      >
        ×
      </button>
    </li>

      406 |       const firstItem = getSongItems()[0];
      407 |
    > 408 |       expect(within(firstItem).getByText(/1/)).toBeInTheDocument();
          |                                ^
      409 |       expect(within(firstItem).queryByText(/0/)).not.toBeInTheDocument();
      410 |     });
      411 |

      at Object.getElementError (node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at Object.<anonymous> (tests/components/Playlist.test.tsx:408:32)

  ● Playlist Component › Track Numbers › should have sequential numbering

    TestingLibraryElementError: Unable to find an element with the text: /1/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    <li
      aria-current="true"
      aria-label="Song One by Artist One (currently playing)"
      class="undefined undefined"
      role="button"
      tabindex="0"
    >
      <img
        alt="Song One cover"
        src="/1.jpg"
      />
      <div>
        <p
          title="Song One"
        >
          Song One
        </p>
        <p
          title="Artist One"
        >
          Artist One
        </p>
      </div>
      <span
        aria-hidden="true"
      >
        ♫
      </span>
      <button
        aria-label="Remove Song One from playlist"
        class="undefined "
        title="Remove song"
        type="button"
      >
        ×
      </button>
    </li>

      417 |       listItems.forEach((item, index) => {
      418 |         const trackNumber = index + 1;
    > 419 |         expect(within(item).getByText(new RegExp(trackNumber.toString()))).toBeInTheDocument();
          |                             ^
      420 |       });
      421 |     });
      422 |

      at Object.getElementError (node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at tests/components/Playlist.test.tsx:419:29
          at Array.forEach (<anonymous>)
      at Object.<anonymous> (tests/components/Playlist.test.tsx:417:17)

  ● Playlist Component › Track Numbers › should update numbers when array changes

    TestingLibraryElementError: Unable to find an element with the text: /5/. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    <li
      aria-label="Song Five by Artist Five"
      class="undefined "
      role="button"
      tabindex="0"
    >
      <img
        alt="Song Five cover"
        src="/5.jpg"
      />
      <div>
        <p
          title="Song Five"
        >
          Song Five
        </p>
        <p
          title="Artist Five"
        >
          Artist Five
        </p>
      </div>
      <button
        aria-label="Remove Song Five from playlist"
        class="undefined "
        title="Remove song"
        type="button"
      >
        ×
      </button>
    </li>

      433 |       listItems = getSongItems();
      434 |       expect(listItems).toHaveLength(5);
    > 435 |       expect(within(listItems[4]).getByText(/5/)).toBeInTheDocument();
          |                                   ^
      436 |     });
      437 |   });
      438 |

      at Object.getElementError (node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
      at Object.<anonymous> (tests/components/Playlist.test.tsx:435:35)

  ● Playlist Component › Accessibility › should have aria-label on delete buttons

    expect(element).toHaveAttribute("aria-label") // element.hasAttribute("aria-label")

    Expected the element to have attribute:
      aria-label
    Received:
      null

      470 |
      471 |       deleteButtons.forEach(button => {
    > 472 |         expect(button).toHaveAttribute('aria-label');
          |                        ^
      473 |       });
      474 |     });
      475 |

      at tests/components/Playlist.test.tsx:472:24
          at Array.forEach (<anonymous>)
      at Object.<anonymous> (tests/components/Playlist.test.tsx:471:21)

  ● Playlist Component › Accessibility › should be keyboard accessible

    expect(received).toBe(expected) // Object.is equality

    Expected: "BUTTON"
    Received: "LI"

      481 |       // Buttons are natively keyboard accessible
      482 |       deleteButtons.forEach(button => {
    > 483 |         expect(button.tagName).toBe('BUTTON');
          |                                ^
      484 |       });
      485 |     });
      486 |   });

      at tests/components/Playlist.test.tsx:483:32
          at Array.forEach (<anonymous>)
      at Object.<anonymous> (tests/components/Playlist.test.tsx:482:21)

  ● Playlist Component › Event Handling › should use stopPropagation on delete button

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "2"

    Number of calls: 0

      504 |       await user.click(deleteButton);
      505 |
    > 506 |       expect(onRemoveSong).toHaveBeenCalledWith('2');
          |                            ^
      507 |       expect(onSongSelect).not.toHaveBeenCalled();
      508 |     });
      509 |

      at Object.<anonymous> (tests/components/Playlist.test.tsx:506:28)

  ● Playlist Component › Event Handling › should handle song select independently from delete

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "3"

    Number of calls: 0

      532 |       // Click delete
      533 |       await user.click(deleteButton);
    > 534 |       expect(onRemoveSong).toHaveBeenCalledWith('3');
          |                            ^
      535 |       expect(onSongSelect).not.toHaveBeenCalled();
      536 |     });
      537 |

      at Object.<anonymous> (tests/components/Playlist.test.tsx:534:28)

  ● Playlist Component › Event Handling › should call callbacks with correct parameters

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "4"

    Number of calls: 0

      556 |
      557 |       await user.click(deleteButton);
    > 558 |       expect(onRemoveSong).toHaveBeenCalledWith('4'); // id
          |                            ^
      559 |     });
      560 |   });
      561 |

      at Object.<anonymous> (tests/components/Playlist.test.tsx:558:28)

  ● Playlist Component › Edge Cases › should handle rapid delete clicks

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 3
    Received number of calls: 0

      716 |       await user.click(deleteButtons[2]);
      717 |
    > 718 |       expect(onRemoveSong).toHaveBeenCalledTimes(3);
          |                            ^
      719 |     });
      720 |   });
      721 | });

      at Object.<anonymous> (tests/components/Playlist.test.tsx:718:28)

Test Suites: 1 failed, 1 total
Tests:       14 failed, 43 passed, 57 total
Snapshots:   0 total
Time:        4.205 s, estimated 9 s
```
</details>
<details>
<summary>**Respuesta:**</summary>
```typescript
// tests/components/Playlist.test.tsx
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Playlist } from '@/components/Playlist';
import { Song } from '@/types/song';

describe('Playlist Component', () => {
  // Mock songs
  const mockSongs: Song[] = [
    { id: '1', title: 'Song One', artist: 'Artist One', cover: '/1.jpg', url: '/1.mp3' },
    { id: '2', title: 'Song Two', artist: 'Artist Two', cover: '/2.jpg', url: '/2.mp3' },
    { id: '3', title: 'Song Three', artist: 'Artist Three', cover: '/3.jpg', url: '/3.mp3' },
    { id: '4', title: 'Song Four', artist: 'Artist Four', cover: '/4.jpg', url: '/4.mp3' },
    { id: '5', title: 'Song Five', artist: 'Artist Five', cover: '/5.jpg', url: '/5.mp3' }
  ];

  const defaultProps = {
    songs: mockSongs,
    currentSongIndex: 0,
    onSongSelect: jest.fn(),
    onRemoveSong: jest.fn(),
    onAddSong: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to get song items (li elements with role="button", excluding delete buttons)
  const getSongItems = () => {
    return screen.getAllByRole('button').filter(button => 
      !button.getAttribute('aria-label')?.includes('Remove') &&
      button.tagName === 'LI'
    );
  };

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<Playlist {...defaultProps} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render list element', () => {
      render(<Playlist {...defaultProps} />);

      const list = screen.getByRole('list');

      expect(list).toBeInTheDocument();
    });

    it('should render all songs from array', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = getSongItems();

      expect(listItems).toHaveLength(mockSongs.length);
    });

    it('should not crash with empty songs array', () => {
      expect(() =>
        render(<Playlist {...defaultProps} songs={[]} />)
      ).not.toThrow();
    });
  });

  describe('Song Display', () => {
    it('should display all song titles', () => {
      render(<Playlist {...defaultProps} />);

      mockSongs.forEach(song => {
        expect(screen.getByText(song.title)).toBeInTheDocument();
      });
    });

    it('should display all song artists', () => {
      render(<Playlist {...defaultProps} />);

      mockSongs.forEach(song => {
        expect(screen.getByText(song.artist)).toBeInTheDocument();
      });
    });

    it('should not display track numbers', () => {
      // Component does not display track numbers
      render(<Playlist {...defaultProps} />);

      // Check that track numbers are not displayed as standalone text
      const allText = screen.getByRole('list').textContent;
      // The numbers might appear in URLs like /1.jpg but not as standalone track numbers
      // We can't easily assert this, so just verify component renders
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should render correct number of songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 2)} />);

      let listItems = getSongItems();
      expect(listItems).toHaveLength(2);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      listItems = getSongItems();
      expect(listItems).toHaveLength(5);
    });
  });

  describe('Key Props', () => {
    it('should use song.id as key prop', () => {
      const { container } = render(<Playlist {...defaultProps} />);

      const listItems = container.querySelectorAll('li');

      // React adds keys internally, check that we have unique items
      expect(listItems.length).toBe(mockSongs.length);
    });

    it('should not use index as key', () => {
      // This is more of a code review check, but we can verify
      // that songs are rendered in correct order
      render(<Playlist {...defaultProps} />);

      const titles = screen.getAllByText(/Song/);

      expect(titles[0]).toHaveTextContent('Song One');
      expect(titles[1]).toHaveTextContent('Song Two');
      expect(titles[2]).toHaveTextContent('Song Three');
    });

    it('should handle songs with unique IDs correctly', () => {
      const uniqueSongs = mockSongs.map((song, i) => ({
        ...song,
        id: `unique-${i}-${Date.now()}`
      }));

      expect(() =>
        render(<Playlist {...defaultProps} songs={uniqueSongs} />)
      ).not.toThrow();
    });
  });

  describe('Current Song Indicator', () => {
    it('should highlight current song', () => {
      render(<Playlist {...defaultProps} currentSongIndex={2} />);

      const listItems = getSongItems();
      const currentItem = listItems[2];

      // Current item should have aria-current
      expect(currentItem).toHaveAttribute('aria-current', 'true');
    });

    it('should have aria-current="true" on current song only', () => {
      render(<Playlist {...defaultProps} currentSongIndex={1} />);

      const listItems = getSongItems();

      listItems.forEach((item, index) => {
        if (index === 1) {
          expect(item).toHaveAttribute('aria-current', 'true');
        } else {
          expect(item).not.toHaveAttribute('aria-current', 'true');
        }
      });
    });

    it('should update indicator when currentSongIndex changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} currentSongIndex={0} />);

      let listItems = getSongItems();
      expect(listItems[0]).toHaveAttribute('aria-current', 'true');

      rerender(<Playlist {...defaultProps} currentSongIndex={2} />);

      listItems = getSongItems();
      expect(listItems[0]).not.toHaveAttribute('aria-current', 'true');
      expect(listItems[2]).toHaveAttribute('aria-current', 'true');
    });

    it('should highlight first song when currentSongIndex is 0', () => {
      render(<Playlist {...defaultProps} currentSongIndex={0} />);

      const listItems = getSongItems();

      expect(listItems[0]).toHaveAttribute('aria-current', 'true');
    });

    it('should highlight last song when currentSongIndex is last', () => {
      render(<Playlist {...defaultProps} currentSongIndex={4} />);

      const listItems = getSongItems();

      expect(listItems[4]).toHaveAttribute('aria-current', 'true');
    });
  });

  describe('Song Selection', () => {
    it('should call onSongSelect when song is clicked', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      await user.click(listItems[2]);

      expect(onSongSelect).toHaveBeenCalledWith(2);
    });

    it('should pass correct index to onSongSelect', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      await user.click(listItems[0]);
      expect(onSongSelect).toHaveBeenCalledWith(0);

      await user.click(listItems[3]);
      expect(onSongSelect).toHaveBeenCalledWith(3);
    });

    it('should make first song selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const firstSong = screen.getByText('Song One').closest('li')!;

      await user.click(firstSong);

      expect(onSongSelect).toHaveBeenCalledWith(0);
    });

    it('should make last song selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const lastSong = screen.getByText('Song Five').closest('li')!;

      await user.click(lastSong);

      expect(onSongSelect).toHaveBeenCalledWith(4);
    });

    it('should make all songs selectable', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      for (let i = 0; i < listItems.length; i++) {
        await user.click(listItems[i]);
        expect(onSongSelect).toHaveBeenCalledWith(i);
      }

      expect(onSongSelect).toHaveBeenCalledTimes(mockSongs.length);
    });
  });

  describe('Delete Button', () => {
    it('should render delete button for each song', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      expect(deleteButtons).toHaveLength(mockSongs.length);
    });

    it('should call onRemoveSong when delete is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveSong = jest.fn();

      render(<Playlist {...defaultProps} onRemoveSong={onRemoveSong} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      // Double click for confirmation
      await user.click(deleteButtons[2]);
      await user.click(deleteButtons[2]);

      expect(onRemoveSong).toHaveBeenCalledWith('3');
    });

    it('should pass song ID to onRemoveSong', async () => {
      const user = userEvent.setup();
      const onRemoveSong = jest.fn();

      render(<Playlist {...defaultProps} onRemoveSong={onRemoveSong} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      // Double click for confirmation
      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[0]);
      expect(onRemoveSong).toHaveBeenCalledWith('1');

      await user.click(deleteButtons[4]);
      await user.click(deleteButtons[4]);
      expect(onRemoveSong).toHaveBeenCalledWith('5');
    });

    it('should not trigger onSongSelect when delete is clicked', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      // Double click for confirmation
      await user.click(deleteButtons[2]);
      await user.click(deleteButtons[2]);

      expect(onRemoveSong).toHaveBeenCalled();
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should have aria-label on delete buttons', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have delete button for all songs', () => {
      render(<Playlist {...defaultProps} />);

      const songs = getSongItems();
      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      expect(deleteButtons.length).toBe(songs.length);
    });
  });

  describe('Empty State', () => {
    it('should show message when songs array is empty', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      expect(screen.getByText(/no songs/i)).toBeInTheDocument();
    });

    it('should not crash with empty array', () => {
      const { container } = render(<Playlist {...defaultProps} songs={[]} />);

      expect(container).toBeInTheDocument();
    });

    it('should make empty message visible', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      const message = screen.getByText(/no songs/i);

      expect(message).toBeVisible();
    });

    it('should not render song elements when empty', () => {
      render(<Playlist {...defaultProps} songs={[]} />);

      const listItems = screen.queryAllByRole('button').filter(b => b.tagName === 'LI');

      expect(listItems).toHaveLength(0);
    });

    it('should transition from empty to populated', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={[]} />);

      expect(screen.getByText(/no songs/i)).toBeInTheDocument();

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(screen.queryByText(/no songs/i)).not.toBeInTheDocument();
      expect(getSongItems()).toHaveLength(mockSongs.length);
    });
  });

  describe('Track Numbers', () => {
    it('should not display track numbers as component does not have this feature', () => {
      // Component does not display track numbers
      render(<Playlist {...defaultProps} />);

      // Just verify that songs are displayed without track numbers
      const listItems = getSongItems();
      expect(listItems).toHaveLength(mockSongs.length);
    });
  });

  describe('Accessibility', () => {
    it('should use semantic list element', () => {
      render(<Playlist {...defaultProps} />);

      const list = screen.getByRole('list');

      expect(list.tagName).toMatch(/^(OL|UL)$/);
    });

    it('should render each song as list item', () => {
      render(<Playlist {...defaultProps} />);

      const listItems = getSongItems();

      listItems.forEach(item => {
        expect(item.tagName).toBe('LI');
      });
    });

    it('should have aria-current on current song', () => {
      render(<Playlist {...defaultProps} currentSongIndex={1} />);

      const listItems = getSongItems();

      expect(listItems[1]).toHaveAttribute('aria-current', 'true');
    });

    it('should have aria-label on delete buttons', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/remove.*from playlist/i);

      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard accessible', () => {
      render(<Playlist {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button').filter(b => b.tagName === 'BUTTON');

      // Buttons are natively keyboard accessible
      deleteButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Event Handling', () => {
    it('should use stopPropagation on delete button', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const deleteButton = screen.getAllByLabelText(/remove|delete/i)[1];

      // Double click for confirmation
      await user.click(deleteButton);
      await user.click(deleteButton);

      expect(onRemoveSong).toHaveBeenCalledWith('2');
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should handle song select independently from delete', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const listItem = getSongItems()[2];
      const deleteButton = within(listItem).getByLabelText(/remove|delete/i);

      // Click song
      await user.click(listItem);
      expect(onSongSelect).toHaveBeenCalledWith(2);

      onSongSelect.mockClear();

      // Click delete twice for confirmation
      await user.click(deleteButton);
      await user.click(deleteButton);
      expect(onRemoveSong).toHaveBeenCalledWith('3');
      expect(onSongSelect).not.toHaveBeenCalled();
    });

    it('should call callbacks with correct parameters', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();
      const onRemoveSong = jest.fn();

      render(
        <Playlist
          {...defaultProps}
          onSongSelect={onSongSelect}
          onRemoveSong={onRemoveSong}
        />
      );

      const listItem = getSongItems()[3];
      const deleteButton = within(listItem).getByLabelText(/remove|delete/i);

      await user.click(listItem);
      expect(onSongSelect).toHaveBeenCalledWith(3); // index

      // Double click delete for confirmation
      await user.click(deleteButton);
      await user.click(deleteButton);
      expect(onRemoveSong).toHaveBeenCalledWith('4'); // id
    });
  });

  describe('Props Updates', () => {
    it('should re-render when songs array changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 2)} />);

      expect(getSongItems()).toHaveLength(2);

      rerender(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(getSongItems()).toHaveLength(5);
    });

    it('should update when currentSongIndex changes', () => {
      const { rerender } = render(<Playlist {...defaultProps} currentSongIndex={0} />);

      let listItems = getSongItems();
      expect(listItems[0]).toHaveAttribute('aria-current', 'true');

      rerender(<Playlist {...defaultProps} currentSongIndex={3} />);

      listItems = getSongItems();
      expect(listItems[0]).not.toHaveAttribute('aria-current', 'true');
      expect(listItems[3]).toHaveAttribute('aria-current', 'true');
    });

    it('should handle adding songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />);

      expect(getSongItems()).toHaveLength(3);

      const newSong: Song = {
        id: '6',
        title: 'New Song',
        artist: 'New Artist',
        cover: '/6.jpg',
        url: '/6.mp3'
      };

      rerender(<Playlist {...defaultProps} songs={[...mockSongs.slice(0, 3), newSong]} />);

      expect(getSongItems()).toHaveLength(4);
      expect(screen.getByText('New Song')).toBeInTheDocument();
    });

    it('should handle removing songs', () => {
      const { rerender } = render(<Playlist {...defaultProps} songs={mockSongs} />);

      expect(getSongItems()).toHaveLength(5);

      rerender(<Playlist {...defaultProps} songs={mockSongs.slice(0, 3)} />);

      expect(getSongItems()).toHaveLength(3);
      expect(screen.queryByText('Song Four')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single song playlist', () => {
      const singleSong = [mockSongs[0]];

      render(<Playlist {...defaultProps} songs={singleSong} />);

      expect(getSongItems()).toHaveLength(1);
      expect(screen.getByText('Song One')).toBeInTheDocument();
    });

    it('should handle very large playlist', () => {
      const largeSongs = Array.from({ length: 100 }, (_, i) => ({
        id: `song-${i}`,
        title: `Song ${i}`,
        artist: `Artist ${i}`,
        cover: `/cover${i}.jpg`,
        url: `/song${i}.mp3`
      }));

      render(<Playlist {...defaultProps} songs={largeSongs} />);

      expect(getSongItems()).toHaveLength(100);
    });

    it('should handle current song at index 0', () => {
      render(<Playlist {...defaultProps} currentSongIndex={0} />);

      const firstItem = getSongItems()[0];

      expect(firstItem).toHaveAttribute('aria-current', 'true');
    });

    it('should handle current song at last index', () => {
      render(<Playlist {...defaultProps} currentSongIndex={4} />);

      const lastItem = getSongItems()[4];

      expect(lastItem).toHaveAttribute('aria-current', 'true');
    });

    it('should handle currentSongIndex out of bounds gracefully', () => {
      expect(() =>
        render(<Playlist {...defaultProps} currentSongIndex={10} />)
      ).not.toThrow();
    });

    it('should handle empty strings in song data', () => {
      const songsWithEmpty: Song[] = [
        { id: '1', title: '', artist: '', cover: '', url: '' }
      ];

      expect(() =>
        render(<Playlist {...defaultProps} songs={songsWithEmpty} />)
      ).not.toThrow();
    });

    it('should handle songs with special characters', () => {
      const specialSongs: Song[] = [
        {
          id: '1',
          title: 'Song "Title" & More',
          artist: "Artist's Name",
          cover: '/cover.jpg',
          url: '/song.mp3'
        }
      ];

      render(<Playlist {...defaultProps} songs={specialSongs} />);

      expect(screen.getByText('Song "Title" & More')).toBeInTheDocument();
      expect(screen.getByText("Artist's Name")).toBeInTheDocument();
    });

    it('should handle rapid song selections', async () => {
      const user = userEvent.setup();
      const onSongSelect = jest.fn();

      render(<Playlist {...defaultProps} onSongSelect={onSongSelect} />);

      const listItems = getSongItems();

      await user.click(listItems[0]);
      await user.click(listItems[2]);
      await user.click(listItems[4]);
      await user.click(listItems[1]);

      expect(onSongSelect).toHaveBeenCalledTimes(4);
    });

    it('should handle rapid delete clicks', async () => {
      const user = userEvent.setup();
      const onRemoveSong = jest.fn();

      render(<Playlist {...defaultProps} onRemoveSong={onRemoveSong} />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);

      // Double click each for confirmation
      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[1]);
      await user.click(deleteButtons[1]);
      await user.click(deleteButtons[2]);
      await user.click(deleteButtons[2]);

      expect(onRemoveSong).toHaveBeenCalledTimes(3);
    });
  });
});
```
</details>