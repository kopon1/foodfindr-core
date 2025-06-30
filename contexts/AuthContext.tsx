import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Session, User, AuthResponse } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Key for caching user data
const USER_CACHE_KEY = 'foodfindr_user_cache';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cached user on startup for instant UI display
  const loadCachedUser = async () => {
    try {
      const cachedUserData = await AsyncStorage.getItem(USER_CACHE_KEY);
      if (cachedUserData) {
        const userData = JSON.parse(cachedUserData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading cached user:', error);
    }
  };

  // Cache user data for faster startup
  const cacheUserData = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(USER_CACHE_KEY);
      }
    } catch (error) {
      console.error('Error caching user data:', error);
    }
  };

  // Refresh the session and user data
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get the current session
      const currentSession = await authService.getSession();
      setSession(currentSession);
      
      // Get the current user
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // Cache user data for faster startup next time
      await cacheUserData(currentUser);
      
      return currentUser;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Load cached user first for instant UI
        await loadCachedUser();
        
        // Then refresh from network
        await refreshSession();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: authListener } = authService.subscribeToAuthChanges(async (event, session) => {
      console.log('Auth event:', event);
      setSession(session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = session?.user || null;
        setUser(currentUser);
        await cacheUserData(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        await cacheUserData(null);
      }
    });

    // Cleanup
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [refreshSession]);

  // Sign in handler
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const result = await authService.signIn({ email, password });
      
      // Update user and session immediately for better UX
      if (result.data?.user) {
        setUser(result.data.user);
        setSession(result.data.session);
        await cacheUserData(result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const signUp = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const result = await authService.signUp({ email, password, name });
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setSession(null);
      await cacheUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password handler
  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const value: AuthContextProps = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
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