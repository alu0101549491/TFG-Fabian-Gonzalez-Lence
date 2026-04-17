/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 9, 2026
 * @file backend/src/infrastructure/email/email.service.ts
 * @desc Email service for sending transactional emails via SMTP (supports Gmail, SendGrid, etc.).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import nodemailer from 'nodemailer';
import {config} from '../../shared/config';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Email service for sending transactional notifications.
 * Supports SMTP configuration for Gmail, SendGrid, or other providers.
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initializes the nodemailer transporter with SMTP configuration.
   */
  private initializeTransporter(): void {
    if (!config.email.host || !config.email.user || !config.email.password) {
      console.warn('⚠️ Email configuration incomplete. Email notifications will be skipped.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Sends a notification email to a user.
   *
   * @param recipientEmail - Email address of the recipient
   * @param recipientName - Name of the recipient
   * @param type - Type of notification
   * @param title - Email subject line
   * @param message - Plain text message content
   * @param metadata - Optional metadata for building email links
   */
  public async sendNotificationEmail(
    recipientEmail: string,
    recipientName: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.transporter) {
      console.warn('⚠️ Email transporter not initialized. Skipping email send.');
      return;
    }

    if (!recipientEmail) {
      console.warn('⚠️ Recipient email is missing. Cannot send email.');
      return;
    }

    try {
      const htmlContent = this.buildHtmlTemplate(recipientName, type, title, message, metadata);

      const mailOptions = {
        from: `"${config.email.fromName || 'Tennis Tournament Manager'}" <${config.email.user}>`,
        to: recipientEmail,
        subject: title,
        text: message, // Plain text fallback
        html: htmlContent, // HTML version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully to ${recipientEmail}: ${info.messageId}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${recipientEmail}:`, error);
      // Don't throw error - email failures shouldn't break the application
    }
  }

  /**
   * Builds the HTML email template.
   *
   * @param recipientName - Name of the recipient
   * @param type - Type of notification
   * @param title - Email title
   * @param message - Email message
   * @param metadata - Optional metadata for building links
   * @returns HTML email content
   */
  private buildHtmlTemplate(
    recipientName: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): string {
    const appUrl = config.email.appUrl || 'http://localhost:4200';
    const actionLink = this.getActionLink(type, metadata, appUrl);
    const emoji = this.getNotificationEmoji(type);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .email-body {
      padding: 30px 20px;
    }
    .notification-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
      text-align: center;
    }
    .greeting {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #1f2937;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .action-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      text-align: center;
      margin: 20px 0;
    }
    .action-button:hover {
      background-color: #2563eb;
    }
    .email-footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer-links {
      margin-top: 12px;
    }
    .footer-links a {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🎾 Tennis Tournament Manager</h1>
    </div>
    <div class="email-body">
      <span class="notification-icon">${emoji}</span>
      <div class="greeting">Hi ${recipientName},</div>
      <div class="message">${message}</div>
      ${actionLink ? `<a href="${actionLink}" class="action-button">View Details</a>` : ''}
    </div>
    <div class="email-footer">
      <p>You're receiving this email because you have email notifications enabled.</p>
      <div class="footer-links">
        <a href="${appUrl}/notification-preferences">Manage Preferences</a> | 
        <a href="${appUrl}">Visit App</a>
      </div>
      <p style="margin-top: 12px; font-size: 12px; color: #9ca3af;">
        Tennis Tournament Manager &copy; ${new Date().getFullYear()}
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Ge gets the emoji for a notification type.
   *
   * @param type - Notification type
   * @returns Emoji character
   */
  private getNotificationEmoji(type: NotificationType): string {
    const emojiMap: Record<NotificationType, string> = {
      [NotificationType.REGISTRATION_CONFIRMED]: '✅',
      [NotificationType.MATCH_SCHEDULED]: '📅',
      [NotificationType.RESULT_ENTERED]: '🎾',
      [NotificationType.ORDER_OF_PLAY_PUBLISHED]: '📋',
      [NotificationType.ANNOUNCEMENT]: '📢',
      [NotificationType.RESULT_CONFIRMED]: '✅',
      [NotificationType.RESULT_DISPUTED]: '⚠️',
      [NotificationType.DISPUTE_RESOLVED]: '⚖️',
      [NotificationType.MATCH_SUSPENDED]: '⏸️',
      [NotificationType.MATCH_RESUMED]: '▶️',
      [NotificationType.MATCH_DEFAULT]: '🚫',
    };

    return emojiMap[type] || '🔔';
  }

  /**
   * Gets the action link for a notification type.
   *
   * @param type - Notification type
   * @param metadata - Notification metadata
   * @param appUrl - Base application URL
   * @returns Action link URL or null
   */
  private getActionLink(
    type: NotificationType,
    metadata: Record<string, unknown> | undefined,
    appUrl: string,
  ): string | null {
    if (!metadata) {
      return null;
    }

    switch (type) {
      case NotificationType.REGISTRATION_CONFIRMED:
      case NotificationType.ORDER_OF_PLAY_PUBLISHED:
        return metadata.tournamentId ? `${appUrl}/tournaments/${metadata.tournamentId}` : null;

      case NotificationType.MATCH_SCHEDULED:
      case NotificationType.RESULT_ENTERED:
        return metadata.matchId ? `${appUrl}/matches/${metadata.matchId}` : null;

      case NotificationType.ANNOUNCEMENT:
        return metadata.announcementId ? `${appUrl}/announcements?id=${metadata.announcementId}` : null;

      default:
        return null;
    }
  }

  /**
   * Verifies the email configuration by sending a test email.
   *
   * @returns True if test email was sent successfully
   */
  public async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️ Email transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email configuration verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email configuration verification failed:', error);
      return false;
    }
  }
}
