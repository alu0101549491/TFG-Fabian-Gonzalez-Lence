/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/index.ts
 * @desc Library entry point exporting all public APIs for module usage.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
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
