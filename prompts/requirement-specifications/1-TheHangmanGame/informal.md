## General Description

Single Page Application (SPA) web application that implements the Hangman game using TypeScript, MVC architecture, event-driven programming, and graphics through Canvas API. The player must guess words from an animal dictionary before completing the hangman drawing.

## Main Game Features

- Initialize the game displaying the word to guess in empty boxes
- Letter selection by the user through clicks
- Reveal all occurrences of correct letters in the word
- Register failed attempts and update graphical representation of the hangman
- Game completion with player victory when guessing the complete word
- Game completion with computer victory when completing all failed attempts
- Game restart with new random word from the dictionary
- Animal word dictionary management with random selection

## Application Features

- Responsive SPA web application, functional in modern browsers (Chrome, Firefox, Edge)
- Graphical interface with letter boxes, gallows and hangman representation
- Modular and object-oriented code following MVC pattern
- Immediate response time when selecting letters (less than 200ms)
- Technical documentation and UML accessible from GitHub Pages
- Styles with Bulma framework (gray background, readable typography, contrasting colors)
- Unit tests with Jest (minimum 80% coverage on critical functions)
- Code analysis with ESLint using Google's style guide for TypeScript
- Continuous integration with GitHub Actions for static analysis and automatic deployment

## Architecture and Technical Structure

- MVC pattern with clear separation of responsibilities
- Each class in independent file within `src/home-work`
- Class export as ES6 modules
- Main class structure:
    - **GameModel**: stores secret word, correct letters, failed attempts and dictionary
    - **GameView**: handles UI, draws word in boxes, available letters, and hangman with Canvas or images
    - **GameController**: manages letter selection logic and communication between Model and View
- Object-oriented programming with good encapsulation practices

## Graphical Interface Features

- Empty boxes showing the structure of the word to guess
- Complete alphabet with available letters to select
- Visual representation of the gallows and hangman parts according to failed attempts
- 6 graphical states of the hangman (using Canvas API or predefined images `Hangman-1.png` through `Hangman-6.png`)
- Immediate interface update after each selection
- Victory or defeat messages upon completion
- Restart button visible when game ends

## Dictionary and Word Features

- Dictionary of animal names (minimum 10 words)
- Random word selection when starting or restarting the game
- No support for dictionaries of other categories in this version

## Attempt Control and Completion

- Each incorrect letter adds one part to the hangman drawing
- Maximum of 6 failed attempts before completing the drawing
- Player victory when guessing all letters correctly
- Computer victory when completing the 6 failed attempts
- Ability to restart after finishing the game

## Testing and Code Quality

- Unit tests with Jest covering:
    - Selection of correct and incorrect letters
    - Control and update of failed attempts
    - Game completion conditions (victory and defeat)
    - Game restart and random word selection
- Minimum 80% coverage on critical functions
- Static analysis with ESLint without relevant errors or warnings

## Documentation

- All classes and methods documented with JSDoc
- Automatic generation of technical documentation with TypeDoc
- UML class diagram available on GitHub Pages
- [README.md](http://readme.md/) including:
    - Compilation and execution instructions
    - Link to live demo
    - Description of project structure

## Optional Considerations

- Simple animations when revealing correct or incorrect letters
- Sound effects when getting letters right or wrong
- Different difficulty levels (variation in number of allowed attempts)
- Future integration with more extensive dictionaries or multiple categories

## Suggested File Structure

```
src/home-work/
├── model/
│   └── GameModel.ts
├── view/
│   └── GameView.ts
├── controller/
│   └── GameController.ts
├── index.ts
├── assets/
│   └── Hangman-1.png ... Hangman-6.png
└── tests/
    └── GameModel.test.ts

```