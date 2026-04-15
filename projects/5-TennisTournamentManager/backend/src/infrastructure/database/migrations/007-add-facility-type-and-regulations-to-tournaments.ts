/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file infrastructure/database/migrations/007-add-facility-type-and-regulations-to-tournaments.ts
 * @desc Database migration to add facilityType and regulations columns to the tournaments table (FR1, FR8).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Adds the `facilityType` and `regulations` columns to the `tournaments` table.
 * - facilityType: ENUM ('INDOOR', 'OUTDOOR') with default 'OUTDOOR'
 * - regulations: TEXT field for custom tournament rules and tiebreak criteria
 */
export class AddFacilityTypeAndRegulationsToTournaments1744455600000 implements MigrationInterface {
  public name = 'AddFacilityTypeAndRegulationsToTournaments1744455600000';

  /**
   * Adds facilityType and regulations columns to tournaments.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add facilityType enum column
    await queryRunner.query(
      `ALTER TABLE "tournaments" ADD COLUMN IF NOT EXISTS "facilityType" VARCHAR(20) NOT NULL DEFAULT 'OUTDOOR'`,
    );

    // Add regulations text column
    await queryRunner.query(
      `ALTER TABLE "tournaments" ADD COLUMN IF NOT EXISTS "regulations" TEXT NULL`,
    );

    console.log('✅ Migration 007: Added facilityType and regulations columns to tournaments table');
  }

  /**
   * Drops facilityType and regulations columns from tournaments.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tournaments" DROP COLUMN IF EXISTS "regulations"`,
    );

    await queryRunner.query(
      `ALTER TABLE "tournaments" DROP COLUMN IF EXISTS "facilityType"`,
    );

    console.log('✅ Migration 007 (down): Removed facilityType and regulations columns from tournaments table');
  }
}
