-- Migration: Add final status fields to pengajuan table
-- Date: 2025-01-XX

-- Add new status values to ENUM
ALTER TABLE pengajuan 
MODIFY COLUMN status ENUM(
  'draft', 
  'submitted', 
  'approved', 
  'rejected', 
  'resubmitted', 
  'admin_wilayah_approved', 
  'admin_wilayah_rejected',
  'final_approved',
  'final_rejected'
) DEFAULT 'draft';

-- Add fields for final approval/rejection
ALTER TABLE pengajuan 
ADD COLUMN final_approved_by VARCHAR(255) NULL,
ADD COLUMN final_approved_at DATETIME NULL,
ADD COLUMN final_rejected_by VARCHAR(255) NULL,
ADD COLUMN final_rejected_at DATETIME NULL,
ADD COLUMN final_rejection_reason TEXT NULL;

-- Add indexes for performance
CREATE INDEX idx_pengajuan_final_status ON pengajuan(status);
CREATE INDEX idx_pengajuan_final_approved_at ON pengajuan(final_approved_at);
CREATE INDEX idx_pengajuan_final_rejected_at ON pengajuan(final_rejected_at);
