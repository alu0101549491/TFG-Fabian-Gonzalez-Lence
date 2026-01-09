// src/main.ts

import { GameModel } from './model/GameModel.ts';
import { GameView } from './view/GameView.ts';
import { GameController } from './controller/GameController.ts';

function init() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const statusDisplay = document.getElementById('status-display') as HTMLSpanElement;
  const livesDisplay = document.getElementById('lives-display') as HTMLSpanElement;
  const scoreDisplay = document.getElementById('score-display') as HTMLSpanElement;

  if (!canvas || !statusDisplay || !livesDisplay || !scoreDisplay) {
    console.error('Required DOM elements not found. Cannot initialize game.');
    return;
  }

  // 1. Initialize the Model (State)
  const model = new GameModel(canvas.width, canvas.height);

  // 2. Initialize the View (Rendering)
  const view = new GameView(canvas, model, statusDisplay, livesDisplay, scoreDisplay);

  // 3. Initialize the Controller (Input & Flow)
  const controller = new GameController(model, view);

  // Start the game loop managed by the controller
  controller.startGame();

  console.log('Breakout game initialized and running!');
}

// Ensure the DOM is fully loaded before initialization
document.addEventListener('DOMContentLoaded', init);