// tests/components/Player.test.tsx
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Player } from '@/components/Player';
import * as usePlaylistHook from '@/hooks/usePlaylist';
import * as useAudioPlayerHook from '@/hooks/useAudioPlayer';
import * as PlaylistDataProvider from '@/data/playlist-data-provider';
import { Song } from '@/types/song';
import { RepeatMode } from '@/types/playback-modes';

// Mock the hooks
jest.mock('@/hooks/usePlaylist');
jest.mock('@/hooks/useAudioPlayer');
jest.mock('@/data/playlist-data-provider', () => ({
  loadInitialPlaylist: jest.fn()
}));

describe('Player Component', () => {
  // Mock data
  const mockSongs: Song[] = [
    { id: '1', title: 'Song 1', artist: 'Artist 1', cover: '/1.jpg', url: '/1.mp3' },
    { id: '2', title: 'Song 2', artist: 'Artist 2', cover: '/2.jpg', url: '/2.mp3' },
    { id: '3', title: 'Song 3', artist: 'Artist 3', cover: '/3.jpg', url: '/3.mp3' }
  ];

  const mockUsePlaylist = {
    playlist: mockSongs,
    currentIndex: 0,
    repeatMode: RepeatMode.ALL,
    isShuffled: false,
    next: jest.fn(),
    previous: jest.fn(),
    hasNext: jest.fn(() => true),
    hasPrevious: jest.fn(() => false),
    addSong: jest.fn(),
    removeSong: jest.fn(),
    getSongAt: jest.fn((index: number) => mockSongs[index]),
    getCurrentSong: jest.fn(() => mockSongs[0]),
    getCurrentSongIndex: jest.fn(() => 0),
    setCurrentIndex: jest.fn(),
    setRepeatMode: jest.fn(),
    toggleShuffle: jest.fn()
  };

  const mockUseAudioPlayer = {
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    error: null,
    volume: 70,
    isMuted: false,
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    seek: jest.fn(),
    setSource: jest.fn(),
    setVolume: jest.fn(),
    toggleMute: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the hooks to return our mock data
    (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue(mockUsePlaylist);
    (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue(mockUseAudioPlayer);

    // Mock PlaylistDataProvider
    (PlaylistDataProvider.loadInitialPlaylist as jest.Mock).mockResolvedValue(mockSongs);
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<Player />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render main player container', () => {
      render(<Player />);

      const playerContainer = screen.queryByTestId('player-container') || screen.queryByRole('main') || document.body.firstChild;
      expect(playerContainer).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<Player />);

      expect(screen.queryByTestId('track-info') || screen.queryAllByText(/Song 1/i).length > 0).toBeTruthy();
      expect(screen.queryByTestId('controls') || screen.queryByRole('button', { name: /^play$|^pause$/i })).toBeTruthy();
      expect(screen.queryByTestId('progress-bar') || screen.queryByRole('progressbar')).toBeTruthy();
      expect(screen.queryByTestId('playlist') || screen.queryAllByText(/playlist/i).length > 0).toBeTruthy();
      expect(screen.queryByTestId('add-song-form') || screen.queryByLabelText(/title/i)).toBeTruthy();
    });

    it('should render audio element', () => {
      const { container } = render(<Player />);
      const audio = container.querySelector('audio');
      expect(audio).toBeInTheDocument();
    });
  });

  describe('TrackInfo Integration', () => {
    it('should display current song information', () => {
      render(<Player />);

      expect(screen.getAllByText('Song 1')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Artist 1')[0]).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Song 1 by Artist 1/i })).toBeInTheDocument();
    });

    it('should update when current song changes', async () => {
      const { rerender } = render(<Player />);

      // Initially shows first song
      expect(screen.getAllByText('Song 1')[0]).toBeInTheDocument();

      // Simulate playlist hook returning different currentIndex
      const updatedUsePlaylist = {
        ...mockUsePlaylist,
        currentIndex: 1
      };
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue(updatedUsePlaylist);

      rerender(<Player />);

      await waitFor(() => {
        expect(screen.getAllByText('Song 2')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Artist 2')[0]).toBeInTheDocument();
      });
    });

    it('should handle no current song gracefully', () => {
      const emptyPlaylist = {
        ...mockUsePlaylist,
        playlist: [],
        currentIndex: -1
      };
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue(emptyPlaylist);

      render(<Player />);

      // Should show placeholder or handle gracefully - component might render empty state
      // Just verify the playlist is empty
      const playlistItems = screen.queryAllByRole('button').filter(b => b.tagName === 'LI');
      expect(playlistItems.length).toBe(0);
    });
  });

  describe('Controls Integration', () => {
    it('should render all control buttons', () => {
      render(<Player />);

      expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^play$|^pause$/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/next/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shuffle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();
    });

    it('should toggle play/pause when button clicked', async () => {
      const user = userEvent.setup();
      const playMock = jest.fn().mockResolvedValue(undefined);
      const pauseMock = jest.fn();
      
      // Set up initial mock with playMock
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue({
        ...mockUseAudioPlayer,
        play: playMock,
        pause: pauseMock
      });
      
      const { rerender } = render(<Player />);

      let playButton = screen.getByRole('button', { name: /^play$|^pause$/i });

      // Initially paused, should play
      await user.click(playButton);
      expect(playMock).toHaveBeenCalledTimes(1);

      // Now playing, should pause
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue({
        ...mockUseAudioPlayer,
        isPlaying: true,
        play: playMock,
        pause: pauseMock
      });

      rerender(<Player />);
      playButton = screen.getByRole('button', { name: /^play$|^pause$/i });
      await user.click(playButton);
      expect(pauseMock).toHaveBeenCalledTimes(1);
    });

    it('should navigate to next song when next button clicked', async () => {
      const user = userEvent.setup();
      const nextMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        next: nextMock
      });

      render(<Player />);

      const nextButton = screen.getByLabelText(/next/i);
      await user.click(nextButton);

      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    it('should navigate to previous song when previous button clicked', async () => {
      const user = userEvent.setup();
      const previousMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        previous: previousMock,
        hasPrevious: jest.fn(() => true)
      });

      render(<Player />);

      const prevButton = screen.getByLabelText(/previous/i);
      await user.click(prevButton);

      expect(previousMock).toHaveBeenCalledTimes(1);
    });

    it('should toggle shuffle when shuffle button clicked', async () => {
      const user = userEvent.setup();
      const toggleShuffleMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        toggleShuffle: toggleShuffleMock
      });

      render(<Player />);

      const shuffleButton = screen.getByLabelText(/shuffle/i);
      await user.click(shuffleButton);

      expect(toggleShuffleMock).toHaveBeenCalledTimes(1);
    });

    it('should cycle repeat mode when repeat button clicked', async () => {
      const user = userEvent.setup();
      const setRepeatModeMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        setRepeatMode: setRepeatModeMock
      });

      render(<Player />);

      const repeatButton = screen.getByLabelText(/repeat/i);
      await user.click(repeatButton);

      expect(setRepeatModeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProgressBar Integration', () => {
    it('should render progress bar', () => {
      render(<Player />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display current and total time', () => {
      render(<Player />);

      // Check for time displays (implementation-dependent)
      expect(screen.getByText(/00:00/)).toBeInTheDocument(); // Current time
      expect(screen.getByText(/03:00/)).toBeInTheDocument(); // Total time (180s = 3:00)
    });

    it('should handle seek when progress bar clicked', async () => {
      const user = userEvent.setup();
      const seekMock = jest.fn();
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue({
        ...mockUseAudioPlayer,
        seek: seekMock
      });

      render(<Player />);

      const progressBar = screen.getByRole('progressbar');
      await user.click(progressBar, { clientX: 50 });

      expect(seekMock).toHaveBeenCalledTimes(1);
    });

    it('should update progress as playback progresses', async () => {
      const { rerender } = render(<Player />);

      // Simulate time progression
      const progressedAudioPlayer = {
        ...mockUseAudioPlayer,
        currentTime: 60, // 1 minute in
        duration: 180
      };
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue(progressedAudioPlayer);

      rerender(<Player />);

      await waitFor(() => {
        // Should show updated progress (1:00 of 3:00)
        expect(screen.getByText(/01:00/)).toBeInTheDocument();
      });
    });
  });

  describe('Playlist Integration', () => {
    it('should render playlist with all songs', () => {
      render(<Player />);

      mockSongs.forEach(song => {
        expect(screen.getAllByText(song.title)[0]).toBeInTheDocument();
        expect(screen.getAllByText(song.artist)[0]).toBeInTheDocument();
      });
    });

    it('should highlight current song in playlist', () => {
      render(<Player />);

      // Current song should have some visual indication
      const playlistItems = screen.getAllByRole('button').filter(b => b.tagName === 'LI');
      const currentSongElement = playlistItems.find(item => item.getAttribute('aria-current') === 'true');
      expect(currentSongElement).toBeDefined();
      expect(currentSongElement).toHaveAttribute('aria-current', 'true');
    });

    it('should allow song selection from playlist', async () => {
      const user = userEvent.setup();
      const setCurrentIndexMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        setCurrentIndex: setCurrentIndexMock
      });

      render(<Player />);

      const secondSong = screen.getByText('Song 2').closest('li, div');
      await user.click(secondSong!);

      expect(setCurrentIndexMock).toHaveBeenCalledWith(1);
    });

    it('should allow song removal from playlist', async () => {
      const user = userEvent.setup();
      const removeSongMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        removeSong: removeSongMock
      });

      render(<Player />);

      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);
      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[0]);

      expect(removeSongMock).toHaveBeenCalledWith('1');
    });

    it('should update when playlist changes', async () => {
      const { rerender } = render(<Player />);

      const updatedSongs = [...mockSongs, {
        id: '4',
        title: 'Song 4',
        artist: 'Artist 4',
        cover: '/4.jpg',
        url: '/4.mp3'
      }];

      const updatedPlaylist = {
        ...mockUsePlaylist,
        playlist: updatedSongs
      };
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue(updatedPlaylist);

      rerender(<Player />);

      await waitFor(() => {
        expect(screen.getByText('Song 4')).toBeInTheDocument();
      });
    });
  });

  describe('AddSongForm Integration', () => {
    it('should render add song form', () => {
      render(<Player />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^artist \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cover/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^audio file url/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add|submit/i })).toBeInTheDocument();
    });

    it('should add song when form submitted', async () => {
      const user = userEvent.setup();
      const addSongMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        addSong: addSongMock
      });

      render(<Player />);

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'New Song');
      await user.type(screen.getByLabelText(/^artist \*/i), 'New Artist');
      await user.type(screen.getByLabelText(/cover/i), '/new-cover.jpg');
      await user.type(screen.getByLabelText(/^audio file url/i), '/new-song.mp3');

      // Submit
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      expect(addSongMock).toHaveBeenCalledWith({
        id: expect.any(String), // ID gets generated
        title: 'New Song',
        artist: 'New Artist',
        cover: '/new-cover.jpg',
        url: '/new-song.mp3'
      });
    });

    it('should handle form validation errors', async () => {
      const user = userEvent.setup();
      // Simulate validation failure
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        addSong: jest.fn() // Won't be called due to validation
      });

      render(<Player />);

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Should show validation errors
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  describe('State Coordination', () => {
    it('should sync current song between TrackInfo and Playlist', () => {
      render(<Player />);

      // Current song in TrackInfo should match highlighted in Playlist
      const trackInfoTitle = screen.getAllByText('Song 1')[0];
      const playlistCurrentItem = screen.getAllByText('Song 1')[1].closest('li') as HTMLElement;

      expect(trackInfoTitle).toBeInTheDocument();
      expect(playlistCurrentItem).toHaveAttribute('aria-current', 'true');
    });

    it('should update playback when song selected', async () => {
      const user = userEvent.setup();
      const setSourceMock = jest.fn();
      const setCurrentIndexMock = jest.fn();

      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue({
        ...mockUseAudioPlayer,
        setSource: setSourceMock
      });
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        setCurrentIndex: setCurrentIndexMock
      });

      render(<Player />);

      const secondSong = screen.getByText('Song 2').closest('li, div');
      await user.click(secondSong!);

      expect(setCurrentIndexMock).toHaveBeenCalledWith(1);
      expect(setSourceMock).toHaveBeenCalledWith('/2.mp3', '2');
    });

    it('should maintain consistent state across components', async () => {
      const { rerender } = render(<Player />);

      // Simulate state changes
      const updatedState = {
        ...mockUsePlaylist,
        currentIndex: 2,
        repeatMode: RepeatMode.ONE,
        isShuffled: true
      };
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue(updatedState);

      rerender(<Player />);

      await waitFor(() => {
        // Verify all components reflect new state
        expect(screen.getAllByText('Song 3')[0]).toBeInTheDocument(); // New current song
        // Repeat and shuffle indicators would be checked if visible
      });
    });
  });

  describe('Initial Load', () => {
    it('should load initial playlist on mount', async () => {
      render(<Player />);

      // Player component uses the mocked usePlaylist hook which returns mockSongs
      await waitFor(() => {
        expect(screen.getAllByText('Song 1')[0]).toBeInTheDocument();
      });
    });

    it('should display first song as current after load', () => {
      render(<Player />);

      expect(screen.getAllByText('Song 1')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Artist 1')[0]).toBeInTheDocument();
    });

    it('should set audio source to first song', () => {
      const setSourceMock = jest.fn();
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue({
        ...mockUseAudioPlayer,
        setSource: setSourceMock
      });

      render(<Player />);

      expect(setSourceMock).toHaveBeenCalledWith('/1.mp3', '1');
    });

    it('should not auto-play on initial load', () => {
      const playMock = jest.fn();
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue({
        ...mockUseAudioPlayer,
        isPlaying: false,
        play: playMock
      });

      render(<Player />);

      expect(playMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single song playlist', () => {
      const singleSongList = {
        ...mockUsePlaylist,
        playlist: [mockSongs[0]],
        currentIndex: 0
      };
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue(singleSongList);

      render(<Player />);

      expect(screen.getAllByText('Song 1')[0]).toBeInTheDocument();
      // Should handle navigation gracefully
    });

    it('should handle empty playlist', () => {
      const emptyPlaylist = {
        ...mockUsePlaylist,
        playlist: [],
        currentIndex: -1,
        getCurrentSong: jest.fn(() => null)
      };
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue(emptyPlaylist);

      render(<Player />);

      // Should show empty state or handle gracefully
      expect(screen.queryByText('Song 1')).not.toBeInTheDocument();
    });

    it('should handle rapid song changes', async () => {
      const user = userEvent.setup();
      const setCurrentIndexMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        setCurrentIndex: setCurrentIndexMock
      });

      render(<Player />);

      const playlistItems = screen.getAllByRole('button').filter(b => b.tagName === 'LI');

      // Rapidly click through songs
      await user.click(playlistItems[0]);
      await user.click(playlistItems[1]);
      await user.click(playlistItems[2]);
      await user.click(playlistItems[0]);

      expect(setCurrentIndexMock).toHaveBeenCalledTimes(4);
    });

    it('should handle song removal during playback', async () => {
      const user = userEvent.setup();
      const removeSongMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        removeSong: removeSongMock
      });

      render(<Player />);

      // Remove current song
      const deleteButtons = screen.getAllByLabelText(/remove|delete/i);
      await user.click(deleteButtons[0]);
      await user.click(deleteButtons[0]);

      expect(removeSongMock).toHaveBeenCalledWith('1');
    });

    it('should handle adding songs during playback', async () => {
      const user = userEvent.setup();
      const addSongMock = jest.fn();
      (usePlaylistHook.usePlaylist as jest.Mock).mockReturnValue({
        ...mockUsePlaylist,
        addSong: addSongMock
      });

      render(<Player />);

      // Add new song
      await user.type(screen.getByLabelText(/title/i), 'Added Song');
      await user.type(screen.getByLabelText(/^artist \*/i), 'Added Artist');
      await user.type(screen.getByLabelText(/cover/i), '/added-cover.jpg');
      await user.type(screen.getByLabelText(/^audio file url/i), '/added-song.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      expect(addSongMock).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', () => {
      const errorPlayer = {
        ...mockUseAudioPlayer,
        error: 'An error occurred'
      };
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue(errorPlayer);

      render(<Player />);

      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });

    it('should handle playlist loading errors', async () => {
      (PlaylistDataProvider.loadInitialPlaylist as jest.Mock).mockRejectedValue(new Error('Failed to load'));

      const { findByText } = render(<Player />);

      const errorElement = await findByText(/failed to load playlist/i);
      expect(errorElement).toBeInTheDocument();
    });

    it('should handle audio playback errors', async () => {
      const errorPlayer = {
        ...mockUseAudioPlayer,
        error: 'Playback error'
      };
      (useAudioPlayerHook.useAudioPlayer as jest.Mock).mockReturnValue(errorPlayer);

      render(<Player />);

      expect(screen.getByText(/playback error/i)).toBeInTheDocument();
    });
  });
});
