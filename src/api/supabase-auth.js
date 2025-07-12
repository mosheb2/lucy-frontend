import { createClient } from '@supabase/supabase-js';

// Get environment variables from either import.meta.env (Vite dev) or process.env (Node.js production)
const env = typeof import.meta !== 'undefined' ? import.meta.env : process.env;

// Get Supabase configuration
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://bxgdijqjdtbgzycvngug.supabase.co';
// Make sure the anon key doesn't have any line breaks or extra whitespace
let supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.axSb9Ew1TelVzo-4EsbWO8vxYjuU_0FAxWMpbWrgfIw';

// Remove any newlines or extra whitespace
supabaseAnonKey = supabaseAnonKey.replace(/[\r\n\s]+/g, '').trim();

// Use a consistent storage key across the application
const STORAGE_KEY = 'supabase.auth.token';

// Log configuration for debugging
console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  keyFirstChars: supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'none',
  envVars: typeof import.meta !== 'undefined' ? Object.keys(import.meta.env).filter(key => key.includes('SUPABASE')) : Object.keys(process.env).filter(key => key.includes('SUPABASE'))
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. URL or key is undefined.', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

// Export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: STORAGE_KEY
  }
});

// Test the client
try {
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  throw error;
}

// Auth state management
let authStateChangeListener = null;

export const auth = {
  // Get current session
  getSession: async () => {
    console.log('Getting session from Supabase');
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Session result:', { hasSession: !!data?.session, error: error?.message });
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  },

  // Get current user
  getUser: async () => {
    console.log('Getting user from Supabase');
    try {
      const { data, error } = await supabase.auth.getUser();
      console.log('User result:', { hasUser: !!data?.user, error: error?.message });
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Sign up with email and password
  signUp: async ({ email, password, full_name, username }) => {
    console.log('Signing up with email:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      console.log('Sign up result:', { success: !!data?.user, error: error?.message });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  },

  // Sign in with email and password
  signIn: async ({ email, password }) => {
    console.log('Signing in with email:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Sign in result:', { success: !!data?.user, error: error?.message });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error during signin:', error);
      throw error;
    }
  },

  // Sign in with OAuth provider
  signInWithOAuth: async (provider) => {
    console.log('Signing in with OAuth provider:', provider);
    
    try {
      // Map provider names to match Supabase's expected format
      const providerMap = {
        'facebook': 'facebook',
        'google': 'google',
        'solana': 'solana'
      };
      
      const mappedProvider = providerMap[provider.toLowerCase()] || provider;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: mappedProvider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      console.log('OAuth sign in result:', { success: !!data?.url, error: error?.message });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error during OAuth signin:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    console.log('Signing out');
    try {
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', { error: error?.message });
      if (error) throw error;
    } catch (error) {
      console.error('Error during signout:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email) => {
    console.log('Resetting password for email:', email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      console.log('Reset password result:', { error: error?.message });
      if (error) throw error;
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (password) => {
    console.log('Updating password');
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      console.log('Update password result:', { error: error?.message });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    console.log('Updating user profile');
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      console.log('Update profile result:', { success: !!data?.user, error: error?.message });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    console.log('Setting up auth state change listener');
    if (authStateChangeListener) {
      supabase.auth.removeAuthStateChangeListener(authStateChangeListener);
    }
    
    authStateChangeListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, hasSession: !!session });
      
      // Store session data in localStorage for persistence
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        }));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(STORAGE_KEY);
      }
      
      callback(event, session);
    });
    
    return () => {
      if (authStateChangeListener) {
        supabase.auth.removeAuthStateChangeListener(authStateChangeListener);
        authStateChangeListener = null;
      }
    };
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    console.log('Checking if user is authenticated');
    try {
      const session = await auth.getSession();
      const isAuth = !!session;
      console.log('Authentication check result:', { isAuthenticated: isAuth });
      return isAuth;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
  
  // Restore session from localStorage
  restoreSession: async () => {
    console.log('Attempting to restore session from localStorage');
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      if (!storedSession) {
        console.log('No stored session found');
        return null;
      }
      
      const parsedSession = JSON.parse(storedSession);
      console.log('Found stored session, attempting to restore');
      
      // Check if session is expired
      const expiresAt = parsedSession.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (expiresAt <= now) {
        console.log('Stored session is expired');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      // Try to set the session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: parsedSession.access_token,
        refresh_token: parsedSession.refresh_token
      });
      
      if (error) {
        console.error('Error setting session:', error);
        return null;
      }
      
      console.log('Session restored successfully');
      return data.session;
    } catch (error) {
      console.error('Error restoring session:', error);
      return null;
    }
  }
};

// Helper functions for user profiles
export const getUserProfile = async (userId) => {
  console.log('Getting user profile for ID:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  console.log('Updating user profile for ID:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}; 