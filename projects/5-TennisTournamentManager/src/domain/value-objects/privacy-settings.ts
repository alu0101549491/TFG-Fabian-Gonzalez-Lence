/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/domain/value-objects/privacy-settings.ts
 * @desc Value object for user privacy configuration (FR58-FR60, NFR11-NFR14)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {PrivacyLevel} from '../enumerations/privacy-level';

/**
 * Privacy settings configuration for a user.
 * 
 * Encapsulates visibility levels for all personal information fields.
 * Each field can have an independent privacy level, allowing granular control
 * over data visibility.
 * 
 * Default values prioritize privacy:
 * - Contact information defaults to ADMINS_ONLY
 * - Public information (avatar, ranking) defaults to ALL_REGISTERED
 * - Sensitive history defaults to TOURNAMENT_PARTICIPANTS
 * 
 * @example
 * ```typescript
 * const settings = PrivacySettings.createDefault();
 * console.log(settings.email); // PrivacyLevel.ADMINS_ONLY
 * 
 * const custom = new PrivacySettings({

 *   phone: PrivacyLevel.ADMINS_ONLY,
 *   avatar: PrivacyLevel.PUBLIC,
 * });
 * ```
 */
export class PrivacySettings {
  /**
   * Email address visibility level.
   * Default: ADMINS_ONLY (most restrictive)
   */
  public readonly email: PrivacyLevel;

  /**
   * Phone number visibility level.
   * Default: ADMINS_ONLY
   */
  public readonly phone: PrivacyLevel;

  /**
   * Telegram username visibility level.
   * Default: ADMINS_ONLY
   */
  public readonly telegram: PrivacyLevel;

  /**
   * WhatsApp number visibility level.
   * Default: ADMINS_ONLY
   */
  public readonly whatsapp: PrivacyLevel;

  /**
   * Avatar image visibility level.
   * Default: ALL_REGISTERED
   */
  public readonly avatar: PrivacyLevel;

  /**
   * Ranking information visibility level.
   * Default: ALL_REGISTERED
   */
  public readonly ranking: PrivacyLevel;

  /**
   * Tournament history visibility level.
   * Default: TOURNAMENT_PARTICIPANTS
   */
  public readonly history: PrivacyLevel;

  /**
   * Personal statistics visibility level.
   * Default: TOURNAMENT_PARTICIPANTS
   */
  public readonly statistics: PrivacyLevel;

  /**
   * Whether other players can contact this user.
   * Default: true (allows contact from tournament participants)
   */
  public readonly allowContact: boolean;

  /**
   * Creates a new PrivacySettings instance.
   * 
   * @param props - Privacy configuration properties
   */
  public constructor(props?: Partial<PrivacySettings>) {
    this.email = props?.email ?? PrivacyLevel.ADMINS_ONLY;
    this.phone = props?.phone ?? PrivacyLevel.ADMINS_ONLY;
    this.telegram = props?.telegram ?? PrivacyLevel.ADMINS_ONLY;
    this.whatsapp = props?.whatsapp ?? PrivacyLevel.ADMINS_ONLY;
    this.avatar = props?.avatar ?? PrivacyLevel.ALL_REGISTERED;
    this.ranking = props?.ranking ?? PrivacyLevel.ALL_REGISTERED;
    this.history = props?.history ?? PrivacyLevel.TOURNAMENT_PARTICIPANTS;
    this.statistics = props?.statistics ?? PrivacyLevel.TOURNAMENT_PARTICIPANTS;
    this.allowContact = props?.allowContact ?? true;

    Object.freeze(this);
  }

  /**
   * Creates default privacy settings with conservative privacy levels.
   * 
   * Contact data: ADMINS_ONLY
   * Public info: ALL_REGISTERED
   * History/Stats: TOURNAMENT_PARTICIPANTS
   * 
   * @returns New PrivacySettings instance with default values
   */
  public static createDefault(): PrivacySettings {
    return new PrivacySettings();
  }

  /**
   * Creates privacy settings with all fields set to PUBLIC.
   * Used for public profiles or test accounts.
   * 
   * @returns New PrivacySettings instance with maximum visibility
   */
  public static createPublic(): PrivacySettings {
    return new PrivacySettings({
      email: PrivacyLevel.PUBLIC,
      phone: PrivacyLevel.PUBLIC,
      telegram: PrivacyLevel.PUBLIC,
      whatsapp: PrivacyLevel.PUBLIC,
      avatar: PrivacyLevel.PUBLIC,
      ranking: PrivacyLevel.PUBLIC,
      history: PrivacyLevel.PUBLIC,
      statistics: PrivacyLevel.PUBLIC,
      allowContact: true,
    });
  }

  /**
   * Creates privacy settings with all fields set to ADMINS_ONLY.
   * Maximum privacy - useful for sensitive accounts.
   * 
   * @returns New PrivacySettings instance with minimum visibility
   */
  public static createPrivate(): PrivacySettings {
    return new PrivacySettings({
      email: PrivacyLevel.ADMINS_ONLY,
      phone: PrivacyLevel.ADMINS_ONLY,
      telegram: PrivacyLevel.ADMINS_ONLY,
      whatsapp: PrivacyLevel.ADMINS_ONLY,
      avatar: PrivacyLevel.ADMINS_ONLY,
      ranking: PrivacyLevel.ADMINS_ONLY,
      history: PrivacyLevel.ADMINS_ONLY,
      statistics: PrivacyLevel.ADMINS_ONLY,
      allowContact: false,
    });
  }

  /**
   * Converts privacy settings to a plain object.
   * Useful for serialization to JSON/database.
   * 
   * @returns Plain object representation
   */
  public toObject(): Record<string, string | boolean> {
    return {
      email: this.email,
      phone: this.phone,
      telegram: this.telegram,
      whatsapp: this.whatsapp,
      avatar: this.avatar,
      ranking: this.ranking,
      history: this.history,
      statistics: this.statistics,
      allowContact: this.allowContact,
    };
  }

  /**
   * Creates PrivacySettings from a plain object.
   * Useful for deserialization from JSON/database.
   * 
   * @param obj - Plain object with privacy configuration
   * @returns New PrivacySettings instance
   */
  public static fromObject(obj: Record<string, unknown>): PrivacySettings {
    return new PrivacySettings({
      email: obj.email as PrivacyLevel,
      phone: obj.phone as PrivacyLevel,
      telegram: obj.telegram as PrivacyLevel,
      whatsapp: obj.whatsapp as PrivacyLevel,
      avatar: obj.avatar as PrivacyLevel,
      ranking: obj.ranking as PrivacyLevel,
      history: obj.history as PrivacyLevel,
      statistics: obj.statistics as PrivacyLevel,
      allowContact: obj.allowContact as boolean,
    });
  }
}
