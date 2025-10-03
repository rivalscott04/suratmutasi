import React from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBreadcrumb?: boolean;
  showTitle?: boolean;
  className?: string;
  breadcrumbClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showBreadcrumb = true,
  showTitle = true,
  className,
  breadcrumbClassName
}) => {
  const { pageTitle, breadcrumbs } = useNavigation();
  
  const displayTitle = title || pageTitle;
  const shouldShowBreadcrumb = showBreadcrumb && breadcrumbs.length > 1;

  return (
    <div className={cn("mb-6", className)}>
      {shouldShowBreadcrumb && (
        <Breadcrumb 
          items={breadcrumbs} 
          className={breadcrumbClassName}
        />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {showTitle && displayTitle && (
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {displayTitle}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact variant for mobile
export const CompactPageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showBreadcrumb = true,
  className
}) => {
  const { pageTitle, breadcrumbs } = useNavigation();
  
  const displayTitle = title || pageTitle;
  const shouldShowBreadcrumb = showBreadcrumb && breadcrumbs.length > 1;

  return (
    <div className={cn("mb-4", className)}>
      {shouldShowBreadcrumb && (
        <Breadcrumb 
          items={breadcrumbs} 
          className="mb-2"
        />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {displayTitle && (
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {displayTitle}
            </h1>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-1 ml-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
