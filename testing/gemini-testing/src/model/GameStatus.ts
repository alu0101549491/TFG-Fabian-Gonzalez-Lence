// src/model/GameStatus.ts

/**
 * Defines the possible states of the game.
 */
export enum GameStatus {
  // Game is waiting to be started or resumed
  PAUSED = 'PAUSED',
  // Game is actively running
  RUNNING = 'RUNNING',
  // Player won by destroying all bricks
  WON = 'WON',
  // Player lost all lives
  LOST = 'LOST',
}