#!/bin/bash
# Reset database script
# Run this to drop and recreate the tennis_tournament_manager database

export PGPASSWORD=postgres

echo "🛑 Stopping backend server..."
pkill -9 -f "tsx watch" 2>/dev/null
pkill -9 -f "node.*backend" 2>/dev/null
sleep 3

echo "🔌 Terminating database connections..."
psql -h localhost -U postgres postgres <<EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'tennis_tournament_manager'
  AND pid <> pg_backend_pid();
EOF

echo "🗑️  Dropping existing database..."
psql -h localhost -U postgres postgres <<EOF
DROP DATABASE IF EXISTS tennis_tournament_manager;
EOF

echo "📦 Creating new database..."
psql -h localhost -U postgres postgres <<EOF
CREATE DATABASE tennis_tournament_manager;
EOF

echo "✅ Database reset complete!"
echo ""
echo "Now start the backend with: npm run dev"
