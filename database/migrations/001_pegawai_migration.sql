
-- =====================================================
-- MIGRATION SCRIPT: PEGAWAI TABLE ENHANCEMENT
-- Target: 5000+ existing records
-- Author: Database Migration Team
-- Date: 2024-01-01
-- Version: 1.0
-- =====================================================

-- =====================================================
-- 1. PRE-MIGRATION BACKUP & VALIDATION
-- =====================================================

-- Create backup table
CREATE TABLE pegawai_backup AS 
SELECT * FROM pegawai;

-- Validate existing data
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT nip) as unique_nips,
    COUNT(CASE WHEN nip IS NULL THEN 1 END) as null_nips,
    COUNT(CASE WHEN nama IS NULL THEN 1 END) as null_names
FROM pegawai;

-- Check for duplicate NIPs (should be 0)
SELECT nip, COUNT(*) as count 
FROM pegawai 
GROUP BY nip 
HAVING COUNT(*) > 1;

-- =====================================================
-- 2. SAFE COLUMN ADDITION (TRANSACTION)
-- =====================================================

BEGIN;

-- Add new columns with default values
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS kantor_id UUID;
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS jenis_pegawai VARCHAR(20) DEFAULT 'pegawai';
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS aktif BOOLEAN DEFAULT true;
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS dibuat_pada TIMESTAMP DEFAULT NOW();
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS diubah_pada TIMESTAMP DEFAULT NOW();

-- Validate column addition
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pegawai' 
ORDER BY ordinal_position;

COMMIT;

-- =====================================================
-- 3. DATA POPULATION (BATCH PROCESSING)
-- =====================================================

-- Update jenis_pegawai based on jabatan logic
UPDATE pegawai 
SET jenis_pegawai = 'pejabat' 
WHERE jabatan ILIKE '%kepala%' 
   OR jabatan ILIKE '%pimpinan%' 
   OR jabatan ILIKE '%direktur%'
   OR jabatan ILIKE '%manager%'
   OR jabatan ILIKE '%kasubag%'
   OR jabatan ILIKE '%kasi%';

-- Create default office if not exists
INSERT INTO kantor (id, nama, kabkota, alamat, telepon, email) 
VALUES (
    gen_random_uuid(),
    'Kantor Kementerian Agama Default',
    'Default',
    'Alamat Default',
    '021-0000000',
    'default@kemenag.go.id'
) ON CONFLICT DO NOTHING;

-- Set default kantor_id for all records
UPDATE pegawai 
SET kantor_id = (
    SELECT id FROM kantor 
    WHERE nama = 'Kantor Kementerian Agama Default' 
    LIMIT 1
)
WHERE kantor_id IS NULL;

-- =====================================================
-- 4. PERFORMANCE OPTIMIZATION
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pegawai_id ON pegawai(id);
CREATE INDEX IF NOT EXISTS idx_pegawai_nip ON pegawai(nip);
CREATE INDEX IF NOT EXISTS idx_pegawai_kantor_id ON pegawai(kantor_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_jenis ON pegawai(jenis_pegawai);
CREATE INDEX IF NOT EXISTS idx_pegawai_aktif ON pegawai(aktif);
CREATE INDEX IF NOT EXISTS idx_pegawai_nama ON pegawai(nama);

-- Update table statistics
ANALYZE pegawai;

-- =====================================================
-- 5. CONSTRAINTS & FOREIGN KEYS
-- =====================================================

-- Add constraints after data population
ALTER TABLE pegawai ADD CONSTRAINT IF NOT EXISTS pegawai_id_unique UNIQUE(id);
ALTER TABLE pegawai ADD CONSTRAINT IF NOT EXISTS chk_jenis_pegawai 
CHECK (jenis_pegawai IN ('pegawai', 'pejabat'));

-- Add foreign key constraint
ALTER TABLE pegawai ADD CONSTRAINT IF NOT EXISTS fk_pegawai_kantor 
FOREIGN KEY (kantor_id) REFERENCES kantor(id);

-- =====================================================
-- 6. POST-MIGRATION VALIDATION
-- =====================================================

-- Validate migration results
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as records_with_id,
    COUNT(CASE WHEN kantor_id IS NOT NULL THEN 1 END) as records_with_kantor,
    COUNT(CASE WHEN jenis_pegawai = 'pejabat' THEN 1 END) as pejabat_count,
    COUNT(CASE WHEN jenis_pegawai = 'pegawai' THEN 1 END) as pegawai_count,
    COUNT(CASE WHEN aktif = true THEN 1 END) as aktif_count
FROM pegawai;

-- Check data integrity
SELECT 
    'Data Integrity Check' as check_type,
    CASE 
        WHEN COUNT(*) = (SELECT COUNT(*) FROM pegawai_backup) 
        THEN 'PASSED: Record count matches' 
        ELSE 'FAILED: Record count mismatch' 
    END as result
FROM pegawai
UNION ALL
SELECT 
    'NIP Integrity Check' as check_type,
    CASE 
        WHEN COUNT(DISTINCT nip) = (SELECT COUNT(DISTINCT nip) FROM pegawai_backup) 
        THEN 'PASSED: NIP uniqueness maintained' 
        ELSE 'FAILED: NIP uniqueness compromised' 
    END as result
FROM pegawai;

-- Performance check
EXPLAIN ANALYZE SELECT * FROM pegawai WHERE nip = 'sample_nip';
EXPLAIN ANALYZE SELECT * FROM pegawai WHERE jenis_pegawai = 'pejabat';

-- =====================================================
-- 7. ROLLBACK SCRIPT (IF NEEDED)
-- =====================================================

/*
-- ROLLBACK PROCEDURE (RUN ONLY IF MIGRATION FAILS)

-- Drop new columns
ALTER TABLE pegawai DROP COLUMN IF EXISTS id;
ALTER TABLE pegawai DROP COLUMN IF EXISTS kantor_id;
ALTER TABLE pegawai DROP COLUMN IF EXISTS jenis_pegawai;
ALTER TABLE pegawai DROP COLUMN IF EXISTS aktif;
ALTER TABLE pegawai DROP COLUMN IF EXISTS dibuat_pada;
ALTER TABLE pegawai DROP COLUMN IF EXISTS diubah_pada;

-- Restore from backup if needed
-- DROP TABLE pegawai;
-- ALTER TABLE pegawai_backup RENAME TO pegawai;
*/

-- =====================================================
-- 8. CLEANUP (OPTIONAL)
-- =====================================================

-- After successful migration, you can drop backup table
-- DROP TABLE pegawai_backup;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
