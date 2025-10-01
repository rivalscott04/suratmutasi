import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProgressProps {
  isUploading: boolean;
  progress: number;
  fileName: string;
  className?: string;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  isUploading,
  progress,
  fileName,
  className = ''
}) => {
  if (!isUploading) return null;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="animate-spin">
          <Upload className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900">
            Mengupload {fileName}
          </div>
          <div className="text-xs text-blue-600">
            {progress}% selesai
          </div>
        </div>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2 bg-blue-100"
      />
    </div>
  );
};

export default FileUploadProgress;
