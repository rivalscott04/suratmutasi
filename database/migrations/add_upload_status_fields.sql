-- =====================================================
-- ADD UPLOAD STATUS FIELDS MIGRATION
-- Migration untuk menambahkan kolom upload_status dan verification_notes ke tabel pengajuan_files
-- =====================================================

-- Tambahkan kolom upload_status dan verification_notes ke tabel pengajuan_files
ALTER TABLE `pengajuan_files` 
ADD COLUMN `upload_status` ENUM('uploaded', 'verified', 'rejected') DEFAULT 'uploaded' AFTER `file_size`,
ADD COLUMN `verification_notes` TEXT NULL AFTER `upload_status`;

-- Tambahkan index untuk optimasi query
CREATE INDEX IF NOT EXISTS `idx_pengajuan_files_upload_status` ON `pengajuan_files`(`upload_status`);
