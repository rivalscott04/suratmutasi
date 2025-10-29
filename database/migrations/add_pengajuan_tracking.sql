-- Migration: Add pengajuan_tracking table
-- Date: 2025-01-XX
-- Purpose: Tabel untuk tracking status berkas yang diinput admin pusat

CREATE TABLE IF NOT EXISTS `pengajuan_tracking` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pengajuan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'ID pengajuan yang ditrack',
  `tracking_status_id` int NOT NULL COMMENT 'ID status dari tracking_status_master',
  `status_name` varchar(255) NOT NULL COMMENT 'Nama status (snapshot dari master)',
  `notes` text COMMENT 'Catatan/keterangan tambahan',
  `estimated_days` int DEFAULT NULL COMMENT 'Estimasi penyelesaian dalam hari',
  `actual_completion_date` datetime DEFAULT NULL COMMENT 'Tanggal penyelesaian aktual',
  `tracked_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Admin pusat yang input tracking',
  `tracked_by_name` varchar(255) NOT NULL COMMENT 'Nama admin pusat',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pengajuan_tracking_pengajuan_id` (`pengajuan_id`),
  KEY `idx_pengajuan_tracking_status_id` (`tracking_status_id`),
  KEY `idx_pengajuan_tracking_tracked_by` (`tracked_by`),
  KEY `idx_pengajuan_tracking_created_at` (`created_at`),
  CONSTRAINT `fk_pengajuan_tracking_pengajuan` FOREIGN KEY (`pengajuan_id`) REFERENCES `pengajuan`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pengajuan_tracking_status` FOREIGN KEY (`tracking_status_id`) REFERENCES `tracking_status_master`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_pengajuan_tracking_user` FOREIGN KEY (`tracked_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracking status berkas oleh admin pusat';

-- Add index untuk optimasi query
CREATE INDEX `idx_pengajuan_tracking_status_date` ON `pengajuan_tracking`(`tracking_status_id`, `created_at`);
CREATE INDEX `idx_pengajuan_tracking_completion` ON `pengajuan_tracking`(`actual_completion_date`);
