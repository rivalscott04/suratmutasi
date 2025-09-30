-- Migration: Replace 'Surat Keterangan dari Kanwil' with 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)'
-- Date: 2025-01-03
-- Description: This migration replaces the old 'surat_keterangan_kanwil' file type with 'hasil_evaluasi_pertimbangan_baperjakat'

-- Update admin_wilayah_file_configuration table
UPDATE admin_wilayah_file_configuration 
SET 
    file_type = 'hasil_evaluasi_pertimbangan_baperjakat',
    display_name = 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
    description = 'Hasil evaluasi dan pertimbangan BAPERJAKAT dari Kanwil Provinsi',
    updated_at = NOW()
WHERE file_type = 'surat_keterangan_kanwil';

-- Update any existing file uploads that reference the old file type
-- Note: This assumes there's a file_type column in the uploads table
-- If the table structure is different, adjust accordingly
UPDATE pengajuan_files 
SET 
    file_type = 'hasil_evaluasi_pertimbangan_baperjakat',
    updated_at = NOW()
WHERE file_type = 'surat_keterangan_kanwil';

-- Show affected records
SELECT 'admin_wilayah_file_configuration' as table_name, COUNT(*) as affected_records 
FROM admin_wilayah_file_configuration 
WHERE file_type = 'hasil_evaluasi_pertimbangan_baperjakat'
UNION ALL
SELECT 'pengajuan_files' as table_name, COUNT(*) as affected_records 
FROM pengajuan_files 
WHERE file_type = 'hasil_evaluasi_pertimbangan_baperjakat';
