import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface FormProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  isSubmitting?: boolean;
  hasError?: boolean;
  className?: string;
  showStepNumbers?: boolean;
  showProgressBar?: boolean;
}

export const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({
  steps,
  currentStep,
  isSubmitting = false,
  hasError = false,
  className,
  showStepNumbers = true,
  showProgressBar = true
}) => {
  const progress = (currentStep / steps.length) * 100;

  const getStepIcon = (index: number) => {
    if (hasError && index === currentStep) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (index < currentStep) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (index === currentStep && isSubmitting) {
      return <Loader2 className="h-4 w-4 animate-spin text-green-600" />;
    }
    
    return (
      <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-white" />
    );
  };

  const getStepClassName = (index: number) => {
    if (hasError && index === currentStep) {
      return 'text-red-600 font-medium';
    }
    
    if (index < currentStep) {
      return 'text-green-600 font-medium';
    }
    
    if (index === currentStep) {
      return 'text-blue-600 font-medium';
    }
    
    return 'text-gray-500';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress bar */}
      {showProgressBar && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
          />
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {getStepIcon(index)}
            
            <div className="flex-1">
              <div className={cn("text-sm", getStepClassName(index))}>
                {showStepNumbers && (
                  <span className="mr-2 font-medium">
                    {index + 1}.
                  </span>
                )}
                {step}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current step info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-center gap-2">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
          ) : hasError ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          
          <span className="text-sm font-medium">
            {hasError 
              ? `Error pada step ${currentStep + 1}: ${steps[currentStep]}`
              : isSubmitting 
                ? `Memproses step ${currentStep + 1}: ${steps[currentStep]}`
                : currentStep < steps.length 
                  ? `Step ${currentStep + 1}: ${steps[currentStep]}`
                  : 'Semua step selesai'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

// Simple progress indicator for single actions
export const SimpleProgressIndicator: React.FC<{
  isSubmitting: boolean;
  hasError: boolean;
  message?: string;
  className?: string;
}> = ({ isSubmitting, hasError, message, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-green-600" />}
      {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
      {!isSubmitting && !hasError && <CheckCircle className="h-4 w-4 text-green-500" />}
      
      <span className="text-sm font-medium">
        {message || (isSubmitting ? 'Memproses...' : hasError ? 'Terjadi kesalahan' : 'Selesai')}
      </span>
    </div>
  );
};

export default FormProgressIndicator;
