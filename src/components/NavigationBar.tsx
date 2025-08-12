
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  AlertTriangle,
  UserCheck,
  Users,
  UserX,
  Loader2,
  UserCog,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EnvironmentSwitcher from './EnvironmentSwitcher';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user';
  office_id?: string;
}

const NavigationBar = () => {
  const { user, originalUser, isImpersonating, impersonateUser, stopImpersonating, logout, token, loading, isAdminKanwil } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Navigation items berdasarkan role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Template Generator', href: '/generator', icon: FileText },
      { name: 'Riwayat Surat', href: '/letters', icon: FileText },
      { name: 'Pengajuan', href: '/pengajuan/select', icon: Upload },
    ];

    // Tambahkan Management User untuk admin
    // Gunakan originalUser?.role jika sedang impersonate, atau user?.role jika tidak
    const isAdmin = isImpersonating ? originalUser?.role === 'admin' : user?.role === 'admin';
    if (isAdmin) {
      baseItems.push({ name: 'Management User', href: '/users', icon: UserCog });
      baseItems.push({ name: 'Konfigurasi Jabatan', href: '/job-type-configuration', icon: Settings });
    }

    baseItems.push({ name: 'Settings', href: '/settings', icon: Settings });

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Fetch available users untuk impersonate
  useEffect(() => {
    if (showImpersonateModal && isAdminKanwil) {
      fetchAvailableUsers();
    }
  }, [showImpersonateModal, isAdminKanwil]);

  const fetchAvailableUsers = async () => {
    if (!token) return;
    
    setLoadingUsers(true);
    try {
      const response = await apiGet('/api/users', token);
      // Filter out current user dan admin lain
      const filteredUsers = response.users.filter((u: User) => 
        u.id !== originalUser?.id && u.role !== 'admin'
      );
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Deteksi active, support /letters dan /letters/:id
  const isActive = (path: string) => {
    if (path === '/letters') {
      return location.pathname.startsWith('/letters');
    }
    return location.pathname === path;
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleImpersonateClick = () => {
    setShowImpersonateModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleImpersonateConfirm = async () => {
    if (selectedUser) {
      try {
        await impersonateUser(selectedUser);
        setShowImpersonateModal(false);
        setSelectedUser('');
      } catch (error) {
        console.error('Failed to impersonate user:', error);
        alert('Failed to impersonate user. Please try again.');
      }
    }
  };

  const handleStopImpersonating = async () => {
    try {
      await stopImpersonating();
    } catch (error) {
      console.error('Failed to stop impersonating:', error);
      alert('Failed to stop impersonating. Please try again.');
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <img 
                  src="/logo-kemenag.png"
                  alt="Kementerian Agama" 
                  className="h-8 w-8"
                  onError={(e) => {
                    console.error('Logo Kemenag not found');
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-green-700">
                    Surat Generator
                  </h1>
                  <p className="text-xs text-gray-600">
                    Kementerian Agama RI
                  </p>
                </div>
              </Link>
            </div>

            {/* Impersonate Indicator */}
            {isImpersonating && (
              <div className="hidden md:flex items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                <UserCheck className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700">
                  Impersonating: {user?.full_name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopImpersonating}
                  className="ml-2 h-6 px-2 text-blue-600 hover:text-blue-700"
                >
                  <UserX className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Environment Switcher */}
              <EnvironmentSwitcher />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {loading ? (
                          <span className="animate-pulse w-6 h-6 block bg-green-200 rounded-full mx-auto" />
                        ) : user?.full_name ? (
                          user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                        ) : (
                          '?'
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      {isAdminKanwil ? (
                        <p className="text-xs leading-none text-blue-600 font-medium">
                          👑 Admin Kanwil (All Access)
                        </p>
                      ) : (
                        <p className="text-xs leading-none text-gray-500">Role: {user?.role}</p>
                      )}
                      {user?.office_id && !isAdminKanwil && <p className="text-xs leading-none text-gray-500">Office ID: {user.office_id}</p>}
                      {isImpersonating && (
                        <p className="text-xs leading-none text-blue-600">
                          Impersonating as {user?.full_name}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Stop Impersonating option */}
                  {isImpersonating && (
                    <>
                      <DropdownMenuItem onClick={handleStopImpersonating} className="text-blue-600">
                        <UserX className="mr-2 h-4 w-4" />
                        <span>Stop Impersonating</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Impersonate option hanya untuk admin kanwil */}
                  {isAdminKanwil && !isImpersonating && (
                    <>
                      <DropdownMenuItem onClick={handleImpersonateClick} className="text-blue-600">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Impersonate User</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                {/* Environment Switcher for Mobile */}
                <div className="px-3 py-2">
                  <EnvironmentSwitcher />
                </div>
                
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium",
                        isActive(item.href)
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                {/* Stop Impersonating option untuk mobile */}
                {isImpersonating && (
                  <button
                    onClick={handleStopImpersonating}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full"
                  >
                    <UserX className="h-5 w-5" />
                    <span>Stop Impersonating</span>
                  </button>
                )}
                {/* Impersonate option untuk mobile */}
                {isAdminKanwil && !isImpersonating && (
                  <button
                    onClick={handleImpersonateClick}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full"
                  >
                    <Users className="h-5 w-5" />
                    <span>Impersonate User</span>
                  </button>
                )}
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Konfirmasi Logout
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk mengakses aplikasi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setShowLogoutModal(false)}
              variant="outline"
            >
              Batal
            </Button>
            <Button 
              onClick={handleLogoutConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Impersonate User Modal */}
      <Dialog open={showImpersonateModal} onOpenChange={setShowImpersonateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Impersonate User
            </DialogTitle>
            <DialogDescription>
              Pilih user yang ingin Anda impersonate. Anda akan melihat sistem dari perspektif user tersebut.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pilih User:</label>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading users...</span>
                </div>
              ) : (
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih user untuk impersonate" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-gray-500">
                        Tidak ada user yang tersedia
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.full_name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                            <span className="text-xs text-gray-500">{user.role} - {user.office_id || 'No Office'}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setShowImpersonateModal(false)}
              variant="outline"
            >
              Batal
            </Button>
            <Button 
              onClick={handleImpersonateConfirm}
              disabled={!selectedUser || loadingUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Impersonate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NavigationBar;
