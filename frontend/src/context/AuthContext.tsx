import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { login as authLogin, logout as authLogout, getCurrentUser } from '../lib/authService';

interface LoginResponse {
  token: string;
  type: string;
  email: string;
  displayName: string;
  role: string;
  id: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ data: LoginResponse | null; error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await authLogin(email, password);
      
      if (error) throw error;
      
      if (data) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Failed to sign in') };
    }
  };

  const handleSignOut = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};