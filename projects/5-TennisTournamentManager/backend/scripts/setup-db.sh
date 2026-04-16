#!/bin/bash

# University of La Laguna
# School of Engineering and Technology
# Degree in Computer Engineering
# Final Degree Project (TFG)
#
# @author Fabián González Lence <alu0101549491@ull.edu.es>
# @since March 17, 2026
# @file backend/setup-db.sh
# @desc PostgreSQL database setup script for Tennis Tournament Manager
# @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}

set -e

echo "🎾 Tennis Tournament Manager - Database Setup"
echo "=============================================="
echo ""

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo ""
    echo "To start PostgreSQL:"
    echo "  • On Ubuntu/Debian: sudo systemctl start postgresql"
    echo "  • On macOS (Homebrew): brew services start postgresql"
    echo "  • On Docker: docker start postgres"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Database configuration from .env or defaults
DB_NAME="${DB_DATABASE:-tennis_tournament_manager}"
DB_USER="${DB_USERNAME:-postgres}"

echo "📊 Creating database: $DB_NAME"
echo "👤 Using PostgreSQL user: $DB_USER"
echo ""

# Create database using postgres superuser
echo "Creating database..."
psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
    echo "ℹ️  Database '$DB_NAME' already exists or couldn't be created with 'postgres' user."
    echo ""
    echo "Trying alternative method..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
        echo "⚠️  Database might already exist. Continuing..."
    }
}

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Ensure your .env file has correct database credentials"
echo "  2. Run: npm run db:seed (to create admin user)"
echo "  3. Run: npm run dev (to start the server)"
echo ""
