/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file backend/src/infrastructure/database/migrations/012-add-active-registration-unique-index.ts
 * @desc Migration: Enforce one active registration per participant and category.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Prevents duplicate active registrations for the same participant in one category
 * while still allowing historical cancelled or withdrawn rows to remain.
 */
export class AddActiveRegistrationUniqueIndex1713312000000 implements MigrationInterface {
  /**
   * Creates the partial unique index that blocks duplicate active registrations.
   *
   * @param queryRunner - TypeORM query runner executing the migration
   * @returns Promise resolved when the index has been created
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_active_category_participant_unique
      ON registrations ("categoryId", "participantId")
      WHERE status NOT IN ('CANCELLED', 'WITHDRAWN')
    `);
  }

  /**
   * Removes the partial unique index created by this migration.
   *
   * @param queryRunner - TypeORM query runner executing the rollback
   * @returns Promise resolved when the index has been dropped
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_registration_active_category_participant_unique
    `);
  }
}