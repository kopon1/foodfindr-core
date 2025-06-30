import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://sojwkivmwocivygnglth.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvandraXZtd29jaXZ5Z25nbHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTA2MzksImV4cCI6MjA2Njg4NjYzOX0.QG7qIqY9Vvc4Q65xIm1DX9TLuf3I6OiIFXN36vrGIuI';

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 