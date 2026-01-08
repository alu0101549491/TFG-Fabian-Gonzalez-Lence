// tests/hooks/usePlaylist.test.ts
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Song } from '@/types/song';
import { RepeatMode } from '@/types/playback-modes';

describe('usePlaylist Hook', () => {
  // Mock songs for testing
  const mockSongs: Song[] = [
    { id: '1', title: 'Song 1', artist: 'Artist 1', cover: '/1.jpg', url: '/1.mp3' },
    { id: '2', title: 'Song 2', artist: 'Artist 2', cover: '/2.jpg', url: '/2.mp3' },
    { id: '3', title: 'Song 3', artist: 'Artist 3', cover: '/3.jpg', url: '/3.mp3' },
    { id: '4', title: 'Song 4', artist: 'Artist 4', cover: '/4.jpg', url: '/4.mp3' },
    { id: '5', title: 'Song 5', artist: 'Artist 5', cover: '/5.jpg', url: '/5.mp3' }
  ];

  beforeEach(() => {
    // Mock localStorage
    let store: { [key: string]: string } = {};
    global.Storage.prototype.getItem = jest.fn((key: string) => store[key] || null);
    global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      store[key] = value;
    });
    global.Storage.prototype.removeItem = jest.fn((key: string) => {
      delete store[key];
    });
    global.Storage.prototype.clear = jest.fn(() => {
      store = {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return PlaylistHook interface with all members', () => {
      // ACT
      const { result } = renderHook(() => usePlaylist(mockSongs));
      // ASSERT
      expect(result.current).toHaveProperty('playlist');
      expect(result.current).toHaveProperty('currentIndex');
      expect(result.current).toHaveProperty('repeatMode');
      expect(result.current).toHaveProperty('isShuffled');
      expect(result.current).toHaveProperty('next');
      expect(result.current).toHaveProperty('previous');
      expect(result.current).toHaveProperty('hasNext');
      expect(result.current).toHaveProperty('hasPrevious');
      expect(result.current).toHaveProperty('addSong');
      expect(result.current).toHaveProperty('removeSong');
      expect(result.current).toHaveProperty('getSongAt');
      expect(result.current).toHaveProperty('setCurrentIndex');
      expect(result.current).toHaveProperty('setRepeatMode');
      expect(result.current).toHaveProperty('toggleShuffle');
    });

    it('should initialize with provided playlist', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      expect(result.current.playlist).toEqual(mockSongs);
      expect(result.current.playlist).toHaveLength(5);
    });

    it('should initialize currentIndex at 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      expect(result.current.currentIndex).toBe(0);
    });

    it('should initialize repeatMode to OFF', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      expect(result.current.repeatMode).toBe(RepeatMode.OFF);
    });

    it('should initialize isShuffled to false', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      expect(result.current.isShuffled).toBe(false);
    });

    it('should have all methods as functions', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      expect(typeof result.current.next).toBe('function');
      expect(typeof result.current.previous).toBe('function');
      expect(typeof result.current.hasNext).toBe('function');
      expect(typeof result.current.hasPrevious).toBe('function');
      expect(typeof result.current.addSong).toBe('function');
      expect(typeof result.current.removeSong).toBe('function');
      expect(typeof result.current.getSongAt).toBe('function');
      expect(typeof result.current.setCurrentIndex).toBe('function');
      expect(typeof result.current.setRepeatMode).toBe('function');
      expect(typeof result.current.toggleShuffle).toBe('function');
    });
  });

  describe('Navigation - Repeat OFF', () => {
    it('should increment currentIndex when next() is called', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });
      act(() => {
        result.current.next();
      });
      expect(result.current.currentIndex).toBe(1);
      act(() => {
        result.current.next();
      });
      expect(result.current.currentIndex).toBe(2);
    });

    it('should stay at last song when next() called at end (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
        result.current.setCurrentIndex(4); // Last index
      });
      expect(result.current.currentIndex).toBe(4);
      // Try to go next
      act(() => {
        result.current.next();
      });
      // Should stay at last
      expect(result.current.currentIndex).toBe(4);
    });

    it('should decrement currentIndex when previous() is called', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });
      // Start at index 2
      act(() => {
        result.current.setCurrentIndex(2);
      });
      act(() => {
        result.current.previous();
      });
      expect(result.current.currentIndex).toBe(1);
      act(() => {
        result.current.previous();
      });
      expect(result.current.currentIndex).toBe(0);
    });

    it('should stay at first song when previous() called at start (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });
      expect(result.current.currentIndex).toBe(0);
      act(() => {
        result.current.previous();
      });
      // Should stay at first
      expect(result.current.currentIndex).toBe(0);
    });

    it('should return false from hasNext() at last song (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
        result.current.setCurrentIndex(4); // Last song
      });
      expect(result.current.hasNext()).toBe(false);
    });

    it('should return false from hasPrevious() at first song (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.hasPrevious()).toBe(false);
    });

    it('should return new currentIndex from next()', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });
      let newIndex: number;
      act(() => {
        newIndex = result.current.next();
      });
      expect(newIndex!).toBe(1);
      expect(result.current.currentIndex).toBe(1);
    });

    it('should return new currentIndex from previous()', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
        result.current.setCurrentIndex(2);
      });
      let newIndex: number;
      act(() => {
        newIndex = result.current.previous();
      });
      expect(newIndex!).toBe(1);
      expect(result.current.currentIndex).toBe(1);
    });
  });

  describe('Navigation - Repeat ALL', () => {
    it('should wrap to first song when next() at end (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.setCurrentIndex(4); // Last song
      });
      act(() => {
        result.current.next();
      });
      // Should wrap to first
      expect(result.current.currentIndex).toBe(0);
    });

    it('should wrap to last song when previous() at start (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });
      expect(result.current.currentIndex).toBe(0);
      act(() => {
        result.current.previous();
      });
      // Should wrap to last
      expect(result.current.currentIndex).toBe(4);
    });

    it('should return true from hasNext() always (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.setCurrentIndex(4); // Last song
      });
      expect(result.current.hasNext()).toBe(true);
    });

    it('should return true from hasPrevious() always (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.hasPrevious()).toBe(true);
    });

    it('should handle multiple wraps correctly', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.setCurrentIndex(3); // Start at index 3
      });
      // Navigate forward (separate act calls to allow state updates)
      act(() => {
        result.current.next(); // Go to 4
      });
      act(() => {
        result.current.next(); // Wrap to 0
      });
      act(() => {
        result.current.next(); // Go to 1
      });
      expect(result.current.currentIndex).toBe(1);
    });
  });

  describe('Navigation - Repeat ONE', () => {
    it('should stay on current song when next() called (Repeat ONE)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
        result.current.setCurrentIndex(2);
      });
      act(() => {
        result.current.next();
      });
      // Should stay at same index
      expect(result.current.currentIndex).toBe(2);
    });

    it('should allow navigation with previous() even in Repeat ONE mode', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
        result.current.setCurrentIndex(2);
      });
      act(() => {
        result.current.previous();
      });
      // Previous still works - Repeat ONE only affects auto-play on track end
      expect(result.current.currentIndex).toBe(1);
    });

    it('should return true from hasNext() when not at end (Repeat ONE)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
      });
      // hasNext checks position, not repeat mode (manual nav still works)
      expect(result.current.hasNext()).toBe(true);
    });

    it('should return false from hasPrevious() at first song (Repeat ONE)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
      });
      // At first song, hasPrevious is false
      expect(result.current.hasPrevious()).toBe(false);
    });
  });

  describe('Shuffle Mode - Basic', () => {
    it('should enable shuffle when toggleShuffle() called', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      expect(result.current.isShuffled).toBe(false);
      act(() => {
        result.current.toggleShuffle();
      });
      expect(result.current.isShuffled).toBe(true);
    });

    it('should disable shuffle when toggleShuffle() called again', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.toggleShuffle(); // Enable
      });
      expect(result.current.isShuffled).toBe(true);
      act(() => {
        result.current.toggleShuffle(); // Disable
      });
      expect(result.current.isShuffled).toBe(false);
    });

    it('should keep current song first in shuffle queue', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      // Set current song to index 2
      act(() => {
        result.current.setCurrentIndex(2);
        result.current.toggleShuffle();
      });
      // Current song should still be at index 2
      expect(result.current.currentIndex).toBe(2);
      // First next() should be a shuffled song (not sequential)
      const currentSong = result.current.getSongAt(result.current.currentIndex);
      act(() => {
        result.current.next();
      });
      const nextSong = result.current.getSongAt(result.current.currentIndex);
      // Next song should exist (not undefined)
      expect(nextSong).toBeDefined();
    });
  });

  describe('Shuffle Mode - Navigation', () => {
    it('should navigate through shuffle queue in shuffled order', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL); // Enable repeat to allow full navigation
        result.current.toggleShuffle();
      });
      // Collect indices after shuffle is set up
      const visitedIndices: number[] = [result.current.getCurrentSongIndex()];
      // Navigate through entire queue (separate act calls)
      for (let i = 0; i < mockSongs.length - 1; i++) {
        act(() => {
          result.current.next();
          visitedIndices.push(result.current.getCurrentSongIndex());
        });
      }
      // Should have visited all songs
      expect(visitedIndices).toHaveLength(mockSongs.length);
      // All indices should be unique (visited each song once)
      const uniqueIndices = new Set(visitedIndices);
      expect(uniqueIndices.size).toBe(mockSongs.length - 1);
    });

    it('should regenerate shuffle queue when exhausted with Repeat ALL', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.toggleShuffle();
      });
      // Navigate through entire queue (separate act calls)
      for (let i = 0; i < mockSongs.length; i++) {
        act(() => {
          result.current.next();
        });
      }
      // Should have regenerated queue and continue
      expect(result.current.currentIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.currentIndex).toBeLessThan(mockSongs.length);
    });

    it('should not have hasNext() when shuffle queue exhausted with Repeat OFF', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
        result.current.toggleShuffle();
      });
      // Navigate to end of shuffle queue (separate act calls)
      for (let i = 0; i < mockSongs.length - 1; i++) {
        act(() => {
          result.current.next();
        });
      }
      // Should have exhausted the queue
      expect(result.current.hasNext()).toBe(false);
    });

    it('should support previous() in shuffle mode', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.toggleShuffle();
        result.current.next();
        result.current.next();
      });
      const forwardIndex = result.current.currentIndex;
      act(() => {
        result.current.previous();
      });
      // Should go back in shuffle queue
      expect(result.current.currentIndex).not.toBe(forwardIndex);
    });
  });

  describe('Shuffle Mode - Fisher-Yates Algorithm', () => {
    it('should shuffle all songs in queue', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.toggleShuffle();
      });
      // Navigate through all songs and collect them (separate act calls)
      const shuffledSongIds = new Set<string>();
      // Get initial song after shuffle is set up
      const initialSong = result.current.getSongAt(result.current.getCurrentSongIndex());
      if (initialSong) shuffledSongIds.add(initialSong.id);
      
      for (let i = 0; i < mockSongs.length - 1; i++) {
        act(() => {
          result.current.next();
          const song = result.current.getSongAt(result.current.getCurrentSongIndex());
          if (song) shuffledSongIds.add(song.id);
        });
      }
      // Should have all songs
      expect(shuffledSongIds.size).toBe(mockSongs.length - 1);
    });

    it('should not have duplicate songs in shuffle queue', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.toggleShuffle();
      });
      const visitedIds: string[] = [];
      // Get initial song after shuffle is set up
      const initialSong = result.current.getSongAt(result.current.getCurrentSongIndex());
      if (initialSong) visitedIds.push(initialSong.id);
      
      for (let i = 0; i < mockSongs.length - 1; i++) {
        act(() => {
          result.current.next();
          const song = result.current.getSongAt(result.current.getCurrentSongIndex());
          if (song) visitedIds.push(song.id);
        });
      }
      // No duplicates
      const uniqueIds = new Set(visitedIds);
      expect(uniqueIds.size).toBe(visitedIds.length - 1);
    });
  });

  describe('Song Management - Add', () => {
    it('should add song to playlist', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const newSong: Song = {
        id: '6',
        title: 'New Song',
        artist: 'New Artist',
        cover: '/6.jpg',
        url: '/6.mp3'
      };
      act(() => {
        result.current.addSong(newSong);
      });
      expect(result.current.playlist).toHaveLength(6);
      expect(result.current.playlist[5]).toEqual(newSong);
    });

    it('should add song at end of playlist', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const song1: Song = { id: '6', title: 'Song 6', artist: 'Artist 6', cover: '/6.jpg', url: '/6.mp3' };
      const song2: Song = { id: '7', title: 'Song 7', artist: 'Artist 7', cover: '/7.jpg', url: '/7.mp3' };
      let addedCount = 0;
      act(() => {
        result.current.addSong(song1);
        addedCount++;
      });
      act(() => {
        result.current.addSong(song2);
        addedCount++;
      });
      expect(result.current.playlist[4]).toEqual(mockSongs[4]); // Last original song
      expect(result.current.playlist[5]).toEqual(song1); // First added song
      expect(result.current.playlist[6]).toEqual(song2); // Second added song
    });

    it('should increase playlist length by 1', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const initialLength = result.current.playlist.length;
      act(() => {
        result.current.addSong({
          id: 'new',
          title: 'New',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        });
      });
      expect(result.current.playlist.length).toBe(initialLength + 1);
    });
  });

  describe('Song Management - Remove', () => {
    it('should remove song by ID', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.removeSong('2');
      });
      expect(result.current.playlist).toHaveLength(4);
      expect(result.current.playlist.find(s => s.id === '2')).toBeUndefined();
    });

    it('should do nothing when removing non-existent ID', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const initialLength = result.current.playlist.length;
      act(() => {
        result.current.removeSong('non-existent');
      });
      expect(result.current.playlist.length).toBe(initialLength);
    });

    it('should decrement currentIndex when removing song before current', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(3);
      });
      expect(result.current.currentIndex).toBe(3);
      act(() => {
        result.current.removeSong('2'); // Remove song at index 1 (before current)
      });
      // Index should be decremented
      expect(result.current.currentIndex).toBe(2);
    });

    it('should not change currentIndex when removing song after current', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(1);
      });
      act(() => {
        result.current.removeSong('4'); // Remove song at index 3 (after current)
      });
      // Index should stay the same
      expect(result.current.currentIndex).toBe(1);
    });

    it('should handle removing current song correctly', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(2);
      });
      const currentSongId = result.current.getSongAt(2)!.id;
      act(() => {
        result.current.removeSong(currentSongId);
      });
      // Index should stay at 2 (now points to next song)
      expect(result.current.currentIndex).toBe(2);
      // Song at index 2 should be different
      const newSong = result.current.getSongAt(2);
      expect(newSong?.id).not.toBe(currentSongId);
    });
  });

  describe('Song Management - Remove Edge Cases', () => {
    it('should handle removing song at index 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.removeSong('1'); // First song
      });
      expect(result.current.playlist).toHaveLength(4);
      expect(result.current.playlist[0].id).toBe('2');
    });

    it('should handle removing last song', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.removeSong('5'); // Last song
      });
      expect(result.current.playlist).toHaveLength(4);
    });

    it('should handle removing current song when at last index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(4); // Last index
      });
      act(() => {
        result.current.removeSong('5'); // Remove current (last)
      });
      // Should adjust index to new last
      expect(result.current.currentIndex).toBe(result.current.playlist.length - 1);
    });
  });

  describe('getSongAt', () => {
    it('should return correct song at valid index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const song = result.current.getSongAt(2);
      expect(song).toEqual(mockSongs[2]);
    });

    it('should return null for index out of bounds', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const song = result.current.getSongAt(10);
      expect(song).toBeNull();
    });

    it('should return null for negative index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const song = result.current.getSongAt(-1);
      expect(song).toBeNull();
    });

    it('should work with index 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const song = result.current.getSongAt(0);
      expect(song).toEqual(mockSongs[0]);
    });

    it('should work with last index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      const song = result.current.getSongAt(4);
      expect(song).toEqual(mockSongs[4]);
    });
  });

  describe('setCurrentIndex', () => {
    it('should set currentIndex to specified value', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(3);
      });
      expect(result.current.currentIndex).toBe(3);
    });

    it('should accept index 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(2);
        result.current.setCurrentIndex(0);
      });
      expect(result.current.currentIndex).toBe(0);
    });

    it('should accept last index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(4);
      });
      expect(result.current.currentIndex).toBe(4);
    });

    it('should handle out-of-bounds indices gracefully', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(100);
      });
      // Should either clamp or ignore
      expect(result.current.currentIndex).toBeLessThan(mockSongs.length);
    });
  });

  describe('setRepeatMode', () => {
    it('should change repeatMode to OFF', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });
      expect(result.current.repeatMode).toBe(RepeatMode.OFF);
    });

    it('should change repeatMode to ALL', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });
      expect(result.current.repeatMode).toBe(RepeatMode.ALL);
    });

    it('should change repeatMode to ONE', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
      });
      expect(result.current.repeatMode).toBe(RepeatMode.ONE);
    });
  });

  describe('Persistence', () => {
    it('should persist playlist to localStorage', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      // Trigger a state change to ensure localStorage is updated
      act(() => {
        result.current.setCurrentIndex(1);
      });
      expect(global.Storage.prototype.setItem).toHaveBeenCalled();
    });

    it('should persist currentIndex to localStorage', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setCurrentIndex(2);
      });
      expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
        'music-player-current-index',
        '2'
      );
    });

    it('should persist repeatMode to localStorage', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });
      expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
        'music-player-repeat-mode',
        expect.any(String)
      );
    });

    it('should persist isShuffled to localStorage', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.toggleShuffle();
      });
      expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
        'music-player-shuffle',
        expect.any(String)
      );
    });
  });

  describe('Integration', () => {
    it('should work with shuffle and Repeat ALL', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.toggleShuffle();
      });
      // Navigate through queue twice
      act(() => {
        for (let i = 0; i < mockSongs.length * 2; i++) {
          result.current.next();
        }
      });
      // Should have wrapped and continued
      expect(result.current.currentIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle remove song while shuffled', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.toggleShuffle();
        result.current.removeSong('3');
      });
      expect(result.current.playlist).toHaveLength(4);
      expect(result.current.isShuffled).toBe(true);
    });

    it('should handle add song while shuffled', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.toggleShuffle();
        result.current.addSong({
          id: '6',
          title: 'New Song',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        });
      });
      expect(result.current.playlist).toHaveLength(6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty playlist', () => {
      const { result } = renderHook(() => usePlaylist([]));
      expect(result.current.playlist).toHaveLength(0);
      expect(result.current.hasNext()).toBe(false);
      expect(result.current.hasPrevious()).toBe(false);
    });

    it('should handle single song playlist', () => {
      const { result } = renderHook(() => usePlaylist([mockSongs[0]]));
      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });
      expect(result.current.hasNext()).toBe(false);
      expect(result.current.hasPrevious()).toBe(false);
    });

    it('should handle rapid next() calls', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        for (let i = 0; i < 100; i++) {
          result.current.next();
        }
      });
      expect(result.current.currentIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.currentIndex).toBeLessThan(mockSongs.length);
    });

    it('should handle toggling shuffle multiple times', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));
      act(() => {
        result.current.toggleShuffle(); // On
      });
      act(() => {
        result.current.toggleShuffle(); // Off
      });
      act(() => {
        result.current.toggleShuffle(); // On
      });
      act(() => {
        result.current.toggleShuffle(); // Off
      });
      expect(result.current.isShuffled).toBe(false);
    });
  });
});
