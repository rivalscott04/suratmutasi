import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Wifi, Shield, AlertTriangle, Server, UserX } from 'lucide-react';
import { ErrorType } from '@/lib/errorHandler';

interface AdvancedErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: ErrorType;
  title: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
  retryLoading?: boolean;
  details?: string;
}

const ERROR_ICONS = {
  [ErrorType.NETWORK]: Wifi,
  [ErrorType.VALIDATION]: AlertTriangle,
  [ErrorType.AUTHENTICATION]: UserX,
  [ErrorType.AUTHORIZATION]: Shield,
  [ErrorType.SERVER]: Server,
  [ErrorType.UNKNOWN]: AlertCircle
};

const ERROR_COLORS = {
  [ErrorType.NETWORK]: 'text-orange-600',
  [ErrorType.VALIDATION]: 'text-yellow-600',
  [ErrorType.AUTHENTICATION]: 'text-red-600',
  [ErrorType.AUTHORIZATION]: 'text-red-600',
  [ErrorType.SERVER]: 'text-red-600',
  [ErrorType.UNKNOWN]: 'text-red-600'
};

const ERROR_BG_COLORS = {
  [ErrorType.NETWORK]: 'bg-orange-100',
  [ErrorType.VALIDATION]: 'bg-yellow-100',
  [ErrorType.AUTHENTICATION]: 'bg-red-100',
  [ErrorType.AUTHORIZATION]: 'bg-red-100',
  [ErrorType.SERVER]: 'bg-red-100',
  [ErrorType.UNKNOWN]: 'bg-red-100'
};

export const AdvancedErrorModal: React.FC<AdvancedErrorModalProps> = ({
  isOpen,
  onClose,
  errorType,
  title,
  message,
  showRetry = false,
  onRetry,
  retryLoading = false,
  details
}) => {
  const IconComponent = ERROR_ICONS[errorType];
  const iconColor = ERROR_COLORS[errorType];
  const bgColor = ERROR_BG_COLORS[errorType];

  const getRetryText = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return 'Coba Lagi';
      case ErrorType.SERVER:
        return 'Coba Lagi';
      case ErrorType.VALIDATION:
        return 'Perbaiki Data';
      default:
        return 'Coba Lagi';
    }
  };

  const getSuggestions = () => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return [
          'Periksa koneksi internet Anda',
          'Coba refresh halaman',
          'Pastikan server sedang berjalan'
        ];
      case ErrorType.VALIDATION:
        return [
          'Periksa semua field yang wajib diisi',
          'Pastikan format data sudah benar',
          'Periksa ukuran file jika upload'
        ];
      case ErrorType.AUTHENTICATION:
        return [
          'Login ulang ke aplikasi',
          'Periksa username dan password',
          'Hubungi administrator jika masalah berlanjut'
        ];
      case ErrorType.AUTHORIZATION:
        return [
          'Pastikan Anda memiliki akses',
          'Hubungi administrator untuk izin',
          'Login dengan akun yang sesuai'
        ];
      case ErrorType.SERVER:
        return [
          'Coba lagi dalam beberapa saat',
          'Refresh halaman',
          'Hubungi administrator jika masalah berlanjut'
        ];
      default:
        return [
          'Coba refresh halaman',
          'Hubungi administrator',
          'Periksa koneksi internet'
        ];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${bgColor}`}>
              <IconComponent className={`h-6 w-6 ${iconColor}`} />
            </div>
            <span className={iconColor}>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Main error message */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{message}</p>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Saran:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical details (optional) */}
          {details && (
            <details className="bg-gray-50 rounded-lg p-3">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                Detail Teknis
              </summary>
              <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                {details}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          {showRetry && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              disabled={retryLoading}
              className="border-gray-300"
            >
              {retryLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {getRetryText()}
                </>
              )}
            </Button>
          )}
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedErrorModal;
