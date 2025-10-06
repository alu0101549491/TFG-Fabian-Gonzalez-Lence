// src/__tests__/model/Brick.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Brick } from '../../model/Brick';

describe('Brick', () => {
  const START_X = 100;
  const START_Y = 50;

  let brick: Brick;

  beforeEach(() => {
    brick = new Brick(START_X, START_Y);
  });

  it('should initialize correctly with full health and not destroyed', () => {
    expect(brick.x).toBe(START_X);
    expect(brick.y).toBe(START_Y);
    expect(brick.health).toBe(1);
    expect(brick.isDestroyed).toBe(false);
  });

  it('should reduce health when hit() is called', () => {
    brick.health = 2; // Set health to 2 for a multi-hit test
    brick.hit();
    expect(brick.health).toBe(1);
    expect(brick.isDestroyed).toBe(false);
  });

  it('should set isDestroyed to true and return true when health reaches zero', () => {
    brick.health = 1;
    const destroyed = brick.hit();
    expect(brick.health).toBe(0);
    expect(brick.isDestroyed).toBe(true);
    expect(destroyed).toBe(true);
  });

  it('should return false if the brick is hit but not destroyed', () => {
    brick.health = 5;
    const destroyed = brick.hit();
    expect(destroyed).toBe(false);
  });
});