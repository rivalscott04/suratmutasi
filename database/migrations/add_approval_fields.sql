-- Migration untuk menambah field approval ke tabel pengajuan
-- Menambah kolom untuk approval system

-- Tambah kolom approved_by
ALTER TABLE pengajuan 
ADD COLUMN approved_by VARCHAR(255) NULL COMMENT 'Nama admin yang approve';

-- Tambah kolom approved_at
ALTER TABLE pengajuan 
ADD COLUMN approved_at TIMESTAMP NULL COMMENT 'Waktu approval';

-- Tambah kolom resubmitted_by
ALTER TABLE pengajuan 
ADD COLUMN resubmitted_by VARCHAR(255) NULL COMMENT 'Nama user yang resubmit';

-- Tambah kolom resubmitted_at
ALTER TABLE pengajuan 
ADD COLUMN resubmitted_at TIMESTAMP NULL COMMENT 'Waktu resubmit';

-- Buat index untuk performance
CREATE INDEX idx_pengajuan_approved_by ON pengajuan(approved_by);
CREATE INDEX idx_pengajuan_approved_at ON pengajuan(approved_at);
CREATE INDEX idx_pengajuan_resubmitted_by ON pengajuan(resubmitted_by);
CREATE INDEX idx_pengajuan_resubmitted_at ON pengajuan(resubmitted_at);

-- Buat index composite untuk query status
CREATE INDEX idx_pengajuan_status_approved ON pengajuan(status, approved_at);
CREATE INDEX idx_pengajuan_status_rejected ON pengajuan(status, rejected_at);
CREATE INDEX idx_pengajuan_status_resubmitted ON pengajuan(status, resubmitted_at);
