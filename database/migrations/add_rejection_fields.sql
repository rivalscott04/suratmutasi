-- =====================================================
-- ADD REJECTION FIELDS MIGRATION
-- Migration untuk menambahkan kolom rejection fields ke tabel pengajuan
-- =====================================================

-- Tambahkan kolom rejection_reason, rejected_by, dan rejected_at ke tabel pengajuan
ALTER TABLE `pengajuan` 
ADD COLUMN `rejection_reason` TEXT NULL AFTER `catatan`,
ADD COLUMN `rejected_by` VARCHAR(20) NULL AFTER `rejection_reason`,
ADD COLUMN `rejected_at` DATETIME NULL AFTER `rejected_by`;

-- Tambahkan index untuk optimasi query
CREATE INDEX IF NOT EXISTS `idx_pengajuan_rejected_by` ON `pengajuan`(`rejected_by`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_rejected_at` ON `pengajuan`(`rejected_at`);
