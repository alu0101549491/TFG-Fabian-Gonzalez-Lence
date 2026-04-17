/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/src/infrastructure/database/migrations/005-add-ball-provider-to-matches.ts
 * @desc Database migration to add the ball_provider column to the matches table (FR31).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Adds the `ball_provider` column to the `matches` table.
 * Stores the brand/model of the balls used in each match (e.g., "Babolat Roland Garros").
 */
export class AddBallProviderToMatches1744368000000 implements MigrationInterface {
  public name = 'AddBallProviderToMatches1744368000000';

  /**
   * Adds the ball_provider VARCHAR column (nullable) to matches.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "ballProvider" VARCHAR(100) NULL`,
    );

    console.log('✅ Migration 005: Added ballProvider column to matches table');
  }

  /**
   * Drops the ball_provider column from matches.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "matches" DROP COLUMN IF EXISTS "ballProvider"`,
    );

    console.log('✅ Migration 005 (down): Removed ballProvider column from matches table');
  }
}
