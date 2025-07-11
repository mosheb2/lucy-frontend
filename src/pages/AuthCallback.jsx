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
        
        // First, try to directly exchange the code if it exists in the URL
        if (location.search && location.search.includes('code=')) {
          console.log('Found code in URL, attempting direct exchange...');
          
          try {
            // For Supabase PKCE flow, we need to explicitly exchange the code for a session
            // This is the most reliable way to handle the callback
            console.log('Attempting to exchange code for session with full URL');
            await supabase.auth.exchangeCodeForSession(window.location.href);
            
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
              console.error('No session found after code exchange');
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
                }
              }
            } catch (userError) {
              console.error('Error getting user data with token:', userError);
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
          
          const session = data.session;
          
          if (!session) {
            console.error('No session found');
            setError('No valid session found. Please try logging in again.');
            return;
          }
          
          console.log('Session obtained, setting token...');
          setStatus('Session obtained, getting user profile...');
          
          // Set the token for API calls
          const token = session.access_token;
          apiClient.setToken(token);
          
          // Store tokens in localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', session.refresh_token);
          
          // Get user data from Supabase
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Error getting user data:', userError);
            setError(`Error getting user data: ${userError.message}`);
            return;
          }
          
          if (!userData?.user) {
            console.error('No user data found');
            setError('No user data found. Please try logging in again.');
            return;
          }
          
          console.log('User data obtained:', userData.user);
          
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
        } catch (error) {
          console.error('Error in auth callback:', error);
          setError(`Authentication error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setError(`Authentication error: ${error.message}`);
      }
    };

    handleCallback();
  }, [navigate, updateUser, location]);

  const handleManualLogin = () => {
    navigate('/login', { replace: true });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="mb-4">
            <button
              onClick={handleManualLogin}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
          
          {/* Debug information (hidden in production) */}
          {import.meta.env.DEV && (
            <div className="mt-8 text-left border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Debug Information</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Authenticating
        </h2>
        <p className="text-slate-600 mb-4">{status}</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        
        {/* Debug information (hidden in production) */}
        {import.meta.env.DEV && (
          <div className="mt-8 text-left border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Debug Information</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 