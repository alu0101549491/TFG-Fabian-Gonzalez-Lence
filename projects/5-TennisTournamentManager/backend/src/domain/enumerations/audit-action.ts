/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file backend/src/domain/enumerations/audit-action.ts
 * @desc Enumeration of audit log action types for system activity tracking
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enumeration of possible audit actions tracked by the system.
 * Represents critical operations that require logging for compliance and security.
 * 
 * @enum {string}
 */
export enum AuditAction {
  /** Resource creation */
  CREATE = 'CREATE',
  
  /** Resource modification */
  UPDATE = 'UPDATE',
  
  /** Resource deletion */
  DELETE = 'DELETE',
  
  /** User login authentication */
  LOGIN = 'LOGIN',
  
  /** User logout */
  LOGOUT = 'LOGOUT',
  
  /** Password change operation */
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  /** User role modification */
  ROLE_CHANGE = 'ROLE_CHANGE',
  
  /** Match result submission */
  RESULT_SUBMIT = 'RESULT_SUBMIT',
  
  /** Match result confirmation */
  RESULT_CONFIRM = 'RESULT_CONFIRM',
  
  /** Match result dispute */
  RESULT_DISPUTE = 'RESULT_DISPUTE',
  
  /** Admin result validation */
  RESULT_VALIDATE = 'RESULT_VALIDATE',
  
  /** Result annulment */
  RESULT_ANNUL = 'RESULT_ANNUL',
  
  /** Match score update */
  SCORE_UPDATE = 'SCORE_UPDATE',
  
  /** Match state transition */
  STATE_CHANGE = 'STATE_CHANGE',
  
  /** Bracket generation */
  BRACKET_GENERATE = 'BRACKET_GENERATE',
  
  /** Registration approval */
  REGISTRATION_APPROVE = 'REGISTRATION_APPROVE',
  
  /** Registration rejection */
  REGISTRATION_REJECT = 'REGISTRATION_REJECT',
  
  /** Tournament status change */
  STATUS_CHANGE = 'STATUS_CHANGE',
  
  /** Tournament finalization */
  FINALIZE = 'FINALIZE',
  
  /** Announcement publication */
  PUBLISH = 'PUBLISH',
  
  /** GDPR data export */
  DATA_EXPORT = 'DATA_EXPORT',
  
  /** GDPR data deletion */
  DATA_DELETE = 'DATA_DELETE',
}
