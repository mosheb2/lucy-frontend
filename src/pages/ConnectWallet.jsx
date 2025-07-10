import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConnectWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletProvider, setWalletProvider] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  useEffect(() => {
    // Get the wallet provider from URL params
    const searchParams = new URLSearchParams(location.search);
    const provider = searchParams.get('provider');
    if (provider) {
      setWalletProvider(provider);
    }
  }, [location]);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      // This is a mock implementation - in a real app, you would use a proper Solana wallet adapter
      console.log(`Connecting to ${walletProvider} wallet...`);
      
      // Simulate wallet connection
      setTimeout(() => {
        // Mock successful authentication
        const mockUser = {
          id: `solana-${Date.now()}`,
          email: `wallet-${Date.now()}@example.com`,
          full_name: 'Solana Wallet User',
          username: `solana_user_${Date.now().toString().slice(-6)}`,
          avatar_url: null,
          role: 'user',
          wallet_address: '5Hw...' // Mock wallet address
        };
        
        // Update user in context
        updateUser(mockUser);
        
        // Store mock auth data
        localStorage.setItem('user_authenticated', 'true');
        localStorage.setItem('user_id', mockUser.id);
        localStorage.setItem('auth_token', `mock_token_${Date.now()}`);
        
        // Redirect to dashboard
        navigate('/Dashboard', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-slate-600">
              {walletProvider === 'solana' ? 'Connect your Solana wallet to continue' : 'Connect your wallet to continue'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Button
              onClick={handleConnectWallet}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            
            <div className="text-xs text-center text-slate-500 mt-4">
              <p>This is a demo implementation. In a production environment, you would connect to an actual Solana wallet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 