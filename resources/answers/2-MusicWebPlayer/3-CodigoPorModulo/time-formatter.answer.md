# Respuesta

### Respuesta {toggle="true"}
```markdown
Here's the complete implementation for `src/utils/time-formatter.ts` according to your requirements:

```typescript
/**
 * @module Utilities/TimeFormatter
 * @category Utilities
 * @description
 * This module provides utility functions for formatting and parsing time values
 * in the Music Web Player application. It handles conversion between seconds
 * and MM:SS formatted strings for display in the UI.
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
    if (isNaN(seconds) || !isFinite(seconds)) {
      return "00:00";
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
```

---

### Design Decisions Made:

1. **Handling NaN**:
   - **Decision**: Return "00:00" for NaN input.
   - **Justification**: This provides a consistent display when invalid time values are encountered, rather than showing an error or blank value.

2. **Handling Infinity**:
   - **Decision**: Return "00:00" for Infinity (treated as invalid).
   - **Alternative Considered**: Return "99:59" (max displayable).
   - **Justification**: Treating Infinity as invalid is more consistent with how we handle other invalid inputs, and "00:00" is a safer default.

3. **Handling Negative Numbers**:
   - **Decision**: Treat negative numbers as 0.
   - **Justification**: Negative time values don't make sense in this context, and treating them as 0 provides a consistent behavior.

4. **Support for Hour Format**:
   - **Decision**: Support up to "99:59" (99 minutes, 59 seconds).
   - **Alternative Considered**: Implement HH:MM:SS for songs longer than 1 hour.
   - **Justification**: The current design meets the requirements and keeps the implementation simple. Hour format can be added later if needed.

5. **Implementing parseTime**:
   - **Decision**: Implemented parseTime as specified.
   - **Justification**: This function is useful for testing and potential future features like manual time entry.

6. **Flooring Decimal Seconds**:
   - **Decision**: Use `Math.floor()` to convert decimal seconds to integers.
   - **Justification**: This matches the common behavior in media players where fractional seconds are not displayed.

---

### Edge Cases Handled:

**formatTime:**
- Zero seconds → "00:00"
- Negative numbers → "00:00" (treated as 0)
- NaN → "00:00"
- Infinity → "00:00" (treated as invalid)
- Decimal seconds → Floored to integer
- Very large numbers (>5999) → Capped at "99:59" (MAX_DISPLAYABLE_SECONDS)

**parseTime:**
- Invalid format → 0
- Empty string → 0
- Non-numeric parts → 0
- Missing colon → 0 (invalid format)
- Extra parts (e.g., "1:2:3") → 0 (only processes first two parts)

**padZero:**
- Single digit → Zero-padded
- Double digit → No padding
- Negative numbers → Absolute value (handled in padZero)
- Decimal numbers → Floored to integer

---

### Performance Considerations:

- **formatTime**:
  - Uses simple math operations (division and modulus) for calculation.
  - Avoids regex or complex string manipulation.
  - Executes in constant time O(1).

- **parseTime**:
  - Uses string split and parseInt for parsing.
  - Validates input before processing.
  - Executes in constant time O(1).

- **padZero**:
  - Uses simple conditional check and string concatenation.
  - Executes in constant time O(1).

All functions are pure and have no side effects, making them safe to use in any context.

---

### Possible Future Improvements:

1. **Support for Hour Format**:
   - Extend `formatTime` to handle hours (HH:MM:SS) for songs longer than 99 minutes.
   - Example: `formatTime(3600)` → "01:00:00"

2. **Support for Milliseconds**:
   - Add optional millisecond precision (MM:SS.mmm) for precise seeking.
   - Example: `formatTime(165.456)` → "02:45.456"

3. **Localization**:
   - Support different time format preferences based on locale.
   - Example: Some locales might prefer "2:45" instead of "02:45".

4. **Human-Readable Format**:
   - Add a method to return human-readable strings like "2 minutes, 45 seconds".

5. **Compact Format for Mobile**:
   - Add a method to return compact format (e.g., "2:45" instead of "02:45") for mobile displays.

6. **Duration Formatting with Units**:
   - Add a method to return formatted durations with units (e.g., "2m 45s").

7. **Custom Maximum Displayable Time**:
   - Make `MAX_DISPLAYABLE_SECONDS` configurable for different use cases.

8. **Strict Mode for parseTime**:
   - Add a strict mode that throws errors for invalid formats instead of returning 0.
```