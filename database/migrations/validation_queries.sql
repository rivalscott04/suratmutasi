
-- =====================================================
-- VALIDATION QUERIES FOR PEGAWAI MIGRATION
-- =====================================================

-- =====================================================
-- PRE-MIGRATION VALIDATION
-- =====================================================

-- 1. Basic data integrity check
SELECT 
    'PRE-MIGRATION: Basic Data Check' as check_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT nip) as unique_nips,
    COUNT(CASE WHEN nip IS NULL OR nip = '' THEN 1 END) as invalid_nips,
    COUNT(CASE WHEN nama IS NULL OR nama = '' THEN 1 END) as invalid_names
FROM pegawai;

-- 2. Check for potential pejabat based on jabatan
SELECT 
    'PRE-MIGRATION: Potential Pejabat Analysis' as check_name,
    COUNT(*) as total_potential_pejabat
FROM pegawai 
WHERE jabatan ILIKE '%kepala%' 
   OR jabatan ILIKE '%pimpinan%' 
   OR jabatan ILIKE '%direktur%'
   OR jabatan ILIKE '%manager%'
   OR jabatan ILIKE '%kasubag%'
   OR jabatan ILIKE '%kasi%';

-- 3. Data distribution analysis
SELECT 
    'PRE-MIGRATION: Data Distribution' as check_name,
    golongan,
    COUNT(*) as count
FROM pegawai 
GROUP BY golongan 
ORDER BY count DESC;

-- =====================================================
-- POST-MIGRATION VALIDATION
-- =====================================================

-- 1. Column existence check
SELECT 
    'POST-MIGRATION: Column Check' as check_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pegawai' 
ORDER BY ordinal_position;

-- 2. Data integrity validation
SELECT 
    'POST-MIGRATION: Data Integrity' as check_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as records_with_id,
    COUNT(CASE WHEN kantor_id IS NOT NULL THEN 1 END) as records_with_kantor,
    COUNT(CASE WHEN jenis_pegawai IS NOT NULL THEN 1 END) as records_with_jenis,
    COUNT(CASE WHEN aktif = true THEN 1 END) as aktif_records,
    COUNT(CASE WHEN dibuat_pada IS NOT NULL THEN 1 END) as records_with_timestamp
FROM pegawai;

-- 3. Jenis pegawai distribution
SELECT 
    'POST-MIGRATION: Jenis Pegawai Distribution' as check_name,
    jenis_pegawai,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pegawai), 2) as percentage
FROM pegawai 
GROUP BY jenis_pegawai;

-- 4. Sample pejabat validation
SELECT 
    'POST-MIGRATION: Sample Pejabat Validation' as check_name,
    nama,
    nip,
    jabatan,
    jenis_pegawai
FROM pegawai 
WHERE jenis_pegawai = 'pejabat' 
ORDER BY nama 
LIMIT 10;

-- 5. Index validation
SELECT 
    'POST-MIGRATION: Index Check' as check_name,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'pegawai' 
ORDER BY indexname;

-- =====================================================
-- PERFORMANCE VALIDATION
-- =====================================================

-- 1. Query performance test
EXPLAIN ANALYZE 
SELECT * FROM pegawai WHERE nip = '197501012006041001';

EXPLAIN ANALYZE 
SELECT * FROM pegawai WHERE jenis_pegawai = 'pejabat';

EXPLAIN ANALYZE 
SELECT * FROM pegawai WHERE nama ILIKE '%Ahmad%';

-- 2. Table statistics
SELECT 
    'POST-MIGRATION: Table Statistics' as check_name,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as data_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE tablename = 'pegawai';

-- =====================================================
-- BUSINESS LOGIC VALIDATION
-- =====================================================

-- 1. Validate pejabat assignment logic
SELECT 
    'BUSINESS: Pejabat Assignment Validation' as check_name,
    jabatan,
    jenis_pegawai,
    COUNT(*) as count
FROM pegawai 
WHERE jabatan ILIKE '%kepala%' OR jabatan ILIKE '%pimpinan%'
GROUP BY jabatan, jenis_pegawai
ORDER BY jabatan;

-- 2. Check for potential misclassification
SELECT 
    'BUSINESS: Potential Misclassification' as check_name,
    nama,
    nip,
    jabatan,
    jenis_pegawai
FROM pegawai 
WHERE (jabatan ILIKE '%kepala%' AND jenis_pegawai = 'pegawai')
   OR (jabatan NOT ILIKE '%kepala%' AND jabatan NOT ILIKE '%pimpinan%' AND jenis_pegawai = 'pejabat')
ORDER BY nama;

-- 3. TMT Pensiun analysis
SELECT 
    'BUSINESS: TMT Pensiun Analysis' as check_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN tmt_pensiun IS NOT NULL THEN 1 END) as with_tmt_pensiun,
    COUNT(CASE WHEN tmt_pensiun IS NOT NULL AND tmt_pensiun < CURRENT_DATE THEN 1 END) as already_retired,
    COUNT(CASE WHEN tmt_pensiun IS NOT NULL AND tmt_pensiun BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 year' THEN 1 END) as retiring_soon
FROM pegawai;

-- =====================================================
-- ROLLBACK VALIDATION (IF NEEDED)
-- =====================================================

-- Check if rollback is needed
SELECT 
    'ROLLBACK CHECK: Data Comparison' as check_name,
    'pegawai' as current_table,
    COUNT(*) as current_count,
    'pegawai_backup' as backup_table,
    (SELECT COUNT(*) FROM pegawai_backup) as backup_count,
    CASE 
        WHEN COUNT(*) = (SELECT COUNT(*) FROM pegawai_backup) 
        THEN 'COUNTS MATCH' 
        ELSE 'COUNTS DIFFER - INVESTIGATE' 
    END as status
FROM pegawai;

-- =====================================================
-- CLEANUP VALIDATION
-- =====================================================

-- Validate before cleanup
SELECT 
    'CLEANUP: Ready for Backup Removal' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pegawai_backup') 
        THEN 'BACKUP EXISTS - SAFE TO DROP AFTER VALIDATION' 
        ELSE 'BACKUP NOT FOUND' 
    END as backup_status,
    COUNT(*) as current_records
FROM pegawai;
