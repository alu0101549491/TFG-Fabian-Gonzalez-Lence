// src/model/Ball.ts

/**
 * Represents the Ball in the Breakout game.
 */
export class Ball {
  public radius: number = 8;
  public speed: number = 5;

  // Position
  public x: number;
  public y: number;

  // Velocity vectors
  public dx: number;
  public dy: number;

  /**
   * Initializes the ball at a specific position with initial direction.
   * @param startX Initial X position.
   * @param startY Initial Y position.
   * @param canvasWidth The width of the canvas for initial DX direction.
   */
  constructor(startX: number, startY: number, canvasWidth: number) {
    this.x = startX;
    this.y = startY;

    // Start moving up (negative Y) and slightly to the side (random X)
    this.dx = this.speed * (Math.random() > 0.5 ? 1 : -1) * 0.7; // Start slightly angled
    this.dy = -this.speed * 0.7; // Initial speed up
  }

  /**
   * Updates the ball's position based on its velocity.
   */
  public move(): void {
    this.x += this.dx;
    this.y += this.dy;
  }
}