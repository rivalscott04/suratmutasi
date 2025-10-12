import React from 'react';
import { Progress } from '@/components/ui/progress';

interface UploadProgressIndicatorProps {
  progress: number;
  isUploading: boolean;
  className?: string;
}

const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  progress,
  isUploading,
  className = ''
}) => {
  // Cap progress at 100% and limit to 1 decimal place
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const displayProgress = Math.round(normalizedProgress * 10) / 10;
  
  // Determine status text based on progress
  const getStatusText = () => {
    if (!isUploading) return '';
    
    if (displayProgress === 0) return 'Preparing upload...';
    if (displayProgress < 20) return 'Preparing upload...';
    if (displayProgress < 90) return 'Uploading file...';
    if (displayProgress < 100) return 'Processing...';
    return 'Complete!';
  };

  const getProgressColor = () => {
    if (displayProgress < 20) return 'text-blue-600';
    if (displayProgress < 90) return 'text-green-600';
    if (displayProgress < 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = () => {
    if (displayProgress < 20) return 'bg-blue-600';
    if (displayProgress < 90) return 'bg-green-600';
    if (displayProgress < 100) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (!isUploading) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Status text and percentage */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-3 w-3 border border-green-600 border-t-transparent rounded-full" />
          <span className={`font-medium ${getProgressColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <span className={`font-semibold ${getProgressColor()}`}>
          {displayProgress}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div 
            className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadProgressIndicator;
