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
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/**/*.interface.ts',
    '!src/shared/config.ts',
    '!src/infrastructure/database/migrate.ts',
    '!src/infrastructure/database/seed.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    // NFR22: 70% coverage on critical functions
    // Apply strict thresholds to critical application services
    './src/application/services/audit.service.ts': {
      branches: 70,
      functions: 100,
      lines: 85,
      statements: 85,
    },
    // Global thresholds relaxed to allow incremental test coverage addition
    global: {
      branches: 20,
      functions: 20,
      lines: 10,
      statements: 10,
    },
  },
  testTimeout: 10000,
  verbose: true,
};
