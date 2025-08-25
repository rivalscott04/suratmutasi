# Sistem Upload Superadmin - Dokumentasi Lengkap

## 📋 Overview

Sistem ini menambahkan fitur upload file tambahan oleh admin wilayah setelah pengajuan kabupaten/kota disetujui. Sistem dirancang dengan konfigurasi dinamis untuk fleksibilitas kebutuhan file yang berbeda per jenis jabatan.

## ��️ Arsitektur Sistem

### Hierarki Role
1. **Superadmin (admin)** - God level, manage semua sistem
2. **Admin Wilayah (admin_wilayah)** - Level menengah, upload file tambahan
3. **Operator** - Input data, generate surat
4. **User** - View only

### Workflow Lengkap
Kabupaten: Draft → Upload 15 file → Submit → Reviewed → Approved
↓
Admin Wilayah: Upload file tambahan (dinamis) → Superadmin Review → Final Approval
↓
Total: 15 + N file (N = jumlah file yang dikonfigurasi)


## ��️ Database Schema

### 1. Tabel Baru: Admin Wilayah File Configuration
```sql
CREATE TABLE `admin_wilayah_file_configuration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jenis_jabatan_id` int NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `is_required` boolean DEFAULT true,
  `description` text,
  `is_active` boolean DEFAULT true,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`jenis_jabatan_id`) REFERENCES `job_type_configuration`(`id`)
);
```

### 2. Update Tabel Pengajuan Files
```sql
-- Tambah kolom untuk tracking uploader dan kategori file
ALTER TABLE `pengajuan_files` 
ADD COLUMN `file_category` ENUM('kabupaten','admin_wilayah') DEFAULT 'kabupaten' AFTER `file_type`,
ADD COLUMN `uploaded_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL AFTER `file_category`,
ADD COLUMN `uploaded_by_role` VARCHAR(20) DEFAULT 'kabupaten' AFTER `uploaded_by`,
ADD COLUMN `uploaded_by_name` VARCHAR(255) NULL AFTER `uploaded_by_role`,
ADD COLUMN `uploaded_by_office` VARCHAR(100) NULL AFTER `uploaded_by_name`;

-- Index untuk optimasi
CREATE INDEX idx_pengajuan_files_file_category ON pengajuan_files(file_category);
CREATE INDEX idx_pengajuan_files_uploaded_by ON pengajuan_files(uploaded_by);
CREATE INDEX idx_pengajuan_files_uploaded_by_role ON pengajuan_files(uploaded_by_role);
```

### 3. Update Tabel Pengajuan Status
```sql
-- Tambah status baru untuk workflow admin wilayah
ALTER TABLE `pengajuan` 
MODIFY COLUMN `status` ENUM('draft','submitted','reviewed','approved','rejected','admin_wilayah_upload','admin_wilayah_review','final_approved','final_rejected') DEFAULT 'draft';
```

## 🔧 Konfigurasi Dinamis

### Struktur Data
```typescript
interface AdminWilayahFileConfig {
  id: number;
  jenis_jabatan_id: number;
  file_type: string;
  display_name: string;
  is_required: boolean;
  description?: string;
  is_active: boolean;
}

interface PengajuanFile {
  id: string;
  pengajuan_id: string;
  file_type: string;
  file_category: 'kabupaten' | 'admin_wilayah';
  file_name: string;
  file_path: string;
  file_size: number;
  upload_status: string;
  verification_notes?: string;
  
  // Tracking uploader
  uploaded_by?: string;
  uploaded_by_role: 'kabupaten' | 'admin_wilayah';
  uploaded_by_name?: string;
  uploaded_by_office?: string;
  
  created_at: string;
  updated_at: string;
}
```

### Contoh Konfigurasi File
```json
{
  "jenis_jabatan_id": 1,
  "file_type": "surat_rekomendasi_kanwil",
  "display_name": "Surat Rekomendasi Kanwil",
  "is_required": true,
  "description": "Surat rekomendasi dari Kanwil untuk pengajuan mutasi",
  "is_active": true
}
```

## �� Fitur Utama

### 1. Konfigurasi File Dinamis
- **Superadmin** dapat mengatur file apa saja yang perlu diupload admin wilayah
- Konfigurasi per jenis jabatan (guru, eselon, fungsional, dll)
- Set file wajib atau opsional
- Aktif/nonaktif file tertentu

### 2. Tracking Uploader
- Setiap file dicatat siapa yang upload
- Informasi lengkap: nama, role, wilayah, waktu upload
- Audit trail untuk accountability

### 3. Role-based Access Control
- **Kabupaten**: Hanya bisa lihat file yang mereka upload
- **Admin Wilayah**: Bisa lihat file kabupaten + file yang mereka upload
- **Superadmin**: Bisa lihat semua file

### 4. Multiple Admin Wilayah Accounts
- Tidak menggunakan single account
- Setiap admin wilayah punya akun terpisah
- Tracking per admin wilayah untuk performance monitoring

## �� Implementasi

### 1. Backend API Endpoints

#### GET /api/admin-wilayah-file-config/:jobTypeId
```typescript
// Ambil konfigurasi file admin wilayah berdasarkan jenis jabatan
const getAdminWilayahFileConfig = async (req: Request, res: Response) => {
  const { jobTypeId } = req.params;
  
  const configs = await AdminWilayahFileConfig.findAll({
    where: { 
      jenis_jabatan_id: jobTypeId,
      is_active: true 
    },
    order: [['id', 'ASC']]
  });
  
  res.json({ success: true, configs });
};
```

#### POST /api/admin-wilayah-file-config
```typescript
// Buat konfigurasi file baru (hanya superadmin)
const createAdminWilayahFileConfig = async (req: Request, res: Response) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const config = await AdminWilayahFileConfig.create(req.body);
  res.json({ success: true, config });
};
```

#### PUT /api/pengajuan/:id/admin-wilayah-upload
```typescript
// Upload file admin wilayah
const uploadAdminWilayahFile = async (req: Request, res: Response) => {
  const { pengajuanId } = req.params;
  const { file_category = 'admin_wilayah' } = req.body;
  
  // Validasi status pengajuan harus approved
  const pengajuan = await Pengajuan.findByPk(pengajuanId);
  if (pengajuan.status !== 'approved') {
    return res.status(400).json({ message: 'Pengajuan belum approved' });
  }
  
  // Upload file dengan tracking
  const fileRecord = await PengajuanFile.create({
    pengajuan_id: pengajuanId,
    file_type: fileType,
    file_category,
    file_name: fileName,
    file_path: filePath,
    file_size: fileSize,
    uploaded_by: req.user.id,
    uploaded_by_role: req.user.role,
    uploaded_by_name: req.user.full_name,
    uploaded_by_office: req.user.office_id
  });
  
  // Update status pengajuan
  await pengajuan.update({ status: 'admin_wilayah_upload' });
  
  res.json({ success: true, file: fileRecord });
};
```

### 2. Frontend Components

#### Settings Page - Konfigurasi File
```tsx
const AdminWilayahFileSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurasi File Admin Wilayah</CardTitle>
        <CardDescription>
          Atur file apa saja yang perlu diupload admin wilayah per jenis jabatan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobTypes.map((jobType) => (
          <div key={jobType.id} className="border rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">{jobType.name}</h3>
            <div className="space-y-2">
              {jobType.admin_wilayah_files.map((fileConfig) => (
                <FileConfigItem key={fileConfig.id} config={fileConfig} />
              ))}
              <Button onClick={() => addNewFileConfig(jobType.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah File Baru
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
```

#### Upload Component untuk Admin Wilayah
```tsx
const AdminWilayahFileUpload = () => {
  const [requiredFiles, setRequiredFiles] = useState<AdminWilayahFileConfig[]>([]);
  
  useEffect(() => {
    fetchAdminWilayahFileConfig(pengajuan.jenis_jabatan_id);
  }, [pengajuan.jenis_jabatan_id]);

  const isAllFilesUploaded = () => {
    return requiredFiles
      .filter(file => file.is_required)
      .every(fileType => {
        return pengajuan?.files.some(f => 
          f.file_type === fileType.file_type && 
          f.file_category === 'admin_wilayah'
        );
      });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload File Admin Wilayah</h2>
      {requiredFiles.map((fileConfig) => (
        <FileUploadSection 
          key={fileConfig.id}
          fileConfig={fileConfig}
          onUpload={handleFileUpload}
        />
      ))}
    </div>
  );
};
```

#### Dashboard Monitoring
```tsx
const AdminWilayahDashboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Wilayah Upload Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adminWilayahUploads.map((upload) => (
            <div key={upload.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{upload.pengajuan.pegawai.nama}</div>
                  <div className="text-sm text-gray-500">
                    {upload.pengajuan.jenis_jabatan}
                  </div>
                </div>
                <Badge>{upload.status}</Badge>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Uploaded by: <strong>{upload.uploaded_by_name}</strong> 
                ({upload.uploaded_by_office}) - {formatDate(upload.uploaded_at)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

## 📊 Monitoring & Reporting

### 1. Performance Tracking
- Jumlah file yang diupload per admin wilayah
- Waktu processing per admin wilayah
- Workload distribution

### 2. Audit Trail
- History upload per admin wilayah
- Timeline lengkap dari draft sampai final approval
- Tracking perubahan status

### 3. Dashboard Metrics
- Total pengajuan dalam proses admin wilayah
- File yang belum diupload
- Admin wilayah yang paling aktif

## 🔐 Security & Permissions

### 1. Role-based Access
- **Superadmin**: Full access ke semua fitur
- **Admin Wilayah**: Upload file sesuai konfigurasi, lihat file kabupaten
- **Kabupaten**: Hanya lihat file yang mereka upload

### 2. File Access Control
- File kabupaten hanya bisa diakses kabupaten dan admin wilayah
- File admin wilayah hanya bisa diakses admin wilayah dan superadmin
- Download file dengan authentication

### 3. Audit Logging
- Log semua aktivitas upload
- Log perubahan konfigurasi
- Log akses file

## 🚀 Deployment Checklist

### 1. Database Migration
- [ ] Jalankan migration untuk tabel admin_wilayah_file_configuration
- [ ] Update tabel pengajuan_files dengan kolom baru
- [ ] Update enum status pengajuan
- [ ] Buat index untuk optimasi query

### 2. Backend Implementation
- [ ] Buat model AdminWilayahFileConfig
- [ ] Implementasi API endpoints
- [ ] Update middleware untuk role admin_wilayah
- [ ] Update upload logic dengan tracking

### 3. Frontend Implementation
- [ ] Buat halaman settings untuk konfigurasi
- [ ] Update upload component untuk admin wilayah
- [ ] Buat dashboard monitoring
- [ ] Update role-based UI components

### 4. Testing
- [ ] Test workflow lengkap
- [ ] Test role-based access
- [ ] Test file upload dengan tracking
- [ ] Test konfigurasi dinamis

### 5. User Management
- [ ] Buat multiple admin wilayah accounts
- [ ] Set permission untuk setiap account
- [ ] Training untuk admin wilayah
- [ ] Dokumentasi user guide

## 📝 Notes

- Sistem ini backward compatible dengan existing pengajuan
- Konfigurasi file bisa diubah tanpa update code
- Tracking uploader memudahkan accountability
- Multiple accounts admin wilayah untuk security yang lebih baik