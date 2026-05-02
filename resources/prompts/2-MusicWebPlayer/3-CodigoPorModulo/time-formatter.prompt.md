Perfect! Let's move to **Module #4: `src/utils/time-formatter.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Utilities Layer - Time Formatting Functions

---

# PROJECT FILE STRUCTURE REMINDER

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← COMPLETED
│   │   ├── playback-error.ts          ← COMPLETED
│   │   └── validation.ts              ← COMPLETED
│   ├── components/
│   │   ├── Player.tsx
│   │   ├── TrackInfo.tsx
│   │   ├── Controls.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Playlist.tsx
│   │       └── AddSongForm.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts
│   │   ├── usePlaylist.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── time-formatter.ts          ← CURRENT MODULE
│   │   ├── error-handler.ts
│   │   └── audio-validator.ts
│   ├── data/
│   │   └── playlist-data-provider.ts
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR10:** Display elapsed playback time - the elapsed time since the start of the current song is shown in MM:SS format, updating in real-time
- **FR11:** Display total song duration - the total duration of the current song is shown in MM:SS format
- **FR12:** Visual progress bar updated in real-time - a progress bar visually reflects the percentage of playback completed, updating continuously during playback

**Relevant Non-Functional Requirements:**
- **NFR5:** Static typing with TypeScript in all components - all functions have explicit TypeScript types
- **NFR8:** Immediate response to user interactions - UI updates respond in less than 100ms
- **NFR7:** Legible typography and contrasting colors - texts have a minimum size of 14px, sufficient contrast

**Time Display Requirements:**
- Format: MM:SS (e.g., "02:45" for 2 minutes 45 seconds, "10:30" for 10 minutes 30 seconds)
- Real-time updates: Must update smoothly during playback
- Edge cases: Handle 0 seconds, very long durations (99:59+), negative values, NaN, Infinity

## 2. Class Diagram (Relevant Section)

```typescript
class TimeFormatter {
    <<utility>>
    +formatTime(seconds: number): string
    +parseTime(formatted: string): number
    -padZero(num: number): string
}
```

**Relationships:**
- Used by: `ProgressBar` component (displays elapsed and total time)
- Used by: `useAudioPlayer` hook (formats currentTime and duration)
- May be used by: `Playlist` component (display song durations if added)

## 3. Use Case Diagram (Relevant Use Cases)

- **View Elapsed Time:** User sees current playback position formatted as MM:SS
- **View Total Duration:** User sees total song length formatted as MM:SS
- **View Playback Progress:** User sees visual progress bar with time indicators

---

# SPECIFIC TASK

Implement the utility module: **`src/utils/time-formatter.ts`**

## Responsibilities:

1. **Format time values** from seconds (number) to MM:SS string format
2. **Parse time strings** from MM:SS format back to seconds (number) - optional but useful
3. **Handle edge cases** gracefully (0, negative, NaN, Infinity, very large numbers)
4. **Provide helper functions** for consistent time display across the application
5. **Ensure performance** for real-time updates (must execute in <1ms)

## Methods to implement:

### 1. **formatTime(seconds: number): string**

Converts a time value in seconds to MM:SS format.

- **Description:** Takes a numeric value representing seconds and returns a formatted string in MM:SS format with zero-padding
- **Parameters:**
  - `seconds` (number): Time value in seconds (can be decimal, will be rounded/floored)
- **Returns:** 
  - `string`: Formatted time string in MM:SS format
- **Examples:**
  - `formatTime(0)` → `"00:00"`
  - `formatTime(45)` → `"00:45"`
  - `formatTime(90)` → `"01:30"`
  - `formatTime(165)` → `"02:45"`
  - `formatTime(3599)` → `"59:59"`
  - `formatTime(3600)` → `"60:00"` (or `"1:00:00"` if supporting hours)
  - `formatTime(125.7)` → `"02:05"` (decimal seconds floored)
- **Preconditions:** 
  - Accepts any number (validate and handle invalid inputs)
  - Should handle negative numbers (treat as 0 or absolute value)
  - Should handle NaN (return "00:00" or "--:--")
  - Should handle Infinity (return "99:59" or maximum displayable value)
- **Postconditions:** 
  - Always returns a valid MM:SS string
  - Minutes and seconds are zero-padded (e.g., "01:05" not "1:5")
  - Never throws exceptions
- **Edge cases:**
  - Negative numbers: `formatTime(-10)` → `"00:00"` (treat as 0)
  - NaN: `formatTime(NaN)` → `"00:00"` or `"--:--"`
  - Infinity: `formatTime(Infinity)` → `"99:59"` (max displayable)
  - Very large numbers: `formatTime(99999)` → Handle gracefully (hours format or max value)
  - Decimals: `formatTime(45.8)` → `"00:45"` (floor to integer seconds)
  - Zero: `formatTime(0)` → `"00:00"`

**Implementation considerations:**
- Use `Math.floor()` to convert decimals to integers
- Calculate minutes: `Math.floor(seconds / 60)`
- Calculate remaining seconds: `seconds % 60`
- Use `padZero()` helper for zero-padding
- Handle edge cases before processing

### 2. **parseTime(formatted: string): number**

Converts a MM:SS formatted string back to seconds (optional but useful for testing/future features).

- **Description:** Takes a formatted time string and returns the equivalent value in seconds
- **Parameters:**
  - `formatted` (string): Time string in MM:SS or HH:MM:SS format
- **Returns:** 
  - `number`: Time value in seconds
- **Examples:**
  - `parseTime("00:00")` → `0`
  - `parseTime("00:45")` → `45`
  - `parseTime("01:30")` → `90`
  - `parseTime("02:45")` → `165`
  - `parseTime("59:59")` → `3599`
  - `parseTime("1:00:00")` → `3600` (if supporting hours)
- **Preconditions:** 
  - Expects string in MM:SS format
  - Should validate format (regex or split validation)
  - Should handle invalid formats gracefully
- **Postconditions:** 
  - Returns valid number of seconds
  - Returns 0 for invalid input
  - Never throws exceptions
- **Edge cases:**
  - Invalid format: `parseTime("abc")` → `0`
  - Empty string: `parseTime("")` → `0`
  - Missing parts: `parseTime("05")` → `0` or `5` (implementation choice)
  - Extra parts: `parseTime("01:30:45:99")` → Parse first valid parts or return 0

**Implementation considerations:**
- Split string by ":" delimiter
- Validate parts are numbers
- Calculate: `(minutes * 60) + seconds`
- Handle hours if format includes them (HH:MM:SS)
- Return 0 for invalid input

### 3. **padZero(num: number): string** (private/helper)

Adds leading zero to single-digit numbers.

- **Description:** Takes a number and returns it as a string with leading zero if less than 10
- **Parameters:**
  - `num` (number): Numeric value to pad (typically 0-99)
- **Returns:** 
  - `string`: Zero-padded string
- **Examples:**
  - `padZero(0)` → `"00"`
  - `padZero(5)` → `"05"`
  - `padZero(9)` → `"09"`
  - `padZero(10)` → `"10"`
  - `padZero(45)` → `"45"`
  - `padZero(99)` → `"99"`
- **Preconditions:** 
  - Expects integer (round if decimal)
  - Expects positive number (0-99 typically)
- **Postconditions:** 
  - Returns two-character string
  - Leading zero if num < 10
- **Implementation considerations:**
  - Simple: `num < 10 ? '0' + num : String(num)`
  - Or: `String(num).padStart(2, '0')`
  - Handle edge cases (negative, decimals)

---

## Dependencies:

- **Classes it must use:** None (pure utility functions)
- **Interfaces it implements:** None
- **External services it consumes:** None
- **Type imports:** None required (uses primitive types only)

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 5 per function (keep logic simple)
- **Maximum method length:** 30 lines per function
- **Pure functions:** All functions should be pure (no side effects, deterministic)
- **Performance:** Each function must execute in <1ms for real-time updates

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Each function does one thing (format, parse, pad)
  - **Open/Closed:** Functions are complete but can be extended
- **Input parameter validation:**
  - Check for NaN, Infinity, negative numbers
  - Handle invalid string formats in parseTime
  - Never throw exceptions, return safe defaults
- **Robust exception handling:**
  - Use defensive programming
  - Return "00:00" or 0 for invalid inputs
  - No try-catch needed (no exceptions thrown)
- **No logging needed:** These are simple pure functions
- **Comments for complex logic:**
  - Explain edge case handling
  - Document format expectations

## Documentation:

- **JSDoc on all exported functions:**
  - `@param` for each parameter with type and description
  - `@returns` with type and description
  - `@example` showing common usage
  - `@throws` if applicable (should be none)
- **Inline comments:**
  - Explain edge case handling
  - Document magic numbers if any

## Security:

- **Input sanitization:** Validate numeric input, handle edge cases
- **No injection risks:** String operations are safe (no eval, no DOM manipulation)

---

# DELIVERABLES

## 1. Complete source code of `src/utils/time-formatter.ts` with:

- Organized imports (if any)
- Constants/configurations at the beginning (e.g., MAX_TIME = 5999 for 99:59)
- Fully implemented functions:
  - `formatTime(seconds: number): string`
  - `parseTime(formatted: string): number`
  - `padZero(num: number): string`
- Complete JSDoc documentation on all exported functions
- Inline comments for edge case handling

## 2. Inline documentation:

- Justification of edge case handling decisions
  - Why NaN returns "00:00"
  - Why Infinity returns "99:59"
  - Why negative numbers are treated as 0
- Comments explaining any non-obvious logic
- TODOs if hour format support is pending

## 3. Edge cases considered:

- **formatTime:**
  - Zero seconds → "00:00"
  - Negative numbers → "00:00" (treated as 0)
  - NaN → "00:00" or "--:--"
  - Infinity → "99:59" (maximum displayable)
  - Decimal seconds → Floored to integer
  - Very large numbers (>5999) → Hours format or max value
- **parseTime:**
  - Invalid format → 0
  - Empty string → 0
  - Non-numeric parts → 0
  - Missing colon → 0
- **padZero:**
  - Single digit → Zero-padded
  - Double digit → No padding
  - Negative → Absolute value (or handled in caller)

## 4. Performance considerations:

- Avoid regex if possible for formatTime (use math operations)
- Simple string operations for padding
- No loops for formatting (direct calculations)
- Minimal object allocation

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: How to handle NaN (return "00:00" vs "--:--")]
- [Decision 2: How to handle Infinity (return max value "99:59" vs throw error)]
- [Decision 3: How to handle negative numbers (treat as 0 vs absolute value)]
- [Decision 4: Whether to support hour format (HH:MM:SS) or just MM:SS]
- [Decision 5: Whether parseTime is implemented or deferred]
- [Decision 6: Flooring vs rounding decimal seconds]

**Edge cases handled:**
- [List all edge cases and how they're handled]
- [Rationale for each decision]

**Possible future improvements:**
- [Improvement 1: Support for hour format (HH:MM:SS) for songs >99 minutes]
- [Improvement 2: Support for milliseconds display (MM:SS.mmm) for precise seeking]
- [Improvement 3: Localization for different time format preferences]
- [Improvement 4: Human-readable format ("2 minutes, 45 seconds")]
- [Improvement 5: Compact format for mobile ("2:45" instead of "02:45")]
- [Improvement 6: Duration formatting with units ("2m 45s")]

---

**REMINDER:** These are **pure utility functions** - no side effects, no state, no external dependencies. Focus on simplicity, performance, and robust edge case handling. Every function should be deterministic and safe to call with any input.
