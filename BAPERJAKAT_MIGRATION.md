# Migration: Replace "Surat Keterangan dari Kanwil" with "Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)"

## Overview
This migration replaces the old document type "Surat Keterangan dari Kanwil" with "Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)" throughout the system.

## Changes Made

### 1. Frontend Changes
- **src/pages/Settings.tsx**: Updated admin wilayah file types configuration
- **src/components/AdminWilayahFileUpload.tsx**: Updated file type display mapping
- **src/pages/PengajuanDetail.tsx**: Updated file type mapping and validation

### 2. Backend Changes
- **backend/src/controllers/adminWilayahFileConfigController.ts**: Updated available file types
- **backend/src/seeders/adminWilayahFileConfigSeeder.ts**: Updated sample data

### 3. Database Changes
- **database/add_admin_wilayah_sample_data.sql**: Updated sample data
- **database/migrations/replace_surat_keterangan_kanwil_with_baperjakat.sql**: Migration script

### 4. Migration Script
- **backend/scripts/run-baperjakat-migration.ts**: Automated migration runner

## File Type Mapping
| Old ID | New ID | Old Name | New Name |
|--------|--------|----------|----------|
| `surat_keterangan_kanwil` | `hasil_evaluasi_pertimbangan_baperjakat` | Surat Keterangan dari Kanwil | Hasil Evaluasi dan Pertimbangan (BAPERJAKAT) |

## How to Run Migration

### Option 1: Using Migration Script
```bash
cd backend
npx ts-node scripts/run-baperjakat-migration.ts
```

### Option 2: Manual SQL Execution
```bash
mysql -u username -p database_name < database/migrations/replace_surat_keterangan_kanwil_with_baperjakat.sql
```

## What the Migration Does

1. **Updates Configuration**: Changes file type configuration in `admin_wilayah_file_configuration` table
2. **Updates Existing Data**: Updates any existing file uploads that reference the old file type
3. **Preserves Data**: All existing file uploads and configurations are preserved, only the references are updated

## Verification

After running the migration, verify the changes:

```sql
-- Check admin wilayah configuration
SELECT * FROM admin_wilayah_file_configuration 
WHERE file_type = 'hasil_evaluasi_pertimbangan_baperjakat';

-- Check pengajuan files
SELECT * FROM pengajuan_files 
WHERE file_type = 'hasil_evaluasi_pertimbangan_baperjakat';
```

## Rollback (if needed)

To rollback this migration:

```sql
-- Rollback admin_wilayah_file_configuration
UPDATE admin_wilayah_file_configuration 
SET 
    file_type = 'surat_keterangan_kanwil',
    display_name = 'Surat Keterangan dari Kanwil',
    description = 'Surat keterangan resmi dari Kanwil Provinsi',
    updated_at = NOW()
WHERE file_type = 'hasil_evaluasi_pertimbangan_baperjakat';

-- Rollback pengajuan_files
UPDATE pengajuan_files 
SET 
    file_type = 'surat_keterangan_kanwil',
    updated_at = NOW()
WHERE file_type = 'hasil_evaluasi_pertimbangan_baperjakat';
```

## Notes

- The migration is safe and preserves all existing data
- Only the file type references are changed, not the actual uploaded files
- The new BAPERJAKAT document type is now available in the admin wilayah configuration
- All UI components will now display "Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)" instead of "Surat Keterangan dari Kanwil"
