import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Import the fixed Supabase client
import { supabase } from '@/api/supabase-auth-fixed';
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
  const [showDebug, setShowDebug] = useState(true);

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
            auth_token: localStorage.getItem('auth_token') ? 'exists' : 'not set',
            refresh_token: localStorage.getItem('refresh_token') ? 'exists' : 'not set',
            user_authenticated: localStorage.getItem('user_authenticated'),
            user_id: localStorage.getItem('user_id'),
            supabase_session: localStorage.getItem('supabase_session') ? 'exists' : 'not set'
          }
        };
        setDebugInfo(debug);
        console.log('Auth callback debug info:', debug);
        
        // First, try to directly exchange the code if it exists in the URL
        if (location.search && location.search.includes('code=')) {
          console.log('Found code in URL, attempting direct exchange...');
          
          try {
            // Extract the code from the URL for debugging
            const urlParams = new URLSearchParams(location.search);
            const code = urlParams.get('code');
            console.log('Code from URL:', code);
            
            // Try the code exchange with explicit error handling
            try {
              console.log('Attempting to exchange code for session');
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              
              if (exchangeError) {
                console.error('Error in code exchange:', exchangeError);
                setError(`Code exchange error: ${exchangeError.message}`);
                
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
            }, 1000);
            
            return;
          } catch (exchangeError) {
            console.error('Error in code exchange process:', exchangeError);
            setError(`Error exchanging code: ${exchangeError.message || 'Unknown error'}`);
            // Continue to other methods if code exchange fails
          }
        }
        
        // If we get here, no valid authentication was found
        console.log('No valid authentication found in URL');
        setError('Authentication failed. Please try logging in again.');
        
      } catch (error) {
        console.error('Error in handleCallback:', error);
        setError(`Authentication error: ${error.message || 'Unknown error'}`);
      }
    };

    handleCallback();
  }, [location, navigate, updateUser]);

  const handleManualLogin = () => {
    navigate('/Login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication</h1>
        <p className="text-gray-600 mb-4">{status}</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {error && (
          <button
            onClick={handleManualLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md"
          >
            Return to Login
          </button>
        )}
      </div>
      
      {showDebug && (
        <div className="w-full max-w-md bg-gray-50 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Debug Information</h2>
            <button
              onClick={() => setShowDebug(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
            >
              Hide Debug Info
            </button>
          </div>
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthCallback; 