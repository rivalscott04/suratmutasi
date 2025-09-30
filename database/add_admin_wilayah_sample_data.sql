-- Script untuk menambahkan data sample AdminWilayahFileConfig
-- Jalankan script ini di database untuk testing

-- Pastikan tabel sudah ada
-- Jika belum, jalankan migration terlebih dahulu

-- Hapus data lama jika ada
DELETE FROM admin_wilayah_file_configuration;

-- Reset auto increment
ALTER TABLE admin_wilayah_file_configuration AUTO_INCREMENT = 1;

-- Ambil ID dari job_type_configuration yang sudah ada
-- Ganti dengan ID yang sesuai di database Anda
SET @job_type_id = (SELECT id FROM job_type_configuration WHERE is_active = 1 LIMIT 1);

-- Insert data sample
INSERT INTO admin_wilayah_file_configuration (
    jenis_jabatan_id,
    file_type,
    display_name,
    is_required,
    description,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    @job_type_id,
    'surat_rekomendasi_kanwil',
    'Surat Rekomendasi Kanwil',
    1,
    'Surat rekomendasi dari Kanwil Provinsi untuk pengajuan mutasi',
    1,
    NOW(),
    NOW()
),
(
    @job_type_id,
    'surat_persetujuan_kepala_wilayah',
    'Surat Persetujuan Kepala Wilayah',
    1,
    'Surat persetujuan dari Kepala Wilayah Kementerian Agama Provinsi',
    1,
    NOW(),
    NOW()
),
(
    @job_type_id,
    'hasil_evaluasi_pertimbangan_baperjakat',
    'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
    0,
    'Hasil evaluasi dan pertimbangan BAPERJAKAT dari Kanwil Provinsi',
    1,
    NOW(),
    NOW()
);

-- Tampilkan data yang sudah diinsert
SELECT 
    awfc.id,
    awfc.jenis_jabatan_id,
    jtc.jenis_jabatan,
    awfc.file_type,
    awfc.display_name,
    awfc.is_required,
    awfc.is_active
FROM admin_wilayah_file_configuration awfc
JOIN job_type_configuration jtc ON awfc.jenis_jabatan_id = jtc.id
WHERE awfc.is_active = 1
ORDER BY awfc.jenis_jabatan_id, awfc.file_type;

-- Tampilkan jumlah data per jenis jabatan
SELECT 
    jtc.jenis_jabatan,
    COUNT(awfc.id) as total_files,
    SUM(CASE WHEN awfc.is_required = 1 THEN 1 ELSE 0 END) as required_files,
    SUM(CASE WHEN awfc.is_required = 0 THEN 1 ELSE 0 END) as optional_files
FROM job_type_configuration jtc
LEFT JOIN admin_wilayah_file_configuration awfc ON jtc.id = awfc.jenis_jabatan_id AND awfc.is_active = 1
WHERE jtc.is_active = 1
GROUP BY jtc.id, jtc.jenis_jabatan
ORDER BY jtc.jenis_jabatan;

