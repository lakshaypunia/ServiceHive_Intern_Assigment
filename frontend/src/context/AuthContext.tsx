import { createContext, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User, AuthResponse } from '../types';
import {
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from '../utils/token';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setTokenState] = useState<string | null>(getToken);

  const login = (data: AuthResponse) => {
    queryClient.clear(); // wipe previous user's cached data before setting new session
    setToken(data.token);
    setStoredUser(data.user);
    setTokenState(data.token);
    setUser(data.user);
  };

  const logout = () => {
    queryClient.clear(); // wipe all cached queries so next login starts fresh
    clearToken();
    clearStoredUser();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
