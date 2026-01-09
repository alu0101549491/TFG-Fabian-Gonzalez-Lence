// src/__tests__/model/Ball.test.ts
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Ball } from '../../model/Ball.ts';

describe('Ball', () => {
  const CANVAS_WIDTH = 800;
  const START_X = 400;
  const START_Y = 570;

  let ball: Ball;

  beforeEach(() => {
    // We use a fixed seed for random direction to ensure predictable tests
    jest.spyOn(Math, 'random').mockReturnValue(0.2); 
    ball = new Ball(START_X, START_Y, CANVAS_WIDTH);
  });

  afterEach(() => {
    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should initialize correctly with default properties', () => {
    expect(ball.radius).toBe(8);
    expect(ball.speed).toBe(5);
    expect(ball.x).toBe(START_X);
    expect(ball.y).toBe(START_Y);
  });

  it('should initialize with starting velocity (dx, dy)', () => {
    // The random value of 0.2 means (Math.random() > 0.5) is false, 
    // so it starts moving left (dx is negative).
    // dx = 5 * (-1) * 0.7 = -3.5
    // dy = -5 * 0.7 = -3.5 (Always starts moving up)
    expect(ball.dx).toBeCloseTo(-3.5);
    expect(ball.dy).toBeCloseTo(-3.5);
  });

  it('should update its position when move() is called', () => {
    const initialX = ball.x;
    const initialY = ball.y;

    ball.move();

    // New position should be: initial position + velocity
    expect(ball.x).toBeCloseTo(initialX + ball.dx);
    expect(ball.y).toBeCloseTo(initialY + ball.dy);
  });
});