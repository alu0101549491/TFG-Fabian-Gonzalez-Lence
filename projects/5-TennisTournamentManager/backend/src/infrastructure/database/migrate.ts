/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file infrastructure/database/migrate.ts
 * @desc Database migration runner script.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from './data-source';

/**
 * Runs pending database migrations.
 */
async function runMigrations(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Running migrations...');
    
    await AppDataSource.runMigrations();
    console.log('✓ Migrations completed successfully');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
