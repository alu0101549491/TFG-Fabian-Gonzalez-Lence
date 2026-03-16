/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/enumerations/payment-status.ts
 * @desc Enumeration representing the status of a tournament registration payment.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the current status of a payment transaction.
 */
export enum PaymentStatus {
  /** Payment is pending and has not been initiated. */
  PENDING = 'PENDING',
  /** Payment is being processed by the gateway. */
  PROCESSING = 'PROCESSING',
  /** Payment completed successfully. */
  COMPLETED = 'COMPLETED',
  /** Payment failed during processing. */
  FAILED = 'FAILED',
  /** Payment was refunded to the participant. */
  REFUNDED = 'REFUNDED',
  /** Payment was cancelled before processing. */
  CANCELLED = 'CANCELLED',
}

/**
 * Type guard to check if a value is a valid PaymentStatus.
 *
 * @param value - The value to check
 * @returns True if the value is a valid PaymentStatus
 */
export function isValidPaymentStatus(value: unknown): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
}

/** Array of all payment statuses for iteration. */
export const ALL_PAYMENT_STATUSES = Object.values(PaymentStatus);
