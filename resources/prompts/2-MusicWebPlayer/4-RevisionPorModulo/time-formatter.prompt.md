# CODE REVIEW REQUEST #4: `src/utils/time-formatter.ts`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/utils/time-formatter.ts`

**Component objective:** Provide utility functions for converting time values between seconds (number) and MM:SS formatted strings (string). Includes `formatTime()` to convert seconds to display format, `parseTime()` to convert MM:SS back to seconds, and `padZero()` helper for zero-padding. Critical for displaying elapsed time, total duration, and progress bar labels throughout the application.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR10:** Display elapsed playback time
- The elapsed time since the start of the current song is shown in MM:SS format
- Updates in real-time during playback

**FR11:** Display total song duration
- The total duration of the current song is shown in MM:SS format
- Displayed when audio metadata loads

**NFR8:** Immediate response to user interactions
- Time formatting must execute in <100ms (ideally <1ms)
- No lag during real-time updates

**Format Requirements:**
- **Output format:** MM:SS (e.g., "02:45" for 165 seconds)
- **Zero-padding:** Always two digits for minutes and seconds
- **Examples:**
  - 0 seconds → "00:00"
  - 45 seconds → "00:45"
  - 165 seconds (2:45) → "02:45"
  - 3599 seconds (59:59) → "59:59"

**Edge Cases to Handle:**
- Negative numbers → treat as 0 or return "00:00"
- NaN → return "00:00" or "--:--"
- Infinity → return max displayable or "99:59"
- Decimal values → floor to integer
- Very large numbers (>5999) → handle gracefully (hours or max value)

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────┐
│      <<utility>>                    │
│      TimeFormatter                  │
├─────────────────────────────────────┤
│ + formatTime(seconds: number):      │
│     string                          │
│ + parseTime(formatted: string):     │
│     number                          │
│ - padZero(num: number): string      │
└─────────────────────────────────────┘

Used by:
- ProgressBar component (formats currentTime and duration)
- useAudioPlayer hook (may format for logging)
```

---

## CODE TO REVIEW

(Referenced code)

---

## EVALUATION CRITERIA

### 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**

**Function Signatures:**
- [ ] `formatTime(seconds: number): string` exists and matches signature
- [ ] `parseTime(formatted: string): number` exists and matches signature
- [ ] `padZero(num: number): string` exists (can be private/internal)
- [ ] All functions are exported (except padZero which can be internal)
- [ ] No class wrapper (should be standalone functions)

**Implementation Approach:**
- [ ] Pure functions (no side effects, no state)
- [ ] Deterministic (same input always produces same output)
- [ ] No external dependencies (no imports needed)
- [ ] Standalone utility module

**Score:** __/10

**Observations:**
- Are all three functions present?
- Do signatures match exactly?
- Are functions pure and stateless?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **formatTime:** Simple arithmetic (should be < 5 cyclomatic complexity)
  - Calculate minutes: `Math.floor(seconds / 60)`
  - Calculate remaining seconds: `seconds % 60`
  - Pad and concatenate
- [ ] **parseTime:** String parsing and arithmetic (should be < 5 cyclomatic complexity)
  - Split by ":"
  - Parse integers
  - Calculate total seconds
- [ ] **padZero:** Very simple (cyclomatic complexity = 2)
  - Check if < 10
  - Add leading zero if needed

**Performance:**
- [ ] No loops (direct calculations only)
- [ ] O(1) time complexity for all functions
- [ ] Execution time < 1ms (should be instant)
- [ ] No regex (unless minimal and justified)

**Coupling:**
- [ ] Zero coupling (no dependencies)
- [ ] Self-contained module
- [ ] No imports needed

**Cohesion:**
- [ ] High cohesion (all functions related to time formatting)
- [ ] Single responsibility (time conversion utilities)
- [ ] Helper function (padZero) supports main functions

**Code Smells:**
- [ ] Check for: Long Method (should be short, ~10 lines per function)
- [ ] Check for: Magic Numbers (60 for seconds/minute is acceptable)
- [ ] Check for: Code Duplication (DRY principle)
- [ ] Check for: Unnecessary complexity (should be simple arithmetic)
- [ ] Check for: Missing edge case handling

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**formatTime Function:**
- [ ] **AC1:** Returns "00:00" for input 0
- [ ] **AC2:** Returns "00:45" for input 45
- [ ] **AC3:** Returns "02:45" for input 165
- [ ] **AC4:** Returns "59:59" for input 3599
- [ ] **AC5:** Always returns MM:SS format (two digits each)
- [ ] **AC6:** Handles negative numbers (returns "00:00" or treats as 0)
- [ ] **AC7:** Handles NaN (returns "00:00" or "--:--")
- [ ] **AC8:** Handles Infinity (returns max value like "99:59")
- [ ] **AC9:** Handles decimal values (floors to integer)
- [ ] **AC10:** Execution time < 1ms (performance requirement)

**parseTime Function:**
- [ ] **AC11:** Returns 45 for input "00:45"
- [ ] **AC12:** Returns 165 for input "02:45"
- [ ] **AC13:** Handles invalid format (returns 0 or throws?)
- [ ] **AC14:** Handles empty string (returns 0)
- [ ] **AC15:** Validates input format (MM:SS)

**padZero Function:**
- [ ] **AC16:** Returns "05" for input 5
- [ ] **AC17:** Returns "45" for input 45
- [ ] **AC18:** Returns two-character string always
- [ ] **AC19:** Handles 0-99 range correctly

**Edge Cases Matrix:**

| Input | Expected Output | Handled? |
|-------|----------------|----------|
| formatTime(0) | "00:00" | [ ] |
| formatTime(45) | "00:45" | [ ] |
| formatTime(165) | "02:45" | [ ] |
| formatTime(-10) | "00:00" | [ ] |
| formatTime(NaN) | "00:00" or "--:--" | [ ] |
| formatTime(Infinity) | "99:59" | [ ] |
| formatTime(45.8) | "00:45" | [ ] |
| formatTime(7200) | Handle hours? | [ ] |
| parseTime("02:45") | 165 | [ ] |
| parseTime("00:00") | 0 | [ ] |
| parseTime("invalid") | 0 | [ ] |
| parseTime("") | 0 | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Module-level JSDoc:**
- [ ] File-level comment explaining module purpose
- [ ] `@module` tag

**formatTime JSDoc:**
- [ ] Description of function purpose
- [ ] `@param seconds` with type and description
- [ ] `@returns` with type and description
- [ ] Multiple `@example` tags showing:
  - Zero input
  - Simple case (< 60 seconds)
  - Complex case (minutes + seconds)
  - Edge cases (negative, NaN, Infinity)

**parseTime JSDoc:**
- [ ] Description of function purpose
- [ ] `@param formatted` with format specification (MM:SS)
- [ ] `@returns` with type and description
- [ ] `@example` tags showing usage

**padZero JSDoc:**
- [ ] Description of helper function purpose
- [ ] `@param num` with range specification (0-99)
- [ ] `@returns` with type and description
- [ ] `@example` showing padding behavior

**Code Clarity:**
- [ ] Variable names are descriptive (minutes, seconds, etc.)
- [ ] Logic is clear and self-explanatory
- [ ] Minimal comments needed (self-documenting code)
- [ ] Constants defined if needed (e.g., SECONDS_PER_MINUTE = 60)

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Each function does one thing ✓
- [ ] **DRY:** padZero reused by formatTime (no duplication)
- [ ] **KISS:** Simple, straightforward logic

**Functional Programming:**
- [ ] Pure functions (no side effects)
- [ ] No mutations
- [ ] Stateless
- [ ] Composable (functions can be combined)

**TypeScript Best Practices:**
- [ ] Explicit return types on all functions
- [ ] Explicit parameter types
- [ ] No `any` types
- [ ] Type guards for edge cases (isNaN, isFinite checks)

**Performance Best Practices:**
- [ ] No unnecessary operations
- [ ] Direct calculations (no loops)
- [ ] Efficient algorithms
- [ ] No regex (or minimal regex)

**Input Validation:**
- [ ] Validates or sanitizes input
- [ ] Handles edge cases gracefully
- [ ] Doesn't throw exceptions on bad input (defensive programming)
- [ ] Returns safe defaults

**Code Style:**
- [ ] Follows Google TypeScript Style Guide
- [ ] Consistent formatting
- [ ] Proper indentation
- [ ] Named exports (not default)

**Score:** __/10

**Issues found:**

---

## DELIVERABLES

### Review Report:

**Total Score:** __/10 (weighted average)

**Calculation:**
```
Total = (Design × 0.30) + (Quality × 0.25) + (Requirements × 0.25) + (Maintainability × 0.10) + (Best Practices × 0.10)
```

---

### Executive Summary:

[Provide 2-3 lines about the general state of the code. Examples:]
- "Well-implemented utility functions with proper edge case handling. All three functions present and working correctly. Performance is excellent (<1ms). Documentation is comprehensive."
- "Core logic correct but missing edge case handling for NaN and Infinity. formatTime works for normal cases but fails on boundary conditions."
- "Critical: formatTime doesn't use padZero helper, resulting in incorrect output like '2:5' instead of '02:05'. Major format violations."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. formatTime returns incorrect format - Lines 8-12
   - Current output: "2:5" for 125 seconds
   - Expected output: "02:05"
   - Impact: Progress bar displays malformed time, breaks UI consistency
   - Proposed solution: Use padZero() for both minutes and seconds:
     return `${padZero(minutes)}:${padZero(remainingSeconds)}`;

2. No NaN handling in formatTime - Line 5
   - Impact: Returns "NaN:NaN" for invalid input, displays in UI
   - Proposed solution: Add check at start:
     if (isNaN(seconds) || !isFinite(seconds)) return "00:00";

3. parseTime doesn't validate input format - Lines 20-25
   - Impact: Throws error on invalid input, crashes component
   - Proposed solution: Add try-catch and return 0 for invalid input
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. Inconsistent handling of large numbers - formatTime Line 10
   - Current: No handling for values > 5999 (99:59)
   - Suggestion: Cap at 99:59 or implement hours format
   - Code:
     const clampedSeconds = Math.min(seconds, 5999);

2. Magic number 60 used multiple times - Lines 8, 10, 23
   - Suggestion: Define constant SECONDS_PER_MINUTE = 60
   - Benefit: Better maintainability, self-documenting

3. padZero doesn't validate range - Line 30
   - Current: Works for any number
   - Suggestion: Add assertion or clamp to 0-99 range
   - Benefit: Catches unexpected usage

4. Missing JSDoc on padZero - Line 28
   - Suggestion: Add documentation even though it's internal
   - Benefit: Clear purpose for maintainers
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ Pure functions with no side effects
- ✅ Excellent performance (O(1), <1ms execution)
- ✅ All three required functions implemented
- ✅ padZero helper reduces code duplication
- ✅ Comprehensive edge case handling (NaN, Infinity, negative)
- ✅ Self-documenting code with clear variable names
- ✅ Detailed JSDoc with multiple examples
- ✅ Proper TypeScript typing throughout

---

### Recommended Refactorings:

**REFACTORING 1: Improve edge case handling in formatTime**

```typescript
// BEFORE (basic implementation)
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

// AFTER (comprehensive edge case handling)
export function formatTime(seconds: number): string {
  // Handle edge cases
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  
  if (!isFinite(seconds)) {
    return "99:59"; // Maximum displayable time
  }
  
  // Floor to integer to handle decimal values
  const totalSeconds = Math.floor(seconds);
  
  // Cap at 99:59 (5999 seconds)
  const clampedSeconds = Math.min(totalSeconds, 5999);
  
  // Calculate minutes and seconds
  const minutes = Math.floor(clampedSeconds / 60);
  const remainingSeconds = clampedSeconds % 60;
  
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}
```

**Reason:** Handles all edge cases from requirements, prevents display bugs, ensures consistent output format.

---

**REFACTORING 2: Add input validation to parseTime**

```typescript
// BEFORE (no validation)
export function parseTime(formatted: string): number {
  const [minutes, seconds] = formatted.split(':');
  return parseInt(minutes) * 60 + parseInt(seconds);
}

// AFTER (with validation)
export function parseTime(formatted: string): number {
  // Handle empty or invalid input
  if (!formatted || typeof formatted !== 'string') {
    return 0;
  }
  
  // Split by colon
  const parts = formatted.split(':');
  
  // Validate format (should be exactly 2 parts)
  if (parts.length !== 2) {
    return 0;
  }
  
  // Parse minutes and seconds
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  
  // Validate parsed values
  if (isNaN(minutes) || isNaN(seconds)) {
    return 0;
  }
  
  // Calculate total seconds
  return minutes * 60 + seconds;
}
```

**Reason:** Prevents crashes on invalid input, provides safe default, defensive programming.

---

**REFACTORING 3: Extract magic number to constant**

```typescript
// BEFORE (magic number used multiple times)
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

export function parseTime(formatted: string): number {
  const [minutes, seconds] = formatted.split(':');
  return parseInt(minutes) * 60 + parseInt(seconds);
}

// AFTER (named constant)
const SECONDS_PER_MINUTE = 60;

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

export function parseTime(formatted: string): number {
  const [minutes, seconds] = formatted.split(':');
  return parseInt(minutes) * SECONDS_PER_MINUTE + parseInt(seconds);
}
```

**Reason:** Self-documenting code, easier to maintain, follows clean code principles.

---

**REFACTORING 4: Add comprehensive JSDoc**

```typescript
// BEFORE (minimal or no documentation)
export function formatTime(seconds: number): string {
  // implementation
}

// AFTER (comprehensive JSDoc)
/**
 * Converts a time duration in seconds to MM:SS format.
 * 
 * Formats time for display in the UI with zero-padded minutes and seconds.
 * Handles edge cases including negative numbers, NaN, Infinity, and decimals.
 * 
 * @param seconds - Time duration in seconds (will be floored to integer)
 * @returns Formatted time string in MM:SS format
 * 
 * @example
 * formatTime(0);      // Returns "00:00"
 * formatTime(45);     // Returns "00:45"
 * formatTime(165);    // Returns "02:45"
 * formatTime(3599);   // Returns "59:59"
 * formatTime(45.8);   // Returns "00:45" (floored)
 * formatTime(-10);    // Returns "00:00" (clamped)
 * formatTime(NaN);    // Returns "00:00" (safe default)
 * formatTime(Infinity); // Returns "99:59" (max displayable)
 */
export function formatTime(seconds: number): string {
  // implementation
}

/**
 * Converts a MM:SS formatted time string to seconds.
 * 
 * Parses time strings back to numeric seconds for calculations.
 * Returns 0 for invalid input formats.
 * 
 * @param formatted - Time string in MM:SS format
 * @returns Total seconds as integer, or 0 if invalid
 * 
 * @example
 * parseTime("00:45");  // Returns 45
 * parseTime("02:45");  // Returns 165
 * parseTime("00:00");  // Returns 0
 * parseTime("invalid"); // Returns 0 (safe default)
 * parseTime("");       // Returns 0 (safe default)
 */
export function parseTime(formatted: string): number {
  // implementation
}

/**
 * Pads a single-digit number with a leading zero.
 * 
 * Helper function to ensure consistent two-digit format for time display.
 * 
 * @param num - Number to pad (expected range: 0-99)
 * @returns Two-character string with leading zero if needed
 * 
 * @example
 * padZero(5);   // Returns "05"
 * padZero(45);  // Returns "45"
 * padZero(0);   // Returns "00"
 */
function padZero(num: number): string {
  // implementation
}
```

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All functions work correctly
  - Edge cases handled properly
  - Documentation complete
  - Performance excellent

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: missing edge case handling, documentation incomplete
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: incorrect format output, missing functions
  - Edge cases not handled (crashes on NaN/Infinity)
  - Must fix before ProgressBar component can use this

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- These functions are called frequently (every ~250ms during playback)
- Performance is CRITICAL - must be <1ms
- Output is displayed directly in UI - format must be exact
- Used by ProgressBar component (high visibility)

**Dependencies:**
- ProgressBar component depends on formatTime
- No dependencies on other modules (pure utility)

**What to Look For:**
- **Output format:** Exactly MM:SS with zero-padding (not M:S or M:SS)
- **Edge cases:** NaN, Infinity, negative, decimals all handled
- **Performance:** Simple arithmetic only, no loops or regex
- **Pure functions:** No side effects, deterministic

**Common Mistakes to Watch For:**
- Forgetting to use padZero (outputs "2:5" instead of "02:05")
- Not handling NaN/Infinity (displays "NaN:NaN" in UI)
- parseTime throws on invalid input (crashes component)
- Using floor() incorrectly or not at all for decimals
- Not clamping large values (displays "120:00" for 2 hours)
- Complex logic with loops (performance issue)

**Testing Checklist:**
```typescript
// Test formatTime
console.assert(formatTime(0) === "00:00", "Zero test");
console.assert(formatTime(45) === "00:45", "Seconds only test");
console.assert(formatTime(165) === "02:45", "Minutes and seconds test");
console.assert(formatTime(3599) === "59:59", "Max normal time test");
console.assert(formatTime(-10) === "00:00", "Negative test");
console.assert(formatTime(NaN) === "00:00", "NaN test");
console.assert(formatTime(Infinity) === "99:59", "Infinity test");
console.assert(formatTime(45.8) === "00:45", "Decimal test");

// Test parseTime
console.assert(parseTime("00:45") === 45, "Parse seconds test");
console.assert(parseTime("02:45") === 165, "Parse minutes test");
console.assert(parseTime("invalid") === 0, "Invalid format test");
console.assert(parseTime("") === 0, "Empty string test");

// Test padZero
console.assert(padZero(5) === "05", "Single digit test");
console.assert(padZero(45) === "45", "Double digit test");
console.assert(padZero(0) === "00", "Zero test");
```

**Performance Verification:**
```typescript
// Should complete in <1ms
const start = performance.now();
for (let i = 0; i < 10000; i++) {
  formatTime(i);
}
const duration = performance.now() - start;
console.assert(duration < 10, "Performance test: 10,000 calls in <10ms");
```
