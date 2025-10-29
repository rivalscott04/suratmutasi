-- Script untuk menjalankan semua migration tracking
-- Jalankan script ini di database untuk setup fitur tracking

-- 1. Pastikan role ENUM sudah benar (tidak perlu tambah admin_pusat)
-- Admin pusat menggunakan role 'user' yang sudah ada
-- ALTER TABLE `users` 
-- MODIFY COLUMN `role` ENUM('admin', 'operator', 'user', 'admin_wilayah') NOT NULL;

-- 2. Buat tabel tracking_status_master
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

-- 3. Insert default status tracking
INSERT INTO `tracking_status_master` (`status_name`, `status_code`, `description`, `is_active`, `sort_order`) VALUES
('Diterima di Pusat', 'status-1', 'Berkas diterima di pusat untuk diproses', true, 1),
('Disposisi ke Katim Mutasi', 'status-2', 'Berkas didisposisi ke bagian Katim Mutasi', true, 2),
('Sedang Diproses', 'status-3', 'Berkas sedang dalam proses', true, 3),
('Menunggu Persetujuan', 'status-4', 'Menunggu persetujuan dari atasan', true, 4),
('Selesai Diproses', 'status-5', 'Berkas sudah selesai diproses', true, 5),
('Dikembalikan ke Wilayah', 'status-6', 'Berkas dikembalikan ke wilayah untuk perbaikan', true, 6);

-- 4. Buat tabel pengajuan_tracking
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

-- 5. Add indexes untuk optimasi query
CREATE INDEX `idx_pengajuan_tracking_status_date` ON `pengajuan_tracking`(`tracking_status_id`, `created_at`);
CREATE INDEX `idx_pengajuan_tracking_completion` ON `pengajuan_tracking`(`actual_completion_date`);

-- 6. Buat user admin pusat contoh (opsional)
-- Admin pusat menggunakan role 'user' yang sudah ada
-- INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`) VALUES
-- (UUID(), 'admin.pusat@example.com', '$2b$10$example_hash', 'Admin Pusat', 'user', true);

-- Selesai! Fitur tracking sudah siap digunakan.
