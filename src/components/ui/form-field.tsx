import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hasError?: boolean;
  isTouched?: boolean;
  isDirty?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  showValidationIcon?: boolean;
  autoComplete?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hasError,
  isTouched,
  isDirty,
  required = false,
  disabled = false,
  className,
  description,
  options = [],
  showValidationIcon = true,
  autoComplete
}) => {
  const fieldId = `field-${name}`;
  const hasValidation = isTouched && showValidationIcon;

  const getValidationIcon = () => {
    if (!hasValidation) return null;
    
    if (hasError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (isDirty && !hasError) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return null;
  };

  const getFieldClassName = () => {
    return cn(
      "transition-colors duration-200",
      hasError && isTouched && "border-red-500 focus:border-red-500 focus:ring-red-500",
      !hasError && isDirty && isTouched && "border-green-500 focus:border-green-500 focus:ring-green-500",
      className
    );
  };

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      placeholder,
      disabled,
      autoComplete,
      className: getFieldClassName(),
      onBlur,
      'aria-describedby': error ? `${fieldId}-error` : undefined,
      'aria-invalid': hasError && isTouched
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={getFieldClassName()}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            onChange={(e) => onChange(e.target.value)}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={type}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <Label 
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium",
          hasError && isTouched && "text-red-700",
          !hasError && isDirty && isTouched && "text-green-700"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Input with validation icon */}
      <div className="relative">
        {renderInput()}
        {hasValidation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Description */}
      {description && !error && (
        <p className="text-sm text-gray-600" id={`${fieldId}-description`}>
          {description}
        </p>
      )}

      {/* Error message */}
      {error && isTouched && (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p 
            id={`${fieldId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

// Wrapper component untuk integration dengan useFormValidation
interface ValidatedFormFieldProps extends Omit<FormFieldProps, 'value' | 'onChange' | 'onBlur' | 'error' | 'hasError' | 'isTouched' | 'isDirty'> {
  formValidation: any;
}

export const ValidatedFormField: React.FC<ValidatedFormFieldProps> = ({
  formValidation,
  ...props
}) => {
  const fieldProps = {
    value: formValidation.data[props.name] || '',
    onChange: (value: string) => formValidation.setFieldValue(props.name, value),
    onBlur: () => formValidation.setFieldTouched(props.name),
    error: formValidation.getFieldError(props.name),
    hasError: formValidation.hasFieldError(props.name),
    isTouched: formValidation.isFieldTouched(props.name),
    isDirty: formValidation.isFieldDirty(props.name)
  };

  return <FormField {...props} {...fieldProps} />;
};

export default FormField;
