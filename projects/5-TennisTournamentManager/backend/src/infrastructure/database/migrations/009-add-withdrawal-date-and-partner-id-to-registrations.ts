/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2026-04-14
 * @file infrastructure/database/migrations/009-add-withdrawal-date-and-partner-id-to-registrations.ts
 * @desc Database migration to add withdrawalDate and partnerId columns to the registrations table.
 *       withdrawalDate records when a participant formally withdrew (FR13).
 *       partnerId links a doubles registration to the partner user (FR15).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Adds `withdrawalDate` and `partnerId` columns to the `registrations` table.
 * - withdrawalDate: nullable timestamp set when a registration is withdrawn (FR13).
 * - partnerId: nullable FK to users(id) representing a doubles partner (FR15).
 */
export class AddWithdrawalDateAndPartnerIdToRegistrations1744628400000 implements MigrationInterface {
  public name = 'AddWithdrawalDateAndPartnerIdToRegistrations1744628400000';

  /**
   * Adds withdrawalDate and partnerId columns to registrations.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "withdrawalDate" TIMESTAMP NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "partnerId" VARCHAR(50) NULL REFERENCES "users"("id") ON DELETE SET NULL`,
    );

    console.log('✅ Migration 009: Added withdrawalDate and partnerId columns to registrations table');
  }

  /**
   * Removes withdrawalDate and partnerId columns from registrations.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "partnerId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "registrations" DROP COLUMN IF EXISTS "withdrawalDate"`,
    );

    console.log('✅ Migration 009 (down): Removed withdrawalDate and partnerId columns from registrations table');
  }
}
