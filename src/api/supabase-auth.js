import { createClient } from '@supabase/supabase-js';

// Fixed Supabase credentials - using hardcoded values to ensure they're correct
// Remove any line breaks that might have been introduced in the .env file
const supabaseUrl = 'https://bxgdijqjdtbgzycvngug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.T_KZxQHOxYvgIYLGpDXVqCj9Vgdp8YFvgSt0JHsLvAc';

console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Log Supabase initialization
console.log('Supabase client initialized');

// Auth state management
let authStateChangeListener = null;

export const auth = {
  // Get current session
  getSession: async () => {
    console.log('Getting session from Supabase');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session result:', { hasSession: !!session, error: error?.message });
    if (error) throw error;
    return session;
  },

  // Get current user
  getUser: async () => {
    console.log('Getting user from Supabase');
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('User result:', { hasUser: !!user, error: error?.message });
    if (error) throw error;
    return user;
  },

  // Sign up with email and password
  signUp: async ({ email, password, full_name, username }) => {
    console.log('Signing up with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          username,
        },
        emailRedirectTo: `${window.location.origin}/Dashboard`
      }
    });
    
    console.log('Sign up result:', { success: !!data?.user, error: error?.message });
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  signIn: async ({ email, password }) => {
    console.log('Signing in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('Sign in result:', { success: !!data?.user, error: error?.message });
    if (error) throw error;
    return data;
  },

  // Sign in with OAuth provider
  signInWithOAuth: async (provider) => {
    console.log('Signing in with OAuth provider:', provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    console.log('OAuth sign in result:', { success: !!data?.url, error: error?.message });
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    console.log('Signing out');
    const { error } = await supabase.auth.signOut();
    console.log('Sign out result:', { error: error?.message });
    if (error) throw error;
  },

  // Reset password
  resetPassword: async (email) => {
    console.log('Resetting password for email:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/Dashboard`
    });
    
    console.log('Reset password result:', { error: error?.message });
    if (error) throw error;
  },

  // Update password
  updatePassword: async (password) => {
    console.log('Updating password');
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    console.log('Update password result:', { error: error?.message });
    if (error) throw error;
  },

  // Update user profile
  updateProfile: async (updates) => {
    console.log('Updating user profile');
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    
    console.log('Update profile result:', { success: !!data?.user, error: error?.message });
    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    console.log('Setting up auth state change listener');
    if (authStateChangeListener) {
      supabase.auth.removeAuthStateChangeListener(authStateChangeListener);
    }
    
    authStateChangeListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, hasSession: !!session });
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
    const session = await auth.getSession();
    const isAuth = !!session;
    console.log('Authentication check result:', { isAuthenticated: isAuth });
    return isAuth;
  }
};

// Helper function to get user profile from Supabase
export const getUserProfile = async (userId) => {
  console.log('Getting user profile for ID:', userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  console.log('Get user profile result:', { success: !!data, error: error?.message });
  if (error) throw error;
  return data;
};

// Helper function to update user profile in Supabase
export const updateUserProfile = async (userId, updates) => {
  console.log('Updating user profile for ID:', userId);
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  console.log('Update user profile result:', { success: !!data, error: error?.message });
  if (error) throw error;
  return data;
};

export default auth; 