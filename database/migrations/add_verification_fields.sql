-- Migration untuk menambah field verifikasi di tabel pengajuan_files
-- Menambah kolom untuk tracking verifikasi file individual

-- Tambah kolom verified_by untuk tracking siapa yang verifikasi
ALTER TABLE pengajuan_files 
ADD COLUMN verified_by VARCHAR(255) NULL AFTER verification_notes;

-- Tambah kolom verified_at untuk tracking kapan verifikasi
ALTER TABLE pengajuan_files 
ADD COLUMN verified_at TIMESTAMP NULL AFTER verified_by;

-- Buat index untuk optimasi query verifikasi
CREATE INDEX idx_pengajuan_files_verification_status ON pengajuan_files(verification_status);
CREATE INDEX idx_pengajuan_files_verified_at ON pengajuan_files(verified_at);
