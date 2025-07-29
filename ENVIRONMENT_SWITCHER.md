# Environment Switcher

Fitur untuk switching environment antara development (localhost) dan production (server) tanpa perlu deploy ulang.

## Cara Menggunakan

### 1. Environment Switcher di UI
- Buka aplikasi di browser
- Di navigation bar, ada dropdown "Environment"
- Pilih:
  - **Development (Local)** - untuk testing di localhost
  - **Production (Server)** - untuk testing di server

### 2. Environment yang Tersedia

#### Development (Local)
- **URL:** `http://localhost:3001`
- **Warna:** Hijau
- **Icon:** Monitor
- **Gunakan untuk:** Testing fitur baru, debugging

#### Production (Server)
- **URL:** `https://bemutasi.rivaldev.site`
- **Warna:** Biru
- **Icon:** Server
- **Gunakan untuk:** Testing di environment production

### 3. Cara Menjalankan Backend Development

```bash
# Terminal 1: Jalankan frontend
npm run dev

# Terminal 2: Jalankan backend development
npm run backend:dev
# atau
cd backend && npm run dev
```

### 3.1. Menjalankan Frontend + Backend Sekaligus

```bash
# Jalankan frontend dan backend development sekaligus
npm run dev:full
```

**Keuntungan:**
- Hanya perlu 1 terminal
- Auto restart jika ada perubahan
- Lebih praktis untuk development

### 4. Logging

Setiap request API akan di-log di console dengan format:
```
🌐 API Request to: http://localhost:3001/api/letters (development)
🌐 API Request to: https://bemutasi.rivaldev.site/api/letters (production)
```

### 5. Persistence

Environment yang dipilih akan tersimpan di localStorage, jadi akan tetap sama setelah refresh browser.

### 6. Auto Reload

Setelah switch environment, halaman akan auto reload untuk memastikan semua request menggunakan environment yang baru.

## Keuntungan

1. **Tidak perlu deploy ulang** untuk testing di environment berbeda
2. **Switch cepat** antara local dan server
3. **Visual indicator** dengan warna dan icon
4. **Mobile responsive** - bisa digunakan di mobile
5. **Persistent** - setting tersimpan di browser

## Troubleshooting

### Backend tidak bisa diakses di localhost
1. Pastikan backend server berjalan: `npm run backend:dev`
2. Cek port 3001 tidak digunakan aplikasi lain
3. Cek firewall/antivirus tidak memblokir port

### Environment tidak berubah
1. Refresh halaman setelah switch environment
2. Cek localStorage di browser developer tools
3. Pastikan tidak ada cache browser

### API request gagal
1. Cek console log untuk melihat URL yang digunakan
2. Pastikan backend server berjalan di environment yang dipilih
3. Cek network tab di browser developer tools 