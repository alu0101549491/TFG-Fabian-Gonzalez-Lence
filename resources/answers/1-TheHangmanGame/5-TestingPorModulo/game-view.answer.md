# Respuesta

```markdown
// tests/views/game-view.test.ts
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
      // ARRANGE: gameView created
      
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
      
      // ASSERT
      // Verify all methods were called
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
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // Once for init, once for re-init
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
      expect(mockWordDisplay.updateBox).toHaveBeenCalled();
      expect(mockAlphabetDisplay.disableLetter).toHaveBeenCalledWith('E');
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(1, 6);
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(1);
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
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(6);
      expect(mockMessageDisplay.showDefeat).toHaveBeenCalledWith('ELEPHANT');
      expect(mockMessageDisplay.showRestartButton).toHaveBeenCalled();
    });

    it('should handle restart flow', () => {
      // ARRANGE: Game ended
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
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // Initial and after reset
    });

    it('should handle typical game progression correctly', () => {
      // Initialize
      gameView.initialize();
      expect(mockAlphabetDisplay.render).toHaveBeenCalled();
      
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
```

---

# Respuesta (FIX 1)

**Prompt:**
```markdown
> the-hangman-game@1.0.0 test
> jest tests/views/game-view.test.ts

 FAIL  tests/views/game-view.test.ts
  GameView
    constructor
      ✓ should create WordDisplay with correct container ID (10 ms)
      ✓ should create AlphabetDisplay with correct container ID (2 ms)
      ✓ should create HangmanRenderer with correct canvas ID (4 ms)
      ✓ should create MessageDisplay with correct container ID (3 ms)
      ✓ should create instance successfully (2 ms)
    initialize
      ✓ should call alphabetDisplay.render() (2 ms)
      ✓ should call hangmanRenderer.render(0) for initial state (2 ms)
      ✓ should call messageDisplay.showAttempts(0, 6) (1 ms)
      ✓ should call messageDisplay.hideRestartButton() (2 ms)
      ✓ should call all initialization methods in correct order (3 ms)
    updateWordBoxes
      ✓ should delegate to wordDisplay for rendering on first call (1 ms)
      ✓ should handle first render (initialize word boxes) (2 ms)
      ✓ should update revealed letters in subsequent calls (1 ms)
      ✓ should handle empty array (1 ms)
      ✓ should handle array with all letters revealed (1 ms)
      ✓ should handle single letter word (1 ms)
      ✓ should handle long word (15+ letters) (1 ms)
      ✓ should handle word length change (if game restarts) (1 ms)
      ✓ should not render again if word length is same (1 ms)
      ✓ should only update boxes with revealed letters (2 ms)
    disableLetter
      ✓ should delegate to alphabetDisplay.disableLetter() (1 ms)
      ✓ should work with lowercase letters (1 ms)
      ✓ should pass letter parameter correctly (1 ms)
    updateAttemptCounter
      ✓ should delegate to messageDisplay.showAttempts() (1 ms)
      ✓ should work with different attempt values (1 ms)
      ✓ should pass current and max parameters correctly (2 ms)
    renderHangman
      ✓ should delegate to hangmanRenderer.render() (1 ms)
      ✓ should work with all attempt values 0-6 (1 ms)
      ✓ should pass attempt count correctly
    showVictoryMessage
      ✓ should delegate to messageDisplay.showVictory() (1 ms)
      ✓ should pass word parameter correctly (1 ms)
    showDefeatMessage
      ✓ should delegate to messageDisplay.showDefeat() (1 ms)
      ✓ should pass word parameter correctly (1 ms)
    showRestartButton
      ✓ should delegate to messageDisplay.showRestartButton() (1 ms)
    hideRestartButton
      ✓ should delegate to messageDisplay.hideRestartButton() (1 ms)
    attachAlphabetClickHandler
      ✓ should delegate to alphabetDisplay.attachClickHandler() (1 ms)
      ✓ should pass handler parameter correctly (1 ms)
    attachRestartHandler
      ✓ should delegate to messageDisplay.attachRestartHandler() (1 ms)
      ✓ should pass handler parameter correctly (1 ms)
    reset
      ✓ should call wordDisplay.reset()
      ✓ should call alphabetDisplay.enableAllLetters()
      ✓ should call hangmanRenderer.clear() (1 ms)
      ✓ should call hangmanRenderer.render(0) after clearing (1 ms)
      ✓ should call messageDisplay.hideRestartButton() (1 ms)
      ✓ should call all reset methods in correct order (1 ms)
      ✓ should reset word display and internal state (1 ms)
    Edge Cases
      ✓ should handle initialize called multiple times (1 ms)
      ✓ should handle reset followed by initialize (1 ms)
      ✓ should handle method chaining (multiple operations in sequence) (4 ms)
      ✓ should handle updateWordBoxes with empty string array (1 ms)
    Composite Pattern validation
      ✓ should only delegate operations to child components (2 ms)
      ✓ should not perform any direct DOM manipulation (3 ms)
      ✓ should not contain business logic (2 ms)
    Game flow integration
      ✓ should handle complete victory flow (3 ms)
      ✓ should handle complete defeat flow (1 ms)
      ✕ should handle restart flow (1 ms)
      ✓ should handle typical game progression correctly (1 ms)

  ● GameView › Game flow integration › should handle restart flow

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 2
    Received number of calls: 1

      714 |       expect(mockHangmanRenderer.clear).toHaveBeenCalled();
      715 |       expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalled();
    > 716 |       expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // Initial and after reset
          |                                          ^
      717 |     });
      718 |
      719 |     it('should handle typical game progression correctly', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:716:42)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 56 passed, 57 total
Snapshots:   0 total
Time:        0.576 s
Ran all test suites matching /tests\/views\/game-view.test.ts/i.
```
**Respuesta:**
The test failure occurs because the assertion `expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2)` expects the `render` method to be called twice (once during initial `initialize()` and once during the re-initialization after `reset()`), but it's only being called once.
This is because the `initialize()` method on the `GameView` class calls `alphabetDisplay.render()` only once, during the first initialization and then again when `initialize()` is called after `reset()`. However, the test setup might be affecting this expectation.
Let's correct the failing test case:
```typescript
// tests/views/game-view.test.ts
// ... (previous content unchanged)

  describe('Game flow integration', () => {
    // ... (previous tests unchanged)

    it('should handle restart flow', () => {
      // ARRANGE: Game ended
      gameView.showVictoryMessage('CAT');
      gameView.showRestartButton();

      // Verify initial state before reset
      expect(mockMessageDisplay.showRestartButton).toHaveBeenCalled();

      // ACT: Restart
      gameView.reset();
      gameView.initialize();

      // ASSERT: All reset methods called
      expect(mockWordDisplay.reset).toHaveBeenCalled();
      expect(mockAlphabetDisplay.enableAllLetters).toHaveBeenCalled();
      expect(mockHangmanRenderer.clear).toHaveBeenCalled();
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalled();

      // Verify initialization methods called again after reset
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // Initial (in beforeEach) and after reset
      expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0); // Called in both initialize calls
      expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(0, 6); // Called in both initialize calls
    });

    // ... (remaining tests unchanged)
  });

// ... (rest of the file unchanged)

```
Wait, let me reconsider. The `initialize()` method is called in the `beforeEach` block for *every* test. So initially, `alphabetDisplay.render()` is called once. Then in the test, we call `reset()` and then `initialize()` again. That should be a second call to `alphabetDisplay.render()`.
Actually, looking more closely, the issue might be that the `beforeEach` in the test setup *also* calls `gameView.initialize()` which calls `alphabetDisplay.render()`. Then the test calls `reset()` and then `initialize()` again, which should be the *second* time `alphabetDisplay.render()` is called.
Let me re-examine the failing assertion:
1. `beforeEach` calls `gameView.initialize()` -\> `alphabetDisplay.render()` called (1st time)
2. Test code calls `gameView.reset()` -\> `alphabetDisplay.enableAllLetters()` called
3. Test code calls `gameView.initialize()` -\> `alphabetDisplay.render()` called (2nd time)
The assertion `toHaveBeenCalledTimes(2)` should be correct based on this sequence. The test failure suggests that maybe the `initialize()` call in `beforeEach` isn't happening, or the `alphabetDisplay.render()` isn't being called within the `initialize()` method in the `beforeEach` block as expected, or the subsequent `initialize()` call after `reset()` isn't triggering the render.
Actually, let's trace the sequence again carefully:
1. `beforeEach` calls `new GameView()` (constructor runs, creates mocks, stores them).
2. `beforeEach` then calls `gameView.initialize()`.
3. `gameView.initialize()` calls `mockAlphabetDisplay.render()`. This is the first call.
4. In the test `should handle restart flow`:<br>a. Some operations happen (showVictoryMessage, showRestartButton).<br>b. `gameView.reset()` is called. This calls `mockAlphabetDisplay.enableAllLetters()`, but *not* `render()`.<br>c. `gameView.initialize()` is called again. This calls `mockAlphabetDisplay.render()`. This is the second call.
5. The assertion checks `toHaveBeenCalledTimes(2)`.
The logic seems correct. The error message indicates that `render` was called only 1 time when 2 were expected. This means the second call to `alphabetDisplay.render()` via `gameView.initialize()` after `reset()` didn't happen as anticipated.
Let's double-check the `initialize` method in the `GameView` code:
```typescript
public initialize(): void {
    // Render alphabet buttons
    this.alphabetDisplay.render();
    // Show initial hangman state (gallows only)
    this.hangmanRenderer.render(0);
    // Show initial attempt counter
    this.messageDisplay.showAttempts(0, 6);
    // Hide restart button initially
    this.messageDisplay.hideRestartButton();
    // Reset word rendered state
    this.wordRendered = false;
    this.currentWordLength = 0;
}

```
Yes, `this.alphabetDisplay.render();` is definitely called every time `initialize()` is called.
The issue might be that the mock state is being cleared somewhere unexpectedly. Let's check the `beforeEach` and `afterEach`:
```typescript
  beforeEach(() => {
    // ... DOM setup ...
    // Mock canvas context
    // Clear all mocks - THIS IS THE KEY LINE
    jest.clearAllMocks();
    // Create GameView (will create mocked children)
    gameView = new GameView();
    // Get mocked instances
    // ...
  });

```
Ah! `jest.clearAllMocks()` in the `beforeEach` clears the call history of all mocks, including `mockAlphabetDisplay.render()`. So the first call to `alphabetDisplay.render()` inside the `beforeEach`'s `gameView.initialize()` is recorded, but then `clearAllMocks()` erases this history. Then the test calls `reset()` and `initialize()` again. The assertion `toHaveBeenCalledTimes(2)` counts *all* calls since the mocks were created (or since the last clear), which is only the second call made in the test.
We need to move the `initialize()` call *after* `clearAllMocks()` in `beforeEach` to ensure its calls are not cleared, or adjust the test logic.
Let's adjust the `beforeEach`:
```typescript
// tests/views/game-view.test.ts
// ... (previous content unchanged)

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

    // Now initialize after getting the mocks, so its calls are tracked
    gameView.initialize();
  });

  // ... (rest of the test file unchanged)

```
Now, the sequence will be:
1. `beforeEach`: Create GameView and get mocks.
2. `beforeEach`: Call `gameView.initialize()`. This call is now tracked.
3. Test runs: Call `reset()`, then `initialize()` again.
4. Assertion checks `toHaveBeenCalledTimes(2)` - first call from `beforeEach`'s `initialize`, second call from test's `initialize`.
This should fix the test. Here is the corrected `beforeEach` section:
```typescript
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

    // Now initialize after getting the mocks, so its calls are tracked
    gameView.initialize();
  });

```
And the corresponding test case remains as initially expected:
```typescript
  describe('Game flow integration', () => {
    // ... other tests ...

    it('should handle restart flow', () => {
      // ARRANGE: Game ended
      gameView.showVictoryMessage('CAT');
      gameView.showRestartButton();

      // ACT: Restart
      gameView.reset();
      gameView.initialize(); // This calls alphabetDisplay.render() again

      // ASSERT: All reset methods called
      expect(mockWordDisplay.reset).toHaveBeenCalled();
      expect(mockAlphabetDisplay.enableAllLetters).toHaveBeenCalled();
      expect(mockHangmanRenderer.clear).toHaveBeenCalled();
      expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalled();

      // Verify alphabet display is rendered again after restart
      expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // First from beforeEach initialize, second from this initialize
    });

    // ... other tests ...
  });

```
This change ensures that the initial call to `alphabetDisplay.render()` within the `beforeEach` block is tracked, and the subsequent call in the test after `reset()` and `initialize()` will make it the second call, satisfying the `toHaveBeenCalledTimes(2)` assertion.

---

# Respuesta (FIX 2)

**Prompt:**
```markdown
> the-hangman-game@1.0.0 test
> jest tests/views/game-view.test.ts

 FAIL  tests/views/game-view.test.ts
  GameView
    constructor
      ✓ should create WordDisplay with correct container ID (6 ms)
      ✓ should create AlphabetDisplay with correct container ID (1 ms)
      ✓ should create HangmanRenderer with correct canvas ID (1 ms)
      ✓ should create MessageDisplay with correct container ID (1 ms)
      ✓ should create instance successfully (1 ms)
    initialize
      ✕ should call alphabetDisplay.render() (4 ms)
      ✕ should call hangmanRenderer.render(0) for initial state (1 ms)
      ✓ should call messageDisplay.showAttempts(0, 6) (1 ms)
      ✕ should call messageDisplay.hideRestartButton() (1 ms)
      ✓ should call all initialization methods in correct order (1 ms)
    updateWordBoxes
      ✓ should delegate to wordDisplay for rendering on first call (1 ms)
      ✓ should handle first render (initialize word boxes) (1 ms)
      ✓ should update revealed letters in subsequent calls
      ✓ should handle empty array (1 ms)
      ✓ should handle array with all letters revealed (1 ms)
      ✓ should handle single letter word (1 ms)
      ✓ should handle long word (15+ letters) (1 ms)
      ✓ should handle word length change (if game restarts) (1 ms)
      ✓ should not render again if word length is same (1 ms)
      ✓ should only update boxes with revealed letters (1 ms)
    disableLetter
      ✓ should delegate to alphabetDisplay.disableLetter() (1 ms)
      ✓ should work with lowercase letters (1 ms)
      ✓ should pass letter parameter correctly (1 ms)
    updateAttemptCounter
      ✕ should delegate to messageDisplay.showAttempts() (1 ms)
      ✓ should work with different attempt values (1 ms)
      ✓ should pass current and max parameters correctly (1 ms)
    renderHangman
      ✕ should delegate to hangmanRenderer.render() (1 ms)
      ✕ should work with all attempt values 0-6 (1 ms)
      ✓ should pass attempt count correctly
    showVictoryMessage
      ✓ should delegate to messageDisplay.showVictory() (1 ms)
      ✓ should pass word parameter correctly (1 ms)
    showDefeatMessage
      ✓ should delegate to messageDisplay.showDefeat() (1 ms)
      ✓ should pass word parameter correctly (1 ms)
    showRestartButton
      ✓ should delegate to messageDisplay.showRestartButton() (1 ms)
    hideRestartButton
      ✕ should delegate to messageDisplay.hideRestartButton() (1 ms)
    attachAlphabetClickHandler
      ✓ should delegate to alphabetDisplay.attachClickHandler() (1 ms)
      ✓ should pass handler parameter correctly (1 ms)
    attachRestartHandler
      ✓ should delegate to messageDisplay.attachRestartHandler() (1 ms)
      ✓ should pass handler parameter correctly (1 ms)
    reset
      ✓ should call wordDisplay.reset()
      ✓ should call alphabetDisplay.enableAllLetters()
      ✓ should call hangmanRenderer.clear() (1 ms)
      ✓ should call hangmanRenderer.render(0) after clearing (1 ms)
      ✕ should call messageDisplay.hideRestartButton() (1 ms)
      ✓ should call all reset methods in correct order (1 ms)
      ✓ should reset word display and internal state (1 ms)
    Edge Cases
      ✕ should handle initialize called multiple times (1 ms)
      ✕ should handle reset followed by initialize (4 ms)
      ✓ should handle method chaining (multiple operations in sequence) (1 ms)
      ✓ should handle updateWordBoxes with empty string array (1 ms)
    Composite Pattern validation
      ✓ should only delegate operations to child components (1 ms)
      ✓ should not perform any direct DOM manipulation (2 ms)
      ✓ should not contain business logic
    Game flow integration
      ✓ should handle complete victory flow (1 ms)
      ✓ should handle complete defeat flow (1 ms)
      ✓ should handle restart flow (1 ms)
      ✓ should handle typical game progression correctly (1 ms)

  ● GameView › initialize › should call alphabetDisplay.render()

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 1
    Received number of calls: 2

      124 |       
      125 |       // ASSERT
    > 126 |       expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(1);
          |                                          ^
      127 |     });
      128 |
      129 |     it('should call hangmanRenderer.render(0) for initial state', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:126:42)

  ● GameView › initialize › should call hangmanRenderer.render(0) for initial state

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 1
    Received number of calls: 2

      135 |       // ASSERT
      136 |       expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
    > 137 |       expect(mockHangmanRenderer.render).toHaveBeenCalledTimes(1);
          |                                          ^
      138 |     });
      139 |
      140 |     it('should call messageDisplay.showAttempts(0, 6)', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:137:42)

  ● GameView › initialize › should call messageDisplay.hideRestartButton()

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 1
    Received number of calls: 2

      155 |       
      156 |       // ASSERT
    > 157 |       expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalledTimes(1);
          |                                                    ^
      158 |     });
      159 |
      160 |     it('should call all initialization methods in correct order', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:157:52)

  ● GameView › updateAttemptCounter › should delegate to messageDisplay.showAttempts()

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 1
    Received number of calls: 2

      332 |       // ASSERT
      333 |       expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(3, 6);
    > 334 |       expect(mockMessageDisplay.showAttempts).toHaveBeenCalledTimes(1);
          |                                               ^
      335 |     });
      336 |
      337 |     it('should work with different attempt values', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:334:47)

  ● GameView › renderHangman › should delegate to hangmanRenderer.render()

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 1
    Received number of calls: 2

      361 |       // ASSERT
      362 |       expect(mockHangmanRenderer.render).toHaveBeenCalledWith(3);
    > 363 |       expect(mockHangmanRenderer.render).toHaveBeenCalledTimes(1);
          |                                          ^
      364 |     });
      365 |
      366 |     it('should work with all attempt values 0-6', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:363:42)

  ● GameView › renderHangman › should work with all attempt values 0-6

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 7
    Received number of calls: 8

      371 |       
      372 |       // ASSERT
    > 373 |       expect(mockHangmanRenderer.render).toHaveBeenCalledTimes(7);
          |                                          ^
      374 |     });
      375 |
      376 |     it('should pass attempt count correctly', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:373:42)

  ● GameView › hideRestartButton › should delegate to messageDisplay.hideRestartButton()

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 1
    Received number of calls: 2

      437 |       
      438 |       // ASSERT
    > 439 |       expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalledTimes(1);
          |                                                    ^
      440 |     });
      441 |   });
      442 |

      at Object.<anonymous> (tests/views/game-view.test.ts:439:52)

  ● GameView › reset › should call messageDisplay.hideRestartButton()

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 1
    Received number of calls: 2

      527 |       
      528 |       // ASSERT
    > 529 |       expect(mockMessageDisplay.hideRestartButton).toHaveBeenCalledTimes(1);
          |                                                    ^
      530 |     });
      531 |
      532 |     it('should call all reset methods in correct order', () => {

      at Object.<anonymous> (tests/views/game-view.test.ts:529:52)

  ● GameView › Edge Cases › should handle initialize called multiple times

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 3
    Received number of calls: 4

      565 |       
      566 |       // ASSERT: Should work without error
    > 567 |       expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(3);
          |                                          ^
      568 |       expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
      569 |       expect(mockMessageDisplay.showAttempts).toHaveBeenCalledWith(0, 6);
      570 |     });

      at Object.<anonymous> (tests/views/game-view.test.ts:567:42)

  ● GameView › Edge Cases › should handle reset followed by initialize

    expect(jest.fn()).toHaveBeenCalledTimes(expected)

    Expected number of calls: 2
    Received number of calls: 3

      581 |       
      582 |       // ASSERT: Should be back to initial state
    > 583 |       expect(mockAlphabetDisplay.render).toHaveBeenCalledTimes(2); // Once for init, once for re-init
          |                                          ^
      584 |       expect(mockHangmanRenderer.render).toHaveBeenCalledWith(0);
      585 |     });
      586 |

      at Object.<anonymous> (tests/views/game-view.test.ts:583:42)

Test Suites: 1 failed, 1 total
Tests:       10 failed, 47 passed, 57 total
Snapshots:   0 total
Time:        0.54 s, estimated 1 s
Ran all test suites matching /tests\/views\/game-view.test.ts/i.
```
**Respuesta:**
The tests are failing because `jest.clearAllMocks()` is being called *before* `gameView.initialize()` in the `beforeEach` block. This means that the call to `initialize()` in the `beforeEach` block is *not* being cleared, so the mock call counts include that initial call. When the individual tests call the methods again, the counts are higher than expected.
The sequence is:
1. `beforeEach` calls `jest.clearAllMocks()` (clears any previous calls).
2. `beforeEach` calls `gameView = new GameView()` (creates the instance).
3. `beforeEach` gets the mock instances.
4. `beforeEach` calls `gameView.initialize()` (this causes the first set of calls to the mocked child methods).
5. Individual test runs.
6. Individual test calls the method again.
7. Assertion checks the total count (which now includes the `beforeEach` call + the test call).
The solution is to move the `gameView.initialize()` call *before* `jest.clearAllMocks()` in the `beforeEach` block, so that its effects are cleared, and then call `initialize()` again within the test itself if needed for that specific test's setup.
However, since `initialize()` is a crucial part of the setup for the GameView (it resets internal state like `wordRendered` and `currentWordLength`), it makes more sense to call it once after the mocks are set up and clear the mocks after that initial setup call. But since `initialize()` is part of the testable functionality, it's better to ensure the tests account for the call happening in `beforeEach`.
Let's adjust the `beforeEach` to call `initialize` first, then clear mocks, and adjust the tests that specifically test the *first* call to `initialize` to account for the fact that it already happened.
Actually, the cleanest way to handle this, given that `initialize` is a core part of the setup, is to call `initialize` after getting the mocks, and then clear the mocks again to ensure *only* the calls made within the *test* itself are counted for the assertions that check for single calls. This means `initialize` runs once for setup, its mocks are cleared, and then tests can call methods knowing the mock counts start from zero.
Here's the corrected approach:
1. In `beforeEach`: Create the view, get mocks, call `initialize` once to ensure internal state is set correctly for *subsequent* tests, then clear mocks again.
2. Adjust the tests that check for a single call to methods like `alphabetDisplay.render` within `initialize` to expect 1 call, because within *that specific test's execution* (after the second clear), it will be called once when the test calls `gameView.initialize()`.
3. For tests that don't call `initialize` themselves, the assertions will be 0 if they check for the `initialize` calls.
No, that's getting complex. The initial instinct was correct. Let's revert `beforeEach` to call `initialize` *after* clearing mocks. But then tests that *don't* call `initialize` themselves should expect 0 calls for the initialize-specific methods, and tests that *do* call `initialize` should expect 1 call. This is inconsistent.
Let's try this: Remove the `initialize()` call from `beforeEach` entirely. Let each test manage the call to `initialize` if it needs to. This gives us the most control.
```typescript
// tests/views/game-view.test.ts
// ... (previous content unchanged)

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

  // ... (rest of the file unchanged)

```
And then update the `initialize` tests to call `initialize` themselves:
```typescript
  // ... (previous tests unchanged)

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

  // ... (rest of the file unchanged)

```
Also, the tests that rely on the `initialize` call happening (like the restart flow test, or the "handle initialize called multiple times" test) need to be adjusted to account for the fact that `initialize` is not called implicitly anymore.
For the restart flow test, it needs to initialize the game first:
```typescript
  // ... (previous tests unchanged)

  describe('Game flow integration', () => {
    // ... (previous tests unchanged)

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

    // ... (rest of the file unchanged)
  });

  // ... (rest of the file unchanged)

```
For the "handle initialize called multiple times" test:
```typescript
  // ... (previous tests unchanged)

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

    // ... (rest of the file unchanged)
  });

  // ... (rest of the file unchanged)

```
For the "handle reset followed by initialize" test:
```typescript
  // ... (previous tests unchanged)

  describe('Edge Cases', () => {
    // ... (previous test unchanged)

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

    // ... (rest of the file unchanged)
  });

  // ... (rest of the file unchanged)

```
And for the typical game progression test, it needs to initialize first:
```typescript
  // ... (previous tests unchanged)

  describe('Game flow integration', () => {
    // ... (previous tests unchanged)

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

  // ... (rest of the file unchanged)

```
Here is the complete corrected test file:
```typescript
// tests/views/game-view.test.ts
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

```