import { useState, useCallback } from 'react';
import { ErrorType, handleError, errorHandlers, withErrorHandling } from '@/lib/errorHandler';

interface UseErrorHandlerReturn {
  handleError: typeof handleError;
  errorHandlers: typeof errorHandlers;
  withErrorHandling: typeof withErrorHandling;
  showErrorModal: boolean;
  errorModalData: {
    type: ErrorType;
    title: string;
    message: string;
    showRetry: boolean;
    details?: string;
  } | null;
  openErrorModal: (data: {
    type: ErrorType;
    title: string;
    message: string;
    showRetry: boolean;
    details?: string;
  }) => void;
  closeErrorModal: () => void;
  retryFunction: (() => void) | null;
  setRetryFunction: (fn: (() => void) | null) => void;
  retryLoading: boolean;
  setRetryLoading: (loading: boolean) => void;
  executeRetry: () => Promise<void>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState<UseErrorHandlerReturn['errorModalData']>(null);
  const [retryFunction, setRetryFunction] = useState<(() => void) | null>(null);
  const [retryLoading, setRetryLoading] = useState(false);

  const openErrorModal = useCallback((data: {
    type: ErrorType;
    title: string;
    message: string;
    showRetry: boolean;
    details?: string;
  }) => {
    setErrorModalData(data);
    setShowErrorModal(true);
  }, []);

  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setErrorModalData(null);
    setRetryFunction(null);
    setRetryLoading(false);
  }, []);

  const handleErrorWithModal = useCallback((error: any, options: {
    showToast?: boolean;
    showModal?: boolean;
    customTitle?: string;
    customMessage?: string;
    onRetry?: () => void;
    fallbackMessage?: string;
    details?: string;
  } = {}) => {
    const {
      showToast = true,
      showModal = false,
      customTitle,
      customMessage,
      onRetry,
      fallbackMessage,
      details
    } = options;

    // Handle error using the main error handler
    const result = handleError(error, {
      showToast,
      customTitle,
      customMessage,
      onRetry,
      fallbackMessage
    });

    // Show modal if requested
    if (showModal) {
      setRetryFunction(onRetry || null);
      openErrorModal({
        ...result,
        details
      });
    }

    return result;
  }, [openErrorModal]);

  const executeRetry = useCallback(async () => {
    if (!retryFunction) return;

    setRetryLoading(true);
    try {
      await retryFunction();
      closeErrorModal();
    } catch (error) {
      // If retry fails, show error again
      handleErrorWithModal(error, {
        showToast: true,
        showModal: true
      });
    } finally {
      setRetryLoading(false);
    }
  }, [retryFunction, closeErrorModal, handleErrorWithModal]);

  return {
    handleError: handleErrorWithModal,
    errorHandlers,
    withErrorHandling,
    showErrorModal,
    errorModalData,
    openErrorModal,
    closeErrorModal,
    retryFunction,
    setRetryFunction,
    retryLoading,
    setRetryLoading,
    executeRetry
  };
}
