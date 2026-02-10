/**
 * @module application/services/common/errors
 * @description Custom error classes for application layer.
 * @category Application
 */

/**
 * Error thrown when user lacks authorization for an operation.
 */
export class UnauthorizedError extends Error {
  public readonly code = 'UNAUTHORIZED';
  
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error thrown when a requested entity is not found.
 */
export class NotFoundError extends Error {
  public readonly code = 'NOT_FOUND';
  
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when input validation fails.
 */
export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  
  constructor(
    message: string,
    public readonly errors: Array<{field: string; message: string; code?: string}>
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when a business rule is violated.
 */
export class BusinessRuleError extends Error {
  public readonly code = 'BUSINESS_RULE_ERROR';
  
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }
}

/**
 * Error thrown when a resource conflict occurs.
 */
export class ConflictError extends Error {
  public readonly code = 'CONFLICT';
  
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
