-- =====================================================
-- ADD KANWIL_SUBMITTED STATUS MIGRATION
-- Menambahkan status 'kanwil_submitted' ke enum status di tabel pengajuan
-- =====================================================

-- Add new status value to ENUM
ALTER TABLE `pengajuan` 
MODIFY COLUMN `status` ENUM(
  'draft', 
  'submitted', 
  'approved', 
  'rejected', 
  'resubmitted', 
  'admin_wilayah_approved', 
  'admin_wilayah_rejected',
  'admin_wilayah_submitted',
  'kanwil_submitted',  -- NEW: Status when kanwil submits to admin
  'kanwil_approved',   -- NEW: Status when admin approves kanwil submission
  'final_approved',
  'final_rejected'
) DEFAULT 'draft';

-- Add index for performance on new status
CREATE INDEX IF NOT EXISTS `idx_pengajuan_kanwil_submitted` ON `pengajuan`(`status`);

-- Verifikasi: Cek apakah status kanwil_submitted sudah ada di enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'pengajuan' 
  AND COLUMN_NAME = 'status';

-- Migration selesai
-- Status 'kanwil_submitted' dan 'kanwil_approved' sekarang tersedia untuk digunakan

