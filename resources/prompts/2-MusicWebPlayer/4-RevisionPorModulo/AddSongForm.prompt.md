# CODE REVIEW REQUEST #14: `src/components/AddSongForm.tsx`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/components/AddSongForm.tsx`

**Component objective:** Form component for adding new songs to the playlist. Collects song title, artist name, cover URL, and audio URL through controlled inputs. Validates all fields using AudioValidator before submission. Displays validation errors and provides clear feedback. Generates unique song IDs. Stateful component that manages form data and validation state.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR15:** Add songs to local playlist
- User can add new songs by providing:
  - Song title (required)
  - Artist name (required)
  - Cover image URL (required)
  - Audio file URL (required)
- All fields must be validated before adding
- Form should clear after successful submission

**FR18:** Real-time playlist update
- After adding a song, it appears immediately in the playlist
- No page reload required

**Validation Rules (from AudioValidator):**
- **Title:** Required, not empty after trim
- **Artist:** Required, not empty after trim
- **Cover URL:** Valid URL format (HTTP/HTTPS or relative path)
- **Audio URL:** Valid URL format (HTTP/HTTPS or relative path)
- **Audio Format:** Must be .mp3, .wav, .ogg, or .m4a

**Error Messages (from AudioValidator):**
- "Title is required"
- "Artist is required"
- "Cover URL must be a valid URL"
- "Audio URL must be a valid URL"
- "Audio format must be MP3, WAV, OGG, or M4A"

**UI Design Specifications:**
- **Layout:** Vertical form with labeled inputs
- **Input fields:** Text inputs for all four fields
- **Labels:** Clear, descriptive labels above each input
- **Error display:** Red text below invalid fields
- **Submit button:** Disabled when form invalid
- **Clear button:** Optional, resets form
- **Success feedback:** Optional success message or auto-clear

**NFR3:** Modular code with separate React components
- Form is its own component
- Delegates song addition to parent via callback

**NFR5:** Static typing with TypeScript
- Props interface defined
- Form state typed
- Validation result typed

**NFR6:** Intuitive and accessible interface
- Labels associated with inputs (htmlFor/id)
- Required fields marked
- Error messages announced to screen readers
- Submit button disabled when invalid

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│      <<component>>                      │
│       AddSongForm                       │
├─────────────────────────────────────────┤
│ + props: AddSongFormProps               │
│ - formData: FormData                    │
│ - errors: string[]                      │
│ - isSubmitting: boolean                 │
├─────────────────────────────────────────┤
│ + render(): JSX.Element                 │
│ - handleInputChange(field, value): void │
│ - handleSubmit(event): void             │
│ - validateForm(): boolean               │
│ - resetForm(): void                     │
│ - generateId(): string                  │
└─────────────────────────────────────────┘
           │
           │ receives
           ▼
┌─────────────────────────────────────────┐
│      AddSongFormProps                   │
├─────────────────────────────────────────┤
│ + onAddSong: (song: Song) => void       │
└─────────────────────────────────────────┘

Uses:
- AudioValidator utility (validateSong)
- Song type (for creating song object)
```

---

## CODE TO REVIEW

```typescript
(Referenced Code)
```

---

## EVALUATION CRITERIA

### 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**

**Component Type:**
- [ ] Functional component (React.FC or function)
- [ ] Stateful component (uses useState)
- [ ] Controlled form inputs (value bound to state)
- [ ] Handles own validation before delegating

**Props Interface:**
- [ ] Interface named `AddSongFormProps`
- [ ] Property: `onAddSong: (song: Song) => void`
- [ ] Callback receives complete Song object
- [ ] No other required props

**State Management:**
- [ ] State for form fields (title, artist, cover, url)
- [ ] State for errors (string[] or validation result)
- [ ] Optional: State for isSubmitting flag
- [ ] Uses useState for all state

**JSX Structure:**
- [ ] Form element with onSubmit handler
- [ ] Four input fields (title, artist, cover, url)
- [ ] Label for each input (with htmlFor)
- [ ] Error display area
- [ ] Submit button
- [ ] Optional: Clear/Reset button

**Event Handlers:**
- [ ] `handleInputChange` or individual handlers per field
- [ ] `handleSubmit` with preventDefault
- [ ] Optional: `handleReset` for clearing form

**Validation:**
- [ ] Uses AudioValidator.validateSong()
- [ ] Validates on submit (minimum)
- [ ] Optional: Real-time validation on change
- [ ] Displays all errors from validation

**ID Generation:**
- [ ] Generates unique ID for new song
- [ ] Uses Date.now() or crypto.randomUUID() or similar
- [ ] ID included in Song object

**Score:** __/10

**Observations:**
- Is the form properly controlled?
- Is AudioValidator used for validation?
- Are all four fields present?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **Component main:** Moderate (8-12 cyclomatic complexity)
  - State declarations
  - Event handlers
  - Validation logic
  - JSX with conditionals
- [ ] **handleInputChange:** Low (1-2 cyclomatic complexity)
  - Update state for field
- [ ] **handleSubmit:** Moderate (5-8 cyclomatic complexity)
  - preventDefault
  - Validation
  - Create song object
  - Call callback
  - Reset form
  - Error handling
- [ ] **validateForm:** Low (delegated to AudioValidator)
- [ ] **generateId:** Low (1 cyclomatic complexity)
- [ ] Overall cyclomatic complexity < 20 (acceptable for form)

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Validation only when needed (not on every keystroke ideally)
- [ ] Simple state updates
- [ ] Could use useCallback for handlers (optional)

**Coupling:**
- [ ] Depends on AudioValidator utility
- [ ] Depends on Song type
- [ ] Depends on React (useState, FormEvent)
- [ ] Reasonable coupling

**Cohesion:**
- [ ] High cohesion (all parts related to song form)
- [ ] Single responsibility (collect and validate song data)
- [ ] All methods support main purpose

**Code Smells:**
- [ ] Check for: Long Method (handleSubmit may be long but acceptable)
- [ ] Check for: Data Clumps (form fields could be object - acceptable)
- [ ] Check for: Code Duplication (input structure repeated - extract component?)
- [ ] Check for: Magic Strings (field names hardcoded - acceptable)
- [ ] Check for: Complex Conditionals (error display logic)

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**Form Fields:**
- [ ] **AC1:** Title input field present and labeled
- [ ] **AC2:** Artist input field present and labeled
- [ ] **AC3:** Cover URL input field present and labeled
- [ ] **AC4:** Audio URL input field present and labeled
- [ ] **AC5:** All inputs are controlled (value bound to state)
- [ ] **AC6:** All inputs update state on change

**Validation:**
- [ ] **AC7:** Uses AudioValidator.validateSong() for validation
- [ ] **AC8:** Validates on form submit
- [ ] **AC9:** All validation errors displayed to user
- [ ] **AC10:** Form submission prevented if validation fails
- [ ] **AC11:** Error messages match AudioValidator output
- [ ] **AC12:** Errors cleared when form resubmitted or reset

**Song Creation:**
- [ ] **AC13:** Generates unique ID for new song
- [ ] **AC14:** Creates Song object with all five fields (id, title, artist, cover, url)
- [ ] **AC15:** Calls onAddSong callback with complete Song object
- [ ] **AC16:** Form clears after successful submission
- [ ] **AC17:** State resets to empty values

**User Feedback:**
- [ ] **AC18:** Submit button disabled when form invalid (optional but good)
- [ ] **AC19:** Error messages displayed in red or with error styling
- [ ] **AC20:** Each error on separate line or clearly separated
- [ ] **AC21:** Optional: Success message after adding song
- [ ] **AC22:** Form is usable after submission (ready for next song)

**Accessibility:**
- [ ] **AC23:** All inputs have associated labels (htmlFor/id)
- [ ] **AC24:** Required fields marked (aria-required or visual indicator)
- [ ] **AC25:** Error messages associated with inputs (aria-describedby)
- [ ] **AC26:** Form has semantic form element
- [ ] **AC27:** Submit button has descriptive text

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|-------------------|----------|
| Submit with all empty fields | Show all 4+ validation errors | [ ] |
| Submit with only title filled | Show 3+ validation errors | [ ] |
| Submit with invalid URL | Show URL validation error | [ ] |
| Submit with .flac file | Show format error | [ ] |
| Submit valid form | Add song, clear form, no errors | [ ] |
| Whitespace-only title | Treated as empty, show error | [ ] |
| Very long input (1000+ chars) | Accepted (no max length) | [ ] |
| Special characters in title | Accepted, no sanitization | [ ] |
| Rapid form submissions | Each submission handled | [ ] |
| Clear form while typing | All fields reset | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Component JSDoc:**
- [ ] Description of component purpose
- [ ] Explanation of form validation
- [ ] `@param props` or props interface documentation
- [ ] `@returns` JSX.Element
- [ ] `@example` showing usage with onAddSong callback

**Props Interface JSDoc:**
- [ ] Description of interface
- [ ] onAddSong callback documented with parameter

**Handler JSDoc:**
- [ ] `handleSubmit` documented with validation flow
- [ ] `handleInputChange` documented
- [ ] `generateId` documented with approach

**Code Clarity:**
- [ ] State variables clearly named
- [ ] Input field structure consistent
- [ ] Error display logic is clear
- [ ] Comments explain validation approach

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Only manages song form ✓
- [ ] **Open/Closed:** Easy to add more fields ✓

**React Best Practices:**
- [ ] Controlled components (value + onChange)
- [ ] preventDefault on form submit
- [ ] Proper state management
- [ ] Immutable state updates
- [ ] Clear state after submission

**Form Best Practices:**
- [ ] Uses semantic form element
- [ ] Labels associated with inputs
- [ ] Validation before submission
- [ ] Clear error messages
- [ ] Form usable after submission

**TypeScript Best Practices:**
- [ ] Props interface defined
- [ ] State types explicit
- [ ] Event types correct (ChangeEvent, FormEvent)
- [ ] No `any` types
- [ ] Song type imported and used

**Validation Best Practices:**
- [ ] Uses centralized validator (AudioValidator)
- [ ] All errors displayed at once
- [ ] Clear, user-friendly messages
- [ ] Validation on submit (minimum)
- [ ] No client-side bypasses

**Accessibility Best Practices:**
- [ ] Labels with htmlFor attribute
- [ ] Inputs with id attribute
- [ ] aria-required on required fields
- [ ] aria-describedby for error messages
- [ ] Error role for error container

**Code Style:**
- [ ] Follows Google TypeScript Style Guide
- [ ] Consistent formatting
- [ ] Named exports

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
- "Complete form component with all four input fields. Proper validation using AudioValidator. Controlled inputs with state management. Clear error display. Form clears after submission. Good accessibility with labels and ARIA attributes. Ready for production."
- "Core form works but validation incomplete. Missing cover URL field. Errors not displayed clearly. No form reset after submission. Needs improvements for full functionality."
- "Critical: AudioValidator not used for validation. Uncontrolled inputs. No error display. Form doesn't generate Song ID. Major refactoring needed."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. AudioValidator not used for validation - handleSubmit
   - Current: Manual validation checks
   - Expected: const result = AudioValidator.validateSong(songData);
   - Impact: Validation logic duplicated, may be inconsistent
   - Proposed solution: Use AudioValidator:
     const result = AudioValidator.validateSong({
       id: '', // Temp ID for validation
       title: formData.title,
       artist: formData.artist,
       cover: formData.cover,
       url: formData.url
     });
     if (!result.isValid) {
       setErrors(result.errors);
       return;
     }

2. Missing cover URL input field - Form JSX
   - Current: Only title, artist, url fields
   - Expected: All four fields including cover
   - Impact: Can't create complete Song objects, missing required field
   - Proposed solution: Add input:
     <label htmlFor="cover">Cover Image URL:</label>
     <input
       id="cover"
       type="text"
       value={formData.cover}
       onChange={(e) => handleInputChange('cover', e.target.value)}
     />

3. Inputs not controlled - Input elements
   - Current: No value attribute bound to state
   - Expected: value={formData.title}
   - Impact: React doesn't control inputs, form doesn't work properly
   - Proposed solution: Add value attribute to all inputs

4. No Song ID generation - handleSubmit
   - Current: Song object created without id
   - Expected: id: Date.now().toString() or crypto.randomUUID()
   - Impact: Songs have no unique identifier, breaks playlist operations
   - Proposed solution: Add generateId function:
     const generateId = (): string => {
       return `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
     };

5. Errors not displayed - Form JSX
   - Current: No error display area
   - Expected: {errors.length > 0 && <div>...</div>}
   - Impact: Users don't see validation errors, can't fix issues
   - Proposed solution: Add error display section
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. No form reset after successful submission - handleSubmit
   - Suggestion: Add form reset:
     setFormData({ title: '', artist: '', cover: '', url: '' });
     setErrors([]);
   - Benefit: Form ready for adding another song

2. Submit button not disabled when invalid - Button element
   - Suggestion: Add disabled attribute:
     <button type="submit" disabled={errors.length > 0}>
   - Benefit: Prevents submission attempts when form invalid

3. No loading state during submission - State
   - Suggestion: Add isSubmitting state:
     const [isSubmitting, setIsSubmitting] = useState(false);
     // Disable form while submitting
   - Benefit: Prevents double submissions

4. Input type not specific - URL input fields
   - Current: type="text"
   - Suggestion: type="url" for URL fields
   - Benefit: Better mobile keyboard, built-in validation

5. No placeholder text on inputs - Input elements
   - Suggestion: Add helpful placeholders:
     placeholder="Enter song title"
     placeholder="https://example.com/song.mp3"
   - Benefit: Better UX, clearer expectations

6. Error messages all in one block - Error display
   - Suggestion: Associate each error with its field:
     <input aria-describedby="title-error" />
     <span id="title-error" role="alert">{titleError}</span>
   - Benefit: Better accessibility, clearer which field has error

7. No field-level validation indicators - Input elements
   - Suggestion: Add visual indicators (border color) for invalid fields
   - Benefit: Clear visual feedback

8. No success feedback after adding - Post-submission
   - Suggestion: Show brief success message:
     {showSuccess && <div>Song added successfully!</div>}
   - Benefit: Confirms action completed
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All four required input fields present
- ✅ Controlled inputs with proper state management
- ✅ Uses AudioValidator for consistent validation
- ✅ All errors displayed clearly to user
- ✅ Form clears after successful submission
- ✅ Unique ID generated for each song
- ✅ Type-safe props and state
- ✅ Proper labels associated with inputs
- ✅ ARIA attributes for accessibility
- ✅ Clean callback delegation to parent

---

### Recommended Refactorings:

**REFACTORING 1: Complete implementation with all features**

```typescript
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Song } from '@types/song';
import { AudioValidator } from '@utils/audio-validator';
import './AddSongForm.css';

/**
 * Form component for adding new songs to the playlist.
 * 
 * Collects song title, artist, cover URL, and audio URL.
 * Validates all fields using AudioValidator before submission.
 * Generates unique ID and creates Song object.
 * 
 * @param props - Callback to add song to playlist
 * @returns JSX element with song form
 * 
 * @example
 * <AddSongForm
 *   onAddSong={(song) => playlist.addSong(song)}
 * />
 */
interface AddSongFormProps {
  /** Callback to add song to playlist */
  onAddSong: (song: Song) => void;
}

interface FormData {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

const INITIAL_FORM_DATA: FormData = {
  title: '',
  artist: '',
  cover: '',
  url: ''
};

export const AddSongForm: React.FC<AddSongFormProps> = ({ onAddSong }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Generates a unique ID for the new song.
   * Uses timestamp and random string for uniqueness.
   */
  const generateId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `song-${timestamp}-${random}`;
  };

  /**
   * Handles input field changes.
   * Updates form data state for the specified field.
   */
  const handleInputChange = (
    field: keyof FormData,
    value: string
  ): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing (optional)
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * Resets form to initial empty state.
   */
  const resetForm = (): void => {
    setFormData(INITIAL_FORM_DATA);
    setErrors([]);
  };

  /**
   * Handles form submission.
   * Validates using AudioValidator, creates Song object if valid.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors([]);

    // Create temporary song object for validation
    const tempSong: Song = {
      id: '', // Temp ID, real ID generated after validation
      title: formData.title,
      artist: formData.artist,
      cover: formData.cover,
      url: formData.url
    };

    // Validate using AudioValidator
    const validationResult = AudioValidator.validateSong(tempSong);

    if (!validationResult.isValid) {
      // Display validation errors
      setErrors(validationResult.errors);
      setIsSubmitting(false);
      return;
    }

    // Create song with unique ID
    const newSong: Song = {
      ...tempSong,
      id: generateId()
    };

    // Add song via callback
    onAddSong(newSong);

    // Reset form for next song
    resetForm();
    setIsSubmitting(false);
  };

  return (
    <form className="add-song-form" onSubmit={handleSubmit}>
      <h2 className="add-song-form__title">Add New Song</h2>

      {/* Error display */}
      {errors.length > 0 && (
        <div className="add-song-form__errors" role="alert">
          <h3 className="add-song-form__errors-title">
            Please fix the following errors:
          </h3>
          <ul className="add-song-form__errors-list">
            {errors.map((error, index) => (
              <li key={index} className="add-song-form__error">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Title input */}
      <div className="add-song-form__field">
        <label htmlFor="song-title" className="add-song-form__label">
          Song Title <span className="add-song-form__required">*</span>
        </label>
        <input
          id="song-title"
          type="text"
          className="add-song-form__input"
          value={formData.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleInputChange('title', e.target.value)
          }
          placeholder="Enter song title"
          aria-required="true"
          disabled={isSubmitting}
        />
      </div>

      {/* Artist input */}
      <div className="add-song-form__field">
        <label htmlFor="song-artist" className="add-song-form__label">
          Artist <span className="add-song-form__required">*</span>
        </label>
        <input
          id="song-artist"
          type="text"
          className="add-song-form__input"
          value={formData.artist}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleInputChange('artist', e.target.value)
          }
          placeholder="Enter artist name"
          aria-required="true"
          disabled={isSubmitting}
        />
      </div>

      {/* Cover URL input */}
      <div className="add-song-form__field">
        <label htmlFor="song-cover" className="add-song-form__label">
          Cover Image URL <span className="add-song-form__required">*</span>
        </label>
        <input
          id="song-cover"
          type="url"
          className="add-song-form__input"
          value={formData.cover}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleInputChange('cover', e.target.value)
          }
          placeholder="https://example.com/cover.jpg"
          aria-required="true"
          disabled={isSubmitting}
        />
      </div>

      {/* Audio URL input */}
      <div className="add-song-form__field">
        <label htmlFor="song-url" className="add-song-form__label">
          Audio File URL <span className="add-song-form__required">*</span>
        </label>
        <input
          id="song-url"
          type="url"
          className="add-song-form__input"
          value={formData.url}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleInputChange('url', e.target.value)
          }
          placeholder="https://example.com/song.mp3"
          aria-required="true"
          disabled={isSubmitting}
        />
        <small className="add-song-form__hint">
          Supported formats: MP3, WAV, OGG, M4A
        </small>
      </div>

      {/* Form actions */}
      <div className="add-song-form__actions">
        <button
          type="submit"
          className="add-song-form__button add-song-form__button--submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Song'}
        </button>
        
        <button
          type="button"
          className="add-song-form__button add-song-form__button--reset"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Clear Form
        </button>
      </div>
    </form>
  );
};
```

**Reason:** Complete implementation with validation, error handling, accessibility, all features.

---

**REFACTORING 2: Companion CSS file**

```css
/* AddSongForm.css */

.add-song-form {
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 0 auto;
}

.add-song-form__title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Error display */
.add-song-form__errors {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.add-song-form__errors-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-error);
}

.add-song-form__errors-list {
  margin: 0;
  padding-left: var(--spacing-md);
}

.add-song-form__error {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-xs);
}

/* Form fields */
.add-song-form__field {
  margin-bottom: var(--spacing-md);
}

.add-song-form__label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-primary);
}

.add-song-form__required {
  color: var(--color-error);
}

.add-song-form__input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.add-song-form__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-song-form__input:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}

.add-song-form__hint {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Form actions */
.add-song-form__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.add-song-form__button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-song-form__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-song-form__button--submit {
  flex: 1;
  background-color: var(--color-primary);
  color: white;
}

.add-song-form__button--submit:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.add-song-form__button--reset {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.add-song-form__button--reset:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

/* Mobile: Full width buttons stacked */
@media (max-width: 767px) {
  .add-song-form__actions {
    flex-direction: column;
  }
  
  .add-song-form__button {
    width: 100%;
  }
}
```

**Reason:** Complete styling with error states, focus states, responsive design.

---

**REFACTORING 3: Extract form field component (optional)**

```typescript
// Separate reusable FormField component
interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  hint
}) => (
  <div className="add-song-form__field">
    <label htmlFor={id} className="add-song-form__label">
      {label} {required && <span className="add-song-form__required">*</span>}
    </label>
    <input
      id={id}
      type={type}
      className="add-song-form__input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-required={required}
      disabled={disabled}
    />
    {hint && <small className="add-song-form__hint">{hint}</small>}
  </div>
);

// Use in main component
<FormField
  id="song-title"
  label="Song Title"
  value={formData.title}
  onChange={(val) => handleInputChange('title', val)}
  placeholder="Enter song title"
  required
  disabled={isSubmitting}
/>
```

**Reason:** DRY principle, reusable form field, easier to maintain.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All four input fields present
  - AudioValidator used correctly
  - Proper error display
  - Form resets after submission
  - Good accessibility
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: could add success message, improve error display
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: missing fields, no validation, uncontrolled inputs
  - Must fix before Player can use this

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This is a stateful form component (more complex than presentational components)
- Must integrate with AudioValidator for validation
- Creates Song objects that are added to playlist
- Accessibility is important (form inputs need proper labels)

**Dependencies:**
- Depends on: AudioValidator utility, Song type, React hooks
- Used by: Player component (or could be separate page)

**What to Look For:**
- **All four input fields** (title, artist, cover, url)
- **Controlled inputs** (value bound to state)
- **AudioValidator usage** for validation
- **All errors displayed** to user
- **Song ID generation** (unique identifier)
- **Form reset** after successful submission
- **Labels associated** with inputs (htmlFor/id)

**Common Mistakes to Watch For:**
- Missing cover URL field
- Uncontrolled inputs (no value attribute)
- Manual validation instead of AudioValidator
- Errors not displayed to user
- No Song ID generated
- Form doesn't reset after submission
- Labels not associated with inputs
- No error feedback
- Submit button not prevented when invalid

**Testing Checklist:**
```typescript
// Test rendering
render(<AddSongForm onAddSong={mockAddSong} />);

// Verify all 4 input fields present
expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
expect(screen.getByLabelText(/artist/i)).toBeInTheDocument();
expect(screen.getByLabelText(/cover/i)).toBeInTheDocument();
expect(screen.getByLabelText(/audio/i)).toBeInTheDocument();

// Test controlled inputs
const titleInput = screen.getByLabelText(/title/i);
fireEvent.change(titleInput, { target: { value: 'Test Song' } });
expect(titleInput).toHaveValue('Test Song');

// Test validation on submit
fireEvent.click(screen.getByText(/add song/i));
// Verify errors displayed (empty fields)
expect(screen.getByText(/title is required/i)).toBeInTheDocument();

// Test successful submission
fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Song' } });
fireEvent.change(screen.getByLabelText(/artist/i), { target: { value: 'Artist' } });
fireEvent.change(screen.getByLabelText(/cover/i), { target: { value: 'http://example.com/cover.jpg' } });
fireEvent.change(screen.getByLabelText(/audio/i), { target: { value: 'http://example.com/song.mp3' } });
fireEvent.click(screen.getByText(/add song/i));

// Verify callback called with Song object
expect(mockAddSong).toHaveBeenCalledWith(
  expect.objectContaining({
    id: expect.any(String),
    title: 'Song',
    artist: 'Artist',
    cover: 'http://example.com/cover.jpg',
    url: 'http://example.com/song.mp3'
  })
);

// Verify form cleared
expect(screen.getByLabelText(/title/i)).toHaveValue('');
```

**Accessibility Checklist:**
- [ ] All inputs have associated labels (htmlFor/id)
- [ ] Required fields marked with aria-required
- [ ] Error messages in role="alert" container
- [ ] Form element is semantic <form>
- [ ] Submit button has descriptive text
- [ ] Keyboard accessible (Tab navigation)
