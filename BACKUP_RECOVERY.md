# Database Backup & Recovery Plan

## Overview

This document outlines the backup and recovery strategy for the Agent-SAFE Grid application database.

## Backup Strategy

### Automated Daily Backups

#### For Aiven Cloud (Current Provider)

Aiven provides **automatic backups** built-in:
- **Frequency**: Every 24 hours
- **Retention**: 7-14 days (depending on plan)
- **Type**: Full database backup
- **Storage**: Encrypted, off-site

**To verify backups**:
1. Log in to Aiven Console
2. Navigate to your PostgreSQL service
3. Click "Backups" tab
4. Verify latest backup timestamp

#### For Self-Hosted PostgreSQL

Use `pg_dump` for automated backups:

```bash
#!/bin/bash
# backup-db.sh

# Configuration
DB_NAME="agent_safe_grid"
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

**Schedule with cron**:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### Backup Verification

**Monthly verification checklist**:
- [ ] Verify backup exists and is recent (< 24 hours old)
- [ ] Check backup file size (should be consistent)
- [ ] Test restore to staging environment
- [ ] Verify data integrity after restore

## Recovery Procedures

### Scenario 1: Accidental Data Deletion

**Time to Recovery**: 15-30 minutes

**Steps**:
1. Identify time of deletion
2. Locate most recent backup before deletion
3. Restore to staging database
4. Extract affected records
5. Import to production

```bash
# Restore backup to staging
gunzip < backup_20231123_020000.sql.gz | psql $STAGING_DATABASE_URL

# Extract specific table
pg_dump $STAGING_DATABASE_URL -t users > users_recovered.sql

# Import to production
psql $DATABASE_URL < users_recovered.sql
```

### Scenario 2: Database Corruption

**Time to Recovery**: 30-60 minutes

**Steps**:
1. Stop application servers
2. Create snapshot of current (corrupted) database
3. Restore latest backup
4. Verify data integrity
5. Restart application

```bash
# 1. Stop app
pm2 stop all

# 2. Snapshot current state (for forensics)
pg_dump $DATABASE_URL > corrupted_snapshot_$(date +%Y%m%d).sql

# 3. Drop and recreate database
dropdb agent_safe_grid
createdb agent_safe_grid

# 4. Restore backup
gunzip < latest_backup.sql.gz | psql $DATABASE_URL

# 5. Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 6. Restart
pm2 start all
```

### Scenario 3: Complete Data Loss (Catastrophic)

**Time to Recovery**: 1-4 hours

**Steps**:
1. Provision new database server
2. Restore latest backup
3. Update DATABASE_URL in all applications
4. Run database migrations
5. Test application functionality
6. Update DNS/load balancer

## Backup Testing

### Quarterly Restore Test

**Schedule**: First Monday of each quarter

**Procedure**:
1. Create test database instance
2. Restore latest backup
3. Run full test suite against restored data
4. Document any issues
5. Update recovery procedures if needed

**Test Script**:
```bash
#!/bin/bash
# test-restore.sh

# Create test DB
createdb agent_safe_grid_test

# Restore latest backup
LATEST_BACKUP=$(ls -t /backups/postgres/backup_*.sql.gz | head -1)
gunzip < $LATEST_BACKUP | psql postgres://localhost/agent_safe_grid_test

# Run tests
DATABASE_URL=postgres://localhost/agent_safe_grid_test npm test

# Cleanup
dropdb agent_safe_grid_test
```

## Monitoring

### Backup Monitoring Alerts

Set up alerts for:
- ⚠️ Backup older than 25 hours
- ⚠️ Backup file size deviation > 20%
- ⚠️ Backup process failure
- ⚠️ Restore test failure

### Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Backup Age | < 24h | > 25h |
| Backup Size | ~500MB | ±20% |
| Restore Time | < 5min | > 10min |
| Success Rate | 100% | < 99% |

## Retention Policy

| Backup Type | Retention Period |
|-------------|-----------------|
| Daily | 30 days |
| Weekly | 12 weeks |
| Monthly | 12 months |
| Yearly | 7 years |

## Security

### Backup Encryption

Backups must be encrypted:
```bash
# Encrypt backup
pg_dump $DATABASE_URL | gzip | openssl enc -aes-256-cbc -salt -out backup.sql.gz.enc

# Decrypt for restore
openssl enc -d -aes-256-cbc -in backup.sql.gz.enc | gunzip | psql $DATABASE_URL
```

### Access Control

- Backups stored in separate cloud storage (S3, GCS)
- IAM roles for backup access
- Multi-factor authentication required
- Audit logging enabled

## Point-in-Time Recovery (PITR)

For critical applications, enable PITR:
- Continuous WAL (Write-Ahead Log) archiving
- Recover to any point in last 7 days
- Supported by most cloud providers

**Enable PITR on Aiven**:
1. Aiven Console → Service → Backups
2. Enable "Point-in-Time Recovery"
3. Verify WAL archiving is active

## Disaster Recovery

### RTO/RPO Targets

| Scenario | RTO | RPO |
|----------|-----|-----|
| Accidental deletion | 30min | 24h |
| Database corruption | 1h | 24h |
| Complete data loss | 4h | 24h |
| Regional outage | 8h | 1h* |

*With PITR enabled

### Geographic Redundancy

For production:
- Primary: Current region
- Backup: Different geographic region
- Replication: Async streaming replication

## Responsibilities

| Role | Responsibility |
|------|----------------|
| DevOps | Configure automated backups |
| DevOps | Monitor backup health |
| DBA | Quarterly restore tests |
| Security | Backup encryption |
| Leadership | Approve recovery procedures |

## Emergency Contacts

| Role | Contact | Phone |
|------|---------|-------|
| On-Call DBA | TBD | TBD |
| DevOps Lead | TBD | TBD |
| CTO | TBD | TBD |

## Documentation Updates

This document should be reviewed and updated:
- After any major incident
- Quarterly with backup tests
- When infrastructure changes

Last Updated: 2025-11-23  
Next Review: 2025-12-23
