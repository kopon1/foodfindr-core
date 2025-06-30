import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/authService';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize: Get current session and user
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const currentSession = await authService.getSession();
        setSession(currentSession);
        
        // Get the current user
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: authListener } = authService.subscribeToAuthChanges((event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    // Cleanup
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signIn({ email, password });
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      await authService.signUp({ email, password, name });
    } finally {
      setLoading(false);
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  // Reset password handler
  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 