// src/__tests__/model/GameModel.test.ts

import { describe, it, expect, beforeEach, afterAll, jest } from '@jest/globals';
import { GameModel } from '../../model/GameModel';
import { GameStatus } from '../../model/GameStatus';
import { Brick } from '../../model/Brick';

describe('GameModel', () => {
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const BALL_RADIUS = 8;

  let model: GameModel;

  // Mock Math.random to ensure predictable ball launch angle
  jest.spyOn(Math, 'random').mockReturnValue(0.7); 

  beforeEach(() => {
    model = new GameModel(CANVAS_WIDTH, CANVAS_HEIGHT);
  });

  afterAll(() => {
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should initialize game state correctly', () => {
    expect(model.score).toBe(0);
    expect(model.lives).toBe(3);
    expect(model.gameStatus).toBe(GameStatus.PAUSED);
    expect(model.bricks.length).toBeGreaterThan(0);
    expect(model.ball).toBeDefined();
    expect(model.paddle).toBeDefined();
  });

  it('should switch status from PAUSED to RUNNING on update call (if logic allows, though Controller handles this)', () => {
    // Manually set to RUNNING for physics tests
    model.gameStatus = GameStatus.RUNNING;
    model.update(1 / 60);
    expect(model.gameStatus).toBe(GameStatus.RUNNING); 
    // Ball position should change
    expect(model.ball.x).not.toBe(CANVAS_WIDTH / 2);
  });
  
  // --- Collision Tests ---

  it('should reverse ball dx on left wall collision', () => {
    model.ball.x = BALL_RADIUS - 1; // Just past the left wall
    model.ball.dx = -5;
    model.handleCollisions();
    expect(model.ball.dx).toBe(5);
  });

  it('should reverse ball dx on right wall collision', () => {
    model.ball.x = CANVAS_WIDTH - BALL_RADIUS + 1; // Just past the right wall
    model.ball.dx = 5;
    model.handleCollisions();
    expect(model.ball.dx).toBe(-5);
  });

  it('should reverse ball dy on top wall collision', () => {
    model.ball.y = BALL_RADIUS - 1; // Just past the top wall
    model.ball.dy = -5;
    model.handleCollisions();
    expect(model.ball.dy).toBe(5);
  });

  it('should lose a life and pause on bottom wall collision', () => {
    model.gameStatus = GameStatus.RUNNING;
    model.lives = 3;
    model.ball.y = CANVAS_HEIGHT + 1; // Past the bottom
    model.ball.dy = 5; // Must be moving down
    
    model.handleCollisions();
    
    expect(model.lives).toBe(2);
    expect(model.gameStatus).toBe(GameStatus.PAUSED);
    // Should reset ball position (test only checks lives/status)
  });
  
  it('should end the game (LOST) when lives reach zero', () => {
    model.gameStatus = GameStatus.RUNNING;
    model.lives = 1;
    model.ball.y = CANVAS_HEIGHT + 1;
    model.ball.dy = 5;
    
    model.handleCollisions();
    
    expect(model.lives).toBe(0);
    expect(model.gameStatus).toBe(GameStatus.LOST);
  });
  
  it('should reverse dy on paddle collision', () => {
    // Setup ball to hit paddle from above
    model.ball.x = model.paddle.x; // Center of paddle
    model.ball.y = model.paddle.y - model.paddle.height / 2 - BALL_RADIUS + 1; // Just touching paddle top
    model.ball.dy = 5; // Moving down
    
    const initialDY = model.ball.dy;
    model.handleCollisions();

    // DY should reverse
    expect(model.ball.dy).toBeCloseTo(-initialDY);
    // DX should also change based on impact point (it's 0 here since it hit the center)
    expect(model.ball.dx).toBeCloseTo(0);
  });

  it('should end the game (WON) when all bricks are destroyed', () => {
    model.gameStatus = GameStatus.RUNNING;
    // Set all bricks to destroyed
    model.bricks.forEach(b => {
      b.isDestroyed = true;
    });

    // Run update to check win condition
    model.update(1 / 60);

    expect(model.gameStatus).toBe(GameStatus.WON);
  });
});