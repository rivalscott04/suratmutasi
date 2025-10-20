-- Migration to update verified_by field type from STRING(255) to CHAR(36)
-- This ensures proper foreign key relationship with users.id (UUID)

-- IMPORTANT: Run this ONLY if you want to enable the full backend solution
-- For now, we're using frontend-only solution to avoid breaking production

-- First, update any email addresses to NULL (we'll handle them separately)
UPDATE pengajuan_files 
SET verified_by = NULL 
WHERE verified_by IS NOT NULL 
  AND verified_by LIKE '%@%';

-- Change column type to CHAR(36) to match users.id
ALTER TABLE pengajuan_files 
MODIFY COLUMN verified_by CHAR(36);

-- Add foreign key constraint (optional, can be done later if needed)
-- ALTER TABLE pengajuan_files 
-- ADD CONSTRAINT fk_pengajuan_files_verified_by 
-- FOREIGN KEY (verified_by) REFERENCES users(id) 
-- ON DELETE SET NULL;

-- ROLLBACK SCRIPT (if you need to revert):
-- ALTER TABLE pengajuan_files 
-- MODIFY COLUMN verified_by VARCHAR(255);

-- SCRIPT UNTUK HAPUS RELASI YANG SUDAH TERLANJUR DIBUAT (jika ada):
-- Hapus foreign key constraint jika sudah dibuat
-- ALTER TABLE pengajuan_files DROP CONSTRAINT IF EXISTS fk_pengajuan_files_verified_by;

-- Hapus index yang mungkin terbuat otomatis
-- ALTER TABLE pengajuan_files DROP INDEX IF EXISTS verified_by;

-- Reset verified_by ke format asli (VARCHAR 255)
-- ALTER TABLE pengajuan_files 
-- MODIFY COLUMN verified_by VARCHAR(255);

-- Jika ada data yang sudah diubah ke UUID, kembalikan ke email atau NULL
-- UPDATE pengajuan_files 
-- SET verified_by = NULL 
-- WHERE verified_by IS NOT NULL 
--   AND LENGTH(verified_by) = 36 
--   AND verified_by LIKE '%-%-%-%-%';
