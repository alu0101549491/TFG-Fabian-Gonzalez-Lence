# Database Backup & Restoration Scripts

Production-ready PostgreSQL backup and restoration scripts for the Tennis Tournament Manager application (NFR16 compliance).

## Overview

These scripts provide automated daily backups with compression, retention policies, optional cloud storage integration, and safe restoration procedures.

- **Recovery Time Objective (RTO)**: 5-10 minutes
- **Recovery Point Objective (RPO)**: 24 hours (or 30 minutes with WAL archiving)
- **Backup Retention**: 30 days (configurable)
- **Compression**: gzip (~70-80% size reduction)

## Files

- `backup-database.sh` - Automated backup script
- `restore-database.sh` - Database restoration script  
- `../.env.backup.example` - Configuration template

## Setup

### 1. Configure Environment

```bash
# Copy example configuration
cp .env.backup.example .env.backup

# Edit with your credentials
nano .env.backup
```

**Required Variables:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tennis_tournament_db
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
BACKUP_DIR=/var/backups/postgresql/tennis-tournament
RETENTION_DAYS=30
```

**Optional Variables (for notifications and cloud storage):**
```bash
ADMIN_EMAIL=admin@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
AWS_BUCKET=your-bucket-name
GCS_BUCKET=your-bucket-name
```

### 2. Set Permissions

```bash
chmod +x backup-database.sh
chmod +x restore-database.sh
chmod 600 .env.backup  # Protect credentials
```

### 3. Create Backup Directory

```bash
sudo mkdir -p /var/backups/postgresql/tennis-tournament
sudo chown $(whoami):$(whoami) /var/backups/postgresql/tennis-tournament
```

## Usage

### Manual Backup

```bash
./backup-database.sh
```

**Output:**
```
[2026-04-12 14:30:00] Starting backup of tennis_tournament_db...
[2026-04-12 14:30:15] Backup successful: /var/backups/postgresql/tennis-tournament/backup_20260412_143000.sql.gz
[2026-04-12 14:30:15] Backup size: 42M
[2026-04-12 14:30:15] Cleaning up old backups (older than 30 days)...
[2026-04-12 14:30:15] Backup process completed successfully.
```

### List Available Backups

```bash
ls -lh /var/backups/postgresql/tennis-tournament/
```

### Restore from Backup

```bash
./restore-database.sh /var/backups/postgresql/tennis-tournament/backup_20260412_143000.sql.gz
```

**Interactive Prompt:**
```
╔════════════════════════════════════════════════════════════════╗
║                    ⚠️  WARNING  ⚠️                             ║
╠════════════════════════════════════════════════════════════════╣
║ This will DROP and RECREATE the database 'tennis_tournament_db'
║ ALL CURRENT DATA WILL BE PERMANENTLY DELETED!                  
║                                                                 
║ Backup file: backup_20260412_143000.sql.gz                     
║ Database: tennis_tournament_db@localhost:5432                   
╚════════════════════════════════════════════════════════════════╝

Are you absolutely sure you want to continue? Type 'yes' to confirm:
```

## Automated Daily Backups

### Using Cron

```bash
# Edit crontab
crontab -e

# Add this line for daily backups at 2:00 AM
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/db-backup.log 2>&1
```

### Using Systemd Timer

Create `/etc/systemd/system/tennis-db-backup.service`:

```ini
[Unit]
Description=Tennis Tournament DB Backup
After=postgresql.service

[Service]
Type=oneshot
User=postgres
ExecStart=/path/to/scripts/backup-database.sh
StandardOutput=journal
StandardError=journal
```

Create `/etc/systemd/system/tennis-db-backup.timer`:

```ini
[Unit]
Description=Tennis Tournament DB Backup Timer

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Enable the timer:

```bash
sudo systemctl enable tennis-db-backup.timer
sudo systemctl start tennis-db-backup.timer
```

## Cloud Storage Integration

### AWS S3

Uncomment in `backup-database.sh`:

```bash
aws s3 cp "$BACKUP_FILE" s3://your-bucket/tennis-tournament-backups/
```

**Prerequisites:**
```bash
# Install AWS CLI
sudo apt install awscli

# Configure credentials
aws configure
```

### Google Cloud Storage

Uncomment in `backup-database.sh`:

```bash
gsutil cp "$BACKUP_FILE" gs://your-bucket/tennis-tournament-backups/
```

**Prerequisites:**
```bash
# Install gcloud SDK
curl https://sdk.cloud.google.com | bash

# Authenticate
gcloud auth login
```

## Monitoring & Notifications

### Slack Notifications

Set `SLACK_WEBHOOK_URL` in `.env.backup` and uncomment in `backup-database.sh`:

```bash
curl -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"✅ Tennis Tournament DB backup completed: $SIZE\"}" \
  "$SLACK_WEBHOOK_URL"
```

### Email Notifications

Set `ADMIN_EMAIL` in `.env.backup` and uncomment in `backup-database.sh`:

```bash
echo "Backup failed at $(date)" | mail -s "ALERT: Tennis Tournament Backup Failed" "$ADMIN_EMAIL"
```

**Prerequisites:**
```bash
sudo apt install mailutils
```

## Disaster Recovery Procedures

### Scenario 1: Data Corruption

```bash
# Stop application
sudo systemctl stop tennis-tournament-app

# Restore from most recent backup
./restore-database.sh /var/backups/postgresql/tennis-tournament/backup_LATEST.sql.gz

# Restart application
sudo systemctl start tennis-tournament-app
```

### Scenario 2: Accidental Deletion

```bash
# Find backup before deletion
ls -lt /var/backups/postgresql/tennis-tournament/

# Restore specific backup
./restore-database.sh /var/backups/postgresql/tennis-tournament/backup_20260410_020000.sql.gz
```

### Scenario 3: Server Migration

```bash
# On old server: Create backup
./backup-database.sh

# Transfer backup to new server
scp /var/backups/postgresql/tennis-tournament/backup_LATEST.sql.gz \
  user@new-server:/tmp/

# On new server: Restore
./restore-database.sh /tmp/backup_LATEST.sql.gz
```

## Testing Backups

**Monthly Verification Procedure:**

```bash
# 1. Create test backup
./backup-database.sh

# 2. Create test database
createdb tennis_tournament_test

# 3. Restore to test database (modify DB_NAME in script temporarily)
DB_NAME=tennis_tournament_test ./restore-database.sh /path/to/backup.sql.gz

# 4. Run integrity checks
psql tennis_tournament_test -c "SELECT COUNT(*) FROM users;"
psql tennis_tournament_test -c "SELECT COUNT(*) FROM tournaments;"

# 5. Clean up
dropdb tennis_tournament_test
```

## Troubleshooting

### Permission Denied

```bash
# Ensure scripts are executable
chmod +x backup-database.sh restore-database.sh

# Ensure PostgreSQL user has access
sudo chown postgres:postgres /var/backups/postgresql/tennis-tournament
```

### Connection Failed

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d tennis_tournament_db -c "SELECT version();"

# Check credentials in .env.backup
cat .env.backup
```

### Disk Space Issues

```bash
# Check available space
df -h /var/backups

# Reduce retention period in .env.backup
RETENTION_DAYS=14

# Manually clean old backups
find /var/backups/postgresql/tennis-tournament -name "backup_*.sql.gz" -mtime +14 -delete
```

## Security Best Practices

1. **Protect Credentials:**
   ```bash
   chmod 600 .env.backup
   ```

2. **Encrypt Backups (optional):**
   ```bash
   # Modify backup-database.sh to use GPG
   pg_dump ... | gzip | gpg --encrypt --recipient your@email.com > backup.sql.gz.gpg
   ```

3. **Restrict Backup Directory Access:**
   ```bash
   sudo chown root:backup /var/backups/postgresql/tennis-tournament
   sudo chmod 750 /var/backups/postgresql/tennis-tournament
   ```

4. **Use Read-Only Database User for Backups:**
   ```sql
   CREATE ROLE backup_user WITH LOGIN PASSWORD 'secure_password';
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
   ```

## Documentation

For complete NFR16 documentation, see:
- [NFR16 Backup & Restoration Verification](../docs/nfr-verification/NFR16-backup-restoration.md)
- [Requirements Checklist](../docs/requirements-checklist.md) - NFR16

## Support

For issues or questions:
- Project Repository: https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence
- Documentation: `docs/` directory
- Contact: alu0101549491@ull.edu.es
