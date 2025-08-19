# Environment Setup Guide

## Overview

Aplikasi ini menggunakan konfigurasi environment yang sederhana untuk development dan production mode.

## Environment Files

### Development Environment (`env.development`)
```env
VITE_API_URL=http://localhost:3001
```

### Production Environment (`env.production`)
```env
VITE_API_URL=https://bemutasi.rivaldev.site
```

## Available Scripts

### Development Mode
```bash
npm run dev
```
- Menggunakan `env.development`
- API URL: `http://localhost:3001`
- Cocok untuk development lokal

### Production Mode
```bash
npm run dev:prod
```
- Menggunakan `env.production`
- API URL: `https://bemutasi.rivaldev.site`
- Cocok untuk testing di server production

### Full Stack Development
```bash
npm run dev:full
```
- Menjalankan frontend dan backend sekaligus
- Menggunakan development mode

## How It Works

1. **Environment Detection**: Aplikasi akan menggunakan environment variable `VITE_API_URL` jika tersedia
2. **Fallback Logic**: Jika environment variable tidak ada, akan detect berdasarkan hostname
3. **Automatic Mode**: Vite akan otomatis load file environment berdasarkan mode yang dijalankan

## Migration from Environment Switcher

### What Changed
- ❌ Removed complex environment switcher UI
- ❌ Removed localStorage-based environment switching
- ✅ Added simple environment files
- ✅ Added npm scripts for different modes
- ✅ Simplified API configuration

### Benefits
- Lebih sederhana dan mudah dipahami
- Tidak perlu UI switcher yang kompleks
- Konfigurasi yang lebih jelas dan terstruktur
- Mudah untuk maintenance dan deployment

## Troubleshooting

### Environment Variable Not Loading
1. Pastikan file environment ada di root project
2. Pastikan menggunakan script yang benar (`npm run dev` atau `npm run dev:prod`)
3. Restart development server setelah mengubah file environment

### API Connection Issues
1. Check `VITE_API_URL` di file environment
2. Pastikan backend server berjalan
3. Check network connectivity

## Best Practices

1. **Development**: Selalu gunakan `npm run dev` untuk development lokal
2. **Testing**: Gunakan `npm run dev:prod` untuk testing di environment production
3. **Deployment**: Pastikan environment variables sudah benar sebelum deploy
4. **Version Control**: Jangan commit file environment yang berisi sensitive data
