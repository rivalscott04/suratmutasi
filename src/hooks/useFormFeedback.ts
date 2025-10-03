import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { showSuccess, showError, showInfo, showWarning } from '@/lib/messageUtils';

export interface FormFeedbackState {
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  success: Record<string, string[]>;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
}

export interface FormFeedbackOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
  showToastOnSave?: boolean;
  showToastOnError?: boolean;
  showToastOnValidation?: boolean;
  debounceValidation?: number; // in milliseconds
}

export interface FormFeedbackReturn<T> {
  // State
  feedback: FormFeedbackState;
  
  // Actions
  startSubmission: () => void;
  endSubmission: (success: boolean, message?: string) => void;
  setValidating: (validating: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setValid: (valid: boolean) => void;
  setErrors: (errors: Record<string, string[]>) => void;
  setWarnings: (warnings: Record<string, string[]>) => void;
  setSuccess: (success: Record<string, string[]>) => void;
  clearFeedback: () => void;
  markSaved: () => void;
  
  // Field-specific actions
  setFieldError: (field: string, error: string | string[]) => void;
  setFieldWarning: (field: string, warning: string | string[]) => void;
  setFieldSuccess: (field: string, success: string | string[]) => void;
  clearFieldFeedback: (field: string) => void;
  
  // Validation helpers
  validateField: (field: string, value: any, schema?: any) => Promise<boolean>;
  
  // Auto-save helpers
  triggerAutoSave: () => Promise<void>;
  
  // Utility functions
  hasFieldError: (field: string) => boolean;
  hasFieldWarning: (field: string) => boolean;
  hasFieldSuccess: (field: string) => boolean;
  getFieldFeedback: (field: string) => {
    error?: string;
    warning?: string;
    success?: string;
    hasError: boolean;
    hasWarning: boolean;
    hasSuccess: boolean;
  };
}

export function useFormFeedback<T>(
  initialData: T,
  options: FormFeedbackOptions = {}
): FormFeedbackReturn<T> {
  const {
    autoSave = false,
    autoSaveInterval = 30000, // 30 seconds
    showToastOnSave = true,
    showToastOnError = true,
    showToastOnValidation = false,
    debounceValidation = 300
  } = options;

  const [feedback, setFeedback] = useState<FormFeedbackState>({
    isSubmitting: false,
    isValidating: false,
    isDirty: false,
    isValid: false,
    errors: {},
    warnings: {},
    success: {},
    hasUnsavedChanges: false
  });

  const { toast } = useToast();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef<T>(initialData);

  // Update data reference
  useEffect(() => {
    dataRef.current = initialData;
  }, [initialData]);

  // Auto-save setup
  useEffect(() => {
    if (autoSave && feedback.isDirty && !feedback.isSubmitting) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        triggerAutoSave();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave, feedback.isDirty, feedback.isSubmitting, autoSaveInterval]);

  // Start submission
  const startSubmission = useCallback(() => {
    setFeedback(prev => ({
      ...prev,
      isSubmitting: true,
      isValidating: true
    }));
  }, []);

  // End submission
  const endSubmission = useCallback((success: boolean, message?: string) => {
    setFeedback(prev => ({
      ...prev,
      isSubmitting: false,
      isValidating: false,
      hasUnsavedChanges: !success
    }));

    if (success) {
      markSaved();
      if (showToastOnSave && message) {
        showSuccess('SAVE_SUCCESS', message);
      }
    } else {
      if (showToastOnError && message) {
        showError('SAVE_FAILED', message);
      }
    }
  }, [showToastOnSave, showToastOnError]);

  // Set validating state
  const setValidating = useCallback((validating: boolean) => {
    setFeedback(prev => ({ ...prev, isValidating: validating }));
  }, []);

  // Set dirty state
  const setDirty = useCallback((dirty: boolean) => {
    setFeedback(prev => ({
      ...prev,
      isDirty: dirty,
      hasUnsavedChanges: dirty
    }));
  }, []);

  // Set valid state
  const setValid = useCallback((valid: boolean) => {
    setFeedback(prev => ({ ...prev, isValid: valid }));
  }, []);

  // Set errors
  const setErrors = useCallback((errors: Record<string, string[]>) => {
    setFeedback(prev => ({ ...prev, errors }));
    
    if (showToastOnValidation && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) {
        showError('VALIDATION_ERROR', firstError);
      }
    }
  }, [showToastOnValidation]);

  // Set warnings
  const setWarnings = useCallback((warnings: Record<string, string[]>) => {
    setFeedback(prev => ({ ...prev, warnings }));
  }, []);

  // Set success messages
  const setSuccess = useCallback((success: Record<string, string[]>) => {
    setFeedback(prev => ({ ...prev, success }));
  }, []);

  // Clear all feedback
  const clearFeedback = useCallback(() => {
    setFeedback(prev => ({
      ...prev,
      errors: {},
      warnings: {},
      success: {}
    }));
  }, []);

  // Mark as saved
  const markSaved = useCallback(() => {
    setFeedback(prev => ({
      ...prev,
      isDirty: false,
      hasUnsavedChanges: false,
      lastSaved: new Date(),
      success: {
        ...prev.success,
        _general: ['Data berhasil disimpan']
      }
    }));
  }, []);

  // Field-specific error
  const setFieldError = useCallback((field: string, error: string | string[]) => {
    const errorArray = Array.isArray(error) ? error : [error];
    setFeedback(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: errorArray
      }
    }));
  }, []);

  // Field-specific warning
  const setFieldWarning = useCallback((field: string, warning: string | string[]) => {
    const warningArray = Array.isArray(warning) ? warning : [warning];
    setFeedback(prev => ({
      ...prev,
      warnings: {
        ...prev.warnings,
        [field]: warningArray
      }
    }));
  }, []);

  // Field-specific success
  const setFieldSuccess = useCallback((field: string, success: string | string[]) => {
    const successArray = Array.isArray(success) ? success : [success];
    setFeedback(prev => ({
      ...prev,
      success: {
        ...prev.success,
        [field]: successArray
      }
    }));
  }, []);

  // Clear field feedback
  const clearFieldFeedback = useCallback((field: string) => {
    setFeedback(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: []
      },
      warnings: {
        ...prev.warnings,
        [field]: []
      },
      success: {
        ...prev.success,
        [field]: []
      }
    }));
  }, []);

  // Validate field with debouncing
  const validateField = useCallback(async (field: string, value: any, schema?: any): Promise<boolean> => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    return new Promise((resolve) => {
      validationTimeoutRef.current = setTimeout(async () => {
        try {
          if (schema) {
            await schema.parseAsync(value);
            clearFieldFeedback(field);
            setFieldSuccess(field, 'Data valid');
            resolve(true);
          } else {
            resolve(true);
          }
        } catch (error: any) {
          if (error.errors && error.errors.length > 0) {
            const errorMessage = error.errors[0].message;
            setFieldError(field, errorMessage);
            resolve(false);
          } else {
            setFieldError(field, 'Data tidak valid');
            resolve(false);
          }
        }
      }, debounceValidation);
    });
  }, [debounceValidation, clearFieldFeedback, setFieldError, setFieldSuccess]);

  // Trigger auto-save
  const triggerAutoSave = useCallback(async () => {
    if (feedback.isSubmitting || !feedback.isDirty) return;

    try {
      setValidating(true);
      // Here you would implement your auto-save logic
      // For now, just mark as saved
      markSaved();
      
      if (showToastOnSave) {
        showInfo('Data otomatis tersimpan');
      }
    } catch (error) {
      showError('SAVE_FAILED', 'Gagal auto-save');
    } finally {
      setValidating(false);
    }
  }, [feedback.isSubmitting, feedback.isDirty, markSaved, showToastOnSave, setValidating]);

  // Helper functions
  const hasFieldError = useCallback((field: string) => {
    return feedback.errors[field] && feedback.errors[field].length > 0;
  }, [feedback.errors]);

  const hasFieldWarning = useCallback((field: string) => {
    return feedback.warnings[field] && feedback.warnings[field].length > 0;
  }, [feedback.success]);

  const hasFieldSuccess = useCallback((field: string) => {
    return feedback.success[field] && feedback.success[field].length > 0;
  }, [feedback.success]);

  const getFieldFeedback = useCallback((field: string) => {
    return {
      error: feedback.errors[field]?.[0],
      warning: feedback.warnings[field]?.[0],
      success: feedback.success[field]?.[0],
      hasError: hasFieldError(field),
      hasWarning: hasFieldWarning(field),
      hasSuccess: hasFieldSuccess(field)
    };
  }, [feedback, hasFieldError, hasFieldWarning, hasFieldSuccess]);

  return {
    feedback,
    startSubmission,
    endSubmission,
    setValidating,
    setDirty,
    setValid,
    setErrors,
    setWarnings,
    setSuccess,
    clearFeedback,
    markSaved,
    setFieldError,
    setFieldWarning,
    setFieldSuccess,
    clearFieldFeedback,
    validateField,
    triggerAutoSave,
    hasFieldError,
    hasFieldWarning,
    hasFieldSuccess,
    getFieldFeedback
  };
}
