-- Migration: Add audit log table for tracking pengajuan changes
-- Date: 2025-01-XX
-- Purpose: Track all changes made to pengajuan by superadmin

-- Create audit log table
CREATE TABLE IF NOT EXISTS `pengajuan_audit_log` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pengajuan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `field_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `old_value` text COLLATE utf8mb4_general_ci,
  `new_value` text COLLATE utf8mb4_general_ci,
  `reason` text COLLATE utf8mb4_general_ci,
  `changed_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `changed_by_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pengajuan_audit_log_pengajuan_id` (`pengajuan_id`),
  KEY `idx_pengajuan_audit_log_changed_by` (`changed_by`),
  KEY `idx_pengajuan_audit_log_changed_at` (`changed_at`),
  KEY `idx_pengajuan_audit_log_action` (`action`),
  CONSTRAINT `fk_pengajuan_audit_log_pengajuan` FOREIGN KEY (`pengajuan_id`) REFERENCES `pengajuan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pengajuan_audit_log_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add index for performance
CREATE INDEX idx_pengajuan_audit_log_composite ON pengajuan_audit_log(pengajuan_id, changed_at);
