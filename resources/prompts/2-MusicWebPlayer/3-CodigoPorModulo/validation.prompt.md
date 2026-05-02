Perfect! Let's move to **Module #3: `src/types/validation.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Type Definitions Layer - Validation Result Models

---

# PROJECT FILE STRUCTURE REMINDER

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← COMPLETED
│   │   ├── playback-error.ts          ← COMPLETED
│   │   └── validation.ts              ← CURRENT MODULE
│   ├── components/
│   │   ├── Player.tsx
│   │   ├── TrackInfo.tsx
│   │   ├── Controls.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Playlist.tsx
│   │   └── AddSongForm.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts
│   │   ├── usePlaylist.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── time-formatter.ts
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
- **FR15:** Add songs to local playlist - user can add new songs by providing title, artist, cover URL, and audio URL
- **FR18:** Real-time playlist update - when adding or removing songs, the list displayed in the interface updates immediately without reloading

**Relevant Non-Functional Requirements:**
- **NFR5:** Static typing with TypeScript in all components - all variables have explicit TypeScript types without using `any`
- **NFR9:** Proper error handling without application blocking - display clear error messages when validation fails
- **NFR11:** Standardized song data structure - each song must contain: `title` (string), `artist` (string), `cover` (string URL), `url` (string URL)
- **NFR12:** Clear user feedback about playback issues - understandable notifications when validation fails

**Validation Requirements (from Section 13.1):**

| Error Type | Handling |
|------------|----------|
| Unsupported audio format | Validate format before adding, display error message with allowed formats |
| Invalid cover URL | Display placeholder image or generic music icon |
| Invalid audio URL | Reject song addition with clear error message |

## 2. Class Diagram (Relevant Section)

```typescript
class ValidationResult {
    <<interface>>
    +isValid: boolean
    +errors: string[]
}

class AudioValidator {
    <<utility>>
    +isValidAudioUrl(url: string): boolean
    +isValidImageUrl(url: string): boolean
    +isSupportedFormat(url: string): boolean
    +validateSong(song: Song): ValidationResult
}
```

**Relationships:**
- Used by: `AudioValidator` utility (returns ValidationResult)
- Used by: `AddSongForm` component (displays validation errors)
- Used by: `usePlaylist` hook (validates before adding songs)

## 3. Use Case Diagram (Relevant Use Cases)

- **Add Song to Playlist:** User provides song data → System validates data → Success or error feedback
- **Validate Song Data:** System checks all required fields and URL formats
- **Display Error Message:** System shows specific validation errors to user

---

# SPECIFIC TASK

Implement the TypeScript type definition file: **`src/types/validation.ts`**

## Responsibilities:

1. **Define the ValidationResult interface** to structure validation outcomes
2. **Ensure type safety** for validation operations throughout the application
3. **Provide clear documentation** for validation result properties
4. **Support multiple validation errors** (not just first error)
5. **Export ValidationResult** for use in validators and forms

## Interface to define:

### **ValidationResult**

An interface representing the outcome of a validation operation.

#### Properties:

##### **isValid: boolean**
   - Description: Indicates whether the validation passed (true) or failed (false)
   - Purpose: Quick check to determine if data is valid without examining errors array
   - Required: Yes
   - Usage: `if (result.isValid) { /* proceed */ } else { /* show errors */ }`
   - Examples:
     - `true` - All validation checks passed
     - `false` - One or more validation checks failed

##### **errors: string[]**
   - Description: Array of human-readable error messages describing validation failures
   - Purpose: Provide specific, actionable feedback to users about what needs to be fixed
   - Required: Yes (but can be empty array when isValid is true)
   - Constraints: 
     - Should be empty array `[]` when `isValid` is `true`
     - Should contain one or more messages when `isValid` is `false`
     - Each message should be user-friendly and actionable
   - Message format guidelines:
     - Clear and specific: "Title is required" not "Invalid input"
     - Actionable: "Audio URL must start with http:// or https://" not "Bad URL"
     - Non-technical: Avoid jargon like "regex", "null pointer", etc.
   - Examples:
     - Valid case: `[]` (empty array)
     - Single error: `["Title is required"]`
     - Multiple errors: `["Title is required", "Audio URL must be a valid HTTP/HTTPS URL", "Audio format must be MP3, WAV, OGG, or M4A"]`

#### Additional considerations:

**Optional properties to consider:**
- `warnings?: string[]` - Non-critical issues that don't prevent submission
  - Example: "Cover image URL returns 404, placeholder will be used"
- `field?: string` - Which specific field failed (useful for form highlighting)
  - Example: "title", "artist", "url"
- `code?: string` - Machine-readable error code for programmatic handling
  - Example: "REQUIRED_FIELD", "INVALID_URL_FORMAT"
- (For now, keep minimal per requirements - include only if beneficial)

**Design patterns:**
- **Result Pattern:** ValidationResult follows the Result pattern (success/failure with details)
- **Type Guard Support:** Should work well with TypeScript type guards
- **Immutability:** Consider if properties should be readonly

## Validation scenarios this type will support:

1. **Song validation (complete object):**
   ```typescript
   // All fields valid
   { isValid: true, errors: [] }
   
   // Missing title and invalid URL
   { isValid: false, errors: ["Title is required", "Audio URL is invalid"] }
   ```

2. **Individual field validation:**
   ```typescript
   // Valid audio URL
   { isValid: true, errors: [] }
   
   // Invalid URL format
   { isValid: false, errors: ["URL must start with http:// or https://"] }
   ```

3. **Format validation:**
   ```typescript
   // Supported format
   { isValid: true, errors: [] }
   
   // Unsupported format
   { isValid: false, errors: ["Audio format must be MP3, WAV, OGG, or M4A"] }
   ```

## Type guard consideration:

The interface should support type guard patterns like:
```typescript
function isValidResult(result: ValidationResult): result is ValidationResult & { isValid: true } {
  return result.isValid && result.errors.length === 0;
}
```

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **File location:** `src/types/validation.ts`
- **Naming convention:** 
  - PascalCase for interface name (`ValidationResult`)
  - camelCase for properties (`isValid`, `errors`)
- **No runtime code:** Type definitions only
- **Strict typing:** No `any` types allowed

## Mandatory best practices:

- **Complete JSDoc documentation** on interface and each property
- **Use TypeScript interface** (not type alias, unless there's a reason)
- **Export properly:** Use named export for ValidationResult
- **Semantic naming:** Names should clearly indicate their purpose
- **Consistency:** Follow common validation result patterns in TypeScript ecosystem

## Documentation requirements:

- **Interface-level JSDoc:** Describe what ValidationResult represents and when it's used
- **Property-level JSDoc:** Document each property with:
  - `@property` tag
  - Description of what it represents
  - Expected values and constraints
  - Examples of valid states
- **Usage examples:** Show common validation scenarios in comments
- **Invariants:** Document any guarantees (e.g., "errors array is empty when isValid is true")

## TypeScript-specific:

- Enable strict null checks compatibility
- Ensure compatibility with TypeScript strict mode
- Consider discriminated union if different result types needed
- Support type narrowing based on isValid property

---

# DELIVERABLES

## 1. Complete source code of `src/types/validation.ts` with:

- Proper file header comment with module description
- Import statements (if any - none expected)
- Complete JSDoc documentation for the interface
- JSDoc documentation for each property
- Properly exported ValidationResult interface
- Clean, readable code following Google TypeScript Style Guide

## 2. Inline documentation:

- JSDoc comments explaining purpose of ValidationResult
- Examples of valid and invalid validation results
- Notes about the relationship between isValid and errors array
- Usage examples showing how to create and consume ValidationResult

## 3. Type considerations documented:

- Explain choice of interface vs type alias
- Justify inclusion/exclusion of optional properties (warnings, field, code)
- Note any invariants (e.g., empty errors when isValid is true)
- Document design pattern used (Result pattern)

## 4. Usage examples (in comments):

- Example of successful validation result
- Example of failed validation with single error
- Example of failed validation with multiple errors
- Example of type guard usage
- Example of consuming result in form component

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here with:
// - File header comment
// - JSDoc documentation
// - Interface definition
// - Export statement
// - Usage examples in comments
```

**Design decisions made:**
- [Decision 1: Interface vs type alias - which and why]
- [Decision 2: Readonly properties or mutable]
- [Decision 3: Optional properties - which to include and justification]
- [Decision 4: Error message format and structure]
- [Decision 5: Support for warnings separate from errors]

**Validation strategy:**
- [How this type supports the application's validation approach]
- [Integration with AudioValidator utility]
- [How validation results flow from validators to UI components]
- [Relationship between ValidationResult and user feedback]

**Possible future improvements:**
- [Improvement 1: Field-specific errors with field identifiers]
- [Improvement 2: Error severity levels (error vs warning)]
- [Improvement 3: Error codes for programmatic handling]
- [Improvement 4: Localization support for error messages]
- [Improvement 5: Validation metadata (which validator produced result)]
- [Improvement 6: Support for async validation results]

---

**REMINDER:** This is a **type definition file only** - no runtime code, no implementations, only TypeScript type definitions with excellent documentation. Focus on creating a reusable, clear validation result type that supports the application's validation needs.
