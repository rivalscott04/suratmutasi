
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
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
  Upload,
  CheckCircle,
  Search,
  ArrowLeft,
  User,
  UserCircle,
  UserStar,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';



interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user';
  office_id?: string;
}

const NavigationBar = () => {
  const { user, originalUser, isImpersonating, impersonateUser, stopImpersonating, logout, token, loading, isAdminKanwil } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [showStopImpersonateModal, setShowStopImpersonateModal] = useState(false);
  const [showStopSuccessModal, setShowStopSuccessModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');


  // Get navigation items using new navigation system
  const { navigationItems, isActivePath } = useNavigation();

  // Fetch available users untuk impersonate
  useEffect(() => {
    if (showUserSelectionModal && isAdminKanwil) {
      fetchAvailableUsers();
    }
  }, [showUserSelectionModal, isAdminKanwil]);

  const fetchAvailableUsers = async () => {
    if (!token) return;
    
    setLoadingUsers(true);
    try {
      console.log(' Fetching users for impersonation...');
      const response = await apiGet('/api/users', token);
      console.log(' Raw users response:', response);
      
      // Filter out current user dan admin lain
      const filteredUsers = response.users.filter((u: User) => 
        u.id !== originalUser?.id && u.role !== 'admin'
      );
      console.log('✅ Filtered users:', filteredUsers);
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Use isActivePath from navigation hook instead

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleImpersonateClick = () => {
    setShowUserSelectionModal(true); // Buka modal selection dulu
    setIsMobileMenuOpen(false);
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUser(userId);
    setShowUserSelectionModal(false);
    setShowImpersonateModal(true);
  };

  const filteredUsers = availableUsers.filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleImpersonateConfirm = async () => {
    if (selectedUser) {
      try {
        await impersonateUser(selectedUser);
        setShowImpersonateModal(false);
        setSelectedUser('');
      } catch (error) {
        console.error('Failed to impersonate user:', error);
        toast({
          title: 'Error',
          description: 'Gagal impersonate user. Coba lagi.',
          variant: 'destructive',
          duration: 3000
        });
      }
    }
  };

  const handleStopImpersonatingClick = () => {
    setShowStopImpersonateModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleStopImpersonatingConfirm = async () => {
    try {
      await stopImpersonating();
      setShowStopImpersonateModal(false);
      setShowStopSuccessModal(true);
      
      // Auto close success modal after 3 seconds
      setTimeout(() => {
        setShowStopSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to stop impersonating:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghentikan impersonate. Coba lagi.',
        variant: 'destructive',
        duration: 3000
      });
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
                  src="/FE/logo-kemenag.png"
                  alt="Kementerian Agama" 
                  className="h-8 w-8"
                  onError={(e) => {
                    console.error('Logo Kemenag not found');
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-green-700">
                    Si Imut
                  </h1>
                  <p className="text-xs text-gray-600">
                    Sistem Informasi Mutasi
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
                  onClick={handleStopImpersonatingClick}
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
                        isActivePath(item.href)
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              

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
                    <div className="flex flex-col space-y-2">
                      <div>
                        <p className="text-sm font-semibold leading-none text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {isAdminKanwil ? (
                          <span className="text-xs font-medium text-blue-600">Administrator Kanwil</span>
                        ) : (
                          <span className="text-xs text-gray-600">
                            {user?.role === 'admin_wilayah' ? 'Admin Wilayah' : 
                             user?.role === 'operator' ? 'Operator' : 'Pengguna'}
                          </span>
                        )}
                        
                        {user?.wilayah && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-600">{user.wilayah}</span>
                          </div>
                        )}
                        
                        {isImpersonating && (
                          <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">
                              Sedang bertindak sebagai {user?.full_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  {/* Session Status */}
                  <DropdownMenuItem className="flex items-center justify-between py-3 cursor-default hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Sesi Aktif</span>
                      </div>
                    </div>
                    <button 
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-all duration-200 font-medium"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const response = await fetch('/api/auth/refresh', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' }
                          });
                          if (response.ok) {
                            const data = await response.json();
                            if (data.token) {
                              localStorage.setItem('token', data.token);
                              if (window.dispatchTokenUpdate) {
                                window.dispatchTokenUpdate(data.token);
                              }
                            }
                            toast({
                              title: "Sesi Diperpanjang",
                              description: "Sesi Anda telah berhasil diperpanjang.",
                            });
                          }
                        } catch (error) {
                          console.error('Refresh failed:', error);
                          toast({
                            title: "Gagal Memperpanjang Sesi",
                            description: "Terjadi kesalahan saat memperpanjang sesi.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Perpanjang
                    </button>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  {/* Stop Impersonating option */}
                  {isImpersonating && (
                    <>
                      <DropdownMenuItem onClick={handleStopImpersonatingClick} className="text-blue-600 hover:bg-blue-50 py-2.5">
                        <UserX className="mr-3 h-4 w-4" />
                        <span className="font-medium">Kembali ke Akun Asli</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Impersonate option hanya untuk admin kanwil */}
                  {isAdminKanwil && !isImpersonating && (
                    <>
                      <DropdownMenuItem onClick={handleImpersonateClick} className="text-blue-600 hover:bg-blue-50 py-2.5">
                        <Users className="mr-3 h-4 w-4" />
                        <span className="font-medium">Masuk sebagai Pengguna Lain</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600 hover:bg-red-50 py-2.5">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Keluar</span>
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

                
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium",
                        isActivePath(item.href)
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
                    onClick={handleStopImpersonatingClick}
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

      {/* User Selection Modal */}
      <Dialog open={showUserSelectionModal} onOpenChange={setShowUserSelectionModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Pilih User untuk Impersonate
            </DialogTitle>
            <DialogDescription>
              Pilih user yang ingin Anda impersonate dari daftar di bawah ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari user..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* User List */}
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2 text-green-600" />
                  <span className="text-sm text-gray-500">Loading users...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada user yang tersedia untuk impersonation
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada user yang cocok dengan pencarian
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleUserSelection(user.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{user.full_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {user.office_id || 'No Office'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setShowUserSelectionModal(false)}
              variant="outline"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Impersonate User Modal (Modified) */}
      <Dialog open={showImpersonateModal} onOpenChange={setShowImpersonateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Impersonate User
            </DialogTitle>
            <DialogDescription>
              Konfirmasi untuk impersonate user yang dipilih.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    {(() => {
                      const selectedUserData = availableUsers.find(u => u.id === selectedUser);
                      return selectedUserData ? (
                        <>
                          <div className="font-medium text-sm">{selectedUserData.full_name}</div>
                          <div className="text-xs text-gray-500">{selectedUserData.email}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {selectedUserData.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {selectedUserData.office_id || 'No Office'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">User tidak ditemukan</div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center">
              <Button 
                onClick={() => {
                  setShowImpersonateModal(false);
                  setShowUserSelectionModal(true);
                }}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Pilih User Lain
              </Button>
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
              disabled={!selectedUser}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Impersonate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stop Impersonate Confirmation Modal */}
      <Dialog open={showStopImpersonateModal} onOpenChange={setShowStopImpersonateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-blue-500" />
              Stop Impersonating
            </DialogTitle>
            <DialogDescription>
              Anda sedang mengakses sistem sebagai <strong>{user?.full_name}</strong>. 
              Apakah Anda yakin ingin kembali ke akun admin Anda?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-4">
            <div className="flex items-center">
              <UserCheck className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-700">
                Setelah stop impersonate, Anda akan kembali ke akun: <strong>{originalUser?.full_name}</strong>
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setShowStopImpersonateModal(false)}
              variant="outline"
            >
              Batal
            </Button>
            <Button 
              onClick={handleStopImpersonatingConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ya, Stop Impersonating
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stop Impersonate Success Modal */}
      <Dialog open={showStopSuccessModal} onOpenChange={setShowStopSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Stop Impersonating Berhasil
            </DialogTitle>
            <DialogDescription>
              Anda telah berhasil kembali ke akun admin Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-4">
            <div className="flex items-center">
              <UserCheck className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700">
                Sekarang Anda mengakses sistem sebagai: <strong>{user?.full_name}</strong>
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowStopSuccessModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NavigationBar;
