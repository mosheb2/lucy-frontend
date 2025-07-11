import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/api/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);

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
        console.log('AuthCallback: Starting authentication process...');
        setStatus('Getting session from provider...');
        
        // Check if we have a token in the URL hash (from OAuth callback)
        if (location.hash && location.hash.includes('access_token=')) {
          console.log('Found access token in URL hash, processing...');
          
          // Parse the hash parameters
          const hashParams = {};
          const hashParts = location.hash.substring(1).split('&');
          
          hashParts.forEach(part => {
            const [key, value] = part.split('=');
            hashParams[key] = decodeURIComponent(value);
          });
          
          console.log('Parsed hash parameters:', hashParams);
          
          if (hashParams.access_token) {
            console.log('Setting access token from URL hash');
            
            // Set the token for API calls
            apiClient.setToken(hashParams.access_token);
            
            // Store tokens in localStorage
            localStorage.setItem('auth_token', hashParams.access_token);
            if (hashParams.refresh_token) {
              localStorage.setItem('refresh_token', hashParams.refresh_token);
            }
            
            try {
              // Get user data from Supabase using the token
              const { data: userData, error: userError } = await supabase.auth.getUser(hashParams.access_token);
              
              if (userError) {
                console.error('Error getting user data with token:', userError);
                setError(`Error getting user data: ${userError.message}`);
                return;
              }
              
              if (userData && userData.user) {
                console.log('User data obtained with token:', userData.user);
                
                // Update user in context
                updateUser(userData.user);
                
                // Store user data in localStorage
                localStorage.setItem('user_authenticated', 'true');
                localStorage.setItem('user_id', userData.user.id);
                
                // Redirect to dashboard
                setStatus('Authentication successful! Redirecting...');
                setTimeout(() => {
                  console.log('Navigating to Dashboard...');
                  navigate('/Dashboard', { replace: true });
                }, 500);
                return;
              }
            } catch (tokenError) {
              console.error('Error processing token from URL hash:', tokenError);
            }
          }
        }
        
        // If direct token handling didn't work, try to exchange the code if it exists in the URL
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
            }
          }
        }
        
        // If direct code exchange didn't work, try getting the session
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
        
        // Get user data directly from Supabase
        try {
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
          
          // Get the return URL from localStorage or default to dashboard
          const returnUrl = localStorage.getItem('auth_return_url');
          localStorage.removeItem('auth_return_url'); // Clear it after use
          
          // Add a slight delay to ensure context is updated before redirecting
          setTimeout(() => {
            if (returnUrl && !returnUrl.includes('/login') && !returnUrl.includes('/signup') && !returnUrl.includes('/auth/callback')) {
              // Parse the return URL to get just the path
              try {
                const url = new URL(returnUrl);
                console.log('Navigating to return URL:', url.pathname + url.search);
                navigate(url.pathname + url.search, { replace: true });
              } catch (e) {
                console.log('Navigating to Dashboard due to URL parsing error...');
                navigate('/Dashboard', { replace: true });
              }
            } else {
              console.log('Navigating to Dashboard (no valid return URL)...');
              navigate('/Dashboard', { replace: true });
            }
          }, 500);
        } catch (profileError) {
          console.error('Error getting user profile from Supabase:', profileError);
          setError(`Error getting user profile: ${profileError.message}`);
        }
      } catch (e) {
        console.error('Unexpected error in auth callback:', e);
        setError(`Unexpected error: ${e.message}`);
      }
    };

    handleCallback();
  }, [navigate, location, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {error ? (
          <>
            <div className="text-red-500 mb-4 text-xl font-semibold">Authentication Failed</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication in Progress</h2>
            <p className="text-gray-600">{status}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
