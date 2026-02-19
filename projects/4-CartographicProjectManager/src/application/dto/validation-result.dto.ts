/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/validation-result.dto.ts
 * @desc Data Transfer Objects for validation operation results.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Validation error codes for programmatic error handling.
 */
export enum ValidationErrorCode {
  /** Field is required but was not provided */
  REQUIRED = 'REQUIRED',
  /** Value has an invalid format */
  INVALID_FORMAT = 'INVALID_FORMAT',
  /** Value has an invalid type */
  INVALID_TYPE = 'INVALID_TYPE',

  /** String is too short */
  TOO_SHORT = 'TOO_SHORT',
  /** String is too long */
  TOO_LONG = 'TOO_LONG',
  /** Email format is invalid */
  INVALID_EMAIL = 'INVALID_EMAIL',
  /** Value doesn't match required pattern */
  INVALID_PATTERN = 'INVALID_PATTERN',

  /** Number is too small */
  TOO_SMALL = 'TOO_SMALL',
  /** Number is too large */
  TOO_LARGE = 'TOO_LARGE',
  /** Value is not an integer */
  NOT_INTEGER = 'NOT_INTEGER',
  /** Number is out of acceptable range */
  OUT_OF_RANGE = 'OUT_OF_RANGE',

  /** Date format is invalid */
  INVALID_DATE = 'INVALID_DATE',
  /** Date is in the past but future date required */
  DATE_IN_PAST = 'DATE_IN_PAST',
  /** Date is in the future but past date required */
  DATE_IN_FUTURE = 'DATE_IN_FUTURE',
  /** Date range is invalid (e.g., end before start) */
  DATE_RANGE_INVALID = 'DATE_RANGE_INVALID',

  /** Referenced entity was not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Entity with this value already exists */
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  /** Reference to another entity is invalid */
  INVALID_REFERENCE = 'INVALID_REFERENCE',

  /** Status transition is not allowed */
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  /** User doesn't have permission for this operation */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Operation is not allowed in current state */
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  
  /** Password validation errors */
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  /** Password requires uppercase letter */
  NO_UPPERCASE = 'NO_UPPERCASE',
  /** Password requires lowercase letter */
  NO_LOWERCASE = 'NO_LOWERCASE',
  /** Password requires digit */
  NO_DIGIT = 'NO_DIGIT',
  /** Password is invalid */
  INVALID_PASSWORD = 'INVALID_PASSWORD',
}

/**
 * Single validation error for a specific field.
 */
export interface ValidationErrorDto {
  /** Name of the field that failed validation */
  readonly field: string;
  /** Human-readable error message */
  readonly message: string;
  /** Programmatic error code for handling */
  readonly code: ValidationErrorCode;
  /** The invalid value (optional, for debugging) */
  readonly value?: unknown;
}

/**
 * Complete validation result with all errors.
 */
export interface ValidationResultDto {
  /** Whether validation passed (true if no errors) */
  readonly isValid: boolean;
  /** Array of validation errors (empty if valid) */
  readonly errors: ValidationErrorDto[];
}

/**
 * Field-specific validation constraints for documentation/generation.
 */
export interface FieldConstraints {
  /** Whether the field is required */
  readonly required?: boolean;
  /** Minimum string length */
  readonly minLength?: number;
  /** Maximum string length */
  readonly maxLength?: number;
  /** Minimum numeric value */
  readonly min?: number;
  /** Maximum numeric value */
  readonly max?: number;
  /** Regular expression pattern */
  readonly pattern?: RegExp;
  /** Valid enum values */
  readonly enum?: string[];
  /** Custom validation function */
  readonly custom?: (value: unknown) => boolean;
}

/**
 * Validation schema for defining entity validation rules.
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: FieldConstraints;
};

/**
 * Creates a successful validation result with no errors.
 * @returns A valid ValidationResultDto
 */
export function validResult(): ValidationResultDto {
  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Creates a failed validation result with the provided errors.
 * @param errors - Array of validation errors
 * @returns An invalid ValidationResultDto
 */
export function invalidResult(
  errors: ValidationErrorDto[],
): ValidationResultDto {
  return {
    isValid: false,
    errors,
  };
}

/**
 * Creates a single validation error.
 * @param field - Name of the field that failed validation
 * @param message - Human-readable error message
 * @param code - Programmatic error code
 * @param value - The invalid value (optional)
 * @returns A ValidationErrorDto
 */
export function createError(
  field: string,
  message: string,
  code: ValidationErrorCode,
  value?: unknown,
): ValidationErrorDto {
  return {
    field,
    message,
    code,
    value,
  };
}

/**
 * Merges multiple validation results into a single result.
 * The merged result is valid only if all input results are valid.
 * @param results - Validation results to merge
 * @returns A consolidated ValidationResultDto
 */
export function mergeValidationResults(
  ...results: ValidationResultDto[]
): ValidationResultDto {
  const allErrors = results.flatMap((result) => result.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
