#!/bin/bash

###############################################################################
# University of La Laguna
# School of Engineering and Technology
# Degree in Computer Engineering
# Final Degree Project (TFG)
#
# @author Fabián González Lence <alu0101549491@ull.edu.es>
# @since 2026-04-12
# @file scripts/backup-database.sh
# @desc Automated PostgreSQL backup script for daily backups (NFR16)
# @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence}
###############################################################################

# Load environment variables
if [ -f "$(dirname "$0")/../.env.backup" ]; then
    source "$(dirname "$0")/../.env.backup"
fi

# Configuration with defaults
DB_NAME="${DB_NAME:-tennis_tournament_manager}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgresql/tennis-tournament}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup (compressed)
echo "[$(date)] Starting backup of $DB_NAME..."
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: $BACKUP_FILE"
    
    # Calculate file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup size: $SIZE"
    
    # Delete backups older than retention period
    echo "[$(date)] Cleaning up old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Optional: Upload to cloud storage (uncomment to enable)
    # AWS S3:
    # aws s3 cp "$BACKUP_FILE" s3://your-bucket/tennis-tournament-backups/
    
    # Google Cloud Storage:
    # gsutil cp "$BACKUP_FILE" gs://your-bucket/tennis-tournament-backups/
    
    # Optional: Send success notification (uncomment to enable)
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"✅ Tennis Tournament DB backup completed: $SIZE\"}" \
    #   "$SLACK_WEBHOOK_URL"
    
    echo "[$(date)] Backup process completed successfully."
    exit 0
else
    echo "[$(date)] ERROR: Backup failed!"
    
    # Optional: Send failure notification (uncomment to enable)
    # echo "Backup failed at $(date)" | mail -s "ALERT: Tennis Tournament Backup Failed" "$ADMIN_EMAIL"
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"❌ Tennis Tournament DB backup FAILED!"}' \
    #   "$SLACK_WEBHOOK_URL"
    
    exit 1
fi
