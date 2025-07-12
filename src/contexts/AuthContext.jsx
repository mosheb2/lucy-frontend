import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/api/supabase-auth-fixed';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on component mount
  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout reached');
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    // Function to get the current session and user
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        // If we have a session, get the user
        if (currentSession) {
          console.log('Session found, getting user...');
          setSession(currentSession);
          
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error getting user:', userError);
            setError(userError.message);
            setLoading(false);
            return;
          }
          
          if (currentUser) {
            console.log('User found:', currentUser.id);
            
            // Get user profile data from the profiles table
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();
              
              if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error getting profile:', profileError);
              }
              
              // Combine auth user with profile data
              const userWithProfile = {
                ...currentUser,
                ...profileData,
                // Ensure these fields are available with fallbacks
                full_name: profileData?.full_name || currentUser.user_metadata?.full_name,
                username: profileData?.username || currentUser.user_metadata?.username,
                avatar_url: profileData?.avatar_url,
                role: profileData?.role || 'user'
              };
              
              setUser(userWithProfile);
            } catch (profileError) {
              console.error('Exception getting profile:', profileError);
              // Still set the user even if profile fetch fails
              setUser(currentUser);
            }
          } else {
            console.log('No user found despite having a session');
            setUser(null);
          }
        } else {
          console.log('No session found');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Exception in initializeAuth:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (currentSession) {
            try {
              // Get user data
              const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
              
              if (userError) {
                console.error('Error getting user after auth change:', userError);
                return;
              }
              
              if (currentUser) {
                // Get user profile data
                try {
                  const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                  
                  if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error getting profile after auth change:', profileError);
                  }
                  
                  // Combine auth user with profile data
                  const userWithProfile = {
                    ...currentUser,
                    ...profileData,
                    // Ensure these fields are available with fallbacks
                    full_name: profileData?.full_name || currentUser.user_metadata?.full_name,
                    username: profileData?.username || currentUser.user_metadata?.username,
                    avatar_url: profileData?.avatar_url,
                    role: profileData?.role || 'user'
                  };
                  
                  setUser(userWithProfile);
                } catch (profileError) {
                  console.error('Exception getting profile after auth change:', profileError);
                  // Still set the user even if profile fetch fails
                  setUser(currentUser);
                }
              }
            } catch (error) {
              console.error('Exception handling auth state change:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Cleanup
    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (credentials) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        setError(error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in signIn:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (userData) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in signUp:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign in with OAuth provider
  const signInWithOAuth = async (provider) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in signInWithOAuth:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        throw error;
      }
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error in resetPassword:', error);
      setError(error.message);
      throw error;
    }
  };

  // Update user
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Value to provide in context
  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 