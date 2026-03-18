/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/dto/gdpr.dto.ts
 * @desc Data Transfer Objects for GDPR compliance operations (NFR14)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * User data export DTO for GDPR Right of Access (NFR14).
 * Contains all personal data associated with a user account.
 *
 * @remarks
 * This DTO provides comprehensive data export in compliance with GDPR Article 15 (Right of Access).
 * Data is exportable in JSON and PDF formats.
 */
export interface GDPRDataExportDto {
  /** Export metadata */
  exportedAt: Date;
  exportFormat: 'JSON' | 'PDF';
  userId: string;

  /** Personal Information */
  personalData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    gdprConsent: boolean;
    createdAt: Date;
    lastLogin: Date | null;
  };

  /** Privacy Settings */
  privacySettings: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
    showStatistics: boolean;
    allowMessaging: boolean;
    showMatchHistory: boolean;
    shareDataThirdParty: boolean;
  };

  /** Tournament Registrations */
  registrations: Array<{
    tournamentId: string;
    tournamentName: string;
    category: string;
    status: string;
    registeredAt: Date;
    acceptanceType: string;
  }>;

  /** Match History */
  matches: Array<{
    matchId: string;
    tournamentName: string;
    opponent: string;
    date: Date;
    result: string;
    score: string;
    isWinner: boolean;
  }>;

  /** Statistics */
  statistics: {
    totalMatches: number;
    wins: number;
    losses: number;
    winPercentage: number;
    setsWon: number;
    setsLost: number;
    gamesWon: number;
    gamesLost: number;
    currentWinStreak: number;
    bestWinStreak: number;
    currentLossStreak?: number;
    worstLossStreak?: number;
  };

  /** Payment History */
  payments: Array<{
    paymentId: string;
    tournamentName: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date;
    method: string;
  }>;

  /** Notification History (last 100) */
  notifications: Array<{
    notificationId: string;
    type: string;
    title: string;
    message: string;
    sentAt: Date;
    isRead: boolean;
  }>;
}

/**
 * Request DTO for user data export (Right of Access).
 *
 * @remarks
 * Specifies export format and optional filters for data export.
 */
export interface GDPRDataExportRequestDto {
  /** User ID requesting data export */
  userId: string;

  /** Desired export format */
  format: 'JSON' | 'PDF';

  /** Optional: Include match history (default: true) */
  includeMatchHistory?: boolean;

  /** Optional: Include payment history (default: true) */
  includePaymentHistory?: boolean;

  /** Optional: Include notification history (default: true) */
  includeNotificationHistory?: boolean;
}

/**
 * Result DTO for data export operation.
 */
export interface GDPRDataExportResultDto {
  /** Operation success status */
  success: boolean;

  /** Export data (JSON format or base64-encoded PDF) */
  data: GDPRDataExportDto | string;

  /** Filename for download */
  filename: string;

  /** MIME type */
  mimeType: string;

  /** Export timestamp */
  exportedAt: Date;

  /** Error message (if failed) */
  error?: string;
}

/**
 * Request DTO for account deletion (Right to Erasure).
 *
 * @remarks
 * User requests account deletion. Personal data is anonymized while preserving
 * tournament structural integrity per GDPR Article 17.
 */
export interface GDPRDeletionRequestDto {
  /** User ID requesting deletion */
  userId: string;

  /** Reason for deletion (optional) */
  reason?: string;

  /** Confirmation flag (must be true) */
  confirmed: boolean;
}

/**
 * Result DTO for account deletion operation.
 */
export interface GDPRDeletionResultDto {
  /** Operation success status */
  success: boolean;

  /** Anonymized user ID (for audit trail) */
  anonymizedUserId: string;

  /** Deletion timestamp */
  deletedAt: Date;

  /** Summary of anonymized data */
  summary: {
    registrationsAnonymized: number;
    matchesAnonymized: number;
    paymentsAnonymized: number;
    notificationsDeleted: number;
  };

  /** Error message (if failed) */
  error?: string;
}

/**
 * Consent update DTO for GDPR consent management.
 */
export interface GDPRConsentUpdateDto {
  /** User ID */
  userId: string;

  /** New consent status */
  gdprConsent: boolean;

  /** Consent update timestamp */
  consentUpdatedAt: Date;

  /** Consent update reason (optional) */
  reason?: string;
}
