// tests/components/ProgressBar.test.tsx
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressBar } from '@/components/ProgressBar';
import { TimeFormatter } from '@/utils/time-formatter';

describe('ProgressBar Component', () => {
  const defaultProps = {
    currentTime: 0,
    duration: 180, // 3 minutes
    onSeek: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock TimeFormatter
    jest.spyOn(TimeFormatter, 'formatTime').mockImplementation((seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<ProgressBar {...defaultProps} />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render progress bar element', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toBeInTheDocument();
    });

    it('should display current time', () => {
      render(<ProgressBar {...defaultProps} currentTime={90} />);

      expect(screen.getByText('01:30')).toBeInTheDocument();
    });

    it('should display duration', () => {
      render(<ProgressBar {...defaultProps} duration={180} />);

      expect(screen.getByText('03:00')).toBeInTheDocument();
    });

    it('should accept all required props', () => {
      expect(() => render(<ProgressBar {...defaultProps} />)).not.toThrow();
    });
  });

  describe('Time Display', () => {
    it('should format current time in MM:SS', () => {
      render(<ProgressBar {...defaultProps} currentTime={125} />);

      expect(screen.getByText('02:05')).toBeInTheDocument();
    });

    it('should format duration in MM:SS', () => {
      render(<ProgressBar {...defaultProps} duration={245} />);

      expect(screen.getByText('04:05')).toBeInTheDocument();
    });

    it('should use TimeFormatter.formatTime()', () => {
      render(<ProgressBar {...defaultProps} currentTime={60} duration={180} />);

      expect(TimeFormatter.formatTime).toHaveBeenCalledWith(60);
      expect(TimeFormatter.formatTime).toHaveBeenCalledWith(180);
    });

    it('should update current time display when prop changes', () => {
      const { rerender } = render(<ProgressBar {...defaultProps} currentTime={30} />);

      expect(screen.getByText('00:30')).toBeInTheDocument();

      rerender(<ProgressBar {...defaultProps} currentTime={60} />);

      expect(screen.getByText('01:00')).toBeInTheDocument();
      expect(screen.queryByText('00:30')).not.toBeInTheDocument();
    });

    it('should update duration display when prop changes', () => {
      const { rerender } = render(<ProgressBar {...defaultProps} duration={180} />);

      expect(screen.getByText('03:00')).toBeInTheDocument();

      rerender(<ProgressBar {...defaultProps} duration={240} />);

      expect(screen.getByText('04:00')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress as (currentTime/duration)*100', () => {
      render(<ProgressBar {...defaultProps} currentTime={90} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      // Progress should be 50%
      expect(progressBar).toHaveAttribute('aria-valuenow', '90');
      expect(progressBar).toHaveAttribute('aria-valuemax', '180');
    });

    it('should handle zero duration without division by zero', () => {
      expect(() =>
        render(<ProgressBar {...defaultProps} duration={0} />)
      ).not.toThrow();
    });

    it('should show 0% progress when currentTime is 0', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should show 100% progress when currentTime equals duration', () => {
      render(<ProgressBar {...defaultProps} currentTime={180} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '180');
      expect(progressBar).toHaveAttribute('aria-valuemax', '180');
    });

    it('should update progress as currentTime changes', () => {
      const { rerender } = render(
        <ProgressBar {...defaultProps} currentTime={0} duration={100} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      rerender(<ProgressBar {...defaultProps} currentTime={50} duration={100} />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should handle progress when currentTime > duration', () => {
      render(<ProgressBar {...defaultProps} currentTime={200} duration={180} />);

      const progressBar = screen.getByRole('progressbar');

      // Should still render without errors
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Click-to-Seek', () => {
    it('should call onSeek when bar is clicked', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      // Mock getBoundingClientRect
      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 50 });

      expect(onSeek).toHaveBeenCalled();
    });

    it('should calculate correct time from click position', () => {
      const onSeek = jest.fn();
      const duration = 180;

      render(<ProgressBar {...defaultProps} duration={duration} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click at 50% position
      fireEvent.click(progressBar, { clientX: 50 });

      // Should seek to 90 seconds (50% of 180)
      expect(onSeek).toHaveBeenCalledWith(90);
    });

    it('should clamp seek time to valid range [0, duration]', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={100} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click beyond right edge
      fireEvent.click(progressBar, { clientX: 150 });

      // Should clamp to duration
      const callArg = onSeek.mock.calls[0][0];
      expect(callArg).toBeLessThanOrEqual(100);
    });

    it('should handle multiple clicks', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 25 });
      fireEvent.click(progressBar, { clientX: 50 });
      fireEvent.click(progressBar, { clientX: 75 });

      expect(onSeek).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Navigation - Arrow Keys', () => {
    it('should increase time by 5s on Arrow Right', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={30} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledWith(35);
    });

    it('should decrease time by 5s on Arrow Left', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={30} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' });

      expect(onSeek).toHaveBeenCalledWith(25);
    });

    it('should not exceed duration on Arrow Right', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={178} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledWith(180);
    });

    it('should not go below 0 on Arrow Left', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={3} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' });

      expect(onSeek).toHaveBeenCalledWith(0);
    });
  });

  describe('Keyboard Navigation - Home/End', () => {
    it('should seek to 0 on Home key', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={90} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'Home' });

      expect(onSeek).toHaveBeenCalledWith(0);
    });

    it('should seek to duration on End key', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={90} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'End' });

      expect(onSeek).toHaveBeenCalledWith(180);
    });
  });

  describe('Time Clamping', () => {
    it('should clamp calculated time to duration when seeking beyond end', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={100} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click way past the end
      fireEvent.click(progressBar, { clientX: 200 });

      const seekTime = onSeek.mock.calls[0][0];
      expect(seekTime).toBeLessThanOrEqual(100);
    });

    it('should clamp calculated time to 0 when seeking before start', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click before the start
      fireEvent.click(progressBar, { clientX: -50 });

      const seekTime = onSeek.mock.calls[0][0];
      expect(seekTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle Arrow Right at end of track', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={180} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledWith(180);
    });

    it('should handle Arrow Left at start of track', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={0} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' });

      expect(onSeek).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility', () => {
    it('should have role="progressbar"', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });

    it('should have aria-valuemin="0"', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have aria-valuemax set to duration', () => {
      render(<ProgressBar {...defaultProps} duration={240} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuemax', '240');
    });

    it('should have aria-valuenow set to currentTime', () => {
      render(<ProgressBar {...defaultProps} currentTime={75} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should have aria-label or aria-labelledby', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      const hasAriaLabel = progressBar.hasAttribute('aria-label') ||
                           progressBar.hasAttribute('aria-labelledby');

      expect(hasAriaLabel).toBe(true);
    });

    it('should be keyboard focusable (tabIndex="0")', () => {
      render(<ProgressBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toHaveAttribute('tabIndex', '0');
    });

    it('should update aria-valuenow when currentTime changes', () => {
      const { rerender } = render(
        <ProgressBar {...defaultProps} currentTime={30} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');

      rerender(<ProgressBar {...defaultProps} currentTime={60} />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });
  });

  describe('Zero-Division Guard', () => {
    it('should not crash when duration is 0', () => {
      expect(() =>
        render(<ProgressBar {...defaultProps} duration={0} />)
      ).not.toThrow();
    });

    it('should show progress 0 when duration is 0', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={0} />);

      const progressBar = screen.getByRole('progressbar');

      // Should handle gracefully
      expect(progressBar).toBeInTheDocument();
    });

    it('should not throw error during calculation with duration 0', () => {
      const { container } = render(
        <ProgressBar {...defaultProps} currentTime={10} duration={0} />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle click when duration is 0', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={0} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      expect(() => fireEvent.click(progressBar, { clientX: 50 })).not.toThrow();
    });
  });

  describe('Edge Cases - Time Values', () => {
    it('should handle currentTime > duration', () => {
      expect(() =>
        render(<ProgressBar {...defaultProps} currentTime={200} duration={180} />)
      ).not.toThrow();
    });

    it('should handle negative currentTime', () => {
      expect(() =>
        render(<ProgressBar {...defaultProps} currentTime={-10} />)
      ).not.toThrow();
    });

    it('should handle very large durations (hours)', () => {
      render(<ProgressBar {...defaultProps} duration={7200} />);

      expect(screen.getByText('120:00')).toBeInTheDocument();
    });

    it('should handle zero values for both time and duration', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={0} />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge Cases - Interactions', () => {
    it('should handle rapid clicks', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 10 });
      fireEvent.click(progressBar, { clientX: 20 });
      fireEvent.click(progressBar, { clientX: 30 });
      fireEvent.click(progressBar, { clientX: 40 });
      fireEvent.click(progressBar, { clientX: 50 });

      expect(onSeek).toHaveBeenCalledTimes(5);
    });

    it('should handle rapid keyboard presses', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={50} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' });

      expect(onSeek).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard navigation with duration = 0', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={0} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      expect(() => {
        fireEvent.keyDown(progressBar, { key: 'ArrowRight' });
        fireEvent.keyDown(progressBar, { key: 'End' });
      }).not.toThrow();
    });

    it('should handle seeking to same position multiple times', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} duration={180} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      fireEvent.click(progressBar, { clientX: 50 });
      fireEvent.click(progressBar, { clientX: 50 });
      fireEvent.click(progressBar, { clientX: 50 });

      expect(onSeek).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration', () => {
    it('should work at song start (0:00 / 3:45)', () => {
      render(<ProgressBar {...defaultProps} currentTime={0} duration={225} />);

      expect(screen.getByText('00:00')).toBeInTheDocument();
      expect(screen.getByText('03:45')).toBeInTheDocument();
    });

    it('should work at song middle (1:30 / 3:45)', () => {
      render(<ProgressBar {...defaultProps} currentTime={90} duration={225} />);

      expect(screen.getByText('01:30')).toBeInTheDocument();
      expect(screen.getByText('03:45')).toBeInTheDocument();
    });

    it('should work at song end (3:45 / 3:45)', () => {
      render(<ProgressBar {...defaultProps} currentTime={225} duration={225} />);

      const timeDisplays = screen.getAllByText('03:45');
      expect(timeDisplays).toHaveLength(2); // currentTime and duration both show 03:45

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '225');
      expect(progressBar).toHaveAttribute('aria-valuemax', '225');
    });

    it('should support complete playback simulation', () => {
      const { rerender } = render(
        <ProgressBar {...defaultProps} currentTime={0} duration={100} />
      );

      // Simulate playback
      for (let time = 0; time <= 100; time += 10) {
        rerender(<ProgressBar {...defaultProps} currentTime={time} duration={100} />);
      }

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle keyboard navigation through entire song', () => {
      const onSeek = jest.fn();

      render(<ProgressBar {...defaultProps} currentTime={0} duration={100} onSeek={onSeek} />);

      const progressBar = screen.getByRole('progressbar');

      // Navigate forward
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' }); // 5s
      fireEvent.keyDown(progressBar, { key: 'ArrowRight' }); // 10s

      // Navigate backward
      fireEvent.keyDown(progressBar, { key: 'ArrowLeft' }); // 5s

      // Jump to end
      fireEvent.keyDown(progressBar, { key: 'End' }); // 100s

      // Jump to start
      fireEvent.keyDown(progressBar, { key: 'Home' }); // 0s

      expect(onSeek).toHaveBeenCalledTimes(5);
    });
  });
});
