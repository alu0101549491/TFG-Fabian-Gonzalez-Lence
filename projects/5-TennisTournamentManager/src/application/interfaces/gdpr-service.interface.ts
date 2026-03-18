/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/interfaces/gdpr-service.interface.ts
 * @desc GDPR service interface for data protection compliance (NFR14)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {
  GDPRDataExportRequestDto,
  GDPRDataExportResultDto,
  GDPRDeletionRequestDto,
  GDPRDeletionResultDto,
  GDPRConsentUpdateDto,
} from '../dto/gdpr.dto';

/**
 * GDPR service interface for data protection compliance.
 * Implements GDPR Articles 15 (Right of Access), 17 (Right to Erasure), and 7 (Consent).
 *
 * @remarks
 * Provides core GDPR functionality per NFR14:
 * - Data export (Right of Access)
 * - Account deletion with anonymization (Right to Erasure)
 * - Consent management
 * 
 * All operations comply with GDPR data minimization and purpose limitation principles.
 *
 * @example
 * ```typescript
 * // Export user data
 * const exportResult = await gdprService.exportUserData({
 *   userId: 'user_123',
 *   format: 'JSON'
 * });
 * 
 * // Request account deletion
 * const deletionResult = await gdprService.requestAccountDeletion({
 *   userId: 'user_123',
 *   confirmed: true
 * });
 * ```
 */
export interface IGDPRService {
  /**
   * Exports all user data for GDPR Right of Access (Article 15).
   * Gathers data from all relevant repositories and returns comprehensive export.
   *
   * @param request - Export request with format and filters
   * @returns Complete user data export in requested format
   * 
   * @remarks
   * Export includes:
   * - Personal information (profile, contact)
   * - Privacy settings
   * - Tournament registrations
   * - Match history
   * - Statistics
   * - Payment history
   * - Notification history (last 100)
   * 
   * Formats:
   * - JSON: Structured data for programmatic use
   * - PDF: Human-readable document for download
   */
  exportUserData(request: GDPRDataExportRequestDto): Promise<GDPRDataExportResultDto>;

  /**
   * Anonymizes user data for GDPR Right to Erasure (Article 17).
   * Preserves tournament structural integrity while removing personal data.
   *
   * @param request - Deletion request with user ID and confirmation
   * @returns Deletion result with anonymization summary
   * 
   * @remarks
   * Anonymization strategy:
   * - Replaces personal data with "Anonymous User" + anonymized ID
   * - Preserves tournament matches, results, and draw structure
   * - Maintains statistical integrity for tournament records
   * - Deletes notifications and sensitive personal data
   * - Marks account as deleted (isActive = false)
   * 
   * Data retained (anonymized):
   * - Match results (opponent sees "Anonymous User")
   * - Tournament participation (draw structure preserved)
   * - Statistics (aggregated, personal identity removed)
   * 
   * Data deleted:
   * - Email, phone, contact information
   * - Notification history
   * - Privacy preferences
   */
  requestAccountDeletion(request: GDPRDeletionRequestDto): Promise<GDPRDeletionResultDto>;

  /**
   * Retrieves current GDPR consent status for a user.
   *
   * @param userId - User ID to check
   * @returns Current consent status and timestamp
   */
  getGDPRConsent(userId: string): Promise<{ gdprConsent: boolean; consentUpdatedAt: Date }>;

  /**
   * Updates GDPR consent status for a user.
   *
   * @param userId - User ID to update
   * @param consent - New consent status
   * @returns Updated consent information
   * 
   * @remarks
   * Consent is required for:
   * - Account creation
   * - Data processing for tournament management
   * - Communication via email/notifications
   */
  updateGDPRConsent(userId: string, consent: boolean): Promise<GDPRConsentUpdateDto>;

  /**
   * Validates if user data export is allowed.
   * Checks user existence and authorization.
   *
   * @param userId - User ID requesting export
   * @returns True if export is allowed
   */
  canExportData(userId: string): Promise<boolean>;

  /**
   * Validates if account deletion is allowed.
   * Checks for active tournament participation or pending payments.
   *
   * @param userId - User ID requesting deletion
   * @returns Object with canDelete flag and blocking reasons
   */
  canDeleteAccount(userId: string): Promise<{
    canDelete: boolean;
    blockingReasons: string[];
  }>;
}
