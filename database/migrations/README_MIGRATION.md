
# Database Migration Guide: Pegawai Table Enhancement

## Overview
Migration script untuk menambahkan kolom baru pada tabel `pegawai` yang sudah berisi 5000+ data tanpa merusak data existing.

## Pre-Migration Checklist

### 1. Backup Database
```bash
# Full database backup
pg_dump -h localhost -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Specific table backup
pg_dump -h localhost -U username -d database_name -t pegawai > pegawai_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Check Database Resources
```sql
-- Check disk space
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename = 'pegawai';

-- Check active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'your_database_name';
```

### 3. Validate Existing Data
```sql
-- Run data validation queries from migration script
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT nip) as unique_nips,
    COUNT(CASE WHEN nip IS NULL THEN 1 END) as null_nips
FROM pegawai;
```

## Migration Execution Steps

### Step 1: Run Pre-Migration Validation
```bash
psql -h localhost -U username -d database_name -f 001_pegawai_migration.sql
```

### Step 2: Monitor Progress
```sql
-- Check migration progress
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables 
WHERE relname = 'pegawai';
```

### Step 3: Validate Results
```sql
-- Run post-migration validation queries
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as records_with_id,
    COUNT(CASE WHEN jenis_pegawai = 'pejabat' THEN 1 END) as pejabat_count
FROM pegawai;
```

## Expected Results

### Before Migration
- Struktur: `nip`, `nama`, `golongan`, `tmt_pensiun`, `unit_kerja`, `induk_unit`, `jabatan`
- Records: 5000+
- Primary Key: `nip`

### After Migration
- Struktur: All existing columns + `id`, `kantor_id`, `jenis_pegawai`, `aktif`, `dibuat_pada`, `diubah_pada`
- Records: Same count (5000+)
- Primary Key: Still `nip`
- Additional UUID: `id` column for relational purposes

## Performance Impact

### Expected Duration
- **Small dataset (< 1000 records)**: 1-2 minutes
- **Medium dataset (1000-5000 records)**: 3-5 minutes
- **Large dataset (5000+ records)**: 5-10 minutes

### Resource Usage
- **CPU**: Low-medium impact during migration
- **Memory**: Minimal additional usage
- **Disk Space**: ~20% additional space temporarily
- **I/O**: Moderate during index creation

## Rollback Procedure

### If Migration Fails
```sql
-- Immediate rollback
BEGIN;
-- Drop new columns
ALTER TABLE pegawai DROP COLUMN IF EXISTS id;
ALTER TABLE pegawai DROP COLUMN IF EXISTS kantor_id;
ALTER TABLE pegawai DROP COLUMN IF EXISTS jenis_pegawai;
ALTER TABLE pegawai DROP COLUMN IF EXISTS aktif;
ALTER TABLE pegawai DROP COLUMN IF EXISTS dibuat_pada;
ALTER TABLE pegawai DROP COLUMN IF EXISTS diubah_pada;
COMMIT;
```

### If Data Corruption Occurs
```sql
-- Full restore from backup
DROP TABLE pegawai;
ALTER TABLE pegawai_backup RENAME TO pegawai;
```

## Post-Migration Tasks

### 1. Update Application Code
- Update TypeScript interfaces
- Modify API endpoints
- Test all pegawai-related functionality

### 2. Performance Monitoring
```sql
-- Monitor query performance
SELECT 
    query,
    mean_time,
    calls
FROM pg_stat_statements 
WHERE query LIKE '%pegawai%' 
ORDER BY mean_time DESC;
```

### 3. Data Validation
```sql
-- Validate business logic
SELECT 
    jenis_pegawai,
    COUNT(*) as count,
    ARRAY_AGG(DISTINCT LEFT(jabatan, 20)) as sample_jabatan
FROM pegawai 
GROUP BY jenis_pegawai;
```

## Troubleshooting

### Common Issues

1. **Lock Timeout**
   ```sql
   -- Check locks
   SELECT * FROM pg_locks WHERE relation = 'pegawai'::regclass;
   ```

2. **Constraint Violation**
   ```sql
   -- Check constraint violations
   SELECT * FROM pegawai WHERE jenis_pegawai NOT IN ('pegawai', 'pejabat');
   ```

3. **Performance Issues**
   ```sql
   -- Rebuild indexes
   REINDEX TABLE pegawai;
   ```

## Success Criteria

Migration is considered successful when:
- ✅ All original data preserved
- ✅ New columns added with correct defaults
- ✅ Indexes created successfully
- ✅ Constraints applied without violations
- ✅ Performance remains acceptable
- ✅ Application functions normally

## Contact & Support

For migration issues or questions:
- Database Team: db-team@kemenag.go.id
- Development Team: dev-team@kemenag.go.id
- Emergency Contact: +62 xxx xxxx xxxx
