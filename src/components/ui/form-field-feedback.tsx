import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Loader2
} from 'lucide-react';

interface FormFieldFeedbackProps {
  error?: string;
  warning?: string;
  success?: string;
  isValidating?: boolean;
  isTouched?: boolean;
  isDirty?: boolean;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export const FormFieldFeedback: React.FC<FormFieldFeedbackProps> = ({
  error,
  warning,
  success,
  isValidating = false,
  isTouched = false,
  isDirty = false,
  className,
  showIcon = true,
  showText = true
}) => {
  const getFeedbackType = () => {
    if (isValidating) return 'validating';
    if (error && isTouched) return 'error';
    if (warning && isTouched) return 'warning';
    if (success && isTouched) return 'success';
    if (isDirty && isTouched && !error && !warning) return 'dirty';
    return 'default';
  };

  const getFeedbackIcon = () => {
    const type = getFeedbackType();
    
    switch (type) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dirty':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getFeedbackText = () => {
    const type = getFeedbackType();
    
    switch (type) {
      case 'validating':
        return 'Memvalidasi...';
      case 'error':
        return error;
      case 'warning':
        return warning;
      case 'success':
        return success;
      case 'dirty':
        return 'Field telah diubah';
      default:
        return null;
    }
  };

  const getFeedbackColor = () => {
    const type = getFeedbackType();
    
    switch (type) {
      case 'validating':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'dirty':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const feedbackType = getFeedbackType();
  const feedbackText = getFeedbackText();
  const feedbackIcon = getFeedbackIcon();
  const feedbackColor = getFeedbackColor();

  if (!isTouched && !isValidating) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && feedbackIcon}
      {showText && feedbackText && (
        <span className={cn("text-sm", feedbackColor)}>
          {feedbackText}
        </span>
      )}
    </div>
  );
};

// Variants untuk different use cases
export const FieldError: React.FC<{ error: string; isTouched: boolean; className?: string }> = ({ 
  error, 
  isTouched, 
  className 
}) => (
  <FormFieldFeedback 
    error={error} 
    isTouched={isTouched} 
    className={className}
  />
);

export const FieldWarning: React.FC<{ warning: string; isTouched: boolean; className?: string }> = ({ 
  warning, 
  isTouched, 
  className 
}) => (
  <FormFieldFeedback 
    warning={warning} 
    isTouched={isTouched} 
    className={className}
  />
);

export const FieldSuccess: React.FC<{ success: string; isTouched: boolean; className?: string }> = ({ 
  success, 
  isTouched, 
  className 
}) => (
  <FormFieldFeedback 
    success={success} 
    isTouched={isTouched} 
    className={className}
  />
);

export const FieldValidating: React.FC<{ className?: string }> = ({ className }) => (
  <FormFieldFeedback 
    isValidating={true} 
    className={className}
  />
);

export default FormFieldFeedback;
