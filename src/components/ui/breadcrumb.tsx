import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/config/navigation';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  showHome = true
}) => {
  // Add home breadcrumb if showHome is true and first item is not home
  const breadcrumbItems = showHome && items[0]?.name !== 'Dashboard' 
    ? [{ name: 'Dashboard', href: '/dashboard' }, ...items]
    : items;

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb if only one item
  }

  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-500 mb-4",
        className
      )}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
          
          {item.current ? (
            <span 
              className="text-gray-900 font-medium"
              aria-current="page"
            >
              {item.name}
            </span>
          ) : item.href ? (
            <Link
              to={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-500">{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Compact breadcrumb variant for mobile
export const CompactBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  showHome = true
}) => {
  const breadcrumbItems = showHome && items[0]?.name !== 'Dashboard' 
    ? [{ name: 'Dashboard', href: '/dashboard' }, ...items]
    : items;

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-xs text-gray-500 mb-2",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Home className="h-3 w-3" />
      <ChevronRight className="h-3 w-3 text-gray-400" />
      <span className="text-gray-900 font-medium">
        {breadcrumbItems[breadcrumbItems.length - 1]?.name}
      </span>
    </nav>
  );
};

export default Breadcrumb;