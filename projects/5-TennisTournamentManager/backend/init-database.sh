#!/bin/bash
# Database initialization script for Tennis Tournament Manager
# Creates database schema on first run

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

# Temporarily enable DB_SYNCHRONIZE to create tables
echo "🔄 Enabling DB_SYNCHRONIZE to create schema..."
sed -i 's/DB_SYNCHRONIZE=false/DB_SYNCHRONIZE=true/' .env
echo "✅ DB_SYNCHRONIZE=true"
echo ""

# Start server briefly to create schema
echo "🚀 Starting server to create database schema..."
echo "   (This will run for 10 seconds then auto-stop)"
echo ""

timeout 10 npm run dev &> /dev/null || true

echo ""
echo "✅ Schema created successfully"
echo ""

# Disable DB_SYNCHRONIZE for normal operation
echo "🔒 Disabling DB_SYNCHRONIZE for data persistence..."
sed -i 's/DB_SYNCHRONIZE=true/DB_SYNCHRONIZE=false/' .env
echo "✅ DB_SYNCHRONIZE=false"
echo ""

echo "====================================================="
echo "✅ Database initialization complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: npm run dev"
echo "2. Your data will now persist across restarts"
echo ""
echo "Note: DB_SYNCHRONIZE=false means:"
echo "  - Data persists across restarts ✅"
echo "  - Schema won't auto-update ⚠️ (run this script again if you change entities)"
echo "====================================================="
