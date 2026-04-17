/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file jest.config.js
 * @desc Jest configuration for backend unit and integration tests (NFR22)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'node',
          esModuleInterop: true,
        },
      },
    ],
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  collectCoverageFrom: [
    'src/application/services/audit.service.ts',
    'src/application/services/match-generator.service.ts',
    'src/application/services/notification.service.ts',
    'src/application/services/privacy.service.ts',
    'src/application/services/standing.service.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    // NFR22: protect named critical backend workflows rather than reporting a misleading
    // whole-backend percentage over untested wiring and generated persistence layers.
    './src/application/services/audit.service.ts': {
      branches: 70,
      functions: 100,
      lines: 85,
      statements: 85,
    },
    './src/application/services/match-generator.service.ts': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './src/application/services/notification.service.ts': {
      branches: 60,
      functions: 80,
      lines: 75,
      statements: 75,
    },
    './src/application/services/privacy.service.ts': {
      branches: 65,
      functions: 90,
      lines: 80,
      statements: 80,
    },
    './src/application/services/standing.service.ts': {
      branches: 35,
      functions: 80,
      lines: 75,
      statements: 75,
    },
    global: {
      branches: 65,
      functions: 85,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
};
