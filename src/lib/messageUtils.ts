import { toast } from '@/hooks/use-toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_MESSAGES, formatMessage, ACTION_MESSAGES } from '@/constants/messages';

// Message types
export type MessageType = 'success' | 'error' | 'info' | 'warning';
export type ErrorType = keyof typeof ERROR_MESSAGES;
export type SuccessType = keyof typeof SUCCESS_MESSAGES;

// Toast options
interface ToastOptions {
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Standardized message handler
export class MessageHandler {
  // Show success message
  static success(type: SuccessType, customMessage?: string, options?: ToastOptions) {
    const message = SUCCESS_MESSAGES[type];
    const title = message.title;
    const description = customMessage || message.description;
    
    toast({
      title,
      description,
      variant: 'default',
      duration: options?.duration || 3000,
      action: options?.action
    });
  }
  
  // Show error message
  static error(type: ErrorType, customMessage?: string, options?: ToastOptions) {
    const message = ERROR_MESSAGES[type];
    const title = message.title;
    const description = customMessage || message.description;
    
    toast({
      title,
      description,
      variant: 'destructive',
      duration: options?.duration || 5000,
      action: options?.action
    });
  }
  
  // Show info message
  static info(message: string, options?: ToastOptions) {
    toast({
      title: 'Informasi',
      description: message,
      variant: 'default',
      duration: options?.duration || 3000,
      action: options?.action
    });
  }
  
  // Show warning message
  static warning(message: string, options?: ToastOptions) {
    toast({
      title: 'Peringatan',
      description: message,
      variant: 'default',
      duration: options?.duration || 4000,
      action: options?.action
    });
  }
  
  // Show custom message
  static custom(type: MessageType, title: string, description: string, options?: ToastOptions) {
    toast({
      title,
      description,
      variant: type === 'error' ? 'destructive' : 'default',
      duration: options?.duration || (type === 'error' ? 5000 : 3000),
      action: options?.action
    });
  }
  
  // Show action result message
  static actionResult(action: keyof typeof ACTION_MESSAGES, success: boolean, customMessage?: string) {
    if (success) {
      this.success('OPERATION_SUCCESS', customMessage || `${ACTION_MESSAGES[action]} berhasil dilakukan.`);
    } else {
      this.error('OPERATION_FAILED', customMessage || `Gagal ${ACTION_MESSAGES[action].toLowerCase()}.`);
    }
  }
  
  // Show loading message
  static loading(action: keyof typeof ACTION_MESSAGES) {
    toast({
      title: ACTION_MESSAGES[action],
      description: 'Mohon tunggu...',
      variant: 'default',
      duration: 2000
    });
  }
}

// Convenience functions
export const showSuccess = (type: SuccessType, customMessage?: string, options?: ToastOptions) => 
  MessageHandler.success(type, customMessage, options);

export const showError = (type: ErrorType, customMessage?: string, options?: ToastOptions) => 
  MessageHandler.error(type, customMessage, options);

export const showInfo = (message: string, options?: ToastOptions) => 
  MessageHandler.info(message, options);

export const showWarning = (message: string, options?: ToastOptions) => 
  MessageHandler.warning(message, options);

export const showActionResult = (action: keyof typeof ACTION_MESSAGES, success: boolean, customMessage?: string) => 
  MessageHandler.actionResult(action, success, customMessage);

// Error message extractor
export const extractErrorMessage = (error: any): string => {
  // Priority order: custom message > API message > default message
  if (error.userMessage) return error.userMessage;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  
  return 'Terjadi kesalahan yang tidak terduga';
};

// Error type detector
export const detectErrorType = (error: any): ErrorType => {
  const message = extractErrorMessage(error).toLowerCase();
  
  // Network errors
  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return 'NETWORK_ERROR';
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('session') || message.includes('login')) {
    return 'SESSION_EXPIRED';
  }
  
  // Authorization errors
  if (message.includes('forbidden') || message.includes('access') || message.includes('permission')) {
    return 'ACCESS_DENIED';
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'VALIDATION_ERROR';
  }
  
  // File errors
  if (message.includes('file') || message.includes('upload') || message.includes('download')) {
    return 'UPLOAD_FAILED';
  }
  
  // Server errors
  if (message.includes('server') || message.includes('internal') || message.includes('500')) {
    return 'SERVER_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

// Smart error handler
export const handleSmartError = (error: any, customMessage?: string, options?: ToastOptions) => {
  const errorType = detectErrorType(error);
  const message = customMessage || extractErrorMessage(error);
  
  MessageHandler.error(errorType, message, options);
  
  return {
    type: errorType,
    message,
    originalError: error
  };
};

// Success message shortcuts
export const showSaveSuccess = (customMessage?: string) => 
  showSuccess('SAVE_SUCCESS', customMessage);

export const showUpdateSuccess = (customMessage?: string) => 
  showSuccess('UPDATE_SUCCESS', customMessage);

export const showDeleteSuccess = (customMessage?: string) => 
  showSuccess('DELETE_SUCCESS', customMessage);

export const showUploadSuccess = (customMessage?: string) => 
  showSuccess('UPLOAD_SUCCESS', customMessage);

export const showDownloadSuccess = (customMessage?: string) => 
  showSuccess('DOWNLOAD_SUCCESS', customMessage);

export const showGenerateSuccess = (customMessage?: string) => 
  showSuccess('GENERATE_PDF_SUCCESS', customMessage);

// Error message shortcuts
export const showSaveError = (customMessage?: string) => 
  showError('SAVE_FAILED', customMessage);

export const showUpdateError = (customMessage?: string) => 
  showError('UPDATE_FAILED', customMessage);

export const showDeleteError = (customMessage?: string) => 
  showError('DELETE_FAILED', customMessage);

export const showUploadError = (customMessage?: string) => 
  showError('UPLOAD_FAILED', customMessage);

export const showDownloadError = (customMessage?: string) => 
  showError('DOWNLOAD_FAILED', customMessage);

export const showGenerateError = (customMessage?: string) => 
  showError('GENERATE_PDF_FAILED', customMessage);

export const showNetworkError = (customMessage?: string) => 
  showError('NETWORK_ERROR', customMessage);

export const showSessionError = (customMessage?: string) => 
  showError('SESSION_EXPIRED', customMessage);

export const showSessionRefreshFailed = (customMessage?: string) => 
  showError('SESSION_REFRESH_FAILED', customMessage);

export const showSessionExpiringWarning = (customMessage?: string) => 
  showWarning(customMessage || ERROR_MESSAGES.SESSION_EXPIRING_WARNING.description);

export const showSessionRefreshed = (customMessage?: string) => 
  showSuccess('SESSION_REFRESHED', customMessage);

export const showAccessError = (customMessage?: string) => 
  showError('ACCESS_DENIED', customMessage);

export const showValidationError = (customMessage?: string) => 
  showError('VALIDATION_ERROR', customMessage);

export const showServerError = (customMessage?: string) => 
  showError('SERVER_ERROR', customMessage);
