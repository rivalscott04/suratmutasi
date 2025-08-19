
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiPost, apiGet } from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user';
  office_id?: string | null;
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
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [originalToken, setOriginalToken] = useState<string | null>(null); // token admin asli
  const [loading, setLoading] = useState(true);

  // Setup window functions untuk refresh token
  useEffect(() => {
    // Fungsi untuk update token dari API layer
    window.dispatchTokenUpdate = (newToken: string) => {
      setToken(newToken);
      localStorage.setItem('token', newToken);
    };

    // Fungsi untuk show session expired modal
    window.showSessionExpiredModal = () => {
      logout();
      // Redirect ke login page
      window.location.href = '/';
    };

    return () => {
      delete window.dispatchTokenUpdate;
      delete window.showSessionExpiredModal;
    };
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedOriginalToken = localStorage.getItem('originalToken');
    const storedOriginalUser = localStorage.getItem('originalUser');
    
    if (storedToken) {
      setToken(storedToken);
      
      // Restore original token and user if they exist (for impersonation)
      if (storedOriginalToken && storedOriginalUser) {
        try {
          setOriginalToken(storedOriginalToken);
          setOriginalUser(JSON.parse(storedOriginalUser));
        } catch (error) {
          console.error('Error parsing stored original user:', error);
          // Clear invalid stored data
          localStorage.removeItem('originalToken');
          localStorage.removeItem('originalUser');
        }
      }
      
      apiGet('/api/auth/me', storedToken)
        .then((res) => {
          setUser(res.user);
          // Jika user sudah login dan tidak ada originalUser, set originalUser
          if (!originalUser && !storedOriginalUser) {
            setOriginalUser(res.user);
          }
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiPost('/api/auth/login', { email, password });
      setToken(res.token);
      setUser(res.user);
      setOriginalUser(res.user); // Set original user saat login
      setOriginalToken(null); // Reset impersonate
      localStorage.setItem('token', res.token);
      
      // Clean up impersonation data from localStorage
      localStorage.removeItem('originalToken');
      localStorage.removeItem('originalUser');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOriginalUser(null);
    setOriginalToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('originalToken');
    localStorage.removeItem('originalUser');
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
      // Simpan token admin asli jika belum
      if (!originalToken) {
        setOriginalToken(token);
        localStorage.setItem('originalToken', token);
      }
      
      // Simpan original user jika belum
      if (!originalUser) {
        setOriginalUser(user);
        localStorage.setItem('originalUser', JSON.stringify(user));
      }
      
      const res = await apiPost('/api/auth/impersonate', { userId }, token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      
      console.log('Impersonation started:', res.impersonation);
    } finally {
      setLoading(false);
    }
  };

  // Stop impersonate: call backend then restore token admin asli
  const stopImpersonating = async () => {
    if (!token || (!user?.impersonating && !originalToken)) {
      console.log('No impersonation to stop:', { 
        hasToken: !!token, 
        userImpersonating: user?.impersonating, 
        hasOriginalToken: !!originalToken 
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log('Stopping impersonation...');
      // Call backend to stop impersonation
      const res = await apiPost('/api/auth/stop-impersonate', {}, token);
      
      // Restore admin token
      setToken(res.token);
      setUser(res.user);
      setOriginalToken(null);
      localStorage.setItem('token', res.token);
      
      // Clean up localStorage
      localStorage.removeItem('originalToken');
      localStorage.removeItem('originalUser');
      
      console.log('Impersonation stopped successfully');
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      // Fallback: restore from stored token
      if (originalToken && originalUser) {
        console.log('Using fallback restore');
        setToken(originalToken);
        setUser(originalUser);
        setOriginalToken(null);
        localStorage.setItem('token', originalToken);
        
        // Clean up localStorage
        localStorage.removeItem('originalToken');
        localStorage.removeItem('originalUser');
      }
    } finally {
      setLoading(false);
    }
  };

    const isImpersonating = !!originalToken || !!user?.impersonating;
  const isAdminKanwil = user?.role === 'admin' && user?.office_id === null;

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
      updateToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Extend Window interface untuk TypeScript
declare global {
  interface Window {
    dispatchTokenUpdate?: (token: string) => void;
    showSessionExpiredModal?: () => void;
  }
}
