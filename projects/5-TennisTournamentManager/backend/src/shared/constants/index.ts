/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file shared/constants/index.ts
 * @desc Application-wide constants for error codes, messages, and configuration values.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * HTTP status codes used throughout the application.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Error codes for consistent error handling.
 */
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business logic errors
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  TOURNAMENT_FULL: 'TOURNAMENT_FULL',
  INVALID_OPERATION: 'INVALID_OPERATION',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

/**
 * Default pagination settings.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * ID prefixes for different entity types.
 */
export const ID_PREFIXES = {
  USER: 'usr',
  TOURNAMENT: 'trn',
  CATEGORY: 'cat',
  BRACKET: 'brk',
  MATCH: 'mch',
  REGISTRATION: 'reg',
  COURT: 'crt',
  PHASE: 'phs',
  SCORE: 'scr',
  STANDING: 'std',
  RANKING: 'rnk',
  NOTIFICATION: 'ntf',
  ANNOUNCEMENT: 'ann',
  PAYMENT: 'pmt',
  SANCTION: 'snc',
  ORDER_OF_PLAY: 'oop',
  STATISTICS: 'sta',
} as const;
