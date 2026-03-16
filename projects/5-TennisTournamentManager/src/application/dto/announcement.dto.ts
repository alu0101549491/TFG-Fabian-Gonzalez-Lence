/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/announcement.dto.ts
 * @desc Data transfer objects for announcement-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/** DTO for creating an announcement. */
export interface CreateAnnouncementDto {
  tournamentId: string;
  title: string;
  content: string;
  isPinned?: boolean;
}

/** DTO for announcement output representation. */
export interface AnnouncementDto {
  id: string;
  tournamentId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}
