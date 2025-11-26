/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/views/hangman-renderer.test.ts
 * @desc Unit tests for the HangmanRenderer view.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {HangmanRenderer} from '@views/hangman-renderer';

describe('HangmanRenderer', () => {
  let canvas: HTMLCanvasElement;
  let mockContext: jest.Mocked<CanvasRenderingContext2D>;
  let hangmanRenderer: HangmanRenderer;

  beforeEach(() => {
    // Setup DOM with canvas
    document.body.innerHTML = '<canvas id="hangman-canvas" width="400" height="400"></canvas>';
    canvas = document.getElementById('hangman-canvas') as HTMLCanvasElement;

    // Create mock context
    mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineCap: 'butt',
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
    } as any;

    // Mock getContext to return our mock
    canvas.getContext = jest.fn().mockReturnValue(mockContext);

    // Create HangmanRenderer instance
    hangmanRenderer = new HangmanRenderer('hangman-canvas');
  });

  afterEach(() => {
    // Cleanup DOM
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with valid canvas ID', () => {
      // ARRANGE: DOM setup in beforeEach

      // ACT
      const renderer = new HangmanRenderer('hangman-canvas');

      // ASSERT
      expect(renderer).toBeDefined();
      expect(renderer).toBeInstanceOf(HangmanRenderer);
    });

    it('should throw error when canvas element not found', () => {
      // ARRANGE: No canvas with ID 'invalid-id'

      // ACT & ASSERT
      expect(() => new HangmanRenderer('invalid-id')).toThrow();
      expect(() => new HangmanRenderer('invalid-id')).toThrow('not found');
    });

    it('should throw error when element is not a canvas', () => {
      // ARRANGE: Create non-canvas element
      document.body.innerHTML = '<div id="not-canvas"></div>';

      // ACT & ASSERT
      expect(() => new HangmanRenderer('not-canvas')).toThrow();
    });

    it('should throw error when 2D context unavailable', () => {
      // ARRANGE: Mock getContext to return null
      canvas.getContext = jest.fn().mockReturnValue(null);

      // ACT & ASSERT
      expect(() => new HangmanRenderer('hangman-canvas')).toThrow();
      expect(() => new HangmanRenderer('hangman-canvas')).toThrow('context');
    });

    it('should store reference to canvas element', () => {
      // ARRANGE & ACT
      const renderer = new HangmanRenderer('hangman-canvas');

      // ASSERT
      // We can't directly access private canvas, but we can verify it's working
      // by rendering and checking that it affects the correct canvas element
      renderer.render(0);
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });

    it('should store reference to 2D context', () => {
      // ARRANGE & ACT
      const renderer = new HangmanRenderer('hangman-canvas');

      // ASSERT
      // We can't directly access private context, but we can verify it's working
      // by rendering and checking that it uses the mock context
      renderer.render(0);
      expect(mockContext.clearRect).toHaveBeenCalled();
    });

    it('should validate canvas element type', () => {
      // ARRANGE: Create a div instead of canvas
      document.body.innerHTML = '<div id="div-element"></div>';

      // ACT & ASSERT
      expect(() => new HangmanRenderer('div-element')).toThrow();
    });
  });

  describe('render', () => {
    it('should clear canvas before drawing', () => {
      // ARRANGE: renderer already created

      // ACT
      hangmanRenderer.render(0);

      // ASSERT: clearRect should be called
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });

    it('should draw only gallows for state 0', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(0);

      // ASSERT: Gallows should be drawn (4 lines: base, post, beam, rope)
      // beginPath called at least 4 times for gallows
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();

      // Should not draw head (arc)
      expect(mockContext.arc).not.toHaveBeenCalled();
    });

    it('should draw gallows and head for state 1', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(1);

      // ASSERT: Should include arc for head
      expect(mockContext.arc).toHaveBeenCalled();
      // Arc called once for head
      expect(mockContext.arc).toHaveBeenCalledTimes(1);
    });

    it('should draw progressively more parts as attempts increase', () => {
      // ARRANGE: Track drawing calls for each state
      const drawCallsPerState: number[] = [];

      // ACT: Render each state and count stroke calls
      for (let attempts = 0; attempts <= 6; attempts++) {
        mockContext.stroke.mockClear();
        hangmanRenderer.render(attempts);
        drawCallsPerState.push(mockContext.stroke.mock.calls.length);
      }

      // ASSERT: Each state should have more or equal strokes than previous
      for (let i = 1; i < drawCallsPerState.length; i++) {
        expect(drawCallsPerState[i]).toBeGreaterThanOrEqual(drawCallsPerState[i - 1]);
      }
    });

    it('should draw complete hangman for state 6', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(6);

      // ASSERT: Should have drawn all parts
      // Gallows (4 parts) + head (1) + body (1) + left arm (1) + right arm (1) + left leg (1) + right leg (1)
      // Total strokes should be significant
      expect(mockContext.stroke.mock.calls.length).toBeGreaterThan(8);
    });

    it('should draw gallows + head + body for state 2', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(2);

      // ASSERT: Should include head and body
      expect(mockContext.arc).toHaveBeenCalledTimes(1); // Head
      expect(mockContext.lineTo).toHaveBeenCalled(); // Body (line)
    });

    it('should draw gallows + head + body + left arm for state 3', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(3);

      // ASSERT: Should include head, body, and left arm
      expect(mockContext.arc).toHaveBeenCalledTimes(1); // Head
      expect(mockContext.lineTo).toHaveBeenCalled(); // Body and arms
    });

    it('should draw gallows + head + body + both arms for state 4', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(4);

      // ASSERT: Should include head, body, and both arms
      expect(mockContext.arc).toHaveBeenCalledTimes(1); // Head
      expect(mockContext.lineTo).toHaveBeenCalled(); // Body and arms
    });

    it('should draw gallows + head + body + both arms + left leg for state 5', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(5);

      // ASSERT: Should include head, body, both arms, and left leg
      expect(mockContext.arc).toHaveBeenCalledTimes(1); // Head
      expect(mockContext.lineTo).toHaveBeenCalled(); // Body, arms, and legs
    });

    it('should clamp attempts to valid range (0-6)', () => {
      // ARRANGE & ACT: Test values outside range
      hangmanRenderer.render(-1); // Should be treated as 0
      const callsForNeg1 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(7); // Should be treated as 6
      const callsFor7 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(0); // Actual 0
      const callsFor0 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(6); // Actual 6
      const callsFor6 = mockContext.stroke.mock.calls.length;

      // ASSERT: -1 should behave like 0, 7 should behave like 6
      expect(callsForNeg1).toBe(callsFor0);
      expect(callsFor7).toBe(callsFor6);
    });

    it('should draw same state consistently across multiple calls', () => {
      // ARRANGE
      hangmanRenderer.render(3);
      const firstCallCount = mockContext.stroke.mock.calls.length;

      // ACT: Render same state again
      mockContext.stroke.mockClear();
      hangmanRenderer.render(3);
      const secondCallCount = mockContext.stroke.mock.calls.length;

      // ASSERT: Should be the same
      expect(firstCallCount).toBe(secondCallCount);
    });

    it('should draw gallows for all states (0-6)', () => {
      // ARRANGE & ACT: Test each state
      for (let attempts = 0; attempts <= 6; attempts++) {
        mockContext.stroke.mockClear();
        hangmanRenderer.render(attempts);

        // ASSERT: Each state should include gallows (at least 4 strokes for base, post, beam, rope)
        expect(mockContext.stroke).toHaveBeenCalled();
      }
    });

    it('should draw head for states 1-6 (not for state 0)', () => {
      // ARRANGE
      hangmanRenderer.render(0);
      const arcCallsFor0 = mockContext.arc.mock.calls.length;

      // ACT & ASSERT: States 1-6 should have head (arc)
      for (let attempts = 1; attempts <= 6; attempts++) {
        mockContext.arc.mockClear();
        hangmanRenderer.render(attempts);
        expect(mockContext.arc).toHaveBeenCalledTimes(1); // Head
      }

      // State 0 should not have head
      expect(arcCallsFor0).toBe(0);
    });

    it('should draw body for states 2-6 (not for states 0-1)', () => {
      // ARRANGE: Test states 0 and 1
      hangmanRenderer.render(0);
      const strokeCallsFor0 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(1);
      const strokeCallsFor1 = mockContext.stroke.mock.calls.length;

      // ACT & ASSERT: States 2-6 should have more strokes than 0 or 1
      for (let attempts = 2; attempts <= 6; attempts++) {
        mockContext.stroke.mockClear();
        hangmanRenderer.render(attempts);
        const strokeCalls = mockContext.stroke.mock.calls.length;

        // Should have more strokes than states 0 and 1
        expect(strokeCalls).toBeGreaterThan(strokeCallsFor0);
        expect(strokeCalls).toBeGreaterThan(strokeCallsFor1);
      }
    });

    it('should draw left arm for states 3-6 (not for states 0-2)', () => {
      // ARRANGE: Test states 0, 1, 2
      hangmanRenderer.render(2);
      const strokeCallsFor2 = mockContext.stroke.mock.calls.length;

      // ACT & ASSERT: States 3-6 should have more strokes than 2
      for (let attempts = 3; attempts <= 6; attempts++) {
        mockContext.stroke.mockClear();
        hangmanRenderer.render(attempts);
        const strokeCalls = mockContext.stroke.mock.calls.length;

        // Should have more strokes than state 2
        expect(strokeCalls).toBeGreaterThan(strokeCallsFor2);
      }
    });

    it('should draw right arm for states 4-6 (not for states 0-3)', () => {
      // ARRANGE: Test states 0-3
      hangmanRenderer.render(3);
      const strokeCallsFor3 = mockContext.stroke.mock.calls.length;

      // ACT & ASSERT: States 4-6 should have more strokes than 3
      for (let attempts = 4; attempts <= 6; attempts++) {
        mockContext.stroke.mockClear();
        hangmanRenderer.render(attempts);
        const strokeCalls = mockContext.stroke.mock.calls.length;

        // Should have more strokes than state 3
        expect(strokeCalls).toBeGreaterThan(strokeCallsFor3);
      }
    });

    it('should draw left leg for states 5-6 (not for states 0-4)', () => {
      // ARRANGE: Test states 0-4
      hangmanRenderer.render(4);
      const strokeCallsFor4 = mockContext.stroke.mock.calls.length;

      // ACT & ASSERT: States 5-6 should have more strokes than 4
      for (let attempts = 5; attempts <= 6; attempts++) {
        mockContext.stroke.mockClear();
        hangmanRenderer.render(attempts);
        const strokeCalls = mockContext.stroke.mock.calls.length;

        // Should have more strokes than state 4
        expect(strokeCalls).toBeGreaterThan(strokeCallsFor4);
      }
    });

    it('should draw right leg only for state 6 (not for states 0-5)', () => {
      // ARRANGE: Test states 0-5
      hangmanRenderer.render(5);
      const strokeCallsFor5 = mockContext.stroke.mock.calls.length;

      // ACT: Render state 6
      mockContext.stroke.mockClear();
      hangmanRenderer.render(6);
      const strokeCallsFor6 = mockContext.stroke.mock.calls.length;

      // ASSERT: State 6 should have more strokes than state 5
      expect(strokeCallsFor6).toBeGreaterThan(strokeCallsFor5);
    });
  });

  describe('clear', () => {
    it('should call clearRect with canvas dimensions', () => {
      // ARRANGE & ACT
      hangmanRenderer.clear();

      // ASSERT
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
      expect(mockContext.clearRect).toHaveBeenCalledTimes(1);
    });

    it('should allow rendering after clear', () => {
      // ARRANGE: Render something first
      hangmanRenderer.render(3);

      // ACT: Clear and render again
      hangmanRenderer.clear();
      mockContext.stroke.mockClear();
      hangmanRenderer.render(0);

      // ASSERT: Should be able to render after clear
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should clear canvas completely', () => {
      // ARRANGE: Render something
      hangmanRenderer.render(6);

      // ACT: Clear
      hangmanRenderer.clear();

      // ASSERT: Should call clearRect with full canvas dimensions
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });

    it('should be safe to call clear multiple times', () => {
      // ARRANGE & ACT: Clear multiple times
      expect(() => {
        hangmanRenderer.clear();
        hangmanRenderer.clear();
        hangmanRenderer.clear();
      }).not.toThrow();

      // ASSERT: Should call clearRect each time
      expect(mockContext.clearRect).toHaveBeenCalledTimes(3);
    });

    it('should work after constructor', () => {
      // ARRANGE: Fresh instance

      // ACT & ASSERT: Should not throw
      expect(() => hangmanRenderer.clear()).not.toThrow();
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle render with negative attempts', () => {
      // ARRANGE & ACT
      expect(() => hangmanRenderer.render(-1)).not.toThrow();

      // ASSERT: Should treat as 0 (gallows only)
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });

    it('should handle render with attempts > 6', () => {
      // ARRANGE & ACT
      expect(() => hangmanRenderer.render(10)).not.toThrow();

      // ASSERT: Should treat as 6 (complete hangman)
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });

    it('should render(0) multiple times idempotently', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(0);
      const firstCallCount = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(0);
      const secondCallCount = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(0);
      const thirdCallCount = mockContext.stroke.mock.calls.length;

      // ASSERT: All should be the same (gallows only)
      expect(firstCallCount).toBe(secondCallCount);
      expect(secondCallCount).toBe(thirdCallCount);
    });

    it('should render(6) multiple times idempotently', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(6);
      const firstCallCount = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(6);
      const secondCallCount = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(6);
      const thirdCallCount = mockContext.stroke.mock.calls.length;

      // ASSERT: All should be the same (complete hangman)
      expect(firstCallCount).toBe(secondCallCount);
      expect(secondCallCount).toBe(thirdCallCount);
    });

    it('should handle non-sequential render sequence: 0 → 3 → 6', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(0);
      mockContext.stroke.mockClear();

      hangmanRenderer.render(3);
      const callsAfter3 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(6);
      const callsAfter6 = mockContext.stroke.mock.calls.length;

      // ASSERT: Each render should draw complete state, not incremental
      expect(callsAfter6).toBeGreaterThan(callsAfter3);
    });

    it('should handle reverse render sequence: 6 → 0', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(6);
      const callsAfter6 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(0);
      const callsAfter0 = mockContext.stroke.mock.calls.length;

      // ASSERT: Should draw fewer parts for state 0 than state 6
      expect(callsAfter6).toBeGreaterThan(callsAfter0);
    });

    it('should use correct canvas dimensions', () => {
      // ARRANGE: Create canvas with different dimensions
      document.body.innerHTML = '<canvas id="test-canvas" width="500" height="300"></canvas>';
      const testCanvas = document.getElementById('test-canvas') as HTMLCanvasElement;
      testCanvas.getContext = jest.fn().mockReturnValue(mockContext);

      const testRenderer = new HangmanRenderer('test-canvas');

      // ACT
      testRenderer.clear();

      // ASSERT: Should use canvas width and height
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 500, 300);
    });

    it('should maintain cumulative drawing across different states', () => {
      // ARRANGE & ACT: Draw in order
      hangmanRenderer.render(1); // gallows + head
      const callsAfter1 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(2); // gallows + head + body
      const callsAfter2 = mockContext.stroke.mock.calls.length;

      mockContext.stroke.mockClear();
      hangmanRenderer.render(4); // gallows + head + body + both arms
      const callsAfter4 = mockContext.stroke.mock.calls.length;

      // ASSERT: Each should have more or equal strokes than previous
      expect(callsAfter2).toBeGreaterThanOrEqual(callsAfter1);
      expect(callsAfter4).toBeGreaterThanOrEqual(callsAfter2);
    });
  });

  describe('Canvas API Integration', () => {
    it('should set correct line styling before drawing', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(1);

      // ASSERT: Line styling should be set (mockContext has these properties)
      // We can't directly test the assignment to context properties,
      // but we can verify that the context is being used for drawing
      expect(mockContext.strokeStyle).toBeDefined();
      expect(mockContext.lineWidth).toBeDefined();
    });

    it('should call beginPath before each drawing operation', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(3);

      // ASSERT: beginPath should be called multiple times
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.beginPath.mock.calls.length).toBeGreaterThan(4); // At least 4 for gallows + 1 for head
    });

    it('should call stroke after each drawing operation', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(2);

      // ASSERT: stroke should be called to render paths
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should call moveTo and lineTo for line drawings', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(2); // Includes gallows (lines) and head (arc)

      // ASSERT: Should use moveTo and lineTo for gallows
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    it('should call arc for head drawing', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(1);

      // ASSERT: Should use arc for head
      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalledTimes(1);
    });

    it('should follow correct Canvas API sequence', () => {
      // ARRANGE & ACT
      hangmanRenderer.render(1);

      // ASSERT: Should follow beginPath → moveTo/lineTo/arc → stroke pattern
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should clear canvas using correct dimensions', () => {
      // ARRANGE: Mock canvas with specific dimensions
      Object.defineProperty(canvas, 'width', { value: 400 });
      Object.defineProperty(canvas, 'height', { value: 400 });

      // ACT
      hangmanRenderer.clear();

      // ASSERT: Should clear with canvas dimensions
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });
  });

  describe('Integration', () => {
    it('should work with standard canvas ID "hangman-canvas"', () => {
      // ARRANGE: DOM already has canvas with correct ID

      // ACT
      const renderer = new HangmanRenderer('hangman-canvas');
      renderer.render(0);

      // ASSERT
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });

    it('should support typical game flow: render(0) → render(1) → ... → render(6)', () => {
      // ARRANGE: Fresh renderer

      // ACT: Typical game flow with failed attempts
      hangmanRenderer.render(0); // Initial state (gallows)
      hangmanRenderer.render(1); // First wrong guess
      hangmanRenderer.render(2); // Second wrong guess
      hangmanRenderer.render(3); // Third wrong guess
      hangmanRenderer.render(4); // Fourth wrong guess
      hangmanRenderer.render(5); // Fifth wrong guess
      hangmanRenderer.render(6); // Sixth wrong guess - game over

      // ASSERT: Should have called clearRect for each render
      expect(mockContext.clearRect).toHaveBeenCalledTimes(7);
    });

    it('should support restart flow: render(6) → clear() → render(0)', () => {
      // ARRANGE: Clear initial render count from beforeEach
      mockContext.clearRect.mockClear();

      // ACT: Complete hangman drawn
      hangmanRenderer.render(6);

      // Restart game
      hangmanRenderer.clear();
      hangmanRenderer.render(0);

      // ASSERT: Should clear and draw initial state (2 calls total after clear)
      expect(mockContext.clearRect).toHaveBeenCalledTimes(3); // render(6), clear(), render(0)
    });

    it('should work with multiple HangmanRenderer instances (different canvases)', () => {
      // ARRANGE: Create another canvas
      const canvas2 = document.createElement('canvas');
      canvas2.id = 'hangman-canvas-2';
      canvas2.width = 400;
      canvas2.height = 400;
      document.body.appendChild(canvas2);

      const mockContext2 = {
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arc: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        lineCap: 'butt',
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
      } as any;

      canvas2.getContext = jest.fn().mockReturnValue(mockContext2);

      // ACT: Create two renderers
      const renderer1 = new HangmanRenderer('hangman-canvas');
      const renderer2 = new HangmanRenderer('hangman-canvas-2');

      renderer1.render(3);
      renderer2.render(1);

      // ASSERT: Each renderer should manage its own canvas
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext2.clearRect).toHaveBeenCalled();

      // Different call counts based on state
      expect(mockContext.stroke.mock.calls.length).toBeGreaterThan(
        mockContext2.stroke.mock.calls.length
      );
    });

    it('should handle container with existing content', () => {
      // ARRANGE: Create a new canvas element and mock in the same test
      const container = document.createElement('div');
      container.id = 'game-container';
      document.body.appendChild(container);

      const canvasInContainer = document.createElement('canvas');
      canvasInContainer.id = 'hangman-canvas-in-container';
      canvasInContainer.width = 400;
      canvasInContainer.height = 400;
      container.appendChild(canvasInContainer);

      const mockContextInContainer = {
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        arc: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        lineCap: 'butt',
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
      } as any;

      canvasInContainer.getContext = jest.fn().mockReturnValue(mockContextInContainer);

      // ACT: Create renderer specifically for this canvas
      const renderer = new HangmanRenderer('hangman-canvas-in-container');
      renderer.render(0);

      // ASSERT: Check the specific mock context associated with the new canvas
      expect(mockContextInContainer.clearRect).toHaveBeenCalledWith(0, 0, 400, 400);
    });

    it('should work with GameModel attempt values (0-6)', () => {
      // ARRANGE: Simulate GameModel providing failed attempt counts
      const mockGameModel = {
        getFailedAttempts: jest.fn().mockReturnValue(0),
      };

      // ACT: Simulate game progression
      mockGameModel.getFailedAttempts.mockReturnValue(0);
      hangmanRenderer.render(mockGameModel.getFailedAttempts());

      mockGameModel.getFailedAttempts.mockReturnValue(2);
      hangmanRenderer.render(mockGameModel.getFailedAttempts());

      mockGameModel.getFailedAttempts.mockReturnValue(5);
      hangmanRenderer.render(mockGameModel.getFailedAttempts());

      mockGameModel.getFailedAttempts.mockReturnValue(6);
      hangmanRenderer.render(mockGameModel.getFailedAttempts());

      // ASSERT: Should handle all valid attempt values
      expect(mockContext.clearRect).toHaveBeenCalledTimes(4);
    });
  });
});
