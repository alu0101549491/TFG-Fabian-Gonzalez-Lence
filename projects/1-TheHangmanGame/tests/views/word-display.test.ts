/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/views/word-display.test.ts
 * @desc Unit tests for the WordDisplay view.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {WordDisplay} from '@views/word-display';

describe('WordDisplay', () => {
  let container: HTMLElement;
  let wordDisplay: WordDisplay;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="word-container"></div>';
    container = document.getElementById('word-container')!;
    
    // Create WordDisplay instance
    wordDisplay = new WordDisplay('word-container');
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
      const display = new WordDisplay('word-container');
      
      // ASSERT
      expect(display).toBeDefined();
      expect(display).toBeInstanceOf(WordDisplay);
    });

    it('should store reference to container element', () => {
      // ARRANGE & ACT
      const display = new WordDisplay('word-container');
      
      // ASSERT
      // We can't directly access private container, but we can verify it's working
      // by rendering and checking that it affects the correct DOM element
      display.render(3);
      expect(container.children.length).toBe(3);
    });

    it('should initialize empty letterBoxes array', () => {
      // ARRANGE & ACT
      const display = new WordDisplay('word-container');
      
      // ASSERT
      // We can't directly access private letterBoxes, but we can verify initial state
      // by rendering and checking that no boxes exist initially
      expect(container.children.length).toBe(0);
    });

    it('should throw error when container not found', () => {
      // ARRANGE: No container with ID 'invalid-id'
      
      // ACT & ASSERT
      expect(() => new WordDisplay('invalid-id')).toThrow();
      expect(() => new WordDisplay('invalid-id')).toThrow('not found');
    });

    it('should throw error with descriptive message including container ID', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => new WordDisplay('missing-container')).toThrow('Element with id "missing-container" not found');
    });
  });

  describe('render', () => {
    it('should create correct number of letter boxes', () => {
      // ARRANGE: wordDisplay already created
      const wordLength = 8; // ELEPHANT
      
      // ACT
      wordDisplay.render(wordLength);
      
      // ASSERT
      const boxes = container.querySelectorAll('.letter-box');
      expect(boxes.length).toBe(wordLength);
    });

    it('should create boxes with correct CSS class', () => {
      // ARRANGE
      const wordLength = 5;
      
      // ACT
      wordDisplay.render(wordLength);
      
      // ASSERT
      const boxes = container.querySelectorAll('.letter-box');
      boxes.forEach(box => {
        expect(box.classList.contains('letter-box')).toBe(true);
      });
    });

    it('should create boxes as div elements', () => {
      // ARRANGE
      const wordLength = 3;
      
      // ACT
      wordDisplay.render(wordLength);
      
      // ASSERT
      const boxes = container.querySelectorAll('.letter-box');
      boxes.forEach(box => {
        expect(box.tagName.toLowerCase()).toBe('div');
      });
    });

    it('should clear previous boxes before rendering new ones', () => {
      // ARRANGE: Render boxes first time
      wordDisplay.render(5);
      expect(container.children.length).toBe(5);
      
      // ACT: Render different number of boxes
      wordDisplay.render(3);
      
      // ASSERT: Should only have 3 boxes now
      expect(container.children.length).toBe(3);
    });

    it('should create boxes with initially empty content', () => {
      // ARRANGE
      const wordLength = 4;
      
      // ACT
      wordDisplay.render(wordLength);
      
      // ASSERT
      const boxes = container.querySelectorAll('.letter-box');
      boxes.forEach(box => {
        expect(box.textContent).toBe('');
      });
    });

    it('should handle wordLength of 0 (no boxes created)', () => {
      // ARRANGE & ACT
      wordDisplay.render(0);
      
      // ASSERT
      expect(container.children.length).toBe(0);
    });

    it('should handle wordLength of 1 (single box)', () => {
      // ARRANGE & ACT
      wordDisplay.render(1);
      
      // ASSERT
      expect(container.children.length).toBe(1);
      expect(container.children[0].classList.contains('letter-box')).toBe(true);
    });

    it('should handle large wordLength', () => {
      // ARRANGE
      const largeLength = 15;
      
      // ACT
      wordDisplay.render(largeLength);
      
      // ASSERT
      expect(container.children.length).toBe(largeLength);
      const boxes = container.querySelectorAll('.letter-box');
      expect(boxes.length).toBe(largeLength);
    });

    it('should clear container before rendering', () => {
      // ARRANGE: Add some content to container first
      container.innerHTML = '<div>existing content</div>';
      expect(container.children.length).toBe(1);
      
      // ACT
      wordDisplay.render(3);
      
      // ASSERT: Should have only the new boxes
      expect(container.children.length).toBe(3);
      expect(container.querySelector('div:not(.letter-box)')).toBeNull();
    });

    it('should render boxes in batch using DocumentFragment', () => {
      // ARRANGE
      const wordLength = 5;
      
      // ACT
      wordDisplay.render(wordLength);
      
      // ASSERT: All boxes should be present
      expect(container.children.length).toBe(wordLength);
      const boxes = Array.from(container.children) as HTMLElement[];
      boxes.forEach(box => {
        expect(box.classList.contains('letter-box')).toBe(true);
      });
    });

    it('should reset letterBoxes array each time render is called', () => {
      // ARRANGE: Render once and update some boxes
      wordDisplay.render(5);
      wordDisplay.updateBox(0, 'A');
      wordDisplay.updateBox(1, 'B');
      expect((container.children[0] as HTMLElement).textContent).toBe('A');
      
      // ACT: Render again with different length
      wordDisplay.render(3);
      
      // ASSERT: Should have new boxes and old state should be cleared
      expect(container.children.length).toBe(3);
      const newBoxes = Array.from(container.children) as HTMLElement[];
      newBoxes.forEach(box => {
        expect(box.textContent).toBe('');
      });
    });
  });

  describe('updateBox', () => {
    beforeEach(() => {
      // Render 8 boxes for ELEPHANT
      wordDisplay.render(8);
    });

    it('should update box at specific index with letter', () => {
      // ARRANGE: boxes already rendered
      
      // ACT
      wordDisplay.updateBox(0, 'E');
      
      // ASSERT
      const box = container.children[0] as HTMLElement;
      expect(box.textContent).toBe('E');
    });

    it('should convert lowercase letter to uppercase', () => {
      // ARRANGE
      
      // ACT
      wordDisplay.updateBox(0, 'e');
      
      // ASSERT
      const box = container.children[0] as HTMLElement;
      expect(box.textContent).toBe('E');
    });

    it('should update correct box when multiple boxes exist', () => {
      // ARRANGE: 8 boxes rendered
      
      // ACT: Update boxes at different indices
      wordDisplay.updateBox(0, 'E');
      wordDisplay.updateBox(2, 'E');
      wordDisplay.updateBox(4, 'H');
      
      // ASSERT
      expect((container.children[0] as HTMLElement).textContent).toBe('E');
      expect((container.children[1] as HTMLElement).textContent).toBe('');
      expect((container.children[2] as HTMLElement).textContent).toBe('E');
      expect((container.children[3] as HTMLElement).textContent).toBe('');
      expect((container.children[4] as HTMLElement).textContent).toBe('H');
    });

    it('should update box with empty string (clears box)', () => {
      // ARRANGE: Update a box first
      wordDisplay.updateBox(0, 'E');
      expect((container.children[0] as HTMLElement).textContent).toBe('E');
      
      // ACT: Update with empty string
      wordDisplay.updateBox(0, '');
      
      // ASSERT
      expect((container.children[0] as HTMLElement).textContent).toBe('');
    });

    it('should throw error when index is negative', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => wordDisplay.updateBox(-1, 'A')).toThrow('Index -1 is out of bounds');
    });

    it('should throw error when index is out of bounds (too high)', () => {
      // ARRANGE: 8 boxes rendered, so valid indices are 0-7
      
      // ACT & ASSERT
      expect(() => wordDisplay.updateBox(8, 'A')).toThrow('Index 8 is out of bounds');
      expect(() => wordDisplay.updateBox(10, 'A')).toThrow('Index 10 is out of bounds');
    });

    it('should throw error when index equals array length', () => {
      // ARRANGE: 8 boxes rendered
      
      // ACT & ASSERT
      expect(() => wordDisplay.updateBox(8, 'A')).toThrow('Index 8 is out of bounds');
    });

    it('should handle multiple updates to same index', () => {
      // ARRANGE
      
      // ACT: Update same index multiple times
      wordDisplay.updateBox(0, 'A');
      wordDisplay.updateBox(0, 'B');
      wordDisplay.updateBox(0, 'C');
      
      // ASSERT
      expect((container.children[0] as HTMLElement).textContent).toBe('C');
    });

    it('should update last valid index correctly', () => {
      // ARRANGE: 8 boxes, so last valid index is 7
      
      // ACT
      wordDisplay.updateBox(7, 'T');
      
      // ASSERT
      expect((container.children[7] as HTMLElement).textContent).toBe('T');
    });

    it('should update first valid index correctly', () => {
      // ARRANGE: 8 boxes, so first valid index is 0
      
      // ACT
      wordDisplay.updateBox(0, 'E');
      
      // ASSERT
      expect((container.children[0] as HTMLElement).textContent).toBe('E');
    });

    it('should handle single character letters', () => {
      // ARRANGE
      
      // ACT
      wordDisplay.updateBox(0, 'A');
      wordDisplay.updateBox(1, 'B');
      wordDisplay.updateBox(2, 'Z');
      
      // ASSERT
      expect((container.children[0] as HTMLElement).textContent).toBe('A');
      expect((container.children[1] as HTMLElement).textContent).toBe('B');
      expect((container.children[2] as HTMLElement).textContent).toBe('Z');
    });

    it('should not affect other boxes when updating one box', () => {
      // ARRANGE: Update some boxes
      wordDisplay.updateBox(0, 'A');
      wordDisplay.updateBox(2, 'C');
      expect((container.children[0] as HTMLElement).textContent).toBe('A');
      expect((container.children[2] as HTMLElement).textContent).toBe('C');
      
      // ACT: Update a different box
      wordDisplay.updateBox(1, 'B');
      
      // ASSERT: Other boxes should remain unchanged
      expect((container.children[0] as HTMLElement).textContent).toBe('A');
      expect((container.children[1] as HTMLElement).textContent).toBe('B');
      expect((container.children[2] as HTMLElement).textContent).toBe('C');
    });
  });

  describe('reset', () => {
    it('should clear all boxes from container', () => {
      // ARRANGE: Render and update some boxes
      wordDisplay.render(5);
      wordDisplay.updateBox(0, 'E');
      expect(container.children.length).toBe(5);
      
      // ACT
      wordDisplay.reset();
      
      // ASSERT
      expect(container.innerHTML).toBe('');
      expect(container.children.length).toBe(0);
    });

    it('should clear letterBoxes array', () => {
      // ARRANGE: Render boxes
      wordDisplay.render(3);
      expect(container.children.length).toBe(3);
      
      // ACT
      wordDisplay.reset();
      
      // ASSERT: Should be empty now
      expect(container.children.length).toBe(0);
    });

    it('should allow rendering after reset', () => {
      // ARRANGE: Render, then reset
      wordDisplay.render(5);
      wordDisplay.reset();
      
      // ACT: Render again
      wordDisplay.render(3);
      
      // ASSERT
      expect(container.children.length).toBe(3);
    });

    it('should allow updateBox after reset and re-render', () => {
      // ARRANGE: Render, reset, render again
      wordDisplay.render(3);
      wordDisplay.reset();
      wordDisplay.render(2);
      
      // ACT: Update a box after reset
      wordDisplay.updateBox(0, 'X');
      
      // ASSERT
      expect((container.children[0] as HTMLElement).textContent).toBe('X');
    });

    it('should reset to empty state (ready for new render)', () => {
      // ARRANGE: Create a full game state
      wordDisplay.render(8);
      for (let i = 0; i < 8; i++) {
        wordDisplay.updateBox(i, String.fromCharCode(65 + i)); // A, B, C...
      }
      
      // ACT: Reset
      wordDisplay.reset();
      
      // ASSERT: Should be completely empty
      expect(container.innerHTML).toBe('');
      expect(container.children.length).toBe(0);
    });

    it('should handle multiple reset calls safely', () => {
      // ARRANGE
      
      // ACT: Reset multiple times
      wordDisplay.reset();
      wordDisplay.reset();
      wordDisplay.reset();
      
      // ASSERT: Should not throw errors
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle render after constructor without error', () => {
      // ARRANGE: Fresh instance
      
      // ACT & ASSERT
      expect(() => wordDisplay.render(5)).not.toThrow();
      expect(container.children.length).toBe(5);
    });

    it('should handle updateBox on empty container (before render)', () => {
      // ARRANGE: Fresh instance, no render yet
      const freshDisplay = new WordDisplay('word-container');
      
      // ACT & ASSERT
      expect(() => freshDisplay.updateBox(0, 'A')).toThrow('Index 0 is out of bounds');
    });

    it('should handle reset on empty container', () => {
      // ARRANGE: Fresh instance
      
      // ACT & ASSERT
      expect(() => wordDisplay.reset()).not.toThrow();
      expect(container.innerHTML).toBe('');
    });

    it('should handle render with large word lengths', () => {
      // ARRANGE
      const largeLength = 20;
      
      // ACT
      wordDisplay.render(largeLength);
      
      // ASSERT
      expect(container.children.length).toBe(largeLength);
      const boxes = container.querySelectorAll('.letter-box');
      expect(boxes.length).toBe(largeLength);
    });

    it('should handle multiple render calls with different lengths', () => {
      // ARRANGE
      
      // ACT: Render different sizes multiple times
      wordDisplay.render(3);
      expect(container.children.length).toBe(3);
      
      wordDisplay.render(7);
      expect(container.children.length).toBe(7);
      
      wordDisplay.render(2);
      expect(container.children.length).toBe(2);
      
      wordDisplay.render(10);
      expect(container.children.length).toBe(10);
      
      // ASSERT: Last render should be the current state
      expect(container.children.length).toBe(10);
    });

    it('should handle updates after multiple renders', () => {
      // ARRANGE: Render, then render again with different length
      wordDisplay.render(5);
      wordDisplay.render(3); // Now only 3 boxes exist
      
      // ACT: Update within new bounds
      wordDisplay.updateBox(0, 'A');
      wordDisplay.updateBox(2, 'C');
      
      // ASSERT
      expect((container.children[0] as HTMLElement).textContent).toBe('A');
      expect((container.children[2] as HTMLElement).textContent).toBe('C');
      
      // Should fail for old bounds
      expect(() => wordDisplay.updateBox(4, 'E')).toThrow();
    });
  });

  describe('Security', () => {
    it('should prevent XSS by using textContent instead of innerHTML', () => {
      // ARRANGE: Render a box
      wordDisplay.render(1);
      
      // ACT: Try to inject script
      wordDisplay.updateBox(0, '<script>alert("xss")</script>');
      
      const box = container.children[0] as HTMLElement;
      
      // ASSERT: Should display as text, not execute
      expect(box.textContent).toBe('<SCRIPT>ALERT("XSS")</SCRIPT>');
      expect(box.innerHTML).not.toContain('<script');
      expect(box.innerHTML).not.toContain('alert');
    });

    it('should handle HTML-like content safely', () => {
      // ARRANGE
      wordDisplay.render(1);
      
      // ACT: Try to inject HTML
      wordDisplay.updateBox(0, '<img src="x" onerror="alert(1)">');
      
      const box = container.children[0] as HTMLElement;
      
      // ASSERT: Should display as literal text
      expect(box.textContent).toBe('<IMG SRC="X" ONERROR="ALERT(1)">');
      expect(box.innerHTML).not.toContain('<img');
    });

    it('should handle special characters safely', () => {
      // ARRANGE
      wordDisplay.render(1);
      
      // ACT: Use special characters
      wordDisplay.updateBox(0, '& < > " \' /');
      
      const box = container.children[0] as HTMLElement;
      
      // ASSERT: Should display as literal text
      expect(box.textContent).toBe('& < > " \' /');
    });
  });

  describe('Integration', () => {
    it('should work with standard container ID "word-container"', () => {
      // ARRANGE: DOM already has word-container
      
      // ACT
      const display = new WordDisplay('word-container');
      display.render(5);
      
      // ASSERT
      expect(container.children.length).toBe(5);
    });

    it('should support typical game flow: render → updateBox × N → reset', () => {
      // ARRANGE: Fresh display
      
      // ACT: Typical game flow
      wordDisplay.render(8); // ELEPHANT
      
      // Reveal some letters
      wordDisplay.updateBox(0, 'E');
      wordDisplay.updateBox(2, 'E'); // Second E in ELEPHANT
      wordDisplay.updateBox(4, 'H');
      
      // ASSERT: Revealed letters are shown
      expect((container.children[0] as HTMLElement).textContent).toBe('E');
      expect((container.children[2] as HTMLElement).textContent).toBe('E');
      expect((container.children[4] as HTMLElement).textContent).toBe('H');
      expect((container.children[1] as HTMLElement).textContent).toBe('');
      
      // ACT: Reset for new game
      wordDisplay.reset();
      
      // ASSERT: Container is empty
      expect(container.innerHTML).toBe('');
      
      // ACT: New game
      wordDisplay.render(5); // CAT
      
      // ASSERT: New boxes created
      expect(container.children.length).toBe(5);
    });

    it('should reveal all occurrences of same letter (e.g., E in ELEPHANT)', () => {
      // ARRANGE: ELEPHANT has E at positions 0 and 2
      wordDisplay.render(8); // E-L-E-P-H-A-N-T
      
      // ACT: Reveal letter E
      wordDisplay.updateBox(0, 'E');
      wordDisplay.updateBox(2, 'E');
      
      // ASSERT: Both E's should be revealed
      expect((container.children[0] as HTMLElement).textContent).toBe('E');
      expect((container.children[2] as HTMLElement).textContent).toBe('E');
      expect((container.children[1] as HTMLElement).textContent).toBe(''); // L not revealed
      expect((container.children[3] as HTMLElement).textContent).toBe(''); // P not revealed
    });

    it('should work with multiple WordDisplay instances (different containers)', () => {
      // ARRANGE: Create another container
      const container2 = document.createElement('div');
      container2.id = 'word-container-2';
      document.body.appendChild(container2);
      
      // ACT: Create two displays
      const display1 = new WordDisplay('word-container');
      const display2 = new WordDisplay('word-container-2');
      
      // Render different lengths
      display1.render(3);
      display2.render(5);
      
      // Update boxes independently
      display1.updateBox(0, 'A');
      display2.updateBox(0, 'X');
      
      // ASSERT: Each display manages its own container
      expect(container.children.length).toBe(3);
      expect(container2.children.length).toBe(5);
      expect((container.children[0] as HTMLElement).textContent).toBe('A');
      expect((container2.children[0] as HTMLElement).textContent).toBe('X');
    });

    it('should handle container with existing content', () => {
      // ARRANGE: Container has existing content
      const existingDiv = document.createElement('div');
      existingDiv.id = 'existing';
      container.appendChild(existingDiv);
      expect(container.children.length).toBe(1);
      
      // ACT: Render word display
      wordDisplay.render(4);
      
      // ASSERT: Existing content should be cleared
      expect(container.children.length).toBe(4);
      expect(container.querySelector('#existing')).toBeNull();
      
      // All children should be letter boxes
      const boxes = Array.from(container.children);
      boxes.forEach(box => {
        expect((box as HTMLElement).classList.contains('letter-box')).toBe(true);
      });
    });
  });
});