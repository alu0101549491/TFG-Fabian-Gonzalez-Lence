// jest.config.cjs

const { defaults } = require('jest-config');

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  // CRITICAL FIX: The ultimate setting that tells Jest to run .ts files as ESM
  // (using the ts-jest/presets/default-esm transformer)
  extensionsToTreatAsEsm: ['.ts', '.tsx'], 

  // Use the ESM preset
  preset: 'ts-jest/presets/default-esm', 

  testEnvironment: 'jsdom',
  
  // This transform is still necessary to map the files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true, // This flag is often the key to making the transform work
    }],
  },
  
  // This module mapper is essential for resolving internal imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
};

module.exports = config;