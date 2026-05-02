Perfect! Let's move to **Module #14: `src/components/AddSongForm.tsx`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Components Layer - Presentational Components (Form for Adding Songs)

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
│   │   ├── TrackInfo.tsx              ← COMPLETED
│   │   ├── Controls.tsx               ← COMPLETED
│   │   ├── ProgressBar.tsx            ← COMPLETED
│   │   ├── Playlist.tsx
│   │   └── AddSongForm.tsx            ← CURRENT MODULE
│   ├── hooks/
│   │   ├── useAudioPlayer.ts          ← COMPLETED
│   │   ├── usePlaylist.ts             ← COMPLETED
│   │   └── useLocalStorage.ts         ← COMPLETED
│   ├── utils/
│   │   ├── time-formatter.ts          ← COMPLETED
│   │   ├── error-handler.ts           ← COMPLETED
│   │   └── audio-validator.ts         ← COMPLETED
│   ├── data/
│   │   └── playlist-data-provider.ts  ← COMPLETED
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# CODE STRUCTURE REMINDER

```typescript
import React, {useState} from 'react';
import {Song} from '@types/song';
import {AudioValidator} from '@utils/audio-validator';

/**
 * Props for the AddSongForm component.
 * @category Components
 */
export interface AddSongFormProps {
  /** Callback when a new song is added */
  onAddSong: (song: Song) => void;
}

/**
 * State for the AddSongForm component.
 * @category Components
 */
export interface AddSongFormState {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

/**
 * Component that provides a form to add new songs to the playlist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const AddSongForm: React.FC<AddSongFormProps> = (props) => {
  const [formState, setFormState] = useState<AddSongFormState>({
    title: '',
    artist: '',
    cover: '',
    url: '',
  });

  const handleSubmit = (event: React.FormEvent): void => {
    // TODO: Implementation
  };

  const handleInputChange = (field: string, value: string): void => {
    // TODO: Implementation
  };

  const validateForm = (): boolean => {
    // TODO: Implementation
    return false;
  };

  const resetForm = (): void => {
    // TODO: Implementation
  };

  // TODO: Implementation
  return (
    <form className="add-song-form" onSubmit={handleSubmit}>
      {/* TODO: Render form fields */}
    </form>
  );
};
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR15:** Add songs to local playlist - the user can add new songs by providing title, artist, cover URL, and audio URL
- **FR18:** Real-time playlist update - when adding or removing songs, the list displayed in the interface updates immediately without reloading

**Relevant Non-Functional Requirements:**
- **NFR3:** Modular code with separate React components
- **NFR5:** Static typing with TypeScript in all components
- **NFR6:** Intuitive and accessible interface - forms have validation and visual feedback
- **NFR8:** Immediate response to user interactions - form validation responds in less than 100ms
- **NFR9:** Proper error handling without application blocking - validation errors displayed clearly

**Validation Requirements (from Section 13.1):**
- All fields required (title, artist, cover URL, audio URL)
- URLs must be valid (HTTP/HTTPS or relative paths)
- Audio URL must have supported format (.mp3, .wav, .ogg, .m4a)
- Clear error messages for each validation failure

**UI Design Specifications:**
- **Form style:** Card with padding, background color
- **Input fields:** Full width, clear labels, padding 12px vertical, 16px horizontal
- **Submit button:** Full width, primary color, prominent
- **Error messages:** Red text below invalid fields
- **Success feedback:** Brief confirmation, form resets

## 2. Class Diagram (Relevant Section)

```typescript
class AddSongForm {
    +props: AddSongFormProps
    +state: AddSongFormState
    +render(): JSX.Element
    +handleSubmit(event: FormEvent): void
    +handleInputChange(field: string, value: string): void
    -validateForm(): boolean
    -resetForm(): void
}

class AddSongFormProps {
    +onAddSong: Function
}

class AddSongFormState {
    +title: string
    +artist: string
    +cover: string
    +url: string
}

// Used by AddSongForm
class AudioValidator {
    <<utility>>
    +validateSong(song: Song): ValidationResult
}

class Song {
    <<interface>>
    +id: string
    +title: string
    +artist: string
    +cover: string
    +url: string
}

class ValidationResult {
    <<interface>>
    +isValid: boolean
    +errors: string[]
}
```

**Relationships:**
- Used by: `Playlist` component (renders AddSongForm at bottom of playlist)
- Uses: `AudioValidator` utility (validates form data before submission)
- Uses: `Song` interface (creates Song object on submit)
- Uses: `ValidationResult` interface (displays validation errors)
- Stateful component: Manages form input state

## 3. Use Case Diagram (Relevant Use Cases)

- **Add Song to Playlist:** User fills form → Clicks submit → System validates → Song added or errors shown
- **Validate Song Data:** System checks all fields and URLs before accepting
- **Display Validation Errors:** System shows specific errors for each invalid field
- **Reset Form:** After successful submission, form clears for next entry

---

# SPECIFIC TASK

Implement the React component: **`src/components/AddSongForm.tsx`**

## Responsibilities:

1. **Render form inputs** for title, artist, cover URL, and audio URL
2. **Manage form state** for all input fields
3. **Handle input changes** and update state in real-time
4. **Validate form data** before submission using AudioValidator
5. **Display validation errors** clearly for each field
6. **Handle form submission** and delegate to parent callback
7. **Reset form** after successful submission
8. **Provide accessible form** with labels, error messages, and keyboard support
9. **Generate unique song ID** for new songs

## Component Structure:

### **AddSongForm Component**

A stateful component that manages form inputs and validation.

- **Description:** Form for adding new songs to the playlist with validation and error handling
- **Type:** Functional Component (React.FC)
- **Props:** AddSongFormProps interface
- **State:** Form field values and validation errors
- **Returns:** JSX.Element

---

## Props Interface:

### **AddSongFormProps**

```typescript
/**
 * Props for the AddSongForm component
 */
interface AddSongFormProps {
  /**
   * Callback function when a valid song is submitted
   * Receives the complete Song object
   * @param song - The new song to add to the playlist
   */
  onAddSong: (song: Song) => void;
}
```

---

## State Management:

### **Form Field State**

```typescript
interface FormState {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

// Using useState
const [formData, setFormData] = useState<FormState>({
  title: '',
  artist: '',
  cover: '',
  url: ''
});
```

### **Validation Error State**

```typescript
const [errors, setErrors] = useState<string[]>([]);
```

Or more detailed per-field errors:

```typescript
interface FieldErrors {
  title?: string;
  artist?: string;
  cover?: string;
  url?: string;
}

const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
```

### **Submission State (Optional)**

```typescript
const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
```

---

## Component Implementation Details:

### **JSX Structure:**

```jsx
<form className="add-song-form" onSubmit={handleSubmit} noValidate>
  <h3 className="add-song-form__title">Add New Song</h3>
  
  {/* Global error messages */}
  {errors.length > 0 && (
    <div className="add-song-form__errors" role="alert">
      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )}
  
  {/* Success message */}
  {submitSuccess && (
    <div className="add-song-form__success" role="status">
      Song added successfully!
    </div>
  )}
  
  {/* Title input */}
  <div className="add-song-form__field">
    <label htmlFor="song-title" className="add-song-form__label">
      Title *
    </label>
    <input
      type="text"
      id="song-title"
      name="title"
      value={formData.title}
      onChange={(e) => handleInputChange('title', e.target.value)}
      className={`add-song-form__input ${fieldErrors.title ? 'add-song-form__input--error' : ''}`}
      placeholder="Enter song title"
      required
      aria-invalid={!!fieldErrors.title}
      aria-describedby={fieldErrors.title ? "title-error" : undefined}
    />
    {fieldErrors.title && (
      <span id="title-error" className="add-song-form__error-message" role="alert">
        {fieldErrors.title}
      </span>
    )}
  </div>
  
  {/* Artist input */}
  <div className="add-song-form__field">
    <label htmlFor="song-artist" className="add-song-form__label">
      Artist *
    </label>
    <input
      type="text"
      id="song-artist"
      name="artist"
      value={formData.artist}
      onChange={(e) => handleInputChange('artist', e.target.value)}
      className={`add-song-form__input ${fieldErrors.artist ? 'add-song-form__input--error' : ''}`}
      placeholder="Enter artist name"
      required
      aria-invalid={!!fieldErrors.artist}
      aria-describedby={fieldErrors.artist ? "artist-error" : undefined}
    />
    {fieldErrors.artist && (
      <span id="artist-error" className="add-song-form__error-message" role="alert">
        {fieldErrors.artist}
      </span>
    )}
  </div>
  
  {/* Cover URL input */}
  <div className="add-song-form__field">
    <label htmlFor="song-cover" className="add-song-form__label">
      Cover Image URL *
    </label>
    <input
      type="url"
      id="song-cover"
      name="cover"
      value={formData.cover}
      onChange={(e) => handleInputChange('cover', e.target.value)}
      className={`add-song-form__input ${fieldErrors.cover ? 'add-song-form__input--error' : ''}`}
      placeholder="https://example.com/cover.jpg"
      required
      aria-invalid={!!fieldErrors.cover}
      aria-describedby={fieldErrors.cover ? "cover-error" : undefined}
    />
    {fieldErrors.cover && (
      <span id="cover-error" className="add-song-form__error-message" role="alert">
        {fieldErrors.cover}
      </span>
    )}
  </div>
  
  {/* Audio URL input */}
  <div className="add-song-form__field">
    <label htmlFor="song-url" className="add-song-form__label">
      Audio File URL *
    </label>
    <input
      type="url"
      id="song-url"
      name="url"
      value={formData.url}
      onChange={(e) => handleInputChange('url', e.target.value)}
      className={`add-song-form__input ${fieldErrors.url ? 'add-song-form__input--error' : ''}`}
      placeholder="https://example.com/song.mp3"
      required
      aria-invalid={!!fieldErrors.url}
      aria-describedby={fieldErrors.url ? "url-error" : undefined}
    />
    {fieldErrors.url && (
      <span id="url-error" className="add-song-form__error-message" role="alert">
        {fieldErrors.url}
      </span>
    )}
  </div>
  
  {/* Submit button */}
  <button
    type="submit"
    className="add-song-form__submit"
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Adding...' : 'Add Song'}
  </button>
</form>
```

---

## Event Handlers:

### 1. **handleInputChange(field: keyof FormState, value: string): void**

Updates form field state when user types.

- **Description:** Updates the specified field in form state and clears its error
- **Parameters:**
  - `field` (keyof FormState): Which field to update ('title', 'artist', 'cover', 'url')
  - `value` (string): New value for the field
- **Side effects:**
  - Updates formData state
  - Clears field error (if any)
- **Implementation:**
  ```typescript
  const handleInputChange = (field: keyof FormState, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  ```

### 2. **handleSubmit(event: React.FormEvent\<HTMLFormElement\>): void**

Handles form submission with validation.

- **Description:** Validates form data, creates Song object, calls callback, and resets form
- **Parameters:**
  - `event` (React.FormEvent): Form submit event
- **Process:**
  1. Prevent default form submission
  2. Validate form using validateForm()
  3. If valid: Generate ID, create Song object, call onAddSong, reset form, show success
  4. If invalid: Display validation errors
- **Implementation:**
  ```typescript
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Generate unique ID (UUID or timestamp-based)
    const newSong: Song = {
      id: generateId(),
      title: formData.title.trim(),
      artist: formData.artist.trim(),
      cover: formData.cover.trim(),
      url: formData.url.trim()
    };
    
    // Call parent callback
    props.onAddSong(newSong);
    
    // Reset form and show success
    resetForm();
    setSubmitSuccess(true);
    setIsSubmitting(false);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  };
  ```

---

## Helper Functions:

### 3. **validateForm(): boolean**

Validates all form fields using AudioValidator.

- **Description:** Validates form data and sets error state
- **Returns:** 
  - `boolean`: true if valid, false if errors
- **Process:**
  1. Create temporary Song object from form data
  2. Call AudioValidator.validateSong()
  3. If errors, parse and set per-field errors
  4. Return validation result
- **Implementation:**
  ```typescript
  const validateForm = (): boolean => {
    // Clear previous errors
    setErrors([]);
    setFieldErrors({});
    
    // Create song object for validation
    const songToValidate: Song = {
      id: 'temp', // Temporary ID for validation
      title: formData.title.trim(),
      artist: formData.artist.trim(),
      cover: formData.cover.trim(),
      url: formData.url.trim()
    };
    
    // Validate using AudioValidator
    const validationResult = AudioValidator.validateSong(songToValidate);
    
    if (!validationResult.isValid) {
      // Parse errors and map to fields
      const newFieldErrors: FieldErrors = {};
      
      validationResult.errors.forEach(error => {
        if (error.includes('Title')) {
          newFieldErrors.title = error;
        } else if (error.includes('Artist')) {
          newFieldErrors.artist = error;
        } else if (error.includes('Cover')) {
          newFieldErrors.cover = error;
        } else if (error.includes('Audio')) {
          newFieldErrors.url = error;
        }
      });
      
      setFieldErrors(newFieldErrors);
      setErrors(validationResult.errors);
      return false;
    }
    
    return true;
  };
  ```

### 4. **resetForm(): void**

Clears all form fields and errors.

- **Description:** Resets form to initial empty state
- **Side effects:**
  - Clears formData
  - Clears all errors
- **Implementation:**
  ```typescript
  const resetForm = (): void => {
    setFormData({
      title: '',
      artist: '',
      cover: '',
      url: ''
    });
    setErrors([]);
    setFieldErrors({});
  };
  ```

### 5. **generateId(): string**

Generates unique ID for new song.

- **Description:** Creates a unique identifier for the song
- **Returns:** 
  - `string`: Unique ID
- **Options:**
  - **Simple:** Timestamp-based: `Date.now().toString()`
  - **Better:** UUID v4 using crypto API
  - **Library:** Use `uuid` package
- **Implementation:**
  ```typescript
  const generateId = (): string => {
    // Simple timestamp-based ID
    return `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Or use crypto.randomUUID() if available
    // return crypto.randomUUID();
  };
  ```

---

## Styling Approach:

**Note:** This component will have a separate CSS Module file (`AddSongForm.module.css`).

### **CSS Classes:**

```css
.add-song-form {
  background-color: var(--color-surface);
  padding: var(--spacing-lg);
  border-radius: 8px;
  margin-top: var(--spacing-lg);
}

.add-song-form__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.add-song-form__field {
  margin-bottom: var(--spacing-md);
}

.add-song-form__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-primary);
}

.add-song-form__input {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: border-color var(--transition-fast);
}

.add-song-form__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-song-form__input--error {
  border-color: var(--color-error);
}

.add-song-form__error-message {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--color-error);
}

.add-song-form__errors {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: 4px;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.add-song-form__errors ul {
  margin: 0;
  padding-left: var(--spacing-md);
  color: var(--color-error);
  font-size: 0.875rem;
}

.add-song-form__success {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--color-success);
  border-radius: 4px;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--color-success);
  font-weight: 500;
  text-align: center;
}

.add-song-form__submit {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.add-song-form__submit:hover:not(:disabled) {
  background-color: var(--color-secondary);
}

.add-song-form__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Accessibility Features:

### 1. **Form Semantics**
- Proper `<form>` element with `onSubmit`
- `<label>` associated with each input (htmlFor/id)
- Required fields marked with asterisk
- Submit button with clear text

### 2. **ARIA Attributes**
- `aria-invalid` on inputs with errors
- `aria-describedby` linking inputs to error messages
- `role="alert"` on error messages (announced by screen readers)
- `role="status"` on success message

### 3. **Keyboard Support**
- Full keyboard navigation (Tab through fields)
- Enter submits form
- Escape could clear form (optional)

### 4. **Error Handling**
- Clear, specific error messages
- Errors announced to screen readers
- Visual indication (red border, error icon)
- Errors clear when user fixes issue

### 5. **Focus Management**
- Focus first invalid field on submit error
- Maintain focus after successful submission (optional)

---

## Edge Cases to Handle:

1. **Empty fields:**
   - Validation catches and displays specific errors
   - "Title is required", etc.

2. **Whitespace-only input:**
   - Trim values before validation
   - Treat as empty

3. **Invalid URLs:**
   - AudioValidator checks URL format
   - Display clear error messages

4. **Unsupported audio format:**
   - AudioValidator checks file extension
   - Error: "Audio format must be MP3, WAV, OGG, or M4A"

5. **Duplicate song IDs:**
   - Generate unique IDs (timestamp + random)
   - Very low collision probability

6. **Rapid submissions:**
   - Disable button during submission
   - Prevent double-submit

7. **Very long input:**
   - Consider max length on inputs
   - Or handle in validation

8. **Special characters:**
   - Allow Unicode in title/artist
   - Sanitize if needed (React handles XSS)

9. **Form reset race condition:**
   - Ensure state updates are batched
   - Success message timing

---

## Dependencies:

- **React imports:**
  ```typescript
  import React, { useState } from 'react';
  ```
- **Type imports:**
  ```typescript
  import { Song } from '@types/song';
  ```
- **Utility imports:**
  ```typescript
  import { AudioValidator } from '@utils/audio-validator';
  ```

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+ with React 18
- **Code style:** Google TypeScript Style Guide
- **Component type:** Functional component with hooks
- **Maximum complexity:** Moderate (form management + validation)
- **Maximum length:** ~250 lines (with JSX and handlers)

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Only manages form for adding songs
  - **Dependency Inversion:** Uses AudioValidator abstraction
- **Input parameter validation:**
  - Validate all fields before submission
  - Trim whitespace
  - Use AudioValidator utility
- **Robust exception handling:**
  - Handle validation failures gracefully
  - Never throw from handlers
  - Display clear error messages
- **No logging needed:** Form component
- **Comments for complex logic:**
  - Document validation logic
  - Explain ID generation
  - Note error mapping strategy

## React Best Practices:

- **Controlled inputs:** All inputs controlled by state
- **Single source of truth:** Form state in useState
- **Event prevention:** preventDefault on submit
- **State updates:** Functional updates for nested state
- **Form validation:** Client-side validation with clear feedback
- **Accessibility:** Full ARIA support

## Documentation:

- **JSDoc on component:** Purpose, props, examples
- **JSDoc on props interface:** Document callback
- **JSDoc on handlers:** Document validation process
- **Inline comments:** Explain validation error mapping

## Accessibility:

- **Labels:** Associated with inputs
- **ARIA:** Invalid states, error descriptions
- **Keyboard:** Full keyboard navigation
- **Screen reader:** Error announcements
- **Focus management:** Logical tab order

## Styling:

- **CSS Modules:** Scoped styles
- **BEM convention:** Clear naming
- **Error states:** Visual feedback
- **Responsive:** Mobile-friendly inputs
- **CSS variables:** Use design tokens

---

# DELIVERABLES

## 1. Complete source code with:
- Organized imports
- Props and state interfaces
- Component function
- All event handlers
- Helper functions (validate, reset, generateId)
- Complete JSX with accessibility
- JSDoc documentation

## 2. Component documentation:
- Purpose and responsibilities
- Props documentation
- State management strategy
- Validation approach
- Error handling strategy

## 3. Type safety:
- TypeScript interfaces
- Proper event typing
- Type-safe state updates
- No `any` types

## 4. Edge cases handled:
- Empty/whitespace fields
- Invalid URLs
- Unsupported formats
- Duplicate submissions
- All validation scenarios

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Form state management approach (single object vs separate states)]
- [Decision 2: Error display strategy (global list vs per-field)]
- [Decision 3: ID generation method (timestamp vs UUID)]
- [Decision 4: Validation timing (on submit vs on blur)]
- [Decision 5: Success message duration and style]
- [Decision 6: Whether to reset on successful submission]

**Form validation strategy:**
- [Document validation approach using AudioValidator]
- [Explain error mapping to fields]
- [Describe real-time error clearing]

**State management rationale:**
- [Explain form data structure]
- [Document error state approach]
- [Justify submission state usage]

**Possible future improvements:**
- [Improvement 1: File upload for local audio files]
- [Improvement 2: Image upload for cover art]
- [Improvement 3: URL validation with actual network check]
- [Improvement 4: Autocomplete for artist names]
- [Improvement 5: Preview song before adding]
- [Improvement 6: Bulk import from JSON file]
- [Improvement 7: Drag-and-drop file upload]
- [Improvement 8: Extract metadata from audio file]
- [Improvement 9: Search/fetch from music APIs]
- [Improvement 10: Form field validation on blur (real-time)]

---

**REMINDER:** This is a **stateful form component** with validation - manages input state, validates data, displays errors, and delegates to parent. Focus on clear validation feedback, excellent accessibility, robust error handling, and smooth user experience.
