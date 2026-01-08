/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/components/AddSongForm.tsx
 * @desc Component that provides a form for adding new songs to the playlist. It handles input validation,
 *       error display, and submission to the parent component.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types/song';
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