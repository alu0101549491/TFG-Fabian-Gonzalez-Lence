/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/payment.dto.ts
 * @desc Data transfer objects for payment-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {PaymentStatus} from '@domain/enumerations/payment-status';

/** DTO for initiating a payment. */
export interface InitiatePaymentDto {
  registrationId: string;
  paymentMethod: string;
}

/** DTO for payment output representation. */
export interface PaymentDto {
  id: string;
  registrationId: string;
  participantId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
