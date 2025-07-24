import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fungsi untuk mengkonversi tanggal ke format Indonesia dengan nama bulan
export function formatTanggalIndonesia(tanggal: string): string {
  if (!tanggal) return '';
  const bulanIndo = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  let d, m, y;
  if (/\d{4}-\d{2}-\d{2}/.test(tanggal)) {
    [y, m, d] = tanggal.split('-');
    return `${parseInt(d, 10)} ${bulanIndo[parseInt(m, 10)]} ${y}`;
  } else if (/\d{2}-\d{2}-\d{4}/.test(tanggal)) {
    [d, m, y] = tanggal.split('-');
    return `${parseInt(d, 10)} ${bulanIndo[parseInt(m, 10)]} ${y}`;
  } else {
    return tanggal;
  }
}

// Format nama kabupaten/kota agar rapi (Kota Mataram, Kabupaten Lombok Timur)
export function formatKabKota(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/^(kota|kabupaten)/, (m) => m.charAt(0).toUpperCase() + m.slice(1))
    .replace(/(^| )([a-z])/g, (s) => s.toUpperCase());
}
