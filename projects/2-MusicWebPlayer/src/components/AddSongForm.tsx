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
import { IndexedDBStorage } from '@utils/indexed-db-storage';
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
  coverFile: File | null;
  audioFile: File | null;
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
    url: '',
    coverFile: null,
    audioFile: null
  });

  // Error state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Refs for file inputs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const successTimerRef = useRef<number | null>(null);

  /**
   * Updates form field state when user types.
   * @param field Which field to update
   * @param value New value for the field
   */
  const handleInputChange = (field: 'title' | 'artist' | 'cover' | 'url', value: string): void => {
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
   * Handles cover image file selection.
   * @param event File input change event
   */
  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFieldErrors(prev => ({
          ...prev,
          cover: 'Please select a valid image file (JPG, PNG, GIF, WebP, SVG)'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        coverFile: file,
        cover: '' // Clear URL field when file is selected
      }));

      // Clear any previous errors
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cover;
        return newErrors;
      });
    }
  };

  /**
   * Handles audio file selection.
   * @param event File input change event
   */
  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setFieldErrors(prev => ({
          ...prev,
          url: 'Please select a valid audio file (MP3, WAV, OGG, M4A)'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        audioFile: file,
        url: '' // Clear URL field when file is selected
      }));

      // Clear any previous errors
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.url;
        return newErrors;
      });
    }
  };

  /**
   * Clears the selected cover file.
   */
  const handleClearCoverFile = (): void => {
    setFormData(prev => ({
      ...prev,
      coverFile: null
    }));
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
    }
  };

  /**
   * Clears the selected audio file.
   */
  const handleClearAudioFile = (): void => {
    setFormData(prev => ({
      ...prev,
      audioFile: null
    }));
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = '';
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

    const errors: string[] = [];
    const newFieldErrors: FieldErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newFieldErrors.title = 'Title is required';
    }

    // Validate artist
    if (!formData.artist.trim()) {
      newFieldErrors.artist = 'Artist is required';
    }

    // Validate cover (either URL or file)
    if (!formData.cover.trim() && !formData.coverFile) {
      newFieldErrors.cover = 'Cover image URL or file is required';
    } else if (formData.cover.trim()) {
      // Validate URL if provided
      const songToValidate: Song = {
        id: 'temp',
        title: 'temp',
        artist: 'temp',
        cover: formData.cover.trim(),
        url: 'temp'
      };
      const coverValidation = AudioValidator.validateSong(songToValidate);
      const coverError = coverValidation.errors.find(e => e.includes('Cover'));
      if (coverError) {
        newFieldErrors.cover = coverError;
      }
    }

    // Validate audio (either URL or file)
    if (!formData.url.trim() && !formData.audioFile) {
      newFieldErrors.url = 'Audio file URL or file is required';
    } else if (formData.url.trim()) {
      // Validate URL if provided
      const songToValidate: Song = {
        id: 'temp',
        title: 'temp',
        artist: 'temp',
        cover: 'temp',
        url: formData.url.trim()
      };
      const urlValidation = AudioValidator.validateSong(songToValidate);
      const urlError = urlValidation.errors.find(e => e.includes('Audio') || e.includes('URL'));
      if (urlError) {
        newFieldErrors.url = urlError;
      }
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return false;
    }

    if (errors.length > 0) {
      setGlobalErrors(errors);
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
      url: '',
      coverFile: null,
      audioFile: null
    });
    setFieldErrors({});
    setGlobalErrors([]);
    
    // Clear file inputs
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
    }
    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = '';
    }
  };

  /**
   * Handles form submission.
   * @param event Form submit event
   */
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let coverUrl = formData.cover.trim();
      let audioUrl = formData.url.trim();

      // Store cover file if uploaded
      if (formData.coverFile) {
        const coverId = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        await IndexedDBStorage.storeFile(formData.coverFile, coverId);
        coverUrl = `indexed-db://${coverId}`;
      }

      // Store audio file if uploaded
      if (formData.audioFile) {
        const audioId = `audio-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        await IndexedDBStorage.storeFile(formData.audioFile, audioId);
        audioUrl = `indexed-db://${audioId}`;
      }

      // Create new song object
      const newSong: Song = {
        id: generateId(),
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        cover: coverUrl,
        url: audioUrl
      };

      // Call parent callback
      props.onAddSong(newSong);

      // Reset form and show success
      resetForm();
      setSubmitSuccess(true);

      successTimerRef.current = window.setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to add song:', error);
      setGlobalErrors(['Failed to save files. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
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
          Cover Image *
        </label>
        <div className={styles['add-song-form__input-row']}>
          <div className={styles['add-song-form__input-wrapper']}>
            <input
              type="url"
              id="song-cover"
              name="cover"
              value={formData.cover}
              onChange={(e) => handleInputChange('cover', e.target.value)}
              className={`${styles['add-song-form__input']} ${fieldErrors.cover ? styles['add-song-form__input--error'] : ''}`}
              placeholder="Enter image URL"
              disabled={!!formData.coverFile}
              aria-invalid={!!fieldErrors.cover}
              aria-describedby={fieldErrors.cover ? "cover-error" : undefined}
            />
          </div>
          <span className={styles['add-song-form__separator']}>or</span>
          <div className={styles['add-song-form__file-button-wrapper']}>
            <input
              type="file"
              ref={coverFileInputRef}
              accept="image/*"
              onChange={handleCoverFileChange}
              className={styles['add-song-form__file-input']}
              id="cover-file-input"
              disabled={!!formData.cover.trim()}
            />
            <label 
              htmlFor="cover-file-input" 
              className={`${styles['add-song-form__file-label']} ${formData.cover.trim() ? styles['add-song-form__file-label--disabled'] : ''}`}
            >
              📁 Upload File
            </label>
          </div>
        </div>
        {formData.coverFile && (
          <div className={styles['add-song-form__file-info']}>
            <span className={styles['add-song-form__file-name']}>
              ✓ {formData.coverFile.name}
            </span>
            <button
              type="button"
              onClick={handleClearCoverFile}
              className={styles['add-song-form__file-clear']}
              aria-label="Clear cover file"
            >
              ✕
            </button>
          </div>
        )}
        {fieldErrors.cover && (
          <span id="cover-error" className={styles['add-song-form__error-message']} role="alert">
            {fieldErrors.cover}
          </span>
        )}
      </div>

      {/* Audio URL input */}
      <div className={styles['add-song-form__field']}>
        <label htmlFor="song-url" className={styles['add-song-form__label']}>
          Audio File *
        </label>
        <div className={styles['add-song-form__input-row']}>
          <div className={styles['add-song-form__input-wrapper']}>
            <input
              type="url"
              id="song-url"
              name="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className={`${styles['add-song-form__input']} ${fieldErrors.url ? styles['add-song-form__input--error'] : ''}`}
              placeholder="Enter audio URL"
              disabled={!!formData.audioFile}
              aria-invalid={!!fieldErrors.url}
              aria-describedby={fieldErrors.url ? "url-error" : undefined}
            />
          </div>
          <span className={styles['add-song-form__separator']}>or</span>
          <div className={styles['add-song-form__file-button-wrapper']}>
            <input
              type="file"
              ref={audioFileInputRef}
              accept="audio/*"
              onChange={handleAudioFileChange}
              className={styles['add-song-form__file-input']}
              id="audio-file-input"
              disabled={!!formData.url.trim()}
            />
            <label 
              htmlFor="audio-file-input" 
              className={`${styles['add-song-form__file-label']} ${formData.url.trim() ? styles['add-song-form__file-label--disabled'] : ''}`}
            >
              🎵 Upload File
            </label>
          </div>
        </div>
        {formData.audioFile && (
          <div className={styles['add-song-form__file-info']}>
            <span className={styles['add-song-form__file-name']}>
              ✓ {formData.audioFile.name}
            </span>
            <button
              type="button"
              onClick={handleClearAudioFile}
              className={styles['add-song-form__file-clear']}
              aria-label="Clear audio file"
            >
              ✕
            </button>
          </div>
        )}
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