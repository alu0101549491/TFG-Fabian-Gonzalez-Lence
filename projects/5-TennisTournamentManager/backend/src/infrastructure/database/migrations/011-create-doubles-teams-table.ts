/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 13, 2026
 * @file infrastructure/database/migrations/011-create-doubles-teams-table.ts
 * @desc Migration: Create doubles_teams table and add team ID columns to matches and standings.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MigrationInterface, QueryRunner} from 'typeorm';

/**
 * Creates the doubles_teams table and adds team-related columns to matches and standings
 * to support doubles tournament pair logic.
 */
export class CreateDoublesTeamsTable1713052800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create doubles_teams table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS doubles_teams (
        id VARCHAR(50) PRIMARY KEY,
        "tournamentId" VARCHAR(50) NOT NULL,
        "categoryId" VARCHAR(50) NOT NULL,
        "player1Id" VARCHAR(50) NOT NULL,
        "player2Id" VARCHAR(50) NOT NULL,
        "registration1Id" VARCHAR(50),
        "registration2Id" VARCHAR(50),
        "seedNumber" INT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_dt_tournament FOREIGN KEY ("tournamentId") REFERENCES tournaments(id) ON DELETE CASCADE,
        CONSTRAINT fk_dt_category FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE,
        CONSTRAINT fk_dt_player1 FOREIGN KEY ("player1Id") REFERENCES users(id),
        CONSTRAINT fk_dt_player2 FOREIGN KEY ("player2Id") REFERENCES users(id),
        CONSTRAINT fk_dt_registration1 FOREIGN KEY ("registration1Id") REFERENCES registrations(id) ON DELETE SET NULL,
        CONSTRAINT fk_dt_registration2 FOREIGN KEY ("registration2Id") REFERENCES registrations(id) ON DELETE SET NULL
      )
    `);

    // Add indexes for common lookups
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_dt_tournament ON doubles_teams ("tournamentId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_dt_category ON doubles_teams ("categoryId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_dt_player1 ON doubles_teams ("player1Id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_dt_player2 ON doubles_teams ("player2Id")`);

    // Add team ID columns to matches table (nullable — singles matches keep using participant1Id/2Id)
    await queryRunner.query(`
      ALTER TABLE matches
        ADD COLUMN IF NOT EXISTS "participant1TeamId" VARCHAR(50),
        ADD COLUMN IF NOT EXISTS "participant2TeamId" VARCHAR(50),
        ADD COLUMN IF NOT EXISTS "winnerTeamId" VARCHAR(50)
    `);

    // Add team ID column to standings table (nullable — singles standings use participantId)
    await queryRunner.query(`
      ALTER TABLE standings
        ADD COLUMN IF NOT EXISTS "teamId" VARCHAR(50)
    `);

    // Make participantId nullable to support doubles standings (teamId is used instead)
    await queryRunner.query(`ALTER TABLE standings ALTER COLUMN "participantId" DROP NOT NULL`);

    console.log('✅ Migration 011: doubles_teams table created, team columns added to matches and standings');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE standings DROP COLUMN IF EXISTS "teamId"`);
    await queryRunner.query(`ALTER TABLE matches DROP COLUMN IF EXISTS "winnerTeamId"`);
    await queryRunner.query(`ALTER TABLE matches DROP COLUMN IF EXISTS "participant2TeamId"`);
    await queryRunner.query(`ALTER TABLE matches DROP COLUMN IF EXISTS "participant1TeamId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS doubles_teams`);
  }
}
