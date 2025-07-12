import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/api/supabase-auth-fixed';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  
  // Check if the current route is an auth route that doesn't require authentication
  const isAuthRoute = ['/login', '/signup', '/auth/callback', '/debug-auth.html'].some(route => 
    location.pathname.toLowerCase().startsWith(route.toLowerCase())
  );
  
  useEffect(() => {
    // Simple function to check if we have a session in localStorage
    const checkLocalStorageSession = () => {
      try {
        const sessionStr = localStorage.getItem('supabase.auth.token');
        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);
          if (sessionData && sessionData.access_token) {
            console.log('RequireAuth - Found valid session in localStorage');
            return true;
          }
        }
      } catch (e) {
        console.error('RequireAuth - Error parsing session from localStorage:', e);
      }
      return false;
    };
    
    // Function to check authentication state
    const checkAuth = async () => {
      // If we're on an auth route, don't need to check auth
      if (isAuthRoute) {
        console.log('RequireAuth - On auth route, no need to check auth');
        setIsAuth(false);
        setAuthChecked(true);
        return;
      }
      
      // If we have a user in context, they're authenticated
      if (user) {
        console.log('RequireAuth - User found in context, authenticated');
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
      
      // Check localStorage directly
      if (checkLocalStorageSession()) {
        console.log('RequireAuth - Session found in localStorage, authenticated');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // If user_authenticated flag is set in localStorage
      if (localStorage.getItem('user_authenticated') === 'true') {
        console.log('RequireAuth - user_authenticated flag is true');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // Last resort: check with Supabase directly
      try {
        console.log('RequireAuth - Checking Supabase session directly');
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          console.log('RequireAuth - Valid Supabase session found');
          // Set the flag for future checks
          localStorage.setItem('user_authenticated', 'true');
          setIsAuth(true);
          setAuthChecked(true);
          return;
        }
      } catch (error) {
        console.error('RequireAuth - Error checking Supabase session:', error);
      }
      
      // If we get here, user is not authenticated
      console.log('RequireAuth - User is not authenticated');
      setIsAuth(false);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [isAuthenticated, loading, user, isAuthRoute, location.pathname]);
  
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
    // Store the current location to redirect back after login
    localStorage.setItem('auth_redirect', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated or on an auth route, render children
  return children;
};

export default RequireAuth; 