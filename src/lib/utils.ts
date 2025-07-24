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
  
  try {
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) {
      // Jika format bukan ISO, coba parse sebagai dd/mm/yyyy
      const parts = tanggal.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        const newDate = new Date(year, month, day);
        if (!isNaN(newDate.getTime())) {
          const dayStr = day.toString();
          const monthName = bulanIndo[month] || parts[1];
          return `${dayStr} ${monthName} ${year}`;
        }
      }
      return tanggal; // Return original if can't parse
    }
    
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthName = bulanIndo[month] || (month + 1).toString();
    
    return `${day} ${monthName} ${year}`;
  } catch (error) {
    return tanggal; // Return original if error
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
