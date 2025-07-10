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

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Handling OAuth callback...', location.hash);
        setStatus('Getting session from provider...');
        
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          setStatus('Authentication failed: ' + error.message);
          navigate('/login?error=' + encodeURIComponent(error.message));
          return;
        }
        
        if (session) {
          console.log('Session found, setting token...');
          setStatus('Session found, setting up your account...');
          
          // Store the access token for backend API calls
          localStorage.setItem('auth_token', session.access_token);
          apiClient.setToken(session.access_token);
          
          // Store the refresh token if available
          if (session.refresh_token) {
            localStorage.setItem('refresh_token', session.refresh_token);
            console.log('Refresh token saved to localStorage');
          }
          
          try {
            // Get user data from backend using apiClient
            setStatus('Getting your profile data...');
            const userData = await apiClient.getCurrentUser();
            console.log('User data received:', userData);
            
            // Update user in context
            updateUser(userData.user);
            
            // Update localStorage
            localStorage.setItem('user_authenticated', 'true');
            localStorage.setItem('user_id', userData.user.id);
            
            console.log('Authentication successful, redirecting to dashboard...');
            setStatus('Authentication successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
              navigate('/Dashboard', { replace: true });
            }, 500);
          } catch (apiError) {
            console.error('Error getting user data:', apiError);
            setStatus('Error getting user data: ' + (apiError.message || 'Unknown error'));
            navigate('/login?error=' + encodeURIComponent('Failed to get user data. Please try again.'));
          }
        } else {
          console.log('No session found');
          setStatus('No session found');
          navigate('/login?error=' + encodeURIComponent('No session found'));
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setStatus('Authentication failed: ' + (error.message || 'Unknown error'));
        navigate('/login?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleCallback();
  }, [navigate, updateUser, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Authenticating...</h2>
          <p className="mt-2 text-sm text-gray-600">
            {status}
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 