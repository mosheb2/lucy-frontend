import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/api/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';

// Helper function to extract tokens from URL hash
const extractTokensFromHash = (hash) => {
  if (!hash) return {};
  
  // Remove the leading '#' if present
  const hashString = hash.startsWith('#') ? hash.substring(1) : hash;
  
  // Try URLSearchParams first
  try {
    const params = new URLSearchParams(hashString);
    return {
      accessToken: params.get('access_token'),
      refreshToken: params.get('refresh_token'),
      expiresAt: params.get('expires_at'),
      expiresIn: params.get('expires_in'),
      tokenType: params.get('token_type'),
      providerToken: params.get('provider_token')
    };
  } catch (error) {
    console.error('Error parsing hash with URLSearchParams:', error);
    
    // Fallback to manual parsing
    const tokens = {};
    const parts = hashString.split('&');
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'access_token') tokens.accessToken = value;
      if (key === 'refresh_token') tokens.refreshToken = value;
      if (key === 'expires_at') tokens.expiresAt = value;
      if (key === 'expires_in') tokens.expiresIn = value;
      if (key === 'token_type') tokens.tokenType = value;
      if (key === 'provider_token') tokens.providerToken = value;
    }
    return tokens;
  }
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Add a console log to show this component is mounted
    console.log('AuthCallback component mounted', { 
      hash: location.hash,
      search: location.search,
      pathname: location.pathname
    });
    
    const handleCallback = async () => {
      try {
        console.log('Handling OAuth callback...', location.hash, location.search);
        setStatus('Getting session from provider...');
        
        // Store debug info
        const debug = {
          hash: location.hash,
          search: location.search,
          pathname: location.pathname,
          origin: window.location.origin,
          fullUrl: window.location.href,
          localStorage: {
            auth_token: !!localStorage.getItem('auth_token'),
            refresh_token: !!localStorage.getItem('refresh_token'),
            user_authenticated: localStorage.getItem('user_authenticated'),
            user_id: localStorage.getItem('user_id'),
            supabase_session: !!localStorage.getItem('supabase_session')
          }
        };
        setDebugInfo(debug);
        console.log('Auth callback debug info:', debug);
        
        // Log Supabase configuration
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bxgdijqjdtbgzycvngug.supabase.co';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('Auth callback URL:', window.location.href);
        console.log('Auth callback parameters:', {
          url: supabaseUrl,
          hasKey: !!supabaseAnonKey,
          keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
        });
        
        // First, try to directly exchange the code if it exists in the URL
        if (location.search && location.search.includes('code=')) {
          console.log('Found code in URL, attempting direct exchange...');
          
          try {
            // For Supabase PKCE flow, we need to explicitly exchange the code for a session
            // This is the most reliable way to handle the callback
            console.log('Attempting to exchange code for session with full URL');
            
            // Extract the code from the URL for debugging
            const urlParams = new URLSearchParams(location.search);
            const code = urlParams.get('code');
            console.log('Code from URL:', code);
            
            // Try the code exchange with explicit error handling
            try {
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              
              if (exchangeError) {
                console.error('Error in code exchange:', exchangeError);
                setError(`Code exchange error: ${exchangeError.message}`);
                
                // Log additional debug info
                console.log('Code exchange debug info:', {
                  code,
                  fullUrl: window.location.href,
                  error: exchangeError
                });
                
                // Try alternate method with full URL
                console.log('Trying alternate method with full URL...');
                const { data: altExchangeData, error: altExchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
                
                if (altExchangeError) {
                  console.error('Error in alternate code exchange:', altExchangeError);
                  setError(`Alternate code exchange error: ${altExchangeError.message}`);
                  return;
                }
                
                console.log('Alternate code exchange successful:', altExchangeData);
              } else {
                console.log('Code exchange successful:', exchangeData);
              }
            } catch (directExchangeError) {
              console.error('Exception during code exchange:', directExchangeError);
              setError(`Exception during code exchange: ${directExchangeError.message}`);
              
              // Continue to try other methods
            }
            
            // After code exchange, check if we have a session
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            console.log('Session after code exchange:', { 
              hasSession: !!sessionData?.session, 
              error: sessionError?.message,
              session: sessionData?.session ? {
                accessToken: !!sessionData.session.access_token,
                refreshToken: !!sessionData.session.refresh_token,
                expiresAt: sessionData.session.expires_at
              } : null
            });
            
            if (sessionError) {
              console.error('Error getting session after code exchange:', sessionError);
              setError(`Authentication error: ${sessionError.message}`);
              return;
            }
            
            if (!sessionData?.session) {
              console.error('No session found after code exchange and this the debug info:', debug);
              setError('No valid session found. Please try logging in again.');
              return;
            }
            
            console.log('Session obtained after code exchange:', sessionData.session);
            
            // Set the token for API calls
            const token = sessionData.session.access_token;
            apiClient.setToken(token);
            
            // Store tokens in localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('refresh_token', sessionData.session.refresh_token);
            localStorage.setItem('supabase_session', JSON.stringify({
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
              expires_at: sessionData.session.expires_at
            }));
            
            // Get user data
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            console.log('User data after code exchange:', {
              hasUser: !!userData?.user,
              error: userError?.message,
              userId: userData?.user?.id
            });
            
            if (userError) {
              console.error('Error getting user data after code exchange:', userError);
              setError(`Error getting user data: ${userError.message}`);
              return;
            }
            
            if (!userData?.user) {
              console.error('No user data found after code exchange');
              setError('No user data found. Please try logging in again.');
              return;
            }
            
            console.log('User data obtained after code exchange:', userData.user);
            
            // Update user in context
            updateUser(userData.user);
            
            // Store user data in localStorage
            localStorage.setItem('user_authenticated', 'true');
            localStorage.setItem('user_id', userData.user.id);
            
            // Check localStorage to verify everything is set correctly
            console.log('LocalStorage state before redirect:', {
              auth_token: !!localStorage.getItem('auth_token'),
              refresh_token: !!localStorage.getItem('refresh_token'),
              user_authenticated: localStorage.getItem('user_authenticated'),
              user_id: localStorage.getItem('user_id'),
              supabase_session: !!localStorage.getItem('supabase_session')
            });
            
            // Redirect to dashboard
            setStatus('Authentication successful! Redirecting...');
            
            // Use a direct window.location for a hard redirect
            console.log('Redirecting to Dashboard with hard navigation...');
            setTimeout(() => {
              window.location.href = '/Dashboard';
            }, 500);
            
            return;
          } catch (exchangeError) {
            console.error('Error in code exchange process:', exchangeError);
            setError(`Error exchanging code: ${exchangeError.message || 'Unknown error'}`);
            // Continue to other methods if code exchange fails
          }
        }
        
        // Extract tokens directly from hash using our helper function
        if (location.hash) {
          console.log('Extracting tokens from hash...');
          const tokens = extractTokensFromHash(location.hash);
          console.log('Extracted tokens:', { 
            hasAccessToken: !!tokens.accessToken,
            hasRefreshToken: !!tokens.refreshToken,
            tokenType: tokens.tokenType
          });
          
          if (tokens.accessToken) {
            console.log('Found access token in hash, setting up session...');
            
            // Set the token for API calls
            apiClient.setToken(tokens.accessToken);
            
            // Store tokens in localStorage
            localStorage.setItem('auth_token', tokens.accessToken);
            if (tokens.refreshToken) {
              localStorage.setItem('refresh_token', tokens.refreshToken);
            }
            
            // Try to get user data with the token
            try {
              // First try with Supabase
              const { data: userData, error: userError } = await supabase.auth.getUser();
              
              if (!userError && userData?.user) {
                console.log('User data obtained from Supabase:', userData.user);
                
                // Update user in context
                updateUser(userData.user);
                
                // Store user data in localStorage
                localStorage.setItem('user_authenticated', 'true');
                localStorage.setItem('user_id', userData.user.id);
                
                // Redirect to dashboard
                setStatus('Authentication successful! Redirecting...');
                setTimeout(() => {
                  navigate('/Dashboard', { replace: true });
                }, 500);
                return;
              } else {
                console.error('Error getting user with token from Supabase:', userError);
                // If Supabase fails, try with backend API
                try {
                  const apiUserData = await apiClient.getCurrentUser();
                  
                  if (apiUserData && apiUserData.user) {
                    console.log('User data obtained from API:', apiUserData.user);
                    
                    // Update user in context
                    updateUser(apiUserData.user);
                    
                    // Store user data in localStorage with more explicit logging
                    console.log('Setting authentication data in localStorage');
                    localStorage.setItem('user_authenticated', 'true');
                    localStorage.setItem('user_id', apiUserData.user.id);
                    
                    // Redirect to dashboard with explicit logging
                    setStatus('Authentication successful! Redirecting...');
                    console.log('Authentication successful, redirecting to Dashboard...');
                    
                    // Add a small delay to ensure localStorage is updated before navigation
                    setTimeout(() => {
                      console.log('Executing navigation to Dashboard...');
                      // Force a hard navigation to ensure full page reload with new auth state
                      window.location.href = '/Dashboard';
                    }, 1000);
                    return;
                  }
                } catch (apiError) {
                  console.error('Error getting user data from API:', apiError);
                  setError(`API error: ${apiError.message || 'Unknown error'}`);
                }
              }
            } catch (userError) {
              console.error('Error getting user data with token:', userError);
              setError(`User data error: ${userError.message || 'Unknown error'}`);
            }
          }
        }
        
        // If we still don't have authentication, try to get session from Supabase
        try {
          console.log('Trying to get existing session...');
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          console.log('Supabase session response:', data);
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            setError(`Authentication error: ${sessionError.message}`);
            return;
          }
          
          if (data?.session) {
            console.log('Found existing session:', data.session);
            
            // Set the token for API calls
            apiClient.setToken(data.session.access_token);
            
            // Store tokens in localStorage
            localStorage.setItem('auth_token', data.session.access_token);
            localStorage.setItem('refresh_token', data.session.refresh_token);
            
            // Get user data
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error('Error getting user data from session:', userError);
              setError(`Error getting user data: ${userError.message}`);
              return;
            }
            
            if (!userData?.user) {
              console.error('No user data found in session');
              setError('No user data found. Please try logging in again.');
              return;
            }
            
            console.log('User data obtained from session:', userData.user);
            
            // Update user in context
            updateUser(userData.user);
            
            // Store user data in localStorage
            localStorage.setItem('user_authenticated', 'true');
            localStorage.setItem('user_id', userData.user.id);
            
            // Redirect to dashboard
            setStatus('Authentication successful! Redirecting...');
            setTimeout(() => {
              navigate('/Dashboard', { replace: true });
            }, 500);
            return;
          }
          
          // If we get here, no authentication was found
          console.log('No authentication found');
          setError('No authentication found. Please try logging in again.');
        } catch (error) {
          console.error('Error in auth callback:', error);
          setError(`Authentication error: ${error.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setError(`Unexpected error: ${error.message || 'Unknown error'}`);
      }
    };
    
    handleCallback();
  }, [location, navigate, updateUser]);
  
  const handleManualLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Authentication</h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-700">{status}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          {error && (
            <button
              onClick={handleManualLogin}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Login Page
            </button>
          )}
          
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>
        
        {showDebug && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-96">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 