/**
 * @module application/dto/validation-result
 * @description Data Transfer Object for validation operation results.
 * @category Application
 */

/**
 * Represents the result of a validation operation (e.g., file validation).
 */
export interface ValidationResult {
  /** Whether the validation passed. */
  isValid: boolean;
  /** List of validation error messages. */
  errors: string[];
  /** List of validation warning messages. */
  warnings: string[];
}
