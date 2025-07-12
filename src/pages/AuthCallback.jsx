import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase-auth-fixed';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    // Function to handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Store debug info
        const debug = {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          pathname: window.location.pathname
        };
        setDebugInfo(debug);
        console.log('Auth callback debug info:', debug);

        // Extract the code from the URL
        if (window.location.search && window.location.search.includes('code=')) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          
          if (!code) {
            setError('No authentication code found in URL');
            setLoading(false);
            return;
          }

          console.log('Found code in URL, exchanging for session...');
          
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            setError(`Authentication error: ${exchangeError.message}`);
            setLoading(false);
            return;
          }
          
          if (!data?.session) {
            console.error('No session returned from code exchange');
            setError('Authentication failed: No session returned');
            setLoading(false);
            return;
          }
          
          console.log('Successfully exchanged code for session');
          
          // Redirect to dashboard
          window.location.href = '/Dashboard';
          return;
        } else {
          setError('No authentication code found in URL');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setError(`Authentication error: ${error.message}`);
        setLoading(false);
      }
    };

    handleCallback();
  }, []);

  const handleReturnToLogin = () => {
    navigate('/Login', { replace: true });
  };

  const handleClearAndRetry = () => {
    // Clear all localStorage and reload
    localStorage.clear();
    window.location.reload();
  };

  const handleHardReset = () => {
    // Clear all localStorage and redirect to login
    localStorage.clear();
    window.location.href = '/Login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Login</h1>
          <p className="text-gray-600 mb-4">Please wait while we complete your authentication...</p>
          
          <div className="flex flex-col gap-2 mt-6">
            <Button
              variant="outline"
              onClick={handleClearAndRetry}
              className="flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear and Retry
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleHardReset}
              className="text-sm text-gray-500"
            >
              Reset and Return to Login
            </Button>
          </div>
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
              className="flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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

  return null;
};

export default AuthCallback; 