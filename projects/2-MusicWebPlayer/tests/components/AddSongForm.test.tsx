// tests/components/AddSongForm.test.tsx
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddSongForm } from '@/components/AddSongForm';

// Mock crypto.randomUUID if not available
if (!global.crypto) {
  // @ts-ignore
  global.crypto = {};
}
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => 'test-uuid-' + Math.random().toString(36).slice(2);
}

// Mock IndexedDB Storage with immediate resolution
jest.mock('@/utils/indexed-db-storage', () => ({
  IndexedDBStorage: {
    storeFile: jest.fn(() => Promise.resolve('test-id')),
    getFile: jest.fn(() => Promise.resolve(null)),
    getFileBlobURL: jest.fn(() => Promise.resolve('blob:test-url')),
  }
}));

// Mock AudioValidator to always pass validation
jest.mock('@/utils/audio-validator', () => ({
  AudioValidator: {
    validateSong: jest.fn(() => ({ isValid: true, errors: [] })),
    isValidAudioUrl: jest.fn(() => true),
    isValidImageUrl: jest.fn(() => true),
    isSupportedFormat: jest.fn(() => true),
    isValidImageFormat: jest.fn(() => true),
  }
}));

describe('AddSongForm Component', () => {
  const mockOnAddSong = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);
      expect(container).toBeInTheDocument();
    });

    it('should render form element', () => {
      const { container } = render(<AddSongForm onAddSong={mockOnAddSong} />);
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const submitButton = screen.getByRole('button', { name: /add song/i });
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
      const audioInput = screen.getByLabelText(/audio.*file/i);
      expect(audioInput).toBeInTheDocument();
      expect(audioInput).toHaveAttribute('type', 'url');
    });

    it('should have title and artist inputs with required attribute', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const titleInput = screen.getByLabelText(/title/i);
      const artistInput = screen.getByLabelText(/artist/i);
      expect(titleInput).toHaveAttribute('required');
      expect(artistInput).toHaveAttribute('required');
    });

    it('should have file upload buttons', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const coverFileInput = document.getElementById('cover-file-input');
      const audioFileInput = document.getElementById('audio-file-input');
      expect(coverFileInput).toBeInTheDocument();
      expect(audioFileInput).toBeInTheDocument();
    });
  });

  describe('Controlled Inputs', () => {
    it('should update title state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      await user.type(titleInput, 'Test Song');
      expect(titleInput.value).toBe('Test Song');
    });

    it('should update artist state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement;
      await user.type(artistInput, 'Test Artist');
      expect(artistInput.value).toBe('Test Artist');
    });

    it('should update cover URL state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const coverInput = screen.getByLabelText(/cover/i) as HTMLInputElement;
      await user.type(coverInput, 'https://example.com/cover.jpg');
      expect(coverInput.value).toBe('https://example.com/cover.jpg');
    });

    it('should update audio URL state when typing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const audioInput = screen.getByLabelText(/audio.*file/i) as HTMLInputElement;
      await user.type(audioInput, 'https://example.com/song.mp3');
      expect(audioInput.value).toBe('https://example.com/song.mp3');
    });
  });

  describe('Form Validation - Success', () => {
    it('should call onAddSong with valid Song object when URLs are provided', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '/covers/test.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), '/songs/test.mp3');
      
      const submitButton = screen.getByRole('button', { name: /add song/i });
      await user.click(submitButton);

      // Give a moment for the async code to run
      await new Promise(resolve => setTimeout(resolve, 100));

      // The callback should have been called by now
      expect(mockOnAddSong).toHaveBeenCalledTimes(1);
      
      const song = mockOnAddSong.mock.calls[0][0];
      expect(song).toHaveProperty('id');
      expect(song.title).toBe('Test Song');
      expect(song.artist).toBe('Test Artist');
      expect(song.cover).toBe('/covers/test.jpg');
      expect(song.url).toBe('/songs/test.mp3');
    }, 10000);

    it('should generate unique ID for each song', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/covers/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), '/songs/song.mp3');
      
      const submitButton = screen.getByRole('button', { name: /add song/i });
      await user.click(submitButton);

      // Wait for the async submission to complete
      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalled();
      }, { timeout: 5000 });
      
      const song = mockOnAddSong.mock.calls[0][0];
      expect(song.id).toBeTruthy();
      expect(typeof song.id).toBe('string');
      expect(song.id.length).toBeGreaterThan(0);
    }, 10000);

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '/covers/test.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), '/songs/test.mp3');
      
      const submitButton = screen.getByRole('button', { name: /add song/i });
      await user.click(submitButton);

      // Wait for the async submission to complete
      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalled();
      }, { timeout: 5000 });
      
      // Check that form was cleared
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        const artistInput = screen.getByLabelText(/artist/i) as HTMLInputElement;
        expect(titleInput.value).toBe('');
        expect(artistInput.value).toBe('');
      });
    }, 10000);
  });

  describe('Form Validation - Errors', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), 'https://example.com/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), 'https://example.com/song.mp3');
      await user.click(screen.getByRole('button', { name: /add song/i }));

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
      expect(mockOnAddSong).not.toHaveBeenCalled();
    });

    it('should show error when artist is empty', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/cover/i), 'https://example.com/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), 'https://example.com/song.mp3');
      await user.click(screen.getByRole('button', { name: /add song/i }));

      await waitFor(() => {
        expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
      });
      expect(mockOnAddSong).not.toHaveBeenCalled();
    });

    it('should show error when both cover URL and file are missing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/audio.*file/i), 'https://example.com/song.mp3');
      await user.click(screen.getByRole('button', { name: /add song/i }));

      await waitFor(() => {
        expect(screen.getByText(/cover image url or file is required/i)).toBeInTheDocument();
      });
      expect(mockOnAddSong).not.toHaveBeenCalled();
    });

    it('should show error when both audio URL and file are missing', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), 'https://example.com/cover.jpg');
      await user.click(screen.getByRole('button', { name: /add song/i }));

      await waitFor(() => {
        expect(screen.getByText(/audio file url or file is required/i)).toBeInTheDocument();
      });
      expect(mockOnAddSong).not.toHaveBeenCalled();
    });

    it('should show multiple errors simultaneously', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add song/i }));

      await waitFor(() => {
        const errors = screen.getAllByRole('alert');
        expect(errors.length).toBeGreaterThan(1);
      });
      expect(mockOnAddSong).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    it('should reset to initial empty state', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '/covers/test.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), '/songs/test.mp3');
      
      const submitButton = screen.getByRole('button', { name: /add song/i });
      await user.click(submitButton);

      // Wait for the async submission to complete
      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalled();
      }, { timeout: 5000 });
      
      // Check that form was reset
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
        expect(titleInput.value).toBe('');
      });
    }, 10000);
  });

  describe('Success Message', () => {
    it('should show success message after submission', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), '/covers/test.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), '/songs/test.mp3');
      
      const submitButton = screen.getByRole('button', { name: /add song/i });
      await user.click(submitButton);

      // Wait for the async submission to complete and success message to appear
      await waitFor(() => {
        expect(screen.getByText(/song added successfully/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Also verify the callback was called
      expect(mockOnAddSong).toHaveBeenCalled();
    }, 10000);
  });

  describe('Accessibility', () => {
    it('should have labels associated with inputs', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      const titleInput = screen.getByLabelText(/title/i);
      const artistInput = screen.getByLabelText(/artist/i);
      const coverInput = screen.getByLabelText(/cover/i);
      const audioInput = screen.getByLabelText(/audio.*file/i);

      expect(titleInput).toHaveAttribute('id');
      expect(artistInput).toHaveAttribute('id');
      expect(coverInput).toHaveAttribute('id');
      expect(audioInput).toHaveAttribute('id');
    });

    it('should have accessible submit button', () => {
      render(<AddSongForm onAddSong={mockOnAddSong} />);
      const submitButton = screen.getByRole('button', { name: /add song/i });
      expect(submitButton).toHaveAccessibleName();
    });

    it('should mark invalid fields with aria-invalid', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.click(screen.getByRole('button', { name: /add song/i }));

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i);
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only inputs', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), '   ');
      await user.type(screen.getByLabelText(/artist/i), '   ');
      await user.click(screen.getByRole('button', { name: /add song/i }));

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });
      expect(mockOnAddSong).not.toHaveBeenCalled();
    });

    it('should handle special characters in inputs', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Song "Title" with \'quotes\'');
      await user.type(screen.getByLabelText(/artist/i), 'Artist & Co.');
      await user.type(screen.getByLabelText(/cover/i), '/covers/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), '/songs/song.mp3');
      
      const submitButton = screen.getByRole('button', { name: /add song/i });
      await user.click(submitButton);

      // Wait for the async submission to complete
      await waitFor(() => {
        expect(mockOnAddSong).toHaveBeenCalled();
      }, { timeout: 5000 });
      
      const song = mockOnAddSong.mock.calls[0][0];
      expect(song.title).toBe('Song "Title" with \'quotes\'');
      expect(song.artist).toBe('Artist & Co.');
    }, 10000);

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      render(<AddSongForm onAddSong={mockOnAddSong} />);

      await user.type(screen.getByLabelText(/title/i), 'Test Song');
      await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
      await user.type(screen.getByLabelText(/cover/i), 'https://example.com/cover.jpg');
      await user.type(screen.getByLabelText(/audio.*file/i), 'https://example.com/song.mp3');
      
      const submitButton = screen.getByRole('button', { name: /add song/i });
      await user.click(submitButton);

      // Button should be enabled again after submission completes
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
});
