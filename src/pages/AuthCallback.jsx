import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Create a standalone Supabase client just for this component
const SUPABASE_URL = 'https://bxgdijqjdtbgzycvngug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.axSb9Ew1TelVzo-4EsbWO8vxYjuU_0FAxWMpbWrgfIw';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    // Load Supabase client dynamically
    const loadSupabase = async () => {
      try {
        // Import the Supabase client
        const { createClient } = await import('@supabase/supabase-js');
        
        // Create a client instance
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // We'll handle this manually
            storage: window.localStorage
          }
        });
        
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
          
          try {
            // Clear any existing auth data
            localStorage.removeItem('supabase.auth.token');
            
            // Exchange the code for a session
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('Error exchanging code:', exchangeError);
              setError(`Authentication error: ${exchangeError.message}`);
              setLoading(false);
              return;
            }
            
            if (!data?.session) {
              setError('No session returned from code exchange');
              setLoading(false);
              return;
            }
            
            console.log('Successfully exchanged code for session');
            
            // Store the session in localStorage
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + data.session.expires_in
            }));
            
            // Set additional flags for compatibility
            localStorage.setItem('user_authenticated', 'true');
            
            // Redirect to dashboard
            console.log('Redirecting to Dashboard...');
            window.location.href = '/Dashboard';
          } catch (exchangeError) {
            console.error('Exception during code exchange:', exchangeError);
            setError(`Code exchange error: ${exchangeError.message}`);
            setLoading(false);
          }
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
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth callback timeout reached');
        setLoading(false);
        setError('Authentication timed out. Please try again.');
      }
    }, 15000); // 15 seconds timeout
    
    loadSupabase();
    
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