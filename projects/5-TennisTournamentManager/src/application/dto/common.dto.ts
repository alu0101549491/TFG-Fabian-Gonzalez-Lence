/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/dto/common.dto.ts
 * @desc Common data transfer objects and validation utilities shared across the application layer.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents a paginated list response.
 */
export interface PaginatedResponseDto<T> {
  /** Array of items in this page. */
  items: T[];
  /** Total number of items across all pages. */
  total: number;
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items per page. */
  pageSize: number;
  /** Total number of pages. */
  totalPages: number;
}

/**
 * Represents the result of a validation operation.
 */
export interface ValidationResultDto {
  /** Whether the validation passed. */
  isValid: boolean;
  /** Array of validation error messages. */
  errors?: string[];
}

/**
 * Pagination query parameters.
 */
export interface PaginationDto {
  /** Page number (1-indexed). */
  page?: number;
  /** Number of items per page. */
  pageSize?: number;
  /** Sort field. */
  sortBy?: string;
  /** Sort direction. */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Creates a successful validation result.
 *
 * @returns A valid ValidationResultDto
 */
export function validResult(): ValidationResultDto {
  return {isValid: true};
}

/**
 * Creates a failed validation result with error messages.
 *
 * @param errors - Array of error message strings
 * @returns An invalid ValidationResultDto
 */
export function invalidResult(errors: string[]): ValidationResultDto {
  return {isValid: false, errors};
}
