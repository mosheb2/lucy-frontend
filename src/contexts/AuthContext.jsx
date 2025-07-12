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
    }, 15000); // 15 seconds timeout

    // Function to get the current session and user
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get the current session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        // If we have a session, set it and get the user
        if (data?.session) {
          setSession(data.session);
          
          // Get user data
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error getting user:', userError);
            setError(userError.message);
          } else if (userData?.user) {
            setUser(userData.user);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          
          if (currentSession) {
            // Get user data
            const { data, error } = await supabase.auth.getUser();
            
            if (error) {
              console.error('Error getting user after auth change:', error);
            } else if (data?.user) {
              setUser(data.user);
              // Ensure loading is set to false when user is set
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        } else if (event === 'USER_UPDATED') {
          // Refresh user data when updated
          const { data, error } = await supabase.auth.getUser();
          if (!error && data?.user) {
            setUser(data.user);
          }
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
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 