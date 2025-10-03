import { useState, useCallback, useEffect } from 'react';
import { z, ZodSchema, ZodError } from 'zod';
import { useToast } from '@/hooks/use-toast';

interface ValidationState {
  errors: Record<string, string[]>;
  isValid: boolean;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
}

interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
  initialData: T;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showToastOnError?: boolean;
  customErrorMessages?: Record<string, string>;
}

interface UseFormValidationReturn<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  errors: Record<string, string[]>;
  isValid: boolean;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  setFieldValue: (field: string, value: any) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  validateField: (field: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  resetField: (field: string) => void;
  getFieldError: (field: string) => string | undefined;
  hasFieldError: (field: string) => boolean;
  isFieldTouched: (field: string) => boolean;
  isFieldDirty: (field: string) => boolean;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialData,
  validateOnChange = true,
  validateOnBlur = true,
  showToastOnError = false,
  customErrorMessages = {}
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [data, setData] = useState<T>(initialData);
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    isValid: false,
    touched: {},
    dirty: {}
  });

  const { toast } = useToast();

  // Validate single field
  const validateField = useCallback(async (field: string): Promise<boolean> => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = schema.shape[field as keyof typeof schema.shape];
      if (!fieldSchema) return true;

      // Validate the field
      await fieldSchema.parseAsync(data[field as keyof T]);
      
      // Clear error for this field
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: []
        }
      }));
      
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map(err => {
          // Use custom error message if available
          const customMessage = customErrorMessages[field];
          if (customMessage) return customMessage;
          
          // Use Zod error message
          return err.message;
        });

        setValidationState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]: fieldErrors
          }
        }));

        // Show toast if enabled
        if (showToastOnError && fieldErrors.length > 0) {
          toast({
            title: "Validation Error",
            description: fieldErrors[0],
            variant: "destructive"
          });
        }

        return false;
      }
      return false;
    }
  }, [data, schema, customErrorMessages, showToastOnError, toast]);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      await schema.parseAsync(data);
      
      // Clear all errors
      setValidationState(prev => ({
        ...prev,
        errors: {},
        isValid: true
      }));
      
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach(err => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          
          const customMessage = customErrorMessages[field];
          const message = customMessage || err.message;
          errors[field].push(message);
        });

        setValidationState(prev => ({
          ...prev,
          errors,
          isValid: false
        }));

        // Show toast if enabled
        if (showToastOnError) {
          const firstError = Object.values(errors)[0]?.[0];
          if (firstError) {
            toast({
              title: "Form Validation Error",
              description: firstError,
              variant: "destructive"
            });
          }
        }

        return false;
      }
      return false;
    }
  }, [data, schema, customErrorMessages, showToastOnError, toast]);

  // Update field value and validate if needed
  const setFieldValue = useCallback((field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));

    // Mark field as dirty
    setValidationState(prev => ({
      ...prev,
      dirty: {
        ...prev.dirty,
        [field]: true
      }
    }));

    // Validate on change if enabled and field is touched
    if (validateOnChange && validationState.touched[field]) {
      setTimeout(() => validateField(field), 100);
    }
  }, [validateOnChange, validationState.touched, validateField]);

  // Set field touched state
  const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
    setValidationState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: touched
      }
    }));

    // Validate on blur if enabled
    if (validateOnBlur && touched) {
      setTimeout(() => validateField(field), 100);
    }
  }, [validateOnBlur, validateField]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setData(initialData);
    setValidationState({
      errors: {},
      isValid: false,
      touched: {},
      dirty: {}
    });
  }, [initialData]);

  // Reset specific field
  const resetField = useCallback((field: string) => {
    setData(prev => ({
      ...prev,
      [field]: initialData[field as keyof T]
    }));

    setValidationState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: []
      },
      touched: {
        ...prev.touched,
        [field]: false
      },
      dirty: {
        ...prev.dirty,
        [field]: false
      }
    }));
  }, [initialData]);

  // Helper functions
  const getFieldError = useCallback((field: string): string | undefined => {
    return validationState.errors[field]?.[0];
  }, [validationState.errors]);

  const hasFieldError = useCallback((field: string): boolean => {
    return validationState.errors[field]?.length > 0;
  }, [validationState.errors]);

  const isFieldTouched = useCallback((field: string): boolean => {
    return validationState.touched[field] || false;
  }, [validationState.touched]);

  const isFieldDirty = useCallback((field: string): boolean => {
    return validationState.dirty[field] || false;
  }, [validationState.dirty]);

  // Auto-validate form when data changes (for overall validation state)
  useEffect(() => {
    const timer = setTimeout(() => {
      validateForm();
    }, 300);

    return () => clearTimeout(timer);
  }, [data, validateForm]);

  return {
    data,
    setData,
    errors: validationState.errors,
    isValid: validationState.isValid,
    touched: validationState.touched,
    dirty: validationState.dirty,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    resetField,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    isFieldDirty
  };
}

// Utility function untuk create common validation schemas
export const validationSchemas = {
  // Common field validations
  required: (message: string = "Field ini wajib diisi") => z.string().min(1, message),
  
  email: (message: string = "Format email tidak valid") => z.string().email(message),
  
  minLength: (min: number, message?: string) => 
    z.string().min(min, message || `Minimal ${min} karakter`),
  
  maxLength: (max: number, message?: string) => 
    z.string().max(max, message || `Maksimal ${max} karakter`),
  
  phoneNumber: (message: string = "Format nomor telepon tidak valid") => 
    z.string().regex(/^(\+62|62|0)[0-9]{9,13}$/, message),
  
  nip: (message: string = "Format NIP tidak valid") => 
    z.string().regex(/^[0-9]{18}$/, message),
  
  // Indonesian specific validations
  indonesianName: (message: string = "Nama harus menggunakan huruf") => 
    z.string().regex(/^[a-zA-Z\s\.\-\']+$/, message),
  
  // File validations
  fileSize: (maxSizeInMB: number, message?: string) => 
    z.instanceof(File).refine(
      (file) => file.size <= maxSizeInMB * 1024 * 1024,
      message || `Ukuran file maksimal ${maxSizeInMB}MB`
    ),
  
  fileType: (allowedTypes: string[], message?: string) => 
    z.instanceof(File).refine(
      (file) => allowedTypes.includes(file.type),
      message || `Tipe file harus: ${allowedTypes.join(', ')}`
    )
};

// Hook untuk common form patterns
export function useCommonFormValidation() {
  const createValidationSchema = (fields: Record<string, any>) => {
    return z.object(fields);
  };

  const getFieldProps = (
    fieldName: string,
    formValidation: UseFormValidationReturn<any>
  ) => {
    return {
      value: formValidation.data[fieldName] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
        formValidation.setFieldValue(fieldName, e.target.value),
      onBlur: () => formValidation.setFieldTouched(fieldName),
      error: formValidation.getFieldError(fieldName),
      hasError: formValidation.hasFieldError(fieldName),
      isTouched: formValidation.isFieldTouched(fieldName),
      isDirty: formValidation.isFieldDirty(fieldName)
    };
  };

  return {
    createValidationSchema,
    getFieldProps
  };
}
