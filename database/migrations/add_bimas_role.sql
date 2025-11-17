-- =====================================================
-- ADD BIMAS ROLE MIGRATION
-- Menambahkan role 'bimas' ke enum role di tabel users
-- =====================================================

-- Update enum role untuk tambah bimas
ALTER TABLE `users`
MODIFY COLUMN `role` enum('admin','operator','user','admin_wilayah','bimas') NOT NULL;

-- Verifikasi: Cek apakah role bimas sudah ada di enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';

-- Migration selesai
-- Role 'bimas' sekarang tersedia untuk digunakan

