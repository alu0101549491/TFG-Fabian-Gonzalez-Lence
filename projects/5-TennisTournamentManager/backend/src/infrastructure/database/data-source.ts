/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/infrastructure/database/data-source.ts
 * @desc TypeORM DataSource configuration for PostgreSQL database connection.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {DataSource} from 'typeorm';
import path from 'path';
import {config} from '../../shared/config';
import * as entities from '../../domain/entities';

// Use DATABASE_URL (Supabase/Render) if set, otherwise fall back to individual DB_* vars
const connectionConfig = process.env.DATABASE_URL
  ? {
      url: process.env.DATABASE_URL,
      ssl: {rejectUnauthorized: false},
    }
  : {
      host: config.db.host,
      port: config.db.port,
      username: config.db.username,
      password: config.db.password,
      database: config.db.database,
      ssl: process.env.DB_SSL === 'true' ? {rejectUnauthorized: false} : false,
    };

/**
 * TypeORM DataSource configuration.
 * Supports both DATABASE_URL (Supabase/Render) and individual DB_* environment variables.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  ...connectionConfig,
  synchronize: config.db.synchronize,
  logging: config.db.logging,
  entities: Object.values(entities),
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
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
