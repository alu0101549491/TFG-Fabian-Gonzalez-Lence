#!/bin/bash
# Database initialization script for Tennis Tournament Manager
# Creates the database and applies checked-in migrations.

set -e

echo "🔧 Tennis Tournament Manager - Database Initialization"
echo "====================================================="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -U postgres &> /dev/null; then
  echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
  exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Create database if it doesn't exist
echo "📊 Creating database if it doesn't exist..."
psql -U postgres -lqt | cut -d \| -f 1 | grep -qw tennis_tournament_manager
if [ $? -ne 0 ]; then
  createdb -U postgres tennis_tournament_manager
  echo "✅ Database 'tennis_tournament_manager' created"
else
  echo "ℹ️  Database 'tennis_tournament_manager' already exists"
fi
echo ""

echo "🔄 Running database migrations..."
npm run db:migrate
echo "✅ Database migrations completed"
echo ""

echo "====================================================="
echo "✅ Database initialization complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: npm run dev"
echo "2. Your data will now persist across restarts"
echo ""
echo "Note: schema changes must be applied through migrations."
echo "====================================================="
