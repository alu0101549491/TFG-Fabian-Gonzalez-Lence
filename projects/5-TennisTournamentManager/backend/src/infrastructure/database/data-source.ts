/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file infrastructure/database/data-source.ts
 * @desc TypeORM DataSource configuration for PostgreSQL database connection.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {DataSource} from 'typeorm';
import {config} from '../../shared/config';
import * as entities from '../../domain/entities';

/**
 * TypeORM DataSource configuration.
 * Manages database connection and entity metadata.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: config.db.synchronize,
  logging: config.db.logging,
  entities: Object.values(entities),
  migrations: ['src/infrastructure/database/migrations/**/*.ts'],
  subscribers: [],
});

/**
 * Initializes the database connection.
 * Should be called before starting the server.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✓ Database connection initialized');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}
