// Setup file for Jest with React Testing Library
require('@testing-library/jest-dom');

// Mock HTMLMediaElement (Audio API)
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.addEventListener = jest.fn();
window.HTMLMediaElement.prototype.removeEventListener = jest.fn();

Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
  get: jest.fn(() => 0),
  set: jest.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  get: jest.fn(() => 0),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});