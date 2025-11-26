/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/controllers/game-controller.test.ts
 * @desc Unit tests for the GameController.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

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

    it('should attach letter click handler', () => { // Test name is fine, describes intent
      // ARRANGE & ACT
      gameController.initialize();
      // ASSERT
      // CORRECTED: Use attachAlphabetClickHandler
      expect(mockView.attachAlphabetClickHandler).toHaveBeenCalled();
      expect(mockView.attachAlphabetClickHandler).toHaveBeenCalledWith(expect.any(Function));
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
      // CORRECTED: Use attachAlphabetClickHandler
      expect(mockView.attachAlphabetClickHandler).toHaveBeenCalled(); // WAS: attachLetterClickHandler
      expect(mockView.attachRestartHandler).toHaveBeenCalled();
    });
  });
});
