/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/infrastructure/repositories/payment.repository.ts
 * @desc HTTP-based implementation of IPaymentRepository using Axios client
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {Payment} from '@domain/entities/payment';
import {IPaymentRepository} from '@domain/repositories/payment.repository.interface';
import {AxiosClient} from '../http/axios-client';

/**
 * HTTP-based implementation of IPaymentRepository.
 * Communicates with the backend REST API via Axios.
 */
@Injectable({providedIn: 'root'})
export class PaymentRepositoryImpl implements IPaymentRepository {
  /** The HTTP client for making API requests */
  private readonly httpClient = inject(AxiosClient);

  /**
   * Finds a payment by its unique identifier.
   * @param id - The payment identifier
   * @returns Promise resolving to the payment or null if not found
   */
  public async findById(id: string): Promise<Payment | null> {
    try {
      const response = await this.httpClient.get<Payment>(`/payments/${id}`);
      return response;
    } catch (error) {
      if ((error as {response?: {status?: number}}).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all payments from the system.
   * @returns Promise resolving to an array of all payments
   */
  public async findAll(): Promise<Payment[]> {
    const response = await this.httpClient.get<Payment[]>('/payments');
    return response;
  }

  /**
   * Persists a new payment to the database.
   * @param payment - The payment entity to save
   * @returns Promise resolving to the saved payment with assigned ID
   */
  public async save(payment: Payment): Promise<Payment> {
    const response = await this.httpClient.post<Payment>('/payments', payment);
    return response;
  }

  /**
   * Updates an existing payment in the database.
   * @param payment - The payment entity with updated data
   * @returns Promise resolving to the updated payment
   */
  public async update(payment: Payment): Promise<Payment> {
    const response = await this.httpClient.put<Payment>(`/payments/${payment.id}`, payment);
    return response;
  }

  /**
   * Removes a payment from the database.
   * @param id - The identifier of the payment to delete
   * @returns Promise resolving when deletion is complete
   */
  public async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/payments/${id}`);
  }

  /**
   * Retrieves all payments for a specific registration.
   * @param registrationId - The registration identifier
   * @returns Promise resolving to an array of payments
   */
  public async findByRegistrationId(registrationId: string): Promise<Payment[]> {
    const response = await this.httpClient.get<Payment[]>(`/payments?registrationId=${registrationId}`);
    return response;
  }

  /**
   * Retrieves all payments made by a specific participant.
   * @param participantId - The participant's identifier
   * @returns Promise resolving to an array of payments
   */
  public async findByParticipantId(participantId: string): Promise<Payment[]> {
    const response = await this.httpClient.get<Payment[]>(`/payments?participantId=${participantId}`);
    return response;
  }
}
