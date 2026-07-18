'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('taskflow-token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/users/me')
      .then((res) => setUser(res.data.data))
      .catch(() => window.localStorage.removeItem('taskflow-token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    window.localStorage.setItem('taskflow-token', res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    window.localStorage.removeItem('taskflow-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
