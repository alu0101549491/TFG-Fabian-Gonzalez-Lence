// tests/utils/time-formatter.test.ts
import { describe, it, expect, jest } from '@jest/globals';
import { TimeFormatter } from '@/utils/time-formatter';

describe('TimeFormatter Utility Class', () => {
  describe('Class Structure', () => {
    it('should be a class with static methods', () => {
      expect(TimeFormatter).toBeDefined();
      expect(typeof TimeFormatter.formatTime).toBe('function');
      expect(typeof TimeFormatter.parseTime).toBe('function');
    });

    it('should not require instantiation', () => {
      // Methods should be callable without new TimeFormatter()
      expect(() => TimeFormatter.formatTime(0)).not.toThrow();
      expect(() => TimeFormatter.parseTime("00:00")).not.toThrow();
    });
  });

  describe('formatTime', () => {
    describe('Normal Cases', () => {
      it('should format zero seconds as "00:00"', () => {
        expect(TimeFormatter.formatTime(0)).toBe('00:00');
      });

      it('should format single digit seconds with leading zero', () => {
        expect(TimeFormatter.formatTime(5)).toBe('00:05');
        expect(TimeFormatter.formatTime(9)).toBe('00:09');
      });

      it('should format double digit seconds', () => {
        expect(TimeFormatter.formatTime(45)).toBe('00:45');
        expect(TimeFormatter.formatTime(59)).toBe('00:59');
      });

      it('should format exactly one minute as "01:00"', () => {
        expect(TimeFormatter.formatTime(60)).toBe('01:00');
      });

      it('should format minutes and seconds correctly', () => {
        expect(TimeFormatter.formatTime(65)).toBe('01:05');
        expect(TimeFormatter.formatTime(90)).toBe('01:30');
        expect(TimeFormatter.formatTime(125)).toBe('02:05');
      });

      it('should format multiple minutes correctly', () => {
        expect(TimeFormatter.formatTime(120)).toBe('02:00');
        expect(TimeFormatter.formatTime(180)).toBe('03:00');
        expect(TimeFormatter.formatTime(240)).toBe('04:00');
        expect(TimeFormatter.formatTime(300)).toBe('05:00');
      });

      it('should format common song durations', () => {
        expect(TimeFormatter.formatTime(195)).toBe('03:15');
        expect(TimeFormatter.formatTime(243)).toBe('04:03');
        expect(TimeFormatter.formatTime(301)).toBe('05:01');
      });

      it('should handle values over 59 minutes (hours as minutes)', () => {
        expect(TimeFormatter.formatTime(3600)).toBe('60:00'); // 1 hour
        expect(TimeFormatter.formatTime(3661)).toBe('61:01'); // 1h 1m 1s
      });

      it('should format maximum displayable time correctly', () => {
        expect(TimeFormatter.formatTime(5999)).toBe('99:59');
      });
    });

    describe('Edge Cases', () => {
      it('should handle NaN by returning "00:00"', () => {
        expect(TimeFormatter.formatTime(NaN)).toBe('00:00');
      });

      it('should handle negative numbers by returning "00:00"', () => {
        expect(TimeFormatter.formatTime(-1)).toBe('00:00');
        expect(TimeFormatter.formatTime(-10)).toBe('00:00');
        expect(TimeFormatter.formatTime(-100)).toBe('00:00');
      });

      it('should handle Infinity by returning maximum displayable time "99:59"', () => {
        expect(TimeFormatter.formatTime(Infinity)).toBe('99:59');
      });

      it('should handle negative Infinity by returning "00:00"', () => {
        expect(TimeFormatter.formatTime(-Infinity)).toBe('00:00');
      });

      it('should floor decimal seconds', () => {
        expect(TimeFormatter.formatTime(65.1)).toBe('01:05');
        expect(TimeFormatter.formatTime(65.5)).toBe('01:05');
        expect(TimeFormatter.formatTime(65.9)).toBe('01:05');
      });

      it('should cap values at maximum displayable seconds (5999)', () => {
        expect(TimeFormatter.formatTime(6000)).toBe('99:59');
        expect(TimeFormatter.formatTime(10000)).toBe('99:59');
        expect(TimeFormatter.formatTime(100000)).toBe('99:59');
      });
    });

    describe('Boundary Values', () => {
      it('should handle exactly at maximum (5999)', () => {
        expect(TimeFormatter.formatTime(5999)).toBe('99:59');
      });

      it('should handle just over maximum (6000)', () => {
        expect(TimeFormatter.formatTime(6000)).toBe('99:59');
      });

      it('should handle exactly at zero', () => {
        expect(TimeFormatter.formatTime(0)).toBe('00:00');
      });

      it('should handle just below zero', () => {
        expect(TimeFormatter.formatTime(-0.1)).toBe('00:00');
      });
    });

    describe('Format Validation', () => {
      it('should always return MM:SS format (5 characters with colon)', () => {
        const testCases = [0, 5, 65, 125, 3600, 5999];

        testCases.forEach(seconds => {
          const result = TimeFormatter.formatTime(seconds);
          expect(result).toMatch(/^\d{2}:\d{2}$/);
          expect(result).toHaveLength(5);
        });
      });

      it('should always have exactly one colon', () => {
        expect(TimeFormatter.formatTime(65).split(':')).toHaveLength(2);
      });

      it('should have zero-padded components', () => {
        const result = TimeFormatter.formatTime(5);
        const [minutes, seconds] = result.split(':');
        expect(minutes).toHaveLength(2);
        expect(seconds).toHaveLength(2);
      });
    });
  });

  describe('parseTime', () => {
    describe('Normal Cases', () => {
      it('should parse "00:00" as 0 seconds', () => {
        expect(TimeFormatter.parseTime('00:00')).toBe(0);
      });

      it('should parse seconds correctly', () => {
        expect(TimeFormatter.parseTime('00:30')).toBe(30);
        expect(TimeFormatter.parseTime('00:45')).toBe(45);
        expect(TimeFormatter.parseTime('00:59')).toBe(59);
      });

      it('should parse minutes and seconds correctly', () => {
        expect(TimeFormatter.parseTime('01:00')).toBe(60);
        expect(TimeFormatter.parseTime('01:30')).toBe(90);
        expect(TimeFormatter.parseTime('02:05')).toBe(125);
      });

      it('should parse single digit minutes', () => {
        expect(TimeFormatter.parseTime('1:00')).toBe(60);
        expect(TimeFormatter.parseTime('1:30')).toBe(90);
        expect(TimeFormatter.parseTime('5:45')).toBe(345);
      });

      it('should parse large minute values', () => {
        expect(TimeFormatter.parseTime('60:00')).toBe(3600);
        expect(TimeFormatter.parseTime('99:59')).toBe(5999);
      });

      it('should handle leading zeros', () => {
        expect(TimeFormatter.parseTime('01:05')).toBe(65);
        expect(TimeFormatter.parseTime('05:00')).toBe(300);
        expect(TimeFormatter.parseTime('00:09')).toBe(9);
      });
    });

    describe('Edge Cases', () => {
      it('should return 0 for empty string', () => {
        expect(TimeFormatter.parseTime('')).toBe(0);
      });

      it('should return 0 for null input', () => {
        expect(TimeFormatter.parseTime(null as any)).toBe(0);
      });

      it('should return 0 for undefined input', () => {
        expect(TimeFormatter.parseTime(undefined as any)).toBe(0);
      });

      it('should return 0 for non-string input', () => {
        expect(TimeFormatter.parseTime(123 as any)).toBe(0);
        expect(TimeFormatter.parseTime({} as any)).toBe(0);
        expect(TimeFormatter.parseTime([] as any)).toBe(0);
      });

      it('should return 0 for string without colon', () => {
        expect(TimeFormatter.parseTime('130')).toBe(0);
        expect(TimeFormatter.parseTime('abc')).toBe(0);
      });

      it('should return 0 for string with too many colons', () => {
        expect(TimeFormatter.parseTime('1:30:00')).toBe(0);
        expect(TimeFormatter.parseTime('1:2:3:4')).toBe(0);
      });

      it('should return 0 for completely invalid number characters', () => {
        expect(TimeFormatter.parseTime('ab:cd')).toBe(0);
      });

      it('should handle partial numeric strings (parseInt behavior)', () => {
        // parseInt extracts numeric values from the beginning of strings
        expect(TimeFormatter.parseTime('1a:30')).toBe(90); // 1 * 60 + 30
        expect(TimeFormatter.parseTime('01:3b')).toBe(63); // 1 * 60 + 3
        expect(TimeFormatter.parseTime('2x:4y')).toBe(124); // 2 * 60 + 4
      });

      it('should handle whitespace in string (parseInt handles leading whitespace)', () => {
        expect(TimeFormatter.parseTime(' 01:30')).toBe(90); // Leading space handled by parseInt
        expect(TimeFormatter.parseTime('01:30 ')).toBe(90); // Trailing space on first part would be handled by split
        expect(TimeFormatter.parseTime(' 01 : 30 ')).toBe(90); // This will split on colon and have " 01 " and " 30 "
        // Actually, split(':') will result in [" 01 ", " 30 "], and parseInt(" 01 ", 10) = 1, parseInt(" 30 ", 10) = 30
        // So result is 1*60 + 30 = 90
      });
    });
  });

  describe('Integration Tests', () => {
    it('should be inverse operations: formatTime and parseTime', () => {
      const testCases = [0, 30, 60, 90, 125, 180, 300, 3661];

      testCases.forEach(seconds => {
        const formatted = TimeFormatter.formatTime(seconds);
        const parsed = TimeFormatter.parseTime(formatted);
        expect(parsed).toBe(seconds);
      });
    });

    it('should maintain values in round-trip conversion', () => {
      const timeStrings = ['00:00', '00:30', '01:30', '02:05', '10:45', '99:59'];

      timeStrings.forEach(timeString => {
        const parsed = TimeFormatter.parseTime(timeString);
        const formatted = TimeFormatter.formatTime(parsed);
        expect(formatted).toBe(timeString);
      });
    });

    it('should handle round-trip for maximum displayable time', () => {
      const maxTime = '99:59';
      const parsed = TimeFormatter.parseTime(maxTime);
      expect(parsed).toBe(5999);

      const formatted = TimeFormatter.formatTime(parsed);
      expect(formatted).toBe(maxTime);
    });

    it('should handle round-trip for capped values', () => {
      // Values over max get capped to 5999
      const formatted = TimeFormatter.formatTime(6000);
      expect(formatted).toBe('99:59');

      const parsed = TimeFormatter.parseTime(formatted);
      expect(parsed).toBe(5999); // Not 6000!
    });
  });

  describe('Purity Tests', () => {
    it('should return same output for same input (deterministic)', () => {
      const input = 125;
      const result1 = TimeFormatter.formatTime(input);
      const result2 = TimeFormatter.formatTime(input);
      const result3 = TimeFormatter.formatTime(input);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should not have side effects', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      TimeFormatter.formatTime(60);
      TimeFormatter.parseTime('01:00');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should be pure functions (no external state dependency)', () => {
      // Call functions multiple times in different orders
      const results1 = [
        TimeFormatter.formatTime(60),
        TimeFormatter.parseTime('01:00')
      ];

      const results2 = [
        TimeFormatter.parseTime('01:00'),
        TimeFormatter.formatTime(60)
      ];

      expect(results1[0]).toBe(results2[1]);
      expect(results1[1]).toBe(results2[0]);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid consecutive formatTime calls efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 10000; i++) {
        TimeFormatter.formatTime(i);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle rapid consecutive parseTime calls efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 10000; i++) {
        const minutes = Math.floor(i / 60);
        const seconds = i % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        TimeFormatter.parseTime(timeString);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200); // More lenient due to string building
    });
  });

  describe('Type Safety', () => {
    it('should accept number type for formatTime', () => {
      const seconds: number = 65;
      const result: string = TimeFormatter.formatTime(seconds);
      expect(typeof result).toBe('string');
    });

    it('should accept string type for parseTime', () => {
      const timeString: string = '01:05';
      const result: number = TimeFormatter.parseTime(timeString);
      expect(typeof result).toBe('number');
    });

    it('should maintain type safety with edge case inputs', () => {
      // TypeScript should allow these at compile time
      const nanResult: string = TimeFormatter.formatTime(NaN);
      const infinityResult: string = TimeFormatter.formatTime(Infinity);

      expect(typeof nanResult).toBe('string');
      expect(typeof infinityResult).toBe('string');
    });
  });

  describe('padZero (indirectly via formatTime)', () => {
    it('should pad single digit seconds', () => {
      // padZero is private, test via formatTime
      const result = TimeFormatter.formatTime(5);
      expect(result).toBe('00:05'); // Seconds padded
    });

    it('should pad single digit minutes', () => {
      const result = TimeFormatter.formatTime(300); // 5 minutes
      expect(result).toBe('05:00'); // Minutes padded
    });

    it('should not pad double digit values', () => {
      const result = TimeFormatter.formatTime(665); // 11:05
      expect(result).toBe('11:05'); // No padding on 11
    });

    it('should handle large values without padding', () => {
      const result = TimeFormatter.formatTime(5999);
      expect(result).toBe('99:59'); // 99 not padded to 099
    });
  });
});
