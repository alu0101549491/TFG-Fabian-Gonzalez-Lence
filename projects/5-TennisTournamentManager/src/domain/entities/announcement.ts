/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/announcement.ts
 * @desc Entity representing a public announcement published by a tournament administrator.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

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
  /** Announcement title. */
  title: string;
  /** Announcement body content (supports markdown). */
  content: string;
  /** Tags for categorizing the announcement. */
  tags?: string[];
  /** Whether the announcement is currently visible to public. */
  isPublished?: boolean;
  /** Whether the announcement is pinned/sticky. */
  isPinned?: boolean;
  /** Publication timestamp. */
  publishedAt?: Date | null;
  /** Creation timestamp. */
  createdAt?: Date;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a public announcement associated with a tournament.
 *
 * Announcements are created by tournament administrators and can be
 * published to all participants and the public. They trigger notifications
 * through the NotificationService.
 */
export class Announcement {
  public readonly id: string;
  public readonly tournamentId: string;
  public readonly authorId: string;
  public readonly title: string;
  public readonly content: string;
  public readonly tags: string[];
  public readonly isPublished: boolean;
  public readonly isPinned: boolean;
  public readonly publishedAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: AnnouncementProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.authorId = props.authorId;
    this.title = props.title;
    this.content = props.content;
    this.tags = props.tags ?? [];
    this.isPublished = props.isPublished ?? false;
    this.isPinned = props.isPinned ?? false;
    this.publishedAt = props.publishedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Publishes the announcement, making it visible to all users.
   *
   * @returns A new Announcement instance with isPublished=true and publishedAt set
   */
  public publish(): Announcement {
    throw new Error('Not implemented');
  }
}
