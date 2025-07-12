import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { supabase } from '@/api/supabase-auth';

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
            console.log('Updated authentication state in localStorage');
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error getting current user with API token:', error);
            
            // Try to refresh the token if we have a refresh token
            if (refreshToken) {
              try {
                console.log('Attempting to refresh token on startup');
                const refreshResponse = await apiClient.refreshToken(refreshToken);
                
                if (refreshResponse && refreshResponse.session?.access_token) {
                  // Successfully refreshed, try to get user again
                  console.log('Token refreshed successfully, getting user data');
                  const userData = await apiClient.getCurrentUser();
                  const userWithProfile = await fetchUserWithProfile(userData.user);
                  setUser(userWithProfile);
                  
                  // Update localStorage
                  localStorage.setItem('user_authenticated', 'true');
                  localStorage.setItem('user_id', userData.user.id);
                  console.log('Updated authentication state after token refresh');
                  setLoading(false);
                  return;
                } else {
                  // Refresh failed, clear auth data
                  console.log('Token refresh failed, clearing auth data');
                  clearAuthData();
                }
              } catch (refreshError) {
                console.error('Failed to refresh token on startup:', refreshError);
                clearAuthData();
              }
            } else {
              // No refresh token, clear auth data
              console.log('No refresh token available, clearing auth data');
              clearAuthData();
            }
          }
        } else {
          console.log('No authentication data found, user is not logged in');
          clearAuthData();
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthError(error.message);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to clear authentication data
    const clearAuthData = () => {
      apiClient.setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_id');
      localStorage.removeItem('supabase_session');
      setUser(null);
    };

    getInitialSession();
    
    // Set up auth state change listener for Supabase
    const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', { event, hasSession: !!session });
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in via Supabase, updating state');
        const token = session.access_token;
        apiClient.setToken(token);
        
        // Store tokens in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', session.refresh_token);
        localStorage.setItem('user_authenticated', 'true');
        localStorage.setItem('user_id', session.user.id);
        
        // Store Supabase session data
        localStorage.setItem('supabase_session', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        }));
        
        // Get user data and update state
        fetchUserWithProfile(session.user).then(userWithProfile => {
          setUser(userWithProfile);
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out via Supabase, clearing state');
        clearAuthData();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed via Supabase, updating tokens');
        apiClient.setToken(session.access_token);
        
        // Update stored tokens
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('refresh_token', session.refresh_token);
        
        // Update stored session
        localStorage.setItem('supabase_session', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        }));
      } else if (event === 'USER_UPDATED' && session) {
        console.log('User data updated via Supabase, refreshing user data');
        fetchUserWithProfile(session.user).then(userWithProfile => {
          setUser(userWithProfile);
        });
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (credentials) => {
    try {
      const response = await apiClient.signIn(credentials);
      if (response.user) {
        const userWithProfile = await fetchUserWithProfile(response.user);
        setUser(userWithProfile);
        
        // Update localStorage
        localStorage.setItem('user_authenticated', 'true');
        localStorage.setItem('user_id', response.user.id);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (userData) => {
    try {
      const response = await apiClient.signUp(userData);
      // Note: signup doesn't automatically sign in, user needs to confirm email
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
      await supabase.auth.signOut();
      clearAuthData();
    } catch (error) {
      // Even if signout fails, clear local state
      clearAuthData();
      throw error;
    }
  };
  
  // Helper function to clear authentication data
  const clearAuthData = () => {
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_id');
    localStorage.removeItem('supabase_session');
    setUser(null);
  };

  const signInWithOAuth = async (provider) => {
    try {
      console.log(`Initiating OAuth sign-in with provider: ${provider}`);
      
      // Use Supabase's OAuth directly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline', // For Google, request a refresh token
            prompt: 'consent'       // Force consent screen to ensure refresh token
          }
        }
      });
      
      if (error) {
        console.error(`OAuth sign-in error with provider ${provider}:`, error);
        throw error;
      }
      
      if (data.url) {
        // Redirect to the OAuth provider's authorization page
        window.location.href = data.url;
      } else {
        console.error('No redirect URL returned from Supabase OAuth');
        throw new Error('OAuth initialization failed');
      }
    } catch (error) {
      console.error(`OAuth sign-in error with provider ${provider}:`, error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    isAuthenticated: !!user,
    authError,
    updateUser: setUser, // Add function to update user data
    apiClient, // Expose API client for other components to use
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 