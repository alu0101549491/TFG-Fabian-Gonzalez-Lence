/**
 * @module Types/Validation
 * @category Types
 * @description
 * This module defines the validation result structure used throughout the Music Web Player application.
 * The ValidationResult interface provides a standardized way to represent the outcome of validation operations,
 * supporting both successful and failed validation scenarios with clear, actionable feedback.
 */

/**
 * Represents the result of a validation operation.
 * This interface follows the Result pattern, providing both a success/failure indicator
 * and detailed error messages when validation fails.
 *
 * @category Types
 */
export interface ValidationResult {
  /**
   * Indicates whether the validation passed (true) or failed (false).
   * @property {boolean} isValid
   * @example true // All validation checks passed
   * @example false // One or more validation checks failed
   */
  readonly isValid: boolean;

  /**
   * Array of human-readable error messages describing validation failures.
   * @property {string[]} errors
   * @example [] // Valid case (empty array)
   * @example ["Title is required"] // Single error
   * @example ["Title is required", "Audio URL must be a valid HTTP/HTTPS URL"] // Multiple errors
   * @remarks
   * - Must be an empty array when `isValid` is `true`
   * - Must contain one or more messages when `isValid` is `false`
   * - Each message should be user-friendly, specific, and actionable
   */
  readonly errors: string[];

  /**
   * Optional array of non-critical warnings that don't prevent submission.
   * @property {string[]} [warnings]
   * @example ["Cover image URL returns 404, placeholder will be used"]
   * @optional
   */
  readonly warnings?: string[];
}
