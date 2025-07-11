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
          pathname: location.pathname
        };
        setDebugInfo(debug);
        
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
              const { data: userData, error: userError } = await supabase.auth.getUser(tokens.accessToken);
              
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
                    
                    // Store user data in localStorage
                    localStorage.setItem('user_authenticated', 'true');
                    localStorage.setItem('user_id', apiUserData.user.id);
                    
                    // Redirect to dashboard
                    setStatus('Authentication successful! Redirecting...');
                    setTimeout(() => {
                      navigate('/Dashboard', { replace: true });
                    }, 500);
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
        
        // First, try to directly exchange the code if it exists in the URL
        if (location.search && location.search.includes('code=')) {
          console.log('Found code in URL, attempting direct exchange...');
          const searchParams = new URLSearchParams(location.search);
          const code = searchParams.get('code');
          
          if (code) {
            console.log('Exchanging code for session...');
            try {
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              
              console.log('Code exchange response:', data);
              
              if (exchangeError) {
                console.error('Error exchanging code for session:', exchangeError);
                setError(`Error exchanging code: ${exchangeError.message}`);
                return;
              }
              
              if (data && data.session) {
                console.log('Session obtained from code exchange:', data.session);
                
                // Set the token for API calls
                const token = data.session.access_token;
                apiClient.setToken(token);
                
                // Store tokens in localStorage
                localStorage.setItem('auth_token', token);
                localStorage.setItem('refresh_token', data.session.refresh_token);
                
                // Get user data
                const userData = data.user;
                
                if (userData) {
                  console.log('User data obtained from code exchange:', userData);
                  
                  // Update user in context
                  updateUser(userData);
                  
                  // Store user data in localStorage
                  localStorage.setItem('user_authenticated', 'true');
                  localStorage.setItem('user_id', userData.id);
                  
                  // Redirect to dashboard
                  setStatus('Authentication successful! Redirecting...');
                  setTimeout(() => {
                    console.log('Navigating to Dashboard...');
                    navigate('/Dashboard', { replace: true });
                  }, 500);
                  return;
                }
              }
            } catch (exchangeError) {
              console.error('Error in code exchange process:', exchangeError);
              // Continue to other methods if code exchange fails
            }
          }
        }
        
        // Try to manually extract tokens from URL
        if (location.hash || location.search) {
          console.log('Trying to extract tokens from URL...');
          
          // Try hash fragment first
          let accessToken = null;
          let refreshToken = null;
          
          if (location.hash) {
            // Handle hash format: #access_token=xxx&token_type=bearer&...
            const hashParams = new URLSearchParams(location.hash.substring(1));
            accessToken = hashParams.get('access_token');
            refreshToken = hashParams.get('refresh_token');
            
            // If URLSearchParams doesn't work, try manual parsing
            if (!accessToken) {
              const hashParts = location.hash.substring(1).split('&');
              for (const part of hashParts) {
                const [key, value] = part.split('=');
                if (key === 'access_token') accessToken = value;
                if (key === 'refresh_token') refreshToken = value;
              }
            }
          }
          
          // If not in hash, try search params
          if (!accessToken && location.search) {
            const searchParams = new URLSearchParams(location.search);
            accessToken = searchParams.get('access_token');
            refreshToken = searchParams.get('refresh_token');
          }
          
          if (accessToken) {
            console.log('Found access token in URL, setting up session...');
            
            // Set the token for API calls
            apiClient.setToken(accessToken);
            
            // Store tokens in localStorage
            localStorage.setItem('auth_token', accessToken);
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken);
            }
            
            // Try to get user data with the token
            try {
              // First try with Supabase
              const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
              
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
                // If Supabase fails, try with backend API
                try {
                  const apiUserData = await apiClient.getCurrentUser();
                  
                  if (apiUserData && apiUserData.user) {
                    console.log('User data obtained from API:', apiUserData.user);
                    
                    // Update user in context
                    updateUser(apiUserData.user);
                    
                    // Store user data in localStorage
                    localStorage.setItem('user_authenticated', 'true');
                    localStorage.setItem('user_id', apiUserData.user.id);
                    
                    // Redirect to dashboard
                    setStatus('Authentication successful! Redirecting...');
                    setTimeout(() => {
                      navigate('/Dashboard', { replace: true });
                    }, 500);
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
          const { data: userData, error: userError } = await supabase.auth.getUser(token);
          
          if (userError) {
            console.error('Error getting user data from Supabase:', userError);
            setError(`Error getting user data: ${userError.message}`);
            return;
          }
          
          if (!userData || !userData.user) {
            console.error('User data not found in Supabase response');
            setError('User profile not found. Please try logging in again.');
            return;
          }
          
          console.log('User profile obtained from Supabase:', userData.user);
          setStatus('Authentication successful! Redirecting...');
          
          // Update user in context
          updateUser(userData.user);
          
          // Store user data in localStorage
          localStorage.setItem('user_authenticated', 'true');
          localStorage.setItem('user_id', userData.user.id);
          
          // Redirect to dashboard or stored return URL
          setTimeout(() => {
            const returnUrl = localStorage.getItem('auth_return_url');
            if (returnUrl) {
              localStorage.removeItem('auth_return_url');
              console.log('Navigating to stored return URL:', returnUrl);
              window.location.href = returnUrl;
            } else {
              console.log('Navigating to Dashboard...');
              navigate('/Dashboard', { replace: true });
            }
          }, 500);
        } catch (error) {
          console.error('Error getting session:', error);
          setError(`Error getting session: ${error.message}`);
        }
      } catch (error) {
        console.error('Authentication callback error:', error);
        setError(`Authentication error: ${error.message}`);
      }
    };

    handleCallback();
  }, [navigate, location, updateUser]);

  // Add a manual login function for debugging
  const handleManualLogin = () => {
    try {
      // Parse the token from the debug info
      const hash = debugInfo.hash || '';
      const tokens = extractTokensFromHash(hash);
      
      if (tokens.accessToken) {
        // Set the token for API calls
        apiClient.setToken(tokens.accessToken);
        
        // Store tokens in localStorage
        localStorage.setItem('auth_token', tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem('refresh_token', tokens.refreshToken);
        }
        
        // Redirect to dashboard
        navigate('/Dashboard', { replace: true });
      } else {
        setError('No access token found in debug info');
      }
    } catch (error) {
      console.error('Manual login error:', error);
      setError(`Manual login error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-white">L</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error ? 'Authentication Failed' : 'Authenticating...'}
        </h1>
        
        {!error ? (
          <>
            <p className="text-gray-600 mb-4">{status}</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            <p className="text-red-500 mb-6">{error}</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => navigate('/Login', { replace: true })}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow hover:shadow-lg transition-all duration-300"
              >
                Return to Login
              </button>
              
              <button
                onClick={handleManualLogin}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-lg shadow hover:shadow-lg transition-all duration-300"
              >
                Try Manual Login
              </button>
            </div>
            
            {/* Debug information for development */}
            <div className="mt-6 text-xs text-left bg-gray-100 p-4 rounded-md overflow-auto max-h-40">
              <p className="font-semibold mb-1">Debug Info:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
