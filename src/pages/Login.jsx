import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff, Facebook, Chrome, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithOAuth, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      // Redirect to Dashboard or to the intended page if available
      const from = location.state?.from?.pathname || '/Dashboard';
      navigate(from, { replace: true });
    }
    
    // Check for error in URL query params
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('error');
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, session } = await signIn({
        email: formData.email,
        password: formData.password
      });

      if (user && session) {
        // Redirect to Dashboard or to the intended page if available
        const from = location.state?.from?.pathname || '/Dashboard';
        navigate(from, { replace: true });
      } else {
        setError('Login failed - no user data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setIsLoading(true);
    setError('');

    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error('OAuth signin error:', error);
      setError(error.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignupClick = () => {
    navigate('/Signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to LUCY
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to your music career management platform
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="pl-10 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-white border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('facebook')}
                  disabled={isLoading}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('solana')}
                  disabled={isLoading}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Solana
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="text-purple-600 hover:text-purple-700 p-0 h-auto font-semibold"
                  onClick={handleSignupClick}
                  disabled={isLoading}
                >
                  Create an account
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="text-purple-600 hover:text-purple-700 p-0 h-auto font-semibold"
                  onClick={handleSignupClick}
                  disabled={isLoading}
                >
                  Create an account
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 