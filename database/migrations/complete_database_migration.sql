-- Copied from root complete_database_migration.sql
-- =====================================================
-- COMPLETE DATABASE MIGRATION
-- Urutan: CREATE TABLE -> ALTER TABLE -> INDEX -> FOREIGN KEY
-- =====================================================

USE newmutasi;

-- 1. CREATE TABLES
CREATE TABLE IF NOT EXISTS kantor (
    id VARCHAR(36) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    kabkota VARCHAR(100) NOT NULL,
    alamat TEXT NOT NULL,
    telepon VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    office_id VARCHAR(36),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pegawai (
    nip VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    golongan VARCHAR(20),
    tmt_pensiun DATE,
    unit_kerja VARCHAR(100),
    induk_unit VARCHAR(100),
    jabatan VARCHAR(100),
    id VARCHAR(36) UNIQUE,
    kantor_id VARCHAR(36),
    jenis_pegawai VARCHAR(20) DEFAULT 'pegawai',
    aktif BOOLEAN DEFAULT true,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS letters (
    id VARCHAR(36) PRIMARY KEY,
    template_type VARCHAR(50) NOT NULL,
    recipient_employee_nip VARCHAR(20),
    recipient_employee_name VARCHAR(255),
    recipient_position VARCHAR(255),
    recipient_office VARCHAR(255),
    sender_name VARCHAR(255),
    sender_position VARCHAR(255),
    sender_office VARCHAR(255),
    letter_number VARCHAR(100),
    letter_date DATE,
    letter_content TEXT,
    created_by VARCHAR(36),
    office_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pengajuan (
    id VARCHAR(36) PRIMARY KEY,
    pegawai_nip VARCHAR(20),
    jenis_jabatan VARCHAR(50) NOT NULL,
    total_dokumen INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    catatan TEXT,
    created_by VARCHAR(36),
    office_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pengajuan_files (
    id VARCHAR(36) PRIMARY KEY,
    pengajuan_id VARCHAR(36),
    file_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_type_configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jenis_jabatan VARCHAR(50) NOT NULL UNIQUE,
    min_dokumen INT NOT NULL DEFAULT 1,
    max_dokumen INT NOT NULL DEFAULT 10,
    required_files LONGTEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ALTER TABLES (if needed)
ALTER TABLE job_type_configuration 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_kantor_kabkota ON kantor(kabkota);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_office_id ON users(office_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_id ON pegawai(id);
CREATE INDEX IF NOT EXISTS idx_pegawai_kantor_id ON pegawai(kantor_id);
CREATE INDEX IF NOT EXISTS idx_pegawai_jenis ON pegawai(jenis_pegawai);
CREATE INDEX IF NOT EXISTS idx_pegawai_aktif ON pegawai(aktif);
CREATE INDEX IF NOT EXISTS idx_pegawai_nama ON pegawai(nama);
CREATE INDEX IF NOT EXISTS idx_letters_created_by ON letters(created_by);
CREATE INDEX IF NOT EXISTS idx_letters_recipient ON letters(recipient_employee_nip);
CREATE INDEX IF NOT EXISTS idx_letters_office_id ON letters(office_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_pegawai ON pengajuan(pegawai_nip);
CREATE INDEX IF NOT EXISTS idx_pengajuan_created_by ON pengajuan(created_by);
CREATE INDEX IF NOT EXISTS idx_pengajuan_office_id ON pengajuan(office_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_files_pengajuan ON pengajuan_files(pengajuan_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_files_type ON pengajuan_files(file_type);
CREATE INDEX IF NOT EXISTS idx_job_type_config_jenis ON job_type_configuration(jenis_jabatan);
CREATE INDEX IF NOT EXISTS idx_job_type_config_active ON job_type_configuration(is_active);

-- 4. FOREIGN KEYS
ALTER TABLE users 
ADD CONSTRAINT fk_users_office_id FOREIGN KEY (office_id) REFERENCES kantor(id) ON DELETE SET NULL;
ALTER TABLE pegawai 
ADD CONSTRAINT fk_pegawai_kantor_id FOREIGN KEY (kantor_id) REFERENCES kantor(id) ON DELETE SET NULL;
ALTER TABLE letters 
ADD CONSTRAINT fk_letters_recipient_nip FOREIGN KEY (recipient_employee_nip) REFERENCES pegawai(nip) ON DELETE SET NULL;
ALTER TABLE letters 
ADD CONSTRAINT fk_letters_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE letters 
ADD CONSTRAINT fk_letters_office_id FOREIGN KEY (office_id) REFERENCES kantor(id) ON DELETE SET NULL;
ALTER TABLE pengajuan 
ADD CONSTRAINT fk_pengajuan_pegawai_nip FOREIGN KEY (pegawai_nip) REFERENCES pegawai(nip) ON DELETE SET NULL;
ALTER TABLE pengajuan 
ADD CONSTRAINT fk_pengajuan_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE pengajuan 
ADD CONSTRAINT fk_pengajuan_office_id FOREIGN KEY (office_id) REFERENCES kantor(id) ON DELETE SET NULL;
ALTER TABLE pengajuan_files 
ADD CONSTRAINT fk_pengajuan_files_pengajuan_id FOREIGN KEY (pengajuan_id) REFERENCES pengajuan(id) ON DELETE CASCADE;

-- 5. DEFAULT DATA
INSERT INTO kantor (id, nama, kabkota, alamat, telepon, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'Kantor Kementerian Agama Kota Mataram', 'KOTA MATARAM', 'Jl. Panji Tilar No. 1, Mataram, NTB', '0370-123456', 'mataram@kemenag.go.id'),
('22222222-2222-2222-2222-222222222222', 'Kantor Kementerian Agama Kabupaten Lombok Timur', 'KABUPATEN LOMBOK TIMUR', 'Jl. Raya Selong, Lombok Timur, NTB', '0370-222222', 'lotim@kemenag.go.id'),
('33333333-3333-3333-3333-333333333333', 'Kantor Kementerian Agama Kabupaten Lombok Tengah', 'KABUPATEN LOMBOK TENGAH', 'Jl. Raya Praya, Lombok Tengah, NTB', '0370-111111', 'loteng@kemenag.go.id'),
('44444444-4444-4444-4444-444444444444', 'Kantor Kementerian Agama Kabupaten Sumbawa Barat', 'KABUPATEN SUMBAWA BARAT', 'Jl. Raya Taliwang, Sumbawa Barat, NTB', '0371-555555', 'ksb@kemenag.go.id'),
('55555555-5555-5555-5555-555555555555', 'Kantor Kementerian Agama Kabupaten Lombok Utara', 'KABUPATEN LOMBOK UTARA', 'Jl. Raya Tanjung, Lombok Utara, NTB', '0370-333333', 'klu@kemenag.go.id'),
('66666666-6666-6666-6666-666666666666', 'Kantor Kementerian Agama Kabupaten Dompu', 'KABUPATEN DOMPU', 'Jl. Raya Dompu, Dompu, NTB', '0374-111111', 'dompu@kemenag.go.id'),
('77777777-7777-7777-7777-777777777777', 'Kantor Kementerian Agama Kabupaten Bima', 'KABUPATEN BIMA', 'Jl. Raya Bima, Bima, NTB', '0374-222222', 'kabbima@kemenag.go.id'),
('88888888-8888-8888-8888-888888888888', 'Kantor Kementerian Agama Kota Bima', 'KOTA BIMA', 'Jl. Raya Kota Bima, Bima, NTB', '0374-333333', 'kobi@kemenag.go.id'),
('99999999-9999-9999-9999-999999999999', 'Kantor Kementerian Agama Kabupaten Lombok Barat', 'KABUPATEN LOMBOK BARAT', 'Jl. Raya Senggigi, Lombok Barat, NTB', '0370-654321', 'lobar@kemenag.go.id'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kantor Kementerian Agama Kabupaten Sumbawa', 'KABUPATEN SUMBAWA', 'Jl. Raya Sumbawa Besar, Sumbawa, NTB', '0371-444444', 'sumbawa@kemenag.go.id')
ON DUPLICATE KEY UPDATE nama = VALUES(nama), kabkota = VALUES(kabkota), alamat = VALUES(alamat), telepon = VALUES(telepon), email = VALUES(email), updated_at = CURRENT_TIMESTAMP;

-- Insert default admin kanwil (no office_id - bisa akses semua)
INSERT INTO users (id, email, password_hash, full_name, role, office_id) VALUES 
('admin-001', 'admin@kemenag.go.id', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ', 'Admin Kanwil', 'admin', NULL)
ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    full_name = VALUES(full_name),
    role = VALUES(role),
    office_id = VALUES(office_id),
    updated_at = CURRENT_TIMESTAMP;

-- Job type configurations akan dikelola melalui interface admin
-- Data default tidak perlu di-seed karena ada form CRUD lengkap
