/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/domain/enumerations/announcement-type.ts
 * @desc Enumeration for announcement visibility type (FR47)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the visibility type of an announcement.
 * 
 * @remarks
 * Implements FR47 (Public and Private Announcement Creation):
 * - PUBLIC announcements are visible to all users (participants and public)
 * - PRIVATE announcements are visible only to tournament participants and administrators
 */
export enum AnnouncementType {
  /**
   * Public announcement visible to all users.
   * Displayed on public pages and in tournament information.
   */
  PUBLIC = 'PUBLIC',

  /**
   * Private announcement visible only to tournament participants.
   * Restricted to registered participants and administrators.
   */
  PRIVATE = 'PRIVATE',
}

/**
 * Type guard to check if a value is a valid AnnouncementType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid AnnouncementType
 */
export function isValidAnnouncementType(value: unknown): value is AnnouncementType {
  return Object.values(AnnouncementType).includes(value as AnnouncementType);
}

/**
 * Array of all announcement types for iteration.
 */
export const ALL_ANNOUNCEMENT_TYPES = Object.values(AnnouncementType);
