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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        // Check if we have a token in localStorage
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userAuthenticated = localStorage.getItem('user_authenticated');
        
        console.log('Auth state from localStorage:', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken,
          userAuthenticated
        });
        
        if (token) {
          apiClient.setToken(token);
          
          try {
            // Try to get current user from backend
            console.log('Attempting to get current user with token');
            const userData = await apiClient.getCurrentUser();
            const userWithProfile = await fetchUserWithProfile(userData.user);
            console.log('Successfully retrieved user data:', userWithProfile);
            setUser(userWithProfile);
            
            // Update localStorage
            localStorage.setItem('user_authenticated', 'true');
            localStorage.setItem('user_id', userData.user.id);
            console.log('Updated authentication state in localStorage');
          } catch (error) {
            console.error('Error getting current user:', error);
            
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
        } else if (userAuthenticated === 'true') {
          // If we have user_authenticated but no token, try to get a session from Supabase
          console.log('User marked as authenticated but no token, checking with Supabase');
          try {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
              console.log('Found valid Supabase session');
              const token = data.session.access_token;
              apiClient.setToken(token);
              localStorage.setItem('auth_token', token);
              localStorage.setItem('refresh_token', data.session.refresh_token);
              
              const { data: userData } = await supabase.auth.getUser();
              if (userData?.user) {
                const userWithProfile = await fetchUserWithProfile(userData.user);
                setUser(userWithProfile);
                console.log('Restored user session from Supabase');
              }
            } else {
              console.log('No valid Supabase session found, clearing auth data');
              clearAuthData();
            }
          } catch (error) {
            console.error('Error checking Supabase session:', error);
            clearAuthData();
          }
        } else {
          console.log('No authentication data found, user is not logged in');
          clearAuthData();
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
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
      setUser(null);
    };

    getInitialSession();
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
    setUser(null);
  };

  const signInWithOAuth = async (provider) => {
    try {
      console.log(`Initiating OAuth sign-in with provider: ${provider}`);
      
      // For OAuth, we'll need to implement this through the backend
      const backendUrl = import.meta.env.VITE_API_URL || 'https://api.lucysounds.com/api';
      
      // Store the current URL as the intended return URL
      const returnUrl = window.location.href;
      localStorage.setItem('auth_return_url', returnUrl);
      
      // Special handling for Solana wallet
      if (provider === 'solana') {
        console.log('Initiating Solana wallet authentication');
        // Redirect to Solana wallet auth endpoint
        window.location.href = `${backendUrl}/auth/wallet/solana`;
        return;
      }
      
      // Standard OAuth providers
      window.location.href = `${backendUrl}/auth/${provider}`;
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
    updateUser: setUser, // Add function to update user data
    apiClient, // Expose API client for other components to use
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 