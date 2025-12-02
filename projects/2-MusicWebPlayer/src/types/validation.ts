/**
 * Result of a validation operation.
 * @category Types
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  
  /** List of validation error messages */
  errors: string[];
}