# Tutorial Role User (Admin Pusat) - Panduan Lengkap

## 📋 Pengenalan

Role **User** dalam sistem ini merupakan peran khusus untuk **Admin Pusat** yang bertanggung jawab dalam mengelola tracking dokumen dan monitoring berkas pengajuan yang sudah disetujui. Role ini memiliki akses read-only untuk sebagian besar fitur, dengan fokus utama pada fungsi tracking dan monitoring.

## 🎯 Tujuan Role User

Role User (Admin Pusat) dirancang untuk:
- Melakukan tracking status berkas pengajuan yang sudah final approved
- Mengkonfigurasi status tracking yang tersedia di sistem
- Memantau dan mengelola dokumen yang sudah masuk ke pusat
- Generate Surat Keputusan (SK) Mutasi
- Melihat riwayat surat yang telah dibuat

## 🔐 Hak Akses dan Pembatasan

### ✅ Yang Bisa Dilakukan
- Melihat dashboard dan statistik sistem
- Melihat data pengajuan (read-only)
- Melihat detail pengajuan beserta file-file yang diupload
- Generate Surat Keputusan Mutasi
- Melihat riwayat surat
- Input tracking status untuk berkas final approved
- Mengkonfigurasi master status tracking

### ❌ Yang Tidak Bisa Dilakukan
- Membuat pengajuan baru
- Edit atau menghapus pengajuan
- Upload file pengajuan
- Approve atau reject pengajuan
- Mengelola user (management user)
- Mengakses settings sistem
- Menggunakan Template Generator (kecuali SK Generator)

## 📱 Menu dan Fitur yang Tersedia

### 1. Dashboard

**Lokasi:** Menu utama → Dashboard

**Fungsi:**
- Menampilkan overview statistik sistem
- Menampilkan informasi pengguna (Admin Pusat)
- Menampilkan quick actions yang tersedia untuk role user
- Menampilkan statistik surat dan pengajuan

**Yang Bisa Dilakukan:**
- Melihat statistik keseluruhan sistem
- Melihat quick action untuk akses cepat ke fitur yang tersedia
- Melihat ringkasan data pengajuan dan surat

**Cara Menggunakan:**
1. Setelah login, Anda akan langsung diarahkan ke halaman Dashboard
2. Dashboard menampilkan berbagai statistik dan informasi ringkas
3. Gunakan quick actions untuk navigasi cepat ke fitur yang diinginkan

---

### 2. SK Generator

**Lokasi:** Menu utama → SK Generator

**Fungsi:**
- Generate Surat Keputusan Mutasi berdasarkan data pengajuan yang sudah approved
- Membuat dokumen SK secara otomatis dengan template yang sudah tersedia

**Yang Bisa Dilakukan:**
- Memilih pengajuan yang sudah approved untuk dibuatkan SK
- Generate SK dengan data yang sudah terisi otomatis
- Preview SK sebelum di-generate
- Download atau print SK yang sudah dibuat

**Cara Menggunakan:**
1. Klik menu "SK Generator" di sidebar
2. Pilih pengajuan yang ingin dibuatkan SK-nya
3. Isi data tambahan jika diperlukan
4. Preview SK untuk memastikan data sudah benar
5. Klik "Generate" untuk membuat SK
6. Download atau print SK yang sudah dibuat

**Catatan Penting:**
- Hanya pengajuan dengan status approved yang bisa dibuatkan SK
- Pastikan semua data pengajuan sudah lengkap sebelum generate SK

---

### 3. Riwayat Surat

**Lokasi:** Menu utama → Riwayat Surat

**Fungsi:**
- Melihat daftar semua surat yang telah dibuat di sistem
- Melihat detail surat yang sudah dibuat
- Preview surat sebelum di-download

**Yang Bisa Dilakukan:**
- Melihat daftar surat dengan filter dan pencarian
- Melihat detail surat lengkap
- Preview surat dalam format PDF atau dokumen
- Download surat yang sudah dibuat
- Melihat informasi pembuat surat dan waktu pembuatan

**Cara Menggunakan:**
1. Klik menu "Riwayat Surat" di sidebar
2. Gunakan search box untuk mencari surat tertentu
3. Gunakan filter untuk menyaring surat berdasarkan kriteria tertentu
4. Klik pada surat untuk melihat detail lengkap
5. Gunakan tombol "Preview" untuk melihat isi surat
6. Gunakan tombol "Download" untuk mengunduh surat

---

### 4. Data Pengajuan

**Lokasi:** Menu utama → Data Pengajuan

**Fungsi:**
- Melihat daftar semua pengajuan yang ada di sistem
- Melihat detail pengajuan beserta file-file yang diupload
- Monitoring status pengajuan

**Yang Bisa Dilakukan:**
- Melihat daftar pengajuan dengan berbagai filter
- Mencari pengajuan berdasarkan NIP, nama pegawai, atau kabupaten
- Melihat detail pengajuan lengkap
- Melihat file-file yang sudah diupload
- Download file pengajuan
- Melihat status dan history pengajuan
- Melihat informasi tracking jika sudah ada

**Yang Tidak Bisa Dilakukan:**
- Membuat pengajuan baru
- Edit data pengajuan
- Upload file pengajuan
- Hapus pengajuan
- Approve atau reject pengajuan

**Cara Menggunakan:**
1. Klik menu "Data Pengajuan" di sidebar
2. Gunakan search box untuk mencari pengajuan tertentu
3. Gunakan filter untuk menyaring pengajuan berdasarkan:
   - Status pengajuan
   - Jenis jabatan
   - Kabupaten/Kota
   - Tanggal pengajuan
4. Klik pada pengajuan untuk melihat detail lengkap
5. Di halaman detail, Anda bisa:
   - Melihat informasi lengkap pegawai dan pengajuan
   - Melihat semua file yang sudah diupload
   - Download file-file pengajuan
   - Melihat status dan history pengajuan
   - Melihat tracking status jika sudah ada

**Catatan Penting:**
- Role user hanya bisa melihat pengajuan, tidak bisa melakukan modifikasi
- File yang bisa dilihat adalah file yang sudah diupload oleh operator atau admin
- Tracking status hanya muncul untuk pengajuan yang sudah final approved

---

### 5. Tracking Dokumen

**Lokasi:** Menu utama → Tracking → Tracking Dokumen

**Fungsi:**
- Input status tracking untuk berkas pengajuan yang sudah final approved
- Memantau progress pengolahan berkas di pusat
- Menambahkan catatan dan estimasi waktu penyelesaian

**Yang Bisa Dilakukan:**
- Melihat daftar berkas yang sudah final approved
- Input status tracking untuk setiap berkas
- Menambahkan catatan tracking
- Menambahkan estimasi waktu penyelesaian
- Mencari dan memfilter berkas yang akan ditrack
- Melihat history tracking untuk setiap berkas

**Cara Menggunakan:**
1. Klik menu "Tracking" → "Tracking Dokumen"
2. Sistem akan menampilkan daftar berkas yang sudah final approved
3. Gunakan search box untuk mencari berkas tertentu berdasarkan:
   - NIP pegawai
   - Nama pegawai
   - Jenis jabatan
   - Kabupaten/Kota
4. Klik tombol "Input Tracking" pada berkas yang ingin ditrack
5. Di dialog yang muncul:
   - Pilih status tracking dari dropdown (status sudah dikonfigurasi di Setting Status Tracking)
   - Tambahkan catatan jika diperlukan
   - Isi estimasi waktu penyelesaian (dalam hari)
   - Klik "Simpan" untuk menyimpan tracking
6. Status tracking akan langsung terupdate dan bisa dilihat oleh superadmin di wilayah

**Status Tracking yang Umum:**
- Diterima di Pusat
- Disposisi ke Katim Mutasi
- Sedang Diproses
- Menunggu Persetujuan
- Selesai Diproses
- Dan status lainnya yang sudah dikonfigurasi

**Catatan Penting:**
- Hanya berkas dengan status "final_approved" yang bisa ditrack
- Status tracking bisa diupdate berkali-kali untuk mencatat progress
- Setiap update tracking akan tercatat dalam history
- Superadmin di wilayah bisa melihat tracking status berkas mereka

---

### 6. Setting Status Tracking

**Lokasi:** Menu utama → Tracking → Setting Status Tracking

**Fungsi:**
- Mengkonfigurasi master status tracking yang tersedia
- Menambah, mengedit, atau menonaktifkan status tracking
- Mengatur urutan tampilan status di dropdown

**Yang Bisa Dilakukan:**
- Melihat daftar semua status tracking yang tersedia
- Menambah status tracking baru
- Mengedit status tracking yang sudah ada
- Menonaktifkan atau mengaktifkan status tracking
- Mengatur urutan tampilan status (sort order)
- Menambahkan deskripsi untuk setiap status

**Cara Menggunakan:**
1. Klik menu "Tracking" → "Setting Status Tracking"
2. Halaman akan menampilkan daftar status tracking yang sudah ada
3. Untuk menambah status baru:
   - Klik tombol "Tambah Status"
   - Isi nama status (contoh: "Diterima di Pusat")
   - Isi kode status (contoh: "RECEIVED")
   - Tambahkan deskripsi jika diperlukan
   - Atur urutan tampilan (sort order)
   - Pilih aktif/nonaktif
   - Klik "Simpan"
4. Untuk mengedit status:
   - Klik tombol edit pada status yang ingin diubah
   - Ubah data yang diperlukan
   - Klik "Simpan"
5. Untuk menonaktifkan status:
   - Klik tombol edit pada status
   - Ubah status menjadi "Nonaktif"
   - Klik "Simpan"
   - Status yang nonaktif tidak akan muncul di dropdown saat input tracking

**Catatan Penting:**
- Status yang sudah digunakan di tracking tidak bisa dihapus, hanya bisa dinonaktifkan
- Pastikan kode status unik dan tidak duplikat
- Urutan sort order menentukan urutan tampilan di dropdown
- Status yang nonaktif tidak akan muncul di dropdown input tracking

---

## 🔄 Alur Kerja Tracking Dokumen

Berikut adalah alur kerja lengkap untuk fitur tracking dokumen:

1. **Pengajuan Masuk ke Pusat**
   - Pengajuan yang sudah final approved oleh superadmin di wilayah akan muncul di daftar tracking
   - Status pengajuan harus "final_approved" untuk bisa ditrack

2. **Input Tracking Status**
   - Admin Pusat (role user) mengakses menu "Tracking Dokumen"
   - Memilih berkas yang akan ditrack
   - Input status tracking pertama kali (misalnya: "Diterima di Pusat")
   - Menambahkan catatan dan estimasi waktu jika diperlukan

3. **Update Tracking**
   - Seiring berjalannya proses, Admin Pusat bisa update status tracking
   - Setiap update akan tercatat dalam history
   - Status bisa diupdate berkali-kali sampai selesai

4. **Monitoring oleh Superadmin**
   - Superadmin di wilayah bisa melihat tracking status berkas mereka
   - Mereka bisa monitor progress melalui menu "Monitor Tracking"
   - Alert akan muncul jika berkas terlambat dari estimasi

5. **Selesai**
   - Ketika proses selesai, Admin Pusat bisa update status menjadi "Selesai Diproses"
   - Atau status lainnya sesuai dengan konfigurasi

---

## 📊 Tips dan Best Practices

### Untuk Tracking Dokumen
1. **Update Secara Berkala**
   - Update status tracking secara berkala untuk memberikan informasi real-time kepada superadmin di wilayah
   - Jangan lupa update estimasi waktu jika ada perubahan

2. **Gunakan Catatan yang Jelas**
   - Tambahkan catatan yang jelas dan informatif saat input tracking
   - Catatan membantu superadmin memahami progress yang terjadi

3. **Estimasi Waktu yang Realistis**
   - Berikan estimasi waktu penyelesaian yang realistis
   - Update estimasi jika ada perubahan timeline

4. **Gunakan Status yang Tepat**
   - Pilih status tracking yang sesuai dengan kondisi aktual berkas
   - Pastikan status sudah dikonfigurasi dengan baik di Setting Status Tracking

### Untuk Setting Status Tracking
1. **Nama Status yang Jelas**
   - Gunakan nama status yang jelas dan mudah dipahami
   - Hindari nama yang ambigu atau terlalu panjang

2. **Kode Status yang Konsisten**
   - Gunakan format kode yang konsisten (misalnya: UPPERCASE dengan underscore)
   - Contoh: RECEIVED, IN_PROCESS, COMPLETED

3. **Urutan yang Logis**
   - Atur urutan status sesuai dengan alur proses yang sebenarnya
   - Status awal di atas, status akhir di bawah

4. **Deskripsi yang Informatif**
   - Tambahkan deskripsi untuk setiap status agar pengguna lain memahami maksud status tersebut

---

## ❓ Frequently Asked Questions (FAQ)

### Q: Apakah role user bisa membuat pengajuan baru?
**A:** Tidak, role user hanya bisa melihat pengajuan yang sudah ada. Untuk membuat pengajuan baru, harus menggunakan role operator atau admin.

### Q: Apakah role user bisa approve atau reject pengajuan?
**A:** Tidak, role user tidak memiliki hak untuk approve atau reject pengajuan. Hak tersebut hanya dimiliki oleh admin dan admin_wilayah.

### Q: Berkas apa saja yang bisa ditrack?
**A:** Hanya berkas dengan status "final_approved" yang bisa ditrack. Berkas dengan status lain tidak akan muncul di daftar tracking.

### Q: Apakah status tracking bisa dihapus?
**A:** Status tracking yang sudah digunakan tidak bisa dihapus, hanya bisa dinonaktifkan. Status yang nonaktif tidak akan muncul di dropdown saat input tracking.

### Q: Siapa yang bisa melihat tracking status?
**A:** Admin Pusat (role user) bisa input tracking, sedangkan Superadmin (role admin) di wilayah bisa melihat tracking status berkas mereka melalui menu "Monitor Tracking".

### Q: Apakah role user bisa mengakses Settings?
**A:** Tidak, role user tidak bisa mengakses menu Settings. Menu Settings hanya bisa diakses oleh admin, admin_wilayah, dan operator.

### Q: Apakah role user bisa mengelola user lain?
**A:** Tidak, role user tidak bisa mengakses menu Management User. Menu tersebut hanya bisa diakses oleh admin.

### Q: Bagaimana cara melihat history tracking untuk suatu berkas?
**A:** History tracking bisa dilihat di halaman detail pengajuan. Setiap update tracking akan tercatat dengan timestamp dan informasi user yang melakukan update.

---

## 🔍 Troubleshooting

### Masalah: Berkas tidak muncul di daftar tracking
**Solusi:**
- Pastikan status pengajuan sudah "final_approved"
- Refresh halaman atau coba logout dan login kembali
- Pastikan Anda menggunakan role "user" yang benar

### Masalah: Tidak bisa input tracking
**Solusi:**
- Pastikan status tracking sudah dikonfigurasi di Setting Status Tracking
- Pastikan ada status yang aktif
- Cek koneksi internet dan coba refresh halaman

### Masalah: Status tracking tidak muncul di dropdown
**Solusi:**
- Pastikan status sudah diaktifkan di Setting Status Tracking
- Cek apakah status sudah memiliki kode yang valid
- Refresh halaman atau logout dan login kembali

### Masalah: Tidak bisa mengakses menu tertentu
**Solusi:**
- Pastikan role Anda adalah "user"
- Beberapa menu memang tidak bisa diakses oleh role user (sesuai dengan hak akses)
- Hubungi admin jika Anda merasa ada menu yang seharusnya bisa diakses

---

## 📞 Bantuan dan Support

Jika Anda mengalami masalah atau memiliki pertanyaan terkait penggunaan sistem dengan role user, silakan:

1. **Cek Dokumentasi**
   - Baca kembali bagian yang relevan di tutorial ini
   - Cek FAQ untuk pertanyaan yang sering muncul

2. **Hubungi Admin**
   - Hubungi administrator sistem untuk bantuan lebih lanjut
   - Laporkan bug atau masalah yang ditemukan

3. **Cek Log Sistem**
   - Jika ada error, catat pesan error yang muncul
   - Sertakan informasi error saat meminta bantuan

---

## 📝 Kesimpulan

Role User (Admin Pusat) adalah peran penting dalam sistem untuk mengelola tracking dokumen dan monitoring berkas pengajuan. Meskipun memiliki akses read-only untuk sebagian besar fitur, role ini memiliki fungsi khusus dalam:

- **Tracking Dokumen**: Input dan update status tracking untuk berkas yang sudah final approved
- **Setting Status Tracking**: Konfigurasi master status tracking yang tersedia
- **Monitoring**: Melihat dan memantau data pengajuan dan surat
- **SK Generator**: Generate Surat Keputusan Mutasi

Dengan memahami fungsi dan cara penggunaan setiap fitur, Admin Pusat dapat bekerja dengan efisien dalam mengelola tracking dokumen dan memberikan informasi real-time kepada superadmin di wilayah.

---

**Dokumen ini dibuat untuk membantu Admin Pusat (role user) memahami dan menggunakan sistem dengan efektif.**

*Terakhir diperbarui: [Tanggal pembuatan dokumen]*

