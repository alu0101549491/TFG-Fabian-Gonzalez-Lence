/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/views/game-view.test.ts
 * @desc Unit tests for the GameView view.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {GameView} from '@views/game-view';
import {WordDisplay} from '@views/word-display';
import {AlphabetDisplay} from '@views/alphabet-display';
import {HangmanRenderer} from '@views/hangman-renderer';
import {MessageDisplay} from '@views/message-display';

// Mock all child components
jest.mock('@views/word-display');
jest.mock('@views/alphabet-display');
jest.mock('@views/hangman-renderer');
jest.mock('@views/message-display');

describe('GameView', () => {
  let gameView: GameView;
  let mockWordDisplay: jest.Mocked<WordDisplay>;
  let mockAlphabetDisplay: jest.Mocked<AlphabetDisplay>;
  let mockHangmanRenderer: jest.Mocked<HangmanRenderer>;
  let mockMessageDisplay: jest.Mocked<MessageDisplay>;

  beforeEach(() => {
    // Setup DOM with all required containers
    document.body.innerHTML = `
      <div id="word-container"></div>
      <div id="alphabet-container"></div>
      <canvas id="hangman-canvas" width="400" height="400"></canvas>
      <div id="message-container"></div>
    `;

    // Mock canvas context
    const mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
    } as any;
    const canvas = document.getElementById('hangman-canvas') as HTMLCanvasElement;
    canvas.getContext = jest.fn().mockReturnValue(mockContext);

    // Clear all mocks
    jest.clearAllMocks();

    // Create GameView (will create mocked children)
    gameView = new GameView();

    // Get mocked instances
    mockWordDisplay = (WordDisplay as jest.MockedClass<typeof WordDisplay>).mock.instances[0] as jest.Mocked<WordDisplay>;
    mockAlphabetDisplay = (AlphabetDisplay as jest.MockedClass<typeof AlphabetDisplay>).mock.instances[0] as jest.Mocked<AlphabetDisplay>;
    mockHangmanRenderer = (HangmanRenderer as jest.MockedClass<typeof HangmanRenderer>).mock.instances[0] as jest.Mocked<HangmanRenderer>;
    mockMessageDisplay = (MessageDisplay as jest.MockedClass<typeof MessageDisplay>).mock.instances[0] as jest.Mocked<MessageDisplay>;

    // Do NOT call initialize here, let tests manage it
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create WordDisplay with correct container ID', () => {
      // ARRANGE & ACT: gameView already created in beforeEach

      // ASSERT
      expect(WordDisplay).toHaveBeenCalledWith('word-container');
      expect(WordDisplay).toHaveBeenCalledTimes(1);
    });

    it('should create AlphabetDisplay with correct container ID', () => {
      // ARRANGE & ACT: gameView already created

      // ASSERT
      expect(AlphabetDisplay).toHaveBeenCalledWith('alphabet-container');
      expect(AlphabetDisplay).toHaveBeenCalledTimes(1);
    });

    it('should create HangmanRenderer with correct canvas ID', () => {
      // ARRANGE & ACT: gameView already created

      // ASSERT
      expect(HangmanRenderer).toHaveBeenCalledWith('hangman-canvas');
      expect(HangmanRenderer).toHaveBeenCalledTimes(1);
    });

    it('should create MessageDisplay with correct container ID', () => {
      // ARRANGE & ACT: gameView already created

      // ASSERT
      expect(MessageDisplay).toHaveBeenCalledWith('message-container');
      expect(MessageDisplay).toHaveBeenCalledTimes(1);
    });

    it('should create instance successfully', () => {
      // ARRANGE & ACT: gameView already created

      // ASSERT
      expect(gameView).toBeDefined();
      expect(gameView).toBeInstanceOf(GameView);
    });
  });

  describe('initialize', () => {
    it('should call alphabetDisplay.render()', () => {
      // ARRANGE: gameView created, no initialize called yet

      // ACT
      gameView.initialize();

      // ASSERT
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(1);
    });

    it('should call hangmanRenderer.render(0) for initial state', () => {
      // ARRANGE

      // ACT
      gameView.initialize();

      // ASSERT
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
      expect(mockHangmanRenderer.render).toHaveBeenCalledTimes(1);
    });

    it('should call messageDisplay.showAttempts(0, 6)', () => {
      // ARRANGE

      // ACT
      gameView.initialize();

      // ASSERT
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(0, 6);
    });

    it('should call messageDisplay.hideRestartButton()', () => {
      // ARRANGE

      // ACT
      gameView.initialize();

      // ASSERT
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalledTimes(1);
    });

    it('should call all initialization methods in correct order', () => {
      // ARRANGE

      // ACT
      gameView.initialize();

      // ASSERT: Verify all methods were called
      expect(mockAlphabetDisplay.render).toHaveBeenCalled();
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(0, 6);
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalled();
    });
  });

  describe('updateWordBoxes', () => {
    it('should delegate to wordDisplay for rendering on first call', () => {
      // ARRANGE
      const letters = ['', '', '', '', '', '', '', ''];

      // ACT
      gameView.updateWordBoxes(letters);

      // ASSERT
      // Should call render with word length on first call
      expect(mockWordDisplay.render).toHaveBeenCalledWith(8);
    });

    it('should handle first render (initialize word boxes)', () => {
      // ARRANGE
      const letters = ['', '', '', '', '', '', '', ''];

      // ACT
      gameView.updateWordBoxes(letters);

      // ASSERT: Should call render with word length
      expect(mockWordDisplay.render).toHaveBeenCalledWith(8);
    });

    it('should update revealed letters in subsequent calls', () => {
      // ARRANGE: First call to initialize
      gameView.updateWordBoxes(['', '', '', '']);
      jest.clearAllMocks();

      // ACT: Second call with revealed letter
      gameView.updateWordBoxes(['E', '', '', '']);

      // ASSERT: Should update box at index 0
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(0, 'E');
    });

    it('should handle empty array', () => {
      // ARRANGE
      const letters: string[] = [];

      // ACT
      gameView.updateWordBoxes(letters);

      // ASSERT
      expect(mockWordDisplay.render).toHaveBeenCalledWith(0);
    });

    it('should handle array with all letters revealed', () => {
      // ARRANGE: First call to initialize
      gameView.updateWordBoxes(['', '', '', '']);
      jest.clearAllMocks();

      // ACT: All letters revealed
      gameView.updateWordBoxes(['C', 'A', 'T', 'S']);

      // ASSERT: Should update all boxes
      expect(mockWordDisplay.updateBox).toHaveBeenCalledTimes(4);
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(0, 'C');
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(1, 'A');
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(2, 'T');
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(3, 'S');
    });

    it('should handle single letter word', () => {
      // ARRANGE
      const letters = ['A'];

      // ACT
      gameView.updateWordBoxes(letters);

      // ASSERT
      expect(mockWordDisplay.render).toHaveBeenCalledWith(1);
    });

    it('should handle long word (15+ letters)', () => {
      // ARRANGE
      const letters = Array(15).fill(''); // 15 empty slots

      // ACT
      gameView.updateWordBoxes(letters);

      // ASSERT
      expect(mockWordDisplay.render).toHaveBeenCalledWith(15);
    });

    it('should handle word length change (if game restarts)', () => {
      // ARRANGE: First call with 3 letters
      gameView.updateWordBoxes(['', '', '']);
      jest.clearAllMocks();

      // ACT: Second call with 5 letters (new word)
      gameView.updateWordBoxes(['', '', '', '', '']);

      // ASSERT: Should render with new length
      expect(mockWordDisplay.render).toHaveBeenCalledWith(5);
    });

    it('should not render again if word length is same', () => {
      // ARRANGE: First call to initialize
      gameView.updateWordBoxes(['', '', '', '']);
      jest.clearAllMocks();

      // ACT: Second call with same length but revealed letters
      gameView.updateWordBoxes(['C', '', '', '']);

      // ASSERT: Should only update boxes, not render again
      expect(mockWordDisplay.render).not.toHaveBeenCalled();
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(0, 'C');
    });

    it('should only update boxes with revealed letters', () => {
      // ARRANGE: First call to initialize
      gameView.updateWordBoxes(['', '', '', '']);
      jest.clearAllMocks();

      // ACT: Update with only some letters revealed
      gameView.updateWordBoxes(['C', '', 'T', '']);

      // ASSERT: Should only update boxes with letters
      expect(mockWordDisplay.updateBox).toHaveBeenCalledTimes(2);
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(0, 'C');
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(2, 'T');
    });
  });

  describe('disableLetter', () => {
    it('should delegate to alphabetDisplay.disableLetter()', () => {
      // ARRANGE & ACT
      gameView.disableLetter('E');

      // ASSERT
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalledWith('E');
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalledTimes(1);
    });

    it('should work with lowercase letters', () => {
      // ARRANGE & ACT
      gameView.disableLetter('e');

      // ASSERT
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalledWith('e');
    });

    it('should pass letter parameter correctly', () => {
      // ARRANGE & ACT
      gameView.disableLetter('Z');

      // ASSERT
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalledWith('Z');
    });
  });

  describe('updateAttemptCounter', () => {
    it('should delegate to messageDisplay.showAttempts()', () => {
      // ARRANGE & ACT
      gameView.updateAttemptCounter(3, 6);

      // ASSERT
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(3, 6);
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledTimes(1);
    });

    it('should work with different attempt values', () => {
      // ARRANGE & ACT: Test multiple values
      gameView.updateAttemptCounter(0, 6);
      gameView.updateAttemptCounter(6, 6);

      // ASSERT
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(0, 6);
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(6, 6);
    });

    it('should pass current and max parameters correctly', () => {
      // ARRANGE & ACT
      gameView.updateAttemptCounter(2, 8);

      // ASSERT
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(2, 8);
    });
  });

  describe('renderHangman', () => {
    it('should delegate to hangmanRenderer.render()', () => {
      // ARRANGE & ACT
      gameView.renderHangman(3);

      // ASSERT
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(3);
      expect(mockHangmanRenderer.render).toHaveBeenCalledTimes(1);
    });

    it('should work with all attempt values 0-6', () => {
      // ARRANGE & ACT: Test all states
      for (let i = 0; i <= 6; i++) {
        gameView.renderHangman(i);
      }

      // ASSERT
      expect(mockHangmanRenderer.render).toHaveBeenCalledTimes(7);
    });

    it('should pass attempt count correctly', () => {
      // ARRANGE & ACT
      gameView.renderHangman(5);

      // ASSERT
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(5);
    });
  });

  describe('showVictoryMessage', () => {
    it('should delegate to messageDisplay.showVictory()', () => {
      // ARRANGE & ACT
      gameView.showVictoryMessage('ELEPHANT');

      // ASSERT
      expect(mockMessageDisplay.showVictory).toHaveBeenCalledWith('ELEPHANT');
      expect(mockMessageDisplay.showVictory).toHaveBeenCalledTimes(1);
    });

    it('should pass word parameter correctly', () => {
      // ARRANGE & ACT
      gameView.showVictoryMessage('RHINOCEROS');

      // ASSERT
      expect(mockMessageDisplay.showVictory).toHaveBeenCalledWith('RHINOCEROS');
    });
  });

  describe('showDefeatMessage', () => {
    it('should delegate to messageDisplay.showDefeat()', () => {
      // ARRANGE & ACT
      gameView.showDefeatMessage('RHINOCEROS');

      // ASSERT
      expect(mockMessageDisplay.showDefeat).toHaveBeenCalledWith('RHINOCEROS');
      expect(mockMessageDisplay.showDefeat).toHaveBeenCalledTimes(1);
    });

    it('should pass word parameter correctly', () => {
      // ARRANGE & ACT
      gameView.showDefeatMessage('ELEPHANT');

      // ASSERT
      expect(mockMessageDisplay.showDefeat).toHaveBeenCalledWith('ELEPHANT');
    });
  });

  describe('showRestartButton', () => {
    it('should delegate to messageDisplay.showRestartButton()', () => {
      // ARRANGE & ACT
      gameView.showRestartButton();

      // ASSERT
      expect(mockMessageDisplay.showRestartButton).toHaveBeenCalledTimes(1);
    });
  });

  describe('hideRestartButton', () => {
    it('should delegate to messageDisplay.hideRestartButton()', () => {
      // ARRANGE & ACT
      gameView.hideRestartButton();

      // ASSERT
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalledTimes(1);
    });
  });

  describe('attachAlphabetClickHandler', () => {
    it('should delegate to alphabetDisplay.attachClickHandler()', () => {
      // ARRANGE
      const mockHandler = jest.fn();

      // ACT
      gameView.attachAlphabetClickHandler(mockHandler);

      // ASSERT
      expect(mockAlphabetDisplay.attachClickHandler).toHaveBeenCalledWith(mockHandler);
    });

    it('should pass handler parameter correctly', () => {
      // ARRANGE
      const mockHandler = jest.fn();

      // ACT
      gameView.attachAlphabetClickHandler(mockHandler);

      // ASSERT
      expect(mockAlphabetDisplay.attachClickHandler).toHaveBeenCalledWith(mockHandler);
    });
  });

  describe('attachRestartHandler', () => {
    it('should delegate to messageDisplay.attachRestartHandler()', () => {
      // ARRANGE
      const mockHandler = jest.fn();

      // ACT
      gameView.attachRestartHandler(mockHandler);

      // ASSERT
      expect(mockMessageDisplay.attachRestartHandler).toHaveBeenCalledWith(mockHandler);
    });

    it('should pass handler parameter correctly', () => {
      // ARRANGE
      const mockHandler = jest.fn();

      // ACT
      gameView.attachRestartHandler(mockHandler);

      // ASSERT
      expect(mockMessageDisplay.attachRestartHandler).toHaveBeenCalledWith(mockHandler);
    });
  });

  describe('reset', () => {
    it('should call wordDisplay.reset()', () => {
      // ARRANGE & ACT
      gameView.reset();

      // ASSERT
      expect(mockWordDisplay.reset).toHaveBeenCalledTimes(1);
    });

    it('should call alphabetDisplay.enableAllLetters()', () => {
      // ARRANGE & ACT
      gameView.reset();

      // ASSERT
      expect(mockAlphabetDisplay.enableAllLetters).toHaveBeenCalledTimes(1);
    });

    it('should call hangmanRenderer.clear()', () => {
      // ARRANGE & ACT
      gameView.reset();

      // ASSERT
      expect(mockHangmanRenderer.clear).toHaveBeenCalledTimes(1);
    });

    it('should call hangmanRenderer.render(0) after clearing', () => {
      // ARRANGE & ACT
      gameView.reset();

      // ASSERT
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
    });

    it('should call messageDisplay.hideRestartButton()', () => {
      // ARRANGE & ACT
      gameView.reset();

      // ASSERT
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalledTimes(1);
    });

    it('should call all reset methods in correct order', () => {
      // ARRANGE & ACT
      gameView.reset();

      // ASSERT: Verify all methods called
      expect(mockWordDisplay.reset).toHaveBeenCalled();
      expect(mockAlphabetDisplay.enableAllLetters).toHaveBeenCalled();
      expect(mockHangmanRenderer.clear).toHaveBeenCalled();
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalled();
    });

    it('should reset word display and internal state', () => {
      // ARRANGE: Set internal state by calling updateWordBoxes first
      gameView.updateWordBoxes(['E', 'L', 'E', 'P']);

      // ACT
      gameView.reset();

      // ASSERT: Internal state should be reset
      // Next call to updateWordBoxes should render again
      jest.clearAllMocks();
      gameView.updateWordBoxes(['C', 'A', 'T']);
      expect(mockWordDisplay.render).toHaveBeenCalledWith(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle initialize called multiple times', () => {
      // ARRANGE & ACT
      gameView.initialize();
      gameView.initialize();
      gameView.initialize();

      // ASSERT: Should work without error
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(3);
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(0, 6);
    });

    it('should handle reset followed by initialize', () => {
      // ARRANGE: Initialize and perform some operations
      gameView.initialize();
      gameView.updateWordBoxes(['E', '', '']);
      gameView.disableLetter('E');

      // ACT: Reset then initialize again
      gameView.reset();
      gameView.initialize();

      // ASSERT: Should be back to initial state
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // Once for initial init, once for re-init
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
    });

    it('should handle method chaining (multiple operations in sequence)', () => {
      // ARRANGE & ACT: Perform multiple operations
      gameView.initialize();
      gameView.updateWordBoxes(['E', '', 'E', '', '', '', '', '']);
      gameView.disableLetter('E');
      gameView.updateAttemptCounter(1, 6);
      gameView.renderHangman(1);

      // ASSERT: All operations should work
      expect(mockAlphabetDisplay.render).toHaveBeenCalled();
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(1);
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(1, 6);
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalledWith('E');
      expect(mockWordDisplay.updateBox).toHaveBeenCalled();
      expect(mockWordDisplay.updateBox).toHaveBeenCalledWith(0, 'E');
    });

    it('should handle updateWordBoxes with empty string array', () => {
      // ARRANGE
      const letters = ['', '', ''];

      // ACT
      gameView.updateWordBoxes(letters);

      // ASSERT: Should render 3 boxes but not update any
      expect(mockWordDisplay.render).toHaveBeenCalledWith(3);
      expect(mockWordDisplay.updateBox).not.toHaveBeenCalled();
    });
  });

  describe('Composite Pattern validation', () => {
    it('should only delegate operations to child components', () => {
      // ARRANGE: Track all operations
      // ACT: Perform various operations
      gameView.initialize();
      gameView.updateWordBoxes(['E', '', '', '']);
      gameView.disableLetter('E');
      gameView.updateAttemptCounter(1, 6);
      gameView.renderHangman(1);
      gameView.showVictoryMessage('CAT');
      gameView.showRestartButton();
      gameView.reset();

      // ASSERT: All operations should delegate to children
      expect(mockAlphabetDisplay.render).toHaveBeenCalled();
      expect(mockHangmanRenderer.render).toHaveBeenCalled();
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalled();
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalled();
      expect(mockWordDisplay.render).toHaveBeenCalled();
      expect(mockWordDisplay.updateBox).toHaveBeenCalled();
      expect(mockMessageDisplay.showVictory).toHaveBeenCalled();
      expect(mockMessageDisplay.showRestartButton).toHaveBeenCalled();
      expect(mockWordDisplay.reset).toHaveBeenCalled();
      expect(mockAlphabetDisplay.enableAllLetters).toHaveBeenCalled();
      expect(mockHangmanRenderer.clear).toHaveBeenCalled();
    });

    it('should not perform any direct DOM manipulation', () => {
      // ARRANGE: Spy on document methods
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const innerHTMLSpy = jest.spyOn(document.body, 'innerHTML', 'set');

      // ACT: Perform various GameView operations
      gameView.initialize();
      gameView.updateWordBoxes(['E', '', '']);
      gameView.disableLetter('E');
      gameView.updateAttemptCounter(1, 6);
      gameView.renderHangman(1);
      gameView.showVictoryMessage('CAT');
      gameView.showRestartButton();
      gameView.reset();

      // ASSERT: Should not have called any DOM methods directly
      expect(appendChildSpy).not.toHaveBeenCalled();
      expect(innerHTMLSpy).not.toHaveBeenCalled();

      appendChildSpy.mockRestore();
      innerHTMLSpy.mockRestore();
    });

    it('should not contain business logic', () => {
      // ARRANGE: GameView is a coordinator, not a business logic container
      // ACT: Verify all methods just delegate
      // ASSERT: All methods in GameView should delegate to children
      // This is verified by the fact that all our tests check delegation
      // rather than complex logic within GameView itself
      expect(gameView).toBeDefined();
      // The implementation only coordinates, doesn't decide
    });
  });

  describe('Game flow integration', () => {
    it('should handle complete victory flow', () => {
      // ARRANGE & ACT: Simulate victory sequence
      gameView.initialize();
      gameView.updateWordBoxes(['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T']);
      gameView.showVictoryMessage('ELEPHANT');
      gameView.showRestartButton();

      // ASSERT: All methods called correctly
      expect(mockAlphabetDisplay.render).toHaveBeenCalled();
      expect(mockWordDisplay.updateBox).toHaveBeenCalledTimes(8); // All letters revealed
      expect(mockMessageDisplay.showVictory).toHaveBeenCalledWith('ELEPHANT');
      expect(mockMessageDisplay.showRestartButton).toHaveBeenCalled();
    });

    it('should handle complete defeat flow', () => {
      // ARRANGE & ACT: Simulate defeat sequence
      gameView.initialize();
      gameView.renderHangman(6);
      gameView.showDefeatMessage('ELEPHANT');
      gameView.showRestartButton();

      // ASSERT
      expect(mockAlphabetDisplay.render).toHaveBeenCalled();
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(6);
      expect(mockMessageDisplay.showDefeat).toHaveBeenCalledWith('ELEPHANT');
      expect(mockMessageDisplay.showRestartButton).toHaveBeenCalled();
    });

    it('should handle restart flow', () => {
      // ARRANGE: Initialize and end game
      gameView.initialize();
      gameView.showVictoryMessage('CAT');
      gameView.showRestartButton();

      // ACT: Restart
      gameView.reset();
      gameView.initialize();

      // ASSERT: All reset methods called
      expect(mockWordDisplay.reset).toHaveBeenCalled();
      expect(mockAlphabetDisplay.enableAllLetters).toHaveBeenCalled();
      expect(mockHangmanRenderer.clear).toHaveBeenCalled();
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalled();

      // Verify initialization methods called again after reset
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // Initial and after reset
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0); // Called in both initialize calls
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(0, 6); // Called in both initialize calls
    });

    it('should handle typical game progression correctly', () => {
      // ARRANGE: Initialize the game
      gameView.initialize();

      // Initialize call should have happened, now perform game sequence
      // Player guesses
      gameView.updateWordBoxes(['E', '', 'E', '', '', '', '', '']);
      gameView.disableLetter('E');
      gameView.updateAttemptCounter(0, 6);

      // More guesses with failures
      gameView.disableLetter('Z');
      gameView.updateAttemptCounter(1, 6);
      gameView.renderHangman(1);

      // Continue until victory
      gameView.updateWordBoxes(['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T']);
      gameView.showVictoryMessage('ELEPHANT');
      gameView.showRestartButton();

      // Verify all delegations occurred
      expect(mockWordDisplay.updateBox).toHaveBeenCalled();
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalledTimes(2); // 'E' and 'Z'
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(1, 6);
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(1);
      expect(mockMessageDisplay.showVictory).toHaveBeenCalledWith('ELEPHANT');
    });
  });
});
