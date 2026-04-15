#!/bin/bash

###############################################################################
# University of La Laguna
# School of Engineering and Technology
# Degree in Computer Engineering
# Final Degree Project (TFG)
#
# @author Fabián González Lence <alu0101549491@ull.edu.es>
# @since 2026-04-12
# @file scripts/restore-database.sh
# @desc PostgreSQL database restoration script (NFR16)
# @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence}
###############################################################################

# Load environment variables
if [ -f "$(dirname "$0")/../.env.backup" ]; then
    source "$(dirname "$0")/../.env.backup"
fi

# Configuration with defaults
DB_NAME="${DB_NAME:-tennis_tournament_db}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_FILE="$1"

# Check if backup file was provided
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /var/backups/postgresql/tennis-tournament/backup_*.sql.gz 2>/dev/null || echo "  No backups found"
    echo ""
    echo "Example: $0 /var/backups/postgresql/tennis-tournament/backup_20260412_020000.sql.gz"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Warning prompt
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ⚠️  WARNING  ⚠️                             ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║ This will DROP and RECREATE the database '$DB_NAME'            "
echo "║ ALL CURRENT DATA WILL BE PERMANENTLY DELETED!                  "
echo "║                                                                 "
echo "║ Backup file: $(basename "$BACKUP_FILE")                        "
echo "║ Database: $DB_NAME@$DB_HOST:$DB_PORT                           "
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
read -p "Are you absolutely sure you want to continue? Type 'yes' to confirm: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restoration cancelled."
    exit 0
fi

echo ""
echo "[$(date)] Starting database restoration..."

# Export password for psql commands
export PGPASSWORD="$DB_PASSWORD"

# Drop existing database (WARNING: This will delete all current data!)
echo "[$(date)] Dropping existing database..."
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null

# Create new empty database
echo "[$(date)] Creating new database..."
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

if [ $? -ne 0 ]; then
    echo "[$(date)] ERROR: Failed to create database!"
    exit 1
fi

# Restore from backup
echo "[$(date)] Restoring from backup file: $BACKUP_FILE"
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > /dev/null

if [ $? -eq 0 ]; then
    echo "[$(date)] Restoration completed successfully!"
    
    # Run basic integrity checks
    echo "[$(date)] Running integrity checks..."
    USERS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
    TOURNAMENTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" -t -c "SELECT COUNT(*) FROM tournaments;" 2>/dev/null | xargs)
    MATCHES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" -t -c "SELECT COUNT(*) FROM matches;" 2>/dev/null | xargs)
    
    echo ""
    echo "Database Statistics:"
    echo "  Users: $USERS"
    echo "  Tournaments: $TOURNAMENTS"
    echo "  Matches: $MATCHES"
    echo ""
    echo "✅ Database restored and verified!"
    exit 0
else
    echo "[$(date)] ERROR: Restoration failed!"
    exit 1
fi
