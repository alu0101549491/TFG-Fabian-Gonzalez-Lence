/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/entities/announcement.ts
 * @desc Entity representing a public announcement published by a tournament administrator (FR47-FR49)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {AnnouncementType} from '../enumerations/announcement-type';

/**
 * Properties for creating an Announcement entity.
 */
export interface AnnouncementProps {
  /** Unique identifier for the announcement. */
  id: string;
  /** ID of the tournament this announcement belongs to. */
  tournamentId: string;
  /** ID of the author (tournament admin). */
  authorId: string;
  /** Visibility type (PUBLIC or PRIVATE). */
  type?: AnnouncementType;
  /** Announcement title. */
  title: string;
  /** Brief summary for preview (max 250 chars). */
  summary?: string;
  /** Full announcement content (supports markdown/HTML). */
  longText?: string;
  /** Announcement body content (supports markdown) - legacy field, use longText instead. */
  content?: string;
  /** Optional image URL for visual content. */
  imageUrl?: string | null;
  /** Optional external link for additional resources. */
  externalLink?: string | null;
  /** Tags for categorizing the announcement. */
  tags?: string[];
  /** Whether the announcement is currently visible to public. */
  isPublished?: boolean;
  /** Whether the announcement is pinned/sticky. */
  isPinned?: boolean;
  /** Scheduled publication date (for automatic future publication). */
  scheduledPublishAt?: Date | null;
  /** Expiration date (announcement stops showing after this date). */
  expirationDate?: Date | null;
  /** Publication timestamp. */
  publishedAt?: Date | null;
  /** Creation timestamp. */
  createdAt?: Date;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a public or private announcement associated with a tournament.
 *
 * Announcements are created by tournament administrators and can be
 * published to all participants (PUBLIC) or only to registered participants (PRIVATE).
 * They support scheduled publication (FR49) and automatic expiration.
 * 
 * @remarks
 * Implements FR47-FR49:
 * - FR47: Public/Private announcement creation with rich content
 * - FR48: Tag system for categorization and filtering
 * - FR49: Scheduled publication and automatic expiration
 * 
 * @example
 * ```typescript
 * const announcement = new Announcement({

 *   tournamentId: 'tourn_001',
 *   authorId: 'admin_001',
 *   type: AnnouncementType.PUBLIC,
 *   title: 'Draw Published',
 *   summary: 'The main draw has been published',
 *   longText: 'Full details...',
 *   tags: ['draw', 'results'],
 *   scheduledPublishAt: new Date('2026-03-20'),
 * });
 * 
 * // Check if should be visible
 * if (announcement.shouldBeVisible()) {
 *   console.log('Announcement is visible');
 * }
 * ```
 */
export class Announcement {
  public readonly id: string;
  public readonly tournamentId: string;
  public readonly authorId: string;
  public readonly type: AnnouncementType;
  public readonly title: string;
  public readonly summary: string;
  public readonly longText: string;
  public readonly content: string; // Legacy field
  public readonly imageUrl: string | null;
  public readonly externalLink: string | null;
  public readonly tags: string[];
  public readonly isPublished: boolean;
  public readonly isPinned: boolean;
  public readonly scheduledPublishAt: Date | null;
  public readonly expirationDate: Date | null;
  public readonly publishedAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: AnnouncementProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.authorId = props.authorId;
    this.type = props.type ?? AnnouncementType.PUBLIC;
    this.title = props.title;
    this.summary = props.summary ?? '';
    this.longText = props.longText ?? props.content ?? '';
    this.content = props.content ?? props.longText ?? ''; // Backward compatibility
    this.imageUrl = props.imageUrl ?? null;
    this.externalLink = props.externalLink ?? null;
    this.tags = props.tags ?? [];
    this.isPublished = props.isPublished ?? false;
    this.isPinned = props.isPinned ?? false;
    this.scheduledPublishAt = props.scheduledPublishAt ?? null;
    this.expirationDate = props.expirationDate ?? null;
    this.publishedAt = props.publishedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Publishes the announcement, making it visible to users.
   *
   * @returns A new Announcement instance with isPublished=true and publishedAt set
   * @throws Error if announcement is already published
   */
  public publish(): Announcement {
    if (this.isPublished) {
      throw new Error('Announcement is already published.');
    }
    
    // Return a new instance with updated publication status
    // Following immutability principle in domain entities
    return new Announcement({
      ...this,
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if announcement has reached its scheduled publication date (FR49).
   *
   * @returns True if scheduledPublishAt is null or in the past
   */
  public isScheduledForPublication(): boolean {
    if (!this.scheduledPublishAt) {
      return true; // No scheduled date means immediate publication
    }
    return new Date() >= this.scheduledPublishAt;
  }

  /**
   * Checks if announcement has expired (FR49).
   *
   * @returns True if expirationDate exists and is in the past
   */
  public isExpired(): boolean {
    if (!this.expirationDate) {
      return false; // No expiration date means never expires
    }
    return new Date() > this.expirationDate;
  }

  /**
   * Checks if announcement should be visible to users (FR49).
   * Considers publication status, scheduled date, and expiration.
   *
   * @returns True if announcement should be displayed
   */
  public shouldBeVisible(): boolean {
    return this.isPublished && this.isScheduledForPublication() && !this.isExpired();
  }

  /**
   * Checks if announcement is public (FR47).
   *
   * @returns True if announcement type is PUBLIC
   */
  public isPublic(): boolean {
    return this.type === AnnouncementType.PUBLIC;
  }

  /**
   * Checks if announcement is private (FR47).
   *
   * @returns True if announcement type is PRIVATE
   */
  public isPrivate(): boolean {
    return this.type === AnnouncementType.PRIVATE;
  }
}
