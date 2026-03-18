/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/announcement.dto.ts
 * @desc Data transfer objects for announcement-related operations (FR47-FR49)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AnnouncementType} from '@domain/enumerations/announcement-type';

/**
 * DTO for creating an announcement (FR47).
 * 
 * @remarks
 * Supports public/private announcements with rich content, scheduling, and expiration.
 */
export interface CreateAnnouncementDto {
  /** Tournament ID this announcement belongs to */
  tournamentId: string;
  
  /** Visibility type (PUBLIC or PRIVATE) */
  type?: AnnouncementType;
  
  /** Announcement title (required) */
  title: string;
  
  /** Brief summary for preview (max 250 chars, optional) */
  summary?: string;
  
  /** Full announcement content (supports markdown/HTML) */
  longText?: string;
  
  /** Legacy content field (for backward compatibility) */
  content?: string;
  
  /** Optional image URL */
  imageUrl?: string;
  
  /** Optional external link */
  externalLink?: string;
  
  /** Tags for categorization (FR48) */
  tags?: string[];
  
  /** Pin announcement to top */
  isPinned?: boolean;
  
  /** Scheduled publication date (FR49) */
  scheduledPublishAt?: Date;
  
  /** Expiration date (FR49) */
  expirationDate?: Date;
}

/**
 * DTO for announcement output representation (FR47-FR49).
 */
export interface AnnouncementDto {
  id: string;
  tournamentId: string;
  authorId: string;
  authorName: string;
  type: AnnouncementType;
  title: string;
  summary: string;
  longText: string;
  content: string; // Legacy field
  imageUrl: string | null;
  externalLink: string | null;
  tags: string[];
  isPublished: boolean;
  isPinned: boolean;
  scheduledPublishAt: Date | null;
  expirationDate: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
