import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, Clock } from 'lucide-react';

interface UploadProgressTrackerProps {
  uploaded: number;
  total: number;
  isComplete: boolean;
  className?: string;
}

const UploadProgressTracker: React.FC<UploadProgressTrackerProps> = ({
  uploaded,
  total,
  isComplete,
  className = ''
}) => {
  const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Progress Upload Dokumen</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {uploaded} dari {total} dokumen
          </div>
          <div className="text-lg font-bold text-green-600">
            {percentage}%
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <Progress 
          value={percentage} 
          className="h-3 bg-gray-200"
        />
      </div>
      
      {/* Status Breakdown */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>{uploaded} Terupload</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{total - uploaded} Belum</span>
        </div>
        {isComplete && (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>Upload Selesai</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProgressTracker;
