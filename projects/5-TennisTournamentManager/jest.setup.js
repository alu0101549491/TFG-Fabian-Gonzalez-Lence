/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file jest.setup.js
 * @desc Jest setup file to mock Angular dependencies before tests run.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

// Mock @angular/core decorators and functions
jest.mock('@angular/core', () => ({
  Injectable: () => (target) => target,
  inject: jest.fn((token) => {
    // Return a mock based on the token if needed
    return undefined;
  }),
  // Add other Angular core exports as needed
  Component: () => (target) => target,
  Directive: () => (target) => target,
  Pipe: () => (target) => target,
  Input: () => (target, propertyKey) => {},
  Output: () => (target, propertyKey) => {},
  HostListener: () => (target, propertyKey, descriptor) => descriptor,
}));
