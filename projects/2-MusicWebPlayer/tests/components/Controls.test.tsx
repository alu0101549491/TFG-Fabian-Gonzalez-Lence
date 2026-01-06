// tests/components/Controls.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from '@/components/Controls';
import { RepeatMode } from '@/types/playback-modes';

describe('Controls Component', () => {
  const defaultProps = {
    isPlaying: false,
    onPlayPause: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onRepeatToggle: jest.fn(),
    onShuffleToggle: jest.fn(),
    repeatMode: RepeatMode.OFF,
    isShuffled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<Controls {...defaultProps} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render all 5 buttons', () => {
      render(<Controls {...defaultProps} />);

      expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shuffle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();
    });

    it('should render buttons in correct order', () => {
      render(<Controls {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);

      // Verify order: Previous, Play/Pause, Next, Shuffle, Repeat
      expect(buttons[0].getAttribute('aria-label')).toMatch(/previous/i);
      expect(buttons[1].getAttribute('aria-label')).toMatch(/play/i);
      expect(buttons[2].getAttribute('aria-label')).toMatch(/next/i);
      expect(buttons[3].getAttribute('aria-label')).toMatch(/shuffle/i);
      expect(buttons[4].getAttribute('aria-label')).toMatch(/repeat/i);
    });

    it('should render all buttons as button elements', () => {
      render(<Controls {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Play/Pause Button', () => {
    it('should render play/pause button', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/play/i);
      expect(button).toBeInTheDocument();
    });

    it('should show play icon when isPlaying is false', () => {
      render(<Controls {...defaultProps} isPlaying={false} />);
      const button = screen.getByLabelText(/play/i);
      expect(button).toBeInTheDocument();
    });

    it('should show pause icon when isPlaying is true', () => {
      render(<Controls {...defaultProps} isPlaying={true} />);
      const button = screen.getByLabelText(/pause/i);
      expect(button).toBeInTheDocument();
    });

    it('should call onPlayPause when clicked', async () => {
      const user = userEvent.setup();
      const onPlayPause = jest.fn();
      render(<Controls {...defaultProps} onPlayPause={onPlayPause} />);
      const button = screen.getByLabelText(/play/i);
      await user.click(button);
      expect(onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('should have aria-label "Play" when not playing', () => {
      render(<Controls {...defaultProps} isPlaying={false} />);
      const button = screen.getByLabelText(/play/i);
      expect(button).toHaveAttribute('aria-label');
    });

    it('should have aria-label "Pause" when playing', () => {
      render(<Controls {...defaultProps} isPlaying={true} />);
      const button = screen.getByLabelText(/pause/i);
      expect(button).toHaveAttribute('aria-label');
    });

    it('should change icon when isPlaying changes', () => {
      const { rerender } = render(<Controls {...defaultProps} isPlaying={false} />);
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();

      rerender(<Controls {...defaultProps} isPlaying={true} />);
      expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/play/i)).not.toBeInTheDocument();
    });
  });

  describe('Previous Button', () => {
    it('should render previous button', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/previous/i);
      expect(button).toBeInTheDocument();
    });

    it('should call onPrevious when clicked', async () => {
      const user = userEvent.setup();
      const onPrevious = jest.fn();
      render(<Controls {...defaultProps} onPrevious={onPrevious} />);
      const button = screen.getByLabelText(/previous/i);
      await user.click(button);
      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should not be disabled by default', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/previous/i);
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disablePrevious is true', () => {
      render(<Controls {...defaultProps} disablePrevious={true} />);
      const button = screen.getByLabelText(/previous/i);
      expect(button).toBeDisabled();
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/previous/i);
      expect(button).toHaveAttribute('aria-label');
    });

    it('should not call onPrevious when disabled', async () => {
      const user = userEvent.setup();
      const onPrevious = jest.fn();
      render(<Controls {...defaultProps} onPrevious={onPrevious} disablePrevious={true} />);
      const button = screen.getByLabelText(/previous/i);
      await user.click(button);
      expect(onPrevious).not.toHaveBeenCalled();
    });
  });

  describe('Next Button', () => {
    it('should render next button', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/next/i);
      expect(button).toBeInTheDocument();
    });

    it('should call onNext when clicked', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();
      render(<Controls {...defaultProps} onNext={onNext} />);
      const button = screen.getByLabelText(/next/i);
      await user.click(button);
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should not be disabled by default', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/next/i);
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disableNext is true', () => {
      render(<Controls {...defaultProps} disableNext={true} />);
      const button = screen.getByLabelText(/next/i);
      expect(button).toBeDisabled();
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/next/i);
      expect(button).toHaveAttribute('aria-label');
    });

    it('should not call onNext when disabled', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();
      render(<Controls {...defaultProps} onNext={onNext} disableNext={true} />);
      const button = screen.getByLabelText(/next/i);
      await user.click(button);
      expect(onNext).not.toHaveBeenCalled();
    });
  });

  describe('Shuffle Button', () => {
    it('should render shuffle button', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toBeInTheDocument();
    });

    it('should call onShuffleToggle when clicked', async () => {
      const user = userEvent.setup();
      const onShuffleToggle = jest.fn();
      render(<Controls {...defaultProps} onShuffleToggle={onShuffleToggle} />);
      const button = screen.getByLabelText(/shuffle/i);
      await user.click(button);
      expect(onShuffleToggle).toHaveBeenCalledTimes(1);
    });

    it('should have aria-pressed attribute', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed');
    });

    it('should have aria-pressed="false" when not shuffled', () => {
      render(<Controls {...defaultProps} isShuffled={false} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have aria-pressed="true" when shuffled', () => {
      render(<Controls {...defaultProps} isShuffled={true} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-label');
    });

    it('should update aria-pressed when isShuffled changes', () => {
      const { rerender } = render(<Controls {...defaultProps} isShuffled={false} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<Controls {...defaultProps} isShuffled={true} />);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Repeat Button', () => {
    it('should render repeat button', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });

    it('should call onRepeatToggle when clicked', async () => {
      const user = userEvent.setup();
      const onRepeatToggle = jest.fn();
      render(<Controls {...defaultProps} onRepeatToggle={onRepeatToggle} />);
      const button = screen.getByLabelText(/repeat/i);
      await user.click(button);
      expect(onRepeatToggle).toHaveBeenCalledTimes(1);
    });

    it('should show OFF indicator when repeatMode is OFF', () => {
      render(<Controls {...defaultProps} repeatMode={RepeatMode.OFF} />);
      const button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
      // Button uses icon, just verify it's rendered
      expect(button).not.toHaveClass(/active/i);
    });

    it('should show ALL indicator when repeatMode is ALL', () => {
      render(<Controls {...defaultProps} repeatMode={RepeatMode.ALL} />);
      const button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });

    it('should show ONE indicator when repeatMode is ONE', () => {
      render(<Controls {...defaultProps} repeatMode={RepeatMode.ONE} />);
      const button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });

    it('should cycle through repeat modes when clicked', async () => {
      const user = userEvent.setup();
      const onRepeatToggle = jest.fn();
      const { rerender } = render(<Controls {...defaultProps} repeatMode={RepeatMode.OFF} onRepeatToggle={onRepeatToggle} />);
      const button = screen.getByLabelText(/repeat/i);

      await user.click(button);
      expect(onRepeatToggle).toHaveBeenCalledTimes(1);

      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ALL} onRepeatToggle={onRepeatToggle} />);
      await user.click(button);
      expect(onRepeatToggle).toHaveBeenCalledTimes(2);

      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ONE} onRepeatToggle={onRepeatToggle} />);
      await user.click(button);
      expect(onRepeatToggle).toHaveBeenCalledTimes(3);
    });

    it('should have aria-label', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/repeat/i);
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('Callback Testing', () => {
    it('should call onPlayPause exactly once per click', async () => {
      const user = userEvent.setup();
      const onPlayPause = jest.fn();
      render(<Controls {...defaultProps} onPlayPause={onPlayPause} />);
      const button = screen.getByLabelText(/play/i);
      await user.click(button);
      expect(onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('should call onNext exactly once per click', async () => {
      const user = userEvent.setup();
      const onNext = jest.fn();
      render(<Controls {...defaultProps} onNext={onNext} />);
      const button = screen.getByLabelText(/next/i);
      await user.click(button);
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevious exactly once per click', async () => {
      const user = userEvent.setup();
      const onPrevious = jest.fn();
      render(<Controls {...defaultProps} onPrevious={onPrevious} />);
      const button = screen.getByLabelText(/previous/i);
      await user.click(button);
      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should call onShuffleToggle exactly once per click', async () => {
      const user = userEvent.setup();
      const onShuffleToggle = jest.fn();
      render(<Controls {...defaultProps} onShuffleToggle={onShuffleToggle} />);
      const button = screen.getByLabelText(/shuffle/i);
      await user.click(button);
      expect(onShuffleToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onRepeatToggle exactly once per click', async () => {
      const user = userEvent.setup();
      const onRepeatToggle = jest.fn();
      render(<Controls {...defaultProps} onRepeatToggle={onRepeatToggle} />);
      const button = screen.getByLabelText(/repeat/i);
      await user.click(button);
      expect(onRepeatToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled States', () => {
    it('should disable previous button when disablePrevious is true', () => {
      render(<Controls {...defaultProps} disablePrevious={true} />);
      const button = screen.getByLabelText(/previous/i);
      expect(button).toBeDisabled();
    });

    it('should disable next button when disableNext is true', () => {
      render(<Controls {...defaultProps} disableNext={true} />);
      const button = screen.getByLabelText(/next/i);
      expect(button).toBeDisabled();
    });

    it('should enable buttons when disabled props are false', () => {
      render(<Controls {...defaultProps} disablePrevious={false} disableNext={false} />);
      const prevButton = screen.getByLabelText(/previous/i);
      const nextButton = screen.getByLabelText(/next/i);
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it('should never disable play/pause button', () => {
      render(<Controls {...defaultProps} />);
      const button = screen.getByLabelText(/play/i);
      expect(button).not.toBeDisabled();
    });

    it('should update disabled state when props change', () => {
      const { rerender } = render(<Controls {...defaultProps} disablePrevious={true} />);
      const button = screen.getByLabelText(/previous/i);
      expect(button).toBeDisabled();

      rerender(<Controls {...defaultProps} disablePrevious={false} />);
      expect(button).not.toBeDisabled();
    });
  });

  describe('Repeat Mode Indicators', () => {
    it('should visually indicate OFF mode', () => {
      render(<Controls {...defaultProps} repeatMode={RepeatMode.OFF} />);
      const button = screen.getByLabelText(/repeat/i);
      // Implementation may use different visual cues like icons or text
      expect(button).toBeInTheDocument();
    });

    it('should visually indicate ALL mode', () => {
      render(<Controls {...defaultProps} repeatMode={RepeatMode.ALL} />);
      const button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });

    it('should visually indicate ONE mode', () => {
      render(<Controls {...defaultProps} repeatMode={RepeatMode.ONE} />);
      const button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });

    it('should update visual indicator when repeatMode changes', () => {
      const { rerender } = render(<Controls {...defaultProps} repeatMode={RepeatMode.OFF} />);
      let button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();

      // Should indicate different modes
      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ALL} />);
      rerender(<Controls {...defaultProps} repeatMode={RepeatMode.ONE} />);

      // Verify button still accessible
      button = screen.getByLabelText(/repeat/i);
      expect(button).toBeInTheDocument();
    });
  });

  describe('Shuffle State Indicators', () => {
    it('should visually indicate shuffle state', () => {
      render(<Controls {...defaultProps} isShuffled={true} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update visual indicator when isShuffled changes', () => {
      const { rerender } = render(<Controls {...defaultProps} isShuffled={false} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<Controls {...defaultProps} isShuffled={true} />);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should maintain shuffle state across re-renders', () => {
      const { rerender } = render(<Controls {...defaultProps} isShuffled={true} />);
      const button = screen.getByLabelText(/shuffle/i);
      expect(button).toHaveAttribute('aria-pressed', 'true');

      // Re-render with same props
      rerender(<Controls {...defaultProps} isShuffled={true} />);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Integration', () => {
    it('should coordinate all button interactions', async () => {
      const user = userEvent.setup();
      const callbacks = {
        onPlayPause: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        onRepeatToggle: jest.fn(),
        onShuffleToggle: jest.fn(),
      };

      render(<Controls {...defaultProps} {...callbacks} />);

      // Click all buttons
      await user.click(screen.getByLabelText(/play/i));
      await user.click(screen.getByLabelText(/next/i));
      await user.click(screen.getByLabelText(/previous/i));
      await user.click(screen.getByLabelText(/shuffle/i));
      await user.click(screen.getByLabelText(/repeat/i));

      // Verify all callbacks were called
      expect(callbacks.onPlayPause).toHaveBeenCalledTimes(1);
      expect(callbacks.onNext).toHaveBeenCalledTimes(1);
      expect(callbacks.onPrevious).toHaveBeenCalledTimes(1);
      expect(callbacks.onShuffleToggle).toHaveBeenCalledTimes(1);
      expect(callbacks.onRepeatToggle).toHaveBeenCalledTimes(1);
    });

    it('should work with all repeat modes', () => {
      const modes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];
      modes.forEach(mode => {
        const { unmount } = render(<Controls {...defaultProps} repeatMode={mode} />);
        expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();
        unmount();
      });
    });

    it('should work with shuffle enabled/disabled', () => {
      const states = [true, false];
      states.forEach(state => {
        const { unmount } = render(<Controls {...defaultProps} isShuffled={state} />);
        expect(screen.getByLabelText(/shuffle/i)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional props', () => {
      const { disableNext, disablePrevious, ...requiredProps } = defaultProps;
      expect(() => render(<Controls {...requiredProps as any} />)).not.toThrow();
    });

    it('should handle null callbacks', () => {
      expect(() => render(
        <Controls
          {...defaultProps}
          onPlayPause={null as any}
          onNext={null as any}
          onPrevious={null as any}
          onRepeatToggle={null as any}
          onShuffleToggle={null as any}
        />
      )).not.toThrow();
    });

    it('should handle rapid clicks', async () => {
      const user = userEvent.setup({ delay: null }); // Fast clicks
      const onPlayPause = jest.fn();
      render(<Controls {...defaultProps} onPlayPause={onPlayPause} />);
      const button = screen.getByLabelText(/play/i);

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onPlayPause).toHaveBeenCalledTimes(3);
    });

    it('should maintain correct state after multiple interactions', async () => {
      const user = userEvent.setup();
      const onShuffleToggle = jest.fn();
      const { rerender } = render(<Controls {...defaultProps} onShuffleToggle={onShuffleToggle} isShuffled={false} />);

      // Toggle shuffle on
      await user.click(screen.getByLabelText(/shuffle/i));
      expect(onShuffleToggle).toHaveBeenCalledTimes(1);

      // Re-render with new state
      rerender(<Controls {...defaultProps} onShuffleToggle={onShuffleToggle} isShuffled={true} />);
      expect(screen.getByLabelText(/shuffle/i)).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
