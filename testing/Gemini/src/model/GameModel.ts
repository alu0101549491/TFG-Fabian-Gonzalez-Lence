// src/model/GameModel.ts

import { Ball } from './Ball.ts';
import { Paddle } from './Paddle.ts';
import { Brick } from './Brick.ts';
import { GameStatus } from './GameStatus.ts';

/**
 * The core Model for the Breakout game, managing all state and physics.
 */
export class GameModel {
  // Dimensions for initialization
  public readonly CANVAS_WIDTH: number;
  public readonly CANVAS_HEIGHT: number;

  // Game Objects
  public ball: Ball;
  public paddle: Paddle;
  public bricks: Brick[] = [];

  // Game State Variables
  public score: number = 0;
  public lives: number = 3;
  public gameStatus: GameStatus = GameStatus.PAUSED;
  
  // Note: lastTimestamp is moved to GameController for accurate delta time

  constructor(width: number, height: number) {
    this.CANVAS_WIDTH = width;
    this.CANVAS_HEIGHT = height;

    // Initialize game objects at starting positions
    const paddleY = this.CANVAS_HEIGHT - 30;
    this.paddle = new Paddle(this.CANVAS_WIDTH / 2, paddleY);
    this.ball = new Ball(this.CANVAS_WIDTH / 2, paddleY - 20, this.CANVAS_WIDTH);

    this.createBricks();
  }

  /**
   * Creates the initial grid of bricks.
   */
  private createBricks(): void {
    const brickColumnCount = 7;
    const brickRowCount = 5;
    const padding = 10;
    const offsetTop = 30;
    const offsetLeft = 30;
    const brickWidth = 75;
    const brickHeight = 20;

    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const brickX = c * (brickWidth + padding) + offsetLeft;
        const brickY = r * (brickHeight + padding) + offsetTop;
        this.bricks.push(new Brick(brickX, brickY));
      }
    }
  }

  /**
   * Main game logic update function.
   * @param deltaTime The time elapsed since the last frame (in seconds).
   */
  public update(deltaTime: number): void {
    // Only update physics if the game is running
    if (this.gameStatus !== GameStatus.RUNNING) {
      return;
    }

    this.ball.move();
    this.paddle.update(this.CANVAS_WIDTH);
    this.handleCollisions();

    // Check for win condition
    const remainingBricks = this.bricks.filter(b => !b.isDestroyed).length;
    if (remainingBricks === 0) {
      this.gameStatus = GameStatus.WON;
    }
  }

  /**
   * Handles all collision checks: walls, paddle, and bricks.
   */
  public handleCollisions(): void {
    const ball = this.ball;
    const paddle = this.paddle;
    const W = this.CANVAS_WIDTH;
    const H = this.CANVAS_HEIGHT;

    // 1. Wall Collision (Top, Left, Right)
    // Left/Right walls
    if (ball.x + ball.radius > W || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    // Top wall
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    // 2. Bottom Wall (Loss Condition)
    if (ball.y + ball.radius > H) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameStatus = GameStatus.LOST;
      } else {
        // Reset ball and paddle for a new life
        this.resetBallPosition();
        this.gameStatus = GameStatus.PAUSED; // Wait for user to launch ball
      }
    }

    // 3. Paddle Collision
    const paddleLeft = paddle.x - paddle.width / 2;
    const paddleRight = paddle.x + paddle.width / 2;
    const paddleTop = paddle.y - paddle.height / 2;
    const paddleBottom = paddle.y + paddle.height / 2;

    if (
      ball.y + ball.radius > paddleTop && // Ball has hit or passed the paddle top
      ball.y - ball.radius < paddleBottom && // Ball is not completely below the paddle
      ball.x > paddleLeft && // Ball is right of paddle's left edge
      ball.x < paddleRight && // Ball is left of paddle's right edge
      ball.dy > 0 // Ball is moving downwards
    ) {
      // Simple bounce back
      ball.dy = -Math.abs(ball.dy);
      // Change horizontal direction based on impact point (spin)
      const relativeX = (ball.x - paddle.x) / (paddle.width / 2);
      ball.dx = relativeX * ball.speed;
    }

    // 4. Brick Collision
    for (let i = 0; i < this.bricks.length; i++) {
      const brick = this.bricks[i];
      if (brick.isDestroyed) continue;

      // Simple AABB collision check
      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
      ) {
        // Collision detected! Reverse the Y direction and hit the brick
        ball.dy = -ball.dy;
        if (brick.hit()) {
          this.score += 10; // Simple scoring
        }
        // Only register one hit per frame for simplicity
        break;
      }
    }
  }
  
  /** Resets the ball to the center of the paddle. */
  private resetBallPosition(): void {
      const paddleY = this.CANVAS_HEIGHT - 30;
      this.ball.x = this.CANVAS_WIDTH / 2;
      this.ball.y = paddleY - 20;
      this.ball.dx = this.ball.speed * (Math.random() > 0.5 ? 1 : -1) * 0.7;
      this.ball.dy = -this.ball.speed * 0.7;
  }
}