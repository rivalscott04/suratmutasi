// Utility untuk format error message menjadi ramah pengguna

// Mapping status untuk ditampilkan ke user
const statusMap: Record<string, string> = {
  'draft': 'Draft',
  'submitted': 'Telah Dikirim',
  'approved': 'Disetujui',
  'rejected': 'Ditolak',
  'resubmitted': 'Dikirim Ulang',
  'admin_wilayah_approved': 'Disetujui Admin Wilayah',
  'admin_wilayah_rejected': 'Ditolak Admin Wilayah',
  'admin_wilayah_submitted': 'Dikirim ke Admin Pusat',
  'kanwil_submitted': 'Dikirim ke Admin Wilayah',
  'kanwil_approved': 'Disetujui Kanwil',
  'final_approved': 'Disetujui Final',
  'final_rejected': 'Ditolak Final'
};

/**
 * Format error message dari backend menjadi pesan yang ramah pengguna
 * @param errorMessage - Error message dari backend atau Error object
 * @returns Formatted error message yang ramah pengguna
 */
export const formatErrorMessage = (errorMessage: string | Error): string => {
  // Extract message jika Error object
  const message = errorMessage instanceof Error ? errorMessage.message : errorMessage;
  
  if (!message) {
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }

  // Cek apakah error message mengandung informasi duplikat pengajuan
  if (message.includes('sudah memiliki pengajuan')) {
    // Extract informasi dari error message
    // Format: "Pegawai {nama} (NIP: {nip}) sudah memiliki pengajuan untuk jabatan "{jenis_jabatan}" dengan status "{status}""
    const match = message.match(/Pegawai (.+?) \(NIP: (.+?)\) sudah memiliki pengajuan untuk jabatan "(.+?)" dengan status "(.+?)"/);
    
    if (match) {
      const [, pegawaiNama, pegawaiNip, jenisJabatan, status] = match;
      const statusDisplay = statusMap[status] || status;
      
      return `Tidak dapat membuat pengajuan baru. Pegawai ${pegawaiNama} (NIP: ${pegawaiNip}) sudah memiliki pengajuan untuk jabatan "${jenisJabatan}" dengan status "${statusDisplay}". Silakan hapus pengajuan yang sudah ada terlebih dahulu jika ingin membuat pengajuan baru.`;
    }
  }

  // Format error umum lainnya
  if (message.includes('Rate limit')) {
    return 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa saat.';
  }

  if (message.includes('Unauthorized') || message.includes('401')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }

  if (message.includes('Forbidden') || message.includes('403')) {
    return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
  }

  if (message.includes('Not Found') || message.includes('404')) {
    return 'Data yang diminta tidak ditemukan.';
  }

  if (message.includes('Internal server error') || message.includes('500')) {
    return 'Terjadi kesalahan pada server. Silakan coba lagi nanti atau hubungi administrator.';
  }

  // Jika bukan error khusus, kembalikan error message asli
  return message;
};

/**
 * Extract error message dari berbagai tipe error
 * @param error - Error object, string, atau unknown
 * @returns Error message string
 */
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
};

/**
 * Format dan extract error message dalam satu fungsi
 * @param error - Error object, string, atau unknown
 * @returns Formatted error message yang ramah pengguna
 */
export const formatError = (error: unknown): string => {
  const message = extractErrorMessage(error);
  return formatErrorMessage(message);
};

