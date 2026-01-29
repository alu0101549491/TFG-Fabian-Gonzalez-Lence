require('@testing-library/jest-dom');

// Mock uuid with incrementing counter for unique IDs that match UUID v4 format
let uuidCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    const counter = (++uuidCounter).toString(16).padStart(12, '0');
    return `00000000-0000-4000-8000-${counter}`;
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  error: jest.fn(),
  warning: jest.fn(),
};