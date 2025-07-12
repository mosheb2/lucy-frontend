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

        // The session should be automatically handled by Supabase
        // when detectSessionInUrl is true in the client config
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(`Authentication error: ${sessionError.message}`);
          return;
        }

        if (!session) {
          // If no session found, try to exchange the code in the URL
          if (window.location.search.includes('code=')) {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            
            try {
              console.log('Attempting to exchange code for session');
              const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              
              if (exchangeError) {
                console.error('Error exchanging code for session:', exchangeError);
                setError(`Authentication error: ${exchangeError.message}`);
                return;
              }
              
              if (!data.session) {
                setError('No session returned from code exchange');
                return;
              }
              
              // Update the user in context
              if (data.user) {
                updateUser(data.user);
              }
              
              // Redirect to dashboard
              navigate('/Dashboard', { replace: true });
              return;
            } catch (exchangeError) {
              console.error('Exception during code exchange:', exchangeError);
              setError(`Authentication error: ${exchangeError.message}`);
              return;
            }
          } else {
            setError('No authentication session found');
            return;
          }
        }
        
        // If we have a session, get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          setError(`Authentication error: ${userError.message}`);
          return;
        }
        
        if (!user) {
          setError('No user found in session');
          return;
        }
        
        // Update the user in context
        updateUser(user);
        
        // Redirect to dashboard
        navigate('/Dashboard', { replace: true });
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
    navigate('/Login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Login</h1>
          <p className="text-gray-600 mb-4">Please wait while we complete your authentication...</p>
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
          
          <Button 
            onClick={handleReturnToLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            Return to Login
          </Button>
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