import React, { createContext, useContext, ReactNode } from 'react';
import { useFormFeedback, FormFeedbackReturn } from '@/hooks/useFormFeedback';

interface FormFeedbackContextType<T = any> {
  formFeedback: FormFeedbackReturn<T>;
}

const FormFeedbackContext = createContext<FormFeedbackContextType | null>(null);

interface FormFeedbackProviderProps<T> {
  children: ReactNode;
  initialData: T;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showToastOnSave?: boolean;
  showToastOnError?: boolean;
  showToastOnValidation?: boolean;
  debounceValidation?: number;
}

export function FormFeedbackProvider<T>({
  children,
  initialData,
  autoSave = false,
  autoSaveInterval = 30000,
  showToastOnSave = true,
  showToastOnError = true,
  showToastOnValidation = false,
  debounceValidation = 300
}: FormFeedbackProviderProps<T>) {
  const formFeedback = useFormFeedback(initialData, {
    autoSave,
    autoSaveInterval,
    showToastOnSave,
    showToastOnError,
    showToastOnValidation,
    debounceValidation
  });

  return (
    <FormFeedbackContext.Provider value={{ formFeedback }}>
      {children}
    </FormFeedbackContext.Provider>
  );
}

export function useFormFeedbackContext<T = any>(): FormFeedbackReturn<T> {
  const context = useContext(FormFeedbackContext);
  
  if (!context) {
    throw new Error('useFormFeedbackContext must be used within a FormFeedbackProvider');
  }
  
  return context.formFeedback as FormFeedbackReturn<T>;
}

// HOC untuk wrap components dengan form feedback
export function withFormFeedback<T>(
  Component: React.ComponentType<any>,
  feedbackOptions: Omit<FormFeedbackProviderProps<T>, 'children'>
) {
  return function WrappedComponent(props: any) {
    return (
      <FormFeedbackProvider {...feedbackOptions}>
        <Component {...props} />
      </FormFeedbackProvider>
    );
  };
}

export default FormFeedbackProvider;
