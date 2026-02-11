/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/external-services/whatsapp.gateway.ts
 * @desc WhatsApp Business API integration via Twilio for notifications
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://www.twilio.com/docs/whatsapp/api}
 */

/**
 * Twilio API base URL
 */
const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01';

/**
 * Rate limit window in minutes
 */
const RATE_LIMIT_MINUTES = 30;

/**
 * Maximum message length (WhatsApp limit)
 */
const MAX_MESSAGE_LENGTH = 1024;

/**
 * Message template identifiers (must be pre-approved in WhatsApp Business)
 */
export const MESSAGE_TEMPLATES = {
  TASK_ASSIGNED: 'task_assigned',
  PROJECT_DEADLINE: 'project_deadline',
  IMPORTANT_MESSAGE: 'important_message',
  TASK_STATUS_CHANGED: 'task_status_changed',
  PROJECT_ASSIGNED: 'project_assigned',
} as const;

/**
 * WhatsApp gateway configuration
 */
export interface WhatsAppConfig {
  /** Twilio account SID */
  accountSid: string;
  /** Twilio authentication token */
  authToken: string;
  /** Twilio WhatsApp number (e.g., +14155238886) */
  fromNumber: string;
  /** Whether gateway is enabled */
  enabled: boolean;
}

/**
 * Message template parameters
 */
export interface TemplateParams {
  /** Parameter key-value pairs */
  [key: string]: string | number;
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  /** Recipient phone number (E.164 format) */
  to: string;
  /** Message template name */
  template: keyof typeof MESSAGE_TEMPLATES;
  /** Template parameter values */
  params: TemplateParams;
}

/**
 * Send message response
 */
export interface SendMessageResponse {
  /** Whether sending succeeded */
  success: boolean;
  /** Twilio message SID if successful */
  messageId: string | null;
  /** Error message if failed */
  error: string | null;
  /** Error code if failed */
  errorCode: WhatsAppErrorCode | null;
}

/**
 * WhatsApp error codes
 */
export enum WhatsAppErrorCode {
  /** Invalid phone number format */
  INVALID_NUMBER = 'INVALID_NUMBER',
  /** Rate limit exceeded */
  RATE_LIMITED = 'RATE_LIMITED',
  /** Template not found or not approved */
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  /** Message delivery failed */
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  /** Twilio service unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Gateway not configured */
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  /** Gateway disabled */
  DISABLED = 'DISABLED',
}

/**
 * Message status enum
 */
export enum MessageStatus {
  /** Message queued for delivery */
  QUEUED = 'queued',
  /** Message sent to WhatsApp */
  SENT = 'sent',
  /** Message delivered to recipient */
  DELIVERED = 'delivered',
  /** Message read by recipient */
  READ = 'read',
  /** Message delivery failed */
  FAILED = 'failed',
  /** Message undelivered */
  UNDELIVERED = 'undelivered',
}

/**
 * Message status callback data (from Twilio webhook)
 */
export interface MessageStatusCallback {
  /** Message SID */
  messageId: string;
  /** Current message status */
  status: MessageStatus;
  /** Error code if failed */
  errorCode?: string;
  /** Error message if failed */
  errorMessage?: string;
  /** Status timestamp */
  timestamp: Date;
}

/**
 * Rate limit tracking entry
 */
interface RateLimitEntry {
  /** Last message sent timestamp */
  lastSentAt: Date;
  /** Number of messages sent */
  count: number;
}

/**
 * Twilio API error class
 */
export class TwilioApiError extends Error {
  public readonly status: number;
  public readonly twilioCode?: number;

  public constructor(message: string, status: number, twilioCode?: number) {
    super(message);
    this.name = 'TwilioApiError';
    this.status = status;
    this.twilioCode = twilioCode;
  }
}

/**
 * WhatsApp gateway interface
 */
export interface IWhatsAppGateway {
  /**
   * Check if gateway is properly configured
   * @returns True if configured, false otherwise
   */
  isConfigured(): boolean;

  /**
   * Check if gateway is enabled
   * @returns True if enabled, false otherwise
   */
  isEnabled(): boolean;

  /**
   * Send message using template
   * @param request - Send message request
   * @returns Send message response
   */
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;

  /**
   * Send task assigned notification
   * @param to - Recipient phone number
   * @param taskDescription - Task description
   * @param dueDate - Task due date
   * @returns Send message response
   */
  sendTaskAssignedNotification(
    to: string,
    taskDescription: string,
    dueDate: string,
  ): Promise<SendMessageResponse>;

  /**
   * Send project deadline warning notification
   * @param to - Recipient phone number
   * @param projectCode - Project code
   * @param daysRemaining - Days until deadline
   * @returns Send message response
   */
  sendProjectDeadlineNotification(
    to: string,
    projectCode: string,
    daysRemaining: number,
  ): Promise<SendMessageResponse>;

  /**
   * Send important message notification
   * @param to - Recipient phone number
   * @param projectCode - Project code
   * @param senderName - Message sender name
   * @returns Send message response
   */
  sendImportantMessageNotification(
    to: string,
    projectCode: string,
    senderName: string,
  ): Promise<SendMessageResponse>;

  /**
   * Check if can send message (rate limit check)
   * @param to - Recipient phone number
   * @param rateLimitKey - Context key for rate limiting
   * @returns True if can send, false otherwise
   */
  canSendMessage(to: string, rateLimitKey: string): boolean;

  /**
   * Get message delivery status
   * @param messageId - Twilio message SID
   * @returns Message status
   */
  getMessageStatus(messageId: string): Promise<MessageStatus>;
}

/**
 * WhatsApp gateway implementation using Twilio API.
 * Handles sending WhatsApp notifications with rate limiting and error handling.
 *
 * @example
 * ```typescript
 * const gateway = new WhatsAppGateway({
 *   accountSid: 'AC...',
 *   authToken: 'your-auth-token',
 *   fromNumber: '+14155238886',
 *   enabled: true
 * });
 *
 * // Send task notification
 * const response = await gateway.sendTaskAssignedNotification(
 *   '+34612345678',
 *   'Review cartography plans',
 *   '2026-02-15'
 * );
 *
 * if (response.success) {
 *   console.log('Notification sent:', response.messageId);
 * } else {
 *   console.error('Failed:', response.error);
 * }
 * ```
 */
export class WhatsAppGateway implements IWhatsAppGateway {
  /** Gateway configuration */
  private config: WhatsAppConfig;

  /** Rate limit tracking map */
  private rateLimitMap: Map<string, RateLimitEntry> = new Map();

  /**
   * Create WhatsApp gateway instance
   * @param config - Gateway configuration
   */
  public constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  /**
   * Check if gateway is properly configured
   * @returns True if configured, false otherwise
   */
  public isConfigured(): boolean {
    return !!(
      this.config.accountSid &&
      this.config.authToken &&
      this.config.fromNumber
    );
  }

  /**
   * Check if gateway is enabled
   * @returns True if enabled, false otherwise
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update configuration
   * @param config - Partial configuration to update
   */
  public updateConfig(config: Partial<WhatsAppConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable gateway
   * @param enabled - Whether to enable gateway
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Send message using template
   * @param request - Send message request
   * @returns Send message response
   */
  public async sendMessage(
    request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    // Check if configured and enabled
    if (!this.isConfigured()) {
      return {
        success: false,
        messageId: null,
        error: 'WhatsApp gateway not configured',
        errorCode: WhatsAppErrorCode.NOT_CONFIGURED,
      };
    }

    if (!this.isEnabled()) {
      return {
        success: false,
        messageId: null,
        error: 'WhatsApp notifications are disabled',
        errorCode: WhatsAppErrorCode.DISABLED,
      };
    }

    // Validate phone number
    if (!this.isValidPhoneNumber(request.to)) {
      return {
        success: false,
        messageId: null,
        error: 'Invalid phone number format',
        errorCode: WhatsAppErrorCode.INVALID_NUMBER,
      };
    }

    // Build message body
    const body = this.buildMessageBody(request.template, request.params);

    try {
      const formattedTo = this.formatPhoneNumber(request.to);

      const response = await this.twilioRequest<{
        sid: string;
        status: string;
      }>(`/Accounts/${this.config.accountSid}/Messages.json`, {
        To: `whatsapp:${formattedTo}`,
        From: `whatsapp:${this.config.fromNumber}`,
        Body: body,
      });

      // Record message sent for rate limiting
      this.recordMessageSent(
        this.getRateLimitKey(request.to, request.template),
      );

      return {
        success: true,
        messageId: response.sid,
        error: null,
        errorCode: null,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Send task assigned notification
   * @param to - Recipient phone number
   * @param taskDescription - Task description
   * @param dueDate - Task due date
   * @returns Send message response
   */
  public async sendTaskAssignedNotification(
    to: string,
    taskDescription: string,
    dueDate: string,
  ): Promise<SendMessageResponse> {
    // Check rate limit
    const rateLimitKey = this.getRateLimitKey(to, 'task_assigned');
    if (!this.canSendMessage(to, 'task_assigned')) {
      return {
        success: false,
        messageId: null,
        error: `Rate limit exceeded. Next message allowed in ${RATE_LIMIT_MINUTES} minutes.`,
        errorCode: WhatsAppErrorCode.RATE_LIMITED,
      };
    }

    return this.sendMessage({
      to,
      template: 'TASK_ASSIGNED',
      params: {
        '1': this.truncate(taskDescription, 100),
        '2': dueDate,
      },
    });
  }

  /**
   * Send project deadline warning notification
   * @param to - Recipient phone number
   * @param projectCode - Project code
   * @param daysRemaining - Days until deadline
   * @returns Send message response
   */
  public async sendProjectDeadlineNotification(
    to: string,
    projectCode: string,
    daysRemaining: number,
  ): Promise<SendMessageResponse> {
    // Check rate limit
    if (!this.canSendMessage(to, `project_deadline_${projectCode}`)) {
      return {
        success: false,
        messageId: null,
        error: `Rate limit exceeded. Next message allowed in ${RATE_LIMIT_MINUTES} minutes.`,
        errorCode: WhatsAppErrorCode.RATE_LIMITED,
      };
    }

    return this.sendMessage({
      to,
      template: 'PROJECT_DEADLINE',
      params: {
        '1': projectCode,
        '2': daysRemaining.toString(),
      },
    });
  }

  /**
   * Send important message notification
   * @param to - Recipient phone number
   * @param projectCode - Project code
   * @param senderName - Message sender name
   * @returns Send message response
   */
  public async sendImportantMessageNotification(
    to: string,
    projectCode: string,
    senderName: string,
  ): Promise<SendMessageResponse> {
    // Check rate limit
    if (!this.canSendMessage(to, `message_${projectCode}`)) {
      return {
        success: false,
        messageId: null,
        error: `Rate limit exceeded. Next message allowed in ${RATE_LIMIT_MINUTES} minutes.`,
        errorCode: WhatsAppErrorCode.RATE_LIMITED,
      };
    }

    return this.sendMessage({
      to,
      template: 'IMPORTANT_MESSAGE',
      params: {
        '1': projectCode,
        '2': this.truncate(senderName, 50),
      },
    });
  }

  /**
   * Send task status changed notification
   * @param to - Recipient phone number
   * @param taskDescription - Task description
   * @param newStatus - New task status
   * @returns Send message response
   */
  public async sendTaskStatusChangedNotification(
    to: string,
    taskDescription: string,
    newStatus: string,
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to,
      template: 'TASK_STATUS_CHANGED',
      params: {
        '1': this.truncate(taskDescription, 100),
        '2': newStatus,
      },
    });
  }

  /**
   * Send project assigned notification
   * @param to - Recipient phone number
   * @param projectCode - Project code
   * @param projectName - Project name
   * @returns Send message response
   */
  public async sendProjectAssignedNotification(
    to: string,
    projectCode: string,
    projectName: string,
  ): Promise<SendMessageResponse> {
    return this.sendMessage({
      to,
      template: 'PROJECT_ASSIGNED',
      params: {
        '1': projectCode,
        '2': this.truncate(projectName, 100),
      },
    });
  }

  /**
   * Check if can send message (rate limit check)
   * @param to - Recipient phone number
   * @param rateLimitKey - Context key for rate limiting
   * @returns True if can send, false otherwise
   */
  public canSendMessage(to: string, rateLimitKey: string): boolean {
    const key = this.getRateLimitKey(to, rateLimitKey);
    const entry = this.rateLimitMap.get(key);

    if (!entry) {
      return true;
    }

    const minutesSinceLast =
      (Date.now() - entry.lastSentAt.getTime()) / (1000 * 60);
    return minutesSinceLast >= RATE_LIMIT_MINUTES;
  }

  /**
   * Record message sent for rate limiting
   * @param rateLimitKey - Rate limit tracking key
   */
  private recordMessageSent(rateLimitKey: string): void {
    const existing = this.rateLimitMap.get(rateLimitKey);

    this.rateLimitMap.set(rateLimitKey, {
      lastSentAt: new Date(),
      count: (existing?.count || 0) + 1,
    });
  }

  /**
   * Get message delivery status
   * @param messageId - Twilio message SID
   * @returns Message status
   */
  public async getMessageStatus(messageId: string): Promise<MessageStatus> {
    try {
      const response = await this.twilioRequest<{ status: string }>(
        `/Accounts/${this.config.accountSid}/Messages/${messageId}.json`,
        {},
        'GET',
      );

      return response.status as MessageStatus;
    } catch (error) {
      throw new TwilioApiError(
        'Failed to get message status',
        (error as TwilioApiError).status || 500,
      );
    }
  }

  /**
   * Clean up old rate limit entries (call periodically)
   */
  public cleanupRateLimits(): void {
    const now = Date.now();
    const expiryMs = RATE_LIMIT_MINUTES * 60 * 1000 * 2; // Keep for 2x the rate limit period

    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now - entry.lastSentAt.getTime() > expiryMs) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  /**
   * Make Twilio API request
   * @param endpoint - API endpoint
   * @param data - Request data
   * @param method - HTTP method
   * @returns Response data
   */
  private async twilioRequest<T>(
    endpoint: string,
    data: Record<string, string>,
    method: 'POST' | 'GET' = 'POST',
  ): Promise<T> {
    const url = `${TWILIO_API_URL}${endpoint}`;
    const auth = Buffer.from(
      `${this.config.accountSid}:${this.config.authToken}`,
    ).toString('base64');

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
      },
    };

    if (method === 'POST') {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      options.body = new URLSearchParams(data).toString();
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new TwilioApiError(
        errorData.message || 'Twilio API error',
        response.status,
        errorData.code,
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Format phone number to E.164 format
   * @param phone - Phone number to format
   * @returns Formatted phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except leading +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Ensure E.164 format (starts with +)
    if (!cleaned.startsWith('+')) {
      cleaned = `+${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Validate phone number (E.164 format)
   * @param phone - Phone number to validate
   * @returns True if valid, false otherwise
   */
  private isValidPhoneNumber(phone: string): boolean {
    // E.164 format: + followed by 7-15 digits
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    const formatted = this.formatPhoneNumber(phone);
    return e164Regex.test(formatted);
  }

  /**
   * Build message body from template
   * @param template - Template name
   * @param params - Template parameters
   * @returns Message body
   */
  private buildMessageBody(
    template: string,
    params: TemplateParams,
  ): string {
    const templates: Record<string, string> = {
      task_assigned: '📋 New task assigned: {{1}}\n📅 Due: {{2}}',
      project_deadline: '⚠️ Project {{1}} deadline in {{2}} days',
      important_message: '💬 New message in project {{1}} from {{2}}',
      task_status_changed: '🔄 Task "{{1}}" status changed to: {{2}}',
      project_assigned: '🎉 You have been assigned to project {{1}}: {{2}}',
    };

    let body = templates[template] || template;

    // Replace template parameters
    Object.entries(params).forEach(([key, value]) => {
      body = body.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        String(value),
      );
    });

    // Truncate if too long
    if (body.length > MAX_MESSAGE_LENGTH) {
      body = body.substring(0, MAX_MESSAGE_LENGTH - 3) + '...';
    }

    return body;
  }

  /**
   * Handle Twilio API error
   * @param error - Error object
   * @returns Send message response with error details
   */
  private handleError(error: unknown): SendMessageResponse {
    if (error instanceof TwilioApiError) {
      // Map Twilio error codes to our error codes
      let errorCode = WhatsAppErrorCode.DELIVERY_FAILED;

      if (error.twilioCode === 21211 || error.twilioCode === 21614) {
        errorCode = WhatsAppErrorCode.INVALID_NUMBER;
      } else if (error.status === 429) {
        errorCode = WhatsAppErrorCode.RATE_LIMITED;
      } else if (error.status >= 500) {
        errorCode = WhatsAppErrorCode.SERVICE_UNAVAILABLE;
      }

      return {
        success: false,
        messageId: null,
        error: error.message,
        errorCode,
      };
    }

    return {
      success: false,
      messageId: null,
      error: 'Unknown error occurred',
      errorCode: WhatsAppErrorCode.DELIVERY_FAILED,
    };
  }

  /**
   * Get rate limit key for tracking
   * @param to - Recipient phone number
   * @param contextKey - Context identifier
   * @returns Rate limit key
   */
  private getRateLimitKey(to: string, contextKey: string): string {
    return `${to}:${contextKey}`;
  }

  /**
   * Truncate text to maximum length
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @returns Truncated text
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
