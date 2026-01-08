// tests/types/playback-modes.test.ts
import { describe, it, expect } from '@jest/globals';
import { RepeatMode, PlaybackModes } from '@/types/playback-modes';

describe('PlaybackModes Type Definitions', () => {
  describe('RepeatMode Enum', () => {
    it('should export RepeatMode enum', () => {
      expect(RepeatMode).toBeDefined();
      expect(typeof RepeatMode).toBe('object');
    });

    it('should have all 3 repeat modes', () => {
      expect(RepeatMode.OFF).toBeDefined();
      expect(RepeatMode.ALL).toBeDefined();
      expect(RepeatMode.ONE).toBeDefined();
    });

    it('should have lowercase string values', () => {
      expect(typeof RepeatMode.OFF).toBe('string');
      expect(typeof RepeatMode.ALL).toBe('string');
      expect(typeof RepeatMode.ONE).toBe('string');
      
      expect(RepeatMode.OFF).toMatch(/^[a-z]+$/);
      expect(RepeatMode.ALL).toMatch(/^[a-z]+$/);
      expect(RepeatMode.ONE).toMatch(/^[a-z]+$/);
    });

    it('should have correct string values', () => {
      expect(RepeatMode.OFF).toBe('off');
      expect(RepeatMode.ALL).toBe('all');
      expect(RepeatMode.ONE).toBe('one');
    });

    it('should have UPPERCASE keys', () => {
      const keys = Object.keys(RepeatMode).filter(k => isNaN(Number(k)));
      
      keys.forEach(key => {
        expect(key).toMatch(/^[A-Z]+$/);
      });
      
      expect(keys).toContain('OFF');
      expect(keys).toContain('ALL');
      expect(keys).toContain('ONE');
    });

    it('should have exactly 3 modes', () => {
      const values = Object.values(RepeatMode);
      expect(values).toHaveLength(3);
    });

    it('should not have numeric values', () => {
      const values = Object.values(RepeatMode);
      values.forEach(value => {
        expect(typeof value).not.toBe('number');
      });
    });
  });

  describe('RepeatMode Enum Usage', () => {
    it('should work in switch statements', () => {
      const getDescription = (mode: RepeatMode): string => {
        switch (mode) {
          case RepeatMode.OFF:
            return 'No repeat';
          case RepeatMode.ALL:
            return 'Repeat all';
          case RepeatMode.ONE:
            return 'Repeat one';
        }
        return 'Unknown mode';
      };

      expect(getDescription(RepeatMode.OFF)).toBe('No repeat');
      expect(getDescription(RepeatMode.ALL)).toBe('Repeat all');
      expect(getDescription(RepeatMode.ONE)).toBe('Repeat one');
    });

    it('should support equality comparisons', () => {
      const mode: RepeatMode = RepeatMode.ALL;

      expect(mode === RepeatMode.ALL).toBe(true);
      expect(mode === RepeatMode.OFF).toBe(false);
      expect(mode === RepeatMode.ONE).toBe(false);
      expect(mode !== RepeatMode.OFF).toBe(true);
    });

    it('should work as object keys', () => {
      const modeLabels: Record<RepeatMode, string> = {
        [RepeatMode.OFF]: 'Off',
        [RepeatMode.ALL]: 'Repeat All',
        [RepeatMode.ONE]: 'Repeat One'
      };

      expect(modeLabels[RepeatMode.OFF]).toBe('Off');
      expect(modeLabels[RepeatMode.ALL]).toBe('Repeat All');
      expect(modeLabels[RepeatMode.ONE]).toBe('Repeat One');
    });

    it('should support iteration over values', () => {
      const modes = Object.values(RepeatMode);

      expect(modes).toContain('off');
      expect(modes).toContain('all');
      expect(modes).toContain('one');
      expect(modes).toHaveLength(3);
    });

    it('should work in type guards', () => {
      const isRepeatAll = (mode: RepeatMode): boolean => {
        return mode === RepeatMode.ALL;
      };

      expect(isRepeatAll(RepeatMode.ALL)).toBe(true);
      expect(isRepeatAll(RepeatMode.OFF)).toBe(false);
    });

    it('should support cycling through modes', () => {
      const cycleRepeatMode = (current: RepeatMode): RepeatMode => {
        switch (current) {
          case RepeatMode.OFF:
            return RepeatMode.ALL;
          case RepeatMode.ALL:
            return RepeatMode.ONE;
          case RepeatMode.ONE:
            return RepeatMode.OFF;
        }
      };

      expect(cycleRepeatMode(RepeatMode.OFF)).toBe(RepeatMode.ALL);
      expect(cycleRepeatMode(RepeatMode.ALL)).toBe(RepeatMode.ONE);
      expect(cycleRepeatMode(RepeatMode.ONE)).toBe(RepeatMode.OFF);
    });

    it('should support conditional logic', () => {
      const shouldLoop = (mode: RepeatMode): boolean => {
        return mode === RepeatMode.ALL || mode === RepeatMode.ONE;
      };

      expect(shouldLoop(RepeatMode.OFF)).toBe(false);
      expect(shouldLoop(RepeatMode.ALL)).toBe(true);
      expect(shouldLoop(RepeatMode.ONE)).toBe(true);
    });
  });

  describe('PlaybackModes Interface', () => {
    it('should accept valid PlaybackModes object', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(modes).toBeDefined();
      expect(modes).toHaveProperty('repeat');
      expect(modes).toHaveProperty('shuffle');
      expect(modes).toHaveProperty('volume');
      expect(modes).toHaveProperty('isMuted');
    });

    it('should use RepeatMode enum for repeat property', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 75,
        isMuted: false
      };

      expect(Object.values(RepeatMode)).toContain(modes.repeat);
      expect(modes.repeat).toBe(RepeatMode.ALL);
    });

    it('should have shuffle as boolean', () => {
      const modesOn: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: true,
        volume: 50,
        isMuted: false
      };

      const modesOff: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(typeof modesOn.shuffle).toBe('boolean');
      expect(typeof modesOff.shuffle).toBe('boolean');
      expect(modesOn.shuffle).toBe(true);
      expect(modesOff.shuffle).toBe(false);
    });

    it('should have volume as number', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 80,
        isMuted: false
      };

      expect(typeof modes.volume).toBe('number');
      expect(modes.volume).toBe(80);
    });

    it('should have isMuted as boolean', () => {
      const modesMuted: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: true
      };

      const modesUnmuted: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(typeof modesMuted.isMuted).toBe('boolean');
      expect(typeof modesUnmuted.isMuted).toBe('boolean');
      expect(modesMuted.isMuted).toBe(true);
      expect(modesUnmuted.isMuted).toBe(false);
    });

    it('should accept all three RepeatMode values', () => {
      const modesOff: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const modesAll: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const modesOne: PlaybackModes = {
        repeat: RepeatMode.ONE,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(modesOff.repeat).toBe(RepeatMode.OFF);
      expect(modesAll.repeat).toBe(RepeatMode.ALL);
      expect(modesOne.repeat).toBe(RepeatMode.ONE);
    });
  });

  describe('PlaybackModes Operations', () => {
    it('should work with JSON serialization', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 65,
        isMuted: false
      };

      const json = JSON.stringify(modes);
      const parsed: PlaybackModes = JSON.parse(json);

      expect(parsed.repeat).toBe('all'); // Serializes to string
      expect(parsed.shuffle).toBe(true);
      expect(parsed.volume).toBe(65);
      expect(parsed.isMuted).toBe(false);
    });

    it('should work with object spread', () => {
      const baseModes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const updatedModes: PlaybackModes = {
        ...baseModes,
        repeat: RepeatMode.ALL,
        shuffle: true
      };

      expect(updatedModes.repeat).toBe(RepeatMode.ALL);
      expect(updatedModes.shuffle).toBe(true);
      expect(updatedModes.volume).toBe(50); // Unchanged
      expect(baseModes.repeat).toBe(RepeatMode.OFF); // Original unchanged
    });

    it('should support partial updates', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 75,
        isMuted: false
      };

      // Update only volume
      const withNewVolume: PlaybackModes = { ...modes, volume: 100 };
      
      // Toggle mute
      const withMute: PlaybackModes = { ...modes, isMuted: !modes.isMuted };

      expect(withNewVolume.volume).toBe(100);
      expect(withNewVolume.repeat).toBe(RepeatMode.OFF);
      expect(withMute.isMuted).toBe(true);
    });

    it('should support toggle patterns for booleans', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const toggleShuffle: PlaybackModes = {
        ...modes,
        shuffle: !modes.shuffle
      };

      const toggleMute: PlaybackModes = {
        ...modes,
        isMuted: !modes.isMuted
      };

      expect(toggleShuffle.shuffle).toBe(true);
      expect(toggleMute.isMuted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should accept volume at minimum boundary', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 0,
        isMuted: false
      };

      expect(modes.volume).toBe(0);
    });

    it('should accept volume at maximum boundary', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 100,
        isMuted: false
      };

      expect(modes.volume).toBe(100);
    });

    it('should accept volume as decimal', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 66.5,
        isMuted: false
      };

      expect(modes.volume).toBe(66.5);
    });

    it('should handle all combinations of boolean properties', () => {
      const combinations: PlaybackModes[] = [
        { repeat: RepeatMode.OFF, shuffle: false, volume: 50, isMuted: false },
        { repeat: RepeatMode.OFF, shuffle: false, volume: 50, isMuted: true },
        { repeat: RepeatMode.OFF, shuffle: true, volume: 50, isMuted: false },
        { repeat: RepeatMode.OFF, shuffle: true, volume: 50, isMuted: true }
      ];

      combinations.forEach((combo, index) => {
        expect(combo).toBeDefined();
        expect(typeof combo.shuffle).toBe('boolean');
        expect(typeof combo.isMuted).toBe('boolean');
      });
    });

    it('should handle all RepeatMode combinations', () => {
      const repeatModes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];

      repeatModes.forEach(mode => {
        const playbackModes: PlaybackModes = {
          repeat: mode,
          shuffle: false,
          volume: 50,
          isMuted: false
        };

        expect(playbackModes.repeat).toBe(mode);
      });
    });

    it('should support complex state patterns', () => {
      // Shuffle with repeat all
      const shuffleAll: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 80,
        isMuted: false
      };

      // Muted with high volume
      const mutedHighVolume: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 100,
        isMuted: true
      };

      // Repeat one with shuffle (edge case - shuffle ignored)
      const repeatOneShuffle: PlaybackModes = {
        repeat: RepeatMode.ONE,
        shuffle: true,
        volume: 50,
        isMuted: false
      };

      expect(shuffleAll.repeat).toBe(RepeatMode.ALL);
      expect(shuffleAll.shuffle).toBe(true);
      expect(mutedHighVolume.isMuted).toBe(true);
      expect(repeatOneShuffle.repeat).toBe(RepeatMode.ONE);
    });
  });

  describe('Usage Patterns', () => {
    it('should support cycle repeat mode pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const cycleRepeat = (current: PlaybackModes): PlaybackModes => {
        const nextRepeat = 
          current.repeat === RepeatMode.OFF ? RepeatMode.ALL :
          current.repeat === RepeatMode.ALL ? RepeatMode.ONE :
          RepeatMode.OFF;

        return { ...current, repeat: nextRepeat };
      };

      const step1 = cycleRepeat(modes);
      const step2 = cycleRepeat(step1);
      const step3 = cycleRepeat(step2);

      expect(step1.repeat).toBe(RepeatMode.ALL);
      expect(step2.repeat).toBe(RepeatMode.ONE);
      expect(step3.repeat).toBe(RepeatMode.OFF);
    });

    it('should support volume adjustment pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const adjustVolume = (
        current: PlaybackModes,
        delta: number
      ): PlaybackModes => {
        const newVolume = Math.max(0, Math.min(100, current.volume + delta));
        return { ...current, volume: newVolume };
      };

      const increased = adjustVolume(modes, 20);
      const decreased = adjustVolume(modes, -30);

      expect(increased.volume).toBe(70);
      expect(decreased.volume).toBe(20);
    });

    it('should support mute toggle pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 75,
        isMuted: false
      };

      const toggleMute = (current: PlaybackModes): PlaybackModes => {
        return { ...current, isMuted: !current.isMuted };
      };

      const muted = toggleMute(modes);
      const unmuted = toggleMute(muted);

      expect(muted.isMuted).toBe(true);
      expect(unmuted.isMuted).toBe(false);
    });

    it('should support default state pattern', () => {
      const getDefaultModes = (): PlaybackModes => {
        return {
          repeat: RepeatMode.OFF,
          shuffle: false,
          volume: 70,
          isMuted: false
        };
      };

      const defaults = getDefaultModes();

      expect(defaults.repeat).toBe(RepeatMode.OFF);
      expect(defaults.shuffle).toBe(false);
      expect(defaults.volume).toBe(70);
      expect(defaults.isMuted).toBe(false);
    });

    it('should support localStorage serialization pattern', () => {
      const modes: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: true,
        volume: 85,
        isMuted: false
      };

      // Simulate localStorage save/load
      const saved = JSON.stringify(modes);
      const loaded = JSON.parse(saved);

      // Reconstruct with proper enum type
      const restored: PlaybackModes = {
        repeat: loaded.repeat as RepeatMode,
        shuffle: loaded.shuffle,
        volume: loaded.volume,
        isMuted: loaded.isMuted
      };

      expect(restored.repeat).toBe(RepeatMode.ALL);
      expect(restored.shuffle).toBe(true);
      expect(restored.volume).toBe(85);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety in functions', () => {
      const createModes = (
        repeat: RepeatMode,
        shuffle: boolean,
        volume: number,
        isMuted: boolean
      ): PlaybackModes => {
        return { repeat, shuffle, volume, isMuted };
      };

      const modes = createModes(RepeatMode.ALL, true, 60, false);

      expect(modes.repeat).toBe(RepeatMode.ALL);
      expect(modes.shuffle).toBe(true);
    });

    it('should support type guards', () => {
      const hasRepeat = (modes: PlaybackModes): boolean => {
        return modes.repeat !== RepeatMode.OFF;
      };

      const off: PlaybackModes = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      const all: PlaybackModes = {
        repeat: RepeatMode.ALL,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      expect(hasRepeat(off)).toBe(false);
      expect(hasRepeat(all)).toBe(true);
    });

    it('should work with readonly pattern', () => {
      const modes: Readonly<PlaybackModes> = {
        repeat: RepeatMode.OFF,
        shuffle: false,
        volume: 50,
        isMuted: false
      };

      // Can read
      expect(modes.volume).toBe(50);

      // Would fail at compile time:
      // modes.volume = 100;
    });
  });
});