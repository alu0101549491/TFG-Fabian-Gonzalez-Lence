// src/view/GameView.ts

import { GameModel } from '../model/GameModel.ts';
import { Ball } from '../model/Ball.ts';
import { Paddle } from '../model/Paddle.ts';
import { Brick } from '../model/Brick.ts';
import { GameStatus } from '../model/GameStatus.ts';

/**
 * Handles all rendering for the Breakout game onto the canvas.
 */
export class GameView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private model: GameModel;
  
  private statusDisplay: HTMLSpanElement;
  private livesDisplay: HTMLSpanElement;
  private scoreDisplay: HTMLSpanElement;

  constructor(
    canvas: HTMLCanvasElement, 
    model: GameModel,
    statusDisplay: HTMLSpanElement,
    livesDisplay: HTMLSpanElement,
    scoreDisplay: HTMLSpanElement
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.model = model;
    this.statusDisplay = statusDisplay;
    this.livesDisplay = livesDisplay;
    this.scoreDisplay = scoreDisplay;

    // Set styling for the canvas context
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
  }

  /**
   * Main render function, draws the entire game state.
   */
  public render(): void {
    // 1. Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Draw game objects
    this.drawBricks(this.model.bricks);
    this.drawPaddle(this.model.paddle);
    this.drawBall(this.model.ball);
    
    // 3. Update DOM info
    this.updateHUD();

    // 4. Draw overlays if game is not RUNNING
    if (this.model.gameStatus !== GameStatus.RUNNING) {
      this.drawOverlay(this.model.gameStatus);
    }
  }

  /** Updates the Score, Lives, and Status in the HTML DOM. */
  private updateHUD(): void {
    this.scoreDisplay.textContent = this.model.score.toString();
    this.livesDisplay.textContent = this.model.lives.toString();
    
    let statusText = this.model.gameStatus.toString();
    if (this.model.gameStatus === GameStatus.PAUSED) {
        statusText += " (Press Space to Launch!)";
    }
    this.statusDisplay.textContent = statusText;
  }

  /** Draws the ball. */
  private drawBall(ball: Ball): void {
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FF4500'; // Orange-Red
    this.ctx.fill();
    this.ctx.closePath();
  }

  /** Draws the paddle. */
  private drawPaddle(paddle: Paddle): void {
    const x = paddle.x - paddle.width / 2;
    const y = paddle.y - paddle.height / 2;

    this.ctx.beginPath();
    this.ctx.rect(x, y, paddle.width, paddle.height);
    this.ctx.fillStyle = '#0095DD'; // Blue
    this.ctx.fill();
    this.ctx.closePath();
  }

  /** Draws all active bricks. */
  private drawBricks(bricks: Brick[]): void {
    bricks.forEach(brick => {
      if (!brick.isDestroyed) {
        this.ctx.beginPath();
        this.ctx.rect(brick.x, brick.y, brick.width, brick.height);
        this.ctx.fillStyle = this.getBrickColor(brick.health);
        this.ctx.fill();
        this.ctx.closePath();
      }
    });
  }

  /** Gets a color based on brick health (simple for now). */
  private getBrickColor(health: number): string {
    // Simple color logic: all full health are green.
    return '#00DD95'; // Green
  }

  /** Draws a central overlay message for paused/won/lost states. */
  private drawOverlay(status: GameStatus): void {
    const W = this.canvas.width;
    const H = this.canvas.height;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '48px Arial';
    
    let message = '';
    switch (status) {
      case GameStatus.PAUSED:
        message = 'PAUSED - Press SPACE';
        break;
      case GameStatus.WON:
        message = 'VICTORY! Score: ' + this.model.score;
        this.ctx.fillStyle = '#90EE90'; // Light Green
        break;
      case GameStatus.LOST:
        message = 'GAME OVER. Score: ' + this.model.score;
        this.ctx.fillStyle = '#FF6347'; // Tomato Red
        break;
      default:
        return;
    }
    
    this.ctx.fillText(message, W / 2, H / 2);
    this.ctx.font = '24px Arial';
    this.ctx.fillText("Press R to Reset", W / 2, H / 2 + 50);
  }
}