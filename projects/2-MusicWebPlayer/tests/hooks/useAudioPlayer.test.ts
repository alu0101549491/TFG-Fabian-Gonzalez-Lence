// tests/hooks/useAudioPlayer.test.ts
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { RefObject } from 'react';

describe('useAudioPlayer Hook', () => {
  let mockAudioElement: HTMLAudioElement;
  let audioRef: RefObject<HTMLAudioElement>;
  let mockCurrentTime: number;
  let mockDuration: number;
  let eventListeners: Map<string, Function[]>;

  beforeEach(() => {
    // Reset mock values
    mockCurrentTime = 0;
    mockDuration = 0;
    eventListeners = new Map();
    
    // Create a mock audio element with all properties
    mockAudioElement = {
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      load: jest.fn(function(this: any) {
        // When load is called, reset currentTime like a real audio element
        this.currentTime = 0;
      }),
      src: '',
      paused: true,
      volume: 0.7,
      currentTime: 0,
      duration: 0,
      addEventListener: jest.fn((event: string, handler: Function) => {
        if (!eventListeners.has(event)) {
          eventListeners.set(event, []);
        }
        eventListeners.get(event)!.push(handler);
      }),
      removeEventListener: jest.fn((event: string, handler: Function) => {
        if (eventListeners.has(event)) {
          const handlers = eventListeners.get(event)!;
          const index = handlers.indexOf(handler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }
      }),
      dispatchEvent: jest.fn((event: Event) => {
        const handlers = eventListeners.get(event.type) || [];
        handlers.forEach(handler => handler(event));
        return true;
      }),
      error: null
    } as any;
    
    audioRef = { current: mockAudioElement };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return AudioPlayerHook interface with all members', () => {
      // ACT
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // ASSERT
      expect(result.current).toHaveProperty('isPlaying');
      expect(result.current).toHaveProperty('currentTime');
      expect(result.current).toHaveProperty('duration');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('volume');
      expect(result.current).toHaveProperty('isMuted');
      expect(result.current).toHaveProperty('play');
      expect(result.current).toHaveProperty('pause');
      expect(result.current).toHaveProperty('seek');
      expect(result.current).toHaveProperty('setSource');
      expect(result.current).toHaveProperty('setVolume');
      expect(result.current).toHaveProperty('toggleMute');
    });

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.duration).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.volume).toBe(70); // Default volume
      expect(result.current.isMuted).toBe(false);
    });
  });

  describe('Playback Control - Play', () => {
    it('should set isPlaying to true when play is called', async () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      await act(async () => {
        await result.current.play();
      });
      
      expect(result.current.isPlaying).toBe(true);
      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      // Mock play to reject
      (mockAudioElement.play as jest.Mock).mockRejectedValueOnce(new Error('Play failed'));
      
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      await act(async () => {
        try {
          await result.current.play();
        } catch (e) {
          // Expected to catch the error
        }
      });
      
      expect(result.current.error).not.toBeNull();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should not attempt to play if audio ref is null', async () => {
      const nullRef = { current: null };
      const { result } = renderHook(() => useAudioPlayer(nullRef));
      
      await act(async () => {
        await expect(result.current.play()).rejects.toThrow('Audio element not available');
      });
      
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.error).not.toBeNull();
    });
  });

  describe('Playback Control - Pause', () => {
    it('should set isPlaying to false when pause is called', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // First play to set isPlaying to true
      act(() => {
        mockAudioElement.paused = false;
        // Manually trigger state update by calling play/pause
        mockAudioElement.dispatchEvent(new Event('play'));
      });
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.isPlaying).toBe(false);
      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    it('should not attempt to pause if audio ref is null', () => {
      const nullRef = { current: null };
      const { result } = renderHook(() => useAudioPlayer(nullRef));
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle pause errors gracefully', () => {
      // Mock pause to throw error
      mockAudioElement.pause = jest.fn(() => {
        throw new Error('Pause failed');
      });
      
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.error).not.toBeNull();
    });
  });

  describe('Seek Functionality', () => {
    it('should update currentTime when seek is called', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Set a duration so seeking doesn't get clamped to 0
      mockAudioElement.duration = 100;
      
      act(() => {
        result.current.seek(30);
      });
      
      // Check both the hook state and the audio element
      expect(result.current.currentTime).toBe(30);
      expect(mockAudioElement.currentTime).toBe(30);
    });

    it('should clamp seek time to valid range', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Set duration to 100 seconds
      mockAudioElement.duration = 100;
      
      act(() => {
        result.current.seek(-10); // Should clamp to 0
      });
      
      expect(mockAudioElement.currentTime).toBe(0);
      
      act(() => {
        result.current.seek(150); // Should clamp to duration
      });
      
      expect(mockAudioElement.currentTime).toBe(100);
    });

    it('should not seek if audio ref is null', () => {
      const nullRef = { current: null };
      const { result } = renderHook(() => useAudioPlayer(nullRef));
      
      act(() => {
        result.current.seek(30);
      });
      
      // Should not cause errors
      expect(true).toBe(true);
    });
  });

  describe('Source Management', () => {
    it('should update audio source when setSource is called', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.setSource('/new-song.mp3');
      });
      
      // The audio element's src property should be updated directly
      expect(mockAudioElement.src).toContain('/new-song.mp3');
      expect(mockAudioElement.load).toHaveBeenCalled();
    });

    it('should reset state when new source is set', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Set some initial state
      mockAudioElement.currentTime = 50;
      mockAudioElement.duration = 100;
      
      act(() => {
        result.current.setSource('/another-song.mp3');
      });
      
      // After setting new source, currentTime should be reset
      expect(mockAudioElement.currentTime).toBe(0);
    });

    it('should not update source if audio ref is null', () => {
      const nullRef = { current: null };
      const { result } = renderHook(() => useAudioPlayer(nullRef));
      
      act(() => {
        result.current.setSource('/new-song.mp3');
      });
      
      // Should not cause errors
      expect(true).toBe(true);
    });
  });

  describe('Volume Control', () => {
    it('should update volume state when setVolume is called', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.setVolume(80);
      });
      
      expect(result.current.volume).toBe(80);
      // Volume should also be applied to audio element
      expect(mockAudioElement.volume).toBe(0.8); // 80/100
    });

    it('should clamp volume to valid range (0-100)', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.setVolume(-10);
      });
      
      expect(result.current.volume).toBe(0);
      
      act(() => {
        result.current.setVolume(150);
      });
      
      expect(result.current.volume).toBe(100);
    });

    it('should not set volume if audio ref is null', () => {
      const nullRef = { current: null };
      const { result } = renderHook(() => useAudioPlayer(nullRef));
      
      act(() => {
        result.current.setVolume(80);
      });
      
      // Should not cause errors
      expect(true).toBe(true);
    });

    it('should apply volume to audio element', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.setVolume(50);
      });
      
      expect(mockAudioElement.volume).toBe(0.5); // 50/100
    });
    
    it('should handle NaN volume values', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.setVolume(50); // Set to 50 first
      });
      
      act(() => {
        result.current.setVolume(NaN as any);
      });
      
      expect(result.current.volume).toBe(50); // Should remain at 50
    });

    it('should handle non-finite volume values', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.setVolume(50); // Set to 50 first
      });
      
      act(() => {
        result.current.setVolume(Infinity as any);
      });
      
      expect(result.current.volume).toBe(50); // Should remain at 50
    });
  });

  describe('Mute Control', () => {
    it('should toggle mute state when toggleMute is called', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Initially not muted
      expect(result.current.isMuted).toBe(false);
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(result.current.isMuted).toBe(true);
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(result.current.isMuted).toBe(false);
    });

    it('should set audio volume to 0 when muted', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(mockAudioElement.volume).toBe(0);
    });

    it('should restore volume when unmuted', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Set volume to 80
      act(() => {
        result.current.setVolume(80);
      });
      
      // Mute
      act(() => {
        result.current.toggleMute();
      });
      
      // Unmute
      act(() => {
        result.current.toggleMute();
      });
      
      expect(mockAudioElement.volume).toBe(0.8); // Should restore to 80%
    });

    it('should not toggle mute if audio ref is null', () => {
      const nullRef = { current: null };
      const { result } = renderHook(() => useAudioPlayer(nullRef));
      
      act(() => {
        result.current.toggleMute();
      });
      
      // Should not cause errors
      expect(true).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should update currentTime on timeupdate event', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Simulate timeupdate event
      mockAudioElement.currentTime = 25;
      
      act(() => {
        mockAudioElement.dispatchEvent(new Event('timeupdate'));
      });
      
      expect(result.current.currentTime).toBe(25);
    });

    it('should update duration on loadedmetadata event', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Simulate loadedmetadata event
      mockAudioElement.duration = 180;
      
      act(() => {
        mockAudioElement.dispatchEvent(new Event('loadedmetadata'));
      });
      
      expect(result.current.duration).toBe(180);
    });

    it('should handle ended event', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Start playing
      act(() => {
        mockAudioElement.paused = false;
      });
      
      // Simulate ended event
      act(() => {
        mockAudioElement.dispatchEvent(new Event('ended'));
      });
      
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should coordinate play/pause/seek operations', async () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Play
      await act(async () => {
        await result.current.play();
      });
      expect(result.current.isPlaying).toBe(true);
      
      // Seek
      act(() => {
        result.current.seek(0);
      });
      expect(mockAudioElement.currentTime).toBe(0);
      
      // Pause
      act(() => {
        result.current.pause();
      });
      expect(result.current.isPlaying).toBe(false);
    });

    it('should maintain volume across source changes', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Set volume
      act(() => {
        result.current.setVolume(90);
      });
      
      // Change source
      act(() => {
        result.current.setSource('/different-song.mp3');
      });
      
      // Volume should remain
      expect(result.current.volume).toBe(90);
    });

    it('should maintain mute state across source changes', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      // Mute
      act(() => {
        result.current.toggleMute();
      });
      
      // Change source
      act(() => {
        result.current.setSource('/different-song.mp3');
      });
      
      // Mute state should remain
      expect(result.current.isMuted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid seek values', () => {
      const { result } = renderHook(() => useAudioPlayer(audioRef));
      
      act(() => {
        result.current.seek(NaN as any);
      });
      
      expect(mockAudioElement.currentTime).toBe(0); // Should default to 0
      
      act(() => {
        result.current.seek(Infinity as any);
      });
      
      expect(mockAudioElement.currentTime).toBe(0); // Should default to 0
    });

    it('should handle events when audio ref becomes null', () => {
      const { result, rerender } = renderHook(({ ref }) => useAudioPlayer(ref), {
        initialProps: { ref: audioRef }
      });
      
      // Change ref to null
      rerender({ ref: { current: null } });
      
      // Trigger events, should not cause errors
      act(() => {
        // Simulate events that could happen
        if (mockAudioElement) {
          mockAudioElement.dispatchEvent(new Event('timeupdate'));
          mockAudioElement.dispatchEvent(new Event('ended'));
        }
      });
      
      expect(true).toBe(true); // Should not throw
    });
  });
});
