import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface NavigationProps {
  className?: string;
  variant?: 'desktop' | 'mobile' | 'sidebar';
  showBadges?: boolean;
  collapsible?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  className,
  variant = 'desktop',
  showBadges = true,
  collapsible = false
}) => {
  const { navigationItems, isActivePath } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const renderNavigationItem = (item: any, index: number) => {
    const isActive = isActivePath(item.href);
    const Icon = item.icon;
    
    const itemClasses = cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
      {
        "bg-primary text-primary-foreground": isActive,
        "text-gray-700 hover:text-gray-900 hover:bg-gray-100": !isActive,
        "justify-center": variant === 'mobile' && isCollapsed,
        "flex-col gap-1 py-3": variant === 'mobile',
        "px-2": variant === 'sidebar' && isCollapsed,
        "w-full": variant === 'mobile'
      }
    );

    return (
      <Link
        key={index}
        to={item.href}
        className={itemClasses}
        title={isCollapsed ? item.name : undefined}
        onClick={() => variant === 'mobile' && setIsMobileOpen(false)}
      >
        <Icon className={cn(
          "flex-shrink-0",
          {
            "h-4 w-4": variant === 'desktop' || variant === 'sidebar',
            "h-5 w-5": variant === 'mobile'
          }
        )} />
        
        {(!isCollapsed || variant === 'mobile') && (
          <>
            <span className="truncate">{item.name}</span>
            {showBadges && item.badge && (
              <Badge 
                variant={item.badgeColor || 'default'}
                className="ml-auto text-xs"
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
        
        {item.description && variant === 'mobile' && (
          <span className="text-xs text-gray-500 text-center leading-tight">
            {item.description}
          </span>
        )}
      </Link>
    );
  };

  if (variant === 'mobile') {
    return (
      <div className={cn("lg:hidden", className)}>
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobile}
          className="md:hidden"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile navigation */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
            <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="sm" onClick={toggleMobile}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="p-4 space-y-2">
                {navigationItems.map((item, index) => renderNavigationItem(item, index))}
              </nav>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="mb-4 self-end"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
        
        <nav className={cn(
          "space-y-1",
          {
            "w-16": isCollapsed && collapsible,
            "w-full": !isCollapsed || !collapsible
          }
        )}>
          {navigationItems.map((item, index) => renderNavigationItem(item, index))}
        </nav>
      </div>
    );
  }

  // Desktop variant
  return (
    <nav className={cn("hidden lg:flex items-center space-x-1", className)}>
      {navigationItems.map((item, index) => {
        if (item.children && item.children.length > 0) {
          const Icon = item.icon;
          const isActive = isActivePath(item.href);
          return (
            <div key={index} className="relative group">
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                  isActive ? "bg-primary text-primary-foreground" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Link>
              <div className="absolute left-0 top-full mt-1 hidden group-hover:block min-w-[220px] rounded-md border bg-white shadow-lg z-50">
                <div className="py-1">
                  {item.children.map((child: any, idx: number) => (
                    <Link
                      key={idx}
                      to={child.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      {child.icon ? <child.icon className="h-4 w-4" /> : null}
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return renderNavigationItem(item, index);
      })}
    </nav>
  );
};

export default Navigation;
