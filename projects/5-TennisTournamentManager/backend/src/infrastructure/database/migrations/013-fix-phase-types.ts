/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 24, 2026
 * @file backend/src/infrastructure/database/migrations/013-fix-phase-types.ts
 * @desc Database migration to fix phaseType for auto-generated bracket phases.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Fixes phaseType for existing auto-generated phases.
 * 
 * - Sets phaseType='MAIN' for bracket-generated phases (Round of 16, Quarterfinals, etc.)
 * - Sets phaseType='CONSOLATION' for consolation draw phases
 * - Leaves manually created custom phases unchanged
 */
export class FixPhaseTypes1745510400000 implements MigrationInterface {
  public name = 'FixPhaseTypes1745510400000';

  /**
   * Updates phaseType for auto-generated phases based on naming patterns.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update consolation phases
    await queryRunner.query(`
      UPDATE "phases" 
      SET "phaseType" = 'CONSOLATION' 
      WHERE "name" LIKE '%Consolation%' 
        AND "phaseType" = 'CUSTOM'
    `);

    // Update main draw phases (Round of X format for single elimination)
    await queryRunner.query(`
      UPDATE "phases" 
      SET "phaseType" = 'MAIN' 
      WHERE "name" IN ('Round of 16', 'Round of 32', 'Round of 64', 'Round of 128') 
        AND "phaseType" = 'CUSTOM'
    `);

    // Update quarterfinals, semifinals, finals
    await queryRunner.query(`
      UPDATE "phases" 
      SET "phaseType" = 'MAIN' 
      WHERE "name" IN ('Quarterfinals', 'Semifinals', 'Final') 
        AND "phaseType" = 'CUSTOM'
    `);

    // Update round robin phases (Round 1, Round 2, etc.)
    await queryRunner.query(`
      UPDATE "phases" 
      SET "phaseType" = 'MAIN' 
      WHERE "name" ~ '^Round [0-9]+$' 
        AND "phaseType" = 'CUSTOM'
    `);

    // Update match play phases
    await queryRunner.query(`
      UPDATE "phases" 
      SET "phaseType" = 'MAIN' 
      WHERE "name" = 'Open Play' 
        AND "phaseType" = 'CUSTOM'
    `);

    console.log('✅ Migration 013: Fixed phaseType for auto-generated bracket phases');
  }

  /**
   * Reverts phaseType changes back to CUSTOM.
   *
   * @param queryRunner - TypeORM query runner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert all MAIN and CONSOLATION phases back to CUSTOM
    await queryRunner.query(`
      UPDATE "phases" 
      SET "phaseType" = 'CUSTOM' 
      WHERE "phaseType" IN ('MAIN', 'CONSOLATION')
    `);

    console.log('✅ Migration 013 (down): Reverted phaseType changes');
  }
}
