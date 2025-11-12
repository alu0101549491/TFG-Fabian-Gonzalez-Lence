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