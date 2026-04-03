import React, { createContext, useContext, useState, ReactNode } from 'react';

import authService from '../services/authService';

interface User {
  id: string;
  name?: string;
  email?: string;
  role: 'Company' | 'Admin' | 'MSME' | 'Aggregator' | 'Verifier' | string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const data = await authService.login(email, password);
        if (data.success && data.token) {
            setUser(authService.getStoredUser());
            return true;
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};