-- =====================================================
-- SYNC SERVER STRUCTURE WITH LOCAL
-- Menambahkan struktur yang kurang di server tanpa hapus data existing
-- =====================================================

-- 1. ALTER TABLE users untuk tambah field wilayah dan update enum role
ALTER TABLE `users` 
ADD COLUMN `wilayah` varchar(255) DEFAULT NULL AFTER `office_id`;

-- Update enum role untuk tambah admin_wilayah
ALTER TABLE `users` 
MODIFY COLUMN `role` enum('admin','operator','user','admin_wilayah') NOT NULL;

-- 2. CREATE TABLE admin_wilayah_file_configuration
CREATE TABLE IF NOT EXISTS `admin_wilayah_file_configuration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jenis_jabatan_id` int NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `description` text,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_jenis_jabatan_id` (`jenis_jabatan_id`),
  KEY `idx_file_type` (`file_type`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_admin_wilayah_file_config_jenis_jabatan` 
    FOREIGN KEY (`jenis_jabatan_id`) REFERENCES `job_type_configuration`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Tambah index yang kurang di tabel pengajuan
CREATE INDEX IF NOT EXISTS `idx_pengajuan_approved_by` ON `pengajuan`(`approved_by`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_rejected_by` ON `pengajuan`(`rejected_by`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_resubmitted_by` ON `pengajuan`(`resubmitted_by`);

-- 4. Tambah index yang kurang di tabel pengajuan_files
CREATE INDEX IF NOT EXISTS `idx_pengajuan_files_verified_by` ON `pengajuan_files`(`verified_by`);

-- 5. Tambah index yang kurang di tabel users
CREATE INDEX IF NOT EXISTS `idx_users_wilayah` ON `users`(`wilayah`);

-- 6. Tambah index yang kurang di tabel letters
CREATE INDEX IF NOT EXISTS `idx_letters_template_id` ON `letters`(`template_id`);
CREATE INDEX IF NOT EXISTS `idx_letters_status` ON `letters`(`status`);

-- 7. Tambah index yang kurang di tabel pegawai
CREATE INDEX IF NOT EXISTS `idx_pegawai_kantor_id` ON `pegawai`(`kantor_id`);
CREATE INDEX IF NOT EXISTS `idx_pegawai_jenis_pegawai` ON `pegawai`(`jenis_pegawai`);

-- 8. Tambah index yang kurang di tabel offices
CREATE INDEX IF NOT EXISTS `idx_offices_kode_kabko` ON `offices`(`kode_kabko`);

-- 9. Tambah index yang kurang di tabel job_type_configuration
CREATE INDEX IF NOT EXISTS `idx_job_type_config_jenis_jabatan` ON `job_type_configuration`(`jenis_jabatan`);

-- 10. Tambah index yang kurang di tabel letter_files
CREATE INDEX IF NOT EXISTS `idx_letter_files_file_hash` ON `letter_files`(`file_hash`);

-- =====================================================
-- VERIFICATION QUERIES
-- Jalankan query ini untuk memastikan struktur sudah sesuai
-- =====================================================

-- Cek apakah field wilayah sudah ada di users
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'wilayah';

-- Cek apakah role admin_wilayah sudah ada di enum
-- SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role';

-- Cek apakah tabel admin_wilayah_file_configuration sudah ada
-- SHOW TABLES LIKE 'admin_wilayah_file_configuration';

-- Cek semua index yang ada
-- SHOW INDEX FROM pengajuan;
-- SHOW INDEX FROM pengajuan_files;
-- SHOW INDEX FROM users;
-- SHOW INDEX FROM letters;
-- SHOW INDEX FROM pegawai;
-- SHOW INDEX FROM offices;
-- SHOW INDEX FROM job_type_configuration;
-- SHOW INDEX FROM letter_files;
