import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase-auth-fixed';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Gather debug info
        const debug = {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          pathname: window.location.pathname
        };
        setDebugInfo(debug);
        console.log('Auth callback debug info:', debug);

        // Wait a moment to let Supabase's automatic session detection work
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if we have a session after the automatic handling
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          console.log('Session detected automatically');
          
          // Get user data
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            console.log('User found:', userData.user.id);
            updateUser(userData.user);
            
            // Redirect to dashboard
            navigate('/Dashboard', { replace: true });
            return;
          }
        }
        
        // If no session was automatically detected, try manual code exchange
        if (window.location.search && window.location.search.includes('code=')) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          
          if (code) {
            console.log('Attempting manual code exchange');
            
            try {
              // Clear any existing session data first
              localStorage.removeItem('supabase.auth.token');
              
              // Try the code exchange
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              
              if (exchangeError) {
                console.error('Error exchanging code:', exchangeError);
                setError(`Authentication error: ${exchangeError.message}`);
                return;
              }
              
              if (data?.session) {
                console.log('Code exchange successful');
                
                // Get user data
                const { data: userData } = await supabase.auth.getUser();
                
                if (userData?.user) {
                  console.log('User found after code exchange:', userData.user.id);
                  updateUser(userData.user);
                  
                  // Redirect to dashboard
                  navigate('/Dashboard', { replace: true });
                  return;
                }
              } else {
                setError('No session returned from code exchange');
              }
            } catch (exchangeError) {
              console.error('Exception during code exchange:', exchangeError);
              setError(`Authentication error: ${exchangeError.message}`);
            }
          }
        } else {
          setError('No authentication code found in URL');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setError(`Authentication error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, updateUser]);

  const handleReturnToLogin = () => {
    // Clear any potentially corrupted auth state
    localStorage.removeItem('supabase.auth.token');
    navigate('/Login', { replace: true });
  };

  const handleClearAndRetry = () => {
    // Clear localStorage and reload
    localStorage.clear();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Login</h1>
          <p className="text-gray-600 mb-4">Please wait while we complete your authentication...</p>
          
          <Button
            variant="outline"
            onClick={handleClearAndRetry}
            className="mt-4"
          >
            Clear and Retry
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
          
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleReturnToLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              Return to Login
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClearAndRetry}
            >
              Clear and Retry
            </Button>
          </div>
        </div>
        
        {showDebug && (
          <div className="w-full max-w-md bg-gray-50 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Debug Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebug(false)}
              >
                Hide Debug Info
              </Button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // This should not be visible as we redirect on success
  return null;
};

export default AuthCallback; 