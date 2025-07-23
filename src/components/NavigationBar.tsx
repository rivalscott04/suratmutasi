
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Template Generator', href: '/generator', icon: FileText },
    { name: 'Riwayat Surat', href: '/letters', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Deteksi active, support /letters dan /letters/:id
  const isActive = (path: string) => {
    if (path === '/letters') {
      return location.pathname.startsWith('/letters');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img 
                src="/src/assets/logo-kemenag.png" 
                alt="Kementerian Agama" 
                className="h-8 w-8"
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
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <p className="text-xs leading-none text-gray-500">Role: {user?.role}</p>
                    {user?.office_id && <p className="text-xs leading-none text-gray-500">Office ID: {user.office_id}</p>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
