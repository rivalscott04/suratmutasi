import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiPost, apiGet } from '../lib/api';
import DynamicIsland, { IslandMode, makeScene } from '../components/DynamicIsland/DynamicIsland';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user' | 'admin_wilayah';
  office_id?: string | null;
  wilayah?: string | null;
  kabkota?: string;
  original_admin_id?: string; // For impersonation tracking
  impersonating?: boolean;
}

interface AuthContextType {
  user: User | null;
  originalUser: User | null; // User asli sebelum impersonate
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  isAdminKanwil: boolean; // Admin kanwil yang bisa impersonate
  impersonateUser: (userId: string) => Promise<void>;
  stopImpersonating: () => Promise<void>;
  updateToken: (newToken: string) => void;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [originalToken, setOriginalToken] = useState<string | null>(null); // token admin asli
  const [loading, setLoading] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('');
  
  // Dynamic Island state - default hidden
  const [showWelcomeIsland, setShowWelcomeIsland] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(() => {
    // Check localStorage for previous welcome display in this session
    return localStorage.getItem('hasShownWelcome') === 'true';
  });
  const [isHiding, setIsHiding] = useState(false);

  // Setup window functions untuk refresh token
  useEffect(() => {
    // Fungsi untuk update token dari API layer
    window.dispatchTokenUpdate = (newToken: string) => {
      setToken(newToken);
      localStorage.setItem('token', newToken);
    };

    return () => {
      delete window.dispatchTokenUpdate;
    };
  }, []);

  // Check maintenance status whenever user changes
  useEffect(() => {
    if (user) {
      checkMaintenanceStatus();
    }
  }, [user]);

  // Check maintenance status
  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/maintenance/status');
      const data = await response.json();
      
      // Check if user is superadmin (can bypass maintenance)
      const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');
      const isSuperAdmin = currentUser && currentUser.role === 'admin' && currentUser.office_id === null;
      
      // If user is superadmin, don't set maintenance mode
      if (isSuperAdmin) {
        setIsMaintenanceMode(false);
        setMaintenanceMessage('');
      } else {
        setIsMaintenanceMode(data.isMaintenanceMode || false);
        setMaintenanceMessage(data.message || '');
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
      // Set default values if API fails
      setIsMaintenanceMode(false);
      setMaintenanceMessage('');
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedOriginalToken = localStorage.getItem('originalToken');
    const storedOriginalUser = localStorage.getItem('originalUser');
    
    // Check maintenance status on app load
    checkMaintenanceStatus();
    
    if (storedToken) {
      setToken(storedToken);
      
      // Restore original token and user if they exist (for impersonation)
      if (storedOriginalToken && storedOriginalUser) {
        try {
          setOriginalToken(storedOriginalToken);
          setOriginalUser(JSON.parse(storedOriginalUser));
          console.log('Restored impersonation state from localStorage:', {
            hasOriginalToken: !!storedOriginalToken,
            hasOriginalUser: !!storedOriginalUser,
            originalUserRole: JSON.parse(storedOriginalUser)?.role
          });
        } catch (error) {
          console.error('Error parsing stored original user:', error);
          // Clear invalid stored data
          localStorage.removeItem('originalToken');
          localStorage.removeItem('originalUser');
        }
      }
      
      // Fetch user data with better error handling
      apiGet('/api/auth/me', storedToken)
        .then((res) => {
          setUser(res.user);
          
          // Check if this is an impersonation scenario
          const hasOriginalData = storedOriginalToken && storedOriginalUser;
          const isImpersonationResponse = res.user?.impersonating || res.user?.original_admin_id;
          
          console.log('Auth state restoration:', {
            hasOriginalData,
            isImpersonationResponse,
            userRole: res.user?.role,
            userId: res.user?.id,
            impersonating: res.user?.impersonating,
            originalAdminId: res.user?.original_admin_id
          });
          
          // If we have original data in localStorage, treat this as impersonation state
          // regardless of backend response flags (backend might not send impersonation flags)
          if (hasOriginalData) {
            console.log('Restoring impersonation state from localStorage');
            // Keep the originalToken and originalUser from localStorage
            // The current user from API response is the impersonated user
          } else if (!isImpersonationResponse) {
            // Only set originalUser if we're not in an impersonation state
            setOriginalUser(res.user);
          }
          
          // Don't clean up impersonation data automatically - let user decide via stop impersonate
          
          // Final state logging - use stored values since state might not be updated yet
          console.log('Final auth state after restoration:', {
            currentUser: res.user?.full_name,
            currentRole: res.user?.role,
            isImpersonating: !!(storedOriginalToken || res.user?.impersonating),
            hasOriginalToken: !!storedOriginalToken,
            hasOriginalUser: !!storedOriginalUser,
            userObject: res.user // Log full user object untuk debugging
          });
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          // Don't logout immediately, let the global error handler deal with it
          // Only logout if it's a clear authentication error
          if (error.message?.includes('Sesi berakhir') || error.message?.includes('Unauthorized')) {
            logout();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Monitor user state changes untuk debugging
  useEffect(() => {
    console.log('User state changed:', {
      user: user?.full_name || 'undefined',
      userId: user?.id,
      role: user?.role,
      isImpersonating: !!(originalToken || user?.impersonating),
      hasOriginalToken: !!originalToken,
      hasOriginalUser: !!originalUser
    });
  }, [user, originalToken, originalUser]);

  // Show Dynamic Island ONLY after login (once per session)
  useEffect(() => {
    const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
    const isMaintenancePage = window.location.pathname === '/maintenance' || isMaintenanceMode;
    
    console.log('🔍 useEffect triggered with conditions:', {
      hasUser: !!user,
      hasFullName: !!user?.full_name,
      showWelcomeIsland,
      hasShownWelcome,
      isHiding,
      isLoginPage,
      isMaintenancePage,
      isMaintenanceMode,
      currentPath: window.location.pathname,
      shouldShow: user && !showWelcomeIsland && !hasShownWelcome && !isHiding && !isLoginPage && !isMaintenancePage
    });
    
    // ONLY show Dynamic Island if:
    // 1. User exists (logged in)
    // 2. Not already showing
    // 3. Haven't shown welcome yet in this session
    // 4. Not currently hiding
    // 5. NOT on login page
    
    // Hide Dynamic Island if on login page or maintenance mode
    if ((isLoginPage || isMaintenancePage) && showWelcomeIsland) {
      console.log('🚫 Login page or maintenance mode detected, hiding Dynamic Island');
      setShowWelcomeIsland(false);
      setIsHiding(false);
      setHasShownWelcome(false);
      return;
    }
    
    if (user && !showWelcomeIsland && !hasShownWelcome && !isHiding && !isLoginPage && !isMaintenancePage) {
      console.log('✅ Conditions met! User data available, showing Dynamic Island:', {
        full_name: user.full_name,
        firstLetter: user.full_name?.charAt(0)?.toUpperCase(),
        hasUserData: !!user
      });
      
      // Show welcome Dynamic Island
      console.log('🎬 Starting show animation...');
      setShowWelcomeIsland(true);
      setHasShownWelcome(true);
      localStorage.setItem('hasShownWelcome', 'true');
      
      // Start hide animation after 3 seconds
      console.log('⏱️ Setting timer for hide animation in 3 seconds...');
      console.log('🎯 Timer created at:', new Date().toLocaleTimeString());
      const hideTimer = setTimeout(() => {
        console.log('⏰ Timer fired! Starting hide animation...');
        setIsHiding(true);
        
        // Wait for hide animation to complete (600ms for smooth transition)
        const completeTimer = setTimeout(() => {
          console.log('✅ Hide animation complete, removing Dynamic Island');
          setShowWelcomeIsland(false);
          setIsHiding(false);
          console.log('🎉 Dynamic Island fully removed!');
        }, 600);
        
        return () => clearTimeout(completeTimer);
      }, 3000);
      
      return () => clearTimeout(hideTimer);
    }
  }, [user, hasShownWelcome, isHiding]);

  // Debug Dynamic Island state changes
  useEffect(() => {
    console.log('🔄 Dynamic Island state changed:', {
      showWelcomeIsland,
      isHiding,
      hasShownWelcome,
      userFullName: user?.full_name
    });
    
    // Force hide after 2.5 seconds for testing
    if (showWelcomeIsland && !isHiding) {
      console.log('🔄 Dynamic Island showing, will force hide in 2.5 seconds...');
      const forceHideTimer = setTimeout(() => {
        console.log('🔧 Force hiding Dynamic Island after 2.5 seconds - starting hide animation');
        setIsHiding(true); // Start hide animation first
        
        // Wait for hide animation to complete (600ms for smooth transition)
        const completeTimer = setTimeout(() => {
          console.log('🔧 Force hide animation complete, removing Dynamic Island');
          setShowWelcomeIsland(false);
          setIsHiding(false);
        }, 600);
        
        return () => clearTimeout(completeTimer);
      }, 2500);
      
      return () => clearTimeout(forceHideTimer);
    }
  }, [showWelcomeIsland, isHiding, hasShownWelcome, user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiPost('/api/auth/login', { email, password });
      
      // Check if response indicates success
      if (res.success === false) {
        throw new Error(res.message || 'Login gagal');
      }
      
      setToken(res.token);
      setUser(res.user);
      setOriginalUser(res.user); // Set original user saat login
      setOriginalToken(null); // Reset impersonate
      localStorage.setItem('token', res.token);
      
      // Clean up impersonation data from localStorage
      localStorage.removeItem('originalToken');
      localStorage.removeItem('originalUser');
      
      // Dynamic Island will be shown automatically by useEffect when user data is set
      console.log('Login successful, user data:', res.user);
      
    } catch (error: any) {
      // Handle rate limit error specifically
      if (error.message && error.message.includes('Rate limit')) {
        throw new Error('Terlalu banyak percobaan login. Coba lagi dalam 30 menit.');
      }
      
      // Handle other login errors
      if (error.message && error.message.includes('Email atau password salah')) {
        throw new Error('Email atau password salah');
      }
      
      // Generic error handling
      throw new Error(error.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOriginalUser(null);
    setOriginalToken(null);
    setShowWelcomeIsland(false); // Hide Dynamic Island on logout
    setHasShownWelcome(false); // Reset welcome flag for next login
    setIsHiding(false); // Reset hide animation state
    localStorage.removeItem('token');
    localStorage.removeItem('originalToken');
    localStorage.removeItem('originalUser');
    localStorage.removeItem('hasShownWelcome'); // Clear welcome flag for next session
  };

  const refreshUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiGet('/api/auth/me', token);
      setUser(res.user);
      // Jangan update originalUser saat refresh
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk update token (dipanggil dari API layer)
  const updateToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  // Impersonate: request token baru ke backend, simpan token admin asli, set token impersonate
  const impersonateUser = async (userId: string) => {
    if (!token || !isAdminKanwil) {
      throw new Error('Only admin kanwil can impersonate');
    }
    setLoading(true);
    try {
      // Always save current admin token and user as original (in case of re-impersonation)
      setOriginalToken(token);
      setOriginalUser(user);
      localStorage.setItem('originalToken', token);
      localStorage.setItem('originalUser', JSON.stringify(user));
      
      console.log('Starting impersonation for user:', userId);
      const res = await apiPost('/api/auth/impersonate', { userId }, token);
      
      // Update current token and user to impersonated ones
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      
      console.log('Impersonation started successfully:', {
        impersonatedUser: res.user?.full_name,
        originalAdmin: user?.full_name
      });
    } catch (error) {
      console.error('Failed to start impersonation:', error);
      // Clean up on error
      localStorage.removeItem('originalToken');
      localStorage.removeItem('originalUser');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Stop impersonate: call backend then restore token admin asli
  const stopImpersonating = async () => {
    const hasImpersonationData = originalToken && originalUser;
    const hasBackendImpersonationFlag = user?.impersonating || user?.original_admin_id;
    
    if (!token || (!hasImpersonationData && !hasBackendImpersonationFlag)) {
      console.log('No impersonation to stop:', { 
        hasToken: !!token, 
        hasImpersonationData,
        hasBackendImpersonationFlag,
        userImpersonating: user?.impersonating,
        originalAdminId: user?.original_admin_id
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log('Stopping impersonation...');
      
      // Try backend call first if we have impersonation token
      if (hasBackendImpersonationFlag) {
        try {
          const res = await apiPost('/api/auth/stop-impersonate', {}, token);
          console.log('Backend stop impersonation successful:', {
            adminName: res.user?.full_name,
            adminRole: res.user?.role,
            hasToken: !!res.token
          });
          
          // Restore admin token from backend response
          setToken(res.token);
          setUser(res.user);
          setOriginalToken(null);
          localStorage.setItem('token', res.token);
          
          // Clean up localStorage
          localStorage.removeItem('originalToken');
          localStorage.removeItem('originalUser');
          
          console.log('Impersonation stopped successfully via backend');
          
          // Force state update dengan setTimeout untuk memastikan state ter-update
          setTimeout(() => {
            console.log('Backend state update completed:', {
              currentUser: res.user?.full_name,
              currentRole: res.user?.role
            });
          }, 100);
          return;
        } catch (backendError) {
          console.warn('Backend stop impersonation failed, using fallback:', backendError);
        }
      }
      
      // Fallback: restore from stored original token and user
      if (hasImpersonationData) {
        console.log('Using fallback restore from localStorage');
        
        // Get fresh data from localStorage to ensure we have the latest
        const storedOriginalToken = localStorage.getItem('originalToken');
        const storedOriginalUser = localStorage.getItem('originalUser');
        
        if (storedOriginalToken && storedOriginalUser) {
          try {
            const parsedOriginalUser = JSON.parse(storedOriginalUser);
            console.log('Restoring admin from localStorage:', {
              adminName: parsedOriginalUser?.full_name,
              adminRole: parsedOriginalUser?.role
            });
            
            setToken(storedOriginalToken);
            setUser(parsedOriginalUser);
            setOriginalToken(null);
            localStorage.setItem('token', storedOriginalToken);
            
            // Clean up localStorage
            localStorage.removeItem('originalToken');
            localStorage.removeItem('originalUser');
            
            console.log('Impersonation stopped successfully via fallback');
            
            // Force state update dengan setTimeout untuk memastikan state ter-update
            setTimeout(() => {
              console.log('Fallback state update completed:', {
                currentUser: parsedOriginalUser?.full_name,
                currentRole: parsedOriginalUser?.role
              });
            }, 100);
          } catch (parseError) {
            console.error('Error parsing original user in fallback:', parseError);
            throw new Error('Failed to parse original user data');
          }
        } else {
          throw new Error('Original user data not found in localStorage');
        }
      } else {
        throw new Error('No impersonation data available to restore');
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      // Last resort: clear everything and redirect to login
      console.log('Last resort: clearing all auth data');
      logout();
      throw new Error('Failed to stop impersonation. Please login again.');
    } finally {
      setLoading(false);
    }
  };

    const isImpersonating = !!originalToken || !!user?.impersonating;
  const isAdminKanwil = user?.role === 'admin' && user?.office_id === null;

  // Create Welcome Scene dynamically with user data
  const createWelcomeScene = (userData: User | null) => makeScene('Welcome', {
    mode: IslandMode.LARGE,
    left: (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '12px 16px',
        minWidth: 'fit-content',
        width: 'auto'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#34c759',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {userData?.full_name?.charAt(0)?.toUpperCase() || userData?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span style={{ 
          fontSize: '16px', 
          color: '#fff', 
          fontWeight: '500',
          whiteSpace: 'nowrap'
        }}>
          Selamat Datang
        </span>
      </div>
    ),
    right: (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '12px 16px',
        minWidth: 'fit-content',
        width: 'auto'
      }}>
        <span style={{ 
          fontSize: '16px', 
          color: '#fff', 
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}>
          {userData?.full_name || userData?.email?.split('@')[0] || 'User'}
        </span>
      </div>
    ),
  });

  // Only create WelcomeScene when user data is available
  console.log('🎭 Creating WelcomeScene with user:', {
    userFullName: user?.full_name,
    userExists: !!user,
    firstLetter: user?.full_name?.charAt(0)?.toUpperCase()
  });
  const WelcomeScene = user ? createWelcomeScene(user) : null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      originalUser,
      token,
      loading,
      login,
      logout,
      refreshUser,
      isAuthenticated: !!user && !!token,
      isImpersonating,
      isAdminKanwil,
      impersonateUser,
      stopImpersonating,
      updateToken,
      isMaintenanceMode,
      maintenanceMessage
    }}>
      {children}
      
      {/* Dynamic Island Welcome Message */}
      {WelcomeScene && (
        <DynamicIsland 
          scenes={[WelcomeScene]} 
          currentSceneName={showWelcomeIsland ? 'Welcome' : null}
          isHiding={isHiding}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Extend Window interface untuk TypeScript
declare global {
  interface Window {
    dispatchTokenUpdate?: (token: string) => void;
  }
}
