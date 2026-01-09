// src/__tests__/model/Paddle.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Paddle } from '../../model/Paddle.ts';

describe('Paddle', () => {
  const CANVAS_WIDTH = 800;
  const START_X = 400;
  const START_Y = 570;
  const PADDLE_WIDTH = 100;
  const PADDLE_SPEED = 7;

  let paddle: Paddle;

  beforeEach(() => {
    paddle = new Paddle(START_X, START_Y);
  });

  it('should initialize correctly with position and dimensions', () => {
    expect(paddle.x).toBe(START_X);
    expect(paddle.y).toBe(START_Y);
    expect(paddle.width).toBe(PADDLE_WIDTH);
    expect(paddle.speed).toBe(PADDLE_SPEED);
    expect(paddle.movementDirection).toBe(0);
  });

  it('should set movementDirection to 1 when moveRight() is called', () => {
    paddle.moveRight();
    expect(paddle.movementDirection).toBe(1);
  });

  it('should set movementDirection to -1 when moveLeft() is called', () => {
    paddle.moveLeft();
    expect(paddle.movementDirection).toBe(-1);
  });

  it('should reset movementDirection to 0 when stop() is called', () => {
    paddle.moveRight();
    paddle.stop();
    expect(paddle.movementDirection).toBe(0);
  });

  it('should move right when update() is called with direction 1', () => {
    paddle.moveRight();
    paddle.update(CANVAS_WIDTH);
    expect(paddle.x).toBe(START_X + PADDLE_SPEED);
  });

  it('should not move beyond the right boundary', () => {
    paddle.x = CANVAS_WIDTH - PADDLE_WIDTH / 2; // Right boundary
    paddle.moveRight();
    paddle.update(CANVAS_WIDTH);
    // Should remain at the maximum allowed X
    expect(paddle.x).toBe(CANVAS_WIDTH - PADDLE_WIDTH / 2); 
  });

  it('should not move beyond the left boundary', () => {
    paddle.x = PADDLE_WIDTH / 2; // Left boundary
    paddle.moveLeft();
    paddle.update(CANVAS_WIDTH);
    // Should remain at the minimum allowed X
    expect(paddle.x).toBe(PADDLE_WIDTH / 2);
  });
});