-- Migration: Add tracking_status_master table
-- Date: 2025-01-XX
-- Purpose: Master data untuk konfigurasi status tracking yang bisa diinput admin pusat

CREATE TABLE IF NOT EXISTS `tracking_status_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(255) NOT NULL COMMENT 'Nama status tracking (e.g., "Disposisi ke Katim Mutasi")',
  `status_code` varchar(100) NOT NULL COMMENT 'Kode status untuk referensi',
  `description` text COMMENT 'Deskripsi status',
  `is_active` boolean DEFAULT true COMMENT 'Status aktif/nonaktif',
  `sort_order` int DEFAULT 0 COMMENT 'Urutan tampil di dropdown',
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'User yang membuat status',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `status_code` (`status_code`),
  KEY `idx_tracking_status_active` (`is_active`),
  KEY `idx_tracking_status_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Master data status tracking untuk admin pusat';

-- Insert default status tracking
INSERT INTO `tracking_status_master` (`status_name`, `status_code`, `description`, `is_active`, `sort_order`) VALUES
('Diterima di Pusat', 'status-1', 'Berkas diterima di pusat untuk diproses', true, 1),
('Disposisi ke Katim Mutasi', 'status-2', 'Berkas didisposisi ke bagian Katim Mutasi', true, 2),
('Sedang Diproses', 'status-3', 'Berkas sedang dalam proses', true, 3),
('Menunggu Persetujuan', 'status-4', 'Menunggu persetujuan dari atasan', true, 4),
('Selesai Diproses', 'status-5', 'Berkas sudah selesai diproses', true, 5),
('Dikembalikan ke Wilayah', 'status-6', 'Berkas dikembalikan ke wilayah untuk perbaikan', true, 6);
