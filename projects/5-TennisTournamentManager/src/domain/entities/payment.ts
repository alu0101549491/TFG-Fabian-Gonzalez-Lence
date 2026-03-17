/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/payment.ts
 * @desc Entity representing a registration payment transaction.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {PaymentStatus} from '../enumerations/payment-status';

/**
 * Properties for creating a Payment entity.
 */
export interface PaymentProps {
  /** Unique identifier for the payment. */
  id: string;
  /** ID of the registration this payment is for. */
  registrationId: string;
  /** ID of the participant making the payment. */
  participantId: string;
  /** Payment amount. */
  amount: number;
  /** Currency code (ISO 4217). */
  currency: string;
  /** Current payment status. */
  status?: PaymentStatus;
  /** External payment gateway transaction ID. */
  transactionId?: string | null;
  /** Payment method description (e.g., "credit_card", "bank_transfer"). */
  paymentMethod?: string | null;
  /** Payment initiation timestamp. */
  createdAt?: Date;
  /** Last status update timestamp. */
  updatedAt?: Date;
  /** Timestamp when payment was completed. */
  completedAt?: Date | null;
}

/**
 * Represents a payment transaction for a tournament registration.
 *
 * Payments are processed through an external payment gateway adapter
 * in the infrastructure layer.
 */
export class Payment {
  public readonly id: string;
  public readonly registrationId: string;
  public readonly participantId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly status: PaymentStatus;
  public readonly transactionId: string | null;
  public readonly paymentMethod: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly completedAt: Date | null;

  constructor(props: PaymentProps) {
    this.id = props.id;
    this.registrationId = props.registrationId;
    this.participantId = props.participantId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.status = props.status ?? PaymentStatus.PENDING;
    this.transactionId = props.transactionId ?? null;
    this.paymentMethod = props.paymentMethod ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.completedAt = props.completedAt ?? null;
  }

  /**
   * Processes the payment transaction.
   */
  public process(): void {
    throw new Error('Not implemented');
  }
}
