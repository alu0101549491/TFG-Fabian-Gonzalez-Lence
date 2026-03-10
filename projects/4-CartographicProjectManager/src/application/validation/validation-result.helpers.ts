/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 10, 2026
 * @file src/application/validation/validation-result.helpers.ts
 * @desc Helper factories for building and merging ValidationResultDto values.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {
  ValidationErrorDto,
  ValidationResultDto,
  ValidationErrorCode,
} from '../dto/validation-result.dto';

/**
 * Create a single validation error.
 *
 * @param field - Field name
 * @param message - Human-readable message
 * @param code - Programmatic error code
 * @param value - Optional invalid value
 * @returns ValidationErrorDto
 */
export function createError(
  field: string,
  message: string,
  code: ValidationErrorCode,
  value?: unknown,
): ValidationErrorDto {
  return value === undefined
    ? {field, message, code}
    : {field, message, code, value};
}

/**
 * Create a valid result (no errors).
 */
export function validResult(): ValidationResultDto {
  return {isValid: true, errors: []};
}

/**
 * Create an invalid result with provided errors.
 *
 * @param errors - Validation errors
 */
export function invalidResult(errors: ValidationErrorDto[]): ValidationResultDto {
  return {isValid: false, errors};
}

/**
 * Merge multiple validation results into one.
 *
 * @param results - Validation results to merge
 */
export function mergeValidationResults(results: ValidationResultDto[]): ValidationResultDto {
  const allErrors = results.flatMap((r) => r.errors ?? []);
  return allErrors.length === 0 ? validResult() : invalidResult(allErrors);
}
