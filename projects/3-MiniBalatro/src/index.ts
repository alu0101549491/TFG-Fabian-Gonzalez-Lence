// ============================================
// FILE: src/index.ts
// ============================================

/**
 * Mini Balatro - Library Entry Point
 *
 * This file exports all public APIs for use as a library.
 * Import from this file when using Mini Balatro as a module.
 *
 * @example
 * import { GameController, GameState } from 'mini-balatro';
 */

// Core Models
export * from './models/core';
export * from './models/poker';
export * from './models/special-cards';
export * from './models/scoring';
export * from './models/blinds';
export * from './models/game';

// Controllers
export * from './controllers';

// Services
export * from './services';

// Utilities
export * from './utils';

// Types
export * from './types';

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Library metadata
 */
export const LIBRARY_INFO = {
  name: 'Mini Balatro',
  version: VERSION,
  description: 'A web-based card game inspired by Balatro with poker mechanics and roguelike elements',
  author: 'Your Name',
  license: 'MIT',
};
