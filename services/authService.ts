import { supabase } from './supabaseClient';
import { AuthResponse } from '@supabase/supabase-js';

interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

class AuthService {
  async signUp({ email, password, name }: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async signIn({ email, password }: SignInCredentials): Promise<AuthResponse> {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) throw response.error;
      return response;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'foodfindr://reset-password',
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  subscribeToAuthChanges(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService(); 