/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/views/alphabet-display.test.ts
 * @desc Unit tests for the AlphabetDisplay view.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {AlphabetDisplay} from '@views/alphabet-display';

describe('AlphabetDisplay', () => {
  let container: HTMLElement;
  let alphabetDisplay: AlphabetDisplay;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="alphabet-container"></div>';
    container = document.getElementById('alphabet-container')!;
    
    // Create AlphabetDisplay instance
    alphabetDisplay = new AlphabetDisplay('alphabet-container');
  });

  afterEach(() => {
    // Cleanup DOM
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with valid container ID', () => {
      // ARRANGE: DOM setup in beforeEach
      
      // ACT
      const display = new AlphabetDisplay('alphabet-container');
      
      // ASSERT
      expect(display).toBeDefined();
      expect(display).toBeInstanceOf(AlphabetDisplay);
    });

    it('should store reference to container element', () => {
      // ARRANGE & ACT
      const display = new AlphabetDisplay('alphabet-container');
      
      // ASSERT
      // We can't directly access private container, but we can verify it's working
      // by rendering and checking that it affects the correct DOM element
      display.render();
      expect(container.querySelectorAll('.letter-button').length).toBe(26);
    });

    it('should initialize empty letterButtons Map', () => {
      // ARRANGE & ACT
      const display = new AlphabetDisplay('alphabet-container');
      
      // ASSERT
      // We can't directly access private letterButtons, but we can verify initial state
      // by rendering and checking that no buttons exist initially
      expect(container.children.length).toBe(0);
    });

    it('should throw error when container not found', () => {
      // ARRANGE: No container with ID 'invalid-id'
      
      // ACT & ASSERT
      expect(() => new AlphabetDisplay('invalid-id')).toThrow();
      expect(() => new AlphabetDisplay('invalid-id')).toThrow('not found');
    });

    it('should throw error with descriptive message including container ID', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => new AlphabetDisplay('missing-container')).toThrow('Element with id "missing-container" not found');
    });
  });

  describe('render', () => {
    it('should create exactly 26 letter buttons', () => {
      // ARRANGE: alphabetDisplay already created
      
      // ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = container.querySelectorAll('.letter-button');
      expect(buttons.length).toBe(26);
    });

    it('should create buttons with correct letters A-Z', () => {
      // ARRANGE
      const expectedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      
      // ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      buttons.forEach((button, index) => {
        expect(button.textContent).toBe(expectedLetters[index]);
      });
    });

    it('should create buttons with type="button"', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = container.querySelectorAll('button.letter-button');
      buttons.forEach(button => {
        expect((button as HTMLButtonElement).type).toBe('button');
      });
    });

    it('should create buttons with correct CSS class', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = container.querySelectorAll('.letter-button');
      buttons.forEach(button => {
        expect(button.classList.contains('letter-button')).toBe(true);
      });
    });

    it('should create buttons in alphabetical order', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const letters = buttons.map(button => button.textContent).join('');
      expect(letters).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('should clear previous buttons before rendering', () => {
      // ARRANGE: Render first time
      alphabetDisplay.render();
      expect(container.querySelectorAll('.letter-button').length).toBe(26);
      
      // ACT: Render second time
      alphabetDisplay.render();
      
      // ASSERT: Should still have exactly 26 buttons (not 52)
      const buttons = container.querySelectorAll('.letter-button');
      expect(buttons.length).toBe(26);
    });

    it('should clear letterButtons Map before rendering', () => {
      // ARRANGE: Render once
      alphabetDisplay.render();
      alphabetDisplay.disableLetter('A'); // This would populate the map
      
      // ACT: Render again
      alphabetDisplay.render();
      
      // ASSERT: Should have fresh state after second render
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      buttons.forEach(button => {
        expect((button as HTMLButtonElement).disabled).toBe(false);
      });
    });

    it('should render buttons in order A to Z', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      for (let i = 0; i < 26; i++) {
        expect(buttons[i].textContent).toBe(String.fromCharCode(65 + i)); // A=65, B=66, etc.
      }
    });

    it('should create buttons as HTMLButtonElement instances', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      buttons.forEach(button => {
        expect(button).toBeInstanceOf(HTMLButtonElement);
      });
    });

    it('should create buttons with aria-label attribute', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      buttons.forEach(button => {
        expect(button.getAttribute('aria-label')).toBe(`Letter ${button.textContent}`);
      });
    });

    it('should handle multiple render calls correctly', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      expect(container.querySelectorAll('.letter-button').length).toBe(26);
      
      alphabetDisplay.render();
      expect(container.querySelectorAll('.letter-button').length).toBe(26);
      
      alphabetDisplay.render();
      expect(container.querySelectorAll('.letter-button').length).toBe(26);
      
      // ASSERT: Still exactly 26 buttons after multiple renders
      const buttons = container.querySelectorAll('.letter-button');
      expect(buttons.length).toBe(26);
    });
  });

  describe('disableLetter', () => {
    beforeEach(() => {
      // Render buttons before each test
      alphabetDisplay.render();
    });

    it('should disable specific letter button', () => {
      // ARRANGE: All buttons enabled initially
      
      // ACT
      alphabetDisplay.disableLetter('E');
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      expect(eButton.disabled).toBe(true);
    });

    it('should normalize lowercase letter to uppercase', () => {
      // ARRANGE & ACT
      alphabetDisplay.disableLetter('e');
      
      // ASSERT: Should disable 'E' button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      expect(eButton.disabled).toBe(true);
    });

    it('should only disable specified letter, not others', () => {
      // ARRANGE & ACT
      alphabetDisplay.disableLetter('E');
      
      // ASSERT: E disabled, A still enabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      
      expect(eButton.disabled).toBe(true);
      expect(aButton.disabled).toBe(false);
    });

    it('should be idempotent when disabling already disabled button', () => {
      // ARRANGE: Disable once
      alphabetDisplay.disableLetter('E');
      
      // ACT: Disable again (should not throw)
      expect(() => alphabetDisplay.disableLetter('E')).not.toThrow();
      
      // ASSERT: Still disabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      expect(eButton.disabled).toBe(true);
    });

    it('should disable letter when given lowercase input', () => {
      // ARRANGE & ACT
      alphabetDisplay.disableLetter('z');
      
      // ASSERT: Should disable 'Z' button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const zButton = buttons.find(b => b.textContent === 'Z') as HTMLButtonElement;
      expect(zButton.disabled).toBe(true);
    });

    it('should disable letter when given uppercase input', () => {
      // ARRANGE & ACT
      alphabetDisplay.disableLetter('Z');
      
      // ASSERT: Should disable 'Z' button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const zButton = buttons.find(b => b.textContent === 'Z') as HTMLButtonElement;
      expect(zButton.disabled).toBe(true);
    });

    it('should not throw error when disabling letter that is not in the alphabet', () => {
      // ARRANGE: Try to disable a non-alphabet character (should be handled gracefully)
      
      // ACT & ASSERT: Should not throw, even if letter doesn't exist
      expect(() => alphabetDisplay.disableLetter('1')).not.toThrow();
      expect(() => alphabetDisplay.disableLetter('@')).not.toThrow();
    });

    it('should not affect other letters when disabling one', () => {
      // ARRANGE: Disable multiple letters
      alphabetDisplay.disableLetter('A');
      alphabetDisplay.disableLetter('C');
      
      // ACT: Disable another letter
      alphabetDisplay.disableLetter('E');
      
      // ASSERT: Only the specified letters are disabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      const cButton = buttons.find(b => b.textContent === 'C') as HTMLButtonElement;
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      const bButton = buttons.find(b => b.textContent === 'B') as HTMLButtonElement;
      
      expect(aButton.disabled).toBe(true);
      expect(cButton.disabled).toBe(true);
      expect(eButton.disabled).toBe(true);
      expect(bButton.disabled).toBe(false);
    });

    it('should handle disabling first letter (A)', () => {
      // ARRANGE & ACT
      alphabetDisplay.disableLetter('A');
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      expect(aButton.disabled).toBe(true);
    });

    it('should handle disabling last letter (Z)', () => {
      // ARRANGE & ACT
      alphabetDisplay.disableLetter('Z');
      
      // ASSERT
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const zButton = buttons.find(b => b.textContent === 'Z') as HTMLButtonElement;
      expect(zButton.disabled).toBe(true);
    });
  });

  describe('enableAllLetters', () => {
    beforeEach(() => {
      alphabetDisplay.render();
    });

    it('should enable all 26 buttons', () => {
      // ARRANGE: Disable some buttons first
      alphabetDisplay.disableLetter('E');
      alphabetDisplay.disableLetter('A');
      alphabetDisplay.disableLetter('T');
      
      // ACT
      alphabetDisplay.enableAllLetters();
      
      // ASSERT: All buttons should be enabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      buttons.forEach(button => {
        expect((button as HTMLButtonElement).disabled).toBe(false);
      });
    });

    it('should work when no buttons are disabled', () => {
      // ARRANGE: All buttons enabled
      
      // ACT (should not throw)
      expect(() => alphabetDisplay.enableAllLetters()).not.toThrow();
      
      // ASSERT: All still enabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      buttons.forEach(button => {
        expect((button as HTMLButtonElement).disabled).toBe(false);
      });
    });

    it('should work when all buttons are disabled', () => {
      // ARRANGE: Disable all buttons
      for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        alphabetDisplay.disableLetter(letter);
      }
      
      // Verify all are disabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      expect(buttons.every(b => (b as HTMLButtonElement).disabled)).toBe(true);
      
      // ACT
      alphabetDisplay.enableAllLetters();
      
      // ASSERT: All should be enabled
      expect(buttons.every(b => !(b as HTMLButtonElement).disabled)).toBe(true);
    });

    it('should work when some buttons are disabled', () => {
      // ARRANGE: Disable some buttons
      alphabetDisplay.disableLetter('A');
      alphabetDisplay.disableLetter('M');
      alphabetDisplay.disableLetter('Z');
      
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const initialDisabledCount = buttons.filter(b => (b as HTMLButtonElement).disabled).length;
      expect(initialDisabledCount).toBe(3);
      
      // ACT
      alphabetDisplay.enableAllLetters();
      
      // ASSERT: All should be enabled
      const finalButtons = Array.from(container.querySelectorAll('.letter-button'));
      expect(finalButtons.every(b => !(b as HTMLButtonElement).disabled)).toBe(true);
    });

    it('should be idempotent when all buttons are already enabled', () => {
      // ARRANGE: All buttons already enabled
      
      // ACT: Enable all again
      alphabetDisplay.enableAllLetters();
      
      // ASSERT: All still enabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      expect(buttons.every(b => !(b as HTMLButtonElement).disabled)).toBe(true);
    });

    it('should enable all buttons regardless of previous state', () => {
      // ARRANGE: Mix of enabled and disabled buttons
      alphabetDisplay.disableLetter('A');
      alphabetDisplay.disableLetter('C');
      alphabetDisplay.disableLetter('E');
      // B, D, F... still enabled
      
      // ACT
      alphabetDisplay.enableAllLetters();
      
      // ASSERT: All buttons should be enabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      expect(buttons.every(b => !(b as HTMLButtonElement).disabled)).toBe(true);
    });
  });

  describe('attachClickHandler', () => {
    beforeEach(() => {
      alphabetDisplay.render();
    });

    it('should call handler when button is clicked', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      alphabetDisplay.attachClickHandler(mockHandler);
      
      // ACT: Click a button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      eButton.click();
      
      // ASSERT
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith('E');
    });

    it('should pass correct letter to handler', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      alphabetDisplay.attachClickHandler(mockHandler);
      
      // ACT: Click different buttons
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      const zButton = buttons.find(b => b.textContent === 'Z') as HTMLButtonElement;
      
      aButton.click();
      zButton.click();
      
      // ASSERT
      expect(mockHandler).toHaveBeenCalledTimes(2);
      expect(mockHandler).toHaveBeenNthCalledWith(1, 'A');
      expect(mockHandler).toHaveBeenNthCalledWith(2, 'Z');
    });

    it('should not call handler for disabled button', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      alphabetDisplay.attachClickHandler(mockHandler);
      alphabetDisplay.disableLetter('E');
      
      // ACT: Try to click disabled button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      eButton.click();
      
      // ASSERT: Handler should not be called (disabled button blocks click)
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should pass uppercase letter to handler', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      alphabetDisplay.attachClickHandler(mockHandler);
      
      // ACT: Click any button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const mButton = buttons.find(b => b.textContent === 'M') as HTMLButtonElement;
      mButton.click();
      
      // ASSERT
      expect(mockHandler).toHaveBeenCalledWith('M'); // Uppercase
    });

    it('should attach handler to all 26 buttons', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      alphabetDisplay.attachClickHandler(mockHandler);
      
      // ACT: Click all buttons (or at least several)
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      // Click first 5 buttons as a sample
      for (let i = 0; i < 5; i++) {
        buttons[i].click();
      }
      
      // ASSERT: Handler should be called 5 times
      expect(mockHandler).toHaveBeenCalledTimes(5);
    });

    it('should work with multiple different letters', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      alphabetDisplay.attachClickHandler(mockHandler);
      
      // ACT: Click several different letters
      const lettersToClick = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      lettersToClick.forEach(letter => {
        const button = Array.from(container.querySelectorAll('.letter-button'))
          .find(b => b.textContent === letter) as HTMLButtonElement;
        button.click();
      });
      
      // ASSERT: Handler called for each letter
      expect(mockHandler).toHaveBeenCalledTimes(lettersToClick.length);
      lettersToClick.forEach((letter, index) => {
        expect(mockHandler).toHaveBeenNthCalledWith(index + 1, letter);
      });
    });

    it('should continue working after a letter is disabled', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      alphabetDisplay.attachClickHandler(mockHandler);
      
      // ACT: Click one button, then disable it, then click another
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      const bButton = buttons.find(b => b.textContent === 'B') as HTMLButtonElement;
      
      aButton.click();
      alphabetDisplay.disableLetter('A');
      bButton.click();
      
      // ASSERT: Only the enabled button should trigger the handler
      expect(mockHandler).toHaveBeenCalledTimes(2);
      expect(mockHandler).toHaveBeenNthCalledWith(1, 'A');
      expect(mockHandler).toHaveBeenNthCalledWith(2, 'B');
    });
  });

  describe('Edge Cases', () => {
    it('should handle render after constructor without error', () => {
      // ARRANGE: Fresh instance
      
      // ACT & ASSERT
      expect(() => alphabetDisplay.render()).not.toThrow();
      expect(container.querySelectorAll('.letter-button').length).toBe(26);
    });

    it('should handle disableLetter before render (no error)', () => {
      // ARRANGE: Fresh instance, no render yet
      const freshDisplay = new AlphabetDisplay('alphabet-container');
      
      // ACT & ASSERT: Should not throw, even though no buttons exist yet
      expect(() => freshDisplay.disableLetter('A')).not.toThrow();
    });

    it('should handle enableAllLetters before render (no error)', () => {
      // ARRANGE: Fresh instance, no render yet
      
      // ACT & ASSERT: Should not throw
      expect(() => alphabetDisplay.enableAllLetters()).not.toThrow();
    });

    it('should handle attachClickHandler before render (no error)', () => {
      // ARRANGE: Fresh instance, no render yet
      
      // ACT & ASSERT: Should not throw
      expect(() => alphabetDisplay.attachClickHandler(() => {})).not.toThrow();
      // The handler won't be called until after render, which is expected
    });

    it('should handle multiple click handlers attached', () => {
      // ARRANGE
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      alphabetDisplay.render();
      alphabetDisplay.attachClickHandler(handler1);
      alphabetDisplay.attachClickHandler(handler2);
      
      // ACT: Click a button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      aButton.click();
      
      // ASSERT: Both handlers should be called
      expect(handler1).toHaveBeenCalledWith('A');
      expect(handler2).toHaveBeenCalledWith('A');
    });

    it('should normalize case consistently for all operations', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT: Use lowercase for disable
      alphabetDisplay.disableLetter('e');
      
      // ASSERT: Should affect the 'E' button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      expect(eButton.disabled).toBe(true);
    });

    it('should maintain alphabetical order after multiple operations', () => {
      // ARRANGE
      alphabetDisplay.render();
      alphabetDisplay.disableLetter('E');
      alphabetDisplay.disableLetter('A');
      
      // ACT: Enable all letters
      alphabetDisplay.enableAllLetters();
      
      // ASSERT: Still in alphabetical order
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const letters = buttons.map(b => b.textContent).join('');
      expect(letters).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('should handle case normalization consistently in Map keys', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT: Disable with lowercase
      alphabetDisplay.disableLetter('z');
      
      // ASSERT: Should disable the 'Z' button (uppercase key in Map)
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const zButton = buttons.find(b => b.textContent === 'Z') as HTMLButtonElement;
      expect(zButton.disabled).toBe(true);
    });

    it('should handle empty string in disableLetter gracefully', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT & ASSERT: Should not throw
      expect(() => alphabetDisplay.disableLetter('')).not.toThrow();
    });

    it('should handle special characters in disableLetter gracefully', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT & ASSERT: Should not throw for special characters
      expect(() => alphabetDisplay.disableLetter('!')).not.toThrow();
      expect(() => alphabetDisplay.disableLetter('1')).not.toThrow();
    });

    it('should handle multi-character string in disableLetter gracefully', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT & ASSERT: Should not throw for multi-character strings
      expect(() => alphabetDisplay.disableLetter('AB')).not.toThrow();
    });
  });

  describe('Map Integrity', () => {
    it('should have exactly 26 entries in letterButtons Map after render', () => {
      // ARRANGE & ACT
      alphabetDisplay.render();
      
      // ASSERT: We can't directly access the private Map, but we can verify through behavior
      // If render creates 26 buttons and each can be disabled, the Map should have 26 entries
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      expect(buttons.length).toBe(26);
      
      // Test that each letter A-Z can be disabled independently
      for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        expect(() => alphabetDisplay.disableLetter(letter)).not.toThrow();
      }
    });

    it('should have uppercase letters as Map keys (through behavior test)', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT: Disable with lowercase
      alphabetDisplay.disableLetter('e');
      
      // ASSERT: Should affect the same button as uppercase 'E'
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      expect(eButton.disabled).toBe(true);
    });

    it('should not have duplicate keys in Map (through behavior test)', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT: Try to disable the same letter multiple times with different cases
      alphabetDisplay.disableLetter('A');
      alphabetDisplay.disableLetter('a');
      alphabetDisplay.disableLetter('A');
      
      // ASSERT: Should still only affect one button
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      expect(aButton.disabled).toBe(true);
    });

    it('should clear Map when render is called again', () => {
      // ARRANGE: Render and disable some letters
      alphabetDisplay.render();
      alphabetDisplay.disableLetter('A');
      alphabetDisplay.disableLetter('B');
      
      // ACT: Render again
      alphabetDisplay.render();
      
      // ASSERT: Should have fresh state (all buttons enabled)
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      expect(buttons.every(b => !(b as HTMLButtonElement).disabled)).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should work with standard container ID "alphabet-container"', () => {
      // ARRANGE: DOM already has alphabet-container
      
      // ACT
      const display = new AlphabetDisplay('alphabet-container');
      display.render();
      
      // ASSERT
      expect(container.querySelectorAll('.letter-button').length).toBe(26);
    });

    it('should support typical game flow: render → attachClickHandler → click → disableLetter', () => {
      // ARRANGE: Fresh display
      const mockHandler = jest.fn();
      
      // ACT: Typical game flow
      alphabetDisplay.render();
      alphabetDisplay.attachClickHandler(mockHandler);
      
      // Simulate player clicking 'E'
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      eButton.click();
      
      // Controller calls disableLetter after processing
      alphabetDisplay.disableLetter('E');
      
      // ASSERT: Handler was called with correct letter
      expect(mockHandler).toHaveBeenCalledWith('E');
      
      // ASSERT: Button is now disabled
      expect(eButton.disabled).toBe(true);
    });

    it('should support restart flow: disableLetter × N → enableAllLetters', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      // ACT: Disable several letters
      alphabetDisplay.disableLetter('A');
      alphabetDisplay.disableLetter('E');
      alphabetDisplay.disableLetter('I');
      alphabetDisplay.disableLetter('O');
      alphabetDisplay.disableLetter('U');
      
      // Verify they are disabled
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const disabledCount = buttons.filter(b => (b as HTMLButtonElement).disabled).length;
      expect(disabledCount).toBe(5);
      
      // Restart: Enable all
      alphabetDisplay.enableAllLetters();
      
      // ASSERT: All buttons are enabled again
      const allEnabled = buttons.every(b => !(b as HTMLButtonElement).disabled);
      expect(allEnabled).toBe(true);
    });

    it('should work with multiple AlphabetDisplay instances (different containers)', () => {
      // ARRANGE: Create another container
      const container2 = document.createElement('div');
      container2.id = 'alphabet-container-2';
      document.body.appendChild(container2);
      
      // ACT: Create two displays
      const display1 = new AlphabetDisplay('alphabet-container');
      const display2 = new AlphabetDisplay('alphabet-container-2');
      
      // Render both
      display1.render();
      display2.render();
      
      // Disable on first display
      display1.disableLetter('A');
      
      // ASSERT: Each display manages its own buttons
      const buttons1 = Array.from(container.querySelectorAll('.letter-button'));
      const buttons2 = Array.from(container2.querySelectorAll('.letter-button'));
      
      expect(buttons1.length).toBe(26);
      expect(buttons2.length).toBe(26);
      
      // Only first display should have 'A' disabled
      const aButton1 = buttons1.find(b => b.textContent === 'A') as HTMLButtonElement;
      const aButton2 = buttons2.find(b => b.textContent === 'A') as HTMLButtonElement;
      
      expect(aButton1.disabled).toBe(true);
      expect(aButton2.disabled).toBe(false);
    });

    it('should handle container with existing content', () => {
      // ARRANGE: Container has existing content
      const existingDiv = document.createElement('div');
      existingDiv.id = 'existing';
      container.appendChild(existingDiv);
      expect(container.children.length).toBe(1);
      
      // ACT: Render alphabet display
      alphabetDisplay.render();
      
      // ASSERT: Existing content should be cleared
      expect(container.children.length).toBe(26);
      expect(container.querySelector('#existing')).toBeNull();
      
      // All children should be letter buttons
      const buttons = Array.from(container.children);
      buttons.forEach(button => {
        expect((button as HTMLButtonElement).classList.contains('letter-button')).toBe(true);
      });
    });

    it('should support multiple click handlers working together', () => {
      // ARRANGE
      alphabetDisplay.render();
      
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      // ACT: Attach multiple handlers
      alphabetDisplay.attachClickHandler(handler1);
      alphabetDisplay.attachClickHandler(handler2);
      
      // Simulate click
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const aButton = buttons.find(b => b.textContent === 'A') as HTMLButtonElement;
      aButton.click();
      
      // ASSERT: Both handlers called with same letter
      expect(handler1).toHaveBeenCalledWith('A');
      expect(handler2).toHaveBeenCalledWith('A');
    });

    it('should work with controller that processes clicks and disables letters', () => {
      // ARRANGE: Simulate controller behavior
      alphabetDisplay.render();
      
      const clickedLetters: string[] = [];
      alphabetDisplay.attachClickHandler((letter) => {
        clickedLetters.push(letter);
        // Simulate controller processing and disabling the letter
        alphabetDisplay.disableLetter(letter);
      });
      
      // ACT: Simulate multiple clicks
      const buttons = Array.from(container.querySelectorAll('.letter-button'));
      const eButton = buttons.find(b => b.textContent === 'E') as HTMLButtonElement;
      const tButton = buttons.find(b => b.textContent === 'T') as HTMLButtonElement;
      
      eButton.click();
      tButton.click();
      
      // ASSERT: Letters were processed and buttons disabled
      expect(clickedLetters).toEqual(['E', 'T']);
      
      expect(eButton.disabled).toBe(true);
      expect(tButton.disabled).toBe(true);
    });
  });
});