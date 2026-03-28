/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 28, 2026
 * @file infrastructure/database/migrations/004-add-unique-constraint-id-document.ts
 * @desc Database migration to add unique constraint on users.idDocument (FR9 enhancement).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Adds UNIQUE constraint to users.idDocument column to prevent duplicate ID/NIE numbers.
 * 
 * **Changes**:
 * - Adds unique constraint `uq_users_idDocument` on `idDocument` column
 * - Clears any duplicate ID/NIE values before applying constraint
 * 
 * **Rationale**:
 * - **FR9 Enhancement**: ID/NIE documents are personal identification numbers that
 *   should be unique across the system
 * - **Data Integrity**: Prevents multiple users from claiming the same ID/NIE
 * - **Real-World Alignment**: In real tennis tournament systems, ID/NIE uniquely
 *   identifies each participant
 * 
 * **Conflict Resolution**:
 * If duplicate ID/NIE values exist when migration runs:
 * - Sets all duplicates to NULL (requiring users to re-enter valid unique values)
 * - Logs warning about duplicates found
 * - Allows migration to proceed by cleaning data first
 */
export class AddUniqueConstraintIdDocument1711789123456 implements MigrationInterface {
  /**
   * Apply migration: add unique constraint to users.idDocument.
   * Made idempotent - checks if constraint already exists.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if unique constraint already exists
    const constraintExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_users_idDocument'
      ) AS constraint_exists;
    `);

    if (constraintExists[0]?.constraint_exists) {
      console.log('⏭️  Unique constraint uq_users_idDocument already exists, skipping...');
      return;
    }

    // Find and log any duplicate idDocument values (excluding NULLs)
    const duplicates = await queryRunner.query(`
      SELECT "idDocument", COUNT(*) as count
      FROM users
      WHERE "idDocument" IS NOT NULL AND "idDocument" != ''
      GROUP BY "idDocument"
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.length > 0) {
      console.warn('⚠️  Found duplicate ID/NIE values:', duplicates);
      console.warn('⚠️  Setting duplicates to NULL to allow unique constraint...');
      
      // Set duplicate idDocument values to NULL
      for (const dup of duplicates) {
        await queryRunner.query(`
          UPDATE users
          SET "idDocument" = NULL
          WHERE "idDocument" = $1;
        `, [dup.idDocument]);
      }
      
      console.log('✓ Cleared duplicate ID/NIE values. Affected users must re-enter unique values.');
    }

    // Add unique constraint
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT uq_users_idDocument UNIQUE ("idDocument");
    `);

    console.log('✓ Added unique constraint uq_users_idDocument to users.idDocument');
  }

  /**
   * Revert migration: remove unique constraint from users.idDocument.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if constraint exists before dropping
    const constraintExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_users_idDocument'
      ) AS constraint_exists;
    `);

    if (!constraintExists[0]?.constraint_exists) {
      console.log('⏭️  Unique constraint uq_users_idDocument does not exist, skipping drop...');
      return;
    }

    await queryRunner.query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS uq_users_idDocument;
    `);

    console.log('✓ Removed unique constraint uq_users_idDocument from users.idDocument');
  }
}
