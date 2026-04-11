-- Check current problematic users
\echo 'Current users with SPECTATOR or REFEREE roles:'
SELECT username, email, role FROM users WHERE role IN ('SPECTATOR', 'REFEREE');

\echo ''
\echo 'Deleting SPECTATOR users...'
DELETE FROM users WHERE role = 'SPECTATOR';

\echo ''
\echo 'Migrating REFEREE users to TOURNAMENT_ADMIN...'
UPDATE users SET role = 'TOURNAMENT_ADMIN' WHERE role = 'REFEREE';

\echo ''
\echo 'Verification - All remaining users:'
SELECT username, email, role FROM users ORDER BY role;
