# Fitur Tracking Dokumen - Dokumentasi Lengkap

## 📋 Overview

Fitur tracking dokumen memungkinkan **Admin Pusat** untuk input status tracking berkas yang sudah final approved dari superadmin di wilayah, dan **Superadmin** untuk monitor progress tracking tersebut.

## 🔄 Alur Kerja

1. **Kabko/Operator** → **Admin Wilayah** → **Superadmin** (di wilayah) → **Final Approved**
2. **Admin Pusat** (di pusat) → input tracking status untuk berkas yang sudah final approved
3. **Superadmin** (di wilayah) → monitor progress tracking berkas mereka

## 🎯 Fitur Utama

### 1. **Master Status Tracking**
- Konfigurasi status tracking yang bisa dipilih admin pusat
- Status default: "Diterima di Pusat", "Disposisi ke Katim Mutasi", "Sedang Diproses", dll
- Bisa ditambah/edit oleh admin (superadmin)

### 2. **Input Tracking (Admin Pusat)**
- Lihat semua berkas yang sudah final approved
- Input status tracking dengan dropdown yang sudah dikonfigurasi
- Tambah catatan dan estimasi penyelesaian
- Search dan filter berkas

### 3. **Monitor Tracking (Superadmin)**
- Lihat progress tracking berkas dari wilayahnya
- Dashboard dengan statistik: total, selesai, dalam proses, terlambat
- Detail history tracking per berkas
- Alert untuk berkas yang terlambat

## 🗄️ Database Schema

### Tabel `tracking_status_master`
```sql
- id (int, PK)
- status_name (varchar) - Nama status yang ditampilkan
- status_code (varchar, unique) - Kode untuk referensi
- description (text) - Deskripsi status
- is_active (boolean) - Status aktif/nonaktif
- sort_order (int) - Urutan tampil di dropdown
- created_by (uuid) - User yang membuat status
- created_at, updated_at
```

### Tabel `pengajuan_tracking`
```sql
- id (uuid, PK)
- pengajuan_id (uuid, FK) - Referensi ke pengajuan
- tracking_status_id (int, FK) - Referensi ke status master
- status_name (varchar) - Snapshot nama status
- notes (text) - Catatan tambahan
- estimated_days (int) - Estimasi penyelesaian dalam hari
- actual_completion_date (datetime) - Tanggal penyelesaian aktual
- tracked_by (uuid, FK) - Admin pusat yang input
- tracked_by_name (varchar) - Nama admin pusat
- created_at, updated_at
```

## 🔧 API Endpoints

### Admin Pusat
- `GET /api/tracking/status-master` - Ambil master status
- `GET /api/tracking/pengajuan` - Ambil berkas final approved
- `POST /api/tracking/pengajuan/:id` - Input tracking status

### Superadmin
- `GET /api/tracking/superadmin` - Ambil tracking untuk monitor
- `GET /api/tracking/pengajuan/:id/history` - History tracking per berkas

### Admin (Master Status)
- `POST /api/tracking/status-master` - Buat status master baru

## 🎨 Frontend Pages

### 1. **AdminPusatTracking.tsx** (`/tracking`)
- Dashboard untuk input tracking status
- List berkas final approved dengan search
- Dialog form untuk input tracking
- Real-time update setelah submit

### 2. **SuperadminTracking.tsx** (`/tracking-monitor`)
- Dashboard monitor dengan statistik
- List berkas dengan status tracking
- Detail dialog dengan history tracking
- Alert untuk berkas terlambat

## 🔐 Role & Permission

### Admin Pusat (`user`)
- Akses: `/tracking`
- Bisa: Input tracking status untuk berkas final approved
- Tidak bisa: Lihat berkas dari wilayah lain
- **Catatan**: Admin Pusat menggunakan role `user` yang sudah ada, bukan role baru

### Superadmin (`admin`)
- Akses: `/tracking-monitor`
- Bisa: Monitor tracking berkas dari semua wilayah
- Bisa: Buat/edit master status tracking

## 📱 UI/UX Features

### Admin Pusat Interface
- **Search**: Cari berdasarkan NIP, jenis jabatan, kabupaten
- **Status Badges**: Visual indicator status tracking
- **Form Dialog**: Input tracking dengan dropdown status
- **Real-time Updates**: Auto refresh setelah submit

### Superadmin Interface
- **Stats Cards**: Total, selesai, dalam proses, terlambat
- **Status Icons**: Visual indicator dengan warna
- **Overdue Alerts**: Badge merah untuk berkas terlambat
- **History Timeline**: Detail tracking per berkas

## 🚀 Setup & Installation

### 1. Database Migration
```bash
# Jalankan script migration
mysql -u username -p database_name < database/migrations/complete_tracking_setup.sql
```

### 2. Backend Setup
- Model sudah terintegrasi dengan Sequelize
- Routes sudah terdaftar di app.ts
- Controller sudah siap digunakan

### 3. Frontend Setup
- Pages sudah dibuat dan terintegrasi
- Routes sudah terdaftar di App.tsx
- Navigation sudah diupdate

### 4. User Setup
```sql
-- Buat user admin pusat (menggunakan role 'user')
INSERT INTO users (id, email, password_hash, full_name, role, is_active) 
VALUES (UUID(), 'admin.pusat@example.com', '$2b$10$hash', 'Admin Pusat', 'user', true);
```

## 🔍 Testing

### Test Cases
1. **Admin Pusat Login** → Akses `/tracking` → Input tracking status
2. **Superadmin Login** → Akses `/tracking-monitor` → Lihat progress
3. **Role Validation** → Pastikan hanya role yang tepat bisa akses
4. **Data Integrity** → Pastikan foreign key constraints bekerja

### Manual Testing
1. Login sebagai user (admin pusat)
2. Akses menu "Tracking Dokumen"
3. Pilih berkas final approved
4. Input status tracking dengan catatan dan estimasi
5. Login sebagai superadmin
6. Akses menu "Monitor Tracking"
7. Verifikasi data tracking muncul dengan benar

## 📊 Monitoring & Analytics

### Metrics yang Bisa Dimonitor
- Total berkas yang ditrack
- Rata-rata waktu penyelesaian
- Berkas yang terlambat
- Status tracking yang paling sering digunakan
- Performance admin pusat

### Dashboard Features
- Real-time statistics
- Visual progress indicators
- Overdue alerts
- Export capabilities (future enhancement)

## 🔮 Future Enhancements

### Planned Features
1. **Email Notifications**: Notifikasi ke superadmin ketika ada update tracking
2. **Export Reports**: Download laporan tracking dalam Excel/PDF
3. **Advanced Analytics**: Grafik trend dan analisis performa
4. **Mobile App**: Aplikasi mobile untuk admin pusat
5. **API Integration**: Integrasi dengan sistem eksternal

### Technical Improvements
1. **Caching**: Redis cache untuk performa yang lebih baik
2. **Real-time Updates**: WebSocket untuk update real-time
3. **Audit Trail**: Log lengkap semua perubahan tracking
4. **Bulk Operations**: Input tracking untuk multiple berkas sekaligus

## 🐛 Troubleshooting

### Common Issues
1. **Role Access Denied**: Pastikan user memiliki role yang tepat
2. **Foreign Key Error**: Pastikan pengajuan sudah final approved
3. **Status Not Found**: Pastikan master status sudah dikonfigurasi
4. **Permission Error**: Pastikan user memiliki akses ke endpoint

### Debug Steps
1. Check user role di database
2. Verify pengajuan status = 'final_approved'
3. Check tracking_status_master data
4. Check API endpoint permissions
5. Check frontend route guards

## 📞 Support

Untuk pertanyaan atau masalah terkait fitur tracking, silakan hubungi tim development atau buat issue di repository.

---

**Fitur Tracking Dokumen v1.0**  
*Dibuat untuk meningkatkan transparansi dan monitoring proses berkas di pusat*
