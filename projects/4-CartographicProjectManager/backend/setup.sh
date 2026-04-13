#!/bin/bash

# Cartographic Project Manager - Backend Quick Start
# This script helps you get the backend server up and running quickly

set -euo pipefail

mask_database_url() {
    local url="$1"
    # mask password if present: scheme://user:pass@host/... -> scheme://user:***@host/...
    echo "$url" | sed -E 's#(://[^/:@]+):([^@]+)@#\1:***@#'
}

extract_database_host() {
    local url="$1"
    # naive extraction of host between @ and / or end; handles scheme://user:pass@host:port/db
    echo "$url" | sed -E 's#^[a-zA-Z]+://([^@]+@)?([^/]+).*$#\2#'
}

read_database_url_from_env_file() {
    local env_file="$1"
    if [ ! -f "$env_file" ]; then
        return 1
    fi

    local line
    line=$(grep -E '^DATABASE_URL=' "$env_file" | head -n 1 || true)
    if [ -z "$line" ]; then
        return 1
    fi

    local value
    value="${line#DATABASE_URL=}"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"

    if [ -z "$value" ]; then
        return 1
    fi

    echo "$value"
}

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🗺️  Cartographic Project Manager - Backend Setup             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the backend directory"
    echo "   Try: cd backend && ./setup.sh"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔧 Step 2: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file - Please edit it with your actual configuration!"
    echo ""
    echo "   Important: Update these values in .env:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - JWT_SECRET (use a strong random value in production)"
    echo "   - JWT_REFRESH_SECRET (use a different strong random value)"
    echo ""
    read -p "Press Enter once you've updated .env file..." </dev/tty
else
    echo "✅ .env file exists"
fi

NODE_ENV_VALUE="${NODE_ENV:-development}"
if [ "$NODE_ENV_VALUE" != "development" ]; then
    echo "❌ Safety guard: this setup script is intended for development only."
    echo "   Current NODE_ENV: $NODE_ENV_VALUE"
    echo "   Refusing to continue to avoid accidental destructive operations."
    exit 1
fi

DATABASE_URL_VALUE="$(read_database_url_from_env_file .env || true)"
if [ -z "${DATABASE_URL_VALUE:-}" ]; then
    echo "❌ Missing DATABASE_URL in .env"
    echo "   Please set DATABASE_URL in .env before continuing."
    exit 1
fi

DB_HOST="$(extract_database_host "$DATABASE_URL_VALUE")"
echo ""
echo "🔒 Safety check: database target"
echo "   DATABASE_URL: $(mask_database_url "$DATABASE_URL_VALUE")"
echo "   Host: $DB_HOST"
echo ""
echo "   This script will run Prisma migrations (and may seed data if you opt in)."
echo "   Ensure DATABASE_URL points to a disposable development database."
echo ""
if [ "${SETUP_CONFIRM:-}" != "I_UNDERSTAND" ]; then
    read -p "Type I_UNDERSTAND to continue: " -r </dev/tty
    if [ "${REPLY:-}" != "I_UNDERSTAND" ]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""
echo "🗄️  Step 3: Setting up database..."

echo "   Checking database connection via Prisma..."
if npx prisma migrate status >/dev/null 2>&1; then
    echo "   ✅ Prisma can reach the database"
else
    echo "   ⚠️  Could not verify database connection automatically"
    echo "   Please make sure PostgreSQL is running and DATABASE_URL is correct"
    echo ""
    echo "   Quick PostgreSQL setup:"
    echo "   1. Install PostgreSQL: https://www.postgresql.org/download/"
    echo "   2. Create database: createdb cartographic_manager"
    echo "   3. Update DATABASE_URL in .env"
    echo ""
    read -p "Press Enter to continue anyway..." </dev/tty
fi

echo ""
echo "🔨 Step 4: Generating Prisma client..."
npm run prisma:generate

echo ""
echo "🗃️  Step 5: Running database migrations..."
npm run prisma:migrate || echo "⚠️  Migration failed - you may need to run it manually"

echo ""
echo "🌱 Step 6: Seeding database..."
read -p "Do you want to seed the database with sample data? (y/N) " -n 1 -r </dev/tty
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    NODE_ENV=development SEED_CONFIRM=I_UNDERSTAND npm run prisma:seed || echo "⚠️  Seeding failed - continuing anyway"
else
    echo "Skipping database seeding"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   ✅ Backend Setup Complete!                                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "📖 The API will be available at:"
echo "   http://localhost:3000/api/v1"
echo ""
echo "🔍 Useful commands:"
echo "   npm run dev         - Start development server with auto-reload"
echo "   npm run build       - Build for production"
echo "   npm run start       - Start production server"
echo "   npm run prisma:studio - Open Prisma Studio (database GUI)"
echo "   npm test            - Run tests"
echo ""
echo "📚 Documentation:"
echo "   - API Documentation: http://localhost:3000/api/v1/docs (when running)"
echo "   - Backend Guide: ../docs/development/BACKEND-IMPLEMENTATION.md"
echo "   - Prisma Schema: prisma/schema.prisma"
echo ""
