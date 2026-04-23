import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('zxcom_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('zxcom_token'));

  const persist = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('zxcom_user', JSON.stringify(userData));
    localStorage.setItem('zxcom_token', authToken);
  }, []);

  const login = useCallback(async (phone, password) => {
    const { data: res } = await api.post('/auth/login', { phone, password });
    const { user: userData, token: authToken } = res.data;
    persist(userData, authToken);
    return res;
  }, [persist]);

  const register = useCallback(async (formData) => {
    const { data: res } = await api.post('/auth/register', formData);
    const { user: userData, token: authToken } = res.data;
    persist(userData, authToken);
    return res;
  }, [persist]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('zxcom_user');
    localStorage.removeItem('zxcom_token');
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
