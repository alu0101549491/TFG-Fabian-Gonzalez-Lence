-- Audit legacy role records without mutating user data.
\echo 'Legacy users with unsupported roles:'
SELECT username, email, role FROM users WHERE role IN ('SPECTATOR', 'REFEREE');

\echo ''
\echo 'No data changes are executed by this script.'
\echo 'Review the rows above and decide a manual migration plan before applying any UPDATE or DELETE statements.'

\echo ''
\echo 'Suggested manual workflow:'
\echo '1. Export the affected rows for backup.'
\echo '2. Review each affected account with the product owner.'
\echo '3. Apply explicit updates inside a transaction only after approval.'

\echo ''
\echo 'Current role distribution:'
SELECT role, COUNT(*) AS total FROM users GROUP BY role ORDER BY role;
