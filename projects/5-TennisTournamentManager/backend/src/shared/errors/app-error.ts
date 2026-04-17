/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file backend/src/shared/errors/app-error.ts
 * @desc Shared application error type used across backend layers.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Application error class with HTTP status and stable error code metadata.
 */
export class AppError extends Error {
  /** HTTP status code returned to the client. */
  public statusCode: number;

  /** Stable application error identifier for API consumers. */
  public errorCode: string;

  /**
   * Creates an application error carrying HTTP and domain-specific metadata.
   *
   * @param message - Human-readable error description
   * @param statusCode - HTTP status code for the response
   * @param errorCode - Stable machine-readable application error code
   */
  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}