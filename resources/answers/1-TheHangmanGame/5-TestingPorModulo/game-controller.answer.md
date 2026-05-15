# Respuesta

```markdown
// tests/controllers/game-controller.test.ts
import {GameController} from '@controllers/game-controller';
import {GameModel} from '@models/game-model';
import {GameView} from '@views/game-view';
import {GuessResult} from '@models/guess-result';

// Mock Model and View
jest.mock('@models/game-model');
jest.mock('@views/game-view');

describe('GameController', () => {
  let gameController: GameController;
  let mockModel: jest.Mocked<GameModel>;
  let mockView: jest.Mocked<GameView>;

  beforeEach(() => {
    // Create mocked Model
    mockModel = {
      initializeGame: jest.fn(),
      guessLetter: jest.fn(),
      getRevealedWord: jest.fn().mockReturnValue(['', '', '']),
      getFailedAttempts: jest.fn().mockReturnValue(0),
      getMaxAttempts: jest.fn().mockReturnValue(6),
      isVictory: jest.fn().mockReturnValue(false),
      isDefeat: jest.fn().mockReturnValue(false),
      getSecretWord: jest.fn().mockReturnValue('CAT'),
      resetGame: jest.fn(),
    } as any;

    // Create mocked View
    mockView = {
      initialize: jest.fn(),
      updateWordBoxes: jest.fn(),
      disableLetter: jest.fn(),
      updateAttemptCounter: jest.fn(),
      renderHangman: jest.fn(),
      showVictoryMessage: jest.fn(),
      showDefeatMessage: jest.fn(),
      showRestartButton: jest.fn(),
      hideRestartButton: jest.fn(),
      reset: jest.fn(),
      attachLetterClickHandler: jest.fn(),
      attachRestartHandler: jest.fn(),
    } as any;

    // Create GameController with mocked dependencies
    gameController = new GameController(mockModel, mockView);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should accept GameModel via dependency injection', () => {
      // ARRANGE & ACT: gameController already created
      // ASSERT: Verify by calling methods that use model
      gameController.initialize();
      expect(mockModel.initializeGame).toHaveBeenCalled();
    });

    it('should accept GameView via dependency injection', () => {
      // ARRANGE & ACT: gameController already created
      // ASSERT: Verify by calling methods that use view
      gameController.initialize();
      expect(mockView.initialize).toHaveBeenCalled();
    });

    it('should store model reference', () => {
      // ARRANGE & ACT: gameController already created
      // ASSERT: Verify by calling methods that use model
      gameController.initialize();
      expect(mockModel.initializeGame).toHaveBeenCalled();
    });

    it('should store view reference', () => {
      // ARRANGE & ACT: gameController already created
      // ASSERT: Verify by calling methods that use view
      gameController.initialize();
      expect(mockView.initialize).toHaveBeenCalled();
    });

    it('should create instance successfully', () => {
      // ARRANGE & ACT: gameController already created
      // ASSERT
      expect(gameController).toBeDefined();
      expect(gameController).toBeInstanceOf(GameController);
    });
  });

  describe('initialize', () => {
    it('should call model.initializeGame()', () => {
      // ARRANGE: gameController created
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockModel.initializeGame).toHaveBeenCalledTimes(1);
    });

    it('should call view.initialize()', () => {
      // ARRANGE
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.initialize).toHaveBeenCalledTimes(1);
    });

    it('should attach letter click handler', () => {
      // ARRANGE
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.attachLetterClickHandler).toHaveBeenCalled();
      expect(mockView.attachLetterClickHandler).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should attach restart handler', () => {
      // ARRANGE
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.attachRestartHandler).toHaveBeenCalled();
      expect(mockView.attachRestartHandler).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should synchronize view with model', () => {
      // ARRANGE
      // ACT
      gameController.initialize();
      // ASSERT: syncViewWithModel calls these methods
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
      expect(mockView.renderHangman).toHaveBeenCalled();
    });

    it('should call all initialization steps in correct order', () => {
      // ARRANGE
      // ACT
      gameController.initialize();
      // ASSERT: Verify all methods called
      expect(mockModel.initializeGame).toHaveBeenCalled();
      expect(mockView.initialize).toHaveBeenCalled();
      expect(mockView.attachLetterClickHandler).toHaveBeenCalled();
      expect(mockView.attachRestartHandler).toHaveBeenCalled();
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
    });
  });

  describe('handleLetterClick', () => {
    it('should call model.guessLetter() with letter', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('E');
      expect(mockModel.guessLetter).toHaveBeenCalledTimes(1);
    });

    it('should call updateViewAfterGuess() with result', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT: updateViewAfterGuess is called internally
      // Verify by checking that view methods are called
      expect(mockView.disableLetter).toHaveBeenCalledWith('E');
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
    });

    it('should call checkAndHandleGameEnd()', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      mockModel.isVictory.mockReturnValue(false);
      mockModel.isDefeat.mockReturnValue(false);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT: Should check game end conditions
      expect(mockModel.isVictory).toHaveBeenCalled();
      expect(mockModel.isDefeat).toHaveBeenCalled();
    });

    it('should handle correct guess sequence', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('E');
      expect(mockView.disableLetter).toHaveBeenCalledWith('E');
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
      expect(mockModel.isVictory).toHaveBeenCalled();
      expect(mockModel.isDefeat).toHaveBeenCalled();
    });

    it('should handle incorrect guess sequence', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('Z');
      expect(mockView.disableLetter).toHaveBeenCalledWith('Z');
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
      expect(mockModel.isVictory).toHaveBeenCalled();
      expect(mockModel.isDefeat).toHaveBeenCalled();
    });

    it('should handle already guessed sequence', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.ALREADY_GUESSED);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('E');
      expect(mockView.disableLetter).toHaveBeenCalledWith('E'); // Still disables (idempotent)
      expect(mockModel.isVictory).toHaveBeenCalled();
      expect(mockModel.isDefeat).toHaveBeenCalled();
    });
  });

  describe('handleRestartClick', () => {
    it('should call model.resetGame()', () => {
      // ARRANGE
      // ACT
      gameController.handleRestartClick();
      // ASSERT
      expect(mockModel.resetGame).toHaveBeenCalledTimes(1);
    });

    it('should call view.reset()', () => {
      // ARRANGE
      // ACT
      gameController.handleRestartClick();
      // ASSERT
      expect(mockView.reset).toHaveBeenCalledTimes(1);
    });

    it('should call syncViewWithModel() after reset', () => {
      // ARRANGE
      // ACT
      gameController.handleRestartClick();
      // ASSERT
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
    });

    it('should call correct sequence of operations', () => {
      // ARRANGE
      // ACT
      gameController.handleRestartClick();
      // ASSERT
      expect(mockModel.resetGame).toHaveBeenCalled();
      expect(mockView.reset).toHaveBeenCalled();
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
    });
  });

  describe('updateViewAfterGuess', () => {
    beforeEach(() => {
      // Need to trigger updateViewAfterGuess indirectly
      gameController.initialize();
    });

    it('should handle GuessResult.CORRECT correctly', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockView.disableLetter).toHaveBeenCalledWith('E');
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
    });

    it('should handle GuessResult.INCORRECT correctly', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockView.disableLetter).toHaveBeenCalledWith('Z');
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
    });

    it('should handle GuessResult.ALREADY_GUESSED correctly', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.ALREADY_GUESSED);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockView.disableLetter).toHaveBeenCalledWith('E'); // Still disables (idempotent)
      // Should not sync view as state didn't change
    });

    it('should disable letter for CORRECT and INCORRECT', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockView.disableLetter).toHaveBeenCalledWith('E');

      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockView.disableLetter).toHaveBeenCalledWith('Z');
    });

    it('should call syncViewWithModel() for CORRECT and INCORRECT', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockView.updateWordBoxes).toHaveBeenCalled();

      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
    });
  });

  describe('checkAndHandleGameEnd', () => {
    beforeEach(() => {
      gameController.initialize();
    });

    it('should detect victory condition', () => {
      // ARRANGE
      mockModel.isVictory.mockReturnValue(true);
      mockModel.isDefeat.mockReturnValue(false);
      mockModel.getSecretWord.mockReturnValue('ELEPHANT');
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT: Trigger game end check through letter click
      gameController.handleLetterClick('T');
      // ASSERT
      expect(mockView.showVictoryMessage).toHaveBeenCalledWith('ELEPHANT');
      expect(mockView.showRestartButton).toHaveBeenCalled();
    });

    it('should detect defeat condition', () => {
      // ARRANGE
      mockModel.isVictory.mockReturnValue(false);
      mockModel.isDefeat.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('RHINOCEROS');
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockView.showDefeatMessage).toHaveBeenCalledWith('RHINOCEROS');
      expect(mockView.showRestartButton).toHaveBeenCalled();
    });

    it('should show victory message with secret word', () => {
      // ARRANGE
      mockModel.isVictory.mockReturnValue(true);
      mockModel.isDefeat.mockReturnValue(false);
      mockModel.getSecretWord.mockReturnValue('CAT');
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('T');
      // ASSERT
      expect(mockView.showVictoryMessage).toHaveBeenCalledWith('CAT');
    });

    it('should show defeat message with secret word', () => {
      // ARRANGE
      mockModel.isVictory.mockReturnValue(false);
      mockModel.isDefeat.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('DOG');
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockView.showDefeatMessage).toHaveBeenCalledWith('DOG');
    });

    it('should show restart button on victory', () => {
      // ARRANGE
      mockModel.isVictory.mockReturnValue(true);
      mockModel.isDefeat.mockReturnValue(false);
      mockModel.getSecretWord.mockReturnValue('CAT');
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('T');
      // ASSERT
      expect(mockView.showRestartButton).toHaveBeenCalled();
    });

    it('should show restart button on defeat', () => {
      // ARRANGE
      mockModel.isVictory.mockReturnValue(false);
      mockModel.isDefeat.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('DOG');
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockView.showRestartButton).toHaveBeenCalled();
    });

    it('should do nothing if game continues', () => {
      // ARRANGE: Game not ended
      mockModel.isVictory.mockReturnValue(false);
      mockModel.isDefeat.mockReturnValue(false);
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT: No end game messages
      expect(mockView.showVictoryMessage).not.toHaveBeenCalled();
      expect(mockView.showDefeatMessage).not.toHaveBeenCalled();
      expect(mockView.showRestartButton).not.toHaveBeenCalled();
    });

    it('should check victory before defeat', () => {
      // ARRANGE: Both true (shouldn't happen, but test priority)
      mockModel.isVictory.mockReturnValue(true);
      mockModel.isDefeat.mockReturnValue(true);
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('T');
      // ASSERT: Victory message should be shown (checked first)
      expect(mockView.showVictoryMessage).toHaveBeenCalled();
      // Defeat message should NOT be shown if victory is true
      expect(mockView.showDefeatMessage).not.toHaveBeenCalled();
    });
  });

  describe('syncViewWithModel', () => {
    beforeEach(() => {
      gameController.initialize();
    });

    it('should call model.getRevealedWord()', () => {
      // ARRANGE
      const revealedWord = ['E', '', 'E', '', '', '', '', ''];
      mockModel.getRevealedWord.mockReturnValue(revealedWord);
      // ACT: Initialize triggers sync
      gameController.initialize();
      // ASSERT
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
    });

    it('should call view.updateWordBoxes() with revealed word', () => {
      // ARRANGE
      const revealedWord = ['E', '', 'E', '', '', '', '', ''];
      mockModel.getRevealedWord.mockReturnValue(revealedWord);
      // ACT: Initialize triggers sync
      gameController.initialize();
      // ASSERT
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalledWith(revealedWord);
    });

    it('should call model.getFailedAttempts()', () => {
      // ARRANGE
      mockModel.getFailedAttempts.mockReturnValue(3);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockModel.getFailedAttempts).toHaveBeenCalled();
    });

    it('should call model.getMaxAttempts()', () => {
      // ARRANGE
      mockModel.getFailedAttempts.mockReturnValue(3);
      mockModel.getMaxAttempts.mockReturnValue(6);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockModel.getMaxAttempts).toHaveBeenCalled();
    });

    it('should call view.updateAttemptCounter()', () => {
      // ARRANGE
      mockModel.getFailedAttempts.mockReturnValue(3);
      mockModel.getMaxAttempts.mockReturnValue(6);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockModel.getFailedAttempts).toHaveBeenCalled();
      expect(mockModel.getMaxAttempts).toHaveBeenCalled();
      expect(mockView.updateAttemptCounter).toHaveBeenCalledWith(3, 6);
    });

    it('should call view.renderHangman() with attempts', () => {
      // ARRANGE
      mockModel.getFailedAttempts.mockReturnValue(4);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.renderHangman).toHaveBeenCalledWith(4);
    });

    it('should call all view updates correctly', () => {
      // ARRANGE
      const revealedWord = ['C', 'A', 'T'];
      mockModel.getRevealedWord.mockReturnValue(revealedWord);
      mockModel.getFailedAttempts.mockReturnValue(2);
      mockModel.getMaxAttempts.mockReturnValue(6);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalledWith(revealedWord);
      expect(mockModel.getFailedAttempts).toHaveBeenCalled();
      expect(mockModel.getMaxAttempts).toHaveBeenCalled();
      expect(mockView.updateAttemptCounter).toHaveBeenCalledWith(2, 6);
      expect(mockView.renderHangman).toHaveBeenCalledWith(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle uppercase letters', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('E');
    });

    it('should handle lowercase letters', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('e');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('e');
    });

    it('should handle first letter click', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('E');
      expect(mockView.disableLetter).toHaveBeenCalledWith('E');
    });

    it('should handle last letter click (completing word)', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      mockModel.isVictory.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('CAT');
      // ACT
      gameController.handleLetterClick('T');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('T');
      expect(mockView.showVictoryMessage).toHaveBeenCalledWith('CAT');
    });

    it('should handle 6th incorrect guess (defeat)', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      mockModel.getFailedAttempts.mockReturnValue(6);
      mockModel.isDefeat.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('ELEPHANT');
      // ACT
      gameController.handleLetterClick('Z');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('Z');
      expect(mockView.showDefeatMessage).toHaveBeenCalledWith('ELEPHANT');
    });

    it('should check victory before defeat', () => {
      // ARRANGE
      mockModel.isVictory.mockReturnValue(true);
      mockModel.isDefeat.mockReturnValue(true); // Shouldn't happen, but test priority
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      mockModel.getSecretWord.mockReturnValue('CAT');
      // ACT
      gameController.handleLetterClick('T');
      // ASSERT: Victory should take precedence
      expect(mockView.showVictoryMessage).toHaveBeenCalledWith('CAT');
      expect(mockView.showDefeatMessage).not.toHaveBeenCalled();
    });

    it('should work with empty revealed word (all blanks)', () => {
      // ARRANGE
      mockModel.getRevealedWord.mockReturnValue(['', '', '']);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.updateWordBoxes).toHaveBeenCalledWith(['', '', '']);
    });

    it('should work with fully revealed word', () => {
      // ARRANGE
      mockModel.getRevealedWord.mockReturnValue(['C', 'A', 'T']);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.updateWordBoxes).toHaveBeenCalledWith(['C', 'A', 'T']);
    });

    it('should work with partially revealed word', () => {
      // ARRANGE
      mockModel.getRevealedWord.mockReturnValue(['C', '', 'T']);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.updateWordBoxes).toHaveBeenCalledWith(['C', '', 'T']);
    });

    it('should handle 0 failed attempts', () => {
      // ARRANGE
      mockModel.getFailedAttempts.mockReturnValue(0);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.updateAttemptCounter).toHaveBeenCalledWith(0, 6);
      expect(mockView.renderHangman).toHaveBeenCalledWith(0);
    });

    it('should handle 6 failed attempts', () => {
      // ARRANGE
      mockModel.getFailedAttempts.mockReturnValue(6);
      // ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.updateAttemptCounter).toHaveBeenCalledWith(6, 6);
      expect(mockView.renderHangman).toHaveBeenCalledWith(6);
    });

    it('should handle multiple letter clicks correctly', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      // ACT
      gameController.handleLetterClick('E');
      gameController.handleLetterClick('L');
      gameController.handleLetterClick('P');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledTimes(3);
      expect(mockView.disableLetter).toHaveBeenCalledTimes(3);
    });

    it('should handle restart after victory works', () => {
      // ARRANGE: Game ended in victory
      mockModel.isVictory.mockReturnValue(true);
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.handleLetterClick('T');
      expect(mockView.showVictoryMessage).toHaveBeenCalledWith('CAT');
      jest.clearAllMocks();

      // ACT: Restart
      mockModel.isVictory.mockReturnValue(false);
      gameController.handleRestartClick();

      // ASSERT: Should reset and reinitialize
      expect(mockModel.resetGame).toHaveBeenCalled();
      expect(mockView.reset).toHaveBeenCalled();
    });

    it('should handle restart after defeat works', () => {
      // ARRANGE: Game ended in defeat
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      mockModel.getFailedAttempts.mockReturnValue(6);
      mockModel.isDefeat.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('ELEPHANT');
      gameController.handleLetterClick('Z');
      expect(mockView.showDefeatMessage).toHaveBeenCalledWith('ELEPHANT');
      jest.clearAllMocks();

      // ACT: Restart
      mockModel.isDefeat.mockReturnValue(false);
      gameController.handleRestartClick();

      // ASSERT: Should reset and reinitialize
      expect(mockModel.resetGame).toHaveBeenCalled();
      expect(mockView.reset).toHaveBeenCalled();
    });

    it('should handle restart mid-game works', () => {
      // ARRANGE: Game in progress
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.handleLetterClick('E');
      expect(mockView.disableLetter).toHaveBeenCalledWith('E');
      jest.clearAllMocks();

      // ACT: Restart mid-game
      gameController.handleRestartClick();

      // ASSERT: Should reset and reinitialize
      expect(mockModel.resetGame).toHaveBeenCalled();
      expect(mockView.reset).toHaveBeenCalled();
    });
  });

  describe('MVC Pattern validation', () => {
    it('should NOT contain business logic', () => {
      // ARRANGE & ACT: Perform various operations
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.handleLetterClick('E');
      // ASSERT: All business logic should delegate to Model
      expect(mockModel.guessLetter).toHaveBeenCalled();
      // Controller should not determine victory/defeat itself
      expect(mockModel.isVictory).toHaveBeenCalled();
      expect(mockModel.isDefeat).toHaveBeenCalled();
    });

    it('should NOT perform UI rendering', () => {
      // ARRANGE & ACT: Perform operations
      gameController.initialize();
      // ASSERT: All rendering should delegate to View
      expect(mockView.initialize).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
      expect(mockView.renderHangman).toHaveBeenCalled();
      // Controller should not manipulate DOM directly
      // (This is verified by only calling view methods)
    });

    it('should delegate all business logic to Model', () => {
      // ARRANGE
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      mockModel.isVictory.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('CAT');
      // ACT
      gameController.handleLetterClick('T');
      // ASSERT: Controller uses model for all logic
      expect(mockModel.guessLetter).toHaveBeenCalled();
      expect(mockModel.isVictory).toHaveBeenCalled();
      expect(mockModel.isDefeat).toHaveBeenCalled();
      expect(mockModel.getSecretWord).toHaveBeenCalled();
    });

    it('should delegate all UI updates to View', () => {
      // ARRANGE
      mockModel.getRevealedWord.mockReturnValue(['C', 'A', 'T']);
      mockModel.getFailedAttempts.mockReturnValue(3);
      mockModel.getMaxAttempts.mockReturnValue(6);
      // ACT
      gameController.initialize();
      // ASSERT: Controller uses view for all UI
      expect(mockView.initialize).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalledWith(['C', 'A', 'T']);
      expect(mockView.updateAttemptCounter).toHaveBeenCalledWith(3, 6);
      expect(mockView.renderHangman).toHaveBeenCalledWith(3);
    });
  });

  describe('Complete game flows', () => {
    it('should handle complete victory flow', () => {
      // ARRANGE: Setup for victory scenario
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      mockModel.isVictory.mockReturnValue(false); // Not yet
      // ACT: Initialize
      gameController.initialize();
      expect(mockModel.initializeGame).toHaveBeenCalled();
      jest.clearAllMocks();
      // Guess letters (simulate complete word)
      mockModel.isVictory.mockReturnValue(true); // Last letter!
      mockModel.getSecretWord.mockReturnValue('CAT');
      gameController.handleLetterClick('T');
      // ASSERT: Victory sequence
      expect(mockView.showVictoryMessage).toHaveBeenCalledWith('CAT');
      expect(mockView.showRestartButton).toHaveBeenCalled();
    });

    it('should handle complete defeat flow', () => {
      // ARRANGE: Setup for defeat scenario
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      mockModel.getFailedAttempts.mockReturnValue(5);
      // ACT: Guess 6th wrong letter
      mockModel.getFailedAttempts.mockReturnValue(6);
      mockModel.isDefeat.mockReturnValue(true);
      mockModel.getSecretWord.mockReturnValue('ELEPHANT');
      gameController.handleLetterClick('Z');
      // ASSERT: Defeat sequence
      expect(mockView.showDefeatMessage).toHaveBeenCalledWith('ELEPHANT');
      expect(mockView.showRestartButton).toHaveBeenCalled();
    });

    it('should handle restart flow', () => {
      // ARRANGE: Game ended
      mockModel.isVictory.mockReturnValue(true);
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.handleLetterClick('T');
      jest.clearAllMocks();
      // ACT: Restart
      mockModel.isVictory.mockReturnValue(false);
      gameController.handleRestartClick();
      // ASSERT: Restart sequence
      expect(mockModel.resetGame).toHaveBeenCalled();
      expect(mockView.reset).toHaveBeenCalled();
      expect(mockView.updateWordBoxes).toHaveBeenCalled();
    });

    it('should handle mixed correct/incorrect guesses flow', () => {
      // ARRANGE: Initialize
      gameController.initialize();
      expect(mockModel.initializeGame).toHaveBeenCalled();
      expect(mockView.initialize).toHaveBeenCalled();
      jest.clearAllMocks();

      // ACT: Mix of correct and incorrect guesses
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.handleLetterClick('E');
      expect(mockView.disableLetter).toHaveBeenCalledWith('E');
      expect(mockView.updateWordBoxes).toHaveBeenCalled();

      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      mockModel.getFailedAttempts.mockReturnValue(1);
      gameController.handleLetterClick('Z');
      expect(mockView.disableLetter).toHaveBeenCalledWith('Z');
      expect(mockView.updateAttemptCounter).toHaveBeenCalledWith(1, 6);
      expect(mockView.renderHangman).toHaveBeenCalledWith(1);

      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.handleLetterClick('L');
      expect(mockView.disableLetter).toHaveBeenCalledWith('L');
      expect(mockView.updateWordBoxes).toHaveBeenCalled();

      // ASSERT: All operations handled correctly
      expect(mockModel.guessLetter).toHaveBeenCalledTimes(3);
      expect(mockView.disableLetter).toHaveBeenCalledTimes(3);
      expect(mockView.updateWordBoxes).toHaveBeenCalledTimes(3);
    });
  });

  describe('Event handler integration', () => {
    it('should trigger handleLetterClick when letter clicked', () => {
      // ARRANGE
      let letterClickHandler: (letter: string) => void = () => {};
      mockView.attachLetterClickHandler.mockImplementation((handler) => {
        letterClickHandler = handler;
      });
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.initialize();
      // ACT: Simulate letter click through attached handler
      letterClickHandler('E');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('E');
    });

    it('should trigger handleRestartClick when restart clicked', () => {
      // ARRANGE
      let restartHandler: () => void = () => {};
      mockView.attachRestartHandler.mockImplementation((handler) => {
        restartHandler = handler;
      });
      gameController.initialize();
      // ACT: Simulate restart click through attached handler
      restartHandler();
      // ASSERT
      expect(mockModel.resetGame).toHaveBeenCalled();
      expect(mockView.reset).toHaveBeenCalled();
    });

    it('should attach event handlers during initialization', () => {
      // ARRANGE & ACT
      gameController.initialize();
      // ASSERT
      expect(mockView.attachLetterClickHandler).toHaveBeenCalled();
      expect(mockView.attachRestartHandler).toHaveBeenCalled();
    });
  });
});
```

---

# Respuesta (FIX 1)

**Prompt:**
```markdown
> the-hangman-game@1.0.0 test
> jest tests/controllers/game-controller.test.ts

 FAIL  tests/controllers/game-controller.test.ts
  GameController
    constructor
      ✕ should accept GameModel via dependency injection (1 ms)
      ✕ should accept GameView via dependency injection
      ✕ should store model reference
      ✕ should store view reference
      ✓ should create instance successfully
    initialize
      ✕ should call model.initializeGame() (1 ms)
      ✕ should call view.initialize()
      ✕ should attach letter click handler (1 ms)
      ✕ should attach restart handler
      ✕ should synchronize view with model
      ✕ should call all initialization steps in correct order
    handleLetterClick
      ✓ should call model.guessLetter() with letter (1 ms)
      ✓ should call updateViewAfterGuess() with result
      ✓ should call checkAndHandleGameEnd() (1 ms)
      ✓ should handle correct guess sequence (1 ms)
      ✓ should handle incorrect guess sequence
      ✓ should handle already guessed sequence (1 ms)
    handleRestartClick
      ✓ should call model.resetGame()
      ✓ should call view.reset()
      ✓ should call syncViewWithModel() after reset
      ✓ should call correct sequence of operations (1 ms)
    updateViewAfterGuess
      ✕ should handle GuessResult.CORRECT correctly
      ✕ should handle GuessResult.INCORRECT correctly
      ✕ should handle GuessResult.ALREADY_GUESSED correctly
      ✕ should disable letter for CORRECT and INCORRECT
      ✕ should call syncViewWithModel() for CORRECT and INCORRECT (1 ms)
    checkAndHandleGameEnd
      ✕ should detect victory condition
      ✕ should detect defeat condition
      ✕ should show victory message with secret word
      ✕ should show defeat message with secret word
      ✕ should show restart button on victory (1 ms)
      ✕ should show restart button on defeat
      ✕ should do nothing if game continues
      ✕ should check victory before defeat
    syncViewWithModel
      ✕ should call model.getRevealedWord()
      ✕ should call view.updateWordBoxes() with revealed word
      ✕ should call model.getFailedAttempts()
      ✕ should call model.getMaxAttempts()
      ✕ should call view.updateAttemptCounter()
      ✕ should call view.renderHangman() with attempts
      ✕ should call all view updates correctly (1 ms)
    Edge Cases
      ✓ should handle uppercase letters
      ✓ should handle lowercase letters
      ✓ should handle first letter click (1 ms)
      ✓ should handle last letter click (completing word)
      ✓ should handle 6th incorrect guess (defeat) (1 ms)
      ✓ should check victory before defeat
      ✕ should work with empty revealed word (all blanks)
      ✕ should work with fully revealed word (1 ms)
      ✕ should work with partially revealed word
      ✕ should handle 0 failed attempts
      ✕ should handle 6 failed attempts
      ✓ should handle multiple letter clicks correctly
      ✓ should handle restart after victory works (1 ms)
      ✓ should handle restart after defeat works
      ✓ should handle restart mid-game works (1 ms)
    MVC Pattern validation
      ✓ should NOT contain business logic
      ✕ should NOT perform UI rendering
      ✕ should delegate all business logic to Model (1 ms)
      ✕ should delegate all UI updates to View (1 ms)
    Complete game flows
      ✕ should handle complete victory flow
      ✓ should handle complete defeat flow (1 ms)
      ✓ should handle restart flow
      ✕ should handle mixed correct/incorrect guesses flow
    Event handler integration
      ✕ should trigger handleLetterClick when letter clicked
      ✕ should trigger handleRestartClick when restart clicked
      ✕ should attach event handlers during initialization

  ● GameController › constructor › should accept GameModel via dependency injection

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:71:22)

  ● GameController › constructor › should accept GameView via dependency injection

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:78:22)

  ● GameController › constructor › should store model reference

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:85:22)

  ● GameController › constructor › should store view reference

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:92:22)

  ● GameController › initialize › should call model.initializeGame()

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:108:22)

  ● GameController › initialize › should call view.initialize()

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:116:22)

  ● GameController › initialize › should attach letter click handler

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:124:22)

  ● GameController › initialize › should attach restart handler

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:133:22)

  ● GameController › initialize › should synchronize view with model

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:142:22)

  ● GameController › initialize › should call all initialization steps in correct order

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:152:22)

  ● GameController › updateViewAfterGuess › should handle GuessResult.CORRECT correctly

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:276:22)

  ● GameController › updateViewAfterGuess › should handle GuessResult.INCORRECT correctly

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:276:22)

  ● GameController › updateViewAfterGuess › should handle GuessResult.ALREADY_GUESSED correctly

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:276:22)

  ● GameController › updateViewAfterGuess › should disable letter for CORRECT and INCORRECT

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:276:22)

  ● GameController › updateViewAfterGuess › should call syncViewWithModel() for CORRECT and INCORRECT

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:276:22)

  ● GameController › checkAndHandleGameEnd › should detect victory condition

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › checkAndHandleGameEnd › should detect defeat condition

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › checkAndHandleGameEnd › should show victory message with secret word

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › checkAndHandleGameEnd › should show defeat message with secret word

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › checkAndHandleGameEnd › should show restart button on victory

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › checkAndHandleGameEnd › should show restart button on defeat

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › checkAndHandleGameEnd › should do nothing if game continues

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › checkAndHandleGameEnd › should check victory before defeat

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:344:22)

  ● GameController › syncViewWithModel › should call model.getRevealedWord()

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:450:22)

  ● GameController › syncViewWithModel › should call view.updateWordBoxes() with revealed word

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:450:22)

  ● GameController › syncViewWithModel › should call model.getFailedAttempts()

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:450:22)

  ● GameController › syncViewWithModel › should call model.getMaxAttempts()

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:450:22)

  ● GameController › syncViewWithModel › should call view.updateAttemptCounter()

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:450:22)

  ● GameController › syncViewWithModel › should call view.renderHangman() with attempts

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:450:22)

  ● GameController › syncViewWithModel › should call all view updates correctly

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:450:22)

  ● GameController › Edge Cases › should work with empty revealed word (all blanks)

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:603:22)

  ● GameController › Edge Cases › should work with fully revealed word

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:612:22)

  ● GameController › Edge Cases › should work with partially revealed word

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:621:22)

  ● GameController › Edge Cases › should handle 0 failed attempts

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:630:22)

  ● GameController › Edge Cases › should handle 6 failed attempts

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:640:22)

  ● GameController › MVC Pattern validation › should NOT perform UI rendering

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:724:22)

  ● GameController › MVC Pattern validation › should delegate all business logic to Model

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      741 |       expect(mockModel.guessLetter).toHaveBeenCalled();
      742 |       expect(mockModel.isVictory).toHaveBeenCalled();
    > 743 |       expect(mockModel.isDefeat).toHaveBeenCalled();
          |                                  ^
      744 |       expect(mockModel.getSecretWord).toHaveBeenCalled();
      745 |     });
      746 |

      at Object.<anonymous> (tests/controllers/game-controller.test.ts:743:34)

  ● GameController › MVC Pattern validation › should delegate all UI updates to View

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:753:22)

  ● GameController › Complete game flows › should handle complete victory flow

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:768:22)

  ● GameController › Complete game flows › should handle mixed correct/incorrect guesses flow

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:811:22)

  ● GameController › Event handler integration › should trigger handleLetterClick when letter clicked

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:849:22)

  ● GameController › Event handler integration › should trigger handleRestartClick when restart clicked

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:862:22)

  ● GameController › Event handler integration › should attach event handlers during initialization

    TypeError: this.view.attachAlphabetClickHandler is not a function

      52 |
      53 |     // Attach event handlers
    > 54 |     this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));
         |               ^
      55 |     this.view.attachRestartHandler(() => this.handleRestartClick());
      56 |
      57 |     // Sync view with initial model state

      at GameController.initialize (src/controllers/game-controller.ts:54:15)
      at Object.<anonymous> (tests/controllers/game-controller.test.ts:872:22)

Test Suites: 1 failed, 1 total
Tests:       43 failed, 24 passed, 67 total
Snapshots:   0 total
Time:        0.529 s
Ran all test suites matching /tests\/controllers\/game-controller.test.ts/i.
```
**Respuesta:**
The test failures are caused by two main issues:
1. **Missing ****`attachAlphabetClickHandler`**** and ****`attachRestartHandler`**** in Mock:** The `GameController.initialize()` method calls `this.view.attachAlphabetClickHandler` and `this.view.attachRestartHandler`. The mock object provided for `GameView` does not include these methods, causing a `TypeError: this.view.attachAlphabetClickHandler is not a function`. This error occurs during the `beforeEach` initialization when `gameController.initialize()` is called, affecting all tests that depend on the controller being fully initialized without errors.
2. **Incorrect ****`isDefeat`**** Assertion:** In the `should delegate all business logic to Model` test, the assertion `expect(mockModel.isDefeat).toHaveBeenCalled();` fails because `isDefeat` is not called within the specific sequence of operations being tested in that test block.
Here are the fixes needed in the test file:
1. **Add the missing methods to the ****`mockView`**** object:**
```typescript
    // Create mocked View
    mockView = {
      initialize: jest.fn(),
      updateWordBoxes: jest.fn(),
      disableLetter: jest.fn(),
      updateAttemptCounter: jest.fn(),
      renderHangman: jest.fn(),
      showVictoryMessage: jest.fn(),
      showDefeatMessage: jest.fn(),
      showRestartButton: jest.fn(),
      hideRestartButton: jest.fn(),
      reset: jest.fn(),
      // Add the missing methods
      attachAlphabetClickHandler: jest.fn(),
      attachRestartHandler: jest.fn(),
    } as any;

```
1. **Fix the assertion in ****`should delegate all business logic to Model`****:** This test needs to trigger the specific code path where `isDefeat` would be called. It can be done by simulating a scenario where the model indicates defeat after a guess. However, since the model's state is checked after `handleLetterClick`, and `handleLetterClick` itself calls `guessLetter` and `checkAndHandleGameEnd` (which calls `isVictory`/`isDefeat`), the `isDefeat` call happens within the `handleLetterClick` execution, which is already tested. The issue might be that the `initialize` call in `beforeEach` also triggers `syncViewWithModel` which calls `isVictory`/`isDefeat` indirectly (though `syncViewWithModel` itself doesn't check victory/defeat directly, the initial sync might involve calls that do). Let's adjust the test to ensure `isDefeat` is called by simulating a game condition where it would be checked. We need to call a method that leads to a check, like `handleLetterClick`, and set up the mock model to return defeat state.
```typescript
    it('should delegate all business logic to Model', () => {
      // ARRANGE: Set up a scenario where isDefeat might be checked after a guess
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // Simulate 5 failed attempts already, so the next incorrect guess makes it 6 (defeat)
      mockModel.getFailedAttempts.mockReturnValue(5);
      mockModel.isDefeat.mockReturnValueOnce(false).mockReturnValueOnce(true); // First call false (after guess), second call true (in checkAndHandleGameEnd)
      mockModel.getSecretWord.mockReturnValue('ELEPHANT');

      // ACT: Perform an operation that triggers business logic
      gameController.handleLetterClick('Z'); // This should make failed attempts = 6

      // ASSERT: Controller uses model for all logic
      expect(mockModel.guessLetter).toHaveBeenCalled(); // Called in handleLetterClick
      expect(mockModel.isVictory).toHaveBeenCalled();   // Called in checkAndHandleGameEnd
      expect(mockModel.isDefeat).toHaveBeenCalled();    // Called in checkAndHandleGameEnd
      expect(mockModel.getSecretWord).toHaveBeenCalled(); // Called in checkAndHandleGameEnd if defeat
    });

```
However, looking more closely at the `syncViewWithModel` method, it calls `getFailedAttempts` but doesn't directly call `isDefeat` or `isVictory`. The `isDefeat` and `isVictory` calls happen in `checkAndHandleGameEnd`, which is called from `handleLetterClick`. So the original test calling `initialize()` would only call `syncViewWithModel`, which calls `getRevealedWord`, `getFailedAttempts`, `getMaxAttempts`. The `isVictory` and `isDefeat` calls happen later. The original assertion was likely meant to be checked *after* an action like `handleLetterClick`. Let's revert the `initialize`-only test and make sure `isDefeat` assertion is in a context where it's called, like the one above or just ensure `isVictory` and `isDefeat` are called during `checkAndHandleGameEnd` which is tested elsewhere. The test `should delegate all business logic to Model` should probably just ensure these methods *can* be called by the controller in the right contexts, not necessarily that they are called *every time* any method runs.
Actually, let's re-examine. The `beforeEach` calls `gameController.initialize()`. Inside `initialize`, it calls `syncViewWithModel`. Inside `syncViewWithModel`, it calls `model.getRevealedWord()`, `model.getFailedAttempts()`, `model.getMaxAttempts()`. It does *not* call `isVictory` or `isDefeat`. So the original assertion `expect(mockModel.isDefeat).toHaveBeenCalled();` inside a test that only calls `initialize` (or methods that lead to `syncViewWithModel` like the `syncViewWithModel` test itself) is incorrect. The `isVictory` and `isDefeat` calls happen in `checkAndHandleGameEnd` which is called from `handleLetterClick`. So, the test `should delegate all business logic to Model` needs to trigger a path where these are called, like `handleLetterClick`.
Let's fix the test to correctly check for `isVictory` and `isDefeat` being called as part of `handleLetterClick`'s game end check, and also fix the missing methods in the mock.
Here is the corrected `beforeEach` and the specific test:
```typescript
  beforeEach(() => {
    // Create mocked Model
    mockModel = {
      initializeGame: jest.fn(),
      guessLetter: jest.fn(),
      getRevealedWord: jest.fn().mockReturnValue(['', '', '']),
      getFailedAttempts: jest.fn().mockReturnValue(0),
      getMaxAttempts: jest.fn().mockReturnValue(6),
      isVictory: jest.fn().mockReturnValue(false),
      isDefeat: jest.fn().mockReturnValue(false),
      getSecretWord: jest.fn().mockReturnValue('CAT'),
      resetGame: jest.fn(),
    } as any;

    // Create mocked View - ADDING THE MISSING METHODS HERE
    mockView = {
      initialize: jest.fn(),
      updateWordBoxes: jest.fn(),
      disableLetter: jest.fn(),
      updateAttemptCounter: jest.fn(),
      renderHangman: jest.fn(),
      showVictoryMessage: jest.fn(),
      showDefeatMessage: jest.fn(),
      showRestartButton: jest.fn(),
      hideRestartButton: jest.fn(),
      reset: jest.fn(),
      attachAlphabetClickHandler: jest.fn(), // ADDED
      attachRestartHandler: jest.fn(),       // ADDED
    } as any;

    // Create GameController with mocked dependencies
    gameController = new GameController(mockModel, mockView);
  });

```
And the corrected `should delegate all business logic to Model` test:
```typescript
  describe('MVC Pattern validation', () => {
    // ... other tests ...

    it('should delegate all business logic to Model', () => {
      // ARRANGE: Set up a scenario where isDefeat might be checked after a guess
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // Simulate 5 failed attempts already, so the next incorrect guess makes it 6 (defeat)
      mockModel.getFailedAttempts.mockReturnValue(5);
      // Mock isDefeat to return true after the guess increments failed attempts to 6
      // (Note: The real model would update state internally, here we simulate the check result)
      // We need to mock the sequence: guessLetter -> getFailedAttempts (increases to 6) -> isDefeat -> true
      // For simplicity in the mock, we'll set up isDefeat to return true *after* the guess
      // Let's trigger a scenario where isVictory is checked first and then isDefeat could be checked
      // Or just call handleLetterClick and check that the game end check methods are called eventually.
      // The original test was probably just to ensure these methods are called somewhere during gameplay.
      // Let's simulate a click that leads to a game end check.
      // To ensure isDefeat is called, we can mock the state change.
      // Assume getFailedAttempts will return 6 after guessLetter(INCORRECT) if it was 5 before.
      // isDefeat() is called after guessLetter, so let's mock the state appropriately for the *next* check.
      // Let's mock the sequence within handleLetterClick:
      // 1. guessLetter('Z') - returns INCORRECT
      // 2. This should increment internal model state (mocked via getFailedAttempts returning higher value next)
      // 3. updateViewAfterGuess is called
      // 4. checkAndHandleGameEnd is called
      // 5. checkAndHandleGameEnd calls model.isVictory() (false) and model.isDefeat() (true if 6 attempts)

      // Mock the model state for a defeat scenario *after* the guess
      mockModel.guessLetter.mockReturnValueOnce(GuessResult.INCORRECT); // First call returns INCORRECT
      // Subsequent calls to getFailedAttempts should return 6 to trigger defeat
      mockModel.getFailedAttempts.mockImplementation(() => {
         // This is tricky with mocks. Let's assume guessLetter internally updates the model's failed attempts.
         // For the test, we'll make isDefeat return true to simulate the condition being met.
         // The key is that checkAndHandleGameEnd calls isDefeat.
         // We can mock isDefeat to return true for this specific test run.
         // Since handleLetterClick calls checkAndHandleGameEnd, and that calls isDefeat,
         // we expect isDefeat to be called if the game state leads to it.
         // Let's make isDefeat return true for this test.
         // We need to ensure the state is such that after guessLetter, isDefeat would be true.
         // Let's set isDefeat to return true once, assuming the internal state is now defeat.
         // The test setup is complex with mocks, so let's ensure the call happens.
         // Let's make a more general assertion that these methods are called during game flow.
         // A simple way is to just call handleLetterClick and assert based on its internal calls.
         // For isDefeat, we need a scenario. Let's make the mock return true.
         // The real model would increment failed attempts internally.
         // We can't easily mock that internal increment, but we can mock the *result* of that increment.
         // Let's say after guessLetter, getFailedAttempts returns 6.
         // Let's mock getFailedAttempts to return 6 *when called after guessLetter*.
         // This requires careful mocking.
         // A simpler way for this specific test: Mock the *result* of the internal logic.
         // Inside checkAndHandleGameEnd, it calls isVictory, then isDefeat if isVictory is false.
         // So if we mock isVictory to return false and isDefeat to return true, it should trigger defeat.
         // This is what we'll do. We need to ensure these calls happen *after* guessLetter.
         // The sequence in handleLetterClick is:
         // 1. const result = this.model.guessLetter(letter);
         // 2. this.updateViewAfterGuess(result, letter); [this calls syncViewWithModel, which calls getRevealedWord, getFailedAttempts, getMaxAttempts, renderHangman, updateAttemptCounter]
         // 3. this.checkAndHandleGameEnd(); [this calls isVictory, isDefeat, getSecretWord]
         // So isDefeat is called within checkAndHandleGameEnd.
         // To make isDefeat return true, we need the model state to reflect 6 failed attempts.
         // We'll mock the model to behave as if the guess pushed it over the limit.
         // Mock isVictory to return false first
         // Mock isDefeat to return true
         // This simulates the condition being met.
         // We also need getFailedAttempts to return 6 for syncViewWithModel to show the final state.
         // Let's set up the mocks *before* calling handleLetterClick.
         // The call order is important. isDefeat is called by checkAndHandleGameEnd.
         // Let's just ensure isDefeat is called *at all* during a typical game flow.
         // We'll make the model state simulate defeat after the guess.
         // Let's assume the controller doesn't directly increment attempts,
         // but the model does internally. So we mock the *query* methods to reflect the new state.
         // Let's mock getFailedAttempts to return 6 after the guess.
         // And mock isDefeat to return true.
         // The easiest way is to make isDefeat return true once after a call sequence.
         // Let's mock isDefeat to return true for the check in checkAndHandleGameEnd.
         // This means the *next* call to isDefeat (from checkAndHandleGameEnd) returns true.
         // We can use mockImplementation or mockReturnValueOnce.
         // Let's set it up so that the call to isDefeat inside checkAndHandleGameEnd returns true.
         // This requires setting the mock *before* the call chain is initiated.
         // Let's call handleLetterClick with a mock that makes isDefeat true.
         // Mock: guessLetter returns INCORRECT, then getFailedAttempts returns 6, then isDefeat returns true.
         // We can't easily mock an increment in the mock model, but we can mock the final state check.
         // Let's mock isDefeat to return true once, assuming the internal state led to it.
         // Let's also mock getFailedAttempts to return 6, to represent the state after the failing guess.
         // This means the *next* call to getFailedAttempts (within syncViewWithModel or checkAndHandleGameEnd)
         // should return 6.
         // We can use mockImplementation to return 6 from the *second* call onwards, or mockReturnValueOnce.
         // Let's keep it simple: assume the model's state is such that isDefeat returns true after this guess.
         // So we set isDefeat to return true.
         // And getFailedAttempts to return 6 (for the final display sync).
         // Let's make these changes *before* calling handleLetterClick.
         // Let's assume the guess was the 6th failure.
         // So getFailedAttempts should return 6, isDefeat should return true.
         // Let's do this:
         // mockModel.getFailedAttempts.mockReturnValue(6); // This will make subsequent calls return 6
         // mockModel.isDefeat.mockReturnValue(true); // This will make isDefeat return true
         // But we need to be careful. getFailedAttempts is called in syncViewWithModel *before* checkAndHandleGameEnd.
         // If we set it to 6, syncViewWithModel will use 6.
         // And then checkAndHandleGameEnd will also see 6.
         // And isDefeat will return true.
         // This seems correct.
         // Let's also ensure isVictory returns false first.
         // The sequence in checkAndHandleGameEnd is: if isVictory() then ... else if isDefeat() then ...
         // So isVictory is called first.
         // Let's mock isVictory to return false, and isDefeat to return true.
         // We need to make sure these mocks reflect the *state after* the guessLetter call.
         // The controller doesn't change the model's state directly, it queries it.
         // So the model mock needs to return the *new* state after guessLetter.
         // This is hard to mock perfectly without the actual model's internal state management.
         // The easiest way is to mock the *queries* that happen *after* the guessLetter call
         // to reflect the state change.
         // Let's mock isVictory to return false, and isDefeat to return true *for the check*.
         // And let's mock getFailedAttempts to return 6 *for the display sync*.
         // We can set these *before* calling handleLetterClick.
         // The controller calls guessLetter, then calls syncViewWithModel (which calls getFailedAttempts),
         // then calls checkAndHandleGameEnd (which calls isVictory, isDefeat).
         // So the mock state should reflect the result of the guessLetter call.
         // Let's make this specific call return defeat.
         // We can't easily mock an increment, so let's mock the *result* of the increment being over the limit.
         // So we'll make getFailedAttempts return 6 and isDefeat return true *for this test*.
         // This simulates the condition where the player lost on this last guess.
         // Reset the mock to ensure the correct sequence is tested.
         // Let's assume the model's internal state was already at 5, and guessLetter('Z') made it 6.
         // Our mock for guessLetter returns INCORRECT.
         // Our mock for getFailedAttempts should return 6 *now* (as if the internal counter was updated).
         // Our mock for isDefeat should return true *now* (as if the internal counter reached 6).
         // Our mock for isVictory should return false *now* (as it's not a win).
         // Let's do this:
         mockModel.getFailedAttempts.mockReturnValue(6); // Simulate internal counter reached 6
         mockModel.isVictory.mockReturnValue(false); // Not a victory
         mockModel.isDefeat.mockReturnValue(true);   // Is a defeat
         mockModel.getSecretWord.mockReturnValue('ELEPHANT'); // Word for defeat message

         // Now, when checkAndHandleGameEnd calls isDefeat, it should return true.
         // And isVictory should return false.
         // So isDefeat *should* be called.
         // The assertion will be that isDefeat was called during the process.
         // The process is initiated by handleLetterClick.
         return 6; // Return 6 for getFailedAttempts calls
      });

      // ACT: Perform an operation that triggers business logic
      gameController.handleLetterClick('Z'); // This should trigger the defeat check

      // ASSERT: Controller uses model for all logic
      expect(mockModel.guessLetter).toHaveBeenCalledWith('Z'); // Called in handleLetterClick
      expect(mockModel.isVictory).toHaveBeenCalled();   // Called in checkAndHandleGameEnd
      expect(mockModel.isDefeat).toHaveBeenCalled();    // Called in checkAndHandleGameEnd
      expect(mockModel.getSecretWord).toHaveBeenCalled(); // Called in checkAndHandleGameEnd if defeat
    });

    // ... other tests ...
  });

```
Actually, the `mockImplementation` for `getFailedAttempts` is overly complex and might not work as intended. Let's simplify the `isDefeat` test by just ensuring the method is called during a scenario that should trigger it, using simpler mock returns.
Here is a cleaner version of the specific test:
```typescript
  describe('MVC Pattern validation', () => {
    // ... other tests ...

    it('should delegate all business logic to Model', () => {
      // ARRANGE: Set up a scenario where isDefeat will be checked and return true
      // This simulates the state after an incorrect guess that causes defeat.
      mockModel.guessLetter.mockReturnValue(GuessResult.INCORRECT);
      // Mock the model's state to reflect defeat *after* the guess is processed internally.
      // We assume the internal logic of the real model updates failed attempts.
      // For the mock, we set the *query* methods to return the state after the update.
      // So getFailedAttempts should return 6 (defeat threshold), isDefeat should return true.
      // We need to be careful about *when* these values are returned.
      // The sequence in handleLetterClick is:
      // 1. model.guessLetter(letter) - This is where the internal model state would change.
      // 2. updateViewAfterGuess -> syncViewWithModel -> model.getFailedAttempts() (should reflect new state)
      // 3. checkAndHandleGameEnd -> model.isVictory() (should be false), model.isDefeat() (should be true)
      // To mock this:
      // - guessLetter returns INCORRECT (triggers internal increment in real model)
      // - *Subsequently*, getFailedAttempts should return 6, isVictory should return false, isDefeat should return true.
      // We can achieve this by mocking getFailedAttempts to return 6 from this point,
      // and isDefeat to return true.
      // Let's mock these *before* the call, assuming the controller's call to guessLetter
      // results in the model's internal state being updated, which our *next* query will reflect.
      mockModel.getFailedAttempts.mockReturnValue(6); // Simulate internal state update after guess
      mockModel.isVictory.mockReturnValue(false);     // Defeat scenario
      mockModel.isDefeat.mockReturnValue(true);       // Defeat scenario
      mockModel.getSecretWord.mockReturnValue('ELEPHANT');

      // ACT: Perform an operation that triggers business logic and game end check
      gameController.handleLetterClick('Z'); // This guess should lead to defeat

      // ASSERT: Controller uses model for all logic, including game end checks
      expect(mockModel.guessLetter).toHaveBeenCalledWith('Z'); // Called in handleLetterClick
      // syncViewWithModel calls getFailedAttempts (should be 6 now)
      expect(mockModel.getFailedAttempts).toHaveBeenCalled();
      // checkAndHandleGameEnd calls isVictory (should be false) and isDefeat (should be true)
      expect(mockModel.isVictory).toHaveBeenCalled(); // Checked first
      expect(mockModel.isDefeat).toHaveBeenCalled();  // Checked second, should be true
      // If defeat was true, getSecretWord was called
      expect(mockModel.getSecretWord).toHaveBeenCalled(); // Called because isDefeat was true
    });

    // ... other tests ...
  });

```
This version is simpler and more focused on the specific call sequence within `handleLetterClick` that leads to defeat being checked and confirmed.

---

# Respuesta (FIX 2)

**Prompt:**
```markdown
> the-hangman-game@1.0.0 test
> jest tests/controllers/game-controller.test.ts

 FAIL  tests/controllers/game-controller.test.ts
  GameController
    constructor
      ✓ should accept GameModel via dependency injection (1 ms)
      ✓ should accept GameView via dependency injection
      ✓ should store model reference (1 ms)
      ✓ should store view reference
      ✓ should create instance successfully (1 ms)
    initialize
      ✓ should call model.initializeGame()
      ✓ should call view.initialize() (3 ms)
      ✕ should attach letter click handler (1 ms)
      ✓ should attach restart handler (1 ms)
      ✓ should synchronize view with model
      ✕ should call all initialization steps in correct order (1 ms)
    handleLetterClick
      ✓ should call model.guessLetter() with letter
      ✓ should call updateViewAfterGuess() with result (1 ms)
      ✓ should call checkAndHandleGameEnd()
      ✓ should handle correct guess sequence
      ✓ should handle incorrect guess sequence
      ✓ should handle already guessed sequence
    handleRestartClick
      ✓ should call model.resetGame() (1 ms)
      ✓ should call view.reset()
      ✓ should call syncViewWithModel() after reset
      ✓ should call correct sequence of operations
    updateViewAfterGuess
      ✓ should handle GuessResult.CORRECT correctly (1 ms)
      ✓ should handle GuessResult.INCORRECT correctly
      ✓ should handle GuessResult.ALREADY_GUESSED correctly
      ✓ should disable letter for CORRECT and INCORRECT
      ✓ should call syncViewWithModel() for CORRECT and INCORRECT
    checkAndHandleGameEnd
      ✓ should detect victory condition (1 ms)
      ✓ should detect defeat condition
      ✓ should show victory message with secret word
      ✓ should show defeat message with secret word
      ✓ should show restart button on victory
      ✓ should show restart button on defeat (1 ms)
      ✓ should do nothing if game continues
      ✓ should check victory before defeat
    syncViewWithModel
      ✓ should call model.getRevealedWord() (1 ms)
      ✓ should call view.updateWordBoxes() with revealed word
      ✓ should call model.getFailedAttempts()
      ✓ should call model.getMaxAttempts() (1 ms)
      ✓ should call view.updateAttemptCounter()
      ✓ should call view.renderHangman() with attempts
      ✓ should call all view updates correctly (1 ms)
    Edge Cases
      ✓ should handle uppercase letters
      ✓ should handle lowercase letters
      ✓ should handle first letter click
      ✓ should handle last letter click (completing word) (1 ms)
      ✓ should handle 6th incorrect guess (defeat)
      ✓ should check victory before defeat
      ✓ should work with empty revealed word (all blanks) (1 ms)
      ✓ should work with fully revealed word
      ✓ should work with partially revealed word
      ✓ should handle 0 failed attempts (1 ms)
      ✓ should handle 6 failed attempts
      ✓ should handle multiple letter clicks correctly
      ✓ should handle restart after victory works (1 ms)
      ✓ should handle restart after defeat works
      ✓ should handle restart mid-game works (1 ms)
    MVC Pattern validation
      ✓ should NOT contain business logic
      ✓ should NOT perform UI rendering
      ✓ should delegate all business logic to Model (1 ms)
      ✓ should delegate all UI updates to View (1 ms)
    Complete game flows
      ✓ should handle complete victory flow
      ✓ should handle complete defeat flow
      ✓ should handle restart flow (1 ms)
      ✓ should handle mixed correct/incorrect guesses flow (1 ms)
    Event handler integration
      ✕ should trigger handleLetterClick when letter clicked
      ✓ should trigger handleRestartClick when restart clicked (1 ms)
      ✕ should attach event handlers during initialization

  ● GameController › initialize › should attach letter click handler

    expect(received).toHaveBeenCalled()

    Matcher error: received value must be a mock or spy function

    Received has value: undefined

      124 |       gameController.initialize();
      125 |       // ASSERT
    > 126 |       expect(mockView.attachLetterClickHandler).toHaveBeenCalled();
          |                                                 ^
      127 |       expect(mockView.attachLetterClickHandler).toHaveBeenCalledWith(expect.any(Function));
      128 |     });
      129 |

      at Object.<anonymous> (tests/controllers/game-controller.test.ts:126:49)

  ● GameController › initialize › should call all initialization steps in correct order

    expect(received).toHaveBeenCalled()

    Matcher error: received value must be a mock or spy function

    Received has value: undefined

      154 |       expect(mockModel.initializeGame).toHaveBeenCalled();
      155 |       expect(mockView.initialize).toHaveBeenCalled();
    > 156 |       expect(mockView.attachLetterClickHandler).toHaveBeenCalled();
          |                                                 ^
      157 |       expect(mockView.attachRestartHandler).toHaveBeenCalled();
      158 |       expect(mockModel.getRevealedWord).toHaveBeenCalled();
      159 |     });

      at Object.<anonymous> (tests/controllers/game-controller.test.ts:156:49)

  ● GameController › Event handler integration › should trigger handleLetterClick when letter clicked

    TypeError: Cannot read properties of undefined (reading 'mockImplementation')

      868 |       // ARRANGE
      869 |       let letterClickHandler: (letter: string) => void = () => {};
    > 870 |       mockView.attachLetterClickHandler.mockImplementation((handler) => {
          |                                         ^
      871 |         letterClickHandler = handler;
      872 |       });
      873 |       mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);

      at Object.<anonymous> (tests/controllers/game-controller.test.ts:870:41)

  ● GameController › Event handler integration › should attach event handlers during initialization

    expect(received).toHaveBeenCalled()

    Matcher error: received value must be a mock or spy function

    Received has value: undefined

      897 |       gameController.initialize();
      898 |       // ASSERT
    > 899 |       expect(mockView.attachLetterClickHandler).toHaveBeenCalled();
          |                                                 ^
      900 |       expect(mockView.attachRestartHandler).toHaveBeenCalled();
      901 |     });
      902 |   });

      at Object.<anonymous> (tests/controllers/game-controller.test.ts:899:49)

Test Suites: 1 failed, 1 total
Tests:       4 failed, 63 passed, 67 total
Snapshots:   0 total
Time:        0.505 s, estimated 1 s
Ran all test suites matching /tests\/controllers\/game-controller.test.ts/i.
```
**Respuesta:**
The failing tests are due to the mock object for `GameView` not having the methods `attachLetterClickHandler` and `attachRestartHandler` defined correctly as mock functions. The error messages indicate that `mockView.attachLetterClickHandler` and `mockView.attachRestartHandler` are `undefined`, which means the `toHaveBeenCalled()` matcher fails because it expects a mock/spy function.
Looking back at the `GameController` source code, the `initialize()` method calls:
1. `this.view.attachAlphabetClickHandler((letter) => this.handleLetterClick(letter));`
2. `this.view.attachRestartHandler(() => this.handleRestartClick());`
The mock object in the test file incorrectly defines `attachLetterClickHandler` instead of `attachAlphabetClickHandler`. This mismatch causes the mock to be undefined when the test tries to assert its calls or use its `mockImplementation`.
Here are the necessary fixes in the test file:
1. **Correct the mock object definition in ****`beforeEach`** to use the correct method names as defined in the `GameView` class (`attachAlphabetClickHandler` and `attachRestartHandler`):
```typescript
    // Create mocked View - CORRECTING THE METHOD NAMES
    mockView = {
      initialize: jest.fn(),
      updateWordBoxes: jest.fn(),
      disableLetter: jest.fn(),
      updateAttemptCounter: jest.fn(),
      renderHangman: jest.fn(),
      showVictoryMessage: jest.fn(),
      showDefeatMessage: jest.fn(),
      showRestartButton: jest.fn(),
      hideRestartButton: jest.fn(),
      reset: jest.fn(),
      // CORRECTED METHOD NAMES: attachAlphabetClickHandler, attachRestartHandler
      attachAlphabetClickHandler: jest.fn(), // WAS: attachLetterClickHandler
      attachRestartHandler: jest.fn(),       // SHOULD BE: attachRestartHandler (this one was correct)
    } as any;

```
*(Note: The original mock had **`attachLetterClickHandler`** which is incorrect according to the **`GameController`** source. The correct method name from **`GameView`** that **`GameController`** calls is **`attachAlphabetClickHandler`**.)*
1. **Update the failing tests** to use the correct mock property name `mockView.attachAlphabetClickHandler`:
```typescript
  describe('initialize', () => {
    // ... other tests ...

    it('should attach letter click handler', () => { // Test name is fine, describes intent
      // ARRANGE & ACT
      gameController.initialize();
      // ASSERT
      // CORRECTED: Use attachAlphabetClickHandler
      expect(mockView.attachAlphabetClickHandler).toHaveBeenCalled();
      expect(mockView.attachAlphabetClickHandler).toHaveBeenCalledWith(expect.any(Function));
    });

    // ... other tests ...

    it('should call all initialization steps in correct order', () => {
      // ARRANGE & ACT
      gameController.initialize();
      // ASSERT: Verify all methods called
      expect(mockModel.initializeGame).toHaveBeenCalled();
      expect(mockView.initialize).toHaveBeenCalled();
      // CORRECTED: Use attachAlphabetClickHandler
      expect(mockView.attachAlphabetClickHandler).toHaveBeenCalled();
      expect(mockView.attachRestartHandler).toHaveBeenCalled();
      expect(mockModel.getRevealedWord).toHaveBeenCalled();
    });
  });

```
1. **Update the failing event handler integration tests** to use the correct mock property name `mockView.attachAlphabetClickHandler`:
```typescript
  describe('Event handler integration', () => {
    // ... other tests ...

    it('should trigger handleLetterClick when letter clicked', () => {
      // ARRANGE
      // CORRECTED: Use attachAlphabetClickHandler
      let letterClickHandler: (letter: string) => void = () => {};
      mockView.attachAlphabetClickHandler.mockImplementation((handler) => { // WAS: attachLetterClickHandler
        letterClickHandler = handler;
      });
      mockModel.guessLetter.mockReturnValue(GuessResult.CORRECT);
      gameController.initialize();
      // ACT: Simulate letter click through attached handler
      letterClickHandler('E');
      // ASSERT
      expect(mockModel.guessLetter).toHaveBeenCalledWith('E');
    });

    // ... other tests ...

    it('should attach event handlers during initialization', () => {
      // ARRANGE & ACT
      gameController.initialize();
      // ASSERT
      // CORRECTED: Use attachAlphabetClickHandler
      expect(mockView.attachAlphabetClickHandler).toHaveBeenCalled(); // WAS: attachLetterClickHandler
      expect(mockView.attachRestartHandler).toHaveBeenCalled();
    });
  });

```
These changes align the mock object definition and the test assertions with the actual method names used in the `GameController` and `GameView` classes.
</content>
</page>