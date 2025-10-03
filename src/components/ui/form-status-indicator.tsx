import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Save, 
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormFeedbackState } from '@/hooks/useFormFeedback';

interface FormStatusIndicatorProps {
  feedback: FormFeedbackState;
  showLastSaved?: boolean;
  showUnsavedChanges?: boolean;
  showValidationStatus?: boolean;
  className?: string;
  compact?: boolean;
}

export const FormStatusIndicator: React.FC<FormStatusIndicatorProps> = ({
  feedback,
  showLastSaved = true,
  showUnsavedChanges = true,
  showValidationStatus = true,
  className,
  compact = false
}) => {
  const {
    isSubmitting,
    isValidating,
    isDirty,
    isValid,
    hasUnsavedChanges,
    lastSaved,
    errors,
    warnings,
    success
  } = feedback;

  const hasErrors = Object.values(errors).some(errorArray => errorArray.length > 0);
  const hasWarnings = Object.values(warnings).some(warningArray => warningArray.length > 0);
  const hasSuccess = Object.values(success).some(successArray => successArray.length > 0);
  const totalErrors = Object.values(errors).reduce((sum, errorArray) => sum + errorArray.length, 0);
  const totalWarnings = Object.values(warnings).reduce((sum, warningArray) => sum + warningArray.length, 0);

  const getStatusColor = () => {
    if (isSubmitting || isValidating) return 'text-blue-600';
    if (hasErrors) return 'text-red-600';
    if (hasWarnings) return 'text-yellow-600';
    if (isValid && !hasUnsavedChanges) return 'text-green-600';
    if (isDirty || hasUnsavedChanges) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (isSubmitting) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isValidating) return <Clock className="h-4 w-4 animate-pulse" />;
    if (hasErrors) return <AlertCircle className="h-4 w-4" />;
    if (hasWarnings) return <AlertTriangle className="h-4 w-4" />;
    if (isValid && !hasUnsavedChanges) return <CheckCircle className="h-4 w-4" />;
    if (isDirty || hasUnsavedChanges) return <Save className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isSubmitting) return 'Menyimpan...';
    if (isValidating) return 'Memvalidasi...';
    if (hasErrors) return `Ada ${totalErrors} kesalahan`;
    if (hasWarnings) return `Ada ${totalWarnings} peringatan`;
    if (isValid && !hasUnsavedChanges) return 'Form valid';
    if (isDirty || hasUnsavedChanges) return 'Ada perubahan belum disimpan';
    return 'Form siap';
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds} detik yang lalu`;
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return date.toLocaleDateString('id-ID');
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("flex items-center gap-1", getStatusColor())}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        {hasUnsavedChanges && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Belum disimpan
          </Badge>
        )}
        
        {totalErrors > 0 && (
          <Badge variant="destructive" className="text-xs">
            {totalErrors} error
          </Badge>
        )}
        
        {totalWarnings > 0 && (
          <Badge variant="secondary" className="text-yellow-600 bg-yellow-100 border-yellow-200 text-xs">
            {totalWarnings} warning
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main status */}
      <div className={cn("flex items-center gap-2", getStatusColor())}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {/* Detailed status */}
      <div className="space-y-2 text-xs text-gray-600">
        {showValidationStatus && (
          <div className="flex items-center gap-4">
            <span>Valid: {isValid ? 'Ya' : 'Tidak'}</span>
            <span>Dirty: {isDirty ? 'Ya' : 'Tidak'}</span>
            {totalErrors > 0 && <span className="text-red-600">Errors: {totalErrors}</span>}
            {totalWarnings > 0 && <span className="text-yellow-600">Warnings: {totalWarnings}</span>}
          </div>
        )}

        {showUnsavedChanges && hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertTriangle className="h-3 w-3" />
            <span>Ada perubahan yang belum disimpan</span>
          </div>
        )}

        {showLastSaved && lastSaved && (
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Terakhir disimpan: {formatLastSaved(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* Error summary */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <div className="text-sm font-medium text-red-800 mb-1">Kesalahan:</div>
          <ul className="text-xs text-red-700 space-y-1">
            {Object.entries(errors).map(([field, errorArray]) => 
              errorArray.map((error, index) => (
                <li key={`${field}-${index}`}>
                  <span className="font-medium">{field}:</span> {error}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Warning summary */}
      {hasWarnings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
          <div className="text-sm font-medium text-yellow-800 mb-1">Peringatan:</div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {Object.entries(warnings).map(([field, warningArray]) => 
              warningArray.map((warning, index) => (
                <li key={`${field}-${index}`}>
                  <span className="font-medium">{field}:</span> {warning}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// Compact variant for headers
export const CompactFormStatusIndicator: React.FC<FormStatusIndicatorProps> = (props) => (
  <FormStatusIndicator {...props} compact={true} />
);

// Detailed variant for sidebars
export const DetailedFormStatusIndicator: React.FC<FormStatusIndicatorProps> = (props) => (
  <FormStatusIndicator 
    {...props} 
    showLastSaved={true}
    showUnsavedChanges={true}
    showValidationStatus={true}
  />
);

export default FormStatusIndicator;
