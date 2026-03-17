/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/payment-service.interface.ts
 * @desc Payment service interface for tournament registration payment processing
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {InitiatePaymentDto, PaymentDto} from '../dto';

/**
 * Payment service interface.
 * Handles payment processing, refunds, and payment history for tournament registrations.
 */
export interface IPaymentService {
  /**
   * Processes a payment for a tournament registration.
   *
   * @param data - Payment initiation data
   * @param participantId - ID of the participant making the payment
   * @returns Processed payment information
   */
  processPayment(data: InitiatePaymentDto, participantId: string): Promise<PaymentDto>;

  /**
   * Retrieves a payment by its ID.
   *
   * @param paymentId - ID of the payment
   * @returns Payment information
   */
  getPaymentById(paymentId: string): Promise<PaymentDto>;

  /**
   * Retrieves all payments for a participant.
   *
   * @param participantId - ID of the participant
   * @returns List of payments
   */
  getPaymentsByParticipant(participantId: string): Promise<PaymentDto[]>;

  /**
   * Refunds a payment.
   *
   * @param paymentId - ID of the payment to refund
   * @param userId - ID of the user processing the refund
   * @returns Updated payment information with refund details
   */
  refundPayment(paymentId: string, userId: string): Promise<PaymentDto>;

  /**
   * Handles payment gateway webhook notifications.
   *
   * @param payload - Webhook payload from payment provider
   */
  handleWebhook(payload: unknown): Promise<void>;
}
