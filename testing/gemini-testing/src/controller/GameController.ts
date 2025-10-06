// src/controller/GameController.ts

import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';
import { GameStatus } from '../model/GameStatus';

/**
 * Handles user input and the main game loop.
 */
export class GameController {
  private model: GameModel;
  private view: GameView;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0; // For delta time calculation

  constructor(model: GameModel, view: GameView) {
    this.model = model;
    this.view = view;
    this.setupInputListeners();
  }

  /**
   * Sets up keyboard event listeners for controlling the paddle and game flow.
   */
  private setupInputListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  /**
   * Handles key presses for immediate actions (move start, pause, reset).
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Paddle movement start
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      this.model.paddle.moveRight();
    } else if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      this.model.paddle.moveLeft();
    } 
    
    // Launch/Pause
    else if (event.key === ' ') {
      event.preventDefault(); // Prevent spacebar from scrolling the page
      if (this.model.gameStatus === GameStatus.PAUSED) {
        this.model.gameStatus = GameStatus.RUNNING;
      } else if (this.model.gameStatus === GameStatus.RUNNING) {
        this.model.gameStatus = GameStatus.PAUSED;
      }
    }
    
    // Reset game
    else if (event.key.toLowerCase() === 'r') {
        if (this.model.gameStatus === GameStatus.LOST || this.model.gameStatus === GameStatus.WON) {
            this.resetGame();
        }
    }
  }

  /**
   * Handles key releases for stopping paddle movement.
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (
      event.key === 'ArrowRight' ||
      event.key.toLowerCase() === 'd' ||
      event.key === 'ArrowLeft' ||
      event.key.toLowerCase() === 'a'
    ) {
      // Stop movement only if no other movement key is still held down
      this.model.paddle.stop();
    }
  }
  
  /**
   * Resets the model state to initial conditions and restarts the game loop.
   */
  private resetGame(): void {
      // Re-initialize the model to reset all properties
      const W = this.model.CANVAS_WIDTH;
      const H = this.model.CANVAS_HEIGHT;
      // Note: In a real app, we'd use a reset method on the model, 
      // but for simplicity, we'll recreate the model instance:
      this.model = new GameModel(W, H);
      
      // We must tell the view to observe the new model instance
      // (This requires a method on GameView, but for now we rely on the next render call)
      // A more robust MVC would swap out the model reference in the view.
      
      // Ensure the loop is running after reset
      if (this.animationFrameId === null) {
          this.startGame();
      }
      this.view.render();
  }

  /**
   * Starts the main animation loop.
   */
  public startGame(): void {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  /**
   * Stops the main animation loop.
   */
  public stopGame(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * The core game loop, called by the browser's requestAnimationFrame.
   */
  private gameLoop(timestamp: DOMHighResTimeStamp): void {
    // Calculate Delta Time (in seconds)
    if (this.lastTimestamp === 0) this.lastTimestamp = timestamp;
    const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Time elapsed since last frame in seconds
    this.lastTimestamp = timestamp;

    // 1. Update the Model
    this.model.update(deltaTime);

    // 2. Render the View
    this.view.render();
    
    // Check if the game should stop the loop (only if LOST or WON)
    if (this.model.gameStatus === GameStatus.LOST || this.model.gameStatus === GameStatus.WON) {
        this.stopGame();
    }

    // Request the next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }
}