/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file backend/src/domain/enumerations/audit-resource-type.ts
 * @desc Enumeration of audit log resource types for categorizing logged actions
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enumeration of resource types that can be audited in the system.
 * Used to categorize audit log entries by the type of entity being operated on.
 * 
 * @enum {string}
 */
export enum AuditResourceType {
  /** User account operations */
  USER = 'USER',
  
  /** Tournament operations */
  TOURNAMENT = 'TOURNAMENT',
  
  /** Match operations */
  MATCH = 'MATCH',
  
  /** Match result operations */
  MATCH_RESULT = 'MATCH_RESULT',
  
  /** Bracket/draw operations */
  BRACKET = 'BRACKET',
  
  /** Tournament registration operations */
  REGISTRATION = 'REGISTRATION',
  
  /** Announcement operations */
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  
  /** Standing/ranking operations */
  STANDING = 'STANDING',
  
  /** Order of play operations */
  ORDER_OF_PLAY = 'ORDER_OF_PLAY',
  
  /** Authentication operations (login, logout, password) */
  AUTHENTICATION = 'AUTHENTICATION',
  
  /** Role and permission operations */
  PERMISSION = 'PERMISSION',
  
  /** GDPR data operations */
  GDPR = 'GDPR',
}
