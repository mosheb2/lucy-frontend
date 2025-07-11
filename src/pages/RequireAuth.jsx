import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  
  // Check if the current route is an auth route that doesn't require authentication
  const isAuthRoute = ['/login', '/signup', '/auth/callback'].includes(
    location.pathname.toLowerCase()
  );
  
  // Check localStorage directly as a backup
  const isAuthenticatedInStorage = localStorage.getItem('user_authenticated') === 'true';
  const hasAuthToken = !!localStorage.getItem('auth_token');
  
  useEffect(() => {
    console.log('RequireAuth - Checking authentication state:', {
      contextIsAuthenticated: isAuthenticated,
      contextLoading: loading,
      hasUser: !!user,
      isAuthRoute,
      isAuthenticatedInStorage,
      hasAuthToken,
      pathname: location.pathname
    });
    
    // Determine if the user is authenticated based on multiple sources
    const checkAuth = () => {
      // If we have a user in context, they're authenticated
      if (user) {
        console.log('RequireAuth - User found in context, authenticated');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // If localStorage says they're authenticated and we have a token, trust it
      if (isAuthenticatedInStorage && hasAuthToken) {
        console.log('RequireAuth - User authenticated according to localStorage');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // If the context says they're authenticated, trust it
      if (isAuthenticated) {
        console.log('RequireAuth - Context reports user is authenticated');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // If we're not loading and none of the above conditions are met, user is not authenticated
      if (!loading) {
        console.log('RequireAuth - User is not authenticated');
        setIsAuth(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, loading, user, isAuthRoute, isAuthenticatedInStorage, hasAuthToken, location.pathname]);
  
  // Show loading spinner while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  // If not authenticated and not on an auth route, redirect to login
  if (!isAuth && !isAuthRoute) {
    console.log('RequireAuth - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated or on an auth route, render children
  return children;
};

export default RequireAuth; 