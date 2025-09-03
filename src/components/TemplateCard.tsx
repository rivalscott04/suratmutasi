
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Users, CheckCircle, AlertCircle, UserCheck, ArrowRightLeft, Users2, FileCheck } from 'lucide-react';

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const getTemplateIcon = (id: string) => {
  const iconMap = {
    '1': Shield,
    '2': Users,
    '3': FileText,
    '4': CheckCircle,
    '5': AlertCircle,
    '6': UserCheck,
    '7': ArrowRightLeft,
    '8': Users2,
    '9': FileCheck,
    '10': FileCheck,
  };
  return iconMap[id as keyof typeof iconMap] || FileText;
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  id,
  title,
  description,
  category,
  isSelected,
  onSelect
}) => {
  const Icon = getTemplateIcon(id);

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => onSelect(id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm leading-tight">{title}</h4>
              <Badge variant="secondary" className="text-xs">{category}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
