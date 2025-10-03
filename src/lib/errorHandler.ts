import { toast } from "@/hooks/use-toast";

// Error types untuk kategorisasi error
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION', 
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Error categories dengan message yang user-friendly
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    title: 'Koneksi Bermasalah',
    description: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
    showRetry: true
  },
  [ErrorType.VALIDATION]: {
    title: 'Data Tidak Valid',
    description: 'Data yang Anda masukkan tidak sesuai. Periksa kembali dan coba lagi.',
    showRetry: false
  },
  [ErrorType.AUTHENTICATION]: {
    title: 'Sesi Berakhir',
    description: 'Sesi Anda telah berakhir. Silakan login kembali.',
    showRetry: false
  },
  [ErrorType.AUTHORIZATION]: {
    title: 'Akses Ditolak',
    description: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
    showRetry: false
  },
  [ErrorType.SERVER]: {
    title: 'Server Bermasalah',
    description: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    showRetry: true
  },
  [ErrorType.UNKNOWN]: {
    title: 'Terjadi Kesalahan',
    description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
    showRetry: true
  }
};

// Helper function untuk categorize error
export function categorizeError(error: any): ErrorType {
  // Network errors
  if (!navigator.onLine || error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
    return ErrorType.NETWORK;
  }

  // HTTP status codes
  if (error.status || error.response?.status) {
    const status = error.status || error.response.status;
    
    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.AUTHORIZATION;
    if (status >= 400 && status < 500) return ErrorType.VALIDATION;
    if (status >= 500) return ErrorType.SERVER;
  }

  // Message-based detection
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('unauthorized') || message.includes('token') || message.includes('login')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (message.includes('forbidden') || message.includes('permission') || message.includes('access')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  
  if (message.includes('server') || message.includes('internal')) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

// Extract user-friendly error message
export function extractErrorMessage(error: any): string {
  // Priority order: custom message > API message > default message
  if (error.userMessage) return error.userMessage;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  
  return ERROR_MESSAGES[categorizeError(error)].description;
}

// Main error handler function
export function handleError(
  error: any, 
  options: {
    showToast?: boolean;
    customTitle?: string;
    customMessage?: string;
    onRetry?: () => void;
    fallbackMessage?: string;
    details?: string;
    showRetry?: boolean;
  } = {}
) {
  const {
    showToast = true,
    customTitle,
    customMessage,
    onRetry,
    fallbackMessage,
    details,
    showRetry
  } = options;

  const errorType = categorizeError(error);
  const errorConfig = ERROR_MESSAGES[errorType];
  
  // Use custom message if provided, otherwise extract from error
  const message = customMessage || extractErrorMessage(error) || fallbackMessage || errorConfig.description;
  const title = customTitle || errorConfig.title;

  // Log error for debugging
  console.error('Error handled:', {
    type: errorType,
    original: error,
    message,
    title
  });

  // Show toast notification
  if (showToast) {
    toast({
      title,
      description: message,
      variant: 'destructive'
    });
  }

  // Handle authentication errors specially
  if (errorType === ErrorType.AUTHENTICATION) {
    // Trigger session expired modal if available
    if (window.showSessionExpiredModal) {
      window.showSessionExpiredModal();
    }
  }

  return {
    type: errorType,
    title,
    message,
    showRetry: showRetry !== undefined ? showRetry : errorConfig.showRetry,
    onRetry
  };
}

// Wrapper untuk async functions dengan error handling
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  options: Parameters<typeof handleError>[1] = {}
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, options);
    return null;
  }
}

// Specific error handlers untuk common scenarios
export const errorHandlers = {
  // File upload errors
  fileUpload: (error: any) => handleError(error, {
    customTitle: 'Gagal Upload File',
    customMessage: 'File tidak dapat diupload. Periksa ukuran dan format file.',
    showRetry: true
  }),

  // Form submission errors
  formSubmit: (error: any) => handleError(error, {
    customTitle: 'Gagal Menyimpan',
    customMessage: 'Data tidak dapat disimpan. Periksa kembali input Anda.',
    showRetry: true
  }),

  // Data fetch errors
  dataFetch: (error: any) => handleError(error, {
    customTitle: 'Gagal Memuat Data',
    customMessage: 'Data tidak dapat dimuat. Silakan refresh halaman.',
    showRetry: true
  }),

  // Delete operation errors
  delete: (error: any) => handleError(error, {
    customTitle: 'Gagal Menghapus',
    customMessage: 'Data tidak dapat dihapus. Coba lagi nanti.',
    showRetry: true
  }),

  // Export errors
  export: (error: any) => handleError(error, {
    customTitle: 'Gagal Export',
    customMessage: 'Data tidak dapat diexport. Coba lagi nanti.',
    showRetry: true
  })
};

// Extend Window interface untuk TypeScript
declare global {
  interface Window {
    showSessionExpiredModal?: () => void;
  }
}
