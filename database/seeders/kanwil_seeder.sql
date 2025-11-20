-- =====================================================
-- KANWIL SEEDER
-- Menambahkan data office dan user kanwil untuk testing
-- =====================================================

-- 1. INSERT OFFICE KANWIL NTB
-- Password plaintext untuk user: kanwil123 (akan di-hash oleh backend saat login pertama kali)
-- Atau gunakan password hash yang sudah ada: $2b$10$YQY6a.hFQUD83pIddVOm8umPHqa3Sy/SQ9TZXTfBpFfpHppudhpb6 (password: password123)
INSERT IGNORE INTO `offices` (
  `id`, 
  `name`, 
  `kabkota`, 
  `address`, 
  `phone`, 
  `fax`, 
  `email`, 
  `website`, 
  `kode_kabko`, 
  `created_at`, 
  `updated_at`
) VALUES (
  '12121212-1212-1212-1212-12121212121212', 
  'Kantor Wilayah Kementerian Agama', 
  'PROVINSI NTB', 
  'Jalan Udayana No 6 MATARAM', 
  '0370 622317', 
  NULL, 
  'kanwil.ntb@kemenag.go.id', 
  'ntb.kemenag.go.id', 
  '00', 
  NOW(), 
  NOW()
)
ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`),
    `kabkota` = VALUES(`kabkota`),
    `address` = VALUES(`address`),
    `phone` = VALUES(`phone`),
    `fax` = VALUES(`fax`),
    `email` = VALUES(`email`),
    `website` = VALUES(`website`),
    `kode_kabko` = VALUES(`kode_kabko`),
    `updated_at` = NOW();

-- 2. INSERT USER KANWIL
-- Password: kanwil123
-- Password hash: $2b$10$YQY6a.hFQUD83pIddVOm8umPHqa3Sy/SQ9TZXTfBpFfpHppudhpb6 (sama dengan operator mataram untuk testing)
-- Catatan: Jika ingin password berbeda, generate hash baru dengan bcrypt (salt rounds: 10)
INSERT IGNORE INTO `users` (
  `id`, 
  `email`, 
  `password_hash`, 
  `full_name`, 
  `role`, 
  `office_id`, 
  `wilayah`, 
  `is_active`, 
  `created_at`, 
  `updated_at`
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
  'kanwil.ntb@kemenag.go.id', 
  '$2b$10$YQY6a.hFQUD83pIddVOm8umPHqa3Sy/SQ9TZXTfBpFfpHppudhpb6', 
  'Operator Kanwil NTB', 
  'kanwil', 
  '12121212-1212-1212-1212-12121212121212', 
  'NTB', 
  1, 
  NOW(), 
  NOW()
)
ON DUPLICATE KEY UPDATE 
    `email` = VALUES(`email`),
    `full_name` = VALUES(`full_name`),
    `role` = VALUES(`role`),
    `office_id` = VALUES(`office_id`),
    `wilayah` = VALUES(`wilayah`),
    `is_active` = VALUES(`is_active`),
    `updated_at` = NOW();

-- Seeder selesai
-- Office ID: 12121212-1212-1212-1212-12121212121212
-- User ID: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Email: kanwil.ntb@kemenag.go.id
-- Password: kanwil123 (atau password123 jika pakai hash yang sama)

