/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/infrastructure/external/email-adapter.ts
 * @desc Email notification dispatch adapter implementing Observer Pattern channel
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Email notification dispatch adapter.
 * Implements an Observer Pattern notification channel for sending emails.
 * Integrates with external email service providers (SMTP, SendGrid, etc.).
 */
export class EmailAdapter {
  /**
   * Creates an instance of EmailAdapter.
   */
  constructor() {}

  /**
   * Sends an email notification to a recipient.
   * @param to - The recipient's email address
   * @param subject - The email subject line
   * @param body - The HTML or plain text email body content
   * @returns Promise resolving when the email is sent successfully
   */
  public async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Validate input
    if (!to || !subject || !body) {
      throw new Error('Email parameters (to, subject, body) are required');
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email address');
    }

    // In production, use actual email service (SendGrid, AWS SES, etc.)
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${body}`);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
