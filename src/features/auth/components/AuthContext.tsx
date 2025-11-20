import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {loginApi, registerApi} from "../api/authApi";
import {AuthContextType} from "../types/auth.types";
import {User} from "@supabase/supabase-js";


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('cine_user');
    const savedToken = localStorage.getItem('cine_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginApi(email, password);
      setUser(data.user);
      localStorage.setItem('cine_user', JSON.stringify(data.user));
      localStorage.setItem('cine_token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const data = await registerApi(email, password, name);
      setUser(data.user);
      localStorage.setItem('cine_user', JSON.stringify(data.user));
      localStorage.setItem('cine_token', data.token);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cine_user');
    localStorage.removeItem('cine_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('cine_token');
}
