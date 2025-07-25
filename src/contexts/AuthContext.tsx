
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiPost, apiGet } from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user';
  office_id?: string;
  kabkota?: string;
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
  impersonateUser: (user: User) => void;
  stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [originalToken, setOriginalToken] = useState<string | null>(null); // token admin asli
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      apiGet('/api/auth/me', storedToken)
        .then((res) => setUser(res.user))
        .catch(() => logout())
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

  // Impersonate: request token baru ke backend, simpan token admin asli, set token impersonate
  const impersonateUser = async (userToImpersonate: User) => {
    if (!token) return;
    setLoading(true);
    try {
      // Simpan token admin asli jika belum
      if (!originalToken) setOriginalToken(token);
      const res = await apiPost('/api/auth/impersonate', { userId: userToImpersonate.id }, token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
    } finally {
      setLoading(false);
    }
  };

  // Stop impersonate: restore token admin asli
  const stopImpersonating = async () => {
    if (originalToken) {
      setToken(originalToken);
      localStorage.setItem('token', originalToken);
      setOriginalToken(null);
      setLoading(true);
      try {
        const res = await apiGet('/api/auth/me', originalToken);
        setUser(res.user);
      } finally {
        setLoading(false);
      }
    }
  };

  const isImpersonating = !!originalToken;

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
      impersonateUser,
      stopImpersonating
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
