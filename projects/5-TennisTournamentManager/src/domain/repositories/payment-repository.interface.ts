/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/repositories/payment-repository.interface.ts
 * @desc Repository interface for Payment entity data access operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Payment} from '../entities/payment.entity';
import {PaymentStatus} from '../enumerations/payment-status.enum';

/**
 * Repository interface for Payment entity data access operations.
 * Defines the contract for persisting and retrieving payment data.
 */
export interface IPaymentRepository {
  /**
   * Finds a payment by its unique identifier.
   * @param id - The unique identifier
   * @returns Promise resolving to the payment if found, null otherwise
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Retrieves all payments.
   * @returns Promise resolving to an array of payments
   */
  findAll(): Promise<Payment[]>;

  /**
   * Persists a new payment.
   * @param entity - The payment to save
   * @returns Promise resolving to the saved payment
   */
  save(entity: Payment): Promise<Payment>;

  /**
   * Updates an existing payment.
   * @param entity - The payment with updated data
   * @returns Promise resolving to the updated payment
   */
  update(entity: Payment): Promise<Payment>;

  /**
   * Deletes a payment by its unique identifier.
   * @param id - The unique identifier of the payment to delete
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Finds a payment for a specific registration.
   * @param registrationId - The unique identifier of the registration
   * @returns Promise resolving to the payment if found, null otherwise
   */
  findByRegistrationId(registrationId: string): Promise<Payment | null>;

  /**
   * Finds all payments made by a specific participant.
   * @param participantId - The unique identifier of the participant
   * @returns Promise resolving to an array of payments
   */
  findByParticipantId(participantId: string): Promise<Payment[]>;
}
