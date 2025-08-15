import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

export type AuthUser = {
  id?: string;
  name: string;
  username?: string; // distinct username
  email?: string;
  role?: 'user' | 'admin';
  isGuest: boolean;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: { name: string; email: string; password: string; username?: string }) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const AUTH_USER_KEY = 'auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthUser;
        if (!parsed.isGuest) setUser(parsed);
      } catch (_) {
        // ignore
      }
    }
  }, []);

  // Auto guest login when no user is present
  useEffect(() => {
    if (user === null) {
      setUser({ name: 'Guest', isGuest: true });
    }
  }, [user]);

  useEffect(() => {
    if (user && !user.isGuest) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_USER_KEY);
    }
  }, [user]);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await api<{ id: string; name: string; username?: string; email?: string; role?: 'user' | 'admin' }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (error || !data) {
      const err: any = new Error('auth.error.invalidCredentials');
      err.code = 'auth.error.invalidCredentials';
      throw err;
    }
    setUser({ id: data.id, name: data.name, username: data.username, email: data.email, role: (data as any).role || 'user', isGuest: false });
  };

  const signup = async ({ name, email, password, username }: { name: string; email: string; password: string; username?: string }) => {
    const uname = username || email.split('@')[0];
    const { data, error } = await api<{ id: string; name: string; username?: string; email?: string; role?: 'user' | 'admin' }>(`/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, username: uname }),
    });
    if (error || !data) {
      const err: any = new Error('auth.error.emailExists');
      err.code = 'auth.error.emailExists';
      throw err;
    }
    setUser({ id: data.id, name: data.name, username: data.username, email: data.email, role: (data as any).role || 'user', isGuest: false });
  };

  const loginAsGuest = async () => {
    setUser({ name: 'Gast', isGuest: true });
  };

  const logout = () => {
    setUser(null);
    // Fire and forget to clear cookie
    api(`/auth/logout`, { method: 'POST' });
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    login,
    signup,
    loginAsGuest,
    logout,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};