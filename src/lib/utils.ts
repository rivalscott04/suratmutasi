import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fungsi untuk mengkonversi tanggal ke format Indonesia dengan nama bulan
export function formatTanggalIndonesia(tanggal: string) {
  if (!tanggal) return '';
  const bulanIndo = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  let d, m, y;
  if (/\d{4}-\d{2}-\d{2}/.test(tanggal)) {
    // yyyy-mm-dd
    [y, m, d] = tanggal.split('-');
    return `${parseInt(d, 10)} ${bulanIndo[parseInt(m, 10)]} ${y}`;
  } else if (/\d{2}-\d{2}-\d{4}/.test(tanggal)) {
    // dd-mm-yyyy
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

export function getKanwilSettings() {
  try {
    const savedSettings = localStorage.getItem('kanwilSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        tingkat1: parsed.tingkat1 || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
        tingkat2: parsed.tingkat2 || 'KANTOR WILAYAH KEMENTERIAN AGAMA',
        tingkat3: parsed.tingkat3 || 'PROVINSI NUSA TENGGARA BARAT',
        alamat: parsed.alamat || '',
        telepon: parsed.telepon || '',
        fax: parsed.fax || '',
        email: parsed.email || '',
        website: parsed.website || ''
      };
    }
  } catch (err) {
    console.error('Error parsing kanwil settings:', err);
  }

  // Default values if no settings found
  return {
    tingkat1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
    tingkat2: 'KANTOR WILAYAH KEMENTERIAN AGAMA',
    tingkat3: 'PROVINSI NUSA TENGGARA BARAT',
    alamat: '',
    telepon: '',
    fax: '',
    email: '',
    website: ''
  };
}
