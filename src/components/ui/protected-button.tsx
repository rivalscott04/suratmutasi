import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProtectedButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled'> {
  onClick?: () => void | Promise<void>;
  isProcessing?: boolean;
  processingText?: string;
  processingIcon?: React.ReactNode;
  protectionDelay?: number;
  showProcessingState?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  onClick,
  isProcessing = false,
  processingText = "Memproses...",
  processingIcon,
  protectionDelay = 1000,
  showProcessingState = true,
  onSuccess,
  onError,
  children,
  className,
  disabled,
  ...props
}) => {
  const [internalProcessing, setInternalProcessing] = React.useState(false);
  const [lastClickTime, setLastClickTime] = React.useState(0);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const isActuallyProcessing = isProcessing || internalProcessing;

  const handleClick = React.useCallback(async () => {
    if (!onClick) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    // Check if we're already processing or clicked too recently
    if (isActuallyProcessing || (timeSinceLastClick < protectionDelay && timeSinceLastClick > 0)) {
      return; // Ignore the click
    }

    // Set processing state
    setInternalProcessing(true);
    setLastClickTime(now);

    try {
      await onClick();
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      // Clear timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set timeout to reset processing state
      timeoutRef.current = setTimeout(() => {
        setInternalProcessing(false);
      }, protectionDelay);
    }
  }, [
    onClick,
    isActuallyProcessing,
    lastClickTime,
    protectionDelay,
    onSuccess,
    onError
  ]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const defaultProcessingIcon = <Loader2 className="h-4 w-4 animate-spin text-green-600" />;

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || isActuallyProcessing}
      className={cn(
        "transition-all duration-200",
        isActuallyProcessing && "cursor-not-allowed",
        className
      )}
    >
      {isActuallyProcessing && showProcessingState ? (
        <>
          {processingIcon || defaultProcessingIcon}
          {processingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

// Specialized button components for common use cases
export const SubmitButton: React.FC<ProtectedButtonProps> = (props) => (
  <ProtectedButton
    {...props}
    processingText="Menyimpan..."
    protectionDelay={2000}
  />
);

export const DeleteButton: React.FC<ProtectedButtonProps> = (props) => (
  <ProtectedButton
    {...props}
    processingText="Menghapus..."
    protectionDelay={1500}
    variant="destructive"
  />
);

export const SaveButton: React.FC<ProtectedButtonProps> = (props) => (
  <ProtectedButton
    {...props}
    processingText="Menyimpan..."
    protectionDelay={1000}
  />
);

export const ConfirmButton: React.FC<ProtectedButtonProps> = (props) => (
  <ProtectedButton
    {...props}
    processingText="Mengkonfirmasi..."
    protectionDelay={1000}
  />
);

export default ProtectedButton;
