-- =====================================================
-- COMPLETE DATABASE MIGRATION
-- Setup lengkap untuk database baru dengan struktur existing + pengajuan system
-- Kompatibel dengan struktur yang sudah ada
-- =====================================================

-- 1. TABEL OFFICES (existing structure)
CREATE TABLE IF NOT EXISTS `offices` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `kabkota` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `fax` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `kode_kabko` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. TABEL USERS (existing structure)
CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('admin','operator','user') NOT NULL,
  `office_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. TABEL PEGAWAI (existing structure)
CREATE TABLE IF NOT EXISTS `pegawai` (
  `nip` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `golongan` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tmt_pensiun` datetime DEFAULT NULL,
  `unit_kerja` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `induk_unit` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jabatan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `kantor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `jenis_pegawai` enum('pegawai','pejabat') COLLATE utf8mb4_general_ci DEFAULT 'pegawai',
  `aktif` tinyint(1) DEFAULT '1',
  `dibuat_pada` datetime DEFAULT NULL,
  `diubah_pada` datetime DEFAULT NULL,
  PRIMARY KEY (`nip`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. TABEL LETTERS (existing structure - PRESERVE EXISTING DATA)
CREATE TABLE IF NOT EXISTS `letters` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `office_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `template_id` varchar(50) DEFAULT NULL,
  `template_name` varchar(255) DEFAULT NULL,
  `letter_number` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `recipient_employee_nip` varchar(20) DEFAULT NULL,
  `signing_official_nip` varchar(20) DEFAULT NULL,
  `form_data` json DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. TABEL PENGAJUAN (new - pengajuan system)
CREATE TABLE IF NOT EXISTS `pengajuan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pegawai_nip` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jenis_jabatan` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `total_dokumen` int NOT NULL DEFAULT '0',
  `status` enum('draft','submitted','reviewed','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `catatan` text COLLATE utf8mb4_general_ci,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `office_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. TABEL PENGAJUAN FILES (untuk upload dokumen)
CREATE TABLE IF NOT EXISTS `pengajuan_files` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `pengajuan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. TABEL JOB TYPE CONFIGURATION (konfigurasi jenis jabatan)
CREATE TABLE IF NOT EXISTS `job_type_configuration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jenis_jabatan` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `min_dokumen` int NOT NULL DEFAULT '1',
  `max_dokumen` int NOT NULL DEFAULT '10',
  `required_files` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jenis_jabatan` (`jenis_jabatan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. INDEXES untuk optimasi performance
CREATE INDEX IF NOT EXISTS `idx_pengajuan_pegawai_nip` ON `pengajuan`(`pegawai_nip`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_created_by` ON `pengajuan`(`created_by`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_office_id` ON `pengajuan`(`office_id`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_status` ON `pengajuan`(`status`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_jenis_jabatan` ON `pengajuan`(`jenis_jabatan`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_created_at` ON `pengajuan`(`created_at`);

CREATE INDEX IF NOT EXISTS `idx_pengajuan_files_pengajuan_id` ON `pengajuan_files`(`pengajuan_id`);
CREATE INDEX IF NOT EXISTS `idx_pengajuan_files_type` ON `pengajuan_files`(`file_type`);

CREATE INDEX IF NOT EXISTS `idx_job_type_config_jenis` ON `job_type_configuration`(`jenis_jabatan`);
CREATE INDEX IF NOT EXISTS `idx_job_type_config_active` ON `job_type_configuration`(`is_active`);

-- 9. FOREIGN KEY CONSTRAINTS untuk tabel existing
ALTER TABLE `users` 
ADD CONSTRAINT `fk_users_office_id` 
FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pegawai` 
ADD CONSTRAINT `fk_pegawai_kantor_id` 
FOREIGN KEY (`kantor_id`) REFERENCES `offices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `letters` 
ADD CONSTRAINT `fk_letters_office_id` 
FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `letters` 
ADD CONSTRAINT `fk_letters_created_by` 
FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `letters` 
ADD CONSTRAINT `fk_letters_recipient_employee_nip` 
FOREIGN KEY (`recipient_employee_nip`) REFERENCES `pegawai`(`nip`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `letters` 
ADD CONSTRAINT `fk_letters_signing_official_nip` 
FOREIGN KEY (`signing_official_nip`) REFERENCES `pegawai`(`nip`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 10. FOREIGN KEY CONSTRAINTS untuk pengajuan system
ALTER TABLE `pengajuan` 
ADD CONSTRAINT `fk_pengajuan_pegawai_nip` 
FOREIGN KEY (`pegawai_nip`) REFERENCES `pegawai`(`nip`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pengajuan` 
ADD CONSTRAINT `fk_pengajuan_created_by` 
FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pengajuan` 
ADD CONSTRAINT `fk_pengajuan_office_id` 
FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pengajuan_files` 
ADD CONSTRAINT `fk_pengajuan_files_pengajuan_id` 
FOREIGN KEY (`pengajuan_id`) REFERENCES `pengajuan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 11. DATA DEFAULT untuk offices (data real NTB)
INSERT INTO `offices` (`id`, `name`, `kabkota`, `address`, `phone`, `fax`, `email`, `website`, `created_at`, `updated_at`, `kode_kabko`) VALUES 
('11111111-1111-1111-1111-111111111111', 'KANTOR KEMENTERIAN AGAMA', 'KOTA MATARAM', 'Jl. Pejanggik No. 83 Mataram', '(0370) 631079', '(0370) 642403', 'mataram@kemenag.go.id', 'www.kemenagkotamataram.go.id', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '07'),
('22222222-2222-2222-2222-222222222222', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN LOMBOK TIMUR', 'Jln. Prof. Muh. Yamin,SH No. 6, Selong - Lombok Timur', '(0376) 21042', '(0376) 21042', 'lotim@kemenag.go.id', 'https://kemenaglotim.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '03'),
('33333333-3333-3333-3333-333333333333', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN LOMBOK TENGAH', 'Jln. Jend. A. Yani No. 5 Praya - Lombok Tengah', '(0370) - 654057', '654422', 'loteng@kemenag.go.id', 'https://kemenaglomboktengah.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '02'),
('44444444-4444-4444-4444-444444444444', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN SUMBAWA BARAT', '', NULL, NULL, 'ksb@kemenag.go.id', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '09'),
('55555555-5555-5555-5555-555555555555', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN LOMBOK UTARA', 'Jalan Raya Tanjung - Bayan Karang Kates Gangga Kabupaten Lombok Utara', '(0370) 7509040', '83352', 'kablombokutara@kemenag.go.id', 'https://kemenagkablotara.go.id', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '10'),
('66666666-6666-6666-6666-666666666666', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN DOMPU', 'Jl. Sonokling No. 03 Bada Dompu', '(0373) 21049', '(0373) 21049', 'kemenagkabdompu@yahoo.com', '-', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '05'),
('77777777-7777-7777-7777-777777777777', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN BIMA', 'Jln. Garuda No. 3', '(0374) 43291 - 43660', '43291', 'upkemenag.kabbima@yahoo.com', '-', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '06'),
('88888888-8888-8888-8888-888888888888', 'KANTOR KEMENTERIAN AGAMA', 'KOTA BIMA', 'Jl Garuda No. 9, Lewirato,Kota Bima', '(0374) 44413 - 43500', '(0374) 43500', 'kotabima@kemenag.go.id', 'kotabima.kemenag.go.id', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '08'),
('99999999-9999-9999-9999-999999999999', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN LOMBOK BARAT', '', NULL, NULL, 'lobar@kemenag.go.id', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '01'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'KANTOR KEMENTERIAN AGAMA', 'KABUPATEN SUMBAWA', 'Jalan Durian Nomor 72 Sumbawa Besar 84317', '0371-212299', '0371-22524', 'kabsumbawa@kemenag.go.id', '-', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '04')
ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`),
    `kabkota` = VALUES(`kabkota`),
    `address` = VALUES(`address`),
    `phone` = VALUES(`phone`),
    `fax` = VALUES(`fax`),
    `email` = VALUES(`email`),
    `website` = VALUES(`website`),
    `kode_kabko` = VALUES(`kode_kabko`),
    `updated_at` = CURRENT_TIMESTAMP;

-- 12. DATA DEFAULT untuk users (admin + operators)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `office_id`, `is_active`, `created_at`, `updated_at`) VALUES
('c741a5e4-8882-4a01-b2c1-fb367f5c8fcc', 'admin.kanwil@kemenag.go.id', '$2b$10$SUX5YS5BRXQWbMR2yrWuG.wDyzPdEMNn71ecgq0dcDpr0IVf2IHhO', 'Admin Kanwil', 'admin', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7812dd3a-4e4f-4edc-b41e-4f9abc92189e', 'mataram@kemenag.go.id', '$2b$10$YQY6a.hFQUD83pIddVOm8umPHqa3Sy/SQ9TZXTfBpFfpHppudhpb6', 'Operator Mataram', 'operator', '11111111-1111-1111-1111-111111111111', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('65a7bfb1-e97e-4af6-8c22-ff3dc7caa54c', 'lotim@kemenag.go.id', '$2b$10$iFR3CfmRGA566EieblZvKesddDeXWvUsV1RJo40B0cv7AkTz51KTy', 'Operator Lotim', 'operator', '22222222-2222-2222-2222-222222222222', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('983b214f-82a3-404c-a2a5-79db18476ee3', 'loteng@kemenag.go.id', '$2b$10$Ab1TgRbvs..MgT4cJc4hOeZUWjJw/v6PvCWib7B3JJrV/ZmVKi7Jq', 'Operator Loteng', 'operator', '33333333-3333-3333-3333-333333333333', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aab821cc-2c18-4f4f-bad1-10190241f2e9', 'ksb@kemenag.go.id', '$2b$10$qmY8lE2sWyt2jtCck9bEG.ulnUcCxPPCCNIT8qlYNRL5NirXz8T2S', 'Operator KSB', 'operator', '44444444-4444-4444-4444-444444444444', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('56b1a820-72e2-4173-b869-84dae82d07aa', 'klu@kemenag.go.id', '$2b$10$EYCxTwckifWFX9ZABtyT6ORCKadu4Nk8aPfKcncDL49YBxBv49GIO', 'Operator KLU', 'operator', '55555555-5555-5555-5555-555555555555', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f24a0fbf-95b9-411a-aff3-781fbaec94b9', 'dompu@kemenag.go.id', '$2b$10$okTdYvymK31q1Lh.OxqZ4.YMLeZ3iCXjSIfsY/3j7riVfo.1.tnnS', 'Operator Dompu', 'operator', '66666666-6666-6666-6666-666666666666', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e8369b51-76bc-4480-9080-0519ef8fb3f9', 'kabbima@kemenag.go.id', '$2b$10$9AWl8hM.Hx.SZryAk.lu/OU5DJJjzPcOvHi8CNrpef52CWY54UxCi', 'Operator Kab Bima', 'operator', '77777777-7777-7777-7777-777777777777', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6db3c38c-1e41-4a54-a30c-91a8ca4d99a1', 'kobi@kemenag.go.id', '$2b$10$6ZdlDM22an4TxgBLaFgHWOwUvrgguVuVLTd7lEeczUqwKFNwqhuxK', 'Operator Kobi', 'operator', '88888888-8888-8888-8888-888888888888', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0e7d4791-93ba-4e4a-bc5c-f9e320228976', 'lobar@kemenag.go.id', '$2b$10$gpGg4pyH5hiEPVLt0HJmQO3L345.9kRCJ1EtyOLqZ1sJXV4aba5Wi', 'Operator Lobar', 'operator', '99999999-9999-9999-9999-999999999999', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('734f49a8-b979-4efd-8ed1-2ce71ca23f21', 'sumbawa@kemenag.go.id', '$2b$10$dYFXVxM9.5Y7HCrTGco9nO/cOttjIoUEaEcg3cq9RDqDAij1I7MRy', 'Operator Sumbawa', 'operator', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
    `email` = VALUES(`email`),
    `full_name` = VALUES(`full_name`),
    `role` = VALUES(`role`),
    `office_id` = VALUES(`office_id`),
    `is_active` = VALUES(`is_active`),
    `updated_at` = CURRENT_TIMESTAMP;

-- 13. DATA DEFAULT untuk job type configuration
INSERT INTO `job_type_configuration` (`jenis_jabatan`, `min_dokumen`, `max_dokumen`, `required_files`) VALUES 
('Kepala Seksi', 3, 8, JSON_ARRAY('SK Pangkat Terakhir', 'SK Jabatan Terakhir', 'Ijazah Terakhir', 'Sertifikat Diklat', 'Surat Pernyataan', 'Foto')),
('Kepala Sub Bagian', 3, 8, JSON_ARRAY('SK Pangkat Terakhir', 'SK Jabatan Terakhir', 'Ijazah Terakhir', 'Sertifikat Diklat', 'Surat Pernyataan', 'Foto')),
('Kepala Urusan', 3, 8, JSON_ARRAY('SK Pangkat Terakhir', 'SK Jabatan Terakhir', 'Ijazah Terakhir', 'Sertifikat Diklat', 'Surat Pernyataan', 'Foto')),
('Staff', 2, 6, JSON_ARRAY('SK Pangkat Terakhir', 'SK Jabatan Terakhir', 'Ijazah Terakhir', 'Surat Pernyataan', 'Foto')),
('Pelaksana', 2, 6, JSON_ARRAY('SK Pangkat Terakhir', 'SK Jabatan Terakhir', 'Ijazah Terakhir', 'Surat Pernyataan', 'Foto'))
ON DUPLICATE KEY UPDATE 
    `min_dokumen` = VALUES(`min_dokumen`),
    `max_dokumen` = VALUES(`max_dokumen`),
    `required_files` = VALUES(`required_files`),
    `updated_at` = CURRENT_TIMESTAMP;