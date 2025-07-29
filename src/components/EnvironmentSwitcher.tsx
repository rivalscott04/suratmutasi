import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Server, Monitor } from 'lucide-react';
import { getEnvironmentConfig, setEnvironment } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const EnvironmentSwitcher: React.FC = () => {
  const { current, environments, isProductionServer } = getEnvironmentConfig();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Hanya tampilkan environment switcher untuk admin yang sudah login
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  // Sembunyikan environment switcher di production server
  if (isProductionServer) {
    return null;
  }

  const handleEnvironmentChange = (newEnv: string) => {
    if (newEnv !== current) {
      setEnvironment(newEnv);
    }
  };

  const getEnvironmentIcon = (env: string) => {
    switch (env) {
      case 'development':
        return <Monitor className="w-4 h-4" />;
      case 'production':
        return <Server className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getEnvironmentColor = (env: string) => {
    return environments[env as keyof typeof environments]?.color || 'text-gray-600';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Environment:</span>
      </div>
      
      <Select value={current} onValueChange={handleEnvironmentChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex items-center gap-2">
              {getEnvironmentIcon(current)}
              <span className={getEnvironmentColor(current)}>
                {environments[current as keyof typeof environments]?.name}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(environments).map(([key, env]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                {getEnvironmentIcon(key)}
                <span className={env.color}>{env.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Badge variant="outline" className={getEnvironmentColor(current)}>
        {current.toUpperCase()}
      </Badge>
    </div>
  );
};

export default EnvironmentSwitcher; 