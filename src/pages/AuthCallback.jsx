import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/api/supabase-auth-fixed';

const AuthCallback = () => {
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
          pathname: window.location.pathname,
          localStorage: Object.keys(localStorage)
        };
        setDebugInfo(debug);
        console.log('Auth callback debug info:', debug);

        // For PKCE flow, we don't need to do anything here
        // The Supabase client will automatically detect the code in the URL
        // and exchange it for a session

        // Wait a moment to allow Supabase to process the auth callback
        setTimeout(async () => {
          // Check if we have a session
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            setError(`Session error: ${sessionError.message}`);
            setLoading(false);
            return;
          }
          
          if (data?.session) {
            console.log('Session found, redirecting to Dashboard');
            // We have a session, redirect to dashboard
            window.location.href = '/Dashboard';
          } else {
            // No session, show error
            setError('Authentication failed. No session was created.');
            setLoading(false);
          }
        }, 2000); // Wait 2 seconds for Supabase to process
      } catch (error) {
        console.error('Error in auth callback:', error);
        setError(`Authentication error: ${error.message}`);
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth callback timeout reached');
        setLoading(false);
        setError('Authentication timed out. Please try again.');
      }
    }, 15000); // 15 seconds timeout

    handleCallback();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleReturnToLogin = () => {
    window.location.href = '/Login';
  };

  const handleClearAndRetry = () => {
    // Clear all storage and reload the page
    localStorage.clear();
    window.location.reload();
  };
  
  const handleDebug = () => {
    window.location.href = '/debug-auth.html' + window.location.search;
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
              onClick={handleReturnToLogin}
              className="text-sm text-gray-500"
            >
              Return to Login
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
            
            <Button
              variant="outline"
              onClick={handleDebug}
              className="mt-4"
            >
              Open Debug Tool
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