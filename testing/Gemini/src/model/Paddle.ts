// src/model/Paddle.ts

/**
 * Represents the Paddle controlled by the player.
 */
export class Paddle {
  // Dimensions
  public width: number = 100;
  public height: number = 15;
  public speed: number = 7; // Speed of horizontal movement

  // Position (center of the paddle)
  public x: number;
  public y: number; // Y position is fixed at the bottom

  // Movement state (0=stop, 1=right, -1=left)
  public movementDirection: number = 0;

  /**
   * Initializes the paddle.
   * @param startX Initial X position (center).
   * @param startY Fixed Y position (bottom of the screen).
   */
  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  /**
   * Updates the paddle's position based on its movementDirection.
   * @param canvasWidth The width of the canvas for boundary checks.
   */
  public update(canvasWidth: number): void {
    const newX = this.x + this.movementDirection * this.speed;

    // Boundary check: ensure the paddle stays within the canvas
    const minX = this.width / 2;
    const maxX = canvasWidth - this.width / 2;

    this.x = Math.max(minX, Math.min(newX, maxX));
  }

  /** Sets the paddle's movement direction to right (1). */
  public moveRight(): void {
    this.movementDirection = 1;
  }

  /** Sets the paddle's movement direction to left (-1). */
  public moveLeft(): void {
    this.movementDirection = -1;
  }

  /** Stops the paddle's movement. */
  public stop(): void {
    this.movementDirection = 0;
  }
}