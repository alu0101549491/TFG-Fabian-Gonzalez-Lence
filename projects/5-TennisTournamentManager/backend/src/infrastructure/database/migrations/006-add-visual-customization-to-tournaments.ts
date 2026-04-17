/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file backend/src/infrastructure/database/migrations/006-add-visual-customization-to-tournaments.ts
 * @desc Database migration to add visual customization columns to tournaments table (NFR18).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Adds visual customization columns to the `tournaments` table.
 * Allows tournament admins to customize colors and banner image for branding.
 */
export class AddVisualCustomizationToTournaments1744455600000 implements MigrationInterface {
  public name = 'AddVisualCustomizationToTournaments1744455600000';

  /**
   * Adds primaryColor, secondaryColor, and bannerUrl columns to tournaments.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add visual customization columns
    await queryRunner.query(
      `ALTER TABLE "tournaments" ADD COLUMN IF NOT EXISTS "primaryColor" VARCHAR(7) DEFAULT '#2563eb'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournaments" ADD COLUMN IF NOT EXISTS "secondaryColor" VARCHAR(7) DEFAULT '#10b981'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournaments" ADD COLUMN IF NOT EXISTS "bannerUrl" VARCHAR(500) NULL`,
    );

    console.log('✅ Migration 006: Added visual customization columns (primaryColor, secondaryColor, bannerUrl) to tournaments table');
  }

  /**
   * Drops visual customization columns from tournaments.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tournaments" DROP COLUMN IF EXISTS "bannerUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournaments" DROP COLUMN IF EXISTS "secondaryColor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournaments" DROP COLUMN IF EXISTS "primaryColor"`,
    );

    console.log('✅ Migration 006 (down): Removed visual customization columns from tournaments table');
  }
}
