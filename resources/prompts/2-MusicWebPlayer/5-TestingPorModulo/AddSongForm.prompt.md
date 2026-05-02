# TESTING PROMPT #14: `src/components/AddSongForm.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** AddSongForm Component

**File path:** `src/components/AddSongForm.tsx`

**Test file path:** `tests/components/AddSongForm.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Components/AddSongForm
 * @category Components
 * @description
 * This component provides a form for adding new songs to the playlist.
 * It handles input validation, error display, and submission to the parent component.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Song } from '@types/song';
import { AudioValidator } from '@utils/audio-validator';
import styles from '@styles/AddSongForm.module.css';

/**
 * Props for the AddSongForm component.
 * @category Components
 */
export interface AddSongFormProps {
  /**
   * Callback when a new song is added
   * @param song The new song to add to the playlist
   */
  onAddSong: (song: Song) => void;
}

/**
 * State for the AddSongForm component.
 * @category Components
 */
interface AddSongFormState {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

/**
 * Field errors for the form.
 * @category Components
 */
interface FieldErrors {
  title?: string;
  artist?: string;
  cover?: string;
  url?: string;
}

/**
 * Component that provides a form to add new songs to the playlist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const AddSongForm: React.FC<AddSongFormProps> = (props) => {
  // Form state
  const [formData, setFormData] = useState<AddSongFormState>({
    title: '',
    artist: '',
    cover: '',
    url: ''
  });

  // Error state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const successTimerRef = useRef<number | null>(null);

  /**
   * Updates form field state when user types.
   * @param field Which field to update
   * @param value New value for the field
   */
  const handleInputChange = (field: keyof AddSongFormState, value: string): void => {
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

  /**
   * Validates the form data before submission.
   * @returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    // Clear previous errors
    setGlobalErrors([]);
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
      const otherErrors: string[] = [];

      validationResult.errors.forEach(error => {
        if (error.includes('Title')) {
          newFieldErrors.title = error;
        } else if (error.includes('Artist')) {
          newFieldErrors.artist = error;
        } else if (error.includes('Cover')) {
          newFieldErrors.cover = error;
        } else if (error.includes('Audio') || error.includes('URL')) {
          newFieldErrors.url = error;
        } else {
          // Add to global errors if not field-specific
          otherErrors.push(error);
        }
      });

      setGlobalErrors(otherErrors);
      setFieldErrors(newFieldErrors);
      return false;
    }

    return true;
  };

  /**
   * Generates a unique ID for new songs.
   * @returns Unique ID string
   */
  const generateId = () => {
    return (crypto?.randomUUID && crypto.randomUUID()) || `song-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  };

  /**
   * Clears all form fields and errors.
   */
  const resetForm = (): void => {
    setFormData({
      title: '',
      artist: '',
      cover: '',
      url: ''
    });
    setFieldErrors({});
    setGlobalErrors([]);
  };

  /**
   * Handles form submission.
   * @param event Form submit event
   */
  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Create new song object
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

    successTimerRef.current = window.setTimeout(() => setSubmitSuccess(false), 3000);
  };

  // Cleanup timer on unmount
  useEffect(() => () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); }, []);

  return (
    <form className={styles['add-song-form']} onSubmit={handleSubmit} noValidate>
      <h3 className={styles['add-song-form__title']}>Add New Song</h3>

      {/* Global error messages */}
      {globalErrors.length > 0 && (
        <div className={styles['add-song-form__errors']} role="alert">
          <ul>
            {globalErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success message */}
      {submitSuccess && (
        <div className={styles['add-song-form__success']} role="status">
          Song added successfully!
        </div>
      )}

      {/* Title input */}
      <div className={styles['add-song-form__field']}>
        <label htmlFor="song-title" className={styles['add-song-form__label']}>
          Title *
        </label>
        <input
          type="text"
          id="song-title"
          name="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`${styles['add-song-form__input']} ${fieldErrors.title ? styles['add-song-form__input--error'] : ''}`}
          placeholder="Enter song title"
          required
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
        {fieldErrors.title && (
          <span id="title-error" className={styles['add-song-form__error-message']} role="alert">
            {fieldErrors.title}
          </span>
        )}
      </div>

      {/* Artist input */}
      <div className={styles['add-song-form__field']}>
        <label htmlFor="song-artist" className={styles['add-song-form__label']}>
          Artist *
        </label>
        <input
          type="text"
          id="song-artist"
          name="artist"
          value={formData.artist}
          onChange={(e) => handleInputChange('artist', e.target.value)}
          className={`${styles['add-song-form__input']} ${fieldErrors.artist ? styles['add-song-form__input--error'] : ''}`}
          placeholder="Enter artist name"
          required
          aria-invalid={!!fieldErrors.artist}
          aria-describedby={fieldErrors.artist ? "artist-error" : undefined}
        />
        {fieldErrors.artist && (
          <span id="artist-error" className={styles['add-song-form__error-message']} role="alert">
            {fieldErrors.artist}
          </span>
        )}
      </div>

      {/* Cover URL input */}
      <div className={styles['add-song-form__field']}>
        <label htmlFor="song-cover" className={styles['add-song-form__label']}>
          Cover Image URL *
        </label>
        <input
          type="url"
          id="song-cover"
          name="cover"
          value={formData.cover}
          onChange={(e) => handleInputChange('cover', e.target.value)}
          className={`${styles['add-song-form__input']} ${fieldErrors.cover ? styles['add-song-form__input--error'] : ''}`}
          placeholder="https://example.com/cover.jpg"
          required
          aria-invalid={!!fieldErrors.cover}
          aria-describedby={fieldErrors.cover ? "cover-error" : undefined}
        />
        {fieldErrors.cover && (
          <span id="cover-error" className={styles['add-song-form__error-message']} role="alert">
            {fieldErrors.cover}
          </span>
        )}
      </div>

      {/* Audio URL input */}
      <div className={styles['add-song-form__field']}>
        <label htmlFor="song-url" className={styles['add-song-form__label']}>
          Audio File URL *
        </label>
        <input
          type="url"
          id="song-url"
          name="url"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          className={`${styles['add-song-form__input']} ${fieldErrors.url ? styles['add-song-form__input--error'] : ''}`}
          placeholder="https://example.com/song.mp3"
          required
          aria-invalid={!!fieldErrors.url}
          aria-describedby={fieldErrors.url ? "url-error" : undefined}
        />
        {fieldErrors.url && (
          <span id="url-error" className={styles['add-song-form__error-message']} role="alert">
            {fieldErrors.url}
          </span>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className={styles['add-song-form__submit']}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Song'}
      </button>
    </form>
  );
};
```

---

## JEST CONFIGURATION
```json
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg|mp3|wav)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  silent: true,
};
```

---

## JEST SETUP
```typescript
// Setup file for Jest with React Testing Library
require('@testing-library/jest-dom');

// Mock HTMLMediaElement (Audio API)
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.addEventListener = jest.fn();
window.HTMLMediaElement.prototype.removeEventListener = jest.fn();

Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
  get: jest.fn(() => 0),
  set: jest.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  get: jest.fn(() => 0),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch API for Node.js test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({}),
  })
);
```

---

## TYPESCRIPT CONFIGURATION
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@data/*": ["src/data/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## REQUIREMENTS SPECIFICATION

### From Code Review #14:

**Component Objective:**
Form for adding new songs to playlist with validation. Four input fields (title, artist, cover URL, audio URL) with controlled inputs. Uses AudioValidator for validation, displays all errors, generates unique IDs, and clears form after successful submission.

**Requirements:**
- **FR15:** Add songs to local playlist with validation
- **FR18:** Real-time playlist update after validation
- **NFR5:** Static typing with TypeScript
- **NFR6:** Accessibility (labels, aria-required, aria-describedby)

**Component Signature:**
```typescript
interface AddSongFormProps {
  onAddSong: (song: Song) => void;
}

function AddSongForm({ onAddSong }: AddSongFormProps): JSX.Element
```

**Critical Requirements:**

1. **Four Input Fields:**
   - Title (text input, required)
   - Artist (text input, required)
   - Cover URL (url input, required)
   - Audio URL (url input, required)

2. **Controlled Inputs:**
   - All inputs have `value` bound to state
   - All inputs have `onChange` handler
   - State updates on every keystroke
   - No uncontrolled inputs

3. **Form State:**
   - State for form data: `{ title, artist, cover, url }`
   - State for errors: `string[]` or `ValidationResult.errors`
   - Initial state: empty strings
   - Updates via controlled inputs

4. **Validation:**
   - Uses AudioValidator.validateSong()
   - Validates on form submit (not on blur)
   - All errors displayed together
   - Error messages from AudioValidator

5. **Error Display:**
   - All validation errors shown to user
   - Errors displayed near relevant fields or in list
   - Errors cleared when form is valid
   - aria-describedby links errors to fields

6. **Form Submission:**
   - Submit button triggers validation
   - preventDefault on form submit
   - Only calls onAddSong if validation passes
   - Generates unique ID: `Date.now() + Math.random()` or similar
   - Form clears after successful submission

7. **ID Generation:**
   - Unique ID generated for new song
   - Format: string (e.g., `song-${Date.now()}-${Math.random()}`)
   - Not user-provided (system-generated)

8. **Form Reset:**
   - Clears all inputs after successful add
   - Clears all errors after successful add
   - Ready for next song entry

9. **Accessibility:**
   - Labels with htmlFor for each input
   - aria-required="true" on required fields
   - type="url" for URL inputs
   - aria-describedby for error messages
   - Submit button has clear text

10. **Edge Cases:**
    - Empty form submission → shows errors
    - Partial form submission → shows relevant errors
    - Invalid URLs → shows error
    - Whitespace-only inputs → validates as empty

**Validation Rules (from AudioValidator):**
- Title required
- Artist required
- Cover URL must be valid URL
- Audio URL must be valid URL
- Audio format must be MP3, WAV, OGG, or M4A

**Expected Error Messages:**
- "Title is required"
- "Artist is required"
- "Cover URL must be a valid URL"
- "Audio URL must be a valid URL"
- "Audio format must be MP3, WAV, OGG, or M4A"

**Usage Context:**
- Used by Player component
- Called when user wants to add custom songs
- Form should be intuitive and accessible
- Errors should be clear and helpful

---

## USE CASE DIAGRAM

```
AddSongForm Component
├── Input Fields
│   ├── Title (text, required)
│   ├── Artist (text, required)
│   ├── Cover URL (url, required)
│   └── Audio URL (url, required)
│
├── Form State
│   ├── Controlled inputs
│   ├── Error state
│   └── Updates on change
│
├── Validation
│   ├── On form submit
│   ├── AudioValidator.validateSong()
│   └── Display all errors
│
└── Submission
    ├── Generate unique ID
    ├── Call onAddSong(song)
    ├── Clear form
    └── Clear errors
```

---

## TASK

Generate a complete unit test suite for the **AddSongForm component** that covers:

### 1. RENDERING - BASIC
Test basic rendering:
- Component renders without crashing
- All 4 input fields present
- Submit button present
- Form element exists

### 2. INPUT FIELDS
Test input field structure:
- Title input exists with label
- Artist input exists with label
- Cover URL input exists with label
- Audio URL input exists with label
- All inputs have type attribute
- URL inputs have type="url"

### 3. CONTROLLED INPUTS
Test controlled input behavior:
- Inputs are controlled (value bound to state)
- Typing updates input value
- Each input updates independently
- All inputs start empty
- onChange handlers work

### 4. LABELS AND ACCESSIBILITY
Test form accessibility:
- All inputs have associated labels
- Labels use htmlFor attribute
- Required inputs have aria-required="true"
- URL inputs have type="url"
- Error messages have aria-describedby (when shown)

### 5. FORM VALIDATION - SUCCESS
Test successful validation:
- Valid form passes validation
- onAddSong called with Song object
- Song has all 5 properties (id, title, artist, cover, url)
- Song ID is unique string
- Form clears after successful submission

### 6. FORM VALIDATION - ERRORS
Test validation failures:
- Empty title shows error
- Empty artist shows error
- Invalid cover URL shows error
- Invalid audio URL shows error
- Unsupported audio format shows error
- Multiple errors displayed together

### 7. ERROR DISPLAY
Test error message display:
- Errors shown to user (visible)
- All errors displayed (not just first)
- Error messages match AudioValidator
- Errors clear after successful submission
- Errors update on re-validation

### 8. FORM SUBMISSION
Test submit behavior:
- Submit button triggers validation
- preventDefault called on form submit
- onAddSong only called if valid
- onAddSong NOT called if invalid
- Form resets after successful add

### 9. ID GENERATION
Test unique ID generation:
- ID is generated for new songs
- ID is string type
- ID is non-empty
- Multiple submissions generate different IDs
- ID format is consistent

### 10. FORM RESET
Test form clearing:
- All inputs cleared after successful add
- Errors cleared after successful add
- Form ready for next entry
- Can add multiple songs sequentially

### 11. INTEGRATION WITH AUDIOVALIDATOR
Test AudioValidator usage:
- AudioValidator.validateSong() called on submit
- Validation errors from AudioValidator shown
- All validation rules enforced
- Valid songs pass validation

### 12. EDGE CASES
Test edge cases:
- Submit empty form
- Submit partially filled form
- Whitespace-only inputs
- Very long input values
- Special characters in inputs
- Rapid form submissions

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddSongForm from '@/components/AddSongForm';
import * as AudioValidator from '@/utils/audio-validator';
import { Song } from '@/types/song';

describe('AddSongForm Component', () => {
  const mockOnAddSong = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock AudioValidator
    jest.spyOn(AudioValidator, 'validateSong');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render all 4 input fields', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const inputs = screen.getAllByRole('textbox');

      // Should have at least title and artist (textbox role)
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('should render submit button', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const submitButton = screen.getByRole('button', { name: /add|submit/i });

      expect(submitButton).toBeInTheDocument();
    });

    it('should render form element', () => {
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);

      const form = container.querySelector('form');

      expect(form).toBeInTheDocument();
    });
  });

  describe('Input Fields', () => {
    it('should have title input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i);

      expect(titleInput).toBeInTheDocument();
    });

    it('should have artist input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const artistInput = screen.getByLabelText(/artist/i);

      expect(artistInput).toBeInTheDocument();
    });

    it('should have cover URL input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const coverInput = screen.getByLabelText(/cover/i);

      expect(coverInput).toBeInTheDocument();
    });

    it('should have audio URL input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const urlInput = screen.getByLabelText(/url|audio/i);

      expect(urlInput).toBeInTheDocument();
    });

    it('should have type="url" on URL inputs', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const coverInput = screen.getByLabelText(/cover/i);
      const urlInput = screen.getByLabelText(/url|audio/i);

      expect(coverInput).toHaveAttribute('type', 'url');
      expect(urlInput).toHaveAttribute('type', 'url');
    });
  });

  describe('Controlled Inputs', () => {
    it('should update title input value on change', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;

      await user.type(titleInput, 'Test Song');

      expect(titleInput.value).toBe('Test Song');
    });

    it('should update artist input value on change', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement;

      await user.type(artistInput, 'Test Artist');

      expect(artistInput.value).toBe('Test Artist');
    });

    it('should update cover URL input value on change', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const coverInput = screen.getByLabelText(/cover/i) as HTMLInputElement;

      await user.type(coverInput, 'https://example.com/cover.jpg');

      expect(coverInput.value).toBe('https://example.com/cover.jpg');
    });

    it('should update audio URL input value on change', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const urlInput = screen.getByLabelText(/url|audio/i) as HTMLInputElement;

      await user.type(urlInput, 'https://example.com/song.mp3');

      expect(urlInput.value).toBe('https://example.com/song.mp3');
    });

    it('should have all inputs start empty', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement;
      const coverInput = screen.getByLabelText(/cover/i) as HTMLInputElement;
      const urlInput = screen.getByLabelText(/url|audio/i) as HTMLInputElement;

      expect(titleInput.value).toBe('');
      expect(artistInput.value).toBe('');
      expect(coverInput.value).toBe('');
      expect(urlInput.value).toBe('');
    });

    it('should update each input independently', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement;

      await user.type(titleInput, 'Song');
      expect(titleInput.value).toBe('Song');
      expect(artistInput.value).toBe('');

      await user.type(artistInput, 'Artist');
      expect(titleInput.value).toBe('Song');
      expect(artistInput.value).toBe('Artist');
    });
  });

  describe('Labels and Accessibility', () => {
    it('should have labels with htmlFor attribute', () => {
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);

      const labels = container.querySelectorAll('label[for]');

      expect(labels.length).toBeGreaterThanOrEqual(4);
    });

    it('should have aria-required on required fields', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i);
      const artistInput = screen.getByLabelText(/artist/i);

      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(artistInput).toHaveAttribute('aria-required', 'true');
    });

    it('should use type="url" for URL inputs', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const coverInput = screen.getByLabelText(/cover/i);
      const urlInput = screen.getByLabelText(/url|audio/i);

      expect(coverInput.getAttribute('type')).toBe('url');
      expect(urlInput.getAttribute('type')).toBe('url');
    });

    it('should have accessible submit button', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const submitButton = screen.getByRole('button', { name: /add|submit/i });

      expect(submitButton).toHaveAccessibleName();
    });
  });

  describe('Form Validation - Success', () => {
    it('should call onAddSong with valid Song object', async () => {
      const user = userEvent.setup();
      
      // Mock successful validation
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), 'https://example.com/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), 'https://example.com/song.mp3');

      // Submit
      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(1);
      });
    });

    it('should generate Song with all 5 properties', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song = mockOnAddSong.mock.calls[0][0];
        expect(song).toHaveProperty('id');
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('artist');
        expect(song).toHaveProperty('cover');
        expect(song).toHaveProperty('url');
      });
    });

    it('should generate unique ID for Song', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song = mockOnAddSong.mock.calls[0][0];
        expect(song.id).toBeTruthy();
        expect(typeof song.id).toBe('string');
        expect(song.id.length).toBeGreaterThan(0);
      });
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement;

      await user.type(titleInput, 'Song');
      await user.type(artistInput, 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(titleInput.value).toBe('');
        expect(artistInput.value).toBe('');
      });
    });
  });

  describe('Form Validation - Errors', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Submit without filling title
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when artist is empty', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Artist is required']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid cover URL', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Cover URL must be a valid URL']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), 'invalid-url');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/cover url must be a valid url/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid audio URL', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Audio URL must be a valid URL']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), 'not-a-url');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/audio url must be a valid url/i)).toBeInTheDocument();
      });
    });

    it('should show error for unsupported audio format', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Audio format must be MP3, WAV, OGG, or M4A']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.flac');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/audio format must be/i)).toBeInTheDocument();
      });
    });

    it('should display multiple errors together', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: [
          'Title is required',
          'Artist is required',
          'Audio URL must be a valid URL'
        ]
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
        expect(screen.getByText(/audio url must be a valid url/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Display', () => {
    it('should make errors visible to user', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const errorText = screen.getByText(/title is required/i);
        expect(errorText).toBeVisible();
      });
    });

    it('should display all errors from AudioValidator', async () => {
      const user = userEvent.setup();
      
      const errors = [
        'Error 1',
        'Error 2',
        'Error 3'
      ];

      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        errors.forEach(error => {
          expect(screen.getByText(error)).toBeInTheDocument();
        });
      });
    });

    it('should clear errors after successful submission', async () => {
      const user = userEvent.setup();

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // First submit with errors
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required']
      });

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Fill form correctly and resubmit
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: []
      });

      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);

      const form = container.querySelector('form')!;
      const submitHandler = jest.fn((e) => e.preventDefault());
      
      form.addEventListener('submit', submitHandler);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Form should not navigate
      expect(window.location.href).not.toContain('?');
    });

    it('should only call onAddSong if validation passes', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).not.toHaveBeenCalled();
      });
    });

    it('should NOT call onAddSong if validation fails', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Multiple errors']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Incomplete');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).not.toHaveBeenCalled();
      });
    });

    it('should use AudioValidator.validateSong on submit', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(AudioValidator.validateSong).toHaveBeenCalled();
      });
    });
  });

  describe('ID Generation', () => {
    it('should generate ID for new song', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song = mockOnAddSong.mock.calls[0][0];
        expect(song.id).toBeDefined();
      });
    });

    it('should generate string ID', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song = mockOnAddSong.mock.calls[0][0];
        expect(typeof song.id).toBe('string');
      });
    });

    it('should generate different IDs for multiple submissions', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // First submission
      await user.type(screen.getByLabelText(/title/i), 'Song 1');
      await user.type(screen.getByLabelText(/artist/i), 'Artist 1');
      await user.type(screen.getByLabelText(/cover/i), '/cover1.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song1.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(1);
      });

      const id1 = mockOnAddSong.mock.calls[0][0].id;

      // Second submission
      await user.type(screen.getByLabelText(/title/i), 'Song 2');
      await user.type(screen.getByLabelText(/artist/i), 'Artist 2');
      await user.type(screen.getByLabelText(/cover/i), '/cover2.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song2.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(2);
      });

      const id2 = mockOnAddSong.mock.calls[1][0].id;

      expect(id1).not.toBe(id2);
    });
  });

  describe('Form Reset', () => {
    it('should clear all inputs after successful add', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement;
        const coverInput = screen.getByLabelText(/cover/i) as HTMLInputElement;
        const urlInput = screen.getByLabelText(/url|audio/i) as HTMLInputElement;

        expect(titleInput.value).toBe('');
        expect(artistInput.value).toBe('');
        expect(coverInput.value).toBe('');
        expect(urlInput.value).toBe('');
      });
    });

    it('should be ready for next entry after submission', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // First song
      await user.type(screen.getByLabelText(/title/i), 'Song 1');
      await user.type(screen.getByLabelText(/artist/i), 'Artist 1');
      await user.type(screen.getByLabelText(/cover/i), '/cover1.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song1.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(1);
      });

      // Form should be ready for second song
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      expect(titleInput.value).toBe('');
    });

    it('should allow adding multiple songs sequentially', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Add 3 songs
      for (let i = 1; i <= 3; i++) {
        await user.type(screen.getByLabelText(/title/i), `Song ${i}`);
        await user.type(screen.getByLabelText(/artist/i), `Artist ${i}`);
        await user.type(screen.getByLabelText(/cover/i), `/cover${i}.jpg`);
        await user.type(screen.getByLabelText(/url|audio/i), `/song${i}.mp3`);
        await user.click(screen.getByRole('button', { name: /add|submit/i }));

        await waitFor(() => {
          expect(mockOnAddSong).toHaveBeenCalledTimes(i);
        });
      }
    });
  });

  describe('Integration with AudioValidator', () => {
    it('should call AudioValidator.validateSong on submit', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      expect(AudioValidator.validateSong).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Song',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        })
      );
    });

    it('should enforce all validation rules', async () => {
      const user = userEvent.setup();

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Try various invalid inputs
      const testCases = [
        { errors: ['Title is required'] },
        { errors: ['Artist is required'] },
        { errors: ['Cover URL must be a valid URL'] },
        { errors: ['Audio format must be MP3, WAV, OGG, or M4A'] }
      ];

      for (const testCase of testCases) {
        (AudioValidator.validateSong as jest.Mock).mockReturnValue({
          isValid: false,
          errors: testCase.errors
        });

        await user.click(screen.getByRole('button', { name: /add|submit/i }));

        await waitFor(() => {
          expect(mockOnAddSong).not.toHaveBeenCalled();
        });

        mockOnAddSong.mockClear();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).not.toHaveBeenCalled();
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should handle whitespace-only inputs', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required']
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), '   ');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).not.toHaveBeenCalled();
      });
    });

    it('should handle very long input values', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      const longString = 'A'.repeat(500);

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), longString);
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song = mockOnAddSong.mock.calls[0][0];
        expect(song.title).toHaveLength(500);
      });
    });

    it('should handle special characters in inputs', async () => {
      const user = userEvent.setup();
      
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });

      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song "Title" & More');
      await user.type(screen.getByLabelText(/artist/i), "Artist's Name");
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song = mockOnAddSong.mock.calls[0][0];
        expect(song.title).toContain('"Title"');
        expect(song.artist).toContain("'s");
      });
    });
  });
});
```

---

## TEST REQUIREMENTS

### Form Testing:
- [ ] Test all 4 input fields
- [ ] Test controlled inputs (value binding)
- [ ] Test form submission
- [ ] Test preventDefault

### Validation Testing:
- [ ] Mock AudioValidator.validateSong
- [ ] Test success path
- [ ] Test all error paths
- [ ] Verify error display

### Accessibility:
- [ ] Test labels with htmlFor
- [ ] Test aria-required
- [ ] Test type="url"
- [ ] Test aria-describedby

### User Interaction:
- [ ] Use userEvent for typing
- [ ] Test button clicks
- [ ] Test multiple submissions
- [ ] Use waitFor for async updates

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/components/AddSongForm.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Rendering - Basic | 4 |
| Input Fields | 5 |
| Controlled Inputs | 6 |
| Labels & Accessibility | 4 |
| Validation - Success | 4 |
| Validation - Errors | 6 |
| Error Display | 3 |
| Form Submission | 4 |
| ID Generation | 3 |
| Form Reset | 3 |
| AudioValidator Integration | 2 |
| Edge Cases | 5 |
| **TOTAL** | **49** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/components/AddSongForm.test.tsx
npm test -- --coverage tests/components/AddSongForm.test.tsx
```
