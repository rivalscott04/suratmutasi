-- Migration: Add admin_wilayah_submitted status to pengajuan table
-- Date: 2025-01-XX
-- Purpose: Add scalable status for admin wilayah submission to superadmin

-- Add new status value to ENUM
ALTER TABLE pengajuan 
MODIFY COLUMN status ENUM(
  'draft', 
  'submitted', 
  'approved', 
  'rejected', 
  'resubmitted', 
  'admin_wilayah_approved', 
  'admin_wilayah_rejected',
  'admin_wilayah_submitted',  -- NEW: Status when admin wilayah submits to superadmin
  'final_approved',
  'final_rejected'
) DEFAULT 'draft';

-- Add index for performance on new status
-- Note: MariaDB doesn't support partial indexes with WHERE clause, so we'll create a regular index
CREATE INDEX idx_pengajuan_admin_wilayah_submitted ON pengajuan(status);
  