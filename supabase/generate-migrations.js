#!/usr/bin/env node

/**
 * Generate SQL migrations from existing schemas
 * Run with: node supabase/generate-migrations.js
 */

const fs = require('fs');
const path = require('path');

console.log('📄 Generating SQL Migrations from Existing Schemas\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARTO: Prisma Schema → SQL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('═══ CARTO Project ═══\n');

const cartoMigrationsDir = path.join(__dirname, 'carto-backend/supabase/migrations');
fs.mkdirSync(cartoMigrationsDir, { recursive: true });

console.log(`✅ Created migrations directory: ${cartoMigrationsDir}`);
console.log('');
console.log('⚠️  MANUAL STEP REQUIRED:');
console.log('');
console.log('Convert Prisma schema to SQL manually:');
console.log('  1. Open: projects/4-CartographicProjectManager/backend/prisma/schema.prisma');
console.log('  2. For each model, create equivalent SQL in:');
console.log('     supabase/carto-backend/supabase/migrations/20260415000003_create_tables.sql');
console.log('');
console.log('Example conversion:');
console.log('');
console.log('  Prisma:');
console.log('    model User {');
console.log('      id    String @id @default(uuid())');
console.log('      email String @unique');
console.log('      role  UserRole');
console.log('    }');
console.log('');
console.log('  SQL:');
console.log('    CREATE TABLE users (');
console.log('      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),');
console.log('      email TEXT UNIQUE NOT NULL,');
console.log('      role user_role NOT NULL');
console.log('    );');
console.log('');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TENNIS: TypeORM Entities → SQL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('═══ TENNIS Project ═══\n');

const tennisMigrationsDir = path.join(__dirname, 'tennis-backend/supabase/migrations');
fs.mkdirSync(tennisMigrationsDir, { recursive: true });

console.log(`✅ Created migrations directory: ${tennisMigrationsDir}`);
console.log('');
console.log('⚠️  MANUAL STEP REQUIRED:');
console.log('');
console.log('Convert TypeORM entities to SQL manually:');
console.log('  1. Review entities in: projects/5-TennisTournamentManager/backend/src/domain/entities/');
console.log('  2. Create SQL for 24 tables in:');
console.log('     supabase/tennis-backend/supabase/migrations/20260415000003_create_tables.sql');
console.log('');
console.log('Entities to convert (24):');

const entitiesDir = path.join(__dirname, '../projects/5-TennisTournamentManager/backend/src/domain/entities');
if (fs.existsSync(entitiesDir)) {
  const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.entity.ts'));
  files.forEach((file, index) => {
    console.log(`  ${(index + 1).toString().padStart(2, ' ')}. ${file.replace('.entity.ts', '')}`);
  });
} else {
  console.log('  (Cannot read entities directory)');
}

console.log('');
console.log('Example conversion from TypeORM:');
console.log('');
console.log('  TypeORM:');
console.log('    @Entity("users")');
console.log('    export class User {');
console.log('      @PrimaryGeneratedColumn("uuid")');
console.log('      id: string;');
console.log('      ');
console.log('      @Column({ unique: true })');
console.log('      email: string;');
console.log('      ');
console.log('      @Column({ type: "enum", enum: UserRole })');
console.log('      role: UserRole;');
console.log('    }');
console.log('');
console.log('  SQL:');
console.log('    CREATE TABLE users (');
console.log('      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),');
console.log('      email TEXT UNIQUE NOT NULL,');
console.log('      role user_role NOT NULL');
console.log('    );');
console.log('');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Create starter migration files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('═══ Creating Starter Migration Files ═══\n');

// CARTO starter migrations
const cartoMigrations = [
  {
    name: '20260415000001_enable_extensions.sql',
    content: `-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
`
  },
  {
    name: '20260415000002_create_enums.sql',
    content: `-- Create all enums from Prisma schema
-- TODO: Extract enums from projects/4-CartographicProjectManager/backend/prisma/schema.prisma

-- Example:
-- CREATE TYPE user_role AS ENUM ('ADMINISTRATOR', 'CLIENT', 'SPECIAL_USER');
-- CREATE TYPE project_status AS ENUM ('ACTIVE', 'IN_PROGRESS', 'PENDING_REVIEW', 'FINALIZED');
-- etc.
`
  },
  {
    name: '20260415000003_create_tables.sql',
    content: `-- Create all tables from Prisma schema
-- TODO: Convert each Prisma model to SQL CREATE TABLE

-- Example:
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   email TEXT UNIQUE NOT NULL,
--   name TEXT NOT NULL,
--   role user_role NOT NULL DEFAULT 'CLIENT',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
`
  },
  {
    name: '20260415000004_create_rls_policies.sql',
    content: `-- Row Level Security policies for all tables

-- Example for users table:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view own profile"
--   ON users FOR SELECT
--   USING (auth.uid() = id);
-- 
-- CREATE POLICY "Admins can view all"
--   ON users FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM users
--       WHERE users.id = auth.uid()
--       AND users.role = 'ADMINISTRATOR'
--     )
--   );
`
  }
];

cartoMigrations.forEach(migration => {
  const filePath = path.join(cartoMigrationsDir, migration.name);
  fs.writeFileSync(filePath, migration.content);
  console.log(`✅ Created: ${migration.name}`);
});

// TENNIS starter migrations
const tennisMigrations = [
  {
    name: '20260415000001_enable_extensions.sql',
    content: `-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search  
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
`
  },
  {
    name: '20260415000002_create_enums.sql',
    content: `-- Create all enums from TypeORM entities
-- TODO: Extract enums from projects/5-TennisTournamentManager/backend/src/domain/entities/

-- Example:
-- CREATE TYPE user_role AS ENUM ('organizer', 'player', 'admin');
-- CREATE TYPE tournament_status AS ENUM ('draft', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');
-- CREATE TYPE match_status AS ENUM ('scheduled', 'in_progress', 'completed', 'walkover', 'retired', 'defaulted');
-- etc.
`
  },
  {
    name: '20260415000003_create_tables.sql',
    content: `-- Create all tables from TypeORM entities (24 tables)
-- TODO: Convert each TypeORM entity to SQL CREATE TABLE

-- Core tables: users, tournaments, categories, phases, brackets, matches, scores
-- Registration: registrations, doubles_teams, partner_invitations
-- Scheduling: order_of_play, courts
-- Stats: standings, statistics, global_rankings, match_results
-- Communication: announcements, notifications, notification_preferences, push_subscriptions
-- Admin: payments, sanctions, audit_logs

-- Example:
-- CREATE TABLE tournaments (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   start_date DATE NOT NULL,
--   end_date DATE NOT NULL,
--   status tournament_status NOT NULL DEFAULT 'draft',
--   surface tournament_surface,
--   max_participants INTEGER,
--   organizer_id UUID REFERENCES auth.users(id),
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
`
  },
  {
    name: '20260415000004_create_rls_policies.sql',
    content: `-- Row Level Security policies for all 24 tables

-- Example for tournaments:
-- ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Public can view published tournaments"
--   ON tournaments FOR SELECT
--   USING (status IN ('registration_open', 'registration_closed', 'in_progress', 'completed'));
-- 
-- CREATE POLICY "Organizers can manage their tournaments"
--   ON tournaments FOR ALL
--   USING (organizer_id = auth.uid());
-- 
-- CREATE POLICY "Players can view tournaments they're registered for"
--   ON tournaments FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM registrations
--       WHERE registrations.tournament_id = tournaments.id
--       AND registrations.user_id = auth.uid()
--     )
--   );
`
  }
];

tennisMigrations.forEach(migration => {
  const filePath = path.join(tennisMigrationsDir, migration.name);
  fs.writeFileSync(filePath, migration.content);
  console.log(`✅ Created: ${migration.name}`);
});

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('✅ Migration files created!');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('📝 TODO: Fill in the migration files with actual schema');
console.log('');
console.log('For CARTO:');
console.log('  - Review: projects/4-CartographicProjectManager/backend/prisma/schema.prisma');
console.log('  - Edit: supabase/carto-backend/supabase/migrations/*.sql');
console.log('');
console.log('For TENNIS:');
console.log('  - Review: projects/5-TennisTournamentManager/backend/src/domain/entities/*.entity.ts');
console.log('  - Edit: supabase/tennis-backend/supabase/migrations/*.sql');
console.log('');
console.log('Then test locally:');
console.log('  $ cd supabase/carto-backend && supabase db reset');
console.log('  $ cd supabase/tennis-backend && supabase db reset');
console.log('');
