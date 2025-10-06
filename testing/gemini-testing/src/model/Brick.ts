// src/model/Brick.ts

/**
 * Represents a single Brick in the game.
 */
export class Brick {
  public width: number = 75;
  public height: number = 20;

  // Position (top-left corner)
  public x: number;
  public y: number;

  // The number of hits required to destroy the brick.
  public health: number = 1;

  /**
   * True if the brick has been destroyed and should not be drawn or checked for collision.
   */
  public isDestroyed: boolean = false;

  /**
   * Initializes a brick.
   * @param x X position (top-left).
   * @param y Y position (top-left).
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Reduces the brick's health and marks it as destroyed if health reaches zero.
   * @returns True if the brick was destroyed, false otherwise.
   */
  public hit(): boolean {
    this.health--;
    if (this.health <= 0) {
      this.isDestroyed = true;
      return true;
    }
    return false;
  }
}