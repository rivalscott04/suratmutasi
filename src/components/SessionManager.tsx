import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess, showError, showWarning } from '@/lib/messageUtils';

interface SessionManagerProps {
  children: React.ReactNode;
}

interface SessionState {
  isExpired: boolean;
  isRefreshing: boolean;
  refreshAttempts: number;
  lastRefreshTime?: Date;
  expiryWarning?: Date;
  countdown?: number;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isExpired: false,
    isRefreshing: false,
    refreshAttempts: 0
  });
  
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  
  const { token, user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Session expiry warning (5 minutes before expiry)
  const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes
  const MAX_REFRESH_ATTEMPTS = 3;
  const COUNTDOWN_DURATION = 30; // 30 seconds

  // Parse JWT token to get expiry time
  const getTokenExpiry = useCallback((token: string): Date | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }, []);

  // Check if token is expiring soon
  const checkTokenExpiry = useCallback(() => {
    if (!token) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const now = new Date();
    const timeUntilExpiry = expiry.getTime() - now.getTime();

    if (timeUntilExpiry <= 0) {
      // Token already expired
      setSessionState(prev => ({ ...prev, isExpired: true }));
      setShowSessionModal(true);
    } else if (timeUntilExpiry <= SESSION_WARNING_TIME) {
      // Token expiring soon
      setShowExpiryWarning(true);
      setCountdown(Math.floor(timeUntilExpiry / 1000));
    }
  }, [token, getTokenExpiry]);

  // Auto-refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (sessionState.isRefreshing || sessionState.refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      return false;
    }

    setSessionState(prev => ({ 
      ...prev, 
      isRefreshing: true,
      refreshAttempts: prev.refreshAttempts + 1
    }));

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
          
          // Update AuthContext
          if (window.dispatchTokenUpdate) {
            window.dispatchTokenUpdate(data.token);
          }

          setSessionState(prev => ({
            ...prev,
            isExpired: false,
            isRefreshing: false,
            lastRefreshTime: new Date(),
            refreshAttempts: 0
          }));

          setShowExpiryWarning(false);
          showSuccess('SESSION_REFRESHED', 'Session berhasil diperpanjang');
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    setSessionState(prev => ({ 
      ...prev, 
      isRefreshing: false 
    }));

    return false;
  }, [sessionState.isRefreshing, sessionState.refreshAttempts]);

  // Handle session expiry
  const handleSessionExpired = useCallback(() => {
    setSessionState(prev => ({ ...prev, isExpired: true }));
    setShowSessionModal(true);
    setShowExpiryWarning(false);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      logout();
      setShowSessionModal(false);
      setShowExpiryWarning(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      localStorage.removeItem('token');
      window.location.assign('/');
    }
  }, [logout, navigate]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    const success = await refreshToken();
    if (!success) {
      showError('SESSION_REFRESH_FAILED', 'Gagal memperpanjang session');
    }
  }, [refreshToken]);

  // Auto-refresh before expiry
  useEffect(() => {
    if (!token || showExpiryWarning) return;

    const interval = setInterval(checkTokenExpiry, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [token, checkTokenExpiry, showExpiryWarning]);

  // Countdown timer
  useEffect(() => {
    if (!showExpiryWarning || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleSessionExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showExpiryWarning, countdown, handleSessionExpired]);

  // Setup global session handlers
  useEffect(() => {
    // Override global session expired handler
    window.showSessionExpiredModal = handleSessionExpired;
    
    // Setup token update handler
    window.dispatchTokenUpdate = (newToken: string) => {
      localStorage.setItem('token', newToken);
      setSessionState(prev => ({ ...prev, lastRefreshTime: new Date() }));
    };

    return () => {
      delete window.showSessionExpiredModal;
      delete window.dispatchTokenUpdate;
    };
  }, [handleSessionExpired]);

  // Format countdown
  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}

      {/* Session Expiry Warning Modal */}
      <Dialog open={showExpiryWarning} onOpenChange={setShowExpiryWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Session Akan Berakhir
            </DialogTitle>
            <DialogDescription>
              Session Anda akan berakhir dalam beberapa saat. Perpanjang session untuk melanjutkan bekerja.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Countdown */}
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {formatCountdown(countdown)}
              </div>
              <Progress value={(countdown / (SESSION_WARNING_TIME / 1000)) * 100} className="h-2" />
            </div>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-8 w-8 text-gray-600" />
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-gray-600">{user.role}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh}
                disabled={sessionState.isRefreshing}
                className="flex-1"
              >
                {sessionState.isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
                    Memperpanjang...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Perpanjang Session
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Expired Modal */}
      <Dialog open={showSessionModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Session Berakhir
            </DialogTitle>
            <DialogDescription>
              Session Anda telah berakhir. Silakan login kembali untuk melanjutkan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Session info */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Session Berakhir</span>
              </div>
              {sessionState.lastRefreshTime && (
                <Badge variant="outline" className="text-xs">
                  Terakhir refresh: {sessionState.lastRefreshTime.toLocaleTimeString('id-ID')}
                </Badge>
              )}
            </div>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-8 w-8 text-gray-600" />
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-gray-600">{user.role}</div>
                </div>
              </div>
            )}

            {/* Retry option if refresh attempts < max */}
            {sessionState.refreshAttempts < MAX_REFRESH_ATTEMPTS && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Mencoba memperpanjang session...
                  </span>
                </div>
                <div className="text-xs text-blue-600 mb-3">
                  Percobaan: {sessionState.refreshAttempts}/{MAX_REFRESH_ATTEMPTS}
                </div>
                <Button 
                  onClick={handleRefresh}
                  disabled={sessionState.isRefreshing}
                  size="sm"
                  className="w-full"
                >
                  {sessionState.isRefreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
                      Mencoba...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Coba Lagi
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Login Ulang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionManager;
