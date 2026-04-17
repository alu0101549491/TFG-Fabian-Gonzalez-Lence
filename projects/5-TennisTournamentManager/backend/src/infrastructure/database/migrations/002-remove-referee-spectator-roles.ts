/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 24, 2026
 * @file backend/src/infrastructure/database/migrations/002-remove-referee-spectator-roles.ts
 * @desc Database migration to remove REFEREE and SPECTATOR roles from user enum (v1.43.0).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Removes REFEREE and SPECTATOR roles to align with specification's 3-role architecture.
 * 
 * **Changes**:
 * - Migrates existing REFEREE users to TOURNAMENT_ADMIN
 * - Deletes existing SPECTATOR users (spectators don't need accounts - use public access)
 * - Removes REFEREE and SPECTATOR from users_role_enum
 * 
 * **Rationale**:
 * Specification defines 3 main roles: SYSTEM_ADMIN, TOURNAMENT_ADMIN, PLAYER.
 * Public spectators access content without authentication via public endpoints.
 */
export class RemoveRefereeSpectatorRoles1711234567890 implements MigrationInterface {
  /**
   * Apply migration: migrate users and update enum.
   * Made idempotent - checks if migration already applied.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if REFEREE enum value exists (migration already applied if not)
    const enumCheckResult = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'users_role_enum' AND e.enumlabel IN ('REFEREE', 'SPECTATOR')
      ) AS has_old_roles;
    `);
    
    const hasOldRoles = enumCheckResult[0]?.has_old_roles;
    
    if (!hasOldRoles) {
      console.log('✓ Migration already applied - REFEREE and SPECTATOR roles not found in enum');
      return;
    }

    // Step 1: Migrate REFEREE users to TOURNAMENT_ADMIN
    await queryRunner.query(`
      UPDATE users 
      SET role = 'TOURNAMENT_ADMIN' 
      WHERE role = 'REFEREE';
    `);

    // Step 2: Delete SPECTATOR users (they can use public access without accounts)
    await queryRunner.query(`
      DELETE FROM users 
      WHERE role = 'SPECTATOR';
    `);

    // Step 3: Remove REFEREE and SPECTATOR from enum
    // PostgreSQL doesn't support ALTER TYPE ... DROP VALUE directly
    // We need to create a new enum and migrate
    
    // Create temporary enum with only 3 roles
    await queryRunner.query(`
      CREATE TYPE users_role_enum_new AS ENUM (
        'SYSTEM_ADMIN',
        'TOURNAMENT_ADMIN',
        'PLAYER'
      );
    `);

    // Update column to use new enum
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE users_role_enum_new 
      USING role::text::users_role_enum_new;
    `);

    // Drop old enum and rename new one
    await queryRunner.query(`
      DROP TYPE users_role_enum;
    `);
    
    await queryRunner.query(`
      ALTER TYPE users_role_enum_new RENAME TO users_role_enum;
    `);
    
    console.log('✓ Removed REFEREE and SPECTATOR roles from enum');
  }

  /**
   * Rollback migration: restore REFEREE and SPECTATOR to enum.
   * Note: Cannot restore deleted SPECTATOR users.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create temporary enum with 5 roles
    await queryRunner.query(`
      CREATE TYPE users_role_enum_old AS ENUM (
        'SYSTEM_ADMIN',
        'TOURNAMENT_ADMIN',
        'REFEREE',
        'PLAYER',
        'SPECTATOR'
      );
    `);

    // Update column to use old enum
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE users_role_enum_old 
      USING role::text::users_role_enum_old;
    `);

    // Drop current enum and rename old one
    await queryRunner.query(`
      DROP TYPE users_role_enum;
    `);
    
    await queryRunner.query(`
      ALTER TYPE users_role_enum_old RENAME TO users_role_enum;
    `);

    // Note: We cannot restore deleted SPECTATOR users
    console.warn('[Migration Rollback] SPECTATOR users were deleted and cannot be restored.');
  }
}
