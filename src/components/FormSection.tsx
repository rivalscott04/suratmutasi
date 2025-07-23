
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
