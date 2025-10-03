import { useState, useCallback, useRef } from 'react';

interface UseDoubleClickProtectionOptions {
  delay?: number; // Delay in milliseconds before allowing next click
  showWarning?: boolean; // Whether to show warning on rapid clicks
  warningMessage?: string; // Custom warning message
}

interface UseDoubleClickProtectionReturn {
  isProcessing: boolean;
  execute: (fn: () => void | Promise<void>) => Promise<void>;
  executeSync: (fn: () => void) => void;
  reset: () => void;
}

export function useDoubleClickProtection(
  options: UseDoubleClickProtectionOptions = {}
): UseDoubleClickProtectionReturn {
  const {
    delay = 1000, // Default 1 second delay
    showWarning = true,
    warningMessage = "Tunggu sebentar, proses sedang berjalan..."
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const lastClickTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setIsProcessing(false);
    lastClickTime.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const execute = useCallback(async (fn: () => void | Promise<void>) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    // If still processing or too soon since last click
    if (isProcessing || (timeSinceLastClick < delay && timeSinceLastClick > 0)) {
      if (showWarning) {
        console.warn(warningMessage);
        // You can integrate with toast notification here if needed
      }
      return;
    }

    // Set processing state
    setIsProcessing(true);
    lastClickTime.current = now;

    try {
      // Execute the function
      await fn();
    } catch (error) {
      // Reset immediately on error
      reset();
      throw error;
    } finally {
      // Set timeout to reset processing state
      timeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, delay);
    }
  }, [isProcessing, delay, showWarning, warningMessage, reset]);

  const executeSync = useCallback((fn: () => void) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    // If still processing or too soon since last click
    if (isProcessing || (timeSinceLastClick < delay && timeSinceLastClick > 0)) {
      if (showWarning) {
        console.warn(warningMessage);
      }
      return;
    }

    // Set processing state
    setIsProcessing(true);
    lastClickTime.current = now;

    try {
      // Execute the function
      fn();
    } catch (error) {
      // Reset immediately on error
      reset();
      throw error;
    } finally {
      // Set timeout to reset processing state
      timeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, delay);
    }
  }, [isProcessing, delay, showWarning, warningMessage, reset]);

  return {
    isProcessing,
    execute,
    executeSync,
    reset
  };
}

// Hook untuk form submissions dengan double-click protection
export function useFormSubmissionProtection(
  options: UseDoubleClickProtectionOptions = {}
) {
  const protection = useDoubleClickProtection({
    delay: 2000, // Longer delay for form submissions
    showWarning: true,
    warningMessage: "Form sedang diproses, tunggu sebentar...",
    ...options
  });

  const submitForm = useCallback(async (
    submitFn: () => void | Promise<void>,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    try {
      await protection.execute(submitFn);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }
  }, [protection]);

  return {
    isSubmitting: protection.isProcessing,
    submitForm,
    resetSubmission: protection.reset
  };
}

// Hook untuk delete actions dengan double-click protection
export function useDeleteProtection(
  options: UseDoubleClickProtectionOptions = {}
) {
  const protection = useDoubleClickProtection({
    delay: 1500, // Medium delay for delete actions
    showWarning: true,
    warningMessage: "Penghapusan sedang diproses, tunggu sebentar...",
    ...options
  });

  const deleteItem = useCallback(async (
    deleteFn: () => void | Promise<void>,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    try {
      await protection.execute(deleteFn);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }
  }, [protection]);

  return {
    isDeleting: protection.isProcessing,
    deleteItem,
    resetDelete: protection.reset
  };
}

// Hook untuk save actions dengan double-click protection
export function useSaveProtection(
  options: UseDoubleClickProtectionOptions = {}
) {
  const protection = useDoubleClickProtection({
    delay: 1000, // Standard delay for save actions
    showWarning: true,
    warningMessage: "Penyimpanan sedang diproses, tunggu sebentar...",
    ...options
  });

  const saveData = useCallback(async (
    saveFn: () => void | Promise<void>,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    try {
      await protection.execute(saveFn);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }
  }, [protection]);

  return {
    isSaving: protection.isProcessing,
    saveData,
    resetSave: protection.reset
  };
}

// Utility function untuk debounce clicks
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Utility function untuk throttle clicks
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
