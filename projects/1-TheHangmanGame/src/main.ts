/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/src/main.ts
 * @desc Application entry point: initializes model, view, controller and starts the game.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {GameModel} from '@models/game-model';
import {GameView} from '@views/game-view';
import {GameController} from '@controllers/game-controller';
import {WordDictionary} from '@models/word-dictionary';
import './styles/main.css';
import 'bulma/css/bulma.min.css';

/**
 * Application entry point.
 * Initializes the MVC components and starts the game.
 */
function main(): void {
  // Initialize Model
  const dictionary = new WordDictionary();
  const gameModel = new GameModel(dictionary);

  // Initialize View
  const gameView = new GameView();

  // Initialize Controller
  const gameController = new GameController(gameModel, gameView);
  gameController.initialize();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}