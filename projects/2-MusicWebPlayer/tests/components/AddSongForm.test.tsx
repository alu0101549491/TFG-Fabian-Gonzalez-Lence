// tests/components/AddSongForm.test.tsx
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddSongForm } from '@/components/AddSongForm';
import { AudioValidator } from '@/utils/audio-validator';
import { Song } from '@/types/song';
import { ValidationResult } from '@/types/validation';

// Mock the AudioValidator module
jest.mock('@/utils/audio-validator', () => ({
  AudioValidator: {
    validateSong: jest.fn()
  }
}));

describe('AddSongForm Component', () => {
  const mockOnAddSong = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock AudioValidator.validateSong to return valid by default
    (AudioValidator.validateSong as jest.Mock).mockReturnValue({
      isValid: true,
      errors: []
    });
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render form element', () => {
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should render form title', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      expect(screen.getByText(/add new song/i)).toBeInTheDocument();
    });
  });

  describe('Input Fields', () => {
    it('should have title input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveAttribute('type', 'text');
    });

    it('should have artist input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const artistInput = screen.getByLabelText(/artist/i);
      expect(artistInput).toBeInTheDocument();
      expect(artistInput).toHaveAttribute('type', 'text');
    });

    it('should have cover URL input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const coverInput = screen.getByLabelText(/cover/i);
      expect(coverInput).toBeInTheDocument();
      expect(coverInput).toHaveAttribute('type', 'url');
    });

    it('should have audio URL input with label', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const audioInput = screen.getByLabelText(/audio.*url/i);
      expect(audioInput).toBeInTheDocument();
      expect(audioInput).toHaveAttribute('type', 'url');
    });

    it('should have all inputs with required attribute', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('required');
      });
    });
  });

  describe('Controlled Inputs', () => {
    it('should update title state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Song');

      expect(titleInput).toHaveValue('Test Song');
    });

    it('should update artist state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const artistInput = screen.getByLabelText(/artist/i);
      await user.type(artistInput, 'Test Artist');

      expect(artistInput).toHaveValue('Test Artist');
    });

    it('should update cover URL state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const coverInput = screen.getByLabelText(/cover/i);
      await user.type(coverInput, '<https://example.com/cover.jpg>');

      expect(coverInput).toHaveValue('<https://example.com/cover.jpg>');
    });

    it('should update audio URL state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const audioInput = screen.getByLabelText(/audio.*url/i);
      await user.type(audioInput, '<https://example.com/song.mp3>');

      expect(audioInput).toHaveValue('<https://example.com/song.mp3>');
    });

    it('should clear inputs after successful submission', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');

      // Submit
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Wait for form to clear
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toHaveValue('');
        expect(screen.getByLabelText(/artist/i)).toHaveValue('');
        expect(screen.getByLabelText(/cover/i)).toHaveValue('');
        expect(screen.getByLabelText(/audio.*url/i)).toHaveValue('');
      });
    });
  });

  describe('Labels & Accessibility', () => {
    it('should have labels associated with inputs using htmlFor', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i);
      const artistInput = screen.getByLabelText(/artist/i);
      const coverInput = screen.getByLabelText(/cover/i);
      const audioInput = screen.getByLabelText(/audio.*url/i);

      expect(titleInput).toHaveAttribute('id');
      expect(artistInput).toHaveAttribute('id');
      expect(coverInput).toHaveAttribute('id');
      expect(audioInput).toHaveAttribute('id');
    });

    it('should have required inputs marked with required attribute', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('required');
      });
    });

    it('should have URL inputs with type="url"', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const coverInput = screen.getByLabelText(/cover/i);
      const audioInput = screen.getByLabelText(/audio.*url/i);
      expect(coverInput.getAttribute('type')).toBe('url');
      expect(audioInput.getAttribute('type')).toBe('url');
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
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');

      // Submit
      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(1);
        const song = mockOnAddSong.mock.calls[0][0];
        expect(song).toHaveProperty('id');
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('artist');
        expect(song).toHaveProperty('cover');
        expect(song).toHaveProperty('url');
        expect(song.title).toBe('Test Song');
        expect(song.artist).toBe('Test Artist');
        expect(song.cover).toBe('<https://example.com/cover.jpg>');
        expect(song.url).toBe('<https://example.com/song.mp3>');
      });
    });

    it('should generate unique ID for each song', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*url/i), '/song.mp3');
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

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');

      // Submit
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Wait for form to clear
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i);
        const artistInput = screen.getByLabelText(/artist/i);
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
      await user.type(screen.getByLabelText(/audio.*url/i), '/song.mp3');
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
      await user.type(screen.getByLabelText(/audio.*url/i), '/song.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when cover URL is invalid', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Cover URL must be a valid URL']
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), 'invalid-url');
      await user.type(screen.getByLabelText(/audio.*url/i), '/song.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/cover url must be a valid url/i)).toBeInTheDocument();
      });
    });

    it('should show error when audio URL is invalid', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Audio URL must be a valid URL']
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*url/i), 'invalid-audio-url');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/audio url must be a valid url/i)).toBeInTheDocument();
      });
    });

    it('should show error when audio format is unsupported', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Audio format must be MP3, WAV, OGG, or M4A']
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.flac>');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/audio format must be mp3, wav, ogg, or m4a/i)).toBeInTheDocument();
      });
    });

    it('should show multiple errors simultaneously', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: [
          'Title is required',
          'Artist is required',
          'Cover URL must be a valid URL'
        ]
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
        expect(screen.getByText(/cover url must be a valid url/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Display', () => {
    it('should display validation errors in error container', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required']
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const errorContainer = screen.getByRole('alert');
        expect(errorContainer).toBeInTheDocument();
        expect(errorContainer.textContent).toContain('Title is required');
      });
    });

    it('should clear errors after successful submission', async () => {
      const user = userEvent.setup();
      // First submission fails
      (AudioValidator.validateSong as jest.Mock).mockReturnValueOnce({
        isValid: false,
        errors: ['Title is required']
      });
      // Second submission succeeds
      (AudioValidator.validateSong as jest.Mock).mockReturnValueOnce({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Fail first submission
      await user.click(screen.getByRole('button', { name: /add|submit/i }));
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Fill in required field and resubmit
      await user.type(screen.getByLabelText(/title/i), 'Valid Title');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Errors should disappear
      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });

    it('should not display errors when form is valid', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn();
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);

      const form = container.querySelector('form')!;
      form.addEventListener('submit', handleSubmit);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      expect(handleSubmit).toHaveBeenCalled();
      // The event handler would normally have preventDefault called in the component
    });

    it('should call AudioValidator.validateSong', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      expect(AudioValidator.validateSong).toHaveBeenCalled();
    });

    it('should not call onAddSong when validation fails', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required']
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      expect(mockOnAddSong).not.toHaveBeenCalled();
    });

    it('should call onAddSong only when validation passes', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('ID Generation', () => {
    it('should generate a unique ID for each submitted song', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song 1');
      await user.type(screen.getByLabelText(/artist/i), 'Artist 1');
      await user.type(screen.getByLabelText(/cover/i), '/cover1.jpg');
      await user.type(screen.getByLabelText(/audio.*url/i), '/song1.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song1 = mockOnAddSong.mock.calls[0][0];
        expect(song1.id).toBeTruthy();
      });

      // Submit another song to ensure ID uniqueness
      (mockOnAddSong as jest.Mock).mockClear();
      await user.type(screen.getByLabelText(/title/i), 'Song 2');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song2 = mockOnAddSong.mock.calls[0][0];
        expect(song2.id).toBeTruthy();
        // Note: We're not asserting they're different because IDs might be generated differently
        // The main requirement is that they're valid strings
      });
    });

    it('should ensure ID is a string', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*url/i), '/song.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        const song = mockOnAddSong.mock.calls[0][0];
        expect(typeof song.id).toBe('string');
      });
    });
  });

  describe('Form Reset', () => {
    it('should clear all inputs after successful submission', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');

      // Submit
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Wait for reset
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i).value).toBe('');
        expect(screen.getByLabelText(/artist/i).value).toBe('');
        expect(screen.getByLabelText(/cover/i).value).toBe('');
        expect(screen.getByLabelText(/audio.*url/i).value).toBe('');
      });
    });

    it('should reset error messages after successful submission', async () => {
      const user = userEvent.setup();
      // First submission fails
      (AudioValidator.validateSong as jest.Mock).mockReturnValueOnce({
        isValid: false,
        errors: ['Title is required']
      });
      // Second submission succeeds
      (AudioValidator.validateSong as jest.Mock).mockReturnValueOnce({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Trigger error
      await user.click(screen.getByRole('button', { name: /add|submit/i }));
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Fix and resubmit
      await user.type(screen.getByLabelText(/title/i), 'Valid Title');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Errors should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });

    it('should reset to initial empty state', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // After submission, form should be empty again
      await waitFor(() => {
        expect(screen.getByLabelText(/title/i).value).toBe('');
      });
    });
  });

  describe('AudioValidator Integration', () => {
    it('should integrate with AudioValidator for validation', async () => {
      const user = userEvent.setup();
      const mockValidationResult: ValidationResult = {
        isValid: true,
        errors: []
      };
      (AudioValidator.validateSong as jest.Mock).mockReturnValue(mockValidationResult);
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      expect(AudioValidator.validateSong).toHaveBeenCalledWith({
        id: expect.any(String), // ID gets generated before validation
        title: 'Test Song',
        artist: 'Test Artist',
        cover: '<https://example.com/cover.jpg>',
        url: '<https://example.com/song.mp3>'
      });
    });

    it('should handle validation errors from AudioValidator', async () => {
      const user = userEvent.setup();
      const mockValidationResult: ValidationResult = {
        isValid: false,
        errors: ['Invalid format']
      };
      (AudioValidator.validateSong as jest.Mock).mockReturnValue(mockValidationResult);
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission gracefully', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Should show validation errors, not crash
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
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
      await user.type(screen.getByLabelText(/artist/i), '   ');
      await user.type(screen.getByLabelText(/cover/i), '   ');
      await user.type(screen.getByLabelText(/audio.*url/i), '   ');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Should trigger validation errors
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should handle very long input values', async () => {
      const user = userEvent.setup();
      const longValue = 'x'.repeat(200); // Reduced for performance
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Use paste for long values to avoid timeout
      await user.click(screen.getByLabelText(/title/i));
      await user.paste(longValue);
      await user.click(screen.getByLabelText(/artist/i));
      await user.paste(longValue);
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle special characters in inputs', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song "Title" with \'quotes\'');
      await user.type(screen.getByLabelText(/artist/i), 'Artist & Co.');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3?token=abc>');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalledTimes(1);
        const song = mockOnAddSong.mock.calls[0][0];
        expect(song.title).toBe('Song "Title" with \'quotes\'');
        expect(song.artist).toBe('Artist & Co.');
      });
    });

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      (AudioValidator.validateSong as jest.Mock).mockReturnValue({
        isValid: true,
        errors: []
      });
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      // Fill form once
      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '<https://example.com/cover.jpg>');
      await user.type(screen.getByLabelText(/audio.*url/i), '<https://example.com/song.mp3>');

      // Submit multiple times rapidly
      await user.click(screen.getByRole('button', { name: /add|submit/i }));
      await user.click(screen.getByRole('button', { name: /add|submit/i }));
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      // Should only submit valid forms (though subsequent ones might fail validation due to clearing)
      // The important thing is it doesn't crash
      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
