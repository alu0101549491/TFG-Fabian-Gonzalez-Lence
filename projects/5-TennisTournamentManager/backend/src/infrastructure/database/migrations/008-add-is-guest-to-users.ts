/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-04-12
 * @file backend/src/infrastructure/database/migrations/008-add-is-guest-to-users.ts
 * @desc Database migration to add the isGuest column to the users table (FR10).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Adds the `isGuest` boolean column to the `users` table.
 * Guest flag allows admins to enroll non-system participants (FR10).
 */
export class AddIsGuestToUsers1744542000000 implements MigrationInterface {
  public name = 'AddIsGuestToUsers1744542000000';

  /**
   * Adds isGuest column with default false to users.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isGuest" BOOLEAN NOT NULL DEFAULT FALSE`,
    );

    console.log('✅ Migration 008: Added isGuest column to users table');
  }

  /**
   * Drops isGuest column from users.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "isGuest"`,
    );

    console.log('✅ Migration 008 (down): Removed isGuest column from users table');
  }
}
