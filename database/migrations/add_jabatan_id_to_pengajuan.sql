-- Migration: Add jabatan_id column to pengajuan table
-- Date: 2025-01-XX
-- Purpose: Add jabatan_id field to pengajuan table for edit jabatan feature

-- Add jabatan_id column to pengajuan table
ALTER TABLE `pengajuan` 
ADD COLUMN `jabatan_id` INT NULL AFTER `jenis_jabatan`;

-- Add index for performance
CREATE INDEX idx_pengajuan_jabatan_id ON pengajuan(jabatan_id);
