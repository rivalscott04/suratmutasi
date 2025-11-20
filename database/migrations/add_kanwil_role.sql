-- =====================================================
-- ADD KANWIL ROLE MIGRATION
-- Menambahkan role 'kanwil' ke enum role di tabel users
-- =====================================================

-- Update enum role untuk tambah kanwil
  ALTER TABLE `users`
  MODIFY COLUMN `role` enum('admin','operator','user','admin_wilayah','bimas','kanwil') NOT NULL;

-- Verifikasi: Cek apakah role kanwil sudah ada di enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';

-- Migration selesai
-- Role 'kanwil' sekarang tersedia untuk digunakan

