/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/shared/constants.ts
 * @desc Application-wide constants for the backend server
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================
 * SERVER CONFIGURATION
 * ============================================
 */

export const SERVER = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_VERSION: process.env.API_VERSION || 'v1',
  API_PREFIX: `/api/${process.env.API_VERSION || 'v1'}`,
} as const;

/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 */

export const DATABASE = {
  URL: process.env.DATABASE_URL || '',
} as const;

/**
 * ============================================
 * JWT CONFIGURATION
 * ============================================
 */

export const JWT = {
  SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

/**
 * ============================================
 * CORS CONFIGURATION
 * ============================================
 */

export const CORS = {
  ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  CREDENTIALS: true,
} as const;

/**
 * ============================================
 * WEBSOCKET CONFIGURATION
 * ============================================
 */

export const WEBSOCKET = {
  CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
  PING_INTERVAL: 25000,
  PING_TIMEOUT: 20000,
} as const;

/**
 * ============================================
 * FILE UPLOAD CONFIGURATION
 * ============================================
 */

export const UPLOAD = {
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  ALLOWED_MIME_TYPES: [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/tiff',
    'image/webp',
    // Geographic
    'application/vnd.google-earth.kml+xml',
    'application/vnd.google-earth.kmz',
    // CAD
    'application/acad',
    'application/dxf',
    // Compressed
    'application/zip',
    'application/x-rar-compressed',
  ],
} as const;

/**
 * ============================================
 * LOGGING CONFIGURATION
 * ============================================
 */

export const LOGGING = {
  LEVEL: process.env.LOG_LEVEL || 'debug',
  FILE: process.env.LOG_FILE || 'logs/app.log',
} as const;

/**
 * ============================================
 * RATE LIMITING
 * ============================================
 */

export const RATE_LIMIT = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
} as const;

/**
 * ============================================
 * PAGINATION
 * ============================================
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * ============================================
 * VALIDATION
 * ============================================
 */

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  PROJECT_CODE_PATTERN: /^CART-\d{4}-\d{3}$/,
} as const;

/**
 * ============================================
 * PASSWORD HASHING
 * ============================================
 */

export const BCRYPT = {
  SALT_ROUNDS: 10,
} as const;

/**
 * ============================================
 * HTTP STATUS CODES
 * ============================================
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
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * ============================================
 * ERROR MESSAGES
 * ============================================
 */

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden resource',

  // Validation
  VALIDATION_ERROR: 'Validation error',
  INVALID_INPUT: 'Invalid input data',
  REQUIRED_FIELD: 'Required field is missing',

  // Resources
  USER_NOT_FOUND: 'User not found',
  PROJECT_NOT_FOUND: 'Project not found',
  TASK_NOT_FOUND: 'Task not found',
  MESSAGE_NOT_FOUND: 'Message not found',
  FILE_NOT_FOUND: 'File not found',
  NOTIFICATION_NOT_FOUND: 'Notification not found',

  // Conflicts
  USER_ALREADY_EXISTS: 'User with this email already exists',
  PROJECT_CODE_EXISTS: 'Project code already exists',

  // Business Logic
  INVALID_TASK_TRANSITION: 'Invalid task status transition',
  CANNOT_DELETE_FINALIZED_PROJECT: 'Cannot delete finalized project',
  PROJECT_ALREADY_FINALIZED: 'Project is already finalized',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
} as const;
