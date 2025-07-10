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
    const handleCallback = async () => {
      try {
        console.log('Handling OAuth callback...', location.hash);
        setStatus('Getting session from provider...');
        
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(`Authentication error: ${error.message}`);
          return;
        }
        
        if (!session) {
          console.error('No session found');
          setError('No session found. Please try logging in again.');
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
        
        try {
          // Get user profile from backend
          const userData = await apiClient.getCurrentUser();
          
          if (!userData || !userData.user) {
            console.error('User data not found');
            setError('User profile not found. Please try logging in again.');
            return;
          }
          
          console.log('User profile obtained, updating context...');
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
                navigate(url.pathname + url.search, { replace: true });
              } catch (e) {
                navigate('/Dashboard', { replace: true });
              }
            } else {
              navigate('/Dashboard', { replace: true });
            }
          }, 500);
        } catch (profileError) {
          console.error('Error getting user profile:', profileError);
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