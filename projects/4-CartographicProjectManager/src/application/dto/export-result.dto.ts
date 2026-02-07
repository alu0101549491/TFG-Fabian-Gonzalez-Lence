/**
 * @module application/dto/export-result
 * @description Data Transfer Object for data export results.
 * @category Application
 */

/**
 * Represents the result of a data export operation.
 */
export interface ExportResult {
  /** Whether the export was successful. */
  success: boolean;
  /** The exported file content as bytes. */
  data?: Uint8Array;
  /** The file name for the export. */
  fileName?: string;
  /** MIME type of the exported file. */
  mimeType?: string;
  /** Number of records exported. */
  recordCount: number;
  /** Error message on failure. */
  errorMessage?: string;
}
