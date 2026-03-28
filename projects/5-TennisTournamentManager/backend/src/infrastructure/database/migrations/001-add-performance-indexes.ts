/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file infrastructure/database/migrations/001-add-performance-indexes.ts
 * @desc Database migration to add indexes for query optimization (NFR21).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Creates performance-optimizing indexes on frequently queried columns.
 * 
 * **Indexes Created**:
 * 
 * **Users Table**:
 * - `idx_users_email` (email) - Login queries, user lookups
 * - `idx_users_role` (role) - Role-based filtering
 * - `idx_users_is_active` (isActive) - Active user queries
 * 
 * **Tournaments Table**:
 * - `idx_tournaments_status` (status) - Status filtering (DRAFT, PUBLISHED, etc.)
 * - `idx_tournaments_organizer_id` (organizerId) - Organizer's tournaments
 * - `idx_tournaments_start_date` (startDate) - Date-based queries
 * - `idx_tournaments_status_start_date` (status, startDate) - Composite for active tournaments
 * 
 * **Registrations Table**:
 * - `idx_registrations_tournament_id` (tournamentId) - Tournament registrations
 * - `idx_registrations_participant_id` (participantId) - User registrations
 * - `idx_registrations_status` (status) - Status filtering
 * - `idx_registrations_tournament_status` (tournamentId, status) - Composite
 * 
 * **Matches Table**:
 * - `idx_matches_bracket_id` (bracketId) - Bracket matches
 * - `idx_matches_status` (status) - Match status filtering
 * - `idx_matches_scheduled_time` (scheduledTime) - Order of play queries
 * 
 * **AuditLog Table**:
 * - `idx_audit_user_id` (userId) - User activity logs
 * - `idx_audit_action` (action) - Action type filtering
 * - `idx_audit_resource_type` (resourceType) - Resource filtering
 * - `idx_audit_timestamp` (timestamp) - Date range queries
 * - `idx_audit_user_timestamp` (userId, timestamp) - Composite for user history
 * 
 * **Notifications Table**:
 * - `idx_notifications_user_id` (userId) - User notifications
 * - `idx_notifications_is_read` (isRead) - Unread notification queries
 * - `idx_notifications_user_is_read` (userId, isRead) - Composite for unread count
 * - `idx_notifications_created_at` (createdAt) - Recent notifications
 */
export class AddPerformanceIndexes1714607234567 implements MigrationInterface {
  /**
   * Creates all performance indexes.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
  // Users indexes
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users("isActive");
  `);

  // Tournaments indexes
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id ON tournaments("organizerId");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments("startDate");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_tournaments_status_start_date ON tournaments(status, "startDate");
  `);

  // Registrations indexes
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations("tournamentId");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_registrations_participant_id ON registrations("participantId");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_registrations_tournament_status ON registrations("tournamentId", status);
  `);

  // Matches indexes (matches are linked to brackets, not directly to tournaments)
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_matches_bracket_id ON matches("bracketId");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_matches_scheduled_time ON matches("scheduledTime");
  `);

  // AuditLog indexes
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs("userId");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_resource_type ON audit_logs("resourceType");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_audit_user_timestamp ON audit_logs("userId", timestamp DESC);
  `);

  // Notifications indexes
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications("userId");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON notifications("userId", "isRead");
  `);
  await queryRunner.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications("createdAt" DESC);
  `);
}

  /**
   * Removes all performance indexes created in the up migration.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
  // Drop Users indexes
  await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_active;`);

  // Drop Tournaments indexes
  await queryRunner.query(`DROP INDEX IF EXISTS idx_tournaments_status;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_tournaments_organizer_id;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_tournaments_start_date;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_tournaments_status_start_date;`);

  // Drop Registrations indexes
  await queryRunner.query(`DROP INDEX IF EXISTS idx_registrations_tournament_id;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_registrations_participant_id;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_registrations_status;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_registrations_tournament_status;`);

  // Drop Matches indexes
  await queryRunner.query(`DROP INDEX IF EXISTS idx_matches_bracket_id;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_matches_status;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_matches_scheduled_time;`);

  // Drop AuditLog indexes
  await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_user_id;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_action;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_resource_type;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_timestamp;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_user_timestamp;`);

  // Drop Notifications indexes
  await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user_id;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_is_read;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user_is_read;`);
  await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_created_at;`);
  }
}
