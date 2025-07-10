import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/api/entities';
import ActionButton from './ActionButton';

export default function LoginModal({ open, onOpenChange, onSuccess, onSwitchToSignup }) {
  console.log('LoginModal render - open:', open);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with:', { email: formData.email });
    setIsLoading(true);
    setError('');

    try {
      const response = await User.signIn(formData);
      console.log('Login response received:', response);
      if (response.user) {
        console.log('Login successful, calling onSuccess');
        onSuccess?.(response.user);
        onOpenChange(false);
      } else {
        console.log('No user in response');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to LUCY
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <ActionButton
            type="submit"
            className="w-full"
            disabled={isLoading}
            icon={isLoading ? "loading" : "login"}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </ActionButton>
        </form>
        
        <div className="text-center text-sm text-slate-600">
          <p>Don't have an account?</p>
          <Button
            variant="link"
            className="text-purple-600 hover:text-purple-700 p-0 h-auto"
            onClick={() => {
              onOpenChange(false);
              onSwitchToSignup?.();
            }}
          >
            Create an account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 