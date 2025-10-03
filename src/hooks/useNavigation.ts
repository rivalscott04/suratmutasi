import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getNavigationItems, 
  getBreadcrumbs, 
  getPageTitle, 
  hasAccess,
  UserRole 
} from '@/config/navigation';

export const useNavigation = () => {
  const location = useLocation();
  const params = useParams();
  const { user, isImpersonating, originalUser } = useAuth();

  // Determine current user role (consider impersonation)
  const currentRole: UserRole = useMemo(() => {
    // When impersonating, use the impersonated user's role for navigation
    // The navigation should show menus based on what the impersonated user can access
    if (isImpersonating && user) {
      return user.role as UserRole;
    }
    return user?.role as UserRole;
  }, [user, isImpersonating]);

  // Get navigation items for current role
  const navigationItems = useMemo(() => {
    return getNavigationItems(currentRole);
  }, [currentRole]);

  // Get breadcrumbs for current path
  const breadcrumbs = useMemo(() => {
    return getBreadcrumbs(location.pathname, params);
  }, [location.pathname, params]);

  // Get current page title
  const pageTitle = useMemo(() => {
    return getPageTitle(location.pathname, params);
  }, [location.pathname, params]);

  // Check if user has access to current page
  const hasPageAccess = useMemo(() => {
    return hasAccess(location.pathname, currentRole);
  }, [location.pathname, currentRole]);

  // Check if user has access to a specific path
  const checkAccess = (pathname: string) => {
    return hasAccess(pathname, currentRole);
  };

  // Get navigation item by path
  const getNavigationItem = (href: string) => {
    return navigationItems.find(item => item.href === href);
  };

  // Check if current path is active
  const isActivePath = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    
    // Exact match first
    if (location.pathname === href) {
      return true;
    }
    
    // Special handling for routes that have sub-routes
    const parentRoutes = {
      '/generator': ['/generator/sk', '/generator/create'],
      '/pengajuan': ['/pengajuan/select', '/pengajuan/edit'],
      '/letters': ['/letters/preview'],
      '/admin-wilayah': ['/admin-wilayah/dashboard', '/admin-wilayah/upload']
    };
    
    // Check if current path is a sub-route of the href
    for (const [parentRoute, subRoutes] of Object.entries(parentRoutes)) {
      if (href === parentRoute) {
        const isSubRoute = subRoutes.some(subRoute => location.pathname.startsWith(subRoute));
        if (isSubRoute) {
          return false; // Don't highlight parent when on sub-route
        }
      }
    }
    
    // For other routes, use startsWith
    return location.pathname.startsWith(href);
  };

  // Get parent breadcrumb
  const getParentBreadcrumb = () => {
    if (breadcrumbs.length > 1) {
      return breadcrumbs[breadcrumbs.length - 2];
    }
    return null;
  };

  // Get root breadcrumb (first item)
  const getRootBreadcrumb = () => {
    return breadcrumbs[0] || null;
  };

  return {
    // Current state
    currentRole,
    currentPath: location.pathname,
    
    // Navigation data
    navigationItems,
    breadcrumbs,
    pageTitle,
    
    // Access control
    hasPageAccess,
    checkAccess,
    
    // Helpers
    getNavigationItem,
    isActivePath,
    getParentBreadcrumb,
    getRootBreadcrumb,
    
    // Raw data
    params,
    location
  };
};

// Hook for breadcrumb navigation specifically
export const useBreadcrumb = () => {
  const { breadcrumbs, getParentBreadcrumb, getRootBreadcrumb, pageTitle } = useNavigation();
  
  return {
    breadcrumbs,
    pageTitle,
    parent: getParentBreadcrumb(),
    root: getRootBreadcrumb(),
    hasParent: breadcrumbs.length > 1,
    depth: breadcrumbs.length
  };
};

// Hook for checking route access
export const useRouteAccess = () => {
  const { currentRole, hasPageAccess, checkAccess } = useNavigation();
  
  return {
    currentRole,
    hasPageAccess,
    checkAccess,
    canAccess: (pathname: string) => checkAccess(pathname)
  };
};
