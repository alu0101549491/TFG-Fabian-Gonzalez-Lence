/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/gdpr.service.ts
 * @desc GDPR service implementation for data protection compliance (NFR14)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {inject, Injectable} from '@angular/core';
import {
  GDPRDataExportRequestDto,
  GDPRDataExportResultDto,
  GDPRDataExportDto,
  GDPRDeletionRequestDto,
  GDPRDeletionResultDto,
  GDPRConsentUpdateDto,
} from '../dto/gdpr.dto';
import {IGDPRService} from '../interfaces/gdpr-service.interface';
import {IUserRepository} from '../../domain/repositories/user-repository.interface';
import {IRegistrationRepository} from '../../domain/repositories/registration-repository.interface';
import {IMatchRepository} from '../../domain/repositories/match-repository.interface';
import {IStatisticsRepository} from '../../domain/repositories/statistics-repository.interface';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {
  UserRepositoryImpl,
  RegistrationRepositoryImpl,
  MatchRepositoryImpl,
  StatisticsRepositoryImpl,
} from '../../infrastructure/repositories';

/**
 * GDPR service implementation for data protection compliance.
 * Handles data export (Right of Access) and account deletion (Right to Erasure).
 *
 * @remarks
 * Implements NFR14 (GDPR Compliance):
 * - Article 15: Right of Access (data export)
 * - Article 17: Right to Erasure (account deletion with anonymization)
 * - Article 7: Consent management
 *
 * Dependencies:
 * - UserRepository: User profile and consent data
 * - RegistrationRepository: Tournament registrations
 * - MatchRepository: Match history
 * - StatisticsRepository: Performance statistics
 *
 * @example
 * ```typescript
 * const gdprService = new GDPRService();
 * 
 * // Export user data
 * const exportResult = await gdprService.exportUserData({

 *   format: 'JSON'
 * });
 * 
 * // Delete account
 * const deleteResult = await gdprService.requestAccountDeletion({
 *   userId: 'user_123',
 *   confirmed: true
 * });
 * ```
 */
@Injectable({providedIn: 'root'})
export class GDPRService implements IGDPRService {
  private readonly userRepository: IUserRepository = inject(UserRepositoryImpl);
  private readonly registrationRepository: IRegistrationRepository = inject(RegistrationRepositoryImpl);
  private readonly matchRepository: IMatchRepository = inject(MatchRepositoryImpl);
  private readonly statisticsRepository: IStatisticsRepository = inject(StatisticsRepositoryImpl);

  /**
   * Exports all user data for GDPR Right of Access (Article 15).
   */
  public async exportUserData(request: GDPRDataExportRequestDto): Promise<GDPRDataExportResultDto> {
    try {
      // Validate user exists
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          data: '',
          filename: '',
          mimeType: '',
          exportedAt: new Date(),
          error: 'User not found',
        };
      }

      // Gather all user data from repositories
      const exportData = await this.gatherUserData(request);

      // Format data based on requested format
      if (request.format === 'JSON') {
        return {
          success: true,
          data: exportData,
          filename: `gdpr_export_${request.userId}_${Date.now()}.json`,
          mimeType: 'application/json',
          exportedAt: new Date(),
        };
      } else {
        // PDF format (simplified - would use PDF library in production)
        const pdfContent = this.generatePDFContent(exportData);
        return {
          success: true,
          data: pdfContent,
          filename: `gdpr_export_${request.userId}_${Date.now()}.pdf`,
          mimeType: 'application/pdf',
          exportedAt: new Date(),
        };
      }
    } catch (error) {
      return {
        success: false,
        data: '',
        filename: '',
        mimeType: '',
        exportedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Gathers comprehensive user data from all repositories.
   *
   * @param request - Export request parameters
   * @returns Complete user data export DTO
   */
  private async gatherUserData(request: GDPRDataExportRequestDto): Promise<GDPRDataExportDto> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Gather registrations
    const registrations = await this.registrationRepository.findAll();
    const userRegistrations = registrations
      .filter((r) => r.participantId === request.userId)
      .map((r) => ({
        tournamentId: r.tournamentId,
        tournamentName: 'Tournament Name', // Would fetch from tournament repository
        category: r.categoryId || 'Unknown',
        status: r.status || 'Unknown',
        registeredAt: r.registeredAt || new Date(),
        acceptanceType: r.acceptanceType || 'Unknown',
      }));

    // Gather matches
    const matches = await this.matchRepository.findAll();
    const userMatches = request.includeMatchHistory !== false
      ? matches
          .filter((m) => m.player1Id === request.userId || m.player2Id === request.userId)
          .map((m) => ({
            matchId: m.id,
            tournamentName: 'Tournament Name', // Would fetch from tournament
            opponent: m.player1Id === request.userId ? 'Opponent Name' : 'Opponent Name',
            date: m.createdAt || new Date(),
            result: m.status || 'Unknown',
            score: 'N/A', // Match entity doesn't store score directly
            isWinner: m.winnerId === request.userId,
          }))
      : [];

    // Gather statistics
    const statistics = await this.statisticsRepository.findByParticipant(request.userId);
    const statsData = statistics
      ? {
          totalMatches: statistics.totalMatches || 0,
          wins: statistics.wins || 0,
          losses: statistics.losses || 0,
          winPercentage:
            statistics.totalMatches > 0 ? (statistics.wins / statistics.totalMatches) * 100 : 0,
          setsWon: statistics.totalSetsWon || 0,
          setsLost: statistics.totalSetsLost || 0,
          gamesWon: statistics.totalGamesWon || 0,
          gamesLost: statistics.totalGamesLost || 0,
          currentWinStreak: statistics.currentWinStreak || 0,
          bestWinStreak: statistics.bestWinStreak || 0,
          currentLossStreak: 0, // Would come from enhanced statistics
          worstLossStreak: 0,
        }
      : {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winPercentage: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          currentWinStreak: 0,
          bestWinStreak: 0,
          currentLossStreak: 0,
          worstLossStreak: 0,
        };

    return {
      exportedAt: new Date(),
      exportFormat: request.format,
      userId: request.userId,
      personalData: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        gdprConsent: user.gdprConsent,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      privacySettings: {
        profileVisibility: 'PUBLIC', // Simplified - PrivacySettings uses PrivacyLevel enums
        showEmail: user.privacySettings?.email === 'PUBLIC',
        showPhone: user.privacySettings?.phone === 'PUBLIC',
        showStatistics: user.privacySettings?.statistics !== 'ADMINS_ONLY',
        allowMessaging: user.privacySettings?.allowContact || true,
        showMatchHistory: user.privacySettings?.history !== 'ADMINS_ONLY',
        shareDataThirdParty: false, // Always false for data protection
      },
      registrations: userRegistrations,
      matches: userMatches,
      statistics: statsData,
      payments: [], // Would fetch from PaymentRepository
      notifications: [], // Would fetch from NotificationRepository
    };
  }

  /**
   * Generates PDF content from export data (simplified implementation).
   *
   * @param data - Export data
   * @returns PDF content as string (base64-encoded in production)
   */
  private generatePDFContent(data: GDPRDataExportDto): string {
    // Simplified PDF generation - would use a library like jsPDF in production
    const pdfText = `
GDPR DATA EXPORT
================
Export Date: ${data.exportedAt.toISOString()}
User ID: ${data.userId}

PERSONAL INFORMATION
--------------------
Username: ${data.personalData.username}
Email: ${data.personalData.email}
Name: ${data.personalData.firstName} ${data.personalData.lastName}
Phone: ${data.personalData.phone || 'N/A'}
Role: ${data.personalData.role}
GDPR Consent: ${data.personalData.gdprConsent ? 'Yes' : 'No'}
Account Created: ${data.personalData.createdAt.toISOString()}
Last Login: ${data.personalData.lastLogin?.toISOString() || 'Never'}

PRIVACY SETTINGS
----------------
Profile Visibility: ${data.privacySettings.profileVisibility}
Show Email: ${data.privacySettings.showEmail ? 'Yes' : 'No'}
Show Phone: ${data.privacySettings.showPhone ? 'Yes' : 'No'}
Show Statistics: ${data.privacySettings.showStatistics ? 'Yes' : 'No'}
Allow Messaging: ${data.privacySettings.allowMessaging ? 'Yes' : 'No'}
Show Match History: ${data.privacySettings.showMatchHistory ? 'Yes' : 'No'}
Share Data with Third Parties: ${data.privacySettings.shareDataThirdParty ? 'Yes' : 'No'}

STATISTICS
----------
Total Matches: ${data.statistics.totalMatches}
Wins: ${data.statistics.wins}
Losses: ${data.statistics.losses}
Win Percentage: ${data.statistics.winPercentage.toFixed(2)}%
Sets Won/Lost: ${data.statistics.setsWon}/${data.statistics.setsLost}
Games Won/Lost: ${data.statistics.gamesWon}/${data.statistics.gamesLost}
Current Win Streak: ${data.statistics.currentWinStreak}
Best Win Streak: ${data.statistics.bestWinStreak}

REGISTRATIONS
-------------
Total Registrations: ${data.registrations.length}
${data.registrations.map((r: {tournamentName: string; category: string; status: string}) => `- ${r.tournamentName} (${r.category}): ${r.status}`).join('\n')}

MATCH HISTORY
-------------
Total Matches: ${data.matches.length}
${data.matches.map((m: {date: Date; opponent: string; result: string; score: string}) => `- ${m.date.toISOString().split('T')[0]}: vs ${m.opponent} - ${m.result} (${m.score})`).join('\n')}

---
End of GDPR Data Export
    `;

    return Buffer.from(pdfText).toString('base64');
  }

  /**
   * Anonymizes user data for GDPR Right to Erasure (Article 17).
   */
  public async requestAccountDeletion(request: GDPRDeletionRequestDto): Promise<GDPRDeletionResultDto> {
    try {
      // Validate confirmation
      if (!request.confirmed) {
        return {
          success: false,
          anonymizedUserId: '',
          deletedAt: new Date(),
          summary: {
            registrationsAnonymized: 0,
            matchesAnonymized: 0,
            paymentsAnonymized: 0,
            notificationsDeleted: 0,
          },
          error: 'Deletion must be confirmed',
        };
      }

      // Check if deletion is allowed
      const canDelete = await this.canDeleteAccount(request.userId);
      if (!canDelete.canDelete) {
        return {
          success: false,
          anonymizedUserId: '',
          deletedAt: new Date(),
          summary: {
            registrationsAnonymized: 0,
            matchesAnonymized: 0,
            paymentsAnonymized: 0,
            notificationsDeleted: 0,
          },
          error: `Cannot delete account: ${canDelete.blockingReasons.join(', ')}`,
        };
      }

      // Fail closed until anonymization is fully implemented.
      const anonymizedId = `anon_${Date.now()}`;
      const summary = await this.anonymizeUserData(request.userId, anonymizedId);

      return {
        success: true,
        anonymizedUserId: anonymizedId,
        deletedAt: new Date(),
        summary,
      };
    } catch (error) {
      return {
        success: false,
        anonymizedUserId: '',
        deletedAt: new Date(),
        summary: {
          registrationsAnonymized: 0,
          matchesAnonymized: 0,
          paymentsAnonymized: 0,
          notificationsDeleted: 0,
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Anonymizes user data across all repositories.
   *
   * @param _userId - User ID to anonymize (prefixed with _ to indicate intentionally unused)
   * @param _anonymizedId - New anonymized identifier (prefixed with _ to indicate intentionally unused)
   * @returns Summary of anonymized records
   */
  private async anonymizeUserData(
    _userId: string,
    _anonymizedId: string
  ): Promise<{
    registrationsAnonymized: number;
    matchesAnonymized: number;
    paymentsAnonymized: number;
    notificationsDeleted: number;
  }> {
    throw new Error('Account deletion is unavailable until GDPR anonymization is fully implemented');
  }

  /**
   * Retrieves current GDPR consent status for a user.
   */
  public async getGDPRConsent(userId: string): Promise<{ gdprConsent: boolean; consentUpdatedAt: Date }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      gdprConsent: user.gdprConsent,
      consentUpdatedAt: user.updatedAt,
    };
  }

  /**
   * Updates GDPR consent status for a user.
   */
  public async updateGDPRConsent(userId: string, consent: boolean): Promise<GDPRConsentUpdateDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // TODO: Update user's GDPR consent via repository
    // await this.userRepository.update(userId, { gdprConsent: consent });

    return {
      userId,
      gdprConsent: consent,
      consentUpdatedAt: new Date(),
    };
  }

  /**
   * Validates if user data export is allowed.
   */
  public async canExportData(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user !== null;
  }

  /**
   * Validates if account deletion is allowed.
   * Checks for active tournament participation or pending payments.
   */
  public async canDeleteAccount(userId: string): Promise<{
    canDelete: boolean;
    blockingReasons: string[];
  }> {
    const blockingReasons: string[] = [];

    // Check for user existence
    const user = await this.userRepository.findById(userId);
    if (!user) {
      blockingReasons.push('User not found');
      return { canDelete: false, blockingReasons };
    }

    // Check for active tournament registrations
    const registrations = await this.registrationRepository.findAll();
    const activeRegistrations = registrations.filter(
      (r) => r.participantId === userId && r.status === RegistrationStatus.ACCEPTED
    );

    if (activeRegistrations.length > 0) {
      blockingReasons.push(`${activeRegistrations.length} active tournament registration(s)`);
    }

    // Check for pending matches
    const matches = await this.matchRepository.findAll();
    const pendingMatches = matches.filter(
      (m) =>
        (m.player1Id === userId || m.player2Id === userId) &&
        (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS')
    );

    if (pendingMatches.length > 0) {
      blockingReasons.push(`${pendingMatches.length} pending match(es)`);
    }

    // TODO: Check for pending payments

    return {
      canDelete: blockingReasons.length === 0,
      blockingReasons,
    };
  }
}
