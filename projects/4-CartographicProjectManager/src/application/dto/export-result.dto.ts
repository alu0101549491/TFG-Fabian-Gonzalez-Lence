/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/export-result.dto.ts
 * @desc Data Transfer Objects for export operation results.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {ExportFormat} from './export-filters.dto';

/**
 * Export operation status.
 */
export enum ExportStatus {
  /** Export is queued */
  PENDING = 'PENDING',
  /** Export is being processed */
  PROCESSING = 'PROCESSING',
  /** Export completed successfully */
  COMPLETED = 'COMPLETED',
  /** Export failed */
  FAILED = 'FAILED',
}

/**
 * Export error codes for programmatic error handling.
 */
export enum ExportErrorCode {
  /** No data found matching the filters */
  NO_DATA = 'NO_DATA',
  /** Too much data to export (exceeds limits) */
  TOO_MUCH_DATA = 'TOO_MUCH_DATA',
  /** Invalid filter parameters provided */
  INVALID_FILTERS = 'INVALID_FILTERS',
  /** Error generating output format */
  FORMAT_ERROR = 'FORMAT_ERROR',
  /** User doesn't have permission to export */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Export generation failed */
  GENERATION_FAILED = 'GENERATION_FAILED',
}

/**
 * Export operation result.
 */
export interface ExportResultDto {
  /** Whether export was successful */
  readonly success: boolean;
  /** Current export status */
  readonly status: ExportStatus;

  /** Export ID for tracking async operations */
  readonly exportId?: string;
  /** Download URL for the generated file */
  readonly downloadUrl?: string;
  /** Generated filename */
  readonly filename?: string;
  /** Export format */
  readonly format: ExportFormat;
  /** Number of records exported */
  readonly recordCount: number;
  /** File size in bytes */
  readonly fileSize?: number;

  /** When export was requested */
  readonly requestedAt: Date;
  /** When export completed */
  readonly completedAt?: Date;
  /** When download link expires */
  readonly expiresAt?: Date;

  /** Error message (if failed) */
  readonly error?: string;
  /** Programmatic error code (if failed) */
  readonly errorCode?: ExportErrorCode;
}

/**
 * Export progress information (for long-running exports).
 */
export interface ExportProgressDto {
  /** Export ID */
  readonly exportId: string;
  /** Current status */
  readonly status: ExportStatus;
  /** Progress percentage (0-100) */
  readonly progress: number;
  /** Current processing step description */
  readonly currentStep: string;
  /** Estimated time remaining in seconds */
  readonly estimatedTimeRemaining?: number;
}

/**
 * Export metadata for history listing.
 */
export interface ExportInfoDto {
  /** Unique export identifier */
  readonly exportId: string;
  /** Export format */
  readonly format: ExportFormat;
  /** Current export status */
  readonly status: ExportStatus;
  /** Number of records exported */
  readonly recordCount: number;
  /** File size in bytes */
  readonly fileSize: number;
  /** When export was requested */
  readonly requestedAt: Date;
  /** When export completed */
  readonly completedAt: Date | null;
  /** Download URL (if still available) */
  readonly downloadUrl: string | null;
  /** When download link expires */
  readonly expiresAt: Date | null;
}
