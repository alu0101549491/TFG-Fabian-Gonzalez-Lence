/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 28, 2026
 * @file infrastructure/database/migrations/003-add-user-id-document-ranking.ts
 * @desc Database migration to add idDocument and ranking fields to users table (v1.44.0, FR9, FR14).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

/**
 * Adds ID/NIE document and ranking fields to users table for tournament registration.
 * 
 * **Changes**:
 * - Adds `idDocument` column (VARCHAR 20, nullable) for storing participant ID/NIE
 * - Adds `ranking` column (INTEGER, nullable) for storing player tennis ranking
 * 
 * **Rationale**:
 * - **FR9**: "Registered users can register for available tournaments providing: 
 *   full name, ID/NIE, category, ranking, contact data"
 * - **FR14**: "Participants configure: name, surname, ID/NIE, ranking, phone, email, 
 *   Telegram, WhatsApp, avatar image, privacy preferences"
 * - **FR19**: System uses ranking for automatic seeding in tournament draws
 * 
 * **Design Decision**:
 * Fields are stored at user level (not registration level) because:
 * - ID/NIE is personal identification that doesn't change per tournament
 * - Player ranking is player-level attribute used across all tournament registrations
 * - Eliminates redundant data entry for participants registering in multiple tournaments
 * - Simplifies seeding algorithms by having ranking readily available
 */
export class AddUserIdDocumentRanking1711789012345 implements MigrationInterface {
  /**
   * Apply migration: add idDocument and ranking columns to users table.
   * Made idempotent - checks if columns already exist.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if idDocument column exists
    const idDocExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'idDocument'
      ) AS column_exists;
    `);

    // Check if ranking column exists
    const rankingExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'ranking'
      ) AS column_exists;
    `);

    const hasIdDoc = idDocExists[0]?.column_exists;
    const hasRanking = rankingExists[0]?.column_exists;

    if (hasIdDoc && hasRanking) {
      console.log('✓ Migration already applied - idDocument and ranking columns exist');
      return;
    }

    // Add idDocument column if it doesn't exist
    if (!hasIdDoc) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'idDocument',
          type: 'varchar',
          length: '20',
          isNullable: true,
          comment: 'ID or NIE document for tournament registration (FR9, FR14)',
        })
      );
      console.log('✓ Added idDocument column');
    }

    // Add ranking column if it doesn't exist
    if (!hasRanking) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'ranking',
          type: 'int',
          isNullable: true,
          comment: 'Player tennis ranking for tournament seeding (FR14, FR19)',
        })
      );
      console.log('✓ Added ranking column');
    }

    console.log('✓ User profile fields migration completed');
  }

  /**
   * Rollback migration: remove idDocument and ranking columns from users table.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove ranking column
    await queryRunner.dropColumn('users', 'ranking');

    // Remove idDocument column
    await queryRunner.dropColumn('users', 'idDocument');

    console.log('✓ Removed idDocument and ranking columns from users table');
  }
}
