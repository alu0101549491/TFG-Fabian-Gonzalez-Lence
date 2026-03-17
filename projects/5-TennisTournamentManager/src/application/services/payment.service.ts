/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/payment.service.ts
 * @desc Payment service implementation for tournament registration payment processing
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {IPaymentService} from '../interfaces/payment-service.interface';
import {InitiatePaymentDto, PaymentDto} from '../dto';
import {IPaymentRepository} from '@domain/repositories/payment-repository.interface';
import {IRegistrationRepository} from '@domain/repositories/registration-repository.interface';
import {Payment} from '@domain/entities/payment';
import {PaymentStatus} from '@domain/enumerations/payment-status';
import {generateId} from '@shared/utils';

/**
 * Payment service implementation.
 * Handles payment processing, refunds, and payment history for tournament registrations.
 */
export class PaymentService implements IPaymentService {
  /**
   * Creates a new PaymentService instance.
   *
   * @param paymentRepository - Payment repository for data access
   * @param registrationRepository - Registration repository for registration data access
   */
  public constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly registrationRepository: IRegistrationRepository,
    // TODO: inject IPaymentGateway
  ) {}

  /**
   * Processes a payment for a tournament registration.
   *
   * @param data - Payment initiation data
   * @param participantId - ID of the participant making the payment
   * @returns Processed payment information
   */
  public async processPayment(data: InitiatePaymentDto, participantId: string): Promise<PaymentDto> {
    // Validate input
    if (!data.registrationId || data.registrationId.trim().length === 0) {
      throw new Error('Registration ID is required');
    }
    
    if (!data.paymentMethod || data.paymentMethod.trim().length === 0) {
      throw new Error('Payment method is required');
    }
    
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    // Check if registration exists
    const registration = await this.registrationRepository.findById(data.registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }
    
    // Check authorization
    if (registration.participantId !== participantId) {
      throw new Error('User is not authorized to pay for this registration');
    }
    
    // Create payment entity
    const payment = new Payment({
      id: generateId(),
      registrationId: data.registrationId,
      participantId,
      amount: 0, // In real implementation, get from tournament registration fee
      currency: 'EUR',
      status: PaymentStatus.PENDING,
      paymentMethod: data.paymentMethod,
    });
    
    // Save payment
    const savedPayment = await this.paymentRepository.save(payment);
    
    // In real implementation, integrate with payment gateway
    // const gatewayResponse = await this.paymentGateway.processPayment(data);
    // Update payment status based on gateway response
    
    // For now, mark as completed (placeholder)
    const completedPayment = new Payment({
      ...savedPayment,
      status: PaymentStatus.COMPLETED,
      completedAt: new Date(),
    });
    
    const finalPayment = await this.paymentRepository.update(completedPayment);
    
    // Map to DTO
    return this.mapPaymentToDto(finalPayment);
  }

  /**
   * Retrieves a payment by its ID.
   *
   * @param paymentId - ID of the payment
   * @returns Payment information
   */
  public async getPaymentById(paymentId: string): Promise<PaymentDto> {
    // Validate input
    if (!paymentId || paymentId.trim().length === 0) {
      throw new Error('Payment ID is required');
    }
    
    // Find payment
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Map to DTO
    return this.mapPaymentToDto(payment);
  }

  /**
   * Retrieves all payments for a participant.
   *
   * @param participantId - ID of the participant
   * @returns List of payments
   */
  public async getPaymentsByParticipant(participantId: string): Promise<PaymentDto[]> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    const payments = await this.paymentRepository.findByParticipantId(participantId);
    return payments.map(p => this.mapPaymentToDto(p));
  }

  /**
   * Refunds a payment.
   *
   * @param paymentId - ID of the payment to refund
   * @param userId - ID of the user processing the refund
   * @returns Updated payment information with refund details
   */
  public async refundPayment(paymentId: string, userId: string): Promise<PaymentDto> {
    // Validate input
    if (!paymentId || paymentId.trim().length === 0) {
      throw new Error('Payment ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if payment exists
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Can only refund completed payments');
    }
    
    // Process refund through payment gateway
    // In real implementation:
    // const refundResponse = await this.paymentGateway.refund(paymentId);
    
    // Update payment status
    const refundedPayment = new Payment({
      ...payment,
      status: PaymentStatus.REFUNDED,
    });
    
    const savedPayment = await this.paymentRepository.update(refundedPayment);
    
    // Map to DTO
    return this.mapPaymentToDto(savedPayment);
  }

  /**
   * Handles payment gateway webhook notifications.
   *
   * @param payload - Webhook payload from payment provider
   */
  public async handleWebhook(payload: unknown): Promise<void> {
    // Validate payload
    if (!payload) {
      throw new Error('Webhook payload is required');
    }
    
    // In real implementation:
    // 1. Verify webhook signature
    // 2. Parse payload based on payment provider format
    // 3. Update payment status in database
    // 4. Send notifications to participants
    
    // Placeholder implementation
    console.log('Processing webhook:', payload);
  }

  /**
   * Maps a Payment entity to PaymentDto.
   *
   * @param payment - Payment entity
   * @returns Payment DTO
   */
  private mapPaymentToDto(payment: Payment): PaymentDto {
    return {
      id: payment.id,
      registrationId: payment.registrationId,
      participantId: payment.participantId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    };
  }
}
