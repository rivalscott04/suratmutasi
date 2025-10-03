// Standardized error and success messages for the application
export const ERROR_MESSAGES = {
  // Network & Connection
  NETWORK_ERROR: {
    title: 'Koneksi Bermasalah',
    description: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.'
  },
  CONNECTION_TIMEOUT: {
    title: 'Koneksi Timeout',
    description: 'Koneksi ke server memakan waktu terlalu lama. Silakan coba lagi.'
  },
  
  // Authentication & Authorization
  SESSION_EXPIRED: {
    title: 'Sesi Berakhir',
    description: 'Sesi Anda telah berakhir. Silakan login kembali.'
  },
  SESSION_REFRESH_FAILED: {
    title: 'Gagal Memperpanjang Session',
    description: 'Tidak dapat memperpanjang session. Silakan login kembali.'
  },
  SESSION_EXPIRING_WARNING: {
    title: 'Session Akan Berakhir',
    description: 'Session Anda akan berakhir dalam beberapa menit. Perpanjang session untuk melanjutkan.'
  },
  ACCESS_DENIED: {
    title: 'Akses Ditolak',
    description: 'Anda tidak memiliki izin untuk melakukan tindakan ini.'
  },
  INVALID_CREDENTIALS: {
    title: 'Login Gagal',
    description: 'Username atau password salah. Periksa kembali dan coba lagi.'
  },
  
  // Validation Errors
  VALIDATION_ERROR: {
    title: 'Data Tidak Valid',
    description: 'Data yang Anda masukkan tidak sesuai. Periksa kembali dan coba lagi.'
  },
  REQUIRED_FIELD: {
    title: 'Field Wajib',
    description: 'Field ini wajib diisi.'
  },
  INVALID_FORMAT: {
    title: 'Format Tidak Valid',
    description: 'Format data tidak sesuai dengan yang diharapkan.'
  },
  FILE_TOO_LARGE: {
    title: 'File Terlalu Besar',
    description: 'Ukuran file melebihi batas maksimum yang diizinkan.'
  },
  INVALID_FILE_TYPE: {
    title: 'Tipe File Tidak Valid',
    description: 'Tipe file tidak diizinkan. Gunakan format yang sesuai.'
  },
  
  // Server Errors
  SERVER_ERROR: {
    title: 'Server Bermasalah',
    description: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
  },
  INTERNAL_ERROR: {
    title: 'Kesalahan Internal',
    description: 'Terjadi kesalahan internal. Silakan hubungi administrator.'
  },
  SERVICE_UNAVAILABLE: {
    title: 'Layanan Tidak Tersedia',
    description: 'Layanan sedang tidak tersedia. Silakan coba lagi nanti.'
  },
  
  // Data Operations
  SAVE_FAILED: {
    title: 'Gagal Menyimpan',
    description: 'Data tidak dapat disimpan. Periksa data dan coba lagi.'
  },
  UPDATE_FAILED: {
    title: 'Gagal Memperbarui',
    description: 'Data tidak dapat diperbarui. Periksa data dan coba lagi.'
  },
  DELETE_FAILED: {
    title: 'Gagal Menghapus',
    description: 'Data tidak dapat dihapus. Periksa data dan coba lagi.'
  },
  FETCH_FAILED: {
    title: 'Gagal Mengambil Data',
    description: 'Data tidak dapat diambil dari server. Silakan coba lagi.'
  },
  
  // File Operations
  UPLOAD_FAILED: {
    title: 'Gagal Upload',
    description: 'File tidak dapat diupload. Periksa file dan coba lagi.'
  },
  DOWNLOAD_FAILED: {
    title: 'Gagal Download',
    description: 'File tidak dapat diunduh. Silakan coba lagi.'
  },
  GENERATE_PDF_FAILED: {
    title: 'Gagal Generate PDF',
    description: 'PDF tidak dapat dibuat. Silakan coba lagi.'
  },
  
  // Business Logic
  DUPLICATE_DATA: {
    title: 'Data Duplikat',
    description: 'Data yang sama sudah ada. Gunakan data yang berbeda.'
  },
  INVALID_OPERATION: {
    title: 'Operasi Tidak Valid',
    description: 'Operasi yang diminta tidak dapat dilakukan.'
  },
  DEPENDENCY_ERROR: {
    title: 'Dependency Error',
    description: 'Operasi tidak dapat dilakukan karena ada dependency yang belum terpenuhi.'
  },
  
  // Generic
  UNKNOWN_ERROR: {
    title: 'Terjadi Kesalahan',
    description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
  },
  OPERATION_FAILED: {
    title: 'Operasi Gagal',
    description: 'Operasi tidak dapat diselesaikan. Silakan coba lagi.'
  }
} as const;

export const SUCCESS_MESSAGES = {
  // Session Management
  SESSION_REFRESHED: {
    title: 'Session Diperpanjang',
    description: 'Session berhasil diperpanjang.'
  },
  LOGIN_SUCCESS: {
    title: 'Login Berhasil',
    description: 'Anda berhasil login ke sistem.'
  },
  LOGOUT_SUCCESS: {
    title: 'Logout Berhasil',
    description: 'Anda berhasil logout dari sistem.'
  },
  
  // Data Operations
  SAVE_SUCCESS: {
    title: 'Berhasil Disimpan',
    description: 'Data berhasil disimpan.'
  },
  UPDATE_SUCCESS: {
    title: 'Berhasil Diperbarui',
    description: 'Data berhasil diperbarui.'
  },
  DELETE_SUCCESS: {
    title: 'Berhasil Dihapus',
    description: 'Data berhasil dihapus.'
  },
  
  // File Operations
  UPLOAD_SUCCESS: {
    title: 'Upload Berhasil',
    description: 'File berhasil diupload.'
  },
  DOWNLOAD_SUCCESS: {
    title: 'Download Berhasil',
    description: 'File berhasil diunduh.'
  },
  GENERATE_PDF_SUCCESS: {
    title: 'PDF Berhasil Dibuat',
    description: 'PDF berhasil dibuat dan siap diunduh.'
  },
  
  // Authentication (duplicate removed - already defined above)
  
  // Business Operations
  APPROVE_SUCCESS: {
    title: 'Berhasil Disetujui',
    description: 'Data berhasil disetujui.'
  },
  REJECT_SUCCESS: {
    title: 'Berhasil Ditolak',
    description: 'Data berhasil ditolak.'
  },
  SUBMIT_SUCCESS: {
    title: 'Berhasil Dikirim',
    description: 'Data berhasil dikirim.'
  },
  
  // Generic
  OPERATION_SUCCESS: {
    title: 'Operasi Berhasil',
    description: 'Operasi berhasil diselesaikan.'
  }
} as const;

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Field ini wajib diisi',
  EMAIL: 'Format email tidak valid',
  PHONE: 'Format nomor telepon tidak valid',
  NIP: 'Format NIP tidak valid (18 digit)',
  MIN_LENGTH: (min: number) => `Minimal ${min} karakter`,
  MAX_LENGTH: (max: number) => `Maksimal ${max} karakter`,
  MIN_VALUE: (min: number) => `Nilai minimal ${min}`,
  MAX_VALUE: (max: number) => `Nilai maksimal ${max}`,
  PATTERN: 'Format tidak sesuai dengan yang diharapkan',
  UNIQUE: 'Data sudah ada, gunakan data yang berbeda',
  DATE: 'Format tanggal tidak valid',
  FILE_SIZE: (maxSize: string) => `Ukuran file maksimal ${maxSize}`,
  FILE_TYPE: (allowedTypes: string[]) => `Tipe file yang diizinkan: ${allowedTypes.join(', ')}`
} as const;

// Toast message templates
export const TOAST_MESSAGES = {
  // Success templates
  SUCCESS: (action: string) => ({
    title: 'Berhasil',
    description: `${action} berhasil dilakukan.`
  }),
  
  // Error templates
  ERROR: (action: string) => ({
    title: 'Gagal',
    description: `Gagal ${action}. Silakan coba lagi.`
  }),
  
  // Info templates
  INFO: (message: string) => ({
    title: 'Informasi',
    description: message
  }),
  
  // Warning templates
  WARNING: (message: string) => ({
    title: 'Peringatan',
    description: message
  })
} as const;

// Message formatters
export const formatMessage = {
  success: (action: string) => TOAST_MESSAGES.SUCCESS(action),
  error: (action: string) => TOAST_MESSAGES.ERROR(action),
  info: (message: string) => TOAST_MESSAGES.INFO(message),
  warning: (message: string) => TOAST_MESSAGES.WARNING(message)
};

  // Common action messages
export const ACTION_MESSAGES = {
  SAVE: 'Menyimpan',
  UPDATE: 'Memperbarui',
  DELETE: 'Menghapus',
  UPLOAD: 'Mengupload',
  DOWNLOAD: 'Mengunduh',
  GENERATE: 'Membuat',
  APPROVE: 'Menyetujui',
  REJECT: 'Menolak',
  REFRESH_SESSION: 'Memperpanjang Session',
  SUBMIT: 'Mengirim',
  LOAD: 'Memuat',
  PROCESS: 'Memproses'
} as const;
