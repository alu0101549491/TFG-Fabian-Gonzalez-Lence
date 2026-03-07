/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/shared/errors.ts
 * @desc Custom error classes for application-specific errors
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {HTTP_STATUS} from './constants.js';

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * Creates an application error
   *
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param isOperational - Whether error is operational (expected)
   */
  public constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  /**
   * Creates a not found error
   *
   * @param message - Error message
   */
  public constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * Bad request error (400)
 */
export class BadRequestError extends AppError {
  /**
   * Creates a bad request error
   *
   * @param message - Error message
   */
  public constructor(message: string = 'Bad request') {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  /**
   * Creates an unauthorized error
   *
   * @param message - Error message
   */
  public constructor(message: string = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  /**
   * Creates a forbidden error
   *
   * @param message - Error message
   */
  public constructor(message: string = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  /**
   * Creates a conflict error
   *
   * @param message - Error message
   */
  public constructor(message: string = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends AppError {
  public readonly errors?: Array<{field: string; message: string}>;

  /**
   * Creates a validation error
   *
   * @param message - Error message
   * @param errors - Array of field validation errors
   */
  public constructor(
    message: string = 'Validation failed',
    errors?: Array<{field: string; message: string}>
  ) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    this.errors = errors;
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  /**
   * Creates a database error
   *
   * @param message - Error message
   */
  public constructor(message: string = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }
}
