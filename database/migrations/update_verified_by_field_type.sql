-- Migration to update verified_by field type from STRING(255) to CHAR(36)
-- This ensures proper foreign key relationship with users.id (UUID)

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
