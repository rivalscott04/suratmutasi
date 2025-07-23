
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiPost, apiGet } from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user';
  office_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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
      localStorage.setItem('token', res.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiGet('/api/auth/me', token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
