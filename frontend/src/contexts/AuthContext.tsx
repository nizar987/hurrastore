'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authAPI, setAuthToken, setUser, getUser, removeAuthToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = getUser();

      if (token && savedUser) {
        try {
          const response = await authAPI.getCurrentUser();
          setUserState(response.user);
          setUser(response.user);
        } catch (error) {
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setAuthToken(response.token);
    setUser(response.user);
    setUserState(response.user);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await authAPI.register({ email, password, firstName, lastName });
    setAuthToken(response.token);
    setUser(response.user);
    setUserState(response.user);
  };

  const logout = () => {
    removeAuthToken();
    setUserState(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
