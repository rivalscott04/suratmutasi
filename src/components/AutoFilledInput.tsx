
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface AutoFilledInputProps {
  label: string;
  value: string;
  placeholder?: string;
}

export const AutoFilledInput: React.FC<AutoFilledInputProps> = ({
  label,
  value,
  placeholder = ''
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          value={value ?? ""}
          placeholder={placeholder}
          readOnly
          className="bg-muted/50 text-muted-foreground pr-10"
        />
        {value && (
          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
        )}
      </div>
    </div>
  );
};
