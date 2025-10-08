-- Cleanup duplicate admin wilayah files untuk pengajuan spesifik
-- Pengajuan ID: fcf94ee3-5ec2-46f3-a5d4-21dbc8fe6af3

-- Step 1: Lihat dulu file yang ada untuk pengajuan ini
SELECT 
    id,
    pengajuan_id,
    file_type,
    file_name,
    created_at,
    verification_status,
    'EXISTING FILE' as status
FROM pengajuan_files 
WHERE pengajuan_id = 'fcf94ee3-5ec2-46f3-a5d4-21dbc8fe6af3'
  AND file_category = 'admin_wilayah'
ORDER BY file_type, created_at;

-- Step 2: Hapus duplikat hasil_assessment (keep yang paling lama)
-- File yang akan dihapus: yang created_at lebih baru
DELETE FROM pengajuan_files 
WHERE pengajuan_id = 'fcf94ee3-5ec2-46f3-a5d4-21dbc8fe6af3'
  AND file_category = 'admin_wilayah'
  AND file_type = 'hasil_assessment'
  AND created_at > (
    SELECT MIN(created_at) 
    FROM pengajuan_files pf2 
    WHERE pf2.pengajuan_id = 'fcf94ee3-5ec2-46f3-a5d4-21dbc8fe6af3'
      AND pf2.file_category = 'admin_wilayah'
      AND pf2.file_type = 'hasil_assessment'
  );

-- Step 3: Hapus duplikat hasil_evaluasi_pertimbangan_baperjakat (keep yang paling lama)
DELETE FROM pengajuan_files 
WHERE pengajuan_id = 'fcf94ee3-5ec2-46f3-a5d4-21dbc8fe6af3'
  AND file_category = 'admin_wilayah'
  AND file_type = 'hasil_evaluasi_pertimbangan_baperjakat'
  AND created_at > (
    SELECT MIN(created_at) 
    FROM pengajuan_files pf2 
    WHERE pf2.pengajuan_id = 'fcf94ee3-5ec2-46f3-a5d4-21dbc8fe6af3'
      AND pf2.file_category = 'admin_wilayah'
      AND pf2.file_type = 'hasil_evaluasi_pertimbangan_baperjakat'
  );

-- Step 4: Verify hasil cleanup
SELECT 
    id,
    pengajuan_id,
    file_type,
    file_name,
    created_at,
    verification_status,
    'AFTER CLEANUP' as status
FROM pengajuan_files 
WHERE pengajuan_id = 'fcf94ee3-5ec2-46f3-a5d4-21dbc8fe6af3'
  AND file_category = 'admin_wilayah'
ORDER BY file_type, created_at;
