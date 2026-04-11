-- Fix database enum for role simplification (v1.43.0)
-- Run this script manually in your PostgreSQL database

-- Step 1: Migrate REFEREE users to TOURNAMENT_ADMIN
UPDATE users 
SET role = 'TOURNAMENT_ADMIN' 
WHERE role = 'REFEREE';

-- Step 2: Delete SPECTATOR users (they can use public access without accounts)
DELETE FROM users 
WHERE role = 'SPECTATOR';

-- Step 3: Update the enum type
-- First, remove the default value from the column
ALTER TABLE users 
ALTER COLUMN role DROP DEFAULT;

-- Create temporary enum with only 3 roles
CREATE TYPE users_role_enum_new AS ENUM (
  'SYSTEM_ADMIN',
  'TOURNAMENT_ADMIN',
  'PLAYER'
);

-- Update column to use new enum
ALTER TABLE users 
ALTER COLUMN role TYPE users_role_enum_new 
USING role::text::users_role_enum_new;

-- Set default back (optional, if you want a default)
ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'PLAYER'::users_role_enum_new;

-- Drop old enum (now safe because column uses new type)
DROP TYPE users_role_enum;

-- Rename new enum to original name
ALTER TYPE users_role_enum_new RENAME TO users_role_enum;

-- Update the default to use the renamed enum
ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'PLAYER'::users_role_enum;
