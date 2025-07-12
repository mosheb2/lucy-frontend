import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/api/client';
// Import the fixed Supabase client
import { supabase } from '@/api/supabase-auth-fixed';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Function to fetch and merge user profile data
  const fetchUserWithProfile = async (authUser) => {
    if (!authUser) return null;
    
    try {
      // The backend already returns user with profile data merged
      return {
        ...authUser,
        // Map profile fields to expected field names
        profile_image_url: authUser.avatar_url || authUser.profile_image_url,
        artist_name: authUser.artist_name || authUser.full_name,
        full_name: authUser.full_name,
        bio: authUser.bio,
        genre: authUser.genre,
        website: authUser.website,
        location: authUser.location,
        verified: authUser.is_verified,
        role: authUser.role
      };
    } catch (error) {
      console.error('Error in fetchUserWithProfile:', error);
      return authUser; // Return auth user without profile if anything fails
    }
  };

  // Check for a Supabase session directly
  const checkSupabaseSession = async () => {
    try {
      console.log('Checking for Supabase session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting Supabase session:', error);
        return null;
      }
      
      if (data?.session) {
        console.log('Found valid Supabase session:', { 
          userId: data.session.user.id,
          expiresAt: new Date(data.session.expires_at * 1000).toISOString()
        });
        return data.session;
      } else {
        console.log('No valid Supabase session found');
        return null;
      }
    } catch (error) {
      console.error('Error checking Supabase session:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        // Check if we have a token in localStorage
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userAuthenticated = localStorage.getItem('user_authenticated');
        const supabaseSessionData = localStorage.getItem('supabase_session');
        
        console.log('Auth state from localStorage:', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken,
          userAuthenticated,
          hasSupabaseSession: !!supabaseSessionData
        });

        // First, try to restore the Supabase session
        let supabaseSession = null;
        if (supabaseSessionData) {
          try {
            const parsedSession = JSON.parse(supabaseSessionData);
            console.log('Found Supabase session in localStorage, attempting to restore');
            
            // Check if session is expired
            const expiresAt = parsedSession.expires_at * 1000; // Convert to milliseconds
            const now = Date.now();
            
            if (expiresAt <= now) {
              console.log('Stored Supabase session is expired');
            } else {
              // Try to set the session in Supabase
              const { data, error } = await supabase.auth.setSession({
                access_token: parsedSession.access_token,
                refresh_token: parsedSession.refresh_token
              });
              
              if (error) {
                console.error('Error setting Supabase session:', error);
              } else if (data?.session) {
                console.log('Successfully restored Supabase session');
                supabaseSession = data.session;
              }
            }
          } catch (error) {
            console.error('Error parsing or restoring Supabase session:', error);
          }
        }

        // If we have a Supabase session, use it
        if (supabaseSession) {
          console.log('Using restored Supabase session');
          apiClient.setToken(supabaseSession.access_token);
          
          // Get user data
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error getting user data from restored session:', userError);
            setAuthError('Failed to get user data');
          } else if (userData?.user) {
            console.log('Got user data from restored session:', userData.user.id);
            const userWithProfile = await fetchUserWithProfile(userData.user);
            setUser(userWithProfile);
            
            // Update localStorage
            localStorage.setItem('auth_token', supabaseSession.access_token);
            localStorage.setItem('refresh_token', supabaseSession.refresh_token);
            localStorage.setItem('user_authenticated', 'true');
            localStorage.setItem('user_id', userData.user.id);
            
            console.log('Authentication restored from Supabase session');
            setLoading(false);
            return;
          }
        }
        
        // If no Supabase session or it failed, try to get a new session from Supabase
        if (!supabaseSession) {
          console.log('No restored session, checking for current Supabase session');
          const currentSession = await checkSupabaseSession();
          
          if (currentSession) {
            console.log('Found current Supabase session, using it');
            apiClient.setToken(currentSession.access_token);
            
            // Store tokens in localStorage
            localStorage.setItem('auth_token', currentSession.access_token);
            localStorage.setItem('refresh_token', currentSession.refresh_token);
            localStorage.setItem('user_authenticated', 'true');
            localStorage.setItem('user_id', currentSession.user.id);
            localStorage.setItem('supabase_session', JSON.stringify({
              access_token: currentSession.access_token,
              refresh_token: currentSession.refresh_token,
              expires_at: currentSession.expires_at
            }));
            
            // Get user data
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error('Error getting user data from current session:', userError);
              setAuthError('Failed to get user data');
            } else if (userData?.user) {
              console.log('Got user data from current session:', userData.user.id);
              const userWithProfile = await fetchUserWithProfile(userData.user);
              setUser(userWithProfile);
              
              console.log('Authentication established from current Supabase session');
              setLoading(false);
              return;
            }
          }
        }
        
        // If we still don't have a session, try the API token approach
        if (token) {
          apiClient.setToken(token);
          
          try {
            // Try to get current user from backend
            console.log('Attempting to get current user with API token');
            const userData = await apiClient.getCurrentUser();
            const userWithProfile = await fetchUserWithProfile(userData.user);
            console.log('Successfully retrieved user data:', userWithProfile);
            setUser(userWithProfile);
            
            // Update localStorage
            localStorage.setItem('user_authenticated', 'true');
            localStorage.setItem('user_id', userData.user.id);
            
            console.log('Authentication established from API token');
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error getting user with token:', error);
            
            // Clear invalid token
            localStorage.removeItem('auth_token');
            apiClient.clearToken();
            
            setAuthError('Session expired. Please login again.');
          }
        }
        
        // If we get here, user is not authenticated
        console.log('No valid authentication found');
        setUser(null);
        clearAuthData();
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthError('Failed to initialize session');
        setUser(null);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    // Clear auth data from localStorage
    const clearAuthData = () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_id');
      localStorage.removeItem('supabase_session');
      apiClient.clearToken();
    };

    // Set up Supabase auth listener
    const setupSupabaseAuthListener = () => {
      console.log('Setting up Supabase auth listener');
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Supabase auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in via Supabase:', session.user.id);
          
          // Set token for API calls
          apiClient.setToken(session.access_token);
          
          // Store tokens in localStorage
          localStorage.setItem('auth_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);
          localStorage.setItem('user_authenticated', 'true');
          localStorage.setItem('user_id', session.user.id);
          localStorage.setItem('supabase_session', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          }));
          
          // Get user data
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error getting user data after sign in:', userError);
            setAuthError('Failed to get user data');
          } else if (userData?.user) {
            console.log('Got user data after sign in:', userData.user.id);
            const userWithProfile = await fetchUserWithProfile(userData.user);
            setUser(userWithProfile);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out via Supabase');
          setUser(null);
          clearAuthData();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Supabase token refreshed');
          
          // Update token for API calls
          apiClient.setToken(session.access_token);
          
          // Update tokens in localStorage
          localStorage.setItem('auth_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);
          localStorage.setItem('supabase_session', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          }));
        }
      });
      
      return subscription;
    };

    // Initialize
    getInitialSession();
    const subscription = setupSupabaseAuthListener();
    
    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Update user
  const updateUser = (newUser) => {
    setUser(newUser);
  };

  // Sign in
  const signIn = async (credentials) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        console.error('Error signing in:', error);
        setAuthError(error.message);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception during sign in:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign up
  const signUp = async (userData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp(userData);
      
      if (error) {
        console.error('Error signing up:', error);
        setAuthError(error.message);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception during sign up:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      clearAuthData();
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_id');
    localStorage.removeItem('supabase_session');
    apiClient.clearToken();
  };

  // Sign in with OAuth
  const signInWithOAuth = async (provider) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Error signing in with OAuth:', error);
        setAuthError(error.message);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception during OAuth sign in:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('Error resetting password:', error);
        setAuthError(error.message);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception during password reset:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Error updating password:', error);
        setAuthError(error.message);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception during password update:', error);
      setAuthError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    updateUser,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    clearAuthError: () => setAuthError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 