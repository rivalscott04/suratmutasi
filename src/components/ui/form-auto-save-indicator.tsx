import React from 'react';
import { cn } from '@/lib/utils';
import { Save, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FormAutoSaveIndicatorProps {
  isAutoSaving?: boolean;
  lastSaved?: Date;
  hasUnsavedChanges?: boolean;
  autoSaveEnabled?: boolean;
  className?: string;
  showLastSaved?: boolean;
}

export const FormAutoSaveIndicator: React.FC<FormAutoSaveIndicatorProps> = ({
  isAutoSaving = false,
  lastSaved,
  hasUnsavedChanges = false,
  autoSaveEnabled = false,
  className,
  showLastSaved = true
}) => {
  const getStatusIcon = () => {
    if (isAutoSaving) {
      return <Save className="h-4 w-4 animate-pulse text-blue-500" />;
    }
    
    if (hasUnsavedChanges) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    
    if (lastSaved) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <Save className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isAutoSaving) {
      return 'Menyimpan...';
    }
    
    if (hasUnsavedChanges) {
      return 'Belum disimpan';
    }
    
    if (lastSaved) {
      return 'Tersimpan';
    }
    
    return 'Belum ada perubahan';
  };

  const getStatusColor = () => {
    if (isAutoSaving) {
      return 'text-blue-600';
    }
    
    if (hasUnsavedChanges) {
      return 'text-orange-600';
    }
    
    if (lastSaved) {
      return 'text-green-600';
    }
    
    return 'text-gray-600';
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

  if (!autoSaveEnabled) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center gap-1", getStatusColor())}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {showLastSaved && lastSaved && !isAutoSaving && (
        <Badge variant="outline" className="text-xs text-gray-500">
          {formatLastSaved(lastSaved)}
        </Badge>
      )}
      
      {hasUnsavedChanges && !isAutoSaving && (
        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
          Ada perubahan
        </Badge>
      )}
    </div>
  );
};

// Compact variant untuk headers
export const CompactAutoSaveIndicator: React.FC<FormAutoSaveIndicatorProps> = (props) => (
  <FormAutoSaveIndicator {...props} showLastSaved={false} />
);

export default FormAutoSaveIndicator;
