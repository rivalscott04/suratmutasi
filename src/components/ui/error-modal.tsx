import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Terjadi Kesalahan",
  message,
  showRetry = false,
  onRetry
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          {showRetry && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="border-gray-300"
            >
              Coba Lagi
            </Button>
          )}
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal;
