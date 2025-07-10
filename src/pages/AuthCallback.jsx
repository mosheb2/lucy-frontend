import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Handling OAuth callback...');
        
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/login?error=' + encodeURIComponent(error.message));
          return;
        }
        
        if (session) {
          console.log('Session found, setting token...');
          
          // Store the access token for backend API calls
          localStorage.setItem('auth_token', session.access_token);
          apiClient.setToken(session.access_token);
          
          // Store the refresh token if available
          if (session.refresh_token) {
            localStorage.setItem('refresh_token', session.refresh_token);
            console.log('Refresh token saved to localStorage');
          }
          
          // Get user data from backend using apiClient
          const userData = await apiClient.getCurrentUser();
          console.log('User data received:', userData);
          
          // Update user in context
          updateUser(userData.user);
          
          // Update localStorage
          localStorage.setItem('user_authenticated', 'true');
          localStorage.setItem('user_id', userData.user.id);
          
          console.log('Authentication successful, redirecting to dashboard...');
          
          // Redirect to dashboard
          navigate('/Dashboard');
        } else {
          console.log('No session found');
          navigate('/login?error=' + encodeURIComponent('No session found'));
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        navigate('/login?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleCallback();
  }, [navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Authenticating...</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 