/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/utils/time-formatter.ts
 * @desc Provides utility functions for formatting and parsing time values in the Music Web Player application.
 *       It handles conversion between seconds and MM:SS formatted strings for display in the UI.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

// Maximum displayable time in seconds (99:59)
const MAX_DISPLAYABLE_SECONDS = 5999;

/**
 * Utility class for formatting and parsing time values.
 * All methods are static and pure functions with no side effects.
 */
export class TimeFormatter {
  /**
   * Converts a time value in seconds to MM:SS format.
   * @param seconds - Time value in seconds (can be decimal)
   * @returns Formatted time string in MM:SS format
   * @example
   * TimeFormatter.formatTime(0)     // "00:00"
   * TimeFormatter.formatTime(45)    // "00:45"
   * TimeFormatter.formatTime(90)    // "01:30"
   * TimeFormatter.formatTime(165)   // "02:45"
   * TimeFormatter.formatTime(3599)  // "59:59"
   * TimeFormatter.formatTime(3600)  // "60:00" (1 hour)
   * TimeFormatter.formatTime(-10)   // "00:00" (negative treated as 0)
   * TimeFormatter.formatTime(NaN)   // "00:00"
   * TimeFormatter.formatTime(Infinity) // "99:59" (max displayable)
   */
  public static formatTime(seconds: number): string {
    // Handle edge cases
    if (isNaN(seconds) || seconds < 0) {
      return "00:00";
    }

    if (!isFinite(seconds)) {
      // Infinity => show maximum displayable time
      return `${this.padZero(Math.floor(MAX_DISPLAYABLE_SECONDS / 60))}:${this.padZero(MAX_DISPLAYABLE_SECONDS % 60)}`;
    }

    // Convert to integer and handle negative values
    const totalSeconds = Math.max(0, Math.floor(seconds));

    // Cap at maximum displayable value
    const displaySeconds = Math.min(totalSeconds, MAX_DISPLAYABLE_SECONDS);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(displaySeconds / 60);
    const remainingSeconds = displaySeconds % 60;

    // Format with zero-padding
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  }

  /**
   * Converts a MM:SS formatted string back to seconds.
   * @param formatted - Time string in MM:SS format
   * @returns Time value in seconds, or 0 for invalid input
   * @example
   * TimeFormatter.parseTime("00:00")  // 0
   * TimeFormatter.parseTime("00:45")  // 45
   * TimeFormatter.parseTime("01:30")  // 90
   * TimeFormatter.parseTime("02:45")  // 165
   * TimeFormatter.parseTime("abc")    // 0 (invalid format)
   * TimeFormatter.parseTime("")       // 0 (empty string)
   */
  public static parseTime(formatted: string): number {
    if (!formatted || typeof formatted !== 'string') {
      return 0;
    }

    const parts = formatted.split(':');
    if (parts.length !== 2) {
      return 0;
    }

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    // Validate that both parts are valid numbers
    if (isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }

    return (minutes * 60) + seconds;
  }

  /**
   * Adds leading zero to single-digit numbers.
   * @param num - Numeric value to pad (0-99)
   * @returns Zero-padded string
   * @private
   */
  private static padZero(num: number): string {
    // Handle edge cases (negative, decimal, etc.)
    const integerNum = Math.abs(Math.floor(num));
    return integerNum < 10 ? `0${integerNum}` : `${integerNum}`;
  }
}
