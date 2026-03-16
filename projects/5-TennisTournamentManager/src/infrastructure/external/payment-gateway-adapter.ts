/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/external/payment-gateway-adapter.ts
 * @desc External payment gateway integration adapter for processing transactions
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Payment gateway integration adapter.
 * Provides integration with external payment processing services (Stripe, PayPal, etc.).
 * Handles charge creation, refunds, and transaction status retrieval.
 */
export class PaymentGatewayAdapter {
  /**
   * Creates an instance of PaymentGatewayAdapter.
   */
  constructor() {}

  /**
   * Creates a payment charge for a tournament registration or service.
   * @param amount - The charge amount in the smallest currency unit (e.g., cents)
   * @param currency - The ISO 4217 currency code (e.g., 'USD', 'EUR')
   * @param paymentMethod - The payment method identifier or token
   * @returns Promise resolving to the transaction ID upon successful charge
   */
  public async createCharge(amount: number, currency: string, paymentMethod: string): Promise<string> {
    throw new Error('Not implemented');
  }

  /**
   * Issues a refund for a completed transaction.
   * @param transactionId - The identifier of the transaction to refund
   * @returns Promise resolving when the refund is processed successfully
   */
  public async refund(transactionId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieves the current status of a payment transaction.
   * @param transactionId - The identifier of the transaction to query
   * @returns Promise resolving to the transaction status (e.g., 'succeeded', 'pending', 'failed')
   */
  public async getTransactionStatus(transactionId: string): Promise<string> {
    throw new Error('Not implemented');
  }
}
