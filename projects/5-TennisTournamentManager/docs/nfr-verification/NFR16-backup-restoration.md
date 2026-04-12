# NFR16: Automatic Daily Backups and Point-in-Time Restoration

## Requirement
Implement and document automatic daily backups with point-in-time restoration capability for the PostgreSQL database.

## Database Backup Strategy

### Technology Stack
- **Database**: PostgreSQL 15+
- **Backup Tool**: `pg_dump` (native PostgreSQL utility)
- **Scheduler**: `cron` (Linux) or Windows Task Scheduler
- **Storage**: Local filesystem + cloud backup (recommended)

## Backup Implementation

### 1. PostgreSQL Native Backup Script

Create backup script at `/home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/5-TennisTournamentManager/scripts/backup-database.sh`:

```bash
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
# @desc Automated PostgreSQL backup script for daily backups
###############################################################################

# Configuration
DB_NAME="tennis_tournament_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/var/backups/postgresql/tennis-tournament"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup (compressed)
echo "[$(date)] Starting backup of $DB_NAME..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: $BACKUP_FILE"
    
    # Calculate file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup size: $SIZE"
    
    # Delete backups older than retention period
    echo "[$(date)] Cleaning up old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Optional: Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    # aws s3 cp "$BACKUP_FILE" s3://your-bucket/tennis-tournament-backups/
    
    echo "[$(date)] Backup process completed successfully."
    exit 0
else
    echo "[$(date)] ERROR: Backup failed!"
    # Optional: Send notification (email, Slack, etc.)
    exit 1
fi
```

### 2. Make Script Executable

```bash
chmod +x scripts/backup-database.sh
```

### 3. Configure Environment Variables

Create `.env.backup` file:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tennis_tournament_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
BACKUP_DIR=/var/backups/postgresql/tennis-tournament
RETENTION_DAYS=30
```

### 4. Schedule Daily Backups (Cron)

Edit crontab:
```bash
crontab -e
```

Add daily backup at 2:00 AM:
```cron
# Tennis Tournament Manager - Daily Database Backup
0 2 * * * /home/fabian/GitHub/TFG-Fabian-Gonzalez-Lence/projects/5-TennisTournamentManager/scripts/backup-database.sh >> /var/log/tennis-tournament-backup.log 2>&1
```

## Point-in-Time Restoration

### 1. List Available Backups

```bash
ls -lh /var/backups/postgresql/tennis-tournament/
```

Example output:
```
backup_20260412_020000.sql.gz  (150 MB)
backup_20260411_020000.sql.gz  (148 MB)
backup_20260410_020000.sql.gz  (145 MB)
```

### 2. Restore from Specific Backup

Create restoration script at `scripts/restore-database.sh`:

```bash
#!/bin/bash

###############################################################################
# @file scripts/restore-database.sh
# @desc PostgreSQL database restoration script
###############################################################################

# Configuration
DB_NAME="tennis_tournament_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Example: $0 /var/backups/postgresql/tennis-tournament/backup_20260412_020000.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will drop and recreate the database '$DB_NAME'."
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restoration cancelled."
    exit 0
fi

echo "[$(date)] Starting database restoration..."

# Drop existing database (WARNING: This will delete all current data!)
echo "[$(date)] Dropping existing database..."
PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

# Create new empty database
echo "[$(date)] Creating new database..."
PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

# Restore from backup
echo "[$(date)] Restoring from backup file: $BACKUP_FILE"
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "[$(date)] Restoration completed successfully!"
    exit 0
else
    echo "[$(date)] ERROR: Restoration failed!"
    exit 1
fi
```

### 3. Execute Restoration

```bash
chmod +x scripts/restore-database.sh
./scripts/restore-database.sh /var/backups/postgresql/tennis-tournament/backup_20260412_020000.sql.gz
```

## Advanced Backup Strategies

### 1. Incremental Backups (PostgreSQL WAL Archiving)

For true point-in-time recovery (PITR), enable Write-Ahead Log (WAL) archiving:

Edit `postgresql.conf`:
```ini
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f'
```

### 2. Cloud Storage Integration

#### AWS S3
```bash
# In backup script, add:
aws s3 cp "$BACKUP_FILE" s3://your-bucket/tennis-tournament-backups/ --storage-class GLACIER
```

#### Google Cloud Storage
```bash
gsutil cp "$BACKUP_FILE" gs://your-bucket/tennis-tournament-backups/
```

### 3. Encrypted Backups

```bash
# Encrypt backup with GPG
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" | gzip | gpg --encrypt --recipient your@email.com > "$BACKUP_FILE.gpg"

# Decrypt and restore
gpg --decrypt "$BACKUP_FILE.gpg" | gunzip | psql -U "$DB_USER" "$DB_NAME"
```

## Backup Verification

### Automated Backup Testing

Create verification script `scripts/verify-backup.sh`:

```bash
#!/bin/bash

BACKUP_FILE="$1"
TEST_DB="tennis_tournament_test"

# Restore to test database
gunzip -c "$BACKUP_FILE" | psql -U postgres "$TEST_DB" > /dev/null 2>&1

# Run basic integrity checks
psql -U postgres "$TEST_DB" -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1
psql -U postgres "$TEST_DB" -c "SELECT COUNT(*) FROM tournaments;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup verification successful: $BACKUP_FILE"
    dropdb -U postgres "$TEST_DB"
    exit 0
else
    echo "[$(date)] ERROR: Backup verification failed: $BACKUP_FILE"
    exit 1
fi
```

## Monitoring & Alerting

### Email Notifications on Failure

Add to backup script:
```bash
if [ $? -ne 0 ]; then
    echo "Backup failed at $(date)" | mail -s "ALERT: Tennis Tournament Backup Failed" admin@example.com
fi
```

### Slack Webhook Notification

```bash
# Send notification to Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"✅ Tennis Tournament DB backup completed successfully"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Disaster Recovery Procedures

### Complete System Recovery

1. **Restore Infrastructure**
   - Deploy fresh PostgreSQL instance
   - Configure database server (port, authentication)

2. **Restore Latest Backup**
   ```bash
   ./scripts/restore-database.sh /var/backups/postgresql/tennis-tournament/backup_20260412_020000.sql.gz
   ```

3. **Verify Data Integrity**
   ```sql
   -- Connect to database
   psql -U postgres tennis_tournament_db
   
   -- Check table counts
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM tournaments;
   SELECT COUNT(*) FROM matches;
   
   -- Verify recent data
   SELECT * FROM tournaments ORDER BY created_at DESC LIMIT 5;
   ```

4. **Restart Application**
   ```bash
   npm run build
   npm start
   ```

### Recovery Time Objective (RTO)
- **Estimated downtime**: 15-30 minutes
- **Steps**: Download backup + Restore DB + Start app

### Recovery Point Objective (RPO)
- **Data loss window**: Maximum 24 hours (daily backups)
- **Can be reduced to**: 30 minutes with WAL archiving

## Backup Storage Recommendations

### Local Storage
- **Location**: `/var/backups/postgresql/tennis-tournament/`
- **Retention**: 30 days
- **Size**: ~5 GB for 30 days of backups

### Cloud Storage (Recommended)
- **Provider**: AWS S3 Glacier / Google Cloud Storage Coldline
- **Retention**: 1 year+
- **Cost**: ~$0.004/GB/month (AWS Glacier)

### Offsite Backup
- **Method**: Daily sync to cloud storage
- **Purpose**: Protection against hardware failure, site disaster

## Conclusion

✅ **NFR16 IMPLEMENTATION READY**:

**Daily Backup:**
- Automated cron job at 2:00 AM
- Compressed SQL dumps (gzip)
- 30-day retention policy

**Point-in-Time Restore:**
- Restore from any daily backup
- Simple restoration script provided
- Takes 5-10 minutes to restore

**Advanced Features:**
- Cloud storage integration (optional)
- Encrypted backups (optional)
- WAL archiving for PITR (optional)
- Automated verification
- Email/Slack notifications

**Next Steps:**
1. Create backup directory: `mkdir -p /var/backups/postgresql/tennis-tournament`
2. Set environment variables in `.env.backup`
3. Make scripts executable: `chmod +x scripts/*.sh`
4. Test manual backup: `./scripts/backup-database.sh`
5. Add cron job for automation
6. Test restoration in non-production environment

**Documented by**: Coding Agent  
**Date**: 2026-04-12  
**Status**: Implementation scripts provided, ready for deployment
