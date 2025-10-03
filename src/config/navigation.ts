import { 
  Home, 
  FileText, 
  Settings, 
  UserCog, 
  Upload,
  Users,
  BarChart3,
  FileCheck,
  FolderOpen
} from 'lucide-react';

export type UserRole = 'admin' | 'admin_wilayah' | 'operator' | 'user';

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description?: string;
  badge?: string;
  badgeColor?: 'default' | 'secondary' | 'destructive' | 'outline';
  roles?: UserRole[];
  excludeRoles?: UserRole[];
  children?: NavigationItem[];
  requiresAuth?: boolean;
  isExternal?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

// Navigation configuration
export const navigationConfig: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview dan statistik sistem',
    roles: ['admin', 'admin_wilayah', 'operator', 'user']
  },
  {
    name: 'Admin Wilayah Dashboard',
    href: '/admin-wilayah/dashboard',
    icon: BarChart3,
    description: 'Dashboard khusus Admin Wilayah',
    roles: ['admin_wilayah']
  },
  {
    name: 'Template Generator',
    href: '/generator',
    icon: FileText,
    description: 'Generate surat berdasarkan template',
    roles: ['admin', 'operator']
  },
  {
    name: 'SK Generator',
    href: '/generator/sk',
    icon: FileCheck,
    description: 'Generate Surat Keputusan Mutasi',
    roles: ['admin', 'user']
  },
  {
    name: 'Riwayat Surat',
    href: '/letters',
    icon: FolderOpen,
    description: 'Daftar surat yang telah dibuat',
    roles: ['admin', 'admin_wilayah', 'operator', 'user']
  },
  {
    name: 'Data Pengajuan',
    href: '/pengajuan',
    icon: Upload,
    description: 'Kelola data pengajuan pegawai',
    roles: ['admin', 'admin_wilayah', 'operator', 'user']
  },
  {
    name: 'Management User',
    href: '/users',
    icon: UserCog,
    description: 'Kelola pengguna sistem',
    roles: ['admin']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Pengaturan sistem dan profil',
    excludeRoles: ['user']
  }
];

// Route configuration for breadcrumbs and access control
export const routeConfig: Record<string, {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  roles: UserRole[];
  parent?: string;
}> = {
  '/': {
    title: 'Beranda',
    breadcrumbs: [{ name: 'Beranda', current: true }],
    roles: []
  },
  '/dashboard': {
    title: 'Dashboard',
    breadcrumbs: [
      { name: 'Dashboard', current: true }
    ],
    roles: ['admin', 'admin_wilayah', 'operator', 'user']
  },
  '/admin-wilayah/dashboard': {
    title: 'Dashboard Admin Wilayah',
    breadcrumbs: [
      { name: 'Dashboard Admin Wilayah', current: true }
    ],
    roles: ['admin_wilayah']
  },
  '/generator': {
    title: 'Template Generator',
    breadcrumbs: [
      { name: 'Generator', href: '/generator' },
      { name: 'Pilih Template', current: true }
    ],
    roles: ['admin', 'operator']
  },
  '/generator/create/:templateId': {
    title: 'Buat Surat',
    breadcrumbs: [
      { name: 'Generator', href: '/generator' },
      { name: 'Buat Surat', current: true }
    ],
    roles: ['admin', 'operator'],
    parent: '/generator'
  },
  '/generator/sk': {
    title: 'SK Generator',
    breadcrumbs: [
      { name: 'SK Generator', current: true }
    ],
    roles: ['admin', 'user']
  },
  '/letters': {
    title: 'Riwayat Surat',
    breadcrumbs: [
      { name: 'Riwayat Surat', current: true }
    ],
    roles: ['admin', 'admin_wilayah', 'operator', 'user']
  },
  '/letters/:id': {
    title: 'Detail Surat',
    breadcrumbs: [
      { name: 'Riwayat Surat', href: '/letters' },
      { name: 'Detail Surat', current: true }
    ],
    roles: ['admin', 'admin_wilayah', 'operator', 'user'],
    parent: '/letters'
  },
  '/letters/:id/preview': {
    title: 'Preview Surat',
    breadcrumbs: [
      { name: 'Riwayat Surat', href: '/letters' },
      { name: 'Detail Surat', href: '/letters/:id' },
      { name: 'Preview', current: true }
    ],
    roles: ['admin', 'admin_wilayah', 'operator', 'user'],
    parent: '/letters'
  },
  '/pengajuan': {
    title: 'Data Pengajuan',
    breadcrumbs: [
      { name: 'Data Pengajuan', current: true }
    ],
    roles: ['admin', 'admin_wilayah', 'operator', 'user']
  },
  '/pengajuan/select': {
    title: 'Pilih Pegawai',
    breadcrumbs: [
      { name: 'Data Pengajuan', href: '/pengajuan' },
      { name: 'Pilih Pegawai', current: true }
    ],
    roles: ['admin', 'operator'],
    parent: '/pengajuan'
  },
  '/pengajuan/:pengajuanId': {
    title: 'Detail Pengajuan',
    breadcrumbs: [
      { name: 'Data Pengajuan', href: '/pengajuan' },
      { name: 'Detail Pengajuan', current: true }
    ],
    roles: ['admin', 'admin_wilayah', 'operator', 'user'],
    parent: '/pengajuan'
  },
  '/pengajuan/:pengajuanId/upload': {
    title: 'Upload File',
    breadcrumbs: [
      { name: 'Data Pengajuan', href: '/pengajuan' },
      { name: 'Detail Pengajuan', href: '/pengajuan/:pengajuanId' },
      { name: 'Upload File', current: true }
    ],
    roles: ['admin', 'operator'],
    parent: '/pengajuan'
  },
  '/pengajuan/:pengajuanId/edit': {
    title: 'Edit Pengajuan',
    breadcrumbs: [
      { name: 'Data Pengajuan', href: '/pengajuan' },
      { name: 'Detail Pengajuan', href: '/pengajuan/:pengajuanId' },
      { name: 'Edit', current: true }
    ],
    roles: ['admin', 'operator'],
    parent: '/pengajuan'
  },
  '/admin-wilayah/upload/:pengajuanId': {
    title: 'Upload File Admin Wilayah',
    breadcrumbs: [
      { name: 'Dashboard Admin Wilayah', href: '/admin-wilayah/dashboard' },
      { name: 'Upload File', current: true }
    ],
    roles: ['admin_wilayah'],
    parent: '/admin-wilayah/dashboard'
  },
  '/users': {
    title: 'Management User',
    breadcrumbs: [
      { name: 'Management User', current: true }
    ],
    roles: ['admin']
  },
  '/settings': {
    title: 'Settings',
    breadcrumbs: [
      { name: 'Settings', current: true }
    ],
    roles: ['admin', 'admin_wilayah', 'operator']
  },
  '/job-type-configuration': {
    title: 'Konfigurasi Jenis Jabatan',
    breadcrumbs: [
      { name: 'Settings', href: '/settings' },
      { name: 'Konfigurasi Jenis Jabatan', current: true }
    ],
    roles: ['admin'],
    parent: '/settings'
  }
};

// Helper functions
export const getNavigationItems = (userRole: UserRole): NavigationItem[] => {
  return navigationConfig.filter(item => {
    // Check if role is explicitly included
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }
    
    // Check if role is explicitly excluded
    if (item.excludeRoles && item.excludeRoles.includes(userRole)) {
      return false;
    }
    
    return true;
  });
};

export const getBreadcrumbs = (pathname: string, params?: Record<string, string>): BreadcrumbItem[] => {
  // Try exact match first
  let config = routeConfig[pathname];
  
  // If no exact match, try pattern matching for dynamic routes
  if (!config) {
    for (const [pattern, routeConfigItem] of Object.entries(routeConfig)) {
      if (pattern.includes(':')) {
        const patternRegex = new RegExp(pattern.replace(/:\w+/g, '[^/]+'));
        if (patternRegex.test(pathname)) {
          config = routeConfigItem;
          break;
        }
      }
    }
  }
  
  if (!config) {
    return [{ name: 'Halaman', current: true }];
  }
  
  // Replace dynamic segments with actual values
  return config.breadcrumbs.map(breadcrumb => ({
    ...breadcrumb,
    href: breadcrumb.href ? breadcrumb.href.replace(/:(\w+)/g, (match, key) => params?.[key] || match) : undefined
  }));
};

export const hasAccess = (pathname: string, userRole: UserRole): boolean => {
  const config = routeConfig[pathname];
  if (!config) return true; // Allow access to unknown routes
  
  return config.roles.length === 0 || config.roles.includes(userRole);
};

export const getPageTitle = (pathname: string, params?: Record<string, string>): string => {
  const config = routeConfig[pathname];
  if (!config) return 'Halaman';
  
  return config.title;
};
